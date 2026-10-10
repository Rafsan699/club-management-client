import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGet, useLiveSocket, BASE, fmtDate, img } from './bdApi';
import PageHead from './PageHead';
import MatchCard from './MatchCard';
import PlayerModal, { Avatar } from './PlayerModal';

export default function BadmintonHome() {
  const { data, loading, reload } = useGet('/overview');
  const [pid, setPid] = useState(null);
  useLiveSocket(() => reload());
  if (loading && !data) return <div className="bd-empty">Loading…</div>;
  if (!data) return <div className="bd-empty">Could not load data</div>;
  const c = data.counts;
  return (
    <>
      <PageHead title="Badminton" sub="BRIU Sports Club · tournaments, live scores, rankings" />
      <div className="bd-stats">
        {[['Tournaments', c.tournaments], ['Ongoing', c.ongoing], ['Players', c.players], ['Teams', c.teams], ['Matches', c.matches], ['Live now', c.live]].map(([l, v]) => (
          <div className="bd-stat" key={l}><b>{v}</b><span>{l}</span></div>
        ))}
      </div>

      <h2 className="bd-h">Tournament types</h2>
      <div className="bd-grid">
        <Link to={`${BASE}/tournament?type=single`} className="bd-card bd-click"><h3 style={{ margin: 0, fontSize: 26 }}>🏸 Singles</h3><p className="bd-mut">One player vs one player</p><span className="bd-pill">{c.single} tournaments</span></Link>
        <Link to={`${BASE}/tournament?type=double`} className="bd-card bd-click"><h3 style={{ margin: 0, fontSize: 26 }}>🏸🏸 Doubles</h3><p className="bd-mut">Two-player teams</p><span className="bd-pill">{c.double} tournaments</span></Link>
      </div>

      {data.live.length > 0 && (<><h2 className="bd-h"><span className="bd-pill live">Live</span> Happening now <small><Link to={`${BASE}/live`}>Open live centre →</Link></small></h2>
        <div className="bd-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))' }}>{data.live.map((m) => <MatchCard key={m._id} m={m} />)}</div></>)}

      <h2 className="bd-h">Active tournaments <small><Link to={`${BASE}/tournament`}>All →</Link></small></h2>
      {data.tournaments.length === 0 ? <div className="bd-empty">No active tournament</div> : (
        <div className="bd-grid">{data.tournaments.map((t) => (
          <Link key={t._id} to={`${BASE}/schedule/${t._id}`} className="bd-card bd-click">
            <h3 style={{ margin: 0, fontSize: 22 }}>{t.name}</h3>
            <div className="bd-mut">{fmtDate(t.startDate, false)} → {fmtDate(t.endDate, false)}</div>
            <div style={{ marginTop: 8 }}><span className="bd-pill">{t.type}</span> <span className="bd-pill amb">{t.status}</span></div>
          </Link>))}</div>)}

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))' }}>
        <div><h2 className="bd-h">Upcoming</h2>{data.upcoming.length === 0 ? <div className="bd-empty">No upcoming match</div> : <div style={{ display: 'grid', gap: 12 }}>{data.upcoming.map((m) => <MatchCard key={m._id} m={m} />)}</div>}</div>
        <div><h2 className="bd-h">Latest results</h2>{data.recent.length === 0 ? <div className="bd-empty">No result yet</div> : <div style={{ display: 'grid', gap: 12 }}>{data.recent.map((m) => <MatchCard key={m._id} m={m} />)}</div>}</div>
      </div>

      <h2 className="bd-h">Top performers <small><Link to={`${BASE}/players`}>All players →</Link></small></h2>
      {data.top.length === 0 ? <div className="bd-empty">Stats will appear after the first match</div> : (
        <div className="bd-grid">{data.top.map(({ player, stats }, i) => (
          <div key={player._id} className="bd-card bd-click bd-row" onClick={() => setPid(player._id)}>
            <b className="cond" style={{ fontSize: 26, color: 'var(--acc)', width: 26 }}>{i + 1}</b><Avatar p={player} />
            <div><b>{player.name}</b><div className="bd-mut">{stats.won}W · {stats.lost}L · {stats.winRate}% win</div></div>
          </div>))}</div>)}
      <PlayerModal id={pid} onClose={() => setPid(null)} />
    </>
  );
}