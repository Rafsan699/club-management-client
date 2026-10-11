import React, { useEffect, useState } from 'react';
import { useGet } from './bdApi';
import PlayerOfTournament from './PlayerOfTournament';

// Tournament select kore "Player of the Tournament" dekhar page
export default function BadmintonAwards() {
  const { data: tours, loading, error } = useGet('/tournaments');
  const [tid, setTid] = useState('');

  // default: shesh hoye jawa ba cholte thaka tournament
  useEffect(() => {
    if (tid || !tours || !tours.length) return;
    const pick = tours.find((t) => t.status === 'completed') || tours.find((t) => t.status === 'ongoing') || tours[0];
    setTid(pick._id);
  }, [tours, tid]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <h1 style={{ fontSize: 34, fontWeight: 700, margin: '0 0 6px' }}>Player of the Tournament</h1>
      <p style={{ opacity: 0.7, margin: '0 0 18px' }}>Calculated automatically from match performance and updated live with every point.</p>

      {loading && <p>Loading…</p>}
      {error && <p>{error}</p>}
      {tours && !tours.length && <p>No tournaments yet.</p>}

      {tours && tours.length > 0 && (
        <>
          <select value={tid} onChange={(e) => setTid(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, marginBottom: 16, maxWidth: '100%' }}>
            {tours.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.status})</option>)}
          </select>
          {tid && <PlayerOfTournament key={tid} tournamentId={tid} />}
        </>
      )}
    </div>
  );
}