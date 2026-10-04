import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import API from '../../services/api';   // ADDED: used by the Playing XI / player profile (same path LiveMatchCenter uses)

/* =====================================================================
 *  MatchHistoryView  (client side, read-only)
 *  Shows the same match history that the Live Score Control panel records:
 *  Summary, 1st Innings, 2nd Innings, Insights, Broadcast (+ Squads).
 *
 *  UPDATED for live matches:
 *   - topSlot    : anything rendered above the tabs (the TV scoreboard from LiveMatchCenter)
 *   - squadsSlot : adds a "Squads" tab (and shows squads before the match has history)
 *   - ADDED: <PlayingXISquads/> = Playing XI of BOTH teams with player profiles (tap a player).
 *            Pass  matchId  to MatchHistoryView and the Squads tab appears by itself.
 *   - while a match is live, the current innings tab opens automatically and
 *     follows the match when the 2nd innings / super over starts
 *
 *  BROADCAST v3 (for every viewer, live):
 *   - FIXED SIZE stage: animations never resize / move the panel
 *   - premium glass design
 *   - new batter / opening pair / new bowler profile scenes
 *   - out batter innings-history scene
 *   - over graph + insight graph scenes, idle rotation between balls
 *   - professional scoreboard under the stage
 *   - live balls are QUEUED, so a running animation is never cut in the middle
 * ===================================================================== */

const fmtOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;

// Turns the raw ball-by-ball entries of ONE innings into scorecard data
export const buildInningsData = (entries) => {
  const batters = new Map();
  const batOrder = [];
  const bowlers = new Map();
  const bowlOrder = [];
  const overMap = new Map();
  const fow = [];
  const extras = { wd: 0, nb: 0, b: 0, lb: 0, pen: 0 };
  let runs = 0, wickets = 0, legalBalls = 0, fours = 0, sixes = 0;

  const getBat = (p) => {
    if (!p) return null;
    if (!batters.has(p.key)) {
      batters.set(p.key, { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, out: null, retired: false });
      batOrder.push(p.key);
    }
    return batters.get(p.key);
  };
  const getBowl = (p) => {
    if (!p) return null;
    if (!bowlers.has(p.key)) {
      bowlers.set(p.key, { ...p, legal: 0, runs: 0, wickets: 0, wd: 0, nb: 0, maidens: 0, overRuns: {} });
      bowlOrder.push(p.key);
    }
    return bowlers.get(p.key);
  };
  const getOver = (i) => {
    if (!overMap.has(i)) overMap.set(i, { over: i, items: [], runs: 0, wickets: 0, legal: 0, bowlers: [], endScore: null });
    return overMap.get(i);
  };

  entries.forEach((e) => {
    if (e.kind === 'retire') {
      const b = getBat(e.player);
      if (b) b.retired = true;
      getBat(e.replacedBy);
      getOver(e.over).items.push(e);
      return;
    }
    if (e.kind === 'adjust') {
      runs += e.runs;
      extras.pen += e.penalty || 0;
      const ov = getOver(e.over);
      ov.runs += e.runs;
      ov.items.push(e);
      ov.endScore = e.scoreAfter;
      return;
    }

    const s = getBat(e.striker);
    getBat(e.nonStriker);
    if (s) {
      if (e.faced) s.balls += 1;
      s.runs += e.batRuns;
      if (e.batRuns === 4) { s.fours += 1; fours += 1; }
      if (e.batRuns === 6) { s.sixes += 1; sixes += 1; }
    }

    runs += e.totalRuns;
    if (e.legal) legalBalls += 1;
    if (e.extraKind) extras[e.extraKind] += e.extraKind === 'nb' ? 1 : e.extraRuns;

    const ov = getOver(e.over);
    const bw = getBowl(e.bowler);
    if (bw) {
      if (e.legal) bw.legal += 1;
      bw.runs += e.bowlerRuns;
      if (e.extraKind === 'wd') bw.wd += 1;
      if (e.extraKind === 'nb') bw.nb += 1;
      const rec = bw.overRuns[e.over] || (bw.overRuns[e.over] = { runs: 0, legal: 0 });
      rec.runs += e.bowlerRuns;
      if (e.legal) rec.legal += 1;
      if (!ov.bowlers.includes(bw.name)) ov.bowlers.push(bw.name);
    }
    ov.items.push(e);
    ov.runs += e.totalRuns;
    if (e.legal) ov.legal += 1;
    ov.endScore = e.scoreAfter;

    if (e.wicket) {
      wickets += 1;
      ov.wickets += 1;
      if (bw && e.wicket.bowlerCredited) bw.wickets += 1;
      const ob = getBat(e.wicket.batter);
      if (ob) ob.out = { howOut: e.wicket.howOut, bowler: e.wicket.bowlerCredited && e.bowler ? e.bowler.name : '', helper: e.wicket.helper };
      fow.push({
        score: e.scoreAfter.runs,
        wkt: e.scoreAfter.wickets,
        batter: e.wicket.batter ? e.wicket.batter.name : '',
        over: `${e.over}.${(e.legalBefore % 6) + (e.legal ? 1 : 0)}`
      });
    }
  });

  bowlers.forEach((bw) => {
    Object.values(bw.overRuns).forEach((o) => { if (o.legal === 6 && o.runs === 0) bw.maidens += 1; });
  });

  const first = entries.find((e) => e.battingTeam) || {};
  return {
    battingTeam: first.battingTeam || '',
    bowlingTeam: first.bowlingTeam || '',
    runs, wickets, legalBalls, fours, sixes,
    extras: { ...extras, total: extras.wd + extras.nb + extras.b + extras.lb + extras.pen },
    batters: batOrder.map((k) => batters.get(k)),
    bowlers: bowlOrder.map((k) => bowlers.get(k)),
    overs: [...overMap.values()].sort((a, b) => a.over - b.over),
    fow,
    getBatter: (key) => batters.get(key),
    getBowler: (key) => bowlers.get(key)
  };
};

const ballLabel = (e) => `${e.over}.${(e.legalBefore % 6) + (e.kind === 'ball' && e.legal ? 1 : 0)}`;

const dismissalText = (b) => {
  if (b.out) {
    const { howOut, bowler, helper } = b.out;
    if (howOut === 'bowled') return `b ${bowler}`;
    if (howOut === 'lbw') return `lbw b ${bowler}`;
    if (howOut === 'catch out') return `c ${helper || 'sub'} b ${bowler}`;
    if (howOut === 'stumping') return `st ${helper || 'wk'} b ${bowler}`;
    if (howOut === 'hit wicket') return `hit wicket b ${bowler}`;
    return `${howOut}${helper ? ` (${helper})` : ''}`;
  }
  return b.retired ? 'retired' : 'not out';
};

const describeBall = (e) => {
  if (e.kind === 'adjust') return `Extra runs added: +${e.runs}${e.penalty ? ` (penalty ${e.penalty})` : ''}`;
  if (e.kind === 'retire') return `${(e.player && e.player.name) || 'Batter'} retired, ${(e.replacedBy && e.replacedBy.name) || 'new batter'} came in`;
  const bw = (e.bowler && e.bowler.name) || 'Bowler';
  const st = (e.striker && e.striker.name) || 'Batter';
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  let t = `${bw} to ${st}: `;
  if (e.extraKind === 'wd') t += `Wide, ${plural(e.totalRuns, 'run')}`;
  else if (e.extraKind === 'nb') t += `No ball${e.batRuns ? `, ${e.batRuns} off the bat` : ''} (${plural(e.totalRuns, 'run')})`;
  else if (e.extraKind === 'b') t += plural(e.totalRuns, 'bye');
  else if (e.extraKind === 'lb') t += plural(e.totalRuns, 'leg bye');
  else if (e.batRuns === 0) t += 'dot ball';
  else if (e.batRuns === 4) t += 'FOUR';
  else if (e.batRuns === 6) t += 'SIX';
  else t += plural(e.batRuns, 'run');
  if (e.wicket) {
    const w = e.wicket;
    t += ` — WICKET! ${(w.batter && w.batter.name) || 'Batter'} (${w.howOut}${w.helper ? `, ${w.helper}` : ''})`;
  }
  return t;
};


