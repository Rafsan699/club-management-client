import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGet, useLiveSocket, BASE, fmtDate } from './bdApi';
import PageHead from './PageHead';
import Scoreboard from './Scoreboard';

export default function BadmintonMatch() {
  const { id } = useParams();
  const { data, loading } = useGet(`/match/${id}`);
  const [m, setM] = useState(null);
  useEffect(() => { if (data) setM(data); }, [data]);
  useLiveSocket((u) => { if (u._id === id) setM(u); });
  if (loading && !m) return <div className="bd-empty">Loading…</div>;
  if (!m) return <div className="bd-empty">Match not found</div>;
  const events = (m.history || []).slice().reverse();
  const label = (e) => {
    if (e.type === 'point') return `Point - ${e.side === 'A' ? m.teamA.name : m.teamB.name}`;
    return e.note;
  };
  return (
    <>
      <PageHead title={`${m.teamA.name} vs ${m.teamB.name}`} sub={`${m.tournament ? m.tournament.name : ''} · ${m.round || ''}`} />
      <div className="bd-tabs"><Link className="bd-btn ghost" to={m.tournament ? `${BASE}/schedule/${m.tournament._id}` : `${BASE}/schedule`}>← Schedule</Link></div>
      <Scoreboard m={m} />
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', marginTop: 16 }}>
        <div className="bd-card">
          <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>Match info</h3>
          <table className="bd-tbl"><tbody>
            {[['Tournament', m.tournament && m.tournament.name], ['Round', m.round], ['Match no.', m.matchNo], ['Date', fmtDate(m.scheduledAt)], ['Venue', m.venue], ['Court', m.court], ['Umpire', m.umpire], ['Format', `Best of ${m.bestOf}, ${m.pointsToWin} pts, cap ${m.cap}`]].filter((r) => r[1]).map(([k, v]) => (
              <tr key={k}><td style={{ textAlign: 'left', color: 'var(--mut)' }}>{k}</td><td style={{ textAlign: 'right' }}>{v}</td></tr>))}
          </tbody></table>
          <h3 style={{ margin: '14px 0 8px', fontSize: 22 }}>Game by game</h3>
          {(m.games || []).length === 0 ? <div className="bd-mut">Not started</div> : (
            <table className="bd-tbl"><thead><tr><th>Game</th><th style={{ textAlign: 'left' }}>Score</th></tr></thead><tbody>
              {m.games.map((g, i) => <tr key={i}><td>{i + 1}</td><td style={{ textAlign: 'left' }}><b>{g.a}</b> - <b>{g.b}</b></td></tr>)}</tbody></table>)}
        </div>
        <div className="bd-card">
          <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>Match history {m.status === 'live' && <span className="bd-pill live">live</span>}</h3>
          {events.length === 0 ? <div className="bd-mut">No events yet</div> : (
            <ul className="bd-tl" style={{ maxHeight: 460, overflow: 'auto' }}>
              {events.map((e, i) => (
                <li key={i}>
                  {e.type === 'point' ? <><span className="sc">{e.a}-{e.b}</span><span>G{e.game} · {label(e)}</span></> : <span className="ev">{label(e)}{e.type === 'game_end' ? ` (${e.a}-${e.b})` : ''}</span>}
                </li>))}
            </ul>)}
        </div>
      </div>
    </>
  );
}