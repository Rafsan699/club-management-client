import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import API, { BASE, img, initials, useGet, useLiveSocket } from './bdApi';

/*
  Badminton projector view
  - Lists every live match; selecting one opens an animated, game-style scoreboard.
  - Cinematic match intro, rolling score digits, shuttle flight on every point, spark bursts,
    streak / game point / match point banners, game and match celebrations with confetti.
  - Light blue glass theme that matches the Players profile popup.
  - Respects prefers-reduced-motion and is responsive from phones to projectors.
*/

const REDUCED = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLOR = { A: '#1d4ed8', B: '#06b6d4' };
const CONFETTI = ['#1d4ed8', '#06b6d4', '#f2b705', '#22c55e', '#ef4444', '#ffffff'];

/* ---------- match helpers (mirror the rules in badmintonScoring.js) ---------- */
const gameDone = (g, m) => {
  const s = Math.max(g.a, g.b), o = Math.min(g.a, g.b);
  return (s >= m.pointsToWin && s - o >= 2) || s >= m.cap;
};
function view(m) {
  const games = m.games || [];
  const done = games.filter((g) => gameDone(g, m));
  const live = games.find((g) => !gameDone(g, m)) || null;
  const cur = live ? { a: live.a, b: live.b } : { a: 0, b: 0 };
  const gw = { A: done.filter((g) => g.a > g.b).length, B: done.filter((g) => g.b > g.a).length };
  const tot = games.reduce((t, g) => ({ A: t.A + g.a, B: t.B + g.b }), { A: 0, B: 0 });
  const share = tot.A + tot.B ? Math.round((tot.A / (tot.A + tot.B)) * 100) : 50;

  // live performance derived from the point history
  const pts = (m.history || []).filter((h) => h.type === 'point');
  const best = { A: 0, B: 0 };
  let run = 0, last = null;
  pts.forEach((h) => { if (h.side === last) run++; else { run = 1; last = h.side; } if (run > best[h.side]) best[h.side] = run; });
  const recent = pts.slice(-14).map((h) => h.side);
  const last10 = pts.slice(-10);
  const momentum = last10.length ? Math.round((last10.filter((h) => h.side === 'A').length / last10.length) * 100) : 50;

  const need = Math.ceil((m.bestOf || 3) / 2);
  const ptw = m.pointsToWin || 21, cap = m.cap || 30;
  const canWin = (s, o) => m.status === 'live' && ((s >= ptw - 1 && s > o) || s === cap - 1);
  const flag = (side) => {
    const s = side === 'A' ? cur.a : cur.b, o = side === 'A' ? cur.b : cur.a;
    if (!canWin(s, o)) return null;
    return gw[side] === need - 1 ? 'MATCH POINT' : 'GAME POINT';
  };
  return { games, done, cur, gw, tot, share, best, run: { side: last, n: run }, recent, count: pts.length, momentum, need, flag: { A: flag('A'), B: flag('B') }, gameNo: Math.min(done.length + 1, m.bestOf || 3) };
}
const teamName = (t) => (t && t.name) || 'TBA';
const teamPic = (t) => t?.logo || t?.players?.[0]?.photo;
const names = (t) => (t?.players || []).map((p) => p.name).join(' & ');

/* ---------- animation helpers ---------- */
function useCountUp(target, ms = 900) {
  const isNum = typeof target === 'number';
  const [v, setV] = useState(REDUCED || !isNum ? target : 0);
  const from = useRef(0);
  useEffect(() => {
    if (REDUCED || !isNum) { setV(target); return undefined; }
    const start = from.current, t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, isNum]);
  return isNum ? v : target;
}

// Slot-style number: the old value slides out and the new one slides in
function Roll({ value, className = '' }) {
  const [st, setSt] = useState({ cur: value, prev: null, k: 0, dir: 'up' });
  useEffect(() => {
    setSt((s) => (s.cur === value ? s : { cur: value, prev: s.cur, k: s.k + 1, dir: Number(value) >= Number(s.cur) ? 'up' : 'down' }));
  }, [value]);
  return (
    <span className={`roll ${className}`}>
      {st.prev !== null && <span key={`o${st.k}`} className={`roll-old ${st.dir}`} aria-hidden="true" onAnimationEnd={() => setSt((s) => ({ ...s, prev: null }))}>{st.prev}</span>}
      <span key={`n${st.k}`} className={`roll-new ${st.prev !== null ? st.dir : ''}`}>{st.cur}</span>
    </span>
  );
}

const Shuttle = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <path d="M20 3c3.2 0 5.4 2 5.4 4.6S23.200 12 20 12s-5.400-1.800-5.400-4.400S16.800 3 20 3z" fill="#f2b705" />
    <path d="M15 12 8 36q12 4 24 0L25 12z" fill="#fff" stroke="#8fb0ff" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M17.500 12 14 37M20 12v26.500M22.500 12 26 37M10 26q10 3 20 0" stroke="#8fb0ff" strokeWidth="1" fill="none" />
  </svg>
);

function Sparks({ id, color, n = 16 }) {
  const items = useMemo(() => Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.5, d = 70 + Math.random() * 110;
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, s: 5 + Math.random() * 8, dl: Math.random() * 90 };
  }), [id, n]); // eslint-disable-line
  return (
    <div className="pj-sparks" aria-hidden="true">
      {items.map((p, i) => <i key={i} style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, width: p.s, height: p.s, background: color, animationDelay: `${p.dl}ms` }} />)}
    </div>
  );
}

function Confetti({ id, n = 110 }) {
  const items = useMemo(() => Array.from({ length: n }, () => ({
    l: Math.random() * 100, d: Math.random() * 900, t: 2400 + Math.random() * 2400, dx: (Math.random() - 0.5) * 240,
    r: Math.random() * 720 - 360, s: 7 + Math.random() * 9, c: CONFETTI[Math.floor(Math.random() * CONFETTI.length)], round: Math.random() > 0.6
  })), [id, n]); // eslint-disable-line
  return (
    <div className="pj-confetti" aria-hidden="true">
      {items.map((p, i) => (
        <i key={i} style={{ left: `${p.l}%`, width: p.s, height: p.round ? p.s : p.s * 1.6, borderRadius: p.round ? '50%' : 2, background: p.c, animationDelay: `${p.d}ms`, animationDuration: `${p.t}ms`, '--dx': `${p.dx}px`, '--rot': `${p.r}deg` }} />
      ))}
    </div>
  );
}

