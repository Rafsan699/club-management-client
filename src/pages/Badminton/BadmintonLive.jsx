import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGet, useLiveSocket, BASE, fmtDate } from './bdApi';
import PageHead from './PageHead';
import MatchCard from './MatchCard';

export default function BadmintonLive() {
  const { data, loading } = useGet('/matches?status=live,scheduled');
  const [matches, setMatches] = useState([]);
  useEffect(() => { if (data) setMatches(data); }, [data]);
  const connected = useLiveSocket((m) => setMatches((prev) => {
    const rest = prev.filter((x) => x._id !== m._id);
    return m.status === 'completed' ? rest : [...rest, m];
  }));
  const live = matches.filter((m) => m.status === 'live');
  const next = matches.filter((m) => m.status === 'scheduled').sort((a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0)).slice(0, 4);
  return (
    <>
      <PageHead title="Live matches" sub={connected ? 'Connected - scores update instantly' : 'Connecting…'} />
      {loading ? <div className="bd-empty">Loading…</div> : live.length === 0 ? (
        <div className="bd-card bd-empty">No match is live right now.</div>
      ) : (
        <div className="bd-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))' }}>{live.map((m) => <MatchCard key={m._id} m={m} />)}</div>
      )}
      {next.length > 0 && (<><h2 className="bd-h">Up next <small><Link to={`${BASE}/schedule`}>Full schedule →</Link></small></h2>
        <div className="bd-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))' }}>{next.map((m) => <MatchCard key={m._id} m={m} />)}</div></>)}
    </>
  );
}