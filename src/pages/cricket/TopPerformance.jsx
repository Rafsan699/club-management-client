import React, { useEffect, useMemo, useState } from 'react';
import API from '../../services/api';
import { CB_CSS, PlayerAvatar, ProfileModal, buildInningsData, computePotm } from './MatchHistoryView';

/* =====================================================================
 *  TopPerformance  (client, read-only)
 *  Leaderboards of a whole tournament, player profile on tap:
 *     Most Runs · Most Wickets · Most Sixes · Most Fours · Man of the Match
 *
 *  Usage (schedule pages):
 *     {showTop && <TopPerformance tournamentId={tournamentId} tournamentName={name} onClose={() => setShowTop(false)} />}
 *
 *  Data:
 *   - GET  /api/cricket/live-score/tournament/:id/histories  -> ball-by-ball log of every match
 *   - POST /api/cricket/live-score/player-profiles           -> photo + career stats of the listed players
 *  Numbers are calculated here from the ball logs with the SAME functions the match page uses,
 *  so a Man of the Match here is always the same player the match page shows.
 *  Refreshes by itself every 30 seconds while the page is open.
 * ===================================================================== */

const TOP_N = 10;
const fmtOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;

// ball logs of all matches -> one row per player
export const aggregate = (matches) => {
  const P = new Map();
  const get = (p, team) => {
    if (!p || !p.key) return null;
    if (!P.has(p.key)) {
      P.set(p.key, {
        key: p.key, name: p.name || '', dept: p.dept || '', batch: p.batch || '', id: p.id || '', team: team || '',
        games: new Set(), inn: 0, runs: 0, balls: 0, fours: 0, sixes: 0, hs: 0,
        wk: 0, legal: 0, bRuns: 0, mom: 0
      });
    }
    const r = P.get(p.key);
    if (team && !r.team) r.team = team;
    return r;
  };

  (matches || []).forEach((m) => {
    const log = Array.isArray(m.ballLog) ? m.ballLog : [];
    if (!log.length) return;
    const names = [];
    log.forEach((e) => { if (e.innings && !names.includes(e.innings)) names.push(e.innings); });
    const inningsList = names.map((name) => ({ name, ...buildInningsData(log.filter((e) => e.innings === name)) }));

    inningsList.forEach((inn) => {
      inn.batters.forEach((b) => {
        const r = get(b, inn.battingTeam);
        if (!r) return;
        r.games.add(m.matchId);
        r.runs += b.runs; r.balls += b.balls; r.fours += b.fours; r.sixes += b.sixes;
        if (b.balls > 0 || b.runs > 0 || b.out) { r.inn += 1; r.hs = Math.max(r.hs, b.runs); }
      });
      inn.bowlers.forEach((b) => {
        const r = get(b, inn.bowlingTeam);
        if (!r) return;
        r.games.add(m.matchId);
        r.wk += b.wickets; r.legal += b.legal; r.bRuns += b.runs;
      });
    });

    // Man of the Match only once the result is known (same rule as the match page)
    if (m.result) {
      const potm = computePotm(log, inningsList, m.result);
      const w = potm && potm.board && potm.board[0];
      const r = w && P.get(w.key);
      if (r) r.mom += 1;
    }
  });
  return [...P.values()];
};

const sr = (r) => (r.balls > 0 ? ((r.runs / r.balls) * 100).toFixed(1) : '0.0');
const econ = (r) => (r.legal > 0 ? ((r.bRuns / r.legal) * 6).toFixed(2) : '0.00');

const BOARDS = [
  {
    id: 'runs', tl: 'Most Runs', ts: 'Runs', unit: 'RUNS', lead: 'LEADING RUN-SCORER',
    val: (r) => r.runs, ok: (r) => r.runs > 0,
    tie: (a, b) => a.balls - b.balls,
    sub: (r) => `${r.inn} inn · SR ${sr(r)} · HS ${r.hs}`
  },
  {
    id: 'wkts', tl: 'Most Wickets', ts: 'Wkts', unit: 'WICKETS', lead: 'LEADING WICKET-TAKER',
    val: (r) => r.wk, ok: (r) => r.wk > 0,
    tie: (a, b) => a.bRuns - b.bRuns,
    sub: (r) => `${fmtOvers(r.legal)} ov · ${r.bRuns} runs · Econ ${econ(r)}`
  },
  {
    id: 'sixes', tl: 'Most Sixes', ts: 'Sixes', unit: 'SIXES', lead: 'MOST SIXES',
    val: (r) => r.sixes, ok: (r) => r.sixes > 0,
    tie: (a, b) => b.runs - a.runs,
    sub: (r) => `${r.runs} runs · ${r.balls} balls`
  },
  {
    id: 'fours', tl: 'Most Fours', ts: 'Fours', unit: 'FOURS', lead: 'MOST FOURS',
    val: (r) => r.fours, ok: (r) => r.fours > 0,
    tie: (a, b) => b.runs - a.runs,
    sub: (r) => `${r.runs} runs · ${r.balls} balls`
  },
  {
    id: 'mom', tl: 'Man of the Match', ts: 'MoM', unit: 'AWARDS', lead: 'MOST MAN OF THE MATCH',
    val: (r) => r.mom, ok: (r) => r.mom > 0,
    tie: (a, b) => (b.runs + b.wk * 20) - (a.runs + a.wk * 20),
    sub: (r) => `${r.games.size} match${r.games.size === 1 ? '' : 'es'} played`
  }
];

