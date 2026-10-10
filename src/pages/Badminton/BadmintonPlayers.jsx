import React, { useState } from 'react';
import { useGet } from './bdApi';
import PageHead from './PageHead';
import PlayerModal, { Avatar } from './PlayerModal';

export default function BadmintonPlayers() {
  const { data, loading } = useGet('/players-board');
  const [q, setQ] = useState('');
  const [pid, setPid] = useState(null);
  const list = (data || []).filter((x) => x.player.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Players" sub="Performance, stats and profiles" />
      <div className="bd-tabs"><input className="bd-in" placeholder="Search player…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {loading ? <div className="bd-empty">Loading…</div> : list.length === 0 ? <div className="bd-empty">No player found</div> : (
        <div className="bd-grid">{list.map(({ player, stats }, i) => (
          <div key={player._id} className="bd-card bd-click" onClick={() => setPid(player._id)}>
            <div className="bd-row" style={{ gap: 12 }}><Avatar p={player} /><div style={{ flex: 1 }}><b style={{ fontSize: 17 }}>{player.name}</b><div className="bd-mut">{player.department || '—'}</div></div><span className="bd-pill">#{i + 1}</span></div>
            <div className="bd-kv"><div><b>{stats.played}</b><span>Played</span></div><div><b>{stats.won}</b><span>Won</span></div><div><b>{stats.winRate}%</b><span>Win rate</span></div></div>
            <div className="bd-form">{stats.form.map((f, k) => <span key={k} className={f}>{f}</span>)}</div>
          </div>))}</div>)}
      <PlayerModal id={pid} onClose={() => setPid(null)} />
    </>
  );
}