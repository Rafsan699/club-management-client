import React, { useState } from 'react';
import { useGet, img, initials } from './bdApi';
import PageHead from './PageHead';
import PlayerModal, { Avatar } from './PlayerModal';

export default function BadmintonTeam() {
  const [type, setType] = useState('double');
  const [tid, setTid] = useState('');
  const [team, setTeam] = useState(null);
  const [pid, setPid] = useState(null);
  const { data: tours } = useGet('/tournaments');
  const { data, loading } = useGet('/teams');
  const list = (data || []).filter((t) => (type === 'all' || t.type === type) && (!tid || (t.tournament && t.tournament._id === tid)));
  return (
    <>
      <PageHead title="Teams" sub="Doubles pairs and singles entries" />
      <div className="bd-tabs">
        {[['double', 'Doubles teams'], ['single', 'Singles'], ['all', 'All']].map(([k, l]) => <button key={k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>{l}</button>)}
        <select value={tid} onChange={(e) => setTid(e.target.value)}><option value="">All tournaments</option>{(tours || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select>
      </div>
      {loading ? <div className="bd-empty">Loading…</div> : list.length === 0 ? <div className="bd-empty">No team found</div> : (
        <div className="bd-grid">{list.map((t) => (
          <div key={t._id} className="bd-card bd-click" onClick={() => setTeam(t)}>
            <div className="bd-row" style={{ gap: 12 }}>
              {t.logo ? <img src={img(t.logo)} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }} /> : <div className="bd-av" style={{ borderRadius: 12, width: 52, height: 52 }}>{initials(t.name)}</div>}
              <div><h3 style={{ margin: 0, fontSize: 22 }}>{t.name}</h3><div className="bd-mut">{t.tournament ? t.tournament.name : 'No tournament'}{t.group ? ` · Group ${t.group}` : ''}</div></div>
            </div>
            <div className="bd-row" style={{ marginTop: 12 }}>{t.players.map((p) => <Avatar key={p._id} p={p} />)}</div>
          </div>))}</div>)}

      {team && (
        <div className="bd-modal" onClick={() => setTeam(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <button className="bd-x" onClick={() => setTeam(null)}>×</button>
            <h2 style={{ margin: '0 0 4px', fontSize: 30 }}>{team.name}</h2>
            <div className="bd-mut" style={{ marginBottom: 14 }}>{team.type === 'double' ? 'Doubles' : 'Singles'} · {team.tournament ? team.tournament.name : ''} · tap a player for profile</div>
            <div style={{ display: 'grid', gap: 10 }}>{team.players.map((p) => (
              <div key={p._id} className="bd-card bd-click bd-row" style={{ gap: 14 }} onClick={() => setPid(p._id)}>
                <Avatar p={p} lg />
                <div><h3 style={{ margin: 0, fontSize: 22 }}>{p.name}</h3><div className="bd-mut">{[p.department, p.batch && `Batch ${p.batch}`].filter(Boolean).join(' · ')}</div><span className="bd-pill" style={{ marginTop: 6 }}>View profile & performance</span></div>
              </div>))}</div>
          </div>
        </div>)}
      <PlayerModal id={pid} onClose={() => setPid(null)} />
    </>
  );
}