// sorted + ranked (equal numbers share the same rank)
export const rankBoard = (rows, board) => {
  const list = rows.filter(board.ok).sort((a, b) => board.val(b) - board.val(a) || board.tie(a, b));
  let rank = 0;
  return list.map((r, i) => {
    if (i === 0 || board.val(r) !== board.val(list[i - 1])) rank = i + 1;
    return { r, rank };
  });
};

const TP_CSS = `
.tp-hero{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;width:100%;padding:18px;border:0;border-radius:20px;color:#fff;font:inherit;text-align:left;cursor:pointer;background:linear-gradient(135deg,var(--g1),var(--g2));box-shadow:var(--sh)}
.tp-hero:after{content:"";position:absolute;right:-50px;top:-70px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.12)}
.tp-hero .sq-av{position:relative;z-index:1;width:72px;height:72px;font-size:24px;border:3px solid rgba(255,255,255,.65)}
.tp-hero .tx{position:relative;z-index:1;min-width:0;flex:1}
.tp-hero .lb{font-size:10.5px;font-weight:800;letter-spacing:1.3px;opacity:.85}
.tp-hero .n{margin-top:2px;font-size:20px;font-weight:800;line-height:1.2;overflow-wrap:anywhere}
.tp-hero .s{margin-top:3px;font-size:12px;opacity:.92}
.tp-hero .big{position:relative;z-index:1;flex:none;text-align:center}
.tp-hero .big b{display:block;font-size:42px;font-weight:800;line-height:1}
.tp-hero .big span{font-size:10.5px;font-weight:800;letter-spacing:1px;opacity:.9}
.tp-row{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;border:0;background:transparent;color:var(--ink);font:inherit;text-align:left;cursor:pointer;transition:background .15s}
.tp-row+.tp-row{border-top:1px solid var(--line)}.tp-row:hover,.tp-row:active{background:var(--soft)}
.tp-rk{flex:none;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--soft);border:1px solid var(--line);color:var(--mute);font-size:12px;font-weight:800}
.tp-rk.r1{background:linear-gradient(135deg,#fde68a,#f5b301);border-color:transparent;color:#5b4300}
.tp-rk.r2{background:linear-gradient(135deg,#f1f5f9,#cbd5e1);border-color:transparent;color:#334155}
.tp-rk.r3{background:linear-gradient(135deg,#fed7aa,#e08a3c);border-color:transparent;color:#5a2e00}
.tp-nm{flex:1;min-width:0}
.tp-nm b{display:block;font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-nm small{display:block;margin-top:1px;font-size:11.5px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-v{flex:none;text-align:right}.tp-v b{display:block;font-size:22px;font-weight:800;color:var(--g1);line-height:1.1}.tp-v span{font-size:9.5px;font-weight:800;letter-spacing:.8px;color:var(--mute)}
.tp-more{display:block;width:100%;padding:12px;border:0;border-top:1px solid var(--line);background:var(--soft);color:var(--g1);font:inherit;font-size:13px;font-weight:700;cursor:pointer}
.tp-foot{text-align:center;color:var(--mute);font-size:12px;padding:4px 0 0}
@media(max-width:400px){.tp-hero{padding:14px;gap:10px}.tp-hero .sq-av{width:56px;height:56px;font-size:19px}.tp-hero .n{font-size:17px}.tp-hero .big b{font-size:32px}.tp-row{padding:10px 10px;gap:9px}.tp-nm b{font-size:14px}.tp-v b{font-size:19px}}
`;

