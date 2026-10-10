import React from 'react';
import { initials } from './bdApi';

const over = (g, m) => { const s = Math.max(g.a, g.b), o = Math.min(g.a, g.b); return (s >= m.pointsToWin && s - o >= 2) || s >= m.cap; };
const names = (t) => (t && t.players ? t.players.map((p) => p.name).join(' & ') : '');

// Professional-style scoreboard (BWF)
export default function Scoreboard({ m, compact }) {
  const games = m.games && m.games.length ? m.games : [];
  const cols = Math.max(m.bestOf || 3, games.length, 1);
  const shown = Array.from({ length: m.status === 'scheduled' ? m.bestOf || 3 : cols });
  let A = 0, B = 0;
  games.forEach((g) => { if (over(g, m)) g.a > g.b ? A++ : B++; });
  const cur = games[m.currentGame];
  const last = (m.history || [])[(m.history || []).length - 1];
  const interval = m.status === 'live' && last && last.type === 'interval';
  const srvScore = cur ? (m.serving === 'A' ? cur.a : cur.b) : 0;
  const decider = m.currentGame + 1 === m.bestOf;
  const gamePoint = cur && m.status === 'live' && (() => {
    const hi = Math.max(cur.a, cur.b), lo = Math.min(cur.a, cur.b);
    return hi >= m.pointsToWin - 1 && hi - lo >= 1 ? (cur.a > cur.b ? 'A' : 'B') : null;
  })();
  const row = (side) => {
    const t = side === 'A' ? m.teamA : m.teamB;
    const won = m.status === 'completed' && m.winner === side;
    return (
      <div className={`bd-sb-row ${won ? 'win' : ''}`} style={{ '--g': shown.length }}>
        <span>{m.status === 'live' && m.serving === side ? <i className="bd-sb-srv" title="Serving" /> : null}</span>
        <div className="bd-sb-name">{t ? t.name || initials('') : 'TBD'}{won ? ' 🏆' : ''}
          {t && t.type === 'double' && <small>{names(t)}</small>}</div>
        {shown.map((_, i) => {
          const g = games[i];
          const done = g && over(g, m);
          const mine = g ? (side === 'A' ? g.a : g.b) : '';
          const theirs = g ? (side === 'A' ? g.b : g.a) : 0;
          return <div key={`${i}-${mine}`} className={`bd-sb-g ${g && !done && m.status === 'live' && i === m.currentGame ? 'cur' : ''} ${done && mine > theirs ? 'won' : ''}`}>{g ? mine : '-'}</div>;
        })}
        <div className="bd-sb-sets">{side === 'A' ? A : B}</div>
      </div>
    );
  };
  return (
    <div className={`bd-sb ${m.status}`}>
      <div className="bd-sb-top">
        {m.status === 'live' ? <span className="bd-pill live">Live</span> : m.status === 'completed' ? <span className="bd-pill done">{m.walkover ? 'Walkover' : 'Full time'}</span> : <span className="bd-pill amb">Scheduled</span>}
        <span>{m.tournament && m.tournament.name}{m.round ? ` · ${m.round}` : ''}</span>
        <span className="r">Best of {m.bestOf} · {m.pointsToWin} pts{m.court ? ` · Court ${m.court}` : ''}</span>
      </div>
      {row('A')}
      {row('B')}
      {!compact && m.status === 'live' && (
        <div className="bd-sb-note">
          <span>Game <b>{m.currentGame + 1}</b>{decider ? ' (deciding)' : ''}</span>
          <span>Serving: <b>{m.serving === 'A' ? (m.teamA && m.teamA.name) : (m.teamB && m.teamB.name)}</b> from <b>{srvScore % 2 === 0 ? 'right' : 'left'}</b> court</span>
          {gamePoint && <span><b>Game point</b> - {gamePoint === 'A' ? m.teamA.name : m.teamB.name}</span>}
          {interval && <span><b>Interval</b>{decider ? ' · change ends' : ''}</span>}
        </div>
      )}
      {m.status === 'scheduled' && <div className="bd-sb-note"><span>Match has not started yet</span></div>}
    </div>
  );
}