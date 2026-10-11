import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGet, BASE, fmtDate } from './bdApi';
import PageHead from './PageHead';
import PlayerOfTournament from './PlayerOfTournament';

export default function BadmintonTournament() {
  const [sp, setSp] = useSearchParams();
  const [openPot, setOpenPot] = useState(''); // kon tournament e Player of the Tournament khola ache
  const type = sp.get('type') || 'all';
  const { data, loading } = useGet('/tournaments');
  const list = (data || []).filter((t) => type === 'all' || t.type === type);
  return (
    <>
      <PageHead title="Tournaments" sub="All badminton tournaments" />
      <div className="bd-tabs">
        {[['all', 'All'], ['single', 'Singles'], ['double', 'Doubles']].map(([k, l]) => (
          <button key={k} className={type === k ? 'on' : ''} onClick={() => setSp(k === 'all' ? {} : { type: k })}>{l}</button>))}
      </div>
      {loading ? <div className="bd-empty">Loading…</div> : list.length === 0 ? <div className="bd-empty">No tournament found</div> : (
        <div className="bd-grid">{list.map((t) => {
          const multi = (t.groupCount || 1) > 1 || (t.roundCount || 1) > 1;
          const potOpen = openPot === t._id;
          return (
            <div key={t._id} className="bd-card">
              <div className="bd-row" style={{ justifyContent: 'space-between' }}><h3 style={{ margin: 0, fontSize: 24 }}>{t.name}</h3><span className="bd-pill">{t.type}</span></div>
              <div className="bd-mut" style={{ margin: '6px 0' }}>{fmtDate(t.startDate, false)} → {fmtDate(t.endDate, false)}{t.venue ? ` · ${t.venue}` : ''}</div>
              {t.description && <p style={{ margin: '6px 0', fontSize: 14 }}>{t.description}</p>}
              <div className="bd-mut">Best of {t.bestOf} · {t.pointsToWin} points · cap {t.cap}</div>
              {multi && (
                <div className="bd-mut">
                  {t.groupCount} group · {t.roundCount} round · top {t.advancePerGroup} of each group advance
                  {t.currentStage > 1 || t.status === 'ongoing' ? ` · now round ${t.currentStage || 1}` : ''}
                </div>
              )}
              <div className="bd-row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
                <span className={`bd-pill ${t.status === 'ongoing' ? 'live' : t.status === 'completed' ? 'done' : 'amb'}`}>{t.status}</span>
                <Link className="bd-btn ghost" to={`${BASE}/schedule/${t._id}`}>Schedule</Link>
                <Link className="bd-btn ghost" to={`${BASE}/point-table?t=${t._id}`}>Table</Link>
                {t.status !== 'upcoming' && (
                  <button type="button" className="bd-btn ghost" onClick={() => setOpenPot(potOpen ? '' : t._id)}>
                    {potOpen ? 'Hide player of the tournament' : 'Player of the tournament'}
                  </button>
                )}
              </div>
              {potOpen && (
                <div style={{ marginTop: 14 }}>
                  <PlayerOfTournament tournamentId={t._id} />
                </div>
              )}
            </div>);
        })}</div>)}
    </>
  );
}