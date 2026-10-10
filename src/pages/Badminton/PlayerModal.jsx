import React from 'react';
import { useGet, img, initials, BASE } from './bdApi';
import { Link } from 'react-router-dom';

export function Avatar({ p, lg }) {
  return <div className={`bd-av ${lg ? 'lg' : ''}`}>{p && p.photo ? <img src={img(p.photo)} alt={p.name} /> : initials(p && p.name)}</div>;
}

export default function PlayerModal({ id, onClose }) {
  const { data, loading } = useGet(id ? `/players/${id}/stats` : null);
  if (!id) return null;
  const p = data && data.player, s = data && data.stats;
  return (
    <div className="bd-modal" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <button className="bd-x" onClick={onClose}>×</button>
        {loading || !p ? <div className="bd-empty">Loading…</div> : (
          <>
            <div className="bd-row" style={{ gap: 16 }}>
              <Avatar p={p} lg />
              <div>
                <h2 style={{ margin: 0, fontSize: 30 }}>{p.name}</h2>
                <div className="bd-mut">{[p.department, p.batch && `Batch ${p.batch}`, p.hand && `${p.hand}-handed`].filter(Boolean).join(' · ')}</div>
                <div className="bd-form" style={{ marginTop: 8 }}>{s.form.length ? s.form.map((f, i) => <span key={i} className={f}>{f}</span>) : <span className="bd-mut">No matches yet</span>}</div>
              </div>
            </div>
            {p.bio && <p style={{ marginTop: 14 }}>{p.bio}</p>}
            <div className="bd-kv">
              <div><b>{s.played}</b><span>Matches</span></div>
              <div><b>{s.won}</b><span>Wins</span></div>
              <div><b>{s.lost}</b><span>Losses</span></div>
              <div><b>{s.winRate}%</b><span>Win rate</span></div>
              <div><b>{s.gamesWon}-{s.gamesLost}</b><span>Games W-L</span></div>
              <div><b>{s.pointsScored}</b><span>Points scored</span></div>
              <div><b>{s.singles.won}/{s.singles.played}</b><span>Singles</span></div>
              <div><b>{s.doubles.won}/{s.doubles.played}</b><span>Doubles</span></div>
            </div>
            {data.teams && data.teams.length > 0 && <p className="bd-mut">Teams: {data.teams.map((t) => `${t.name}${t.tournament ? ` (${t.tournament.name})` : ''}`).join(' · ')}</p>}
            <h3 style={{ fontSize: 20, margin: '14px 0 6px' }}>Recent matches</h3>
            {s.recent.length === 0 ? <div className="bd-mut">No completed matches</div> : (
              <ul className="bd-tl">
                {s.recent.map((r, i) => (
                  <li key={i}>
                    <span className="bd-form"><span className={r.result}>{r.result}</span></span>
                    <div style={{ flex: 1 }}><Link to={`${BASE}/match/${r.matchId}`} onClick={onClose}>vs {r.opponent}</Link><div className="bd-mut">{r.tournament}</div></div>
                    <span className="bd-mut">{r.score}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}