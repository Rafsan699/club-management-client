import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

/* =====================================================================
 *  LiveMatch  (route: /sports/cricket/live)
 *  Finds the most recent running match and sends the viewer to the page
 *  of the tournament it belongs to:
 *     inter     -> /sports/cricket/inter-schedule?id=<tournamentId>&match=<matchId>
 *     central   -> /sports/cricket/central-schedule?id=...&match=...
 *     franchise -> /sports/cricket/franchise-schedule?id=...&match=...
 *  If the tournament type can't be detected, it opens the Live Match Center instead.
 * ===================================================================== */

// cTournament.category -> schedule page
const CATEGORY_TO_KIND = {
  inter_university: 'inter',
  central_tournament: 'central',
  franchise_tournament: 'franchise'
};

const detectKind = (t) => (t && CATEGORY_TO_KIND[t.category]) || null;

const buildPath = (data) => {
  const kind = detectKind(data.tournament);
  if (kind && data.tournamentId) {
    return `/sports/cricket/${kind}-schedule?id=${data.tournamentId}&match=${data.matchId}`;
  }
  return `/sports/cricket/match/${data.matchId}`; // type চেনা না গেলে Live Match Center
};

const LiveMatch = () => {
  const navigate = useNavigate();
  const [noLive, setNoLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const check = async () => {
      try {
        const res = await API.get('/api/cricket/live-score/latest-live');
        if (cancelled) return;
        if (res.data && res.data.found) {
          navigate(buildPath(res.data), { replace: true });
          return;
        }
        setNoLive(true);
      } catch (err) {
        console.error('Could not check live match:', err);
        if (!cancelled) setNoLive(true);
      }
      // কোনো ম্যাচ চলছে না: ১০ সেকেন্ড পর পর আবার দেখা, শুরু হলেই নিজে চলে যাবে
      if (!cancelled) timer = setTimeout(check, 10000);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate]);

  if (!noLive) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#fff', fontSize: 18 }}>Finding live match...</div>;
  }

  return (
    <div style={{ padding: 24, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 28, marginBottom: 16, borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
        Live Matches
      </h2>
      <div style={{ background: '#0c2145', padding: 30, borderRadius: 12, textAlign: 'center', color: '#9fb3d6', fontSize: 18 }}>
        No match is live right now. This page will open the match automatically as soon as one starts.
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={() => navigate('/sports/cricket/tournament')}
            style={{ padding: '10px 18px', background: '#3ddc84', color: '#06101f', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
          >
            View Tournaments
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveMatch;