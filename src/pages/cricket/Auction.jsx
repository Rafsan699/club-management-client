import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../../services/api'; // baseURL = .../api/cricket  ->  GET /auction/active

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const OVERLAY_MS = { sold: 6400, unsold: 5400 };
const DW = 920, DH = 800;          // design size of the stage; it is scaled to fit the window (no page scroll)
const TEAM_CARD_W = 352;           // team card width (340) + gap (12) used by the running team strip

/* ---------------- helpers ---------------- */
const fmt = (n) => Number(n || 0).toLocaleString();
const hueOf = (i) => (i * 53 + 190) % 360;
const initials = (n = '') => n.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

function teamsInfo(a) {
  return a.teams.map((t, i) => {
    const players = a.players.filter(e => e.status === 'sold' && e.soldTo === i && e.player);
    const spent = players.reduce((s, e) => s + e.price, 0);
    const unlimited = !(t.tokenLimit > 0);
    const limit = (t.tokenLimit || 0) + (t.bonusGiven || 0);
    return { ...t, idx: i, players, spent, unlimited, limit, left: unlimited ? null : limit - spent };
  });
}
const tokensText = (t) => (t.unlimited ? '∞' : fmt(t.left));

function Pic({ src, name, size = 48 }) {
  const [bad, setBad] = useState(false);
  const st = { width: size, height: size, fontSize: size * 0.36 };
  if (!src || bad) return <div className="au-pic au-pic-fb" style={st}>{initials(name)}</div>;
  return <img className="au-pic" src={src} alt={name || ''} style={st} onError={() => setBad(true)} />;
}

function useCountUp(value, ms = 600) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const cur = Math.round(a + (b - a) * (1 - Math.pow(1 - p, 3)));
      from.current = cur; setV(cur);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

/* distance between an element and the team's profile card in the top strip (used for "flying" animations).
   - if the strip is running there are several copies of a card: the nearest one is used
   - the stage is scaled to fit the window, so screen distances are converted to the stage's own pixels */
function flyDelta(el, idx) {
  if (!el) return null;
  const b = el.getBoundingClientRect();
  const bx = b.left + b.width / 2, by = b.top + b.height / 2;
  let src = null, best = Infinity;
  document.querySelectorAll(`[data-tcard="${idx}"]`).forEach(n => {
    const r = n.getBoundingClientRect();
    const d = Math.abs(r.left + r.width / 2 - bx);
    if (d < best) { best = d; src = r; }
  });
  if (!src) return null;
  const fit = document.querySelector('.au-fit');
  const S = fit && fit.offsetWidth ? fit.getBoundingClientRect().width / fit.offsetWidth : 1;
  return {
    dx: (src.left + src.width / 2 - bx) / S,
    dy: (src.top + src.height / 2 - by) / S,
    s: Math.max(0.12, src.width / b.width)
  };
}

/* team card flies from its profile (top) to the player, and flies back when outbid */
function useFly(ref, idx, leaving) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.animate) return;
    const d = flyDelta(el, idx);
    el.animate(
      d ? [
        { transform: `translate(${d.dx}px,${d.dy}px) scale(${d.s})`, opacity: 0.2 },
        { transform: 'translate(0,0) scale(1.07)', opacity: 1, offset: 0.8 },
        { transform: 'translate(0,0) scale(1)', opacity: 1 }
      ] : [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 900, easing: 'cubic-bezier(.22,.9,.3,1)' }
    );
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (!leaving) return;
    const el = ref.current;
    if (!el || !el.animate) return;
    const d = flyDelta(el, idx);
    el.animate(
      [{ transform: 'translate(0,0) scale(1)', opacity: 1 },
       { transform: d ? `translate(${d.dx}px,${d.dy}px) scale(${d.s})` : 'scale(.3)', opacity: 0 }],
      { duration: 650, easing: 'cubic-bezier(.6,0,.9,.4)', fill: 'forwards' }
    );
    // eslint-disable-next-line
  }, [leaving]);
}

/* keeps the previous leader on screen for a moment so it can vanish while the new one enters */
function useLeaderStack(idx) {
  const [items, setItems] = useState(idx === null ? [] : [{ k: 0, idx, leaving: false }]);
  const counter = useRef(1);
  useEffect(() => {
    setItems(prev => {
      const cur = prev.find(i => !i.leaving);
      if ((cur ? cur.idx : null) === idx) return prev;
      const next = prev.map(i => ({ ...i, leaving: true }));
      if (idx !== null) next.push({ k: counter.current++, idx, leaving: false });
      return next;
    });
    const t = setTimeout(() => setItems(p => p.filter(i => !i.leaving)), 750);
    return () => clearTimeout(t);
  }, [idx]);
  return items;
}

/* =====================================================================
   ROOT
===================================================================== */
export default function Auction() {
  const [auction, setAuction] = useState(null);
  const [ended, setEnded] = useState(null);       // 'finished' | 'cancelled'
  const [booting, setBooting] = useState(true);
  const [online, setOnline] = useState(false);
  const [overlay, setOverlay] = useState(null);   // {kind:'sold'|'unsold', playerId, teamIdx, price}
  const [last, setLast] = useState(null);         // last sold/unsold result shown while waiting
  const [tick, setTick] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    const showOverlay = (o) => {
      clearTimeout(timer.current);
      setOverlay({ ...o, k: Date.now() });
      timer.current = setTimeout(() => setOverlay(null), OVERLAY_MS[o.kind]);
    };
    const clearOverlay = () => { clearTimeout(timer.current); setOverlay(null); };

    const load = () => API.get('/auction/active')
      .then(r => { if (!alive) return; setAuction(r.data || null); if (r.data) setEnded(null); })
      .catch(err => console.error('auction load', err))
      .finally(() => alive && setBooting(false));

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => { setOnline(true); socket.emit('joinAuction'); load(); });
    socket.on('disconnect', () => setOnline(false));

    socket.on('auctionUpdate', ({ type, info, auction: a }) => {
      setAuction(a);
      setEnded(null);
      setBooting(false);
      if (type === 'sold') { setLast({ kind: 'sold', ...info }); showOverlay({ kind: 'sold', ...info }); }
      else if (type === 'unsold') { setLast({ kind: 'unsold', ...info }); showOverlay({ kind: 'unsold', ...info }); }
      else if (['select', 'undo-sold', 'undo-unsold', 'create', 'next-round'].includes(type)) { clearOverlay(); setLast(null); }
    });

    socket.on('auctionEnded', ({ type, auction: a }) => {
      clearOverlay();
      setEnded(type);
      setAuction(type === 'finished' ? a : null);
    });

    return () => {
      alive = false;
      clearTimeout(timer.current);
      socket.emit('leaveAuction');
      socket.disconnect();
    };
  }, []);

  let body;
  if (booting) body = <Message icon="🔨" title="Connecting to the auction..." />;
  else if (!auction) body = <NoAuction ended={ended} />;
  else if (auction.status === 'finished') body = <Finished auction={auction} />;
  else body = <LiveView auction={auction} overlay={overlay} last={last} tick={tick} online={online} />;

  const live = !booting && !!auction && auction.status !== 'finished';

  return (
    <div className={`au ${live ? 'fit' : ''}`}>
      <style>{CSS}</style>
      {body}
    </div>
  );
}

function Message({ icon, title, text }) {
  return (
    <div className="au-msg">
      <div className="au-msg-icon">{icon}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function NoAuction({ ended }) {
  if (ended === 'cancelled') return <Message icon="🛑" title="The auction was cancelled" text="Please wait for the next announcement." />;
  return <Message icon="⏳" title="No live auction right now" text="This page will start automatically the moment the auction goes live." />;
}

/* =====================================================================
   LIVE VIEW
===================================================================== */
function LiveView({ auction, overlay, last, tick, online }) {
  const teams = useMemo(() => teamsInfo(auction), [auction]);
  const entries = useMemo(() => auction.players.filter(e => e.player), [auction]);
  const byId = (id) => entries.find(e => e.player._id === id);

  const cur = auction.currentPlayer ? byId(auction.currentPlayer) : null;
  const leaderIdx = cur && auction.currentBidTeam !== null && auction.currentBidTeam !== undefined ? auction.currentBidTeam : null;

  const soldN = entries.filter(e => e.status === 'sold').length;
  const unsoldN = entries.filter(e => e.status === 'unsold').length;
  const pendingN = entries.filter(e => e.status === 'pending').length;

  const soldEntry = overlay?.kind === 'sold' ? byId(overlay.playerId) : null;
  const unsoldEntry = overlay?.kind === 'unsold' ? byId(overlay.playerId) : null;

  let scene;
  if (soldEntry && teams[overlay.teamIdx]) scene = <SoldScene key={overlay.k} entry={soldEntry} team={teams[overlay.teamIdx]} price={overlay.price || soldEntry.price} />;
  else if (unsoldEntry) scene = <UnsoldScene key={overlay.k} entry={unsoldEntry} />;
  else if (cur) scene = <LiveScene auction={auction} entry={cur} teams={teams} leaderIdx={leaderIdx} />;
  else scene = <WaitScene last={last} byId={byId} teams={teams} started={soldN + unsoldN > 0} />;

  const mode = !cur && !overlay ? 'show' : 'mini';

  return (
    <>
      <div className="au-head">
        <div className="au-logo">🔨 <b>AUCTION</b></div>
        <div className="au-meta">
          <span className="au-live"><i /> LIVE</span>
          <span>Round {auction.round}</span>
          <span>Sold {soldN}</span><span>Unsold {unsoldN}</span><span>Remaining {pendingN}</span>
          <span className={online ? 'au-on' : 'au-off'}>{online ? '● Connected' : '● Reconnecting...'}</span>
        </div>
      </div>

      <TeamStrip teams={teams} mode={mode} leaderIdx={leaderIdx} hot={overlay?.kind === 'sold' ? overlay.teamIdx : null} tick={tick} />

      <Stage>{scene}</Stage>

      <Ticker entries={entries} teams={teams} currentId={auction.currentPlayer} />
    </>
  );
}

/* ---------------- center stage: always scaled so the whole page fits in one window ---------------- */
function Stage({ children }) {
  const ref = useRef(null);
  const [sc, setSc] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => {
      if (window.innerWidth <= 720) { setSc(1); return; }   // phones keep the normal scrolling layout
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      setSc(Math.min(1.3, (w - 8) / DW, (h - 8) / DH));
    };
    calc();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(calc) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', calc);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', calc); };
  }, []);
  return (
    <div className="au-stage" ref={ref}>
      <div className="au-beams-wrap"><div className="au-beams" /></div>
      <div className="au-fit" style={{ '--dw': `${DW}px`, '--dh': `${DH}px`, transform: `scale(${sc})` }}>{children}</div>
    </div>
  );
}