function Avatar({ src, name, size = 96, ring = '#8fd3f4', className = '' }) {
  const base = { width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${ring}`, flex: '0 0 auto', background: '#fff' };
  return src
    ? <img className={className} src={img(src)} alt={name} style={base} />
    : <div className={className} style={{ ...base, display: 'grid', placeItems: 'center', background: '#e0ecff', color: '#1d4ed8', fontFamily: 'var(--pj-num)', fontWeight: 700, fontSize: size * 0.4 }}>{initials(name || '?')}</div>;
}

function CourtBg() {
  return (
    <div className="pj-bg" aria-hidden="true">
      <i className="blob b1" /><i className="blob b2" /><i className="blob b3" />
      <svg className="court" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#9db8ff" strokeWidth="2.200" pathLength="1">
          <rect x="60" y="40" width="880" height="440" rx="4" />
          <path d="M60 110H940M60 410H940M500 40V480M60 260H940M270 110V410M730 110V410" />
        </g>
      </svg>
    </div>
  );
}

/* ---------- players ---------- */
function PlayerCard({ p, stats, color, index }) {
  const s = stats || {};
  const played = useCountUp(s.played), won = useCountUp(s.won), rate = useCountUp(s.winRate);
  return (
    <div className="pj-player" style={{ '--c': color, animationDelay: `${600 + index * 150}ms` }}>
      <Avatar src={p.photo} name={p.name} size={76} ring={color} />
      <div className="pj-pl-body">
        <div className="pj-pl-name">{p.name}</div>
        <div className="pj-pl-meta">{[p.department, p.batch && `Batch ${p.batch}`].filter(Boolean).join(' · ') || '—'}</div>
        <div className="pj-pl-stats">
          <span><b>{played ?? '–'}</b> played</span>
          <span><b>{won ?? '–'}</b> won</span>
          <span><b>{s.winRate != null ? `${rate}%` : '–'}</b> win rate</span>
        </div>
        <div className="pj-bar-track" aria-hidden="true"><div className="pj-bar-fill" style={{ width: `${s.winRate || 0}%` }} /></div>
        {s.form && s.form.length > 0 && (
          <div className="pj-form">{s.form.map((r, i) => <i key={i} className={r === 'W' ? 'w' : 'l'} style={{ animationDelay: `${900 + i * 90}ms` }}>{r}</i>)}</div>
        )}
      </div>
    </div>
  );
}

function TeamPanel({ side, team, v, serving, stats, bestOf, hitKey, result }) {
  const key = side === 'a' ? 'A' : 'B';
  const color = COLOR[key];
  const need = Math.ceil((bestOf || 3) / 2);
  const streak = v.run.side === key ? v.run.n : 0;
  const flag = v.flag[key];
  return (
    <section className={`pj-team ${side} ${serving ? 'serving' : ''} ${result || ''}`} style={{ '--c': color }}>
      {hitKey > 0 && <div key={`h${hitKey}`} className="pj-hit" aria-hidden="true" />}
      {result === 'win' && <div className="pj-ribbon gold">🏆 WINNER</div>}
      {flag && result !== 'win' && <div className="pj-ribbon alert" key={flag}>{flag}</div>}

      <header className="pj-team-head">
        <div className={`pj-avwrap ${serving ? 'on' : ''}`}><Avatar src={teamPic(team)} name={teamName(team)} size={76} ring={color} /></div>
        <div className="pj-team-id">
          <h2>{teamName(team)}</h2>
          <div className="pj-pips">{Array.from({ length: need }).map((_, i) => <i key={i} className={i < v.gw[key] ? 'on' : ''} />)}<small>Games won</small></div>
        </div>
        {serving && <span className="pj-serve"><Shuttle size={22} />Serving</span>}
      </header>

      <div className="pj-scorewrap">
        <Roll value={v.cur[side]} className="pj-score" />
        {hitKey > 0 && <i key={`r${hitKey}`} className="pj-ringburst" aria-hidden="true" />}
        {hitKey > 0 && <span key={`p${hitKey}`} className="pj-plus" aria-hidden="true">+1</span>}
        {hitKey > 0 && <Sparks id={hitKey} color={color} />}
      </div>

      {streak >= 3 && <div className="pj-fire" key={streak} style={{ '--f': Math.min(streak, 10) }}>🔥 {streak} points in a row</div>}

      <div className="pj-live-perf">
        <span><b>{v.tot[key]}</b>Match points</span>
        <span><b>{v.best[key]}</b>Best run</span>
        <span className={streak >= 3 ? 'hot' : ''}><b>{streak}</b>Current run</span>
      </div>
      <div className="pj-players">
        {(team?.players || []).map((p, i) => <PlayerCard key={p._id} p={p} stats={stats[p._id]} color={color} index={i} />)}
      </div>
    </section>
  );
}

/* ---------- overlays ---------- */
function Intro({ m, onDone }) {
  return (
    <div className="pj-intro" onClick={onDone} role="presentation">
      <div className="pj-in a"><div className="pj-in-team"><Avatar src={teamPic(m.teamA)} name={teamName(m.teamA)} size={132} ring="#fff" /><h2>{teamName(m.teamA)}</h2><small>{names(m.teamA)}</small></div></div>
      <div className="pj-in b"><div className="pj-in-team"><Avatar src={teamPic(m.teamB)} name={teamName(m.teamB)} size={132} ring="#fff" /><h2>{teamName(m.teamB)}</h2><small>{names(m.teamB)}</small></div></div>
      <div className="pj-in-vs"><i /><span>VS</span></div>
      <div className="pj-in-foot">{[m.tournament?.name, m.round, `Best of ${m.bestOf || 3}`].filter(Boolean).join(' · ')}</div>
    </div>
  );
}

function Celebration({ c, m, v, onClose }) {
  const team = c.side === 'A' ? m.teamA : m.teamB;
  const isMatch = c.type === 'MATCH';
  return (
    <div className={`pj-cele ${isMatch ? 'match' : 'game'}`} onClick={onClose} role="dialog" aria-label={isMatch ? 'Match winner' : 'Game winner'}>
      <div className="pj-rays" aria-hidden="true" />
      <Confetti id={c.id} n={isMatch ? 150 : 70} />
      <div className="pj-cele-card">
        {isMatch && <div className="pj-trophy" aria-hidden="true">🏆</div>}
        <small>{isMatch ? 'Match winner' : `Game ${c.gameNo} winner`}</small>
        <Avatar src={teamPic(team)} name={teamName(team)} size={isMatch ? 150 : 120} ring="#f2b705" className="pj-cele-av" />
        <h2>{teamName(team)}</h2>
        <div className="pj-cele-score">{isMatch ? `${v.gw.A} – ${v.gw.B}` : `${c.score.a} – ${c.score.b}`}</div>
        {isMatch && <div className="pj-cele-sub">Final game {c.score.a} – {c.score.b}</div>}
        <div className="pj-cele-hint">Tap anywhere to continue</div>
      </div>
    </div>
  );
}

function ShuttleFlight({ side, id }) {
  const ltr = side === 'A';
  return (
    <div className={`pj-flight ${ltr ? 'ltr' : 'rtl'}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="pj-sh-x" style={{ animationDelay: `${i * 55}ms`, opacity: 1 - i * 0.32 }}>
          <div className="pj-sh-y" style={{ animationDelay: `${i * 55}ms` }}>
            <div className="pj-sh-r" style={{ animationDelay: `${i * 55}ms` }}><Shuttle size={46 - i * 6} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- match stage ---------- */
function MatchStage({ m, onBack }) {
  const v = useMemo(() => view(m), [m]);
  const [stats, setStats] = useState({});
  const [intro, setIntro] = useState(!REDUCED);
  const [ev, setEv] = useState(null);
  const [hit, setHit] = useState({ A: 0, B: 0 });
  const [cele, setCele] = useState(null);
  const prev = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // intro plays once per opened match
  useEffect(() => { if (!intro) return undefined; const t = setTimeout(() => setIntro(false), 3000); return () => clearTimeout(t); }, [intro]);

  // Esc skips overlays
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setIntro(false); setCele(null); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // career stats for every player
  const pids = useMemo(() => [...(m.teamA?.players || []), ...(m.teamB?.players || [])].map((p) => p._id), [m]);
  useEffect(() => {
    let off = false;
    Promise.all(pids.map((id) => API.get(`/players/${id}/stats`).then((r) => [id, r.data.stats]).catch(() => [id, null])))
      .then((rows) => { if (!off) setStats(Object.fromEntries(rows)); });
    return () => { off = true; };
  }, [pids.join(','), v.done.length, m.status]); // eslint-disable-line

  // detect point / game / match events from score changes
  useEffect(() => {
    const p = prev.current;
    prev.current = { a: v.cur.a, b: v.cur.b, done: v.done.length, status: m.status };
    if (!p) return;
    const id = Date.now();
    const lastGame = v.done[v.done.length - 1];
    let side = null, type = null;
    if (m.status === 'completed' && p.status !== 'completed') { type = 'MATCH'; side = m.winner; }
    else if (v.done.length > p.done && lastGame) { type = 'GAME'; side = lastGame.a > lastGame.b ? 'A' : 'B'; }
    else if (v.cur.a > p.a) { type = 'POINT'; side = 'A'; }
    else if (v.cur.b > p.b) { type = 'POINT'; side = 'B'; }
    if (!type) return;

    setHit((h) => ({ ...h, [side]: h[side] + 1 }));
    setEv({ type, side, id });
    later(() => setEv((e) => (e && e.id === id ? null : e)), 1300);
    if (type !== 'POINT' && lastGame) {
      setCele({ type, side, id, gameNo: v.done.length, score: { a: lastGame.a, b: lastGame.b } });
      later(() => setCele((c) => (c && c.id === id ? null : c)), type === 'MATCH' ? 10000 : 3400);
    }
  }, [v.cur.a, v.cur.b, v.done.length, m.status]); // eslint-disable-line

  const lead = v.cur.a - v.cur.b;
  const done = m.status === 'completed';
  const resultOf = (side) => (!done ? '' : m.winner === side ? 'win' : 'lose');
  const canFs = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;
  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());

  return (
    <div className="pj-stage">
      <div className="pj-bar">
        <button onClick={onBack} className="pj-btn">‹ Live matches</button>
        <div className="pj-bar-mid">
          <b>{m.tournament?.name || 'Match'}</b>
          <span>{[m.round, m.matchNo && `Match ${m.matchNo}`, `Game ${v.gameNo}`, `Best of ${m.bestOf || 3}`].filter(Boolean).join(' · ')}</span>
        </div>
        {done ? <span className="pj-tag done">FULL TIME</span> : <span className="pj-tag live"><i />LIVE</span>}
        {canFs && <button onClick={toggleFs} className="pj-btn">Fullscreen</button>}
      </div>

      <div className="pj-grid">
        <TeamPanel side="a" team={m.teamA} v={v} serving={m.serving === 'A' && m.status === 'live'} stats={stats} bestOf={m.bestOf} hitKey={hit.A} result={resultOf('A')} />

        <div className="pj-mid">
          <div className="pj-vs">VS</div>
          <div className="pj-gamechip">Game {v.gameNo}</div>

          <div className="pj-card-lite">
            <div className="pj-share-l"><span>{v.tot.A}</span><span>Points won</span><span>{v.tot.B}</span></div>
            <div className="pj-share"><div className="a" style={{ width: `${v.share}%` }} /><div className="b" style={{ width: `${100 - v.share}%` }} /></div>
          </div>

          <div className="pj-card-lite">
            <div className="pj-share-l"><span>Momentum</span><span>Last 10 points</span><span /></div>
            <div className="pj-mom"><div className="a" style={{ width: `${v.momentum}%` }} /><div className="b" style={{ width: `${100 - v.momentum}%` }} /><i style={{ left: `${v.momentum}%` }} /></div>
          </div>

          <table className="pj-games">
            <tbody>
              {v.games.map((g, i) => {
                const d = gameDone(g, m);
                return <tr key={i} className={d ? '' : 'cur'}><td className={d && g.a > g.b ? 'w' : ''}>{g.a}</td><th>G{i + 1}</th><td className={d && g.b > g.a ? 'w' : ''}>{g.b}</td></tr>;
              })}
            </tbody>
          </table>

          <div className="pj-recent" aria-label="Last 14 points">{v.recent.map((s, i) => <i key={v.count - v.recent.length + i} className={`${s === 'A' ? 'a' : 'b'} ${i === v.recent.length - 1 ? 'latest' : ''}`} />)}</div>

          <div className="pj-perf">
            <small>Current lead</small>
            <b>{lead === 0 ? 'Level' : `${Math.abs(lead)} ${Math.abs(lead) === 1 ? 'point' : 'points'}`}</b>
            <em>{lead === 0 ? '' : teamName(lead > 0 ? m.teamA : m.teamB)}</em>
          </div>
        </div>

        <TeamPanel side="b" team={m.teamB} v={v} serving={m.serving === 'B' && m.status === 'live'} stats={stats} bestOf={m.bestOf} hitKey={hit.B} result={resultOf('B')} />
      </div>

      {ev && ev.type !== 'MATCH' && <ShuttleFlight key={ev.id} side={ev.side} id={ev.id} />}
      {ev && ev.type === 'POINT' && <div key={`f${ev.id}`} className={`pj-flash ${ev.side === 'A' ? 'a' : 'b'}`} aria-hidden="true" />}
      {intro && <Intro m={m} onDone={() => setIntro(false)} />}
      {cele && !intro && <Celebration c={cele} m={m} v={v} onClose={() => setCele(null)} />}
      <div className="pj-sr" aria-live="polite">{`${teamName(m.teamA)} ${v.cur.a}, ${teamName(m.teamB)} ${v.cur.b}. Games ${v.gw.A} to ${v.gw.B}.`}</div>
    </div>
  );
}

/* ---------- live list ---------- */
function LiveCard({ m, onOpen, index }) {
  const v = view(m);
  return (
    <button className="pj-card" onClick={() => onOpen(m)} style={{ animationDelay: `${index * 110}ms` }}>
      <div className="pj-card-top"><span className="pj-tag live"><i />LIVE</span><small>{[m.tournament?.name, m.round].filter(Boolean).join(' · ')}</small></div>
      <div className="pj-card-row">
        <div className="pj-card-team"><Avatar src={teamPic(m.teamA)} name={teamName(m.teamA)} size={68} ring={COLOR.A} /><span>{teamName(m.teamA)}</span></div>
        <div className="pj-card-sc"><Roll value={v.cur.a} className="n a" /><em>{v.gw.A}–{v.gw.B}</em><Roll value={v.cur.b} className="n b" /></div>
        <div className="pj-card-team"><Avatar src={teamPic(m.teamB)} name={teamName(m.teamB)} size={68} ring={COLOR.B} /><span>{teamName(m.teamB)}</span></div>
      </div>
      <div className="pj-card-cta">Open scoreboard ›</div>
    </button>
  );
}

export default function BadmintonProjector() {
  const { data, setData, loading, error } = useGet('/matches?status=live');
  const [sel, setSel] = useState(null);

  const onUpdate = useCallback((m) => {
    setData((list) => {
      const rest = (list || []).filter((x) => x._id !== m._id);
      return m.status === 'live' ? [m, ...rest] : rest;
    });
    setSel((s) => (s && s._id === m._id ? m : s)); // keep the selected match on screen after it finishes (shows FULL TIME)
  }, [setData]);
  const connected = useLiveSocket(onUpdate);

  const list = data || [];
  return (
    <div className="pj">
      <style>{CSS}</style>
      <CourtBg />
      {sel ? <MatchStage key={sel._id} m={sel} onBack={() => setSel(null)} /> : (
        <div className="pj-home">
          <div className="pj-bar">
            <div className="pj-bar-mid"><b>Live matches</b><span>{list.length ? `${list.length} ${list.length > 1 ? 'matches' : 'match'} in progress` : 'No live matches right now'}</span></div>
            <span className={`pj-conn ${connected ? 'on' : ''}`}><i />{connected ? 'Connected' : 'Reconnecting…'}</span>
            <a className="pj-btn" href={BASE}>Back to site</a>
          </div>
          {loading && <p className="pj-empty">Loading…</p>}
          {error && <p className="pj-empty">{error}</p>}
          {!loading && !error && !list.length && (
            <div className="pj-empty"><div className="pj-empty-sh"><Shuttle size={64} /></div><p>Matches appear here automatically once they go live.</p></div>
          )}
          <div className="pj-cards">{list.map((m, i) => <LiveCard key={m._id} m={m} onOpen={setSel} index={i} />)}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap');
.pj{--pj-ink:#0f172a;--pj-mute:#64748b;--pj-line:#dbe5ff;--pj-a:#1d4ed8;--pj-b:#06b6d4;--pj-gold:#f2b705;--pj-num:'Barlow Condensed',sans-serif;
 --pj-glass:rgba(255,255,255,.74);position:relative;min-height:100vh;min-height:100dvh;overflow-x:hidden;color:var(--pj-ink);font-family:'Barlow',system-ui,sans-serif;
 background:linear-gradient(160deg,#eaf1ff 0%,#f7fbff 55%,#dcebff 100%)}
.pj *{box-sizing:border-box}
.pj button{font-family:inherit}
.pj-home,.pj-stage{position:relative;z-index:1}
.pj-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}

/* background */
.pj-bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.pj-bg .blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;animation:pjFloat 16s ease-in-out infinite}
.pj-bg .b1{width:44vmax;height:44vmax;left:-12vmax;top:-14vmax;background:#9ec5ff}
.pj-bg .b2{width:38vmax;height:38vmax;right:-10vmax;bottom:-12vmax;background:#8fe3f4;animation-delay:-5s}
.pj-bg .b3{width:26vmax;height:26vmax;left:40%;top:30%;background:#c7d8ff;animation-delay:-9s;opacity:.4}
.pj-bg .court{position:absolute;inset:0;width:100%;height:100%;opacity:.5}
.pj-bg .court *{stroke-dasharray:1;stroke-dashoffset:1;animation:pjDraw 3.2s ease-out .2s forwards}
@keyframes pjFloat{50%{transform:translate(5vmax,4vmax) scale(1.12)}}
@keyframes pjDraw{to{stroke-dashoffset:0}}

/* top bar */
.pj-bar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:max(14px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) 14px max(20px,env(safe-area-inset-left));
 background:var(--pj-glass);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid #fff;box-shadow:0 10px 30px -22px rgba(30,64,175,.5);position:sticky;top:0;z-index:5}
.pj-bar-mid{flex:1;min-width:160px;display:flex;flex-direction:column}
.pj-bar-mid b{font:700 clamp(22px,3vw,30px) var(--pj-num);letter-spacing:.01em}
.pj-bar-mid span{color:var(--pj-mute);font-size:14px}
.pj-btn{background:#fff;border:1px solid var(--pj-line);color:var(--pj-a);padding:9px 18px;border-radius:999px;cursor:pointer;text-decoration:none;font:600 14px 'Barlow',sans-serif;transition:transform .15s,box-shadow .15s}
.pj-btn:hover{transform:translateY(-1px);box-shadow:0 8px 18px -10px rgba(29,78,216,.6)}
.pj-btn:focus-visible,.pj-card:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
.pj-conn{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#dc2626}.pj-conn i{width:8px;height:8px;border-radius:50%;background:currentColor}
.pj-conn.on{color:#16a34a}.pj-conn.on i{animation:pjPulse 1.6s infinite}
.pj-tag{display:inline-flex;align-items:center;gap:6px;font:700 14px var(--pj-num);letter-spacing:.08em;padding:4px 12px;border-radius:999px;background:#ef4444;color:#fff}
.pj-tag.done{background:#16a34a}.pj-tag i{width:8px;height:8px;border-radius:50%;background:#fff;animation:pjPulse 1.2s infinite}
@keyframes pjPulse{50%{opacity:.3;transform:scale(.7)}}

/* list */
.pj-empty{text-align:center;color:var(--pj-mute);padding:80px 20px;font-size:20px}
.pj-empty-sh{display:inline-block;animation:pjBob 2.4s ease-in-out infinite}
.pj-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:20px;padding:24px max(20px,env(safe-area-inset-left))}
.pj-card{position:relative;text-align:left;color:inherit;background:var(--pj-glass);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid #fff;border-radius:24px;padding:20px;cursor:pointer;
 box-shadow:0 20px 50px -26px rgba(30,64,175,.45);animation:pjRise .6s cubic-bezier(.2,1,.3,1) both;transition:transform .2s,box-shadow .2s}
.pj-card:hover{transform:translateY(-5px) rotate(-.4deg);box-shadow:0 28px 60px -24px rgba(30,64,175,.6)}
.pj-card-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:16px;color:var(--pj-mute)}
.pj-card-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px}
.pj-card-team{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;font-weight:600;min-width:0;overflow-wrap:anywhere}
.pj-card-sc{display:flex;align-items:center;gap:10px;font-family:var(--pj-num)}
.pj-card-sc .n{font-size:58px;font-weight:800}.pj-card-sc .n.a{color:var(--pj-a)}.pj-card-sc .n.b{color:var(--pj-b)}
.pj-card-sc em{font-style:normal;color:var(--pj-mute);font-size:20px}
.pj-card-cta{margin-top:14px;color:var(--pj-a);font-weight:600;font-size:14px;text-align:right;transition:transform .2s}.pj-card:hover .pj-card-cta{transform:translateX(4px)}
@keyframes pjRise{from{opacity:0;transform:translateY(24px) scale(.97)}}

/* rolling digits */
.roll{display:inline-grid;overflow:hidden;line-height:1}
.roll>span{grid-area:1/1;display:block;text-align:center}
.roll-new.up{animation:pjInUp .5s cubic-bezier(.2,1.2,.3,1) both}.roll-old.up{animation:pjOutUp .45s ease-in both}
.roll-new.down{animation:pjInDown .5s cubic-bezier(.2,1.2,.3,1) both}.roll-old.down{animation:pjOutDown .45s ease-in both}
@keyframes pjInUp{from{transform:translateY(100%);opacity:0}}
@keyframes pjOutUp{to{transform:translateY(-100%);opacity:0}}
@keyframes pjInDown{from{transform:translateY(-100%);opacity:0}}
@keyframes pjOutDown{to{transform:translateY(100%);opacity:0}}

/* scoreboard */
.pj-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,320px) minmax(0,1fr);gap:24px;padding:24px max(24px,env(safe-area-inset-left)) 40px}
.pj-team{position:relative;background:var(--pj-glass);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid #fff;border-top:6px solid var(--c);border-radius:28px;padding:22px;display:flex;flex-direction:column;align-items:center;
 box-shadow:0 26px 60px -30px rgba(30,64,175,.5);transition:box-shadow .4s,opacity .4s,filter .4s}
.pj-team.a{animation:pjInL .8s cubic-bezier(.2,1,.3,1) .1s both}.pj-team.b{animation:pjInR .8s cubic-bezier(.2,1,.3,1) .1s both}
@keyframes pjInL{from{opacity:0;transform:translateX(-80px)}}@keyframes pjInR{from{opacity:0;transform:translateX(80px)}}
.pj-team.serving{box-shadow:0 0 0 3px var(--c),0 30px 70px -26px var(--c)}
.pj-team.win{border-color:var(--pj-gold);box-shadow:0 0 0 4px rgba(242,183,5,.55),0 30px 70px -20px rgba(242,183,5,.6)}
.pj-team.lose{opacity:.78;filter:saturate(.7)}
.pj-hit{position:absolute;inset:0;border-radius:inherit;pointer-events:none;animation:pjHit .7s ease-out}
@keyframes pjHit{0%{box-shadow:0 0 0 0 var(--c),inset 0 0 0 0 var(--c);background:rgba(255,255,255,.35)}100%{box-shadow:0 0 0 26px transparent,inset 0 0 60px 0 transparent;background:transparent}}
.pj-ribbon{position:absolute;top:-16px;left:50%;transform:translateX(-50%);padding:6px 18px;border-radius:999px;font:800 20px var(--pj-num);letter-spacing:.08em;white-space:nowrap;overflow:hidden;z-index:2}
.pj-ribbon.alert{background:var(--c);color:#fff;animation:pjRibbon 1s ease-in-out infinite}
.pj-ribbon.gold{background:linear-gradient(90deg,#f2b705,#ffd84d);color:#5b3b00;animation:pjPopIn .5s cubic-bezier(.2,1.6,.4,1)}
.pj-ribbon::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.65) 50%,transparent 70%);transform:translateX(-100%);animation:pjShine 1.8s infinite}
@keyframes pjRibbon{50%{transform:translateX(-50%) scale(1.07)}}
@keyframes pjShine{to{transform:translateX(100%)}}
@keyframes pjPopIn{from{transform:translateX(-50%) scale(.3);opacity:0}}
.pj-team-head{display:flex;align-items:center;gap:14px;width:100%;margin-top:6px}
.pj-team-id{min-width:0;flex:1}
.pj-team-head h2{margin:0;font:800 clamp(26px,3vw,42px)/1.05 var(--pj-num);overflow-wrap:anywhere}
.pj-avwrap{position:relative;border-radius:50%;flex:0 0 auto}
.pj-avwrap.on::before{content:"";position:absolute;inset:-7px;border-radius:50%;background:conic-gradient(var(--c),transparent 55%,var(--c));animation:pjSpin 1.6s linear infinite;-webkit-mask:radial-gradient(circle,transparent 62%,#000 64%);mask:radial-gradient(circle,transparent 62%,#000 64%)}
@keyframes pjSpin{to{transform:rotate(360deg)}}
.pj-pips{display:flex;align-items:center;gap:6px;margin-top:6px}
.pj-pips i{width:16px;height:16px;border-radius:50%;border:2px solid var(--c);transition:background .4s,transform .4s}.pj-pips i.on{background:var(--c);transform:scale(1.15)}
.pj-pips small{color:var(--pj-mute);margin-left:4px}
.pj-serve{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--pj-line);border-radius:999px;padding:4px 12px 4px 8px;font:700 14px var(--pj-num);letter-spacing:.06em;color:var(--c);animation:pjBob 1s ease-in-out infinite}
@keyframes pjBob{50%{transform:translateY(-7px)}}
.pj-scorewrap{position:relative;display:grid;place-items:center;margin:6px 0;min-height:1em}
.pj-score{font:800 clamp(100px,17vw,270px)/.95 var(--pj-num);color:var(--c);text-shadow:0 12px 30px color-mix(in srgb,var(--c) 30%,transparent)}
.pj-plus{position:absolute;top:8%;right:6%;font:800 clamp(30px,4vw,56px) var(--pj-num);color:var(--c);animation:pjPlus 1.1s ease-out forwards;pointer-events:none}
@keyframes pjPlus{0%{opacity:0;transform:translateY(10px) scale(.5)}20%{opacity:1;transform:translateY(-6px) scale(1.2)}100%{opacity:0;transform:translateY(-70px) scale(1)}}
.pj-ringburst{position:absolute;left:50%;top:50%;width:40%;aspect-ratio:1;border-radius:50%;border:5px solid var(--c);transform:translate(-50%,-50%) scale(.2);opacity:.8;animation:pjRing .8s ease-out forwards;pointer-events:none}
@keyframes pjRing{to{transform:translate(-50%,-50%) scale(3.2);opacity:0;border-width:1px}}
.pj-sparks{position:absolute;left:50%;top:50%;pointer-events:none}
.pj-sparks i{position:absolute;left:0;top:0;border-radius:50%;opacity:0;animation:pjSpark .85s ease-out forwards}
@keyframes pjSpark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}
.pj-fire{background:linear-gradient(90deg,#fb923c,#ef4444);color:#fff;font:700 clamp(15px,1.6vw,20px) var(--pj-num);letter-spacing:.04em;padding:6px 16px;border-radius:999px;margin-bottom:10px;animation:pjFire .5s cubic-bezier(.2,1.6,.4,1),pjWiggle 1s ease-in-out .5s infinite;box-shadow:0 8px 24px -8px #ef4444;transform-origin:center}
@keyframes pjFire{from{transform:scale(.4);opacity:0}}
@keyframes pjWiggle{50%{transform:rotate(-2deg) scale(calc(1 + var(--f) * .008))}}
.pj-live-perf{display:flex;gap:10px;width:100%;margin:4px 0 14px}
.pj-live-perf span{flex:1;display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,.7);border:1px solid var(--pj-line);border-radius:14px;padding:8px 4px;color:var(--pj-mute);font-size:11px;text-transform:uppercase;letter-spacing:.06em;text-align:center}
.pj-live-perf b{font:700 28px var(--pj-num);color:var(--pj-a);letter-spacing:0}.pj-live-perf .hot b{color:#ef4444}
.pj-players{display:grid;gap:12px;width:100%}
.pj-player{display:flex;gap:14px;align-items:center;background:rgba(255,255,255,.82);border:1px solid var(--pj-line);border-left:5px solid var(--c);border-radius:18px;padding:12px;animation:pjFlip .7s cubic-bezier(.2,1,.3,1) both}
@keyframes pjFlip{from{opacity:0;transform:perspective(600px) rotateX(-50deg) translateY(20px)}}
.pj-pl-body{min-width:0;flex:1}
.pj-pl-name{font:700 clamp(20px,2vw,26px) var(--pj-num);overflow-wrap:anywhere}
.pj-pl-meta{color:var(--pj-mute);font-size:13px}
.pj-pl-stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;font-size:12px;color:var(--pj-mute)}
.pj-pl-stats b{color:var(--pj-a);font:700 20px var(--pj-num);margin-right:3px}
.pj-bar-track{height:6px;background:#e3ecff;border-radius:99px;overflow:hidden;margin-top:6px}
.pj-bar-fill{height:100%;background:linear-gradient(90deg,var(--pj-a),var(--pj-b));border-radius:99px;transition:width 1.2s cubic-bezier(.2,1,.3,1) .8s}
.pj-form{display:flex;gap:4px;margin-top:8px}
.pj-form i{font:700 12px var(--pj-num);font-style:normal;width:22px;height:22px;border-radius:7px;display:grid;place-items:center;color:#fff;animation:pjPopChip .4s cubic-bezier(.2,1.6,.4,1) both}
.pj-form .w{background:#22c55e}.pj-form .l{background:#ef4444}
@keyframes pjPopChip{from{transform:scale(0)}}

/* middle column */
.pj-mid{display:flex;flex-direction:column;align-items:center;gap:14px;padding-top:26px;min-width:0;animation:pjRise .8s cubic-bezier(.2,1,.3,1) .3s both}
.pj-vs{font:800 56px var(--pj-num);color:var(--pj-a);animation:pjVs 2.4s ease-in-out infinite}
@keyframes pjVs{50%{transform:scale(1.12);text-shadow:0 0 24px rgba(29,78,216,.45)}}
.pj-gamechip{background:var(--pj-a);color:#fff;font:700 18px var(--pj-num);letter-spacing:.1em;text-transform:uppercase;padding:4px 16px;border-radius:999px}
.pj-card-lite{width:100%;background:rgba(255,255,255,.74);border:1px solid #fff;border-radius:16px;padding:10px 12px;box-shadow:0 12px 26px -20px rgba(30,64,175,.6)}
.pj-share-l{display:flex;justify-content:space-between;width:100%;color:var(--pj-mute);font-size:12px;margin-bottom:6px;font-weight:600}
.pj-share-l span:first-child,.pj-share-l span:last-child{font:700 20px var(--pj-num);color:var(--pj-ink);min-width:28px}
.pj-share,.pj-mom{position:relative;display:flex;width:100%;height:12px;border-radius:99px;overflow:hidden;background:#e3ecff}
.pj-share .a,.pj-mom .a{background:var(--pj-a);transition:width .7s cubic-bezier(.2,1,.3,1)}
.pj-share .b,.pj-mom .b{background:var(--pj-b);transition:width .7s cubic-bezier(.2,1,.3,1)}
.pj-mom{overflow:visible}.pj-mom i{position:absolute;top:-4px;width:6px;height:20px;border-radius:4px;background:#fff;border:2px solid var(--pj-ink);transform:translateX(-50%);transition:left .7s cubic-bezier(.2,1.4,.3,1)}
.pj-games{width:100%;border-collapse:collapse;font-family:var(--pj-num);font-size:30px;text-align:center}
.pj-games tr{animation:pjRise .5s ease-out both}
.pj-games td,.pj-games th{padding:5px}.pj-games th{color:var(--pj-mute);font-size:16px;font-weight:600}
.pj-games td.w{color:var(--pj-gold);font-weight:800;text-shadow:0 2px 10px rgba(242,183,5,.5)}
.pj-games tr.cur th{color:var(--pj-a)}.pj-games tr.cur td{color:var(--pj-ink)}
.pj-recent{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.pj-recent i{width:14px;height:14px;border-radius:50%;animation:pjPopChip .35s cubic-bezier(.2,1.6,.4,1) both}
.pj-recent .a{background:var(--pj-a)}.pj-recent .b{background:var(--pj-b)}.pj-recent .latest{box-shadow:0 0 0 4px rgba(15,23,42,.12)}
.pj-perf{text-align:center;width:100%}.pj-perf small{display:block;color:var(--pj-mute)}
.pj-perf b{font:700 32px var(--pj-num);color:var(--pj-a)}.pj-perf em{display:block;font-style:normal;color:var(--pj-mute)}

/* edge flash + shuttle */
.pj-flash{position:fixed;inset:0;pointer-events:none;z-index:15;animation:pjFlash .7s ease-out forwards}
.pj-flash.a{background:radial-gradient(70% 90% at 0% 50%,rgba(29,78,216,.32),transparent 70%)}
.pj-flash.b{background:radial-gradient(70% 90% at 100% 50%,rgba(6,182,212,.36),transparent 70%)}
@keyframes pjFlash{from{opacity:1}to{opacity:0}}
.pj-flight{position:fixed;left:0;top:44%;width:100%;height:0;pointer-events:none;z-index:25}
.pj-flight.ltr{--x0:12vw;--x1:84vw;--r0:35deg;--r1:140deg}
.pj-flight.rtl{--x0:84vw;--x1:12vw;--r0:-35deg;--r1:-140deg}
.pj-sh-x{position:absolute;left:0;top:0;animation:pjShX .85s linear both}
.pj-sh-y{animation:pjShY .85s linear both}
.pj-sh-r{animation:pjShR .85s linear both;filter:drop-shadow(0 10px 10px rgba(30,64,175,.35))}
@keyframes pjShX{from{transform:translateX(var(--x0))}to{transform:translateX(var(--x1))}}
@keyframes pjShY{0%{transform:translateY(8vh);animation-timing-function:cubic-bezier(.15,.7,.4,1)}45%{transform:translateY(-26vh);animation-timing-function:cubic-bezier(.6,0,.85,.35)}100%{transform:translateY(12vh);opacity:0}}
@keyframes pjShR{from{transform:rotate(var(--r0))}to{transform:rotate(var(--r1))}}

/* intro */
.pj-intro{position:fixed;inset:0;z-index:50;overflow:hidden;cursor:pointer;animation:pjIntroOut .5s ease-in 2.5s forwards}
.pj-in{position:absolute;inset:0;display:flex;align-items:center;color:#fff}
.pj-in.a{background:linear-gradient(135deg,#1e3a8a,#2563eb);clip-path:polygon(0 0,58% 0,42% 100%,0 100%);animation:pjSlideL .7s cubic-bezier(.2,1,.3,1) both;justify-content:flex-start;padding-left:7vw}
.pj-in.b{background:linear-gradient(135deg,#0891b2,#22d3ee);clip-path:polygon(58% 0,100% 0,100% 100%,42% 100%);animation:pjSlideR .7s cubic-bezier(.2,1,.3,1) both;justify-content:flex-end;padding-right:7vw;text-align:right}
@keyframes pjSlideL{from{transform:translateX(-100%)}}@keyframes pjSlideR{from{transform:translateX(100%)}}
.pj-in-team{display:flex;flex-direction:column;gap:10px;max-width:36vw;animation:pjRise .7s cubic-bezier(.2,1,.3,1) .5s both}
.pj-in.b .pj-in-team{align-items:flex-end}
.pj-in-team h2{margin:0;font:800 clamp(30px,6vw,84px)/1 var(--pj-num);overflow-wrap:anywhere}
.pj-in-team small{font-size:clamp(13px,1.6vw,20px);opacity:.9}
.pj-in-vs{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center}
.pj-in-vs span{font:800 clamp(64px,12vw,170px) var(--pj-num);color:#fff;text-shadow:0 8px 40px rgba(15,23,42,.5);animation:pjSlam .6s cubic-bezier(.2,1.8,.4,1) 1s both}
.pj-in-vs i{position:absolute;width:30vmin;aspect-ratio:1;border-radius:50%;border:6px solid #fff;animation:pjRing2 .9s ease-out 1.1s both}
@keyframes pjSlam{from{transform:scale(4);opacity:0}}
@keyframes pjRing2{from{transform:scale(.2);opacity:.9}to{transform:scale(3);opacity:0}}
.pj-in-foot{position:absolute;left:0;right:0;bottom:max(24px,env(safe-area-inset-bottom));text-align:center;color:#fff;font:700 clamp(15px,2vw,26px) var(--pj-num);letter-spacing:.12em;text-transform:uppercase;text-shadow:0 2px 12px rgba(15,23,42,.5);animation:pjRise .6s ease-out 1.4s both}
@keyframes pjIntroOut{to{opacity:0;visibility:hidden;transform:scale(1.06)}}
@media (max-width:700px){.pj-in-team{max-width:40vw}.pj-in-team .pj-in-av,.pj-in-team img,.pj-in-team>div{transform:scale(.7);transform-origin:left center}.pj-in.b .pj-in-team>div,.pj-in.b .pj-in-team img{transform-origin:right center}}

/* celebrations */
.pj-cele{position:fixed;inset:0;z-index:40;display:grid;place-items:center;cursor:pointer;background:rgba(234,241,255,.82);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);animation:pjFade .35s ease-out;padding:16px}
.pj-cele.match{background:rgba(255,248,222,.86)}
@keyframes pjFade{from{opacity:0}}
.pj-rays{position:absolute;left:50%;top:50%;width:160vmax;height:160vmax;margin:-80vmax 0 0 -80vmax;background:repeating-conic-gradient(from 0deg,rgba(29,78,216,.14) 0 8deg,transparent 8deg 20deg);animation:pjSpin 24s linear infinite;pointer-events:none;-webkit-mask:radial-gradient(circle,#000 0,transparent 55%);mask:radial-gradient(circle,#000 0,transparent 55%)}
.pj-cele.match .pj-rays{background:repeating-conic-gradient(from 0deg,rgba(242,183,5,.3) 0 8deg,transparent 8deg 20deg)}
.pj-cele-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;animation:pjSlam2 .7s cubic-bezier(.2,1.6,.4,1) both;max-width:100%}
@keyframes pjSlam2{from{transform:scale(.3) rotate(-6deg);opacity:0}}
.pj-cele-card small{font:700 clamp(18px,3vw,30px) var(--pj-num);letter-spacing:.2em;text-transform:uppercase;color:var(--pj-a)}
.pj-cele.match .pj-cele-card small{color:#9a6b00}
.pj-cele-card h2{margin:0;font:800 clamp(44px,10vw,130px)/1 var(--pj-num);overflow-wrap:anywhere}
.pj-cele-score{font:800 clamp(40px,7vw,96px) var(--pj-num);color:var(--pj-a)}
.pj-cele-sub{color:var(--pj-mute);font-size:clamp(14px,1.6vw,20px)}
.pj-cele-hint{color:var(--pj-mute);font-size:13px;margin-top:6px}
.pj-trophy{font-size:clamp(64px,10vw,120px);animation:pjBob 1.2s ease-in-out infinite,pjSlam2 .8s cubic-bezier(.2,1.6,.4,1) both;filter:drop-shadow(0 12px 20px rgba(242,183,5,.5))}
.pj-cele-av{animation:pjHalo 1.6s ease-in-out infinite}
@keyframes pjHalo{50%{box-shadow:0 0 0 18px rgba(242,183,5,.25)}}
.pj-confetti{position:fixed;inset:0;overflow:hidden;pointer-events:none}
.pj-confetti i{position:absolute;top:-24px;animation-name:pjFall;animation-timing-function:linear;animation-fill-mode:both}
@keyframes pjFall{to{transform:translate(var(--dx),110vh) rotate(var(--rot))}}

/* responsive */
@media (max-width:1000px){
  .pj-grid{grid-template-columns:minmax(0,1fr);padding:18px 16px 32px;gap:20px}
  .pj-mid{order:-1;padding-top:6px}
  .pj-vs{font-size:44px}
  .pj-score{font-size:clamp(96px,30vw,200px)}
  .pj-team.a,.pj-team.b{animation-name:pjRise}
}
@media (max-width:560px){
  .pj-bar{gap:10px;padding-left:14px;padding-right:14px}
  .pj-btn{padding:8px 14px;font-size:13px}
  .pj-team{padding:18px 14px;border-radius:22px}
  .pj-live-perf b{font-size:24px}
  .pj-card-sc .n{font-size:46px}
  .pj-ribbon{font-size:16px}
}

@media (prefers-reduced-motion:reduce){
  .pj *,.pj *::before,.pj *::after{animation:none!important;transition:none!important}
  .roll-old,.pj-confetti,.pj-sparks,.pj-flight,.pj-ringburst,.pj-bg .blob{display:none!important}
  .pj-bg .court *{stroke-dashoffset:0}
}
`;