const rr = (runs, balls) => (balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00');

/* =====================================================================
 *  PLAYER OF THE MATCH  (calculated live from the ball-by-ball log)
 *  Impact-points model: batting + bowling + fielding. It re-runs on every
 *  new ball, so the leader changes live; when the result is known the
 *  winner is picked from the winning team (like official awards).
 * ===================================================================== */
export const computePotm = (log, inningsList, result) => {
  const P = new Map();
  const get = (p, team) => {
    if (!p || !p.key) return null;
    if (!P.has(p.key)) P.set(p.key, { key: p.key, name: p.name, batch: p.batch, dept: p.dept, team: team || '', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, wk: 0, bRuns: 0, legal: 0, maid: 0, dots: 0, lbwb: 0, ct: 0, st: 0, ro: 0, bat: false, bowl: false });
    const r = P.get(p.key);
    if (team && !r.team) r.team = team;
    return r;
  };
  inningsList.forEach((inn) => {
    inn.batters.forEach((b) => { const r = get(b, inn.battingTeam); if (!r) return; r.bat = true; r.runs += b.runs; r.balls += b.balls; r.fours += b.fours; r.sixes += b.sixes; if (b.out) r.out = true; });
    inn.bowlers.forEach((b) => { const r = get(b, inn.bowlingTeam); if (!r) return; r.bowl = true; r.wk += b.wickets; r.bRuns += b.runs; r.legal += b.legal; r.maid += b.maidens; });
  });
  const byName = new Map();
  P.forEach((r) => byName.set(r.name, r));
  log.forEach((e) => {
    if (e.kind === 'retire' || e.kind === 'adjust') return;
    const bw = e.bowler && P.get(e.bowler.key);
    if (bw && e.legal && e.totalRuns === 0) bw.dots += 1;
    if (e.wicket) {
      const w = e.wicket;
      if (bw && w.bowlerCredited && (w.howOut === 'bowled' || w.howOut === 'lbw')) bw.lbwb += 1;
      const h = w.helper && byName.get(w.helper);
      if (h) {
        if (w.howOut === 'catch out') h.ct += 1;
        else if (w.howOut === 'stumping') h.st += 1;
        else if (/run/i.test(w.howOut)) h.ro += 1;
      }
    }
  });
  const list = [...P.values()].map((r) => {
    let pts = r.runs + r.fours + r.sixes * 2;
    if (r.runs >= 100) pts += 16; else if (r.runs >= 50) pts += 8; else if (r.runs >= 30) pts += 4;
    if (r.out && r.runs === 0 && r.balls > 0) pts -= 2;
    if (r.balls >= 10) { const sr = (r.runs / r.balls) * 100; pts += sr >= 170 ? 6 : sr >= 150 ? 4 : sr >= 130 ? 2 : sr <= 60 ? -2 : 0; }
    pts += r.wk * 25 + r.lbwb * 8 + r.maid * 12 + r.dots;
    if (r.wk >= 5) pts += 16; else if (r.wk >= 4) pts += 8; else if (r.wk >= 3) pts += 4;
    if (r.legal >= 12) { const eco = (r.bRuns / r.legal) * 6; pts += eco <= 5 ? 6 : eco <= 6 ? 4 : eco <= 7 ? 2 : eco >= 11 ? -4 : eco >= 10 ? -2 : 0; }
    pts += r.ct * 8 + r.st * 12 + r.ro * 6;
    return { ...r, pts };
  }).filter((r) => r.pts > 0).sort((a, b) => b.pts - a.pts || (b.runs + b.wk * 20) - (a.runs + a.wk * 20));
  if (!list.length) return null;
  const m = /^(.+?)\s+won\b/i.exec(result || '');
  let pool = list;
  if (m) {
    const w = list.filter((r) => r.team && r.team.toLowerCase() === m[1].trim().toLowerCase());
    if (w.length) pool = w;
  }
  return { board: pool.slice(0, 3), final: !!result };
};

const statLine = (r) => [
  r.bat && r.balls > 0 ? `${r.runs} (${r.balls})` : '',
  r.bowl && r.legal > 0 ? `${r.wk}/${r.bRuns} (${fmtOvers(r.legal)})` : '',
  r.ct + r.st + r.ro > 0 ? `${r.ct + r.st + r.ro} fielding` : ''
].filter(Boolean).join('  ·  ');

const initials = (n) => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

/* =====================================================================
 *  DESIGN SYSTEM  -  premium light theme (shared with LiveMatchCenter)
 * ===================================================================== */
export const CB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.cb-root{--bg:#f3f6f9;--card:#fff;--ink:#0f1b2d;--mute:#64748b;--line:#e5eaf0;--soft:#f7f9fb;--g1:#0a6b4d;--g2:#12a37f;--tint:#e8f6f1;--red:#e5484d;--rtint:#fdecec;--blue:#2563eb;--vio:#7c3aed;--gold:#f5b301;--sh:0 1px 2px rgba(15,27,45,.05),0 10px 28px -14px rgba(15,27,45,.16);
  position:fixed;inset:0;z-index:3000;overflow-y:auto;background:radial-gradient(1200px 380px at 50% -120px,#dff3ec 0,transparent 70%),var(--bg);color:var(--ink);font-family:Inter,'Segoe UI',system-ui,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums;scroll-behavior:smooth}
.cb-root *{box-sizing:border-box}
.cb-bar{position:sticky;top:0;z-index:20;height:56px;display:flex;align-items:center;gap:12px;padding:0 14px;background:linear-gradient(120deg,var(--g1),var(--g2));color:#fff;box-shadow:0 6px 20px -8px rgba(10,107,77,.6)}
.cb-back{width:36px;height:36px;border:0;border-radius:12px;background:rgba(255,255,255,.18);color:#fff;font-size:18px;cursor:pointer;flex:none;transition:.2s}.cb-back:hover{background:rgba(255,255,255,.3);transform:translateX(-2px)}
.cb-bar-t{min-width:0;flex:1}.cb-bar-t b{display:block;font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cb-bar-t span{display:block;font-size:11px;font-weight:500;opacity:.85;letter-spacing:.6px}
.cb-wrap{max-width:920px;margin:0 auto;padding:16px 14px 48px}
.cb-stack{display:flex;flex-direction:column;gap:14px}
.cb-card{background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--sh);padding:16px}
.cb-flush{padding:0;overflow:hidden}
.cb-mute{color:var(--mute)}.cb-res{color:var(--g1);font-weight:700}
.cb-empty{padding:32px 16px;text-align:center;color:var(--mute);font-size:14px;line-height:1.7}
.cb-pane>*{animation:cbUp .5s cubic-bezier(.2,.7,.2,1) both}.cb-pane>*:nth-child(2){animation-delay:.06s}.cb-pane>*:nth-child(3){animation-delay:.12s}.cb-pane>*:nth-child(4){animation-delay:.18s}.cb-pane>*:nth-child(n+5){animation-delay:.24s}
.cb-tabs{position:sticky;top:56px;z-index:15;display:flex;gap:6px;overflow-x:auto;padding:10px 14px;margin:0 -14px 14px;background:rgba(243,246,249,.88);backdrop-filter:blur(10px);scrollbar-width:none}.cb-tabs::-webkit-scrollbar{display:none}
.cb-tab{flex:none;padding:8px 16px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--mute);font:600 13px Inter,sans-serif;cursor:pointer;transition:.25s}
.cb-tab:hover{color:var(--ink);transform:translateY(-1px)}.cb-tab.on{background:linear-gradient(120deg,var(--g1),var(--g2));border-color:transparent;color:#fff;box-shadow:0 6px 14px -6px rgba(10,107,77,.7)}
.cb-tab .ts{display:none}
@media(max-width:480px){.cb-tabs{gap:4px;overflow-x:hidden}.cb-tab{flex:1 1 auto;min-width:0;padding:8px 6px;font-size:12px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cb-tab .tl{display:none}.cb-tab .ts{display:inline}}
@media(max-width:360px){.cb-tabs{gap:3px}.cb-tab{padding:8px 4px;font-size:11px}}
.cb-seg{display:inline-flex;padding:4px;gap:2px;margin-bottom:14px;background:#e6ecf1;border-radius:12px;max-width:100%}
.cb-pill{padding:7px 16px;border:0;border-radius:9px;background:none;color:var(--mute);font:600 13px Inter,sans-serif;cursor:pointer;transition:.25s}.cb-pill.on{background:#fff;color:var(--g1);box-shadow:0 2px 8px rgba(15,27,45,.12)}
.cb-sec{display:flex;align-items:center;gap:8px;padding:12px 16px;font-size:12px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--mute);border-bottom:1px solid var(--line);background:var(--soft)}
.cb-sec:before{content:'';width:4px;height:14px;border-radius:2px;background:linear-gradient(var(--g2),var(--g1))}
.cb-inn-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(120deg,var(--tint),#fff);border-bottom:1px solid var(--line);font-size:16px;font-weight:700}
.cb-inn-head small{display:block;font-size:12px;font-weight:500;color:var(--mute)}.cb-inn-head .sc{font-size:22px;font-weight:800;color:var(--g1);white-space:nowrap}.cb-inn-head .sc small{display:inline;margin-left:4px}
.cb-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.cb-tbl{width:100%;border-collapse:collapse;font-size:13px}
.cb-tbl th{padding:9px 10px;text-align:right;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--mute);background:var(--soft);white-space:nowrap}
.cb-tbl td{padding:11px 10px;text-align:right;border-top:1px solid var(--line);white-space:nowrap}
.cb-tbl tbody tr{transition:background .2s}.cb-tbl tbody tr:hover{background:var(--soft)}
.cb-tbl th:first-child,.cb-tbl td:first-child{text-align:left;padding-left:16px;white-space:normal;min-width:150px}.cb-tbl th:last-child,.cb-tbl td:last-child{padding-right:16px}
.cb-tbl td.r{font-weight:800;font-size:15px}.cb-tbl .sub{display:block;font-size:12px;color:var(--mute);margin-top:2px}.cb-tbl .sub.no{color:var(--g2);font-weight:600}
.cb-tbl tr.tot td{background:var(--tint);font-weight:700;color:var(--g1)}
.cb-pn{font-weight:600;color:var(--ink)}.cb-pm{font-size:11px;color:var(--mute);margin-left:6px;font-weight:500}
.cb-star{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;background:linear-gradient(120deg,#ffd44d,#f5a301);color:#5a3b00;font-size:10px;font-weight:800;letter-spacing:.4px;vertical-align:1px}
.cb-fow{padding:14px 16px;font-size:13px;line-height:1.9;color:var(--mute)}.cb-fow b{color:var(--ink)}
.cb-ball{min-width:30px;height:30px;padding:0 7px;border-radius:15px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:var(--soft);color:var(--ink);border:1px solid var(--line)}
.cb-ball.b4{background:var(--blue);border-color:var(--blue);color:#fff}.cb-ball.b6{background:var(--vio);border-color:var(--vio);color:#fff}.cb-ball.bw{background:var(--red);border-color:var(--red);color:#fff}
.cb-ball.bx{background:#fff3cf;border-color:#f5c542;color:#7a5600}.cb-ball.ba{background:#ede9fe;border-color:#c4b5fd;color:#5b21b6}.cb-ball.br{background:#e2e8f0;color:#475569}
.cb-balls{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.cb-balls .cb-ball:last-child{animation:cbPop .45s cubic-bezier(.3,1.6,.5,1)}
.cb-man{display:flex;align-items:flex-end;gap:6px;height:150px;padding:14px 16px 10px;overflow-x:auto}
.cb-col{flex:1 0 26px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px}
.cb-col i{display:block;width:100%;max-width:30px;border-radius:7px 7px 3px 3px;background:linear-gradient(var(--g2),var(--g1));transform-origin:bottom;animation:cbGrowY .7s cubic-bezier(.2,.8,.2,1) both}.cb-col i.w{background:linear-gradient(#ff8a8e,var(--red))}
.cb-col .v{font-size:11px;font-weight:700}.cb-col .o{font-size:10px;color:var(--mute)}
.cb-ov{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;padding:13px 16px;border-top:1px solid var(--line);transition:background .2s}.cb-ov:hover{background:var(--soft)}
.cb-ov .ovn{font-weight:800;color:var(--g1)}.cb-ov .bn{font-size:12px;color:var(--mute);margin-bottom:6px}
.cb-ov .rt{text-align:right;font-size:12px;color:var(--mute)}.cb-ov .rt b{display:block;font-size:15px;color:var(--ink)}
.cb-eo{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:11px 16px;background:linear-gradient(120deg,var(--tint),#fff);font-size:13px}
.cb-eo b{font-weight:700;color:var(--g1)}.cb-eo span{color:var(--mute);font-size:12px}
.cb-com{display:grid;grid-template-columns:44px 34px 1fr auto;gap:10px;align-items:center;padding:12px 16px;border-top:1px solid var(--line);font-size:14px;line-height:1.5}
.cb-com .no{font-weight:700;color:var(--mute);font-size:12px}.cb-com .sc{font-size:12px;color:var(--mute);white-space:nowrap;font-weight:600}
.cb-com.w{background:var(--rtint);box-shadow:inset 4px 0 0 var(--red)}.cb-com.w .tx{color:#b42327;font-weight:700}
.cb-com.f{box-shadow:inset 4px 0 0 var(--blue)}.cb-com.s{box-shadow:inset 4px 0 0 var(--vio)}.cb-com.f .tx,.cb-com.s .tx{font-weight:700}
.cb-info{display:grid;grid-template-columns:96px 1fr;gap:10px 14px;padding:16px;margin:0}.cb-info dt{color:var(--mute);font-size:13px}.cb-info dd{margin:0;font-weight:600}
.cb-hero{padding:20px 16px;background:linear-gradient(135deg,#0a6b4d 0,#12a37f 100%);color:#fff;border:0;position:relative;overflow:hidden}
.cb-hero:after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.1)}
.cb-hero .st{font-size:11px;font-weight:700;letter-spacing:1px;opacity:.85}.cb-hero .rs{margin:4px 0 14px;font-size:18px;font-weight:800;line-height:1.35;position:relative}
.cb-hrow{display:flex;justify-content:space-between;align-items:baseline;padding:8px 0;border-top:1px solid rgba(255,255,255,.2);position:relative}.cb-hrow b{font-size:15px}.cb-hrow em{font-style:normal;font-size:22px;font-weight:800}.cb-hrow em small{font-size:12px;font-weight:500;opacity:.85;margin-left:4px}
.cb-sum{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:14px 16px 4px}.cb-sum b{font-size:16px}.cb-sum em{font-style:normal;font-size:24px;font-weight:800;color:var(--g1)}.cb-sum em small{font-size:13px;font-weight:500;color:var(--mute)}
.cb-chipr{display:flex;flex-wrap:wrap;gap:8px;padding:8px 16px 4px}.cb-chip{padding:4px 10px;border-radius:999px;background:var(--soft);border:1px solid var(--line);font-size:12px;color:var(--mute)}.cb-chip b{color:var(--ink)}
.cb-kv{padding:8px 16px 16px;font-size:13px;color:var(--mute);line-height:1.8}.cb-kv b{color:var(--ink);font-weight:600}
.cb-so{background:#fff8e6;border-color:#f5d98a}
.cb-potm{position:relative;overflow:hidden;padding:0;border:1px solid #f1d27a;background:linear-gradient(135deg,#fffbea,#fff 60%)}
.cb-potm:before{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,215,90,.35),transparent);animation:cbShine 4.5s ease-in-out infinite}
.cb-potm .hd{display:flex;align-items:center;gap:8px;padding:12px 16px;font-size:12px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:#8a5a00;border-bottom:1px solid #f6e4a9}
.cb-potm .live{margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:999px;background:var(--red);color:#fff;font-size:10px;letter-spacing:.8px}
.cb-potm .main{display:flex;align-items:center;gap:14px;padding:16px;position:relative}
.cb-potm .av{width:64px;height:64px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#5a3b00;background:linear-gradient(135deg,#ffe27a,#f5a301);box-shadow:0 0 0 4px #fff,0 0 0 6px #f5c542;animation:cbPop .7s cubic-bezier(.3,1.5,.5,1)}
.cb-potm .nm{font-size:19px;font-weight:800;line-height:1.2}.cb-potm .tm{font-size:12px;color:var(--mute);margin:2px 0 6px}.cb-potm .ln{font-size:14px;font-weight:700;color:var(--g1)}
.cb-potm .pt{margin-left:auto;text-align:center;flex:none}.cb-potm .pt b{display:block;font-size:30px;font-weight:800;color:#b57700;line-height:1}.cb-potm .pt span{font-size:10px;font-weight:700;letter-spacing:.8px;color:var(--mute)}
.cb-run{display:flex;align-items:center;gap:10px;padding:10px 16px;border-top:1px dashed #f1d27a;font-size:13px}.cb-run .k{width:22px;height:22px;border-radius:50%;background:#fff3cf;color:#7a5600;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}.cb-run .s{margin-left:auto;color:var(--mute);font-size:12px}
.cb-how{padding:10px 16px;border-top:1px dashed #f1d27a;font-size:12px;color:var(--mute)}.cb-how summary{cursor:pointer;font-weight:600;color:#8a5a00}.cb-how p{margin:6px 0 0;line-height:1.7}
.cb-live-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:linear-gradient(120deg,var(--tint),#fff);border-bottom:1px solid var(--line);font-size:12px;color:var(--mute)}.cb-live-top .ttl{font-weight:700;color:var(--ink);font-size:14px}
.cb-tag{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.8px;color:#fff;background:var(--red)}.cb-tag.fin{background:var(--g1)}.cb-tag.up{background:#94a3b8}
.cb-dot{width:7px;height:7px;border-radius:50%;background:#fff;box-shadow:0 0 0 0 rgba(255,255,255,.8);animation:cbRing 1.4s infinite}
.cb-conn{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-weight:600}.cb-conn i{width:8px;height:8px;border-radius:50%;background:var(--gold)}.cb-conn.ok i{background:#22c55e;animation:cbRing2 1.8s infinite}
.cb-teams{padding:12px 16px 0}.cb-trow{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:6px 0}
.cb-trow .n{font-size:17px;font-weight:700}.cb-trow .s{font-size:34px;font-weight:800;letter-spacing:-1px;color:var(--g1);line-height:1.1}.cb-trow .s small{font-size:13px;font-weight:500;color:var(--mute);margin-left:6px;letter-spacing:0}
.cb-trow.dim .n{font-weight:500;color:var(--mute);font-size:15px}.cb-trow.dim .s{font-size:15px;font-weight:600;color:var(--mute);letter-spacing:0}
.cb-stat{margin:6px 16px 12px;padding:9px 12px;border-radius:10px;background:var(--rtint);color:#b42327;font-size:14px;font-weight:700}.cb-stat.done{background:var(--tint);color:var(--g1)}.cb-stat.nrm{background:var(--soft);color:var(--mute);font-weight:500}
.cb-prog{height:6px;margin:0 16px 12px;border-radius:99px;background:#e6ecf1;overflow:hidden}.cb-prog i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--g2),var(--g1));transition:width .9s cubic-bezier(.2,.8,.2,1)}
.cb-rates{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 14px}
.cb-rates span{padding:4px 11px;border-radius:999px;background:var(--soft);border:1px solid var(--line);font-size:12px;color:var(--mute)}.cb-rates b{color:var(--ink);font-weight:700}
.cb-tov{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;border-top:1px solid var(--line);background:var(--soft)}
.cb-tov .lb{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--mute)}
.cb-last{width:100%;font-size:13px;font-weight:500}.cb-last.w{color:#b42327;font-weight:700}
.cb-flash{position:absolute;z-index:30;left:50%;top:-10px;transform:translateX(-50%);padding:10px 34px;border-radius:14px;color:#fff;font-size:26px;font-weight:800;letter-spacing:3px;box-shadow:0 14px 34px rgba(15,27,45,.35);pointer-events:none;animation:cbFlash 3s ease forwards}
.cb-sq{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.cb-pl{display:flex;align-items:center;gap:12px;padding:11px 16px;border-top:1px solid var(--line);transition:background .2s}.cb-pl:hover{background:var(--soft)}
.cb-av{width:36px;height:36px;border-radius:50%;background:var(--tint);color:var(--g1);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex:none}
.cb-pl .m{font-size:12px;color:var(--mute)}.cb-pl .rl{margin-left:auto;padding:2px 9px;border-radius:999px;background:var(--tint);font-size:11px;font-weight:700;color:var(--g1);flex:none}
.sq-wrap{display:flex;flex-direction:column;gap:14px}
.sq-hero{position:relative;overflow:hidden;border-radius:18px;padding:16px 18px;color:#fff;background:linear-gradient(120deg,var(--g1),var(--g2));box-shadow:var(--sh)}
.sq-hero:after{content:"";position:absolute;right:-40px;top:-70px;width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.12)}
.sq-hero small{position:relative;z-index:1;display:block;font-size:11px;font-weight:700;letter-spacing:1.6px;opacity:.85}
.sq-hero b{position:relative;z-index:1;display:block;margin-top:2px;font-size:20px;font-weight:800;line-height:1.25}
.sq-sw{display:none;gap:6px;padding:5px;border-radius:16px;background:#e6ecf2}
.sq-sw button{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 8px;border:0;border-radius:12px;background:transparent;color:var(--mute);font:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:.2s}
.sq-sw button .t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sq-sw button.on{background:#fff;color:var(--ink);box-shadow:0 4px 14px -6px rgba(15,27,45,.35)}
.sq-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.sq-col{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:var(--sh);overflow:hidden}
.sq-ch{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(180deg,var(--soft),#fff);border-bottom:1px solid var(--line)}
.sq-ch .tn{flex:1;min-width:0;font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sq-ch .tc{flex:none;padding:3px 10px;border-radius:999px;background:var(--tint);color:var(--g1);font-size:11px;font-weight:800}
.sq-p{display:flex;align-items:center;gap:12px;width:100%;padding:10px 16px;border:0;background:transparent;color:var(--ink);font:inherit;text-align:left;cursor:pointer;transition:background .15s}
.sq-p+.sq-p{border-top:1px solid var(--line)}.sq-p:hover,.sq-p:active{background:var(--soft)}
.sq-p .nm{flex:1;min-width:0;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sq-p .tg{flex:none;padding:2px 9px;border-radius:999px;background:var(--tint);color:var(--g1);font-size:10.5px;font-weight:800;letter-spacing:.3px}
.sq-p .go{flex:none;color:#b6c0cc;font-size:22px;line-height:1}
.sq-none{padding:22px 16px;text-align:center;color:var(--mute);font-size:13px}
.sq-av{width:44px;height:44px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:800;overflow:hidden;box-shadow:0 4px 10px -4px rgba(15,27,45,.4),inset 0 0 0 2px rgba(255,255,255,.35)}
.sq-av img{width:100%;height:100%;object-fit:cover;display:block}.sq-av.lg{width:96px;height:96px;font-size:32px}
.sq-mo{--card:#fff;--ink:#0f1b2d;--mute:#64748b;--line:#e5eaf0;--soft:#f7f9fb;--g1:#0a6b4d;--g2:#12a37f;--tint:#e8f6f1;position:fixed;inset:0;z-index:3500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,20,35,.6);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);color:var(--ink);font-family:Inter,'Segoe UI',system-ui,sans-serif;font-size:14px;line-height:1.4;animation:sqFade .2s ease both}
.sq-mo *{box-sizing:border-box}
.sq-md{width:100%;max-width:440px;max-height:88vh;max-height:88dvh;display:flex;flex-direction:column;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 30px 80px -20px rgba(0,0,0,.55);animation:sqIn .28s cubic-bezier(.2,.8,.2,1) both}
.sq-md-h{position:relative;flex:none;overflow:hidden;text-align:center;padding:28px 18px 18px;color:#fff;background:linear-gradient(135deg,var(--g1),var(--g2))}
.sq-md-h:before{content:"";position:absolute;left:-60px;top:-80px;width:210px;height:210px;border-radius:50%;background:rgba(255,255,255,.1)}
.sq-md-h .sq-av{position:relative;margin:0 auto 12px;border:4px solid rgba(255,255,255,.65);box-shadow:0 12px 26px -8px rgba(0,0,0,.5)}
.sq-md-h h3{position:relative;margin:0;font-size:22px;font-weight:800;line-height:1.2;overflow-wrap:anywhere}
.sq-md-h .tm{position:relative;margin-top:4px;font-size:12.5px;font-weight:600;opacity:.92}
.sq-chips{position:relative;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:12px}
.sq-chips span{padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.2);font-size:12px;font-weight:600}
.sq-x{position:absolute;top:10px;right:10px;z-index:2;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.22);color:#fff;font-size:22px;line-height:1;cursor:pointer}
.sq-md-b{flex:1;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:4px 16px calc(18px + env(safe-area-inset-bottom,0px))}
.sq-sh{margin:16px 2px 8px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--mute)}
.sq-big{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}
.sq-big div{padding:12px 4px;border-radius:14px;text-align:center;background:linear-gradient(160deg,var(--tint),#fff);border:1px solid #cfeadf}
.sq-big b{display:block;font-size:24px;font-weight:800;color:var(--g1);line-height:1.1}.sq-big span{font-size:11px;font-weight:600;color:var(--mute)}
.sq-sm{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.sq-sm div{padding:9px 4px;border-radius:12px;text-align:center;background:var(--soft);border:1px solid var(--line)}
.sq-sm b{display:block;font-size:16px;font-weight:800}.sq-sm span{font-size:10.5px;font-weight:600;color:var(--mute)}
.sq-note{margin:16px 0 0;padding:12px;border-radius:12px;background:var(--soft);color:var(--mute);text-align:center;font-size:13px}
@keyframes sqIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
@keyframes sqFade{from{opacity:0}to{opacity:1}}
@media(max-width:759px){.sq-sw{display:flex}.sq-grid{grid-template-columns:1fr}.sq-col.off{display:none}.sq-hero b{font-size:18px}}
@media(max-width:400px){.sq-mo{padding:10px}.sq-md-h h3{font-size:19px}.sq-big b{font-size:21px}.sq-sm b{font-size:15px}.sq-p{padding:10px 12px}}

.cb-badge{display:inline-flex;align-items:center;justify-content:center;flex:none;border-radius:50%;color:#fff;font-weight:800;box-shadow:0 4px 10px -4px rgba(15,27,45,.45),inset 0 0 0 2px rgba(255,255,255,.35)}
.tmx{display:flex;align-items:center;gap:10px;min-width:0}
.cb-bar-r{flex:none}.cb-minisc{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.2);font-weight:800;font-size:14px}.cb-minisc small{font-weight:500;opacity:.9;font-size:11px}.cb-minisc i{width:7px;height:7px;border-radius:50%;background:#fff;animation:cbRing 1.4s infinite}
.cb-vs{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 16px 6px;position:relative}
.cb-side{display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 8px;border-radius:14px;border:1px solid var(--line);background:var(--soft);text-align:center;transition:.3s}
.cb-side.on{background:linear-gradient(180deg,var(--tint),#fff);border-color:#b9e5d7;box-shadow:0 10px 22px -14px rgba(10,107,77,.6)}
.cb-side .tn{margin-top:6px;max-width:100%;font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-side .ts{font-size:30px;font-weight:800;letter-spacing:-1px;line-height:1.15;color:var(--mute)}.cb-side.on .ts{color:var(--g1)}.cb-side .to{font-size:12px;color:var(--mute)}
.cb-vs:after{content:'VS';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--mute);box-shadow:var(--sh)}
.cb-worm{padding:10px 12px 4px}.cb-worm svg{width:100%;height:auto;display:block}.cb-worm path.ln{fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:cbDraw 1.4s ease forwards}
.cb-leg{display:flex;flex-wrap:wrap;gap:14px;padding:0 16px 14px;font-size:12px;color:var(--mute);font-weight:600}.cb-leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px}
.cb-ph{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px 16px 6px}.cb-ph div{padding:12px 8px;border-radius:12px;background:var(--soft);border:1px solid var(--line);text-align:center}
.cb-ph b{display:block;font-size:20px;font-weight:800;color:var(--g1)}.cb-ph span{display:block;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--mute)}.cb-ph small{font-size:12px;color:var(--mute)}
.cb-bars{padding:10px 16px 16px;display:flex;flex-direction:column;gap:9px}.cb-brow{display:grid;grid-template-columns:82px 1fr 40px;gap:10px;align-items:center;font-size:13px}
.cb-brow .t{height:10px;border-radius:99px;background:#e9eef3;overflow:hidden}.cb-brow .t i,.cb-share i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--g2),var(--g1));transform-origin:left;animation:cbGrowX .8s cubic-bezier(.2,.8,.2,1) both}.cb-brow b{text-align:right}
.cb-share{display:block;height:4px;margin-top:6px;border-radius:99px;background:#e9eef3;overflow:hidden;max-width:160px}
.cb-skel{height:120px;border-radius:16px;background:linear-gradient(90deg,#e9eef3 25%,#f6f8fa 50%,#e9eef3 75%);background-size:200% 100%;animation:cbSh 1.2s infinite}
.cb-fil{display:flex;gap:8px;flex-wrap:wrap}

/* ---------- BROADCAST (TV style) ---------- */
.bc-tv{border-radius:18px;overflow:hidden;background:#07101f;color:#fff;border:1px solid #16243d;box-shadow:0 24px 50px -24px rgba(7,16,31,.85);margin-bottom:14px}
.bc-top{display:flex;align-items:center;gap:10px;padding:10px 14px;background:linear-gradient(90deg,#0b1a33,#10305a);font-size:12px;font-weight:700;letter-spacing:.6px;flex-wrap:wrap}
.bc-brand{padding:3px 10px;border-radius:6px;background:linear-gradient(120deg,#12a37f,#0a6b4d);font-weight:800;letter-spacing:1.5px}.bc-brand b{font-weight:600;opacity:.85;margin-left:6px}
.bc-mode{padding:3px 10px;border-radius:6px;background:#334155}.bc-mode.live{background:var(--red);animation:bcBlink 1.4s infinite}.bc-ctx{opacity:.8}.bc-sp{flex:1}
.bc-stage{position:relative;overflow:hidden;min-height:330px;--c1:#0b1a33;--c2:#16335f;background:linear-gradient(135deg,var(--c1),var(--c2));transition:background .5s}
.bc-stage:after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.03) 0 1px,transparent 1px 3px)}
.bc-stage:before{content:'';position:absolute;top:-30%;left:-40%;width:35%;height:160%;transform:rotate(18deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);animation:bcSweep 3.4s ease-in-out 1}
.th-red{--c1:#3b0a0d;--c2:#c62f35}.th-vio{--c1:#2a0f55;--c2:#7c3aed}.th-blue{--c1:#0b2350;--c2:#2563eb}.th-green{--c1:#06382b;--c2:#12a37f}.th-amber{--c1:#4a3203;--c2:#d99a06}.th-gray{--c1:#111b2e;--c2:#3b4a63}
.bc-scene{position:relative;display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:12px;align-items:center;padding:16px;min-height:330px;animation:bcFade .4s both}
.bc-scene.solo{grid-template-columns:1fr}.bc-col{display:flex;flex-direction:column;gap:10px;z-index:2}
.bc-mid{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;z-index:2;min-width:0}
.bc-big{font-size:clamp(38px,8.5vw,80px);font-weight:900;letter-spacing:2px;line-height:1;text-shadow:0 8px 30px rgba(0,0,0,.55);animation:bcSlam .75s cubic-bezier(.2,1.6,.4,1) both}.bc-big.sm{font-size:clamp(28px,6vw,52px)}
.bc-sub{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.9;animation:bcFade .6s .3s both}
.bc-tag,.bc-fh{padding:3px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:1.2px;background:#fff;color:#111}.bc-fh{background:#ffd44d;animation:bcBlink 1s infinite}
.bc-pro{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(6px);animation:bcL .6s .15s both;min-width:0}
.bc-col.r .bc-pro,.bc-col.r .bc-score{animation-name:bcR}.bc-pro.hot{border-color:#ffd44d;box-shadow:0 0 0 2px rgba(255,212,77,.4)}.bc-pro.out{border-color:#ff8a8e;background:rgba(229,72,77,.28)}
.bc-av{display:inline-flex;align-items:center;justify-content:center;flex:none;border-radius:50%;font-weight:800;color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.55)}
.bc-pro .in{display:flex;flex-direction:column;min-width:0;line-height:1.25}.bc-pro .rl{font-size:10px;font-weight:800;letter-spacing:1px;opacity:.75}.bc-pro b{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bc-pro .ln{font-size:18px;font-weight:800}.bc-pro .sb{font-size:11px;opacity:.8}
.bc-score{padding:10px 12px;border-radius:14px;text-align:center;background:rgba(0,0,0,.28);animation:bcL .6s .3s both}.bc-score b{display:block;font-size:26px;font-weight:800}.bc-score span{font-size:11px;letter-spacing:1px;opacity:.8}
.bc-field{width:100%;max-width:300px;height:auto;display:block}.bc-trail{fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-opacity:.8;stroke-dasharray:1;stroke-dashoffset:1;animation:cbDraw 1.5s ease forwards}
.bc-stump{stroke:#f4e3b2;stroke-width:3;stroke-linecap:round}.bc-hit .bc-stump{animation:bcShake .5s .75s both}.bc-bail{fill:#f4e3b2;opacity:1}.bc-hit .bc-bail.a{animation:bcBA 1s .75s both}.bc-hit .bc-bail.b{animation:bcBB 1s .75s both}
.bc-out{padding:8px 14px;border-radius:12px;background:rgba(0,0,0,.35);animation:bcFade .6s .8s both}.bc-out b{font-size:20px;margin:0 6px}.bc-out small{display:block;font-size:12px;opacity:.85}
.bc-conf{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1}.bc-conf i{position:absolute;top:-12px;width:8px;height:14px;border-radius:2px;animation:bcFall 2.6s linear both}
.bc-oh{text-align:center}.bc-bars{display:flex;justify-content:center;align-items:flex-end;gap:10px;height:150px;padding:0 6px;z-index:2;width:100%}
.bc-b{flex:0 1 54px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}.bc-b .v{font-size:13px;font-weight:800}
.bc-b i{display:block;width:100%;border-radius:8px 8px 3px 3px;background:linear-gradient(#7ef0c9,#12a37f);transform-origin:bottom;animation:cbGrowY .7s cubic-bezier(.2,.8,.2,1) both}.bc-b i.w{background:linear-gradient(#ff9a9d,#e5484d)}.bc-b i.f{background:linear-gradient(#8fb4ff,#2563eb)}.bc-b i.s{background:linear-gradient(#c9a9ff,#7c3aed)}.bc-b i.x{background:linear-gradient(#ffe08a,#f5b301)}
.bc-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;max-width:520px;z-index:2;margin:0 auto}.bc-tiles div{padding:8px;border-radius:12px;background:rgba(0,0,0,.3);text-align:center}.bc-tiles b{display:block;font-size:20px;font-weight:800}.bc-tiles span{font-size:10px;letter-spacing:1px;opacity:.8}
.bc-mini{display:flex;align-items:flex-end;gap:3px;height:34px;z-index:2}.bc-mini i{display:block;width:9px;border-radius:3px 3px 1px 1px;background:rgba(255,255,255,.35)}.bc-mini i.on{background:#ffd44d}
.bc-ctl{display:flex;gap:8px;flex-wrap:wrap;padding:12px 16px;align-items:center}.bc-btn{padding:8px 14px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink);font:600 13px Inter,sans-serif;cursor:pointer;transition:.2s}.bc-btn:hover{transform:translateY(-1px);box-shadow:0 6px 14px -8px rgba(15,27,45,.4)}.bc-btn.on{background:var(--red);border-color:var(--red);color:#fff}.bc-btn.pr{background:linear-gradient(120deg,var(--g1),var(--g2));border-color:transparent;color:#fff}
.bc-tl{display:flex;gap:14px;overflow-x:auto;padding:12px 16px 16px;scrollbar-width:thin}.bc-ovb{flex:none}.bc-ovb h6{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.6px;color:var(--mute)}.bc-ovb .cb-balls{flex-wrap:nowrap}
.bc-cb{border:0;background:none;padding:2px;border-radius:50%;cursor:pointer}.bc-cb.on{box-shadow:0 0 0 2px var(--g2)}
.bc-mom{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px}.bc-mom button{display:inline-flex;gap:8px;align-items:center;padding:5px 12px 5px 6px;border-radius:999px;border:1px solid var(--line);background:var(--soft);font:600 12px Inter,sans-serif;cursor:pointer}
.bc-pls{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px 16px 4px}.bc-pls div{padding:10px;border-radius:12px;background:var(--soft);border:1px solid var(--line);text-align:center}.bc-pls b{display:block;font-size:20px;font-weight:800;color:var(--g1)}.bc-pls span{font-size:11px;font-weight:700;letter-spacing:.5px;color:var(--mute);text-transform:uppercase}

/* ---------- BROADCAST v2: profile / out / insight scenes ---------- */
.bc-prof{width:100%;display:flex;flex-direction:column;gap:12px;z-index:2;animation:bcFade .5s both}
.bc-ph-head{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.2)}
.bc-ph-head .in{display:flex;flex-direction:column;min-width:0;flex:1;line-height:1.3}
.bc-ph-head .rl{font-size:11px;font-weight:800;letter-spacing:1.2px;opacity:.8}
.bc-ph-head b{font-size:clamp(18px,3.2vw,28px);font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bc-ph-head .sb{font-size:12px;opacity:.8}.bc-ph-head .how{margin-top:2px;font-size:14px;font-weight:700;color:#ffd44d}
.bc-bigr{text-align:center;flex:none;animation:bcSlam .7s cubic-bezier(.2,1.6,.4,1) both}.bc-bigr b{display:block;font-size:clamp(34px,6vw,60px);font-weight:900;line-height:1}.bc-bigr span{font-size:13px;opacity:.85}
.bc-hist{display:flex;align-items:flex-end;justify-content:center;gap:5px;height:110px;padding:0 4px}
.bc-hist .bc-b{flex:1 1 0;max-width:30px;min-width:11px}.bc-hist .bc-b .v{font-size:11px}
.bc-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.bc-chips span{padding:5px 12px;border-radius:999px;background:rgba(0,0,0,.32);font-size:12px;font-weight:700}
.bc-duo{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;width:100%;z-index:2}
.bc-pcard{flex:1 1 260px;max-width:420px;padding:14px;border-radius:16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.2);animation:bcL .6s .15s both}
.bc-pcard .top{display:flex;gap:12px;align-items:center}.bc-pcard .in{display:flex;flex-direction:column;min-width:0;line-height:1.3}
.bc-pcard .rl{font-size:10px;font-weight:800;letter-spacing:1.2px;opacity:.8}.bc-pcard b{font-size:20px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bc-pcard .sb{font-size:12px;opacity:.8}
.bc-pcard .ex{margin-top:10px;padding:7px 10px;border-radius:10px;background:rgba(255,212,77,.18);color:#ffe9a3;font-size:12px;font-weight:700}
.bc-pcard .hs{margin-top:10px;display:flex;flex-direction:column;gap:6px}.bc-pcard .hs div{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px;font-size:13px;padding-top:6px;border-top:1px solid rgba(255,255,255,.15)}
.bc-pcard .hs span{opacity:.8;flex:1}.bc-pcard .hs b{font-size:15px;overflow:visible}.bc-pcard .hs small{opacity:.75;font-size:11px;width:100%}.bc-pcard .hs .none{opacity:.75;font-size:12px;font-style:italic;border:0}
.bc-ins{display:grid;grid-template-columns:1.6fr 1fr;gap:12px;width:100%;z-index:2}
.bc-panel{padding:12px;border-radius:16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.16);z-index:2}.bc-panel h5{margin:0 0 6px;font-size:11px;letter-spacing:1.2px;opacity:.8;font-weight:800}
.bc-panel svg{width:100%;height:auto;display:block}.bc-panel path.ln{fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:cbDraw 1.8s ease forwards}
.bc-pp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px}.bc-pp div{text-align:center;padding:6px 4px;border-radius:10px;background:rgba(255,255,255,.08)}.bc-pp b{display:block;font-size:17px;font-weight:800}.bc-pp span{display:block;font-size:9px;letter-spacing:.8px;opacity:.8;font-weight:800;text-transform:uppercase}.bc-pp small{font-size:10px;opacity:.75}
.bc-sr{display:grid;grid-template-columns:54px 1fr 28px;gap:8px;align-items:center;font-size:12px;margin:5px 0}.bc-sr .t{height:8px;border-radius:9px;background:rgba(255,255,255,.14);overflow:hidden}.bc-sr .t i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#7ef0c9,#12a37f);transform-origin:left;animation:cbGrowX .8s both}.bc-sr b{text-align:right}
.bc-ovg{display:flex;align-items:flex-end;gap:4px;height:84px}.bc-ovg>div{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:2px;min-width:0}
.bc-ovg i{display:block;width:100%;max-width:24px;border-radius:5px 5px 2px 2px;background:rgba(255,255,255,.35);transform-origin:bottom;animation:cbGrowY .6s both}.bc-ovg .on i{background:#ffd44d}.bc-ovg .w i{background:#ff7a7f}
.bc-ovg span{font-size:10px;font-weight:800}.bc-ovg small{font-size:9px;opacity:.7}

/* ---------- professional scoreboard ---------- */
.sbd{background:#0a1224;color:#fff;font-family:Inter,'Segoe UI',system-ui,sans-serif}
.sbd-tick{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 12px;background:#050b17;font-size:11px;font-weight:700;letter-spacing:.4px;color:#cbd5e1;border-top:1px solid #1b2a47}
.sbd-pill{padding:2px 9px;border-radius:5px;background:#1e3a66;color:#fff;font-weight:800;letter-spacing:.8px;font-size:10px}.sbd-pill.pp{background:#0a6b4d}.sbd-pill.fh{background:#ffd44d;color:#111;animation:bcBlink 1s infinite}.sbd-pill.lv{background:#e5484d}
.sbd-sp{flex:1}
.sbd-main{display:grid;grid-template-columns:auto auto auto minmax(190px,1.3fr) minmax(190px,1.2fr) minmax(160px,1fr);align-items:stretch;border-top:3px solid #12a37f}
.sbd-main>div{padding:10px 14px;min-width:0;display:flex;flex-direction:column;justify-content:center;border-right:1px solid #1b2a47}.sbd-main>div:last-child{border-right:0}
.sbd-main>.sbd-brand{background:linear-gradient(120deg,#0a6b4d,#12a37f);font-weight:900;letter-spacing:2px;font-size:15px;text-align:center}.sbd-brand b{display:block;font-size:9px;font-weight:700;letter-spacing:2px;opacity:.85}
.sbd-main>.sbd-team{flex-direction:row;align-items:center;gap:10px}.sbd-team .c{display:block;font-size:22px;font-weight:900;letter-spacing:1px;line-height:1}.sbd-team small{font-size:11px;color:#94a3b8;font-weight:700}
.sbd-main>.sbd-score{background:#fff;color:#0a1224;text-align:center;align-items:center}.sbd-score b{font-size:32px;font-weight:900;letter-spacing:-1px;line-height:1}.sbd-score span{font-size:12px;font-weight:700;color:#475569}.sbd-score small{font-weight:600}
.sbd-bt{display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:baseline;font-size:14px;padding:2px 0}.sbd-bt .nm{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sbd-bt b{font-size:17px;font-weight:800;color:#ffd44d}.sbd-bt small{color:#94a3b8;font-size:12px}.sbd-bt i{font-style:normal;font-size:10px;color:#94a3b8;min-width:42px;text-align:right}.sbd-bt.on .nm{color:#7ef0c9}.sbd-bt.wait{display:block;color:#94a3b8;font-style:italic}
.sbd-bw .nm{font-size:14px;font-weight:700;display:flex;justify-content:space-between;gap:8px}.sbd-bw .nm b{color:#ffd44d}.sbd-bw .cb-balls{margin-top:6px}.sbd-bw .cb-ball{min-width:24px;height:24px;font-size:11px}
.sbd-st{text-align:center}.sbd-st .need{font-size:14px;font-weight:800;line-height:1.25}.sbd-st .need em{font-style:normal;color:#ffd44d;font-size:18px}.sbd-st small{display:block;margin-top:4px;font-size:11px;color:#94a3b8;font-weight:700}
@media (max-width:900px){.sbd-main{grid-template-columns:1fr auto}.sbd-main>.sbd-brand{display:none}.sbd-main>.sbd-bats,.sbd-main>.sbd-bw,.sbd-main>.sbd-st{grid-column:1/-1;border-right:0;border-top:1px solid #1b2a47}}

@keyframes bcFade{from{opacity:0}to{opacity:1}}@keyframes bcBlink{50%{opacity:.55}}@keyframes bcSweep{from{left:-40%}to{left:130%}}
@keyframes bcSlam{0%{transform:scale(2.6);opacity:0}60%{transform:scale(.94);opacity:1}100%{transform:scale(1)}}
@keyframes bcL{from{transform:translateX(-40px);opacity:0}to{transform:none;opacity:1}}@keyframes bcR{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
@keyframes bcFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(380px) rotate(540deg);opacity:.2}}
@keyframes bcShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px) rotate(-3deg)}75%{transform:translateX(3px) rotate(3deg)}}
@keyframes bcBA{to{transform:translate(-26px,-46px) rotate(-200deg);opacity:0}}@keyframes bcBB{to{transform:translate(26px,-54px) rotate(220deg);opacity:0}}
@media (max-width:700px){.bc-scene{grid-template-columns:1fr;padding:12px;gap:10px;min-height:0}.bc-mid{order:-1}.bc-col{flex-direction:row;flex-wrap:wrap}.bc-col>*{flex:1 1 140px}.bc-pls{grid-template-columns:repeat(2,1fr)}.bc-field{max-width:240px}.bc-tiles{grid-template-columns:repeat(2,1fr)}.bc-ins{grid-template-columns:1fr}.bc-ph-head .in b{font-size:18px}}
@keyframes cbGrowX{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes cbSh{to{background-position:-200% 0}}@keyframes cbDraw{to{stroke-dashoffset:0}}
@keyframes cbUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cbPop{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes cbGrowY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes cbShine{0%,60%{left:-60%}100%{left:130%}}
@keyframes cbRing{0%{box-shadow:0 0 0 0 rgba(255,255,255,.8)}100%{box-shadow:0 0 0 8px rgba(255,255,255,0)}}
@keyframes cbRing2{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}100%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
@keyframes cbFlash{0%{transform:translate(-50%,-16px) scale(.9);opacity:0}12%{transform:translate(-50%,0) scale(1);opacity:1}85%{opacity:1}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.cb-root *{animation:none!important;transition:none!important}}
@media (max-width:640px){.cb-wrap{padding:12px 10px 40px}.cb-tabs{margin:0 -10px 12px;padding:8px 10px}.cb-card{border-radius:14px}
 .cb-trow .s{font-size:28px}.cb-trow .n{font-size:16px}.cb-hero .rs{font-size:16px}.cb-com{grid-template-columns:38px 32px 1fr;gap:8px;padding:11px 12px}.cb-com .sc{display:none}
 .cb-ov{grid-template-columns:44px 1fr auto;padding:12px}.cb-info{grid-template-columns:78px 1fr}.cb-potm .av{width:54px;height:54px;font-size:18px}.cb-potm .nm{font-size:17px}.cb-potm .pt b{font-size:24px}
 .cb-seg{display:flex}.cb-pill{flex:1;padding:8px 6px}.cb-flash{font-size:20px;padding:8px 22px}}
@media (max-width:640px){.cb-side .ts{font-size:24px}.cb-ph b{font-size:17px}.cb-brow{grid-template-columns:62px 1fr 34px}.cb-minisc{font-size:13px;padding:4px 10px}}

/* ============ BROADCAST v3 : FIXED STAGE + PREMIUM LOOK ============ */
.bc-tv{border-radius:22px;border:1px solid #1d3157;background:#050c1a;box-shadow:0 34px 64px -30px rgba(5,12,26,.95),inset 0 0 0 1px rgba(255,255,255,.04)}
.bc-top{height:46px;flex-wrap:nowrap;overflow:hidden;white-space:nowrap;background:linear-gradient(90deg,#071326,#0e2a52 60%,#0b1f3d);border-bottom:1px solid rgba(255,255,255,.08)}
.bc-brand{background:linear-gradient(120deg,#12a37f,#0a6b4d);box-shadow:0 4px 14px -4px rgba(18,163,127,.7)}
.bc-mode{box-shadow:0 0 0 1px rgba(255,255,255,.2) inset}

/* --- the stage NEVER changes size: fixed height, scenes are absolutely positioned --- */
.bc-stage{height:440px;min-height:0;border-bottom:3px solid rgba(255,255,255,.16);
  background:radial-gradient(600px 300px at 20% 0,rgba(255,255,255,.14),transparent 70%),radial-gradient(500px 280px at 90% 100%,rgba(0,0,0,.35),transparent 70%),linear-gradient(135deg,var(--c1),var(--c2))}
.bc-stage:after{background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.5) 100%),repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px)}
.bc-scene{position:absolute;inset:0;height:100%;min-height:0;overflow:hidden;padding:18px 22px;align-content:center}
.bc-scene.solo{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
.bc-mid{max-height:100%;justify-content:center}

/* --- compact, fixed sizes for every element inside the stage --- */
.bc-big{font-size:clamp(34px,5.6vw,64px);font-weight:900;letter-spacing:3px;
  background:linear-gradient(180deg,#fff 35%,rgba(255,255,255,.72));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none;filter:drop-shadow(0 8px 22px rgba(0,0,0,.55))}
.bc-big.sm{font-size:clamp(26px,4vw,44px)}
.bc-sub{padding:4px 16px;border-radius:999px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.18);font-size:12px;letter-spacing:2.2px}.bc-sub:empty{display:none}
.bc-field{max-width:210px;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45))}
.bc-bars{height:96px}.bc-b{flex:0 1 46px}
.bc-hist{height:84px}
.bc-tiles{max-width:480px}.bc-tiles div{padding:6px}.bc-tiles b{font-size:18px}
.bc-ovg{height:50px}
.bc-pcard{height:224px;overflow:hidden}
.bc-pcard .hs{max-height:118px;overflow:hidden}
.bc-ph-head{padding:10px 14px}
.bc-oh{margin-bottom:0}
.bc-ins{align-items:stretch}.bc-ins .bc-panel{overflow:hidden;max-height:300px}
.bc-pro{padding:9px 12px}
.bc-out{padding:6px 14px}

/* --- premium glass cards --- */
.bc-pro,.bc-pcard,.bc-panel,.bc-ph-head,.bc-score,.bc-out,.bc-tiles div,.bc-pp div{
  background:linear-gradient(145deg,rgba(255,255,255,.17),rgba(255,255,255,.04));
  border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(12px);
  box-shadow:0 12px 30px -14px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.28)}
.bc-pro.hot{border-color:#ffd44d;box-shadow:0 0 0 2px rgba(255,212,77,.35),0 0 26px -4px rgba(255,212,77,.45),inset 0 1px 0 rgba(255,255,255,.3)}
.bc-pro.out{border-color:#ff8a8e;background:linear-gradient(145deg,rgba(229,72,77,.5),rgba(229,72,77,.15))}
.bc-av{box-shadow:0 0 0 2px rgba(255,255,255,.75),0 0 0 5px rgba(255,255,255,.12),0 8px 18px -6px rgba(0,0,0,.6)}
.bc-pro b,.bc-pcard b{letter-spacing:.2px}
.bc-pcard .ex{background:linear-gradient(90deg,rgba(255,212,77,.28),rgba(255,212,77,.08));border:1px solid rgba(255,212,77,.3)}
.bc-chips span{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.14)}
.bc-fh{box-shadow:0 0 18px rgba(255,212,77,.7)}

/* --- scoreboard: fixed height, nothing jumps when text changes --- */
.sbd-tick{min-height:30px;flex-wrap:nowrap;overflow:hidden;white-space:nowrap}
.sbd-main{min-height:98px;border-top:3px solid #12a37f;background:linear-gradient(180deg,#0d1a33,#0a1224)}
.sbd-main>.sbd-score{background:linear-gradient(180deg,#fff,#e9eef5)}
.sbd-bats{min-height:62px}
.sbd-bw .cb-balls{flex-wrap:nowrap;overflow:hidden;min-height:26px}
.sbd-st{min-height:56px}

/* --- studio controls --- */
.bc-btn{border-radius:999px;padding:8px 16px}
.bc-btn.pr{box-shadow:0 8px 18px -8px rgba(10,107,77,.8)}
.bc-tl{min-height:96px}

/* --- mobile: still fixed, just a taller + more compact stage --- */
@media (max-width:700px){
  .bc-stage{height:500px}
  .bc-scene{padding:12px;gap:8px}
  .bc-scene>.bc-panel{display:none}
  .bc-field{max-width:150px}
  .bc-big{font-size:clamp(30px,10vw,46px)}.bc-big.sm{font-size:clamp(24px,7.5vw,34px)}
  .bc-bars{height:84px}
  .bc-tiles{grid-template-columns:repeat(4,1fr);gap:6px}.bc-tiles b{font-size:15px}.bc-tiles span{font-size:8px}
  .bc-duo{flex-direction:column;gap:8px}
  .bc-pcard{height:auto;flex:none;width:100%;padding:10px}
  .bc-pcard .hs div:nth-child(n+2){display:none}
  .bc-chips{display:none}
  .bc-ins{grid-template-columns:1fr}.bc-ins .bc-panel:nth-child(2){display:none}
  .bc-col{flex-wrap:nowrap}.bc-col>*{flex:1 1 0}
  .bc-top{height:42px}
  .sbd-main{min-height:0}
}
`;

export const useCountUp = (value, ms = 600) => {
  const target = Number(value) || 0;
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    if (from === target) return undefined;
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      cur.current = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
};

export const BallChip = ({ e }) => {
  let d = e.desc;
  let k = '';
  if (e.kind === 'adjust') { d = `+${e.runs}`; k = 'ba'; }
  else if (e.kind === 'retire') { d = 'Ret'; k = 'br'; }
  else if (e.wicket) k = 'bw';
  else if (e.batRuns === 4) k = 'b4';
  else if (e.batRuns === 6) k = 'b6';
  else if (e.extraKind) k = 'bx';
  return <span className={`cb-ball ${k}`}>{d}</span>;
};

const PlayerCell = ({ p, star }) => (
  <span>
    <span className="cb-pn">{p.name}</span>
    {star && <span className="cb-star">POTM</span>}
    {(p.batch || p.dept) && <span className="cb-pm">{[p.batch && `B:${p.batch}`, p.dept].filter(Boolean).join(' | ')}</span>}
  </span>
);

const PotmCard = ({ potm }) => {
  const [w, ...rest] = potm.board;
  const team = (r) => [r.team, r.batch && `B:${r.batch}`, r.dept].filter(Boolean).join(' · ');
  return (
    <div className="cb-card cb-potm">
      <div className="hd">
        <span>&#9733; Player of the Match</span>
        {!potm.final && <span className="live"><span className="cb-dot" />LIVE</span>}
      </div>
      <div className="main">
        <div className="av">{initials(w.name)}</div>
        <div style={{ minWidth: 0 }}>
          <div className="nm">{w.name}</div>
          <div className="tm">{team(w)}</div>
          <div className="ln">{statLine(w)}</div>
        </div>
        <div className="pt"><b>{w.pts}</b><span>IMPACT PTS</span></div>
      </div>
      {rest.map((r, i) => (
        <div key={r.key} className="cb-run">
          <span className="k">{i + 2}</span><b>{r.name}</b><span className="s">{statLine(r)} · {r.pts} pts</span>
        </div>
      ))}
      <details className="cb-how">
        <summary>How is this calculated?</summary>
        <p>Updated automatically from every ball. Batting: runs + 1 per four + 2 per six, with 30/50/100 bonuses and strike-rate bonus. Bowling: 25 per wicket, +8 bowled/lbw, +12 per maiden, +1 per dot ball, 3/4/5-wicket bonuses and economy bonus. Fielding: catch +8, stumping +12, run out +6. After the result, only players from the winning team are considered.</p>
      </details>
    </div>
  );
};

const BADGES = [['#0a6b4d', '#12a37f'], ['#1d4ed8', '#38bdf8'], ['#7c3aed', '#c084fc'], ['#c2410c', '#fb923c'], ['#be123c', '#fb7185'], ['#0f766e', '#2dd4bf']];
export const TeamBadge = ({ name, size = 40 }) => {
  let h = 0;
  String(name || '').split('').forEach((c) => { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
  const [a, b] = BADGES[h % BADGES.length];
  return <span className="cb-badge" style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: `linear-gradient(135deg,${a},${b})` }}>{initials(name)}</span>;
};

/* ---------- insights (all derived from the ball log) ---------- */
const partnershipsOf = (entries) => {
  const out = [];
  let cur = null;
  entries.forEach((e) => {
    if (e.kind === 'retire' || e.kind === 'adjust') return;
    if (!cur) cur = { a: e.striker && e.striker.name, b: e.nonStriker && e.nonStriker.name, runs: 0, balls: 0 };
    cur.runs += e.totalRuns;
    if (e.legal) cur.balls += 1;
    if (e.wicket) { out.push({ ...cur, broken: true }); cur = null; }
  });
  if (cur && cur.balls > 0) out.push({ ...cur, broken: false });
  return out;
};
const distOf = (entries) => {
  const d = { dot: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, ext: 0 };
  entries.forEach((e) => {
    if (e.kind === 'retire' || e.kind === 'adjust') return;
    if (e.extraKind) { d.ext += e.totalRuns; return; }
    if (e.batRuns === 0) d.dot += 1; else if (d[e.batRuns] !== undefined) d[e.batRuns] += 1;
  });
  return d;
};
const phasesOf = (inn, limit) => {
  const pp = Math.min(6, Math.ceil(limit * 0.3));
  const dt = Math.ceil(limit * 0.2);
  return [['Powerplay', (o) => o < pp], ['Middle', (o) => o >= pp && o < limit - dt], ['Death', (o) => o >= limit - dt]].map(([n, f]) => {
    const os = inn.overs.filter((o) => f(o.over));
    const runs = os.reduce((t, o) => t + o.runs, 0);
    const legal = os.reduce((t, o) => t + o.legal, 0);
    return { n, runs, w: os.reduce((t, o) => t + o.wickets, 0), legal, rr: rr(runs, legal) };
  });
};

const InsightsPane = ({ inningsList, log, limit }) => {
  const COL = ['#12a37f', '#2563eb', '#7c3aed', '#f59e0b'];
  const W = 600, H = 230, L = 36, B = 26, T = 12, R = 14;
  const series = inningsList.map((inn) => {
    let last = 0;
    const pts = [{ x: 0, y: 0, w: 0 }];
    inn.overs.forEach((o) => { if (o.endScore) last = o.endScore.runs; pts.push({ x: o.over + 1, y: last, w: o.wickets }); });
    return pts;
  });
  const xMax = Math.max(limit, ...series.map((q) => q.length - 1));
  const yMax = Math.max(20, Math.ceil(Math.max(0, ...series.map((q) => q[q.length - 1].y)) / 20) * 20);
  const X = (v) => L + (v / xMax) * (W - L - R);
  const Y = (v) => H - B - (v / yMax) * (H - B - T);
  const step = xMax > 12 ? 5 : 1;
  const ticks = [0, 1, 2, 3, 4].map((i) => Math.round((yMax / 4) * i));
  const lab = { dot: 'Dot balls', 1: 'Singles', 2: 'Twos', 3: 'Threes', 4: 'Fours', 6: 'Sixes' };
  return (
    <div className="cb-stack cb-pane">
      <div className="cb-card cb-flush">
        <div className="cb-sec">Run progression (worm)</div>
        <div className="cb-worm">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative runs by over">
            {ticks.map((t) => (<g key={t}><line x1={L} x2={W - R} y1={Y(t)} y2={Y(t)} stroke="#e5eaf0" /><text x={L - 6} y={Y(t) + 4} fontSize="10" textAnchor="end" fill="#64748b">{t}</text></g>))}
            {Array.from({ length: Math.floor(xMax / step) + 1 }, (_, i) => i * step).map((v) => (<text key={v} x={X(v)} y={H - 8} fontSize="10" textAnchor="middle" fill="#64748b">{v}</text>))}
            {series.map((q, i) => (
              <g key={i}>
                <path className="ln" pathLength="1" stroke={COL[i % 4]} d={q.map((pt, k) => `${k ? 'L' : 'M'}${X(pt.x)} ${Y(pt.y)}`).join(' ')} />
                {q.filter((pt) => pt.w > 0).map((pt) => (<circle key={pt.x} cx={X(pt.x)} cy={Y(pt.y)} r="4.5" fill="#e5484d" stroke="#fff" strokeWidth="1.5" />))}
              </g>
            ))}
          </svg>
        </div>
        <div className="cb-leg">
          {inningsList.map((inn, i) => (<span key={inn.name}><i style={{ background: COL[i % 4] }} />{inn.battingTeam || inn.name}</span>))}
          <span><i style={{ background: '#e5484d' }} />Wicket over</span>
        </div>
      </div>

      {inningsList.map((inn) => {
        const ents = log.filter((e) => e.innings === inn.name);
        const d = distOf(ents);
        const mx = Math.max(1, d.dot, d[1], d[2], d[3], d[4], d[6]);
        const parts = partnershipsOf(ents);
        const pmx = Math.max(1, ...parts.map((x) => x.runs));
        const bound = inn.runs ? Math.round(((inn.fours * 4 + inn.sixes * 6) / inn.runs) * 100) : 0;
        return (
          <div key={inn.name} className="cb-card cb-flush">
            <div className="cb-inn-head">
              <span className="tmx"><TeamBadge name={inn.battingTeam || inn.name} size={34} /><span>{inn.battingTeam || inn.name}<small>{inn.name} · {bound}% runs from boundaries</small></span></span>
              <span className="sc">{inn.runs}-{inn.wickets}</span>
            </div>
            <div className="cb-ph">
              {phasesOf(inn, limit).map((p) => (<div key={p.n}><span>{p.n}</span><b>{p.runs}/{p.w}</b><small>RR {p.rr}</small></div>))}
            </div>
            <div className="cb-sec">Scoring shots</div>
            <div className="cb-bars">
              {[['dot', 'dot'], [1, 1], [2, 2], [3, 3], [4, 4], [6, 6]].map(([k, key]) => (
                <div key={k} className="cb-brow"><span>{lab[key]}</span><span className="t"><i style={{ width: `${(d[key] / mx) * 100}%` }} /></span><b>{d[key]}</b></div>
              ))}
              <div className="cb-brow"><span>Extras</span><span className="t"><i style={{ width: `${Math.min(100, (d.ext / Math.max(1, inn.runs)) * 100 * 3)}%`, background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} /></span><b>{d.ext}</b></div>
            </div>
            <div className="cb-sec">Partnerships</div>
            <div className="cb-bars">
              {parts.map((x, i) => (
                <div key={i} className="cb-brow" style={{ gridTemplateColumns: '1fr' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}><span><b style={{ textAlign: 'left' }}>{x.a || '-'}</b> &amp; {x.b || '-'}{!x.broken && <span className="cb-star" style={{ background: '#e8f6f1', color: '#0a6b4d' }}>UNBROKEN</span>}</span><b>{x.runs} <span className="cb-mute" style={{ fontWeight: 500 }}>({x.balls})</span></b></div>
                  <span className="t"><i style={{ width: `${(x.runs / pmx) * 100}%` }} /></span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =====================================================================
 *  BROADCAST v3  -  fixed-size TV stage + professional scoreboard
 *  Every scene is derived from the ball log. New live balls are queued,
 *  so an animation that is already playing is never cut in the middle.
 * ===================================================================== */
const hueOf = (s) => { let h = 0; String(s || '').split('').forEach((c) => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h % 360; };
const Avatar = ({ name, size = 46 }) => (
  <span className="bc-av" style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: `linear-gradient(135deg,hsl(${hueOf(name)} 70% 38%),hsl(${(hueOf(name) + 40) % 360} 75% 55%))` }}>{initials(name)}</span>
);
const srOf = (b) => (b && b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '0');
const batLine = (b) => (b ? `${b.runs} (${b.balls})` : '-');
const batSub = (b) => (b ? `4s ${b.fours} · 6s ${b.sixes} · SR ${srOf(b)}` : '');
const bLab = (e) => (e.legalBefore === undefined ? `Ov ${e.over + 1}` : ballLabel(e));
const isBall = (e) => e.kind !== 'retire' && e.kind !== 'adjust';
const short = (n) => {
  const w = String(n || '').trim().split(/\s+/).filter(Boolean);
  return w.length > 1 ? w.slice(0, 3).map((x) => x[0]).join('').toUpperCase() : String(n || '').slice(0, 3).toUpperCase();
};
const outText = (e) => {
  const w = e.wicket, bn = e.bowler && e.bowler.name, h = w.helper, k = w.howOut;
  if (k === 'bowled') return `b ${bn}`;
  if (k === 'lbw') return `lbw b ${bn}`;
  if (k === 'catch out') return `c ${h || 'sub'} b ${bn}`;
  if (k === 'stumping') return `st ${h || 'wk'} b ${bn}`;
  if (k === 'hit wicket') return `hit wicket b ${bn}`;
  return `${k}${h ? ` (${h})` : ''}`;
};
const metaOf = (p) => [p.dept, p.batch && `B:${p.batch}`].filter(Boolean).join(' · ') || '-';

/* player-wise history of the OTHER innings (batting + bowling) */
const buildProfiles = (inningsList, skipName) => {
  const M = new Map();
  const g = (p) => {
    if (!p || !p.key) return null;
    if (!M.has(p.key)) M.set(p.key, { key: p.key, name: p.name, batch: p.batch, dept: p.dept, bats: [], bowls: [] });
    return M.get(p.key);
  };
  inningsList.forEach((inn) => {
    if (inn.name === skipName) return;
    inn.batters.forEach((b) => { const r = g(b); if (r && (b.balls > 0 || b.out)) r.bats.push({ inn: inn.name, runs: b.runs, balls: b.balls, fours: b.fours, sixes: b.sixes }); });
    inn.bowlers.forEach((b) => { const r = g(b); if (r && b.legal > 0) r.bowls.push({ inn: inn.name, legal: b.legal, runs: b.runs, wk: b.wickets, maid: b.maidens }); });
  });
  return M;
};

const buildTimeline = (entries) => {
  const B = new Map(), W = new Map(), seen = new Set();
  const gb = (p) => { if (!p || !p.key) return null; if (!B.has(p.key)) B.set(p.key, { key: p.key, name: p.name, batch: p.batch, dept: p.dept, runs: 0, balls: 0, fours: 0, sixes: 0, hist: [] }); return B.get(p.key); };
  const gw = (p) => { if (!p || !p.key) return null; if (!W.has(p.key)) W.set(p.key, { key: p.key, name: p.name, batch: p.batch, dept: p.dept, legal: 0, runs: 0, wk: 0 }); return W.get(p.key); };
  const cp = (x) => (x ? { ...x, hist: x.hist ? x.hist.slice() : undefined } : null);
  let runs = 0, wk = 0, legal = 0, part = { runs: 0, balls: 0 }, htB = null, htN = 0, prev = null, lastBowl = null, lastW = null;
  return entries.map((e, i) => {
    const row = { e, i, miles: [], overEnd: false, outP: null, S: null, N: null, B: null, newBats: [], openers: false, bowlChange: null, partEnded: null, freeHit: !!(prev && isBall(prev) && prev.extraKind === 'nb') };
    if (!isBall(e)) {
      if (e.kind === 'adjust') runs += e.runs;
      gb(e.player); gb(e.replacedBy);
    } else {
      const s = gb(e.striker), n = gb(e.nonStriker), bw = gw(e.bowler);

      // who is new at the crease / at the bowling crease (stats BEFORE this ball)
      row.openers = seen.size === 0;
      row.newBats = [s, n].filter((p) => p && !seen.has(p.key)).map(cp);
      [s, n].forEach((p) => { if (p) seen.add(p.key); });
      if (bw && bw.key !== lastBowl) { row.bowlChange = { p: { ...bw }, first: bw.legal === 0 }; lastBowl = bw.key; }

      const sb = s ? s.runs : 0, rb = runs;
      if (s) {
        if (e.faced) { s.balls += 1; s.hist.push({ r: e.batRuns, w: !!(e.wicket && (!e.wicket.batter || e.wicket.batter.key === s.key)) }); }
        s.runs += e.batRuns; if (e.batRuns === 4) s.fours += 1; if (e.batRuns === 6) s.sixes += 1;
      }
      runs += e.totalRuns;
      if (e.legal) legal += 1;
      if (bw) { if (e.legal) bw.legal += 1; bw.runs += e.bowlerRuns; }
      const pb = part.runs;
      part.runs += e.totalRuns;
      if (e.legal) part.balls += 1;
      if (s && s.runs >= 50 && Math.floor(s.runs / 50) > Math.floor(sb / 50)) row.miles.push({ t: 'bat', n: Math.floor(s.runs / 50) * 50, p: cp(s) });
      if (!e.wicket && Math.floor(part.runs / 50) > Math.floor(pb / 50)) row.miles.push({ t: 'part', n: Math.floor(part.runs / 50) * 50, a: s && s.name, b: n && n.name, balls: part.balls });
      if (Math.floor(runs / 50) > Math.floor(rb / 50)) row.miles.push({ t: 'team', n: Math.floor(runs / 50) * 50, legal });
      if (e.wicket) {
        wk += 1;
        if (bw && e.wicket.bowlerCredited) bw.wk += 1;
        row.outP = cp(gb(e.wicket.batter));
        row.partEnded = { runs: part.runs, balls: part.balls, a: s && s.name, b: n && n.name };
        lastW = { name: row.outP ? row.outP.name : '', runs: row.outP ? row.outP.runs : 0, balls: row.outP ? row.outP.balls : 0, score: runs, wk, over: fmtOvers(legal) };
        part = { runs: 0, balls: 0 };
      }
      if (e.legal) {
        if (e.wicket && e.wicket.bowlerCredited && bw) {
          if (htB === bw.key) htN += 1; else { htB = bw.key; htN = 1; }
          if (htN === 3) row.miles.unshift({ t: 'ht', name: bw.name });
        } else { htB = null; htN = 0; }
      }
      row.S = cp(s); row.N = cp(n); row.B = cp(bw);
      row.overEnd = !!e.legal && legal % 6 === 0;
    }
    row.team = { runs, wk, legal };
    row.part = { ...part };
    row.lastW = lastW;
    prev = e;
    return row;
  });
};

const classify = (e) => {
  if (e.kind === 'adjust') return { th: 'vio', big: `+${e.runs}`, sub: e.penalty ? 'Penalty runs' : 'Extra runs awarded' };
  if (e.kind === 'retire') return { th: 'gray', big: 'RETIRED', sub: `${(e.player && e.player.name) || 'Batter'} retired · ${(e.replacedBy && e.replacedBy.name) || 'new batter'} in` };
  if (e.wicket) return { th: 'red', big: 'WICKET!', sub: String(e.wicket.howOut || 'out'), track: 'wicket' };
  if (e.batRuns === 6) return { th: 'vio', big: 'SIX!', sub: 'Maximum', track: 'six' };
  if (e.batRuns === 4) return { th: 'blue', big: 'FOUR!', sub: 'Boundary', track: 'four' };
  if (e.extraKind === 'wd') return { th: 'amber', big: 'WIDE', sub: `${e.totalRuns} run${e.totalRuns === 1 ? '' : 's'} added`, track: 'wide' };
  if (e.extraKind === 'nb') return { th: 'amber', big: 'NO BALL', sub: `Free hit next ball${e.batRuns ? ` · +${e.batRuns} off the bat` : ''}`, track: 'nb' };
  if (e.extraKind === 'b') return { th: 'amber', big: 'BYES', sub: `${e.totalRuns} bye${e.totalRuns === 1 ? '' : 's'}`, track: 'bye' };
  if (e.extraKind === 'lb') return { th: 'amber', big: 'LEG BYES', sub: `${e.totalRuns} leg bye${e.totalRuns === 1 ? '' : 's'}`, track: 'bye' };
  if (e.batRuns === 0) return { th: 'gray', big: 'DOT BALL', sub: 'No run', track: 'dot' };
  return { th: 'green', big: `${e.batRuns} RUN${e.batRuns > 1 ? 'S' : ''}`, sub: e.batRuns === 3 ? 'Great running' : e.batRuns === 2 ? 'Quick two' : 'Single taken', track: 'run' };
};

const TRACKS = {
  dot: 'M160 46 L160 138 L160 170', run: 'M160 46 L160 138 L214 112', four: 'M160 46 L160 138 L294 122', six: 'M160 46 L160 138 Q240 -14 298 22',
  wide: 'M160 46 L198 128 L216 168', nb: 'M160 46 L160 138 L160 178', bye: 'M160 46 L160 150 L160 194', wicket: 'M160 46 L160 142'
};
const BallTrack = ({ type }) => {
  const d = TRACKS[type];
  return (
    <svg className={`bc-field${type === 'wicket' ? ' bc-hit' : ''}`} viewBox="0 0 320 200" aria-hidden="true">
      <ellipse cx="160" cy="100" rx="152" ry="94" fill="#14532d" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
      <ellipse cx="160" cy="100" rx="98" ry="60" fill="none" stroke="#fff" strokeOpacity=".28" strokeDasharray="4 4" />
      <rect x="148" y="36" width="24" height="128" rx="3" fill="#c8a96a" opacity=".85" />
      <g>{[152, 160, 168].map((x) => (<line key={x} className="bc-stump" x1={x} x2={x} y1="140" y2="154" />))}<rect className="bc-bail a" x="151" y="137" width="8" height="3" /><rect className="bc-bail b" x="161" y="137" width="8" height="3" /></g>
      {d && (
        <>
          <path className="bc-trail" pathLength="1" d={d} />
          <circle r="5.5" fill="#fff" stroke="#e5484d" strokeWidth="1.2">
            <animateMotion dur="1.5s" fill="freeze" path={d} />
            {type === 'six' && <animate attributeName="r" values="5.5;10;5.5" dur="1.5s" fill="freeze" />}
          </circle>
        </>
      )}
    </svg>
  );
};

const Confetti = ({ n }) => (
  <div className="bc-conf">
    {Array.from({ length: n }, (_, i) => (<i key={i} style={{ left: `${(i * 37 + 7) % 100}%`, animationDelay: `${(i % 7) * 0.12}s`, background: ['#ffd44d', '#fff', '#7ef0c9', '#8fb4ff', '#ff9a9d'][i % 5] }} />))}
  </div>
);

const ProCard = ({ role, name, line, sub, out, hot }) => (
  <div className={`bc-pro${out ? ' out' : ''}${hot ? ' hot' : ''}`}>
    <Avatar name={name} />
    <div className="in"><span className="rl">{role}</span><b>{name || '-'}</b><span className="ln">{line}</span>{sub && <span className="sb">{sub}</span>}</div>
  </div>
);

const BallScene = ({ row }) => {
  const e = row.e, c = classify(e);
  if (!isBall(e)) return (<div className={`bc-scene solo th-${c.th}`}><div className="bc-mid"><div className="bc-big sm">{c.big}</div><div className="bc-sub">{c.sub}</div></div></div>);
  const out = !!e.wicket && row.outP;
  const other = out && row.N && row.outP.key === row.N.key ? row.S : row.N;
  const bw = row.B;
  return (
    <div className={`bc-scene th-${c.th}`}>
      {(c.track === 'six' || c.track === 'four') && <Confetti n={c.track === 'six' ? 28 : 14} />}
      <div className="bc-col l">
        {out ? <ProCard role="OUT" name={row.outP.name} line={batLine(row.outP)} sub={outText(e)} out /> : <ProCard role="ON STRIKE" name={row.S && row.S.name} line={batLine(row.S)} sub={batSub(row.S)} hot />}
        <ProCard role={out ? 'AT THE CREASE' : 'NON-STRIKER'} name={other && other.name} line={batLine(other)} sub={batSub(other)} />
      </div>
      <div className="bc-mid">
        {row.freeHit && <span className="bc-fh">FREE HIT</span>}
        {e.extraKind === 'nb' && (e.wicket || e.batRuns >= 4) && <span className="bc-tag">NO BALL</span>}
        <div className="bc-big">{c.big}</div>
        <div className="bc-sub">{c.sub}</div>
        {c.track && <BallTrack type={c.track} />}
        {out && <div className="bc-out">{row.outP.name}<b>{batLine(row.outP)}</b><small>{outText(e)}</small></div>}
      </div>
      <div className="bc-col r">
        <ProCard role="BOWLING" name={bw && bw.name} line={bw ? `${fmtOvers(bw.legal)}-${bw.runs}-${bw.wk}` : '-'} sub={bw ? `Eco ${rr(bw.runs, bw.legal)}` : ''} />
        {e.wicket && e.wicket.helper ? <ProCard role="FIELDER" name={e.wicket.helper} line="" sub={e.wicket.howOut} /> : <div className="bc-score"><b>{row.team.runs}-{row.team.wk}</b><span>{fmtOvers(row.team.legal)} OVERS</span></div>}
      </div>
    </div>
  );
};

/* ---------- OUT scene: the dismissed batter's full innings history ---------- */
const BallBars = ({ hist }) => (
  <div className="bc-hist">
    {hist.map((h, k) => (
      <div key={k} className="bc-b">
        <span className="v">{h.w ? 'W' : h.r}</span>
        <i className={h.w ? 'w' : h.r === 6 ? 's' : h.r === 4 ? 'f' : ''} style={{ height: `${Math.max(6, (h.r / 6) * 100)}%`, animationDelay: `${Math.min(k, 30) * 0.04}s` }} />
      </div>
    ))}
  </div>
);

const OutScene = ({ row, prof }) => {
  const p = row.outP, e = row.e, pe = row.partEnded;
  if (!p) return null;
  const hist = p.hist || [];
  const dots = hist.filter((h) => h.r === 0 && !h.w).length;
  const pr = prof.get(p.key);
  return (
    <div className="bc-scene solo th-red">
      <div className="bc-prof">
        <div className="bc-ph-head">
          <Avatar name={p.name} size={72} />
          <div className="in">
            <span className="rl">WICKET {row.team.wk} · {row.team.runs}-{row.team.wk}</span>
            <b>{p.name}</b>
            <span className="sb">{metaOf(p)}</span>
            <span className="how">{outText(e)}</span>
          </div>
          <div className="bc-bigr"><b>{p.runs}</b><span>({p.balls} balls)</span></div>
        </div>
        <BallBars hist={hist} />
        <div className="bc-tiles">
          <div><b>{p.fours}</b><span>FOURS</span></div>
          <div><b>{p.sixes}</b><span>SIXES</span></div>
          <div><b>{srOf(p)}</b><span>STRIKE RATE</span></div>
          <div><b>{dots}</b><span>DOT BALLS</span></div>
        </div>
        <div className="bc-chips">
          {pe && <span>Partnership {pe.runs} ({pe.balls}) · {pe.a} &amp; {pe.b}</span>}
          {e.bowler && <span>Bowler {e.bowler.name}</span>}
          {pr && pr.bowls.map((b, i) => <span key={i}>{b.inn} bowling {b.wk}/{b.runs} ({fmtOvers(b.legal)})</span>)}
        </div>
      </div>
    </div>
  );
};

/* ---------- profile cards: new batter / new bowler / at the crease ---------- */
const ProfileCard = ({ p, pr, role, extra }) => {
  const bats = pr ? pr.bats : [], bowls = pr ? pr.bowls : [];
  return (
    <div className="bc-pcard">
      <div className="top">
        <Avatar name={p.name} size={60} />
        <div className="in"><span className="rl">{role}</span><b>{p.name}</b><span className="sb">{metaOf(p)}</span></div>
      </div>
      {extra && <div className="ex">{extra}</div>}
      <div className="hs">
        {bats.map((b, i) => (<div key={`b${i}`}><span>{b.inn} · Batting</span><b>{b.runs} ({b.balls})</b><small>4s {b.fours} · 6s {b.sixes} · SR {srOf(b)}</small></div>))}
        {bowls.map((b, i) => (<div key={`w${i}`}><span>{b.inn} · Bowling</span><b>{b.wk}/{b.runs}</b><small>{fmtOvers(b.legal)} ov · Eco {rr(b.runs, b.legal)}{b.maid ? ` · ${b.maid} maiden` : ''}</small></div>))}
        {!bats.length && !bowls.length && <div className="none">No earlier record in this match</div>}
      </div>
    </div>
  );
};

const BatIntroScene = ({ row, prof, team }) => (
  <div className="bc-scene solo th-green">
    <div className="bc-mid">
      <div className="bc-big sm">{row.openers ? 'OPENING PAIR' : 'NEW BATTER'}</div>
      <div className="bc-sub">{row.openers ? `${team} innings begins` : `Comes in at ${row.team.runs}-${row.team.wk}`}</div>
    </div>
    <div className="bc-duo">
      {row.newBats.map((p) => <ProfileCard key={p.key} p={p} pr={prof.get(p.key)} role={row.openers ? 'OPENER' : 'NEW BATTER'} extra={null} />)}
    </div>
  </div>
);

const BowlIntroScene = ({ row, prof }) => {
  const c = row.bowlChange, p = c.p;
  const title = row.openers ? 'OPENING BOWLER' : c.first ? 'NEW BOWLER' : 'BACK IN ATTACK';
  const extra = c.first ? `Over ${row.e.over + 1} · first spell` : `Over ${row.e.over + 1} · so far ${fmtOvers(p.legal)}-${p.runs}-${p.wk} · Eco ${rr(p.runs, p.legal)}`;
  return (
    <div className="bc-scene solo th-blue">
      <div className="bc-mid"><div className="bc-big sm">{title}</div></div>
      <div className="bc-duo"><ProfileCard p={p} pr={prof.get(p.key)} role="BOWLER" extra={extra} /></div>
    </div>
  );
};

const CreaseScene = ({ row, prof }) => {
  const list = [row.S, row.N].filter((b) => b && !(row.outP && b.key === row.outP.key));
  return (
    <div className="bc-scene solo th-green">
      <div className="bc-mid"><div className="bc-big sm">AT THE CREASE</div><div className="bc-sub">{row.team.runs}-{row.team.wk} · {fmtOvers(row.team.legal)} overs</div></div>
      <div className="bc-duo">
        {list.map((b) => <ProfileCard key={b.key} p={b} pr={prof.get(b.key)} role="BATTING" extra={`This innings ${batLine(b)} · ${batSub(b)}`} />)}
      </div>
    </div>
  );
};

/* ---------- OVER scene (over details graph) ---------- */
const barCls = (e) => (e.kind === 'adjust' || e.kind === 'retire' ? 'x' : e.wicket ? 'w' : e.batRuns === 6 ? 's' : e.batRuns === 4 ? 'f' : e.extraKind ? 'x' : '');
const OverScene = ({ row, tl, partial }) => {
  const items = tl.slice(0, row.i + 1).filter((x) => x.e.over === row.e.over);
  const val = (x) => (x.e.kind === 'adjust' ? x.e.runs : x.e.kind === 'retire' ? 0 : x.e.totalRuns);
  const total = items.reduce((t, x) => t + val(x), 0);
  const wk = items.filter((x) => x.e.wicket).length;
  const lg = items.filter((x) => x.e.legal).length;
  const maiden = lg >= 6 && items.every((x) => !isBall(x.e) || (x.e.bowlerRuns || 0) === 0);
  const mx = Math.max(4, ...items.map(val));
  const per = {}, perW = {};
  tl.slice(0, row.i + 1).forEach((x) => { per[x.e.over] = (per[x.e.over] || 0) + val(x); if (x.e.wicket) perW[x.e.over] = (perW[x.e.over] || 0) + 1; });
  const keys = Object.keys(per).map(Number).sort((a, b) => a - b);
  const pm = Math.max(1, ...keys.map((k) => per[k]));
  return (
    <div className="bc-scene solo th-green" style={{ justifyItems: 'center' }}>
      <div className="bc-oh"><div className="bc-big sm">{partial ? `OVER ${row.e.over + 1} · SO FAR` : `OVER ${row.e.over + 1} COMPLETE`}</div><div className="bc-sub">{(row.e.bowler && row.e.bowler.name) || ''}{maiden ? ' · MAIDEN OVER' : ''}</div></div>
      <div className="bc-bars">
        {items.map((x, k) => (<div key={x.e.id} className="bc-b"><span className="v">{val(x)}</span><i className={barCls(x.e)} style={{ height: `${Math.max(8, (val(x) / mx) * 100)}%`, animationDelay: `${k * 0.12}s` }} /><BallChip e={x.e} /></div>))}
      </div>
      <div className="bc-tiles">
        <div><b>{total}</b><span>RUNS</span></div><div><b>{wk}</b><span>WICKETS</span></div>
        <div><b>{rr(total, lg || 6)}</b><span>OVER RR</span></div><div><b>{row.team.runs}-{row.team.wk}</b><span>SCORE</span></div>
      </div>
      <div className="bc-panel" style={{ width: '100%', maxWidth: 560 }}>
        <h5>RUNS PER OVER</h5>
        <div className="bc-ovg">
          {keys.map((k) => (
            <div key={k} className={`${k === row.e.over ? 'on' : ''}${perW[k] ? ' w' : ''}`}>
              <span>{per[k]}</span><i style={{ height: `${Math.max(6, (per[k] / pm) * 100)}%` }} /><small>{k + 1}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- INSIGHT scene (worm + phases + scoring shots) ---------- */
const InsightScene = ({ tl, row, inningsList, limit, target }) => {
  const upto = tl.slice(0, row.i + 1);
  const val = (x) => (x.e.kind === 'adjust' ? x.e.runs : x.e.kind === 'retire' ? 0 : x.e.totalRuns);
  const om = new Map();
  upto.forEach((x) => {
    const o = om.get(x.e.over) || { over: x.e.over, runs: 0, legal: 0, wickets: 0, end: 0 };
    o.runs += val(x); if (x.e.legal) o.legal += 1; if (x.e.wicket) o.wickets += 1; o.end = x.team.runs;
    om.set(x.e.over, o);
  });
  const overs = [...om.values()].sort((a, b) => a.over - b.over);
  const pts = [{ x: 0, y: 0, w: 0 }, ...overs.map((o) => ({ x: o.over + 1, y: o.end, w: o.wickets }))];
  let cmp = null;
  if (target > 0 && inningsList[0]) {
    let last = 0;
    cmp = [{ x: 0, y: 0 }];
    inningsList[0].overs.forEach((o) => { if (o.endScore) last = o.endScore.runs; cmp.push({ x: o.over + 1, y: last }); });
  }
  const W = 520, H = 210, L = 34, Bt = 24, T = 10, R = 12;
  const xMax = Math.max(limit, pts.length - 1, cmp ? cmp.length - 1 : 0);
  const yMax = Math.max(20, Math.ceil(Math.max(pts[pts.length - 1].y, cmp ? cmp[cmp.length - 1].y : 0, target || 0) / 20) * 20);
  const X = (v) => L + (v / xMax) * (W - L - R);
  const Y = (v) => H - Bt - (v / yMax) * (H - Bt - T);
  const step = xMax > 12 ? 5 : 1;
  const path = (a) => a.map((pt, k) => `${k ? 'L' : 'M'}${X(pt.x)} ${Y(pt.y)}`).join(' ');
  const phases = phasesOf({ overs }, limit);
  const d = distOf(upto.map((x) => x.e));
  const mx = Math.max(1, d.dot, d[1], d[2], d[4], d[6]);
  return (
    <div className="bc-scene solo th-gray">
      <div className="bc-mid"><div className="bc-big sm">MATCH INSIGHTS</div></div>
      <div className="bc-ins">
        <div className="bc-panel">
          <h5>RUN PROGRESSION (WORM)</h5>
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => { const t = Math.round((yMax / 4) * i); return (<g key={i}><line x1={L} x2={W - R} y1={Y(t)} y2={Y(t)} stroke="#fff" strokeOpacity=".14" /><text x={L - 6} y={Y(t) + 4} fontSize="10" textAnchor="end" fill="#fff" fillOpacity=".7">{t}</text></g>); })}
            {Array.from({ length: Math.floor(xMax / step) + 1 }, (_, i) => i * step).map((v) => (<text key={v} x={X(v)} y={H - 7} fontSize="10" textAnchor="middle" fill="#fff" fillOpacity=".7">{v}</text>))}
            {target > 0 && (<g><line x1={L} x2={W - R} y1={Y(target)} y2={Y(target)} stroke="#ffd44d" strokeDasharray="5 4" /><text x={W - R} y={Y(target) - 4} fontSize="10" textAnchor="end" fill="#ffd44d">TARGET {target}</text></g>)}
            {cmp && <path d={path(cmp)} fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2" strokeDasharray="4 4" />}
            <path className="ln" pathLength="1" stroke="#7ef0c9" d={path(pts)} />
            {pts.filter((q) => q.w > 0).map((q) => (<circle key={q.x} cx={X(q.x)} cy={Y(q.y)} r="5" fill="#e5484d" stroke="#fff" strokeWidth="1.5" />))}
          </svg>
        </div>
        <div className="bc-panel">
          <h5>PHASES</h5>
          <div className="bc-pp">{phases.map((p) => (<div key={p.n}><span>{p.n}</span><b>{p.runs}/{p.w}</b><small>RR {p.rr}</small></div>))}</div>
          <h5>SCORING SHOTS</h5>
          {[['Dots', 'dot'], ['Singles', 1], ['Twos', 2], ['Fours', 4], ['Sixes', 6]].map(([l, k]) => (
            <div key={l} className="bc-sr"><span>{l}</span><span className="t"><i style={{ width: `${(d[k] / mx) * 100}%` }} /></span><b>{d[k]}</b></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MileScene = ({ m }) => {
  let big, sub, th = 'amber', card = null, n = 18;
  if (m.t === 'bat') { big = m.n === 50 ? 'FIFTY!' : m.n === 100 ? 'CENTURY!' : `${m.n}!`; sub = `${m.p.name} · ${m.p.runs} off ${m.p.balls} balls`; th = m.n >= 100 ? 'vio' : 'amber'; card = <ProCard role="MILESTONE" name={m.p.name} line={batLine(m.p)} sub={batSub(m.p)} hot />; }
  else if (m.t === 'ht') { big = 'HAT-TRICK!'; sub = m.name; th = 'red'; n = 30; }
  else if (m.t === 'part') { big = `${m.n} PARTNERSHIP`; sub = `${m.a || ''} & ${m.b || ''} · ${m.balls} balls`; th = 'green'; }
  else { big = `TEAM ${m.n}`; sub = `Up in ${fmtOvers(m.legal)} overs`; th = 'blue'; n = 10; }
  return (<div className={`bc-scene solo th-${th}`}><Confetti n={n} /><div className="bc-mid"><div className={`bc-big${big.length > 9 ? ' sm' : ''}`}>{big}</div><div className="bc-sub">{sub}</div>{card}</div></div>);
};

const ResultScene = ({ meta, potm }) => (
  <div className="bc-scene solo th-vio"><Confetti n={34} />
    <div className="bc-mid"><div className="bc-sub">FULL TIME</div><div className="bc-big sm">{meta.result}</div>
      {potm && potm.board[0] && <ProCard role="PLAYER OF THE MATCH" name={potm.board[0].name} line={statLine(potm.board[0])} sub={`${potm.board[0].pts} impact points`} hot />}
    </div>
  </div>
);

/* ---------- professional scoreboard under the stage ---------- */
const Scorebug = ({ row, tl, inn, innName, limit, target, ppOvers }) => {
  const e = row.e, t = row.team;
  const bat = inn.battingTeam || innName, bowl = inn.bowlingTeam || '';
  const left = Math.max(0, limit * 6 - t.legal);
  const need = target - t.runs;
  const over = tl.slice(0, row.i + 1).filter((x) => x.e.over === e.over).map((x) => x.e);
  const crr = t.legal > 0 ? (t.runs / t.legal) * 6 : 0;
  const rrr = target > 0 && need > 0 && left > 0 ? (need / left) * 6 : 0;
  const proj = !target && t.legal > 0 ? Math.round(t.runs + (crr / 6) * left) : null;
  const inPP = e.over < ppOvers;

  // who is on strike NOW (after the odd-run / end-of-over swap)
  const runsRun = e.extraKind === 'wd' ? Math.max(0, e.totalRuns - 1) : e.extraKind === 'nb' ? e.batRuns : e.extraKind ? e.totalRuns : e.batRuns;
  const swap = (runsRun % 2 === 1) !== !!row.overEnd;
  const crease = [row.S, row.N].filter((b) => b && !(row.outP && b.key === row.outP.key));
  const onStrike = swap ? row.N : row.S;
  const strikeKey = row.outP || !onStrike ? null : onStrike.key;
  const wait = !!row.outP && crease.length < 2;
  const bw = row.B;
  const lw = row.lastW;

  return (
    <div className="sbd">
      <div className="sbd-tick">
        <span className="sbd-pill lv">{innName}</span>
        {inPP && <span className="sbd-pill pp">POWERPLAY</span>}
        {row.freeHit && <span className="sbd-pill fh">FREE HIT</span>}
        <span className="sbd-sp" />
        {row.part && row.part.balls > 0 && <span>P'SHIP {row.part.runs} ({row.part.balls})</span>}
        {lw && <span>LAST WKT {lw.name} {lw.runs}({lw.balls}) · {lw.score}-{lw.wk} ({lw.over} ov)</span>}
      </div>
      <div className="sbd-main">
        <div className="sbd-brand">BRIU<b>SPORTS</b></div>
        <div className="sbd-team"><TeamBadge name={bat} size={44} /><div><span className="c">{short(bat)}</span><small>{bowl ? `v ${short(bowl)}` : 'batting'}</small></div></div>
        <div className="sbd-score"><b>{t.runs}-{t.wk}</b><span>{fmtOvers(t.legal)}<small> / {limit} ov</small></span></div>
        <div className="sbd-bats">
          {crease.map((b) => (
            <div key={b.key} className={`sbd-bt${b.key === strikeKey ? ' on' : ''}`}><span className="nm">{b.key === strikeKey ? '▶ ' : ''}{b.name}</span><b>{b.runs}</b><small>{b.balls}</small><i>SR {srOf(b)}</i></div>
          ))}
          {wait && <div className="sbd-bt wait"><span className="nm">Next batter coming in...</span></div>}
        </div>
        <div className="sbd-bw">
          <div className="nm"><span>{bw ? bw.name : '-'}</span><b>{bw ? `${fmtOvers(bw.legal)}-${bw.runs}-${bw.wk}` : ''}</b></div>
          <div className="cb-balls">{over.map((x) => <BallChip key={x.id} e={x} />)}</div>
        </div>
        <div className="sbd-st">
          {target > 0 ? (
            <>
              <div className="need">{need > 0 ? <>NEED <em>{need}</em> FROM <em>{left}</em></> : 'TARGET REACHED'}</div>
              <small>TARGET {target} · CRR {crr.toFixed(2)}{rrr > 0 ? ` · RRR ${rrr.toFixed(2)}` : ''}</small>
            </>
          ) : (
            <>
              <div className="need">PROJECTED <em>{proj === null ? '-' : proj}</em></div>
              <small>CRR {crr.toFixed(2)} · {left} balls left</small>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DUR = { bat: 5200, bowl: 5200, ball: 3400, out: 6500, mile: 3200, over: 4800, insight: 7000 };
const IDLE_KINDS = ['insight', 'over', 'crease'];
const TH = { bat: 'green', bowl: 'blue', out: 'red', insight: 'gray', over: 'green', crease: 'green', result: 'vio' };
const MAX_QUEUE = 3; // if many balls arrive at once, only the newest few are animated

const BroadcastPane = ({ log, inningsList, meta, live, potm, limit }) => {
  const names = inningsList.map((i) => i.name);
  const [binn, setBinn] = useState(null);
  const innName = binn && names.includes(binn) ? binn : names[names.length - 1];
  const entries = useMemo(() => log.filter((e) => e.innings === innName), [log, innName]);
  const tl = useMemo(() => buildTimeline(entries), [entries]);
  const prof = useMemo(() => buildProfiles(inningsList, innName), [inningsList, innName]);
  const n = tl.length;
  const [idx, setIdx] = useState(Math.max(0, n - 1));
  const [sc, setSc] = useState(0);
  const [follow, setFollow] = useState(true);
  const [queue, setQueue] = useState(null);
  const [nonce, setNonce] = useState(0);
  const [idle, setIdle] = useState(null);
  const prevN = useRef(n);
  const actRef = useRef(null);
  const finished = !!meta.result;

  // new live balls: if the stage is idle show them now, otherwise queue them (never cut a running animation)
  useEffect(() => {
    if (follow && n > prevN.current) {
      const fresh = [];
      for (let k = prevN.current; k < n; k += 1) fresh.push(k);
      const take = fresh.slice(-MAX_QUEUE);
      if (idle !== null) {
        setIdx(take[0]); setSc(0); setIdle(null);
        setQueue(take.length > 1 ? take.slice(1) : null);
      } else {
        setQueue((q) => [...(q || []), ...take].slice(-MAX_QUEUE));
      }
    }
    prevN.current = n;
  }, [n, follow]); // eslint-disable-line
  useEffect(() => { setIdx(Math.max(0, tl.length - 1)); setSc(0); setQueue(null); setIdle(null); }, [innName]); // eslint-disable-line

  const row = tl[Math.min(idx, n - 1)];
  const lastBallOfInn = !!row && row.i === n - 1;
  const scenes = row ? [
    ...(row.newBats.length ? [{ k: 'bat' }] : []),
    ...(row.bowlChange ? [{ k: 'bowl' }] : []),
    { k: 'ball' },
    ...(row.outP ? [{ k: 'out' }] : []),
    ...row.miles.slice(0, 2).map((m) => ({ k: 'mile', m })),
    ...(row.overEnd ? [{ k: 'over' }] : []),
    ...((row.overEnd && (row.e.over + 1) % 2 === 0) || (lastBallOfInn && finished) ? [{ k: 'insight' }] : []),
    ...(lastBallOfInn && finished ? [{ k: 'result' }] : [])
  ] : [];
  const liveIdle = !!row && follow && lastBallOfInn && !finished;

  useEffect(() => {
    if (!row) return undefined;
    if (idle !== null) {
      const t = setTimeout(() => setIdle((v) => (v === null ? null : v + 1)), 7000);
      return () => clearTimeout(t);
    }
    const cur = scenes[sc];
    if (!cur) return undefined;
    const dur = DUR[cur.k] || 0;
    const last = sc >= scenes.length - 1;
    if (!dur && !(queue && queue.length)) return undefined;
    const t = setTimeout(() => {
      if (!last) setSc(sc + 1);
      else if (queue && queue.length) { setIdx(queue[0]); setQueue(queue.length > 1 ? queue.slice(1) : null); setSc(0); }
      else if (liveIdle) setIdle(0);
    }, dur || 2500);
    return () => clearTimeout(t);
  }, [idx, sc, queue, nonce, idle]); // eslint-disable-line
  useEffect(() => { if (actRef.current && actRef.current.scrollIntoView) actRef.current.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }, [idx]);

  if (!n) return (<div className="cb-card cb-empty cb-pane">Waiting for the first ball... the broadcast starts automatically.</div>);

  const jump = (i) => { setFollow(false); setQueue(null); setIdle(null); setIdx(i); setSc(0); setNonce((x) => x + 1); };
  const goLive = () => { setFollow(true); setQueue(null); setIdle(null); setIdx(n - 1); setSc(0); setNonce((x) => x + 1); };
  const overIdx = tl.filter((x) => x.e.over === row.e.over).map((x) => x.i);
  const moments = tl.filter((x) => x.e.wicket || x.e.batRuns === 4 || x.e.batRuns === 6 || x.miles.length || x.newBats.length).map((x) => x.i);
  const play = (list) => { if (!list.length) return; setFollow(false); setIdle(null); setIdx(list[0]); setQueue(list.length > 1 ? list.slice(1) : null); setSc(0); setNonce((x) => x + 1); };

  const inn = inningsList.find((i) => i.name === innName) || {};
  const target = /2nd/i.test(innName) && inningsList[0] ? (live && Number(live.target) > 0 ? Number(live.target) : inningsList[0].runs + 1) : 0;
  const isLive = follow && !finished;
  const cur = scenes[Math.min(sc, scenes.length - 1)];
  const idleKind = idle !== null ? IDLE_KINDS[idle % IDLE_KINDS.length] : null;
  const kind = idleKind || cur.k;
  const c = classify(row.e);
  const stageTh = kind === 'ball' ? c.th : kind === 'mile' ? (cur.m.t === 'ht' ? 'red' : cur.m.t === 'bat' ? (cur.m.n >= 100 ? 'vio' : 'amber') : cur.m.t === 'part' ? 'green' : 'blue') : TH[kind];
  const ppOvers = Math.min(6, Math.ceil(limit * 0.3));
  const ballsLeft = Math.max(0, limit * 6 - row.team.legal);
  const need = target - row.team.runs;
  const rrrV = target > 0 && need > 0 && ballsLeft > 0 ? (need / ballsLeft) * 6 : 0;
  const crrV = row.team.legal > 0 ? (row.team.runs / row.team.legal) * 6 : 0;
  const proj = !target && row.team.legal > 0 ? Math.round(row.team.runs + (row.team.runs / row.team.legal) * ballsLeft) : null;
  const wl = Math.max(0, (Number(meta.playersPerTeam) ? Number(meta.playersPerTeam) - 1 : 10) - row.team.wk);
  const groups = [];
  tl.forEach((x) => { const g = groups[groups.length - 1]; if (g && g.over === x.e.over) g.items.push(x); else groups.push({ over: x.e.over, items: [x] }); });
  const mLab = (x) => (x.e.wicket ? 'W' : x.e.batRuns === 6 ? '6' : x.e.batRuns === 4 ? '4' : x.miles[0] ? (x.miles[0].t === 'bat' ? String(x.miles[0].n) : x.miles[0].t === 'ht' ? 'HT' : '★') : x.newBats.length ? 'IN' : '•');

  return (
    <div className="cb-pane">
      <div className="bc-tv">
        <div className="bc-top">
          <span className="bc-brand">BRIU<b>SPORTS</b></span>
          <span className={`bc-mode${isLive ? ' live' : ''}`}>{isLive ? '● LIVE' : 'REPLAY'}</span>
          <span className="bc-ctx">{innName} · Ball {bLab(row.e)}</span>
          <span className="bc-sp" />
          <span className="bc-ctx">{team1Name(inn)}</span>
        </div>
        <div className={`bc-stage th-${stageTh}`} key={`${innName}-${row.i}-${sc}-${nonce}-${idle}`}>
          {kind === 'ball' && <BallScene row={row} />}
          {kind === 'bat' && <BatIntroScene row={row} prof={prof} team={inn.battingTeam || innName} />}
          {kind === 'bowl' && <BowlIntroScene row={row} prof={prof} />}
          {kind === 'out' && <OutScene row={row} prof={prof} />}
          {kind === 'mile' && <MileScene m={cur.m} />}
          {kind === 'over' && <OverScene row={row} tl={tl} partial={!!idleKind && !row.overEnd} />}
          {kind === 'insight' && <InsightScene tl={tl} row={row} inningsList={inningsList} limit={limit} target={target} />}
          {kind === 'crease' && <CreaseScene row={row} prof={prof} />}
          {kind === 'result' && <ResultScene meta={meta} potm={potm} />}
        </div>
        <Scorebug row={row} tl={tl} inn={inn} innName={innName} limit={limit} target={target} ppOvers={ppOvers} />
      </div>

      <div className="cb-stack">
        <div className="cb-card cb-flush">
          <div className="cb-sec">Broadcast studio</div>
          <div className="bc-ctl">
            <button type="button" className={`bc-btn${isLive ? ' on' : ''}`} onClick={goLive}>● Live</button>
            <button type="button" className="bc-btn" onClick={() => jump(Math.max(0, row.i - 1))}>&#9664; Prev ball</button>
            <button type="button" className="bc-btn" onClick={() => jump(row.i)}>&#8635; Replay ball</button>
            <button type="button" className="bc-btn" onClick={() => jump(Math.min(n - 1, row.i + 1))}>Next ball &#9654;</button>
            <button type="button" className="bc-btn pr" onClick={() => play(overIdx)}>&#9654; Replay over</button>
            <button type="button" className="bc-btn pr" onClick={() => play(moments)}>&#9733; Highlights</button>
            {names.length > 1 && names.map((nm) => (<button key={nm} type="button" className={`bc-btn${nm === innName ? ' on' : ''}`} style={nm === innName ? { background: 'var(--g1)', borderColor: 'var(--g1)' } : null} onClick={() => { setBinn(nm); setFollow(nm === names[names.length - 1]); }}>{nm}</button>))}
          </div>
          <div className="bc-tl">
            {groups.map((g) => (
              <div key={g.over} className="bc-ovb"><h6>OVER {g.over + 1}</h6>
                <div className="cb-balls">{g.items.map((x) => (<button key={x.e.id} type="button" ref={x.i === row.i ? actRef : null} className={`bc-cb${x.i === row.i ? ' on' : ''}`} onClick={() => jump(x.i)} aria-label={`Ball ${bLab(x.e)}`}><BallChip e={x.e} /></button>))}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cb-card cb-flush">
          <div className="cb-sec">Match pulse</div>
          <div className="bc-pls">
            <div><b>{crrV.toFixed(2)}</b><span>Run rate</span></div>
            <div><b>{target > 0 ? rrrV.toFixed(2) : proj === null ? '-' : proj}</b><span>{target > 0 ? 'Required rate' : 'Projected'}</span></div>
            <div><b>{target > 0 ? Math.max(0, need) : row.team.runs}</b><span>{target > 0 ? `Need off ${ballsLeft}` : 'Runs'}</span></div>
            <div><b>{wl}</b><span>Wickets left</span></div>
          </div>
          {target > 0 && (
            <div className="cb-bars">
              <div className="cb-brow"><span>Current</span><span className="t"><i style={{ width: `${Math.min(100, (crrV / Math.max(crrV, rrrV, 6)) * 100)}%` }} /></span><b>{crrV.toFixed(1)}</b></div>
              <div className="cb-brow"><span>Required</span><span className="t"><i style={{ width: `${Math.min(100, (rrrV / Math.max(crrV, rrrV, 6)) * 100)}%`, background: 'linear-gradient(90deg,#ff9a9d,#e5484d)' }} /></span><b>{rrrV.toFixed(1)}</b></div>
            </div>
          )}
        </div>

        <div className="cb-card cb-flush">
          <div className="cb-sec">Key moments</div>
          <div className="bc-mom">
            {moments.length === 0 && <span className="cb-mute">Wickets, boundaries and milestones will appear here.</span>}
            {[...moments].reverse().slice(0, 40).map((i) => (<button key={i} type="button" onClick={() => jump(i)}><BallChip e={tl[i].e} /><span>{bLab(tl[i].e)} · {mLab(tl[i])}</span></button>))}
          </div>
        </div>
      </div>
    </div>
  );
};
/* =====================================================================
 *  ADDED: PlayingXISquads  (Cricbuzz-style squads)
 *  Playing XI of BOTH teams, full player names only. Tap a player -> profile popup.
 *   - matchId : loads the XI + profiles from  GET /api/cricket/live-score/:matchId/playing-xi
 *   - keys1 / keys2 : "name_dept_batch_id" keys (live.team1Squad / team2Squad), shown instantly
 *                     and used as a fallback if the profile request fails
 *   - live : live-score object, only used for the small "batting / bowling" tag
 *  Desktop: both teams side by side.  Phone: team switcher + one team at a time.
 * ===================================================================== */
const API_BASE = import.meta.env.VITE_API_URL || '';
const imgSrc = (p) => {
  const v = p && (p.image || p.photo || p.profileImage || p.avatar);
  if (!v || typeof v !== 'string') return '';
  return /^(https?:|data:|blob:)/.test(v) ? v : `${API_BASE}${v.startsWith('/') ? '' : '/'}${v}`;
};
const keyToPlayer = (k) => {
  const [name = '', dept = '', batch = '', ...rest] = String(k || '').split('_');
  const c = (v) => (v === 'undefined' ? '' : v);
  return { key: k, name, dept: c(dept), batch: c(batch), id: c(rest.join('_')) };
};
const dash = (v) => (v === undefined || v === null || v === '' ? '-' : v);
const avGrad = (name) => {
  let h = 0;
  String(name || '').split('').forEach((c) => { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
  const [a, b] = BADGES[h % BADGES.length];
  return `linear-gradient(135deg,${a},${b})`;
};

export const PlayerAvatar = ({ p, big }) => {
  const [bad, setBad] = useState(false);
  const src = imgSrc(p);
  const showImg = src && !bad;
  return (
    <span className={`sq-av${big ? ' lg' : ''}`} style={showImg ? undefined : { background: avGrad(p.name) }}>
      {showImg ? <img src={src} alt="" onError={() => setBad(true)} /> : initials(p.name)}
    </span>
  );
};

export const ProfileModal = ({ p, teamName, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (typeof document === 'undefined') return null;

  const st = p.stats || {};
  const dept = p.department || p.dept;
  const bowlAvg = Number(st.wickets) > 0 ? (Number(st.runsConceded) / Number(st.wickets)).toFixed(2) : '-';
  const big = (label, v) => <div key={label}><b>{dash(v)}</b><span>{label}</span></div>;
  const sm = (label, v) => <div key={label}><b>{dash(v)}</b><span>{label}</span></div>;

  // rendered on document.body so it is always centred on the screen (not inside the animated tab)
  return createPortal(
    <div className="sq-mo" onClick={onClose}>
      <div className="sq-md" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sq-md-h">
          <button type="button" className="sq-x" onClick={onClose} aria-label="Close">&times;</button>
          <PlayerAvatar p={p} big />
          <h3>{p.name}</h3>
          {teamName && <div className="tm">{teamName}</div>}
          <div className="sq-chips">
            {[p.role, p.batch && `Batch ${p.batch}`, dept, p.id && `ID ${p.id}`].filter(Boolean).map((t, i) => <span key={i}>{t}</span>)}
          </div>
        </div>
        <div className="sq-md-b">
          {p.profileFound === false ? (
            <div className="sq-note">Full profile is not available for this player yet.</div>
          ) : (
            <>
              <div className="sq-big">{big('Matches', st.matches)}{big('Runs', st.runs)}{big('Wickets', st.wickets)}</div>
              <div className="sq-sh">Batting</div>
              <div className="sq-sm">
                {sm('Innings', st.innings)}{sm('Highest', st.highestScore)}{sm('Average', st.average)}
                {sm('Strike Rate', st.strikeRate)}{sm('Fours', st.fours)}{sm('Sixes', st.sixes)}
              </div>
              <div className="sq-sh">Bowling</div>
              <div className="sq-sm">
                {sm('Overs', st.oversBowled)}{sm('Maidens', st.maidens)}{sm('Economy', st.economy)}
                {sm('Runs Given', st.runsConceded)}{sm('Balls', st.ballsBowled)}{sm('Bowl Avg', bowlAvg)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const PlayingXISquads = ({ matchId = '', team1 = '', team2 = '', keys1 = [], keys2 = [], live = null }) => {
  const [xi, setXi] = useState(null);
  const [open, setOpen] = useState(null);   // { p, team }
  const [team, setTeam] = useState(0);      // phone: which team is shown
  const sig = `${(keys1 || []).length}|${(keys2 || []).length}`;   // XI saved/changed -> load again

  useEffect(() => {
    if (!matchId) return undefined;
    let cancelled = false;
    let timer = null;
    const load = async () => {
      try {
        const res = await API.get(`/api/cricket/live-score/${matchId}/playing-xi`);
        if (cancelled) return;
        setXi(res.data);
        const d = res.data || {};
        // XI not saved yet (match not started) -> ask again until it is
        if (!((d.team1Players || []).length || (d.team2Players || []).length)) timer = setTimeout(load, 15000);
      } catch (err) {
        console.error('Could not load playing XI:', err);   // keys below still work as a fallback
      }
    };
    load();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [matchId, sig]);

  const list1 = xi && (xi.team1Players || []).length ? xi.team1Players : (keys1 || []).map(keyToPlayer);
  const list2 = xi && (xi.team2Players || []).length ? xi.team2Players : (keys2 || []).map(keyToPlayer);
  const names = [team1 || (xi && xi.team1) || 'Team 1', team2 || (xi && xi.team2) || 'Team 2'];
  const lists = [list1, list2];

  const tag = (p) => {
    if (!live) return '';
    const is = (x) => x && x.name === p.name && (x.batch || '') === (p.batch || '') && (!x.id || !p.id || x.id === p.id);
    if (is(live.striker) || is(live.nonStriker)) return 'BATTING';
    if (is(live.currentBowler)) return 'BOWLING';
    return '';
  };

  const renderTeam = (i) => (
    <div key={i} className={`sq-col${team === i ? '' : ' off'}`}>
      <div className="sq-ch">
        <TeamBadge name={names[i]} size={30} />
        <span className="tn">{names[i]}</span>
        <span className="tc">{lists[i].length} Players</span>
      </div>
      {lists[i].length === 0 ? (
        <div className="sq-none">Playing XI will appear when the match starts.</div>
      ) : lists[i].map((p, k) => (
        <button key={p.key || k} type="button" className="sq-p" onClick={() => setOpen({ p, team: names[i] })}>
          <PlayerAvatar p={p} />
          <span className="nm">{p.name}</span>
          {tag(p) ? <span className="tg">{tag(p)}</span> : null}
          <span className="go">&rsaquo;</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="sq-wrap">
      <div className="sq-hero">
        <small>PLAYING XI</small>
        <b>{names[0]} vs {names[1]}</b>
      </div>
      <div className="sq-sw">
        {names.map((n, i) => (
          <button key={i} type="button" className={team === i ? 'on' : ''} onClick={() => setTeam(i)}>
            <TeamBadge name={n} size={22} /><span className="t">{n}</span>
          </button>
        ))}
      </div>
      <div className="sq-grid">{renderTeam(0)}{renderTeam(1)}</div>
      {open && <ProfileModal p={open.p} teamName={open.team} onClose={() => setOpen(null)} />}
    </div>
  );
};

const team1Name = (inn) => (inn && inn.bowlingTeam ? `${inn.battingTeam} vs ${inn.bowlingTeam}` : '');

const MatchHistoryView = ({
  log = [],
  meta = {},
  team1 = '',
  team2 = '',
  loading = false,
  snapshot = null,
  onClose,
  topSlot = null,     // rendered above the tabs (live match header)
  squadsSlot = null,  // renders the "Squads" tab (optional: if omitted and matchId is given, Playing XI + profiles is used)
  matchId = '',       // ADDED: pass it and the Squads tab (Playing XI + player profiles) appears by itself
  barSlot = null,     // small live score shown in the top bar
  live = null         // live-score object (used for the chase target in Broadcast)
}) => {
  const squads = squadsSlot || (matchId ? (
    <PlayingXISquads
      matchId={matchId}
      team1={team1}
      team2={team2}
      keys1={(live && live.team1Squad) || []}
      keys2={(live && live.team2Squad) || []}
      live={live}
    />
  ) : null);
  const [tab, setTab] = useState('summary');
  const [view, setView] = useState('scorecard');
  const [cf, setCf] = useState('all');

  const inningsList = useMemo(() => {
    const names = [];
    log.forEach((e) => { if (!names.includes(e.innings)) names.push(e.innings); });
    return names.map((name) => ({ name, ...buildInningsData(log.filter((e) => e.innings === name)) }));
  }, [log]);

  const active = inningsList.find((i) => i.name === tab);
  const potm = useMemo(() => (log.length ? computePotm(log, inningsList, meta.result) : null), [log, inningsList, meta.result]);
  const potmKey = potm && potm.final ? potm.board[0].key : null;

  // Live matches open on the current innings and follow the match when a new innings starts.
  // Finished matches keep opening on "Summary". If the viewer picks a tab by hand we stop moving them.
  const autoTab = useRef(false);
  const userPicked = useRef(false);
  const prevCount = useRef(0);
  useEffect(() => {
    const count = inningsList.length;
    if (!count) return;
    const latest = inningsList[count - 1].name;
    const finished = !!meta.result;

    if (!autoTab.current) {
      autoTab.current = true;
      if (!finished) setTab(latest);
    } else if (count > prevCount.current && !userPicked.current && !finished) {
      setTab(latest);
      setView('scorecard');
    }
    prevCount.current = count;
  }, [inningsList, meta.result]);

  const tabBtn = (id, label) => (
    <button
      key={id}
      type="button"
      className={`cb-tab${tab === id ? ' on' : ''}`}
      onClick={() => { userPicked.current = true; setTab(id); setView('scorecard'); }}
    >
      <span className="tl">{label}</span>
      <span className="ts">{String(label).replace(/^(\d+\w*) Innings$/i, '$1 Inn')}</span>
    </button>
  );

  const tossLine = (t) => `${t.tossWinner} won the toss and chose to ${String(t.tossDecision).toLowerCase().startsWith('bowl') ? 'bowl' : 'bat'}`;
  const extrasLine = (x) => `${x.total} (b ${x.b}, lb ${x.lb}, w ${x.wd}, nb ${x.nb}, p ${x.pen})`;

  // Shown only when no ball-by-ball history was recorded (e.g. matches played before history recording existed)
  const hasSnapshot = !!snapshot && (Number(snapshot.runs) > 0 || Number(snapshot.ballsCount) > 0 || (snapshot.bowlersStats || []).some((b) => b && b.name));
  const renderSnapshot = () => {
    const s = snapshot;
    const bowlers = (s.bowlersStats || []).filter((b) => b && b.name);
    const batters = [s.striker, s.nonStriker].filter((b) => b && b.name);
    return (
      <div className="cb-stack">
        <div className="cb-card cb-mute" style={{ fontSize: 13 }}>
          Full ball-by-ball history was not recorded for this match, so the saved match summary is shown instead.
        </div>

        <div className="cb-card cb-flush">
          <div className="cb-inn-head">
            <span>{s.battingTeam}<small>{s.innings} · vs {s.bowlingTeam}</small></span>
            <span>{s.runs}-{s.wickets} <small style={{ display: 'inline' }}>({s.overs} Ov{s.oversLimit ? ` / ${s.oversLimit}` : ''})</small></span>
          </div>
          <div className="cb-kv">
            {Number(s.target) > 0 && <div>Target: <b>{s.target}</b></div>}
            {s.tossWinner && <div>Toss: <b>{tossLine(s)}</b></div>}
            {s.extras && <div>Extras: <b>{s.extras.total || 0} (b {s.extras.byes || 0}, lb {s.extras.legByes || 0}, w {s.extras.wides || 0}, nb {s.extras.noBalls || 0}, p {s.extras.penalty || 0})</b></div>}
            {(s.result || meta.result) && <div>Result: <b className="cb-res">{s.result || meta.result}</b></div>}
          </div>
        </div>

        {batters.length > 0 && (
          <div className="cb-card cb-flush cb-scroll">
            <table className="cb-tbl">
              <thead><tr><th>Batter (at the crease)</th><th>R</th><th>B</th><th>4s</th><th>6s</th></tr></thead>
              <tbody>
                {batters.map((b, i) => (
                  <tr key={i}>
                    <td><PlayerCell p={b} /></td>
                    <td className="r">{b.runs || 0}</td><td>{b.balls || 0}</td><td>{b.fours || 0}</td><td>{b.sixes || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bowlers.length > 0 && (
          <div className="cb-card cb-flush cb-scroll">
            <table className="cb-tbl">
              <thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th></tr></thead>
              <tbody>
                {bowlers.map((b, i) => {
                  const balls = (Number(b.overs) || 0) * 6 + (Number(b.ballsInOver) || 0);
                  return (
                    <tr key={i}>
                      <td><PlayerCell p={b} /></td>
                      <td>{b.overs || 0}.{b.ballsInOver || 0}</td>
                      <td>{b.maidens || 0}</td>
                      <td>{b.runsConceded || 0}</td>
                      <td className="r">{b.wickets || 0}</td>
                      <td>{rr(Number(b.runsConceded) || 0, balls)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className="cb-stack cb-pane">
      <div className="cb-card cb-hero">
        <div className="st">{meta.result ? 'RESULT' : 'MATCH IN PROGRESS'}</div>
        <div className="rs">{meta.result || `${team1} vs ${team2}`}</div>
        {inningsList.map((inn) => (
          <div key={inn.name} className="cb-hrow">
            <b className="tmx"><TeamBadge name={inn.battingTeam || inn.name} size={30} />{inn.battingTeam || inn.name}</b>
            <em>{inn.runs}-{inn.wickets}<small>({fmtOvers(inn.legalBalls)} Ov)</small></em>
          </div>
        ))}
      </div>

      {potm && <PotmCard potm={potm} />}

      <div className="cb-card cb-flush">
        <div className="cb-sec">Match info</div>
        <dl className="cb-info">
          <dt>Match</dt><dd>{team1} vs {team2}</dd>
          {meta.tossWinner && (<><dt>Toss</dt><dd>{tossLine(meta)}</dd></>)}
          {meta.totalOvers && (<><dt>Format</dt><dd>{meta.totalOvers} overs per innings{meta.playersPerTeam ? `, ${meta.playersPerTeam} players per team` : ''}</dd></>)}
          <dt>Result</dt><dd className={meta.result ? 'cb-res' : ''}>{meta.result || 'Match in progress / no result yet'}</dd>
        </dl>
      </div>

      {inningsList.map((inn) => {
        const topBat = [...inn.batters].sort((a, b) => b.runs - a.runs)[0];
        const topBowl = [...inn.bowlers].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
        return (
          <div key={inn.name} className="cb-card cb-flush">
            <div className="cb-sec">{inn.name}</div>
            <div className="cb-sum">
              <b>{inn.battingTeam || inn.name}</b>
              <em>{inn.runs}-{inn.wickets} <small>({fmtOvers(inn.legalBalls)} Ov)</small></em>
            </div>
            <div className="cb-chipr">
              <span className="cb-chip">RR <b>{rr(inn.runs, inn.legalBalls)}</b></span>
              <span className="cb-chip">Fours <b>{inn.fours}</b></span>
              <span className="cb-chip">Sixes <b>{inn.sixes}</b></span>
              <span className="cb-chip">Extras <b>{inn.extras.total}</b></span>
            </div>
            <div className="cb-kv">
              {topBat && <div>Top scorer: <b>{topBat.name} {topBat.runs} ({topBat.balls})</b></div>}
              {topBowl && <div>Best bowler: <b>{topBowl.name} {topBowl.wickets}/{topBowl.runs} ({fmtOvers(topBowl.legal)} Ov)</b></div>}
            </div>
          </div>
        );
      })}

      {meta.superOvers && meta.superOvers.length > 0 && (
        <div className="cb-card cb-so">
          <strong>Super Over</strong>
          {meta.superOvers.map((s, i) => (
            <div key={i} style={{ fontSize: 13, marginTop: 6 }}>
              Round {s.round}: {s.batFirst} {s.scores && s.scores[0] ? `${s.scores[0].runs}/${s.scores[0].wickets}` : '-'} vs {s.batSecond} {s.scores && s.scores[1] ? `${s.scores[1].runs}/${s.scores[1].wickets}` : '-'} — {s.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScorecard = (inn) => (
    <div className="cb-stack cb-pane">
      <div className="cb-card cb-flush">
        <div className="cb-inn-head">
          <span className="tmx"><TeamBadge name={inn.battingTeam || inn.name} size={38} /><span>{inn.battingTeam || inn.name}<small>{inn.name} · vs {inn.bowlingTeam}</small></span></span>
          <span className="sc">{inn.runs}-{inn.wickets} <small>({fmtOvers(inn.legalBalls)} Ov)</small></span>
        </div>
        <div className="cb-scroll">
          <table className="cb-tbl">
            <thead>
              <tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr>
            </thead>
            <tbody>
              {inn.batters.map((b) => (
                <tr key={b.key}>
                  <td>
                    <PlayerCell p={b} star={potmKey === b.key} />
                    <span className={`sub ${b.out ? 'out' : 'no'}`}>{dismissalText(b)}</span>
                    <span className="cb-share"><i style={{ width: `${inn.runs ? Math.round((b.runs / inn.runs) * 100) : 0}%` }} /></span>
                  </td>
                  <td className="r">{b.runs}</td>
                  <td>{b.balls}</td>
                  <td>{b.fours}</td>
                  <td>{b.sixes}</td>
                  <td>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Extras</strong></td>
                <td colSpan={5} style={{ textAlign: 'right' }}>{extrasLine(inn.extras)}</td>
              </tr>
              <tr className="tot">
                <td>Total</td>
                <td colSpan={5} style={{ textAlign: 'right' }}>{inn.runs}-{inn.wickets} ({fmtOvers(inn.legalBalls)} Ov) · RR {rr(inn.runs, inn.legalBalls)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="cb-card cb-flush cb-scroll">
        <table className="cb-tbl">
          <thead>
            <tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>NB</th><th>WD</th><th>ECO</th></tr>
          </thead>
          <tbody>
            {inn.bowlers.map((b) => (
              <tr key={b.key}>
                <td><PlayerCell p={b} star={potmKey === b.key} /></td>
                <td>{fmtOvers(b.legal)}</td>
                <td>{b.maidens}</td>
                <td>{b.runs}</td>
                <td className="r">{b.wickets}</td>
                <td>{b.nb}</td>
                <td>{b.wd}</td>
                <td>{rr(b.runs, b.legal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inn.fow.length > 0 && (
        <div className="cb-card cb-flush">
          <div className="cb-sec">Fall of wickets</div>
          <div className="cb-fow">
            {inn.fow.map((f, i) => (
              <span key={i}><b style={{ color: 'var(--ink)' }}>{f.score}-{f.wkt}</b> ({f.batter}, {f.over} ov){i < inn.fow.length - 1 ? ' · ' : ''}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Overs & commentary list the newest over first (like Cricbuzz); the data itself is unchanged
  const renderOvers = (inn) => {
    const maxR = Math.max(1, ...inn.overs.map((o) => o.runs));
    return (
    <div className="cb-stack cb-pane">
    <div className="cb-card cb-flush">
      <div className="cb-sec">Runs per over</div>
      <div className="cb-man">
        {inn.overs.map((ov) => (
          <div key={ov.over} className="cb-col">
            <span className="v">{ov.runs}</span>
            <i className={ov.wickets ? 'w' : ''} style={{ height: `${Math.max(6, (ov.runs / maxR) * 78)}%` }} />
            <span className="o">{ov.over + 1}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="cb-card cb-flush">
      {[...inn.overs].reverse().map((ov) => (
        <div key={ov.over} className="cb-ov">
          <b className="ovn">Ov {ov.over + 1}</b>
          <div>
            <div className="bn">{ov.bowlers.join(', ') || '-'}</div>
            <div className="cb-balls">{ov.items.map((e) => <BallChip key={e.id} e={e} />)}</div>
          </div>
          <div className="rt">
            <b>{ov.runs} runs{ov.wickets ? ` · ${ov.wickets}W` : ''}</b>
            {ov.endScore ? `${ov.endScore.runs}-${ov.endScore.wickets}` : '-'}
          </div>
        </div>
      ))}
    </div>
    </div>
    );
  };

  const keep = (e) => cf === 'all' || (cf === 'w' ? !!e.wicket : e.batRuns === 4 || e.batRuns === 6);
  const renderBalls = (inn) => (
    <div className="cb-stack cb-pane">
      <div className="cb-fil">
        {[['all', 'All'], ['w', 'Wickets'], ['b', 'Boundaries']].map(([id, l]) => (
          <button key={id} type="button" className={`cb-tab${cf === id ? ' on' : ''}`} onClick={() => setCf(id)}>{l}</button>
        ))}
      </div>
      {[...inn.overs].filter((ov) => ov.items.some(keep)).reverse().map((ov) => (
        <div key={ov.over} className="cb-card cb-flush">
          <div className="cb-eo">
            <b>End of over {ov.over + 1} · {ov.runs} runs{ov.wickets ? `, ${ov.wickets} wkt` : ''}</b>
            <span>{ov.endScore ? `${inn.battingTeam} ${ov.endScore.runs}-${ov.endScore.wickets}` : ''}</span>
          </div>
          <div className="cb-eo" style={{ borderTop: 0, background: 'var(--card)', color: 'var(--mute)' }}>
            <span>{ov.bowlers.join(', ') || '-'}</span>
          </div>
          {[...ov.items].filter(keep).reverse().map((e) => (
            <div key={e.id} className={`cb-com${e.wicket ? ' w' : e.batRuns === 6 ? ' s' : e.batRuns === 4 ? ' f' : ''}`}>
              <span className="no">{ballLabel(e)}</span>
              <BallChip e={e} />
              <span className="tx">{describeBall(e)}</span>
              {e.scoreAfter && <span className="sc">{e.scoreAfter.runs}-{e.scoreAfter.wickets}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="cb-root">
      <style>{CB_CSS}</style>
      <div className="cb-bar">
        <button type="button" className="cb-back" onClick={onClose} aria-label="Back">&larr;</button>
        <div className="cb-bar-t">
          <b>{team1} vs {team2}</b>
          <span>MATCH CENTRE{meta.totalOvers ? ` · ${meta.totalOvers} OVERS` : ''}</span>
        </div>
        {barSlot && <div className="cb-bar-r">{barSlot}</div>}
      </div>

      <div className="cb-wrap">
        {/* live match header (or anything the parent passes) */}
        {topSlot}

        {loading ? (
          <div className="cb-stack"><div className="cb-skel" /><div className="cb-skel" style={{ height: 200 }} /><div className="cb-skel" /></div>
        ) : log.length === 0 ? (
          <div className="cb-stack">
            {hasSnapshot ? renderSnapshot() : (
              <div className="cb-card cb-empty">
                Ball-by-ball history is not available for this match yet.
                {meta.result ? <div className="cb-res" style={{ marginTop: 8 }}>{meta.result}</div> : null}
              </div>
            )}
            {/* squads are visible even before the first ball */}
            {squads}
          </div>
        ) : (
          <>
            {/* tab order: Summary -> 1st Innings -> 2nd Innings -> Insights -> Broadcast (-> Squads) */}
            <div className="cb-tabs">
              {tabBtn('summary', 'Summary')}
              {inningsList.map((i) => tabBtn(i.name, i.name))}
              {tabBtn('insights', 'Insights')}
              {tabBtn('broadcast', 'Broadcast')}
              {squads && tabBtn('squads', 'Squads')}
            </div>

            {tab === 'summary' && <div key="sum">{renderSummary()}</div>}
            {tab === 'insights' && <div key="ins"><InsightsPane inningsList={inningsList} log={log} limit={Number(meta.totalOvers) || 20} /></div>}
            {tab === 'broadcast' && <div key="bc"><BroadcastPane log={log} inningsList={inningsList} meta={meta} live={live} potm={potm} limit={Number(meta.totalOvers) || 20} /></div>}
            {tab === 'squads' && <div key="sq" className="cb-pane">{squads}</div>}

            {active && (
              <>
                <div className="cb-seg">
                  {[['scorecard', 'Scorecard'], ['overs', 'Overs'], ['balls', 'Commentary']].map(([id, label]) => (
                    <button key={id} type="button" className={`cb-pill${view === id ? ' on' : ''}`} onClick={() => setView(id)}>
                      {label}
                    </button>
                  ))}
                </div>
                <div key={`${tab}-${view}`}>
                  {view === 'scorecard' && renderScorecard(active)}
                  {view === 'overs' && renderOvers(active)}
                  {view === 'balls' && renderBalls(active)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MatchHistoryView;