/* ---------------- top: glowing team profiles (5+ teams -> the cards run like the player ticker) ---------------- */
function TeamStrip({ teams, mode, leaderIdx, hot, tick }) {
  const [open, setOpen] = useState(null);                       // team whose players list is open
  useEffect(() => { if (hot != null) setOpen(null); }, [hot]);   // close the list when a SOLD scene starts
  const rt = open !== null ? teams[open] : null;

  const run = teams.length > 4;
  const group = useMemo(() => {
    if (!run) return teams;
    const copies = Math.max(1, Math.ceil(2600 / (TEAM_CARD_W * teams.length)));   // one group is always wider than the screen
    return Array.from({ length: copies }, () => teams).flat();
  }, [run, teams]);

  const card = (t, k) => {
    const n = t.players.length;
    const feat = n ? t.players[(tick + t.idx) % n] : null;
    return (
      <div key={k} data-tcard={t.idx} style={{ '--hue': hueOf(t.idx) }}
        role="button" tabIndex={0} title="Click to see this team's players"
        onClick={() => setOpen(t.idx)}
        onKeyDown={(e) => { if (e.key === 'Enter') setOpen(t.idx); }}
        className={`au-t ${leaderIdx === t.idx ? 'lead' : ''} ${hot === t.idx ? 'pop' : ''}`}>
        <div className="au-t-head">
          <Pic src={t.logo} name={t.name} size={46} />
          <div className="au-t-meta"><b>{t.name}</b><span>Owner: {t.owner}</span></div>
        </div>
        <div className="au-t-tok"><small>Tokens left</small><b>{tokensText(t)}</b></div>
        <div className="au-t-squad">
          {feat ? (
            <div key={feat._id} className="au-feat">
              <Pic src={feat.player.image} name={feat.player.name} size={36} />
              <div><b>{feat.player.name}</b><span>{feat.category} • {fmt(feat.price)} tokens</span></div>
            </div>
          ) : <div className="au-feat empty">No player bought yet</div>}
          <div className="au-count">{n} player{n === 1 ? '' : 's'} • spent {fmt(t.spent)}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {run ? (
        <div className={`au-strip run ${mode}`}>
          <div className="au-strip-track" style={{ animationDuration: `${Math.max(30, group.length * 7)}s` }}>
            {group.map((t, i) => card(t, `a${i}`))}
            {group.map((t, i) => card(t, `b${i}`))}
          </div>
        </div>
      ) : (
        <div className={`au-strip ${mode}`} style={{ '--n': teams.length }}>
          {teams.map(t => card(t, t.idx))}
        </div>
      )}
      {rt && <TeamRoster key={rt.idx} team={rt} onClose={() => setOpen(null)} />}
    </>
  );
}

/* ---------------- popup: players bought by a team, revealed one by one with a moving glow ---------------- */
function TeamRoster({ team, onClose }) {
  const n = team.players.length;
  const [step, setStep] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (!n) return;
    const id = setInterval(() => setStep(s => (s + 1) % 100000), 1000);
    return () => clearInterval(id);
  }, [n]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line
  }, []);

  const shown = Math.min(step + 1, n);        // players appear serially
  const active = n ? step % n : -1;           // after all appear, the glow keeps travelling through the list

  useEffect(() => {
    const el = refs.current[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [active, shown]);

  return (
    <div className="au-modal" onClick={onClose}>
      <div className="au-rp" style={{ '--hue': hueOf(team.idx) }} onClick={(e) => e.stopPropagation()}>
        <button className="au-rp-x" onClick={onClose} aria-label="Close">✕</button>
        <div className="au-rp-head">
          <Pic src={team.logo} name={team.name} size={78} />
          <div><h3>{team.name}</h3><span>Owner: {team.owner}</span></div>
        </div>
        <div className="au-rp-sum">
          <span>Players<b>{n}</b></span>
          <span>Spent<b>{fmt(team.spent)}</b></span>
          <span>Tokens left<b className="g">{tokensText(team)}</b></span>
        </div>
        <div className="au-rp-list">
          {n === 0 && <div className="au-rp-empty">No player bought yet</div>}
          {team.players.slice(0, shown).map((e, i) => (
            <div key={e._id} ref={(el) => { refs.current[i] = el; }}
              className={`au-r-item ${i === active ? 'act' : ''}`}>
              <div className="au-r-no">{i + 1}</div>
              <Pic src={e.player.image} name={e.player.name} size={64} />
              <div className="au-r-info"><b>{e.player.name}</b><span>{e.category}{e.player.role ? ` • ${e.player.role}` : ''}</span></div>
              <div className="au-r-price">{fmt(e.price)}<small>tokens</small></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- player card (center) ---------------- */
function PlayerBox({ entry, base, half = false, solo = false, fx = '', children }) {
  const p = entry.player, s = p.stats || {};
  return (
    <div className={`au-pw ${half ? 'half' : ''} ${solo ? 'solo' : ''} ${fx}`}>
      <div className="au-pi">
        <div className="au-pcard">
          {!fx && <div className="au-badge">● LIVE</div>}
          <div className="au-photo"><Pic src={p.image} name={p.name} size={220} /></div>
          <h2>{p.name}</h2>
          <div className="au-sub">{p.id} • {p.role || 'Player'}</div>
          <div className="au-sub">{p.department} • Batch {p.batch}</div>
          <div className="au-cat"><span>{entry.category}</span> base price <b>{fmt(base)}</b></div>
          <div className="au-stats">
            {[['MAT', s.matches], ['RUNS', s.runs], ['4s/6s', `${s.fours || 0}/${s.sixes || 0}`],
              ['SR', Number(s.strikeRate || 0).toFixed(1)], ['WKTS', s.wickets], ['ECON', Number(s.economy || 0).toFixed(1)]].map(([k, v]) => (
              <div key={k}><b>{v || 0}</b><span>{k}</span></div>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------------- team card that sits beside the player ---------------- */
const TeamBox = React.forwardRef(function TeamBox({ team, className = '', tag = 'HIGHEST BID' }, ref) {
  return (
    <div ref={ref} className={`au-lead ${className}`} style={{ '--hue': hueOf(team.idx) }}>
      <div className="au-lead-tag">{tag}</div>
      <Pic src={team.logo} name={team.name} size={112} />
      <h3>{team.name}</h3>
      <div className="au-owner">
        <Pic src={team.ownerImg || team.logo} name={team.owner} size={46} />
        <span>Owner<br /><b>{team.owner}</b></span>
      </div>
      <div className="au-lead-left">Tokens left <b>{tokensText(team)}</b></div>
    </div>
  );
});

function LeaderCard({ team, leaving }) {
  const ref = useRef(null);
  useFly(ref, team.idx, leaving);
  return <TeamBox ref={ref} team={team} />;
}

/* ---------------- LIVE: player + bidding team side by side ---------------- */
function LiveScene({ auction, entry, teams, leaderIdx }) {
  const base = auction.categories.find(c => c.name === entry.category)?.basePrice || 0;
  const items = useLeaderStack(leaderIdx);
  const hasLeader = leaderIdx !== null;
  const amount = hasLeader ? auction.currentBid : base;
  const shown = useCountUp(amount);
  const hist = auction.bidHistory.slice(-5).reverse();

  return (
    <div className="au-scene">
      <div className="au-row">
        <PlayerBox key={entry.player._id} entry={entry} base={base} half={hasLeader} />
        <div className="au-slot">
          {items.map(it => teams[it.idx] && <LeaderCard key={it.k} team={teams[it.idx]} leaving={it.leaving} />)}
        </div>
      </div>

      <div className="au-bidbar">
        <div className="au-bid-label">{hasLeader ? 'CURRENT BID' : 'BASE PRICE'}</div>
        <div key={amount} className="au-bid-num">{fmt(shown)}<small>tokens</small></div>
        <div className="au-hist">
          {hist.length === 0 && <span className="au-muted">Waiting for the first bid...</span>}
          {hist.map((h, i) => (
            <span key={`${auction.bidHistory.length - i}`} className="au-hchip" style={{ '--hue': hueOf(h.team) }}>
              {teams[h.team]?.name} <b>{fmt(h.amount)}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SOLD: player is swallowed, team grows, returns ---------------- */
function SoldScene({ entry, team, price }) {
  const ref = useRef(null);
  const p = entry.player;

  useEffect(() => {
    const t = setTimeout(() => {
      const el = ref.current;
      if (!el || !el.animate) return;
      const d = flyDelta(el, team.idx);
      const r = el.getBoundingClientRect();
      const base = r.width / 1.35;
      el.animate(
        [{ transform: 'scale(1.35)', opacity: 1 },
         { transform: d ? `translate(${d.dx}px,${d.dy}px) scale(${Math.max(0.12, (d.s * r.width) / base / 1.35 * 1.35 / 1.35)})` : 'scale(.2)', opacity: 0 }],
        { duration: 900, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' }
      );
    }, 3700);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, []);

  const confetti = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    x: (i * 37 + 11) % 100, d: 1.4 + (i % 8) * 0.13, h: (i * 47) % 360
  })), []);

  return (
    <div className="au-scene">
      {confetti.map((c, i) => <i key={i} className="au-conf" style={{ '--x': c.x, '--d': `${c.d}s`, '--h': c.h }} />)}
      <div className="au-row">
        <PlayerBox entry={entry} base={price} half fx="swallow" />
        <div className="au-slot">
          <TeamBox ref={ref} team={team} className="grow" tag="BOUGHT BY" />
        </div>
      </div>

      <div className="au-soldbanner">
        <div className="au-stamp-sold">SOLD!</div>
        <div className="au-sold-grid">
          <div><small>{p.name} sold to {team.name} for</small><b className="gold">{fmt(price)}</b><small>tokens</small></div>
          <div><small>{team.name} tokens left</small><b className="green">{tokensText(team)}</b><small>after this purchase</small></div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UNSOLD: separate dramatic design ---------------- */
function UnsoldScene({ entry }) {
  const p = entry.player;
  return (
    <div className="au-scene">
      <div className="au-redflash" />
      <div className="au-row solo-row">
        <PlayerBox entry={entry} base={0} solo fx="unsold-fx">
          <div className="au-stamp-uns">UNSOLD</div>
        </PlayerBox>
      </div>
      <div className="au-unsbanner">
        <b>No team bid for {p.name}</b>
        <span>Goes back to the pool and may return in the next round</span>
      </div>
    </div>
  );
}

/* ---------------- WAIT: between players ---------------- */
function WaitScene({ last, byId, teams, started }) {
  const e = last ? byId(last.playerId) : null;
  const t = last && last.kind === 'sold' ? teams[last.teamIdx] : null;
  return (
    <div className="au-scene au-wait">
      <div className="au-rings"><i /><i /><i /><span className="au-hammer">🔨</span></div>
      <h2 className="au-wait-t">
        {started ? 'Waiting for the next player' : 'The auction will begin shortly'}
        <span className="au-dots"><i>.</i><i>.</i><i>.</i></span>
      </h2>
      <p className="au-muted">The auctioneer is getting the next player ready</p>
      {e && (
        <div className={`au-last ${last.kind}`}>
          <Pic src={e.player.image} name={e.player.name} size={64} />
          {last.kind === 'sold' && t ? (
            <div><small>LAST SOLD</small><b>{e.player.name} → {t.name}</b><span>{fmt(last.price)} tokens</span></div>
          ) : (
            <div><small>LAST RESULT</small><b>{e.player.name}</b><span>UNSOLD</span></div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- bottom: running player profiles ---------------- */
function Ticker({ entries, teams, currentId }) {
  if (!entries.length) return null;
  const base = entries.length < 10 ? Array.from({ length: Math.ceil(10 / entries.length) }, () => entries).flat() : entries;
  const chip = (e, k) => {
    const now = currentId === e.player._id;
    return (
      <div key={k} className={`au-chip ${e.status} ${now ? 'now' : ''}`}>
        <Pic src={e.player.image} name={e.player.name} size={42} />
        <div className="au-chip-t"><b>{e.player.name}</b><span>{e.category}</span></div>
        {now && <em className="live">● LIVE</em>}
        {!now && e.status === 'sold' && <em className="sold">{teams[e.soldTo]?.name} • {fmt(e.price)}</em>}
        {!now && e.status === 'unsold' && <em className="uns">UNSOLD</em>}
      </div>
    );
  };
  return (
    <div className="au-ticker">
      <div className="au-track" style={{ animationDuration: `${Math.max(30, base.length * 4)}s` }}>
        {base.map((e, i) => chip(e, `a${i}`))}
        {base.map((e, i) => chip(e, `b${i}`))}
      </div>
    </div>
  );
}

/* ---------------- finished ---------------- */
function Finished({ auction }) {
  const teams = teamsInfo(auction);
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="au-head"><div className="au-logo">🏆 <b>AUCTION COMPLETE</b></div></div>
      <div className="au-fin">
        {teams.map(t => (
          <div key={t.idx} className="au-t fin" style={{ '--hue': hueOf(t.idx) }} role="button" tabIndex={0} onClick={() => setOpen(t.idx)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(t.idx); }}>
            <div className="au-t-head"><Pic src={t.logo} name={t.name} size={56} /><div className="au-t-meta"><b>{t.name}</b><span>Owner: {t.owner}</span></div></div>
            <div className="au-count">{t.players.length} players • spent {fmt(t.spent)} • left {tokensText(t)}</div>
            {t.players.map(e => (
              <div key={e._id} className="au-feat"><Pic src={e.player.image} name={e.player.name} size={36} /><div><b>{e.player.name}</b><span>{e.category} • {fmt(e.price)} tokens</span></div></div>
            ))}
          </div>
        ))}
      </div>
      {open !== null && teams[open] && <TeamRoster key={open} team={teams[open]} onClose={() => setOpen(null)} />}
    </>
  );
}

/* =====================================================================
   STYLES
===================================================================== */
const CSS = `
.au, .au * { box-sizing: border-box; }
.au { min-height: 100vh; padding: 16px 14px 28px; color: #e8ecff; font-family: 'Segoe UI', system-ui, sans-serif; font-size: 17px; overflow-x: hidden;
  background: radial-gradient(1200px 600px at 50% -10%, #1d2670 0%, #0a0e2a 55%, #050716 100%); }
.au-muted { color: #8b95c9; }
.au-pic { border-radius: 50%; object-fit: cover; display: block; flex: none; border: 3px solid rgba(255,214,90,.9); box-shadow: 0 0 14px rgba(255,200,60,.45); }
.au-pic-fb { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#3b82f6,#7c3aed); color: #fff; font-weight: 800; }

/* header */
.au-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 14px; }
.au-logo { font-size: 1.5rem; letter-spacing: 2px; }
.au-logo b { background: linear-gradient(90deg,#ffd54a,#ff8a3d); -webkit-background-clip: text; background-clip: text; color: transparent; }
.au-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 15px; font-weight: 700; }
.au-meta span { background: rgba(255,255,255,.07); padding: 6px 14px; border-radius: 999px; }
.au-live { background: #dc2626 !important; display: inline-flex; align-items: center; gap: 6px; }
.au-live i { width: 9px; height: 9px; border-radius: 50%; background: #fff; animation: blink 1s infinite; }
.au-on { color: #4ade80; } .au-off { color: #fb923c; }

/* team strip: up to 4 teams share one row; 5+ teams run (marquee) like the player ticker below */
.au-strip { display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: 12px; position: relative; z-index: 1; }
.au-strip.run { display: block; overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent); mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent); }
.au-strip-track { display: flex; width: max-content; padding: 8px 0; animation: marquee 60s linear infinite; }
.au-strip.run:hover .au-strip-track { animation-play-state: paused; }
.au-strip.run .au-t { flex: none; width: 340px; margin-right: 12px; }
.au-t { position: relative; padding: 10px 12px; border-radius: 16px; min-width: 0;
  background: linear-gradient(160deg, hsl(var(--hue) 55% 17% / .96), #0b1030);
  border: 1px solid hsl(var(--hue) 90% 62% / .7);
  animation: tglow 3s ease-in-out infinite; animation-delay: calc(var(--hue) * -8ms);
  transition: transform .4s, border-color .4s; }
.au-strip .au-t { height: 172px; display: flex; flex-direction: column; cursor: pointer; }
.au-strip .au-t:hover { border-color: #fff; }
.au-t.lead { transform: translateY(-3px) scale(1.04); border-color: #fff; }
.au-t.pop { animation: tglow 3s ease-in-out infinite, tpop 1.1s 3.8s both; }
.au-t-head { display: flex; align-items: center; gap: 10px; min-width: 0; }
.au-t-meta { display: flex; flex-direction: column; min-width: 0; }
.au-t-meta b { font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.au-t-meta span { font-size: 13px; color: #a9b3e6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.au-t-tok { margin-top: 6px; display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.au-t-tok small { color: #a9b3e6; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.au-t-tok b { font-size: 1.45rem; color: #4ade80; text-shadow: 0 0 12px rgba(74,222,128,.5); }
.au-strip .au-t-tok b { font-size: 1.8rem; line-height: 1.1; }
.au-t-squad { margin-top: auto; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,.18); }
.au-feat { display: flex; align-items: center; gap: 10px; min-height: 58px; animation: featIn .7s cubic-bezier(.2,1,.3,1) both; }
.au-strip .au-feat { min-height: 40px; }
.au-feat > div { display: flex; flex-direction: column; min-width: 0; }
.au-feat b { font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.au-strip .au-feat b { font-size: 15px; }
.au-feat span { font-size: 14px; color: #ffd54a; }
.au-strip .au-feat span { font-size: 13px; }
.au-feat.empty { color: #7d88c4; font-size: 15px; }
.au-count { margin-top: 6px; font-size: 14px; color: #a9b3e6; }
.au-strip .au-count { margin-top: 3px; font-size: 13px; }

/* stage (fixed height) */
.au-stage { position: relative; margin: 18px 0; height: 960px; border-radius: 24px; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 24px 10px;
  background: radial-gradient(circle at 50% 0%, rgba(40,52,150,.7), rgba(8,11,36,.92) 70%); border: 1px solid rgba(255,255,255,.1); }
.au-beams-wrap { position: absolute; inset: 0; overflow: hidden; border-radius: 24px; pointer-events: none; }
.au-beams { position: absolute; inset: -60%; animation: spin 22s linear infinite;
  background: conic-gradient(from 0deg, transparent 0 7%, rgba(255,215,0,.13) 9% 11%, transparent 13% 32%, rgba(80,160,255,.13) 34% 36%, transparent 38% 57%, rgba(255,80,160,.11) 59% 61%, transparent 63% 82%, rgba(80,255,170,.09) 84% 86%, transparent 88%); }
.au-fit { position: relative; width: 100%; display: flex; align-items: center; justify-content: center; }
.au-scene { position: relative; z-index: 2; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 22px; }

/* player stays the same (big) size whether or not a team is bidding */
.au-row { --pw: 440px; --ph: 580px; --slot: 340px; --gap: 28px; --sw: 340px;
  display: flex; align-items: center; justify-content: center; gap: var(--gap); }
.au-pw { --k: 1; position: relative; flex: none; width: calc(var(--pw) * var(--k)); height: calc(var(--ph) * var(--k));
  transform: translateX(calc((var(--slot) + var(--gap)) / 2));
  transition: width .8s cubic-bezier(.3,.9,.3,1), height .8s cubic-bezier(.3,.9,.3,1), transform .8s cubic-bezier(.3,.9,.3,1); }
.au-pw.half { --k: 1; transform: none; }
.au-pw.solo { transform: none; }
.au-pi { width: var(--pw); height: var(--ph); transform: scale(var(--k)); transform-origin: 0 0; transition: transform .8s cubic-bezier(.3,.9,.3,1); }
.au-pcard { position: relative; overflow: hidden; width: 100%; height: 100%; padding: 18px 16px; border-radius: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: linear-gradient(160deg, #1d2878, #0b1034); border: 2px solid #ffd54a; box-shadow: 0 0 44px rgba(255,200,60,.4);
  animation: playerIn .9s cubic-bezier(.2,1.2,.3,1) both; }
.au-pcard::after { content: ''; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.22), transparent); animation: shine 3.4s ease-in-out infinite; }
.au-badge { position: absolute; top: 12px; right: 12px; background: #dc2626; color: #fff; font-size: 14px; font-weight: 800; padding: 4px 12px; border-radius: 999px; animation: blink 1.2s infinite; }
.au-photo { margin-top: 6px; border-radius: 50%; animation: floaty 3s ease-in-out infinite; }
.au-photo .au-pic { border-width: 4px; }
.au-pcard h2 { margin: 8px 0 0; font-size: 2.05rem; line-height: 1.15; }
.au-sub { font-size: 16px; color: #aab4ea; }
.au-cat { margin-top: 8px; font-size: 16px; color: #aab4ea; }
.au-cat span { background: #ffd54a; color: #3a2a00; font-weight: 800; padding: 2px 13px; border-radius: 999px; margin-right: 6px; }
.au-cat b { color: #ffd54a; }
.au-stats { margin-top: auto; width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.au-stats div { background: rgba(255,255,255,.07); border-radius: 10px; padding: 7px 2px; }
.au-stats b { display: block; font-size: 1.35rem; } .au-stats span { font-size: 13px; color: #98a3dc; letter-spacing: 1px; }

.au-slot { position: relative; flex: none; width: var(--slot); height: 420px; }
.au-lead { position: absolute; inset: 0; border-radius: 24px; padding: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center;
  background: linear-gradient(160deg, hsl(var(--hue) 65% 24%), #0b1030); border: 2px solid hsl(var(--hue) 100% 68%); animation: leadglow 1.6s ease-in-out infinite; }
.au-lead .au-pic { border-color: hsl(var(--hue) 100% 70%); box-shadow: 0 0 18px hsl(var(--hue) 100% 60% / .8); }
.au-lead h3 { margin: 0; font-size: 1.65rem; }
.au-lead-tag { font-size: 14px; font-weight: 800; letter-spacing: 2px; color: hsl(var(--hue) 100% 78%); }
.au-owner { display: flex; align-items: center; gap: 8px; font-size: 15px; color: #b8c1ee; text-align: left; }
.au-owner b { color: #fff; font-size: 17px; }
.au-lead-left { font-size: 15px; color: #a9b3e6; } .au-lead-left b { color: #4ade80; font-size: 1.4rem; }

/* bid bar */
.au-bidbar { text-align: center; }
.au-bid-label { font-size: 15px; letter-spacing: 4px; color: #aab4ea; font-weight: 700; }
.au-bid-num { font-size: 4.6rem; line-height: 1.05; font-weight: 900; color: #ffd54a; text-shadow: 0 0 28px rgba(255,200,60,.75); animation: popnum .45s ease-out; }
.au-bid-num small { font-size: 1.3rem; margin-left: 8px; color: #aab4ea; text-shadow: none; font-weight: 600; }
.au-hist { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 8px; min-height: 34px; }
.au-hchip { font-size: 15px; padding: 5px 13px; border-radius: 999px; background: hsl(var(--hue) 55% 22%); border: 1px solid hsl(var(--hue) 90% 62% / .7); animation: featIn .5s both; }
.au-hchip b { color: #ffd54a; margin-left: 4px; }

/* SOLD */
.au-pw.swallow { animation: swallow 1s .5s cubic-bezier(.6,0,.9,.4) forwards; }
.au-lead.grow { animation: grow 1.6s 1.2s cubic-bezier(.2,1.2,.3,1) forwards, leadglow 1.6s ease-in-out infinite; }
.au-soldbanner { margin-top: 10px; text-align: center; animation: bannerIn .8s 1.9s both; }
.au-stamp-sold { display: inline-block; font-size: 3rem; font-weight: 900; letter-spacing: 6px; color: #4ade80; border: 5px solid #4ade80; padding: 0 22px; border-radius: 12px; transform: rotate(-6deg); text-shadow: 0 0 24px rgba(74,222,128,.8); box-shadow: 0 0 30px rgba(74,222,128,.5); }
.au-sold-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 46px; margin-top: 10px; }
.au-sold-grid div { display: flex; flex-direction: column; align-items: center; }
.au-sold-grid small { color: #aab4ea; font-size: 16px; }
.au-sold-grid b { font-size: 3.2rem; line-height: 1.1; }
.au-sold-grid b.gold { color: #ffd54a; text-shadow: 0 0 26px rgba(255,200,60,.8); }
.au-sold-grid b.green { color: #4ade80; text-shadow: 0 0 26px rgba(74,222,128,.7); }
.au-conf { position: absolute; top: -20px; left: calc(var(--x) * 1%); width: 9px; height: 15px; background: hsl(var(--h) 95% 60%); opacity: 0; z-index: 3; animation: confetti 2.6s var(--d) ease-in forwards; }

/* UNSOLD */
.au-redflash { position: absolute; inset: -30px; z-index: 0; background: radial-gradient(circle, rgba(220,38,38,.55), transparent 70%); animation: redflash 5s ease-out both; pointer-events: none; }
.au-row.solo-row { position: relative; z-index: 1; }
.au-pw.unsold-fx { animation: shake .5s .25s 3, fallaway 1.5s 3s cubic-bezier(.5,0,.9,.5) forwards; }
.au-pw.unsold-fx .au-pcard { animation: playerIn .6s both, grayout 1s 1s forwards; border-color: #dc2626; box-shadow: 0 0 44px rgba(220,38,38,.55); }
.au-stamp-uns { position: absolute; z-index: 5; top: 42%; left: 50%; font-size: 4.2rem; font-weight: 900; letter-spacing: 6px; color: #ef4444; border: 6px solid #ef4444; padding: 0 16px; border-radius: 10px; background: rgba(10,10,20,.55); white-space: nowrap; animation: slam .4s 1s both; }
.au-unsbanner { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; animation: bannerIn .8s 1.5s both; }
.au-unsbanner b { font-size: 1.9rem; color: #fca5a5; } .au-unsbanner span { color: #aab4ea; font-size: 1.1rem; }

/* WAIT */
.au-wait { min-height: 460px; justify-content: center; text-align: center; }
.au-rings { position: relative; width: 190px; height: 190px; display: flex; align-items: center; justify-content: center; }
.au-rings i { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,214,90,.7); animation: ring 3s ease-out infinite; }
.au-rings i:nth-child(2) { animation-delay: 1s; } .au-rings i:nth-child(3) { animation-delay: 2s; }
.au-hammer { font-size: 5rem; transform-origin: 80% 80%; animation: hammer 1.6s ease-in-out infinite; filter: drop-shadow(0 0 18px rgba(255,200,60,.8)); }
.au-wait-t { margin: 0; font-size: 2.3rem; }
.au-wait .au-muted { font-size: 1.15rem; }
.au-dots i { font-style: normal; animation: blink 1.2s infinite; } .au-dots i:nth-child(2) { animation-delay: .2s; } .au-dots i:nth-child(3) { animation-delay: .4s; }
.au-last { display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-radius: 16px; background: rgba(255,255,255,.07); border: 1px solid rgba(74,222,128,.6); animation: featIn .7s both; text-align: left; }
.au-last.unsold { border-color: rgba(239,68,68,.6); }
.au-last div { display: flex; flex-direction: column; } .au-last small { color: #aab4ea; font-size: 14px; letter-spacing: 2px; }
.au-last b { font-size: 1.35rem; } .au-last span { color: #ffd54a; font-weight: 800; font-size: 1.6rem; } .au-last.unsold span { color: #ef4444; }

/* ticker */
.au-ticker { overflow: hidden; border-radius: 16px; padding: 12px 0; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
.au-track { display: flex; width: max-content; animation: marquee 60s linear infinite; }
.au-ticker:hover .au-track { animation-play-state: paused; }
.au-chip { display: flex; align-items: center; gap: 10px; margin-right: 12px; padding: 8px 16px 8px 8px; border-radius: 999px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); white-space: nowrap; }
.au-chip-t { display: flex; flex-direction: column; } .au-chip-t b { font-size: 16px; } .au-chip-t span { font-size: 14px; color: #98a3dc; }
.au-chip em { font-style: normal; font-size: 14px; font-weight: 800; padding: 3px 11px; border-radius: 999px; }
.au-chip em.sold { background: rgba(74,222,128,.18); color: #4ade80; } .au-chip em.uns { background: rgba(239,68,68,.18); color: #f87171; } .au-chip em.live { background: #dc2626; color: #fff; }
.au-chip.sold { border-color: rgba(74,222,128,.55); } .au-chip.unsold { border-color: rgba(239,68,68,.5); opacity: .75; }
.au-chip.now { border-color: #ffd54a; animation: tglow 1.4s infinite; --hue: 45; }

/* message + finished */
.au-msg { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 6px; }
.au-msg-icon { font-size: 4.5rem; animation: hammer 1.6s ease-in-out infinite; }
.au-msg h2 { font-size: 2rem; }
.au-msg p { color: #8b95c9; max-width: 420px; font-size: 1.15rem; }
.au-fin { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
.au-t.fin { display: flex; flex-direction: column; gap: 8px; cursor: pointer; }
.au-t.fin:hover { border-color: #fff; }

/* team roster (opens when a team is clicked) */
.au-modal { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px;
  background: rgba(3,5,18,.8); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); animation: fadeIn .3s both; }
.au-rp { position: relative; width: min(820px, 100%); height: min(88vh, 780px); display: flex; flex-direction: column; gap: 14px; padding: 18px; border-radius: 24px;
  background: linear-gradient(160deg, hsl(var(--hue) 55% 18%), #080c28); border: 2px solid hsl(var(--hue) 100% 68%); animation: modalIn .5s cubic-bezier(.2,1.1,.3,1) both, leadglow 2.4s ease-in-out infinite; }
.au-rp-head { display: flex; align-items: center; gap: 14px; padding-right: 44px; }
.au-rp-head > div { display: flex; flex-direction: column; min-width: 0; }
.au-rp-head h3 { margin: 0; font-size: 1.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.au-rp-head span { color: #b8c1ee; font-size: 1rem; }
.au-rp-x { position: absolute; top: 14px; right: 14px; width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.08); color: #fff; font-size: 18px; cursor: pointer; }
.au-rp-x:hover { background: #dc2626; }
.au-rp-sum { display: flex; flex-wrap: wrap; gap: 8px; }
.au-rp-sum span { background: rgba(255,255,255,.08); border-radius: 999px; padding: 6px 14px; font-size: 15px; color: #c5ccf3; }
.au-rp-sum b { color: #ffd54a; margin-left: 4px; } .au-rp-sum b.g { color: #4ade80; }
.au-rp-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 6px 6px 6px 2px; }
.au-rp-empty { margin: auto; color: #8b95c9; font-size: 1.3rem; }
.au-r-item { flex: none; display: flex; align-items: center; gap: 14px; padding: 10px 16px 10px 10px; border-radius: 18px; position: relative; overflow: hidden;
  background: rgba(255,255,255,.06); border: 1px solid hsl(var(--hue) 90% 62% / .5);
  animation: rosterIn .8s cubic-bezier(.2,1.1,.3,1) both; }
.au-r-item.act { border-color: #fff; background: hsl(var(--hue) 70% 26% / .75); animation: rosterIn .8s cubic-bezier(.2,1.1,.3,1) both, ractive 1.3s ease-in-out infinite; }
.au-r-item.act::after { content: ''; position: absolute; top: 0; left: -40%; width: 30%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.3), transparent); animation: rshine 1.3s ease-in-out infinite; }
.au-r-no { width: 34px; font-size: 1.5rem; font-weight: 900; color: #ffd54a; text-align: center; }
.au-r-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.au-r-info b { font-size: 1.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.au-r-info span { font-size: 15px; color: #aab4ea; }
.au-r-price { display: flex; flex-direction: column; align-items: flex-end; font-size: 1.7rem; font-weight: 900; color: #ffd54a; text-shadow: 0 0 14px rgba(255,200,60,.6); line-height: 1.1; }
.au-r-price small { font-size: 13px; font-weight: 600; color: #aab4ea; text-shadow: none; }

/* one-window layout (desktop / laptop / projector): header + teams + stage + ticker always fit the screen height */
@media (min-width: 721px) {
  .au.fit { height: 100vh; height: 100dvh; min-height: 0; overflow: hidden; display: flex; flex-direction: column; padding: 10px 14px; }
  .au.fit .au-head { flex: none; margin-bottom: 8px; }
  .au.fit .au-meta { font-size: 14px; }
  .au.fit .au-meta span { padding: 4px 12px; }
  .au.fit .au-strip { flex: none; }
  .au.fit .au-ticker { flex: none; padding: 8px 0; }
  .au.fit .au-stage { height: auto; flex: 1 1 0; min-height: 0; margin: 10px 0; padding: 0; }
  .au.fit .au-fit { position: absolute; left: 50%; top: 50%; width: var(--dw); height: var(--dh);
    margin: calc(var(--dh) / -2) 0 0 calc(var(--dw) / -2); transform-origin: 50% 50%; }
}
@media (min-width: 721px) and (max-height: 860px) {
  .au-strip .au-t { height: 150px; }
  .au-strip .au-count { display: none; }
  .au.fit .au-stage { margin: 6px 0; }
}

/* keyframes */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes blink { 50% { opacity: .25; } }
@keyframes tglow { 0%, 100% { box-shadow: 0 0 10px hsl(var(--hue) 100% 55% / .35), inset 0 0 12px hsl(var(--hue) 100% 60% / .12); } 50% { box-shadow: 0 0 30px hsl(var(--hue) 100% 62% / .8), inset 0 0 22px hsl(var(--hue) 100% 60% / .28); } }
@keyframes leadglow { 0%, 100% { box-shadow: 0 0 22px hsl(var(--hue) 100% 60% / .5); } 50% { box-shadow: 0 0 52px hsl(var(--hue) 100% 65% / .95); } }
@keyframes tpop { 0% { transform: scale(1); } 40% { transform: scale(1.14); } 100% { transform: scale(1); } }
@keyframes playerIn { 0% { opacity: 0; transform: scale(.55) translateY(40px); filter: blur(8px); } 100% { opacity: 1; transform: none; filter: none; } }
@keyframes featIn { 0% { opacity: 0; transform: translateX(26px); } 100% { opacity: 1; transform: none; } }
@keyframes floaty { 50% { transform: translateY(-6px); } }
@keyframes shine { 0% { left: -60%; } 60%, 100% { left: 130%; } }
@keyframes popnum { 0% { transform: scale(.7); opacity: .4; } 60% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
@keyframes swallow { 0% { transform: none; opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--sw), 0) scale(.08); opacity: 0; } }
@keyframes grow { 0% { transform: scale(1); } 20% { transform: scale(.9); } 60% { transform: scale(1.45); } 100% { transform: scale(1.35); } }
@keyframes bannerIn { 0% { opacity: 0; transform: translateY(30px) scale(.9); } 100% { opacity: 1; transform: none; } }
@keyframes confetti { 0% { opacity: 1; transform: translateY(0) rotate(0); } 100% { opacity: 0; transform: translateY(560px) rotate(620deg); } }
@keyframes redflash { 0% { opacity: 0; } 15% { opacity: 1; } 100% { opacity: .25; } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-12px) rotate(-1deg); } 75% { transform: translateX(12px) rotate(1deg); } }
@keyframes slam { 0% { opacity: 0; transform: translate(-50%, -50%) scale(4) rotate(-18deg); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-18deg); } }
@keyframes grayout { to { filter: grayscale(1) brightness(.6); } }
@keyframes fallaway { 0% { transform: none; opacity: 1; } 100% { transform: translateY(520px) rotate(16deg); opacity: 0; } }
@keyframes ring { 0% { transform: scale(.35); opacity: .9; } 100% { transform: scale(1.5); opacity: 0; } }
@keyframes hammer { 0%, 100% { transform: rotate(-35deg); } 45% { transform: rotate(25deg); } 55% { transform: rotate(25deg); } }
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalIn { 0% { opacity: 0; transform: scale(.85) translateY(30px); } 100% { opacity: 1; transform: none; } }
@keyframes rosterIn { 0% { opacity: 0; transform: translateX(-70px) scale(.92); filter: brightness(2.2) blur(3px); } 60% { opacity: 1; filter: brightness(1.6); } 100% { opacity: 1; transform: none; filter: none; } }
@keyframes ractive { 0%, 100% { box-shadow: 0 0 14px hsl(var(--hue) 100% 60% / .6), inset 0 0 14px hsl(var(--hue) 100% 70% / .2); } 50% { box-shadow: 0 0 38px hsl(var(--hue) 100% 68% / 1), inset 0 0 26px hsl(var(--hue) 100% 75% / .4); } }
@keyframes rshine { 0% { left: -40%; } 70%, 100% { left: 130%; } }

@media (max-width: 720px) {
  .au { padding: 10px 8px 20px; }
  .au-row { --pw: 290px; --ph: 470px; --slot: 190px; --gap: 10px; --sw: 200px; }
  .au-slot { height: 340px; }
  .au-pcard h2 { font-size: 1.6rem; }
  .au-bid-num { font-size: 3.6rem; }
  .au-stage { height: 760px; padding: 16px 4px; }
  .au-sold-grid b { font-size: 2.8rem; } .au-stamp-sold { font-size: 2.8rem; } .au-stamp-uns { font-size: 2.8rem; }
  .au-lead h3 { font-size: 1.3rem; } .au-wait-t { font-size: 1.7rem; }
  .au-strip .au-t-tok b { font-size: 1.6rem; }
  .au-strip { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  .au-r-info b { font-size: 1.1rem; } .au-r-price { font-size: 1.3rem; }
}
`;