const TopPerformance = ({ tournamentId, tournamentName = '', onClose }) => {
  const [matches, setMatches] = useState([]);
  const [name, setName] = useState(tournamentName);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState('runs');
  const [showAll, setShowAll] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!tournamentId) return undefined;
    let cancelled = false;
    const load = async (silent) => {
      try {
        const res = await API.get(`/api/cricket/live-score/tournament/${tournamentId}/histories`);
        if (cancelled) return;
        setMatches(res.data.matches || []);
        if (res.data.tournamentName) setName(res.data.tournamentName);
        setFailed(false);
      } catch (err) {
        console.error('Could not load top performance:', err);
        if (!cancelled && !silent) setFailed(true);
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    };
    load(false);
    const timer = setInterval(() => load(true), 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [tournamentId]);

  const rows = useMemo(() => aggregate(matches), [matches]);
  const boards = useMemo(() => BOARDS.map((b) => ({ b, list: rankBoard(rows, b) })), [rows]);

  // players that are visible in the top lists -> ask for their profile (photo + stats) once
  const wanted = useMemo(() => {
    const m = new Map();
    boards.forEach(({ list }) => list.slice(0, TOP_N).forEach(({ r }) => m.set(r.key, r)));
    return [...m.values()];
  }, [boards]);
  const wantedSig = wanted.map((r) => r.key).sort().join('|');

  useEffect(() => {
    if (!wanted.length) return;
    const need = wanted.filter((r) => !(r.key in profiles));
    if (!need.length) return;
    let cancelled = false;
    API.post('/api/cricket/live-score/player-profiles', {
      players: need.map((r) => ({ key: r.key, name: r.name, dept: r.dept, batch: r.batch, id: r.id }))
    }).then((res) => {
      if (cancelled) return;
      const got = (res.data && res.data.profiles) || {};
      setProfiles((prev) => {
        const next = { ...prev };
        need.forEach((r) => { next[r.key] = got[r.key] || null; });   // null = no profile found
        return next;
      });
    }).catch((err) => console.error('Could not load player profiles:', err));
    return () => { cancelled = true; };
  }, [wantedSig]);   // eslint-disable-line react-hooks/exhaustive-deps

  const view = (r) => {
    const prof = profiles[r.key];
    return { ...r, ...(prof || {}), key: r.key, name: r.name, team: r.team, profileFound: r.key in profiles ? Boolean(prof) : undefined };
  };

  const cur = boards.find((x) => x.b.id === tab) || boards[0];
  const shown = showAll ? cur.list : cur.list.slice(0, TOP_N);
  const lead = shown[0];

  return (
    <div className="cb-root">
      <style>{CB_CSS}</style>
      <style>{TP_CSS}</style>

      <div className="cb-bar">
        <button type="button" className="cb-back" onClick={onClose} aria-label="Back">&larr;</button>
        <div className="cb-bar-t">
          <b>Top Performance</b>
          <span>{name ? name.toUpperCase() : 'TOURNAMENT'}</span>
        </div>
      </div>

      <div className="cb-wrap">
        <div className="cb-tabs">
          {boards.map(({ b }) => (
            <button
              key={b.id}
              type="button"
              className={`cb-tab${tab === b.id ? ' on' : ''}`}
              onClick={() => { setTab(b.id); setShowAll(false); }}
            >
              <span className="tl">{b.tl}</span>
              <span className="ts">{b.ts}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="cb-stack"><div className="cb-skel" /><div className="cb-skel" style={{ height: 220 }} /></div>
        ) : failed ? (
          <div className="cb-card cb-empty">Could not load the data. Please try again later.</div>
        ) : cur.list.length === 0 ? (
          <div className="cb-card cb-empty">
            {rows.length === 0
              ? 'No match data yet. Top performers will appear here as soon as matches are played.'
              : `No ${cur.b.tl.toLowerCase()} yet.`}
          </div>
        ) : (
          <div className="cb-stack cb-pane" key={cur.b.id}>
            {lead && (
              <button type="button" className="tp-hero" onClick={() => setOpen(view(lead.r))}>
                <PlayerAvatar p={view(lead.r)} />
                <div className="tx">
                  <div className="lb">{cur.b.lead}</div>
                  <div className="n">{lead.r.name}</div>
                  <div className="s">{[lead.r.team, cur.b.sub(lead.r)].filter(Boolean).join(' · ')}</div>
                </div>
                <div className="big"><b>{cur.b.val(lead.r)}</b><span>{cur.b.unit}</span></div>
              </button>
            )}

            <div className="cb-card cb-flush">
              {shown.map(({ r, rank }) => (
                <button key={r.key} type="button" className="tp-row" onClick={() => setOpen(view(r))}>
                  <span className={`tp-rk${rank <= 3 ? ` r${rank}` : ''}`}>{rank}</span>
                  <PlayerAvatar p={view(r)} />
                  <span className="tp-nm">
                    <b>{r.name}</b>
                    <small>{[r.team, cur.b.sub(r)].filter(Boolean).join(' · ')}</small>
                  </span>
                  <span className="tp-v"><b>{cur.b.val(r)}</b><span>{cur.b.unit}</span></span>
                </button>
              ))}
              {cur.list.length > TOP_N && (
                <button type="button" className="tp-more" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Show top 10' : `Show all ${cur.list.length} players`}
                </button>
              )}
            </div>

            <div className="tp-foot">Based on {matches.length} match{matches.length === 1 ? '' : 'es'} · updates automatically</div>
          </div>
        )}
      </div>

      {open && <ProfileModal p={open} teamName={open.team} onClose={() => setOpen(null)} />}
    </div>
  );
};

export default TopPerformance;