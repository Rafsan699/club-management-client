import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGet, useLiveSocket, BASE, fmtDate } from './bdApi';
import PageHead from './PageHead';

const over = (g, m) => { const s = Math.max(g.a, g.b), o = Math.min(g.a, g.b); return (s >= m.pointsToWin && s - o >= 2) || s >= m.cap; };

export default function BadmintonSchedule() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState('all');
  const { data: tours, loading: l1 } = useGet(id ? null : '/tournaments');
  const { data: tour } = useGet(id ? `/tournaments/${id}` : null);
  const { data: ms, loading: l2, reload } = useGet(id ? `/matches?tournament=${id}` : null);
  useLiveSocket(() => id && reload());

  if (!id) return (
    <>
      <PageHead title="Schedule" sub="Select a tournament to see its matches" />
      {l1 ? <div className="bd-empty">Loading…</div> : (tours || []).length === 0 ? <div className="bd-empty">No tournament</div> : (
        <div className="bd-grid">{tours.map((t) => (
          <div key={t._id} className="bd-card bd-click" onClick={() => nav(`${BASE}/schedule/${t._id}`)}>
            <h3 style={{ margin: 0, fontSize: 22 }}>{t.name}</h3><div className="bd-mut">{fmtDate(t.startDate, false)} → {fmtDate(t.endDate, false)}</div>
            <div style={{ marginTop: 8 }}><span className="bd-pill">{t.type}</span> <span className="bd-pill amb">{t.status}</span></div>
          </div>))}</div>)}
    </>
  );

  const list = (ms || []).filter((m) => f === 'all' || m.status === f);
  // round section gulo stage (1, 2, 3...) onujayi, tarpor group name onujayi sajano
  const stageOf = (m) => m.stage || 1;
  const rounds = [...new Set(list.map((m) => m.round || 'Matches'))].sort((x, y) => {
    const sx = Math.min(...list.filter((m) => (m.round || 'Matches') === x).map(stageOf));
    const sy = Math.min(...list.filter((m) => (m.round || 'Matches') === y).map(stageOf));
    return sx - sy || x.localeCompare(y);
  });
  return (
    <>
      <PageHead title={tour ? tour.name : 'Schedule'} sub={tour ? `${tour.type === 'double' ? 'Doubles' : 'Singles'} · match schedule` : ''} />
      <div className="bd-tabs">
        <Link className="bd-btn ghost" to={`${BASE}/schedule`}>← Tournaments</Link>
        {['all', 'scheduled', 'live', 'completed'].map((k) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{k[0].toUpperCase() + k.slice(1)}</button>)}
      </div>
      {l2 ? <div className="bd-empty">Loading…</div> : list.length === 0 ? <div className="bd-empty">No match found</div> : rounds.map((r) => (
        <div key={r}>
          <h2 className="bd-h">{r}</h2>
          <div style={{ display: 'grid', gap: 10 }}>{list.filter((m) => (m.round || 'Matches') === r).map((m) => {
            const gw = (k) => (m.games || []).filter((g) => over(g, m) && (k === 'A' ? g.a > g.b : g.b > g.a)).length;
            return (
              <Link key={m._id} to={`${BASE}/match/${m._id}`} className="bd-card bd-click bd-mrow">
                <div><div className="bd-mut">#{m.matchNo || '-'}</div><b>{fmtDate(m.scheduledAt)}</b><div className="bd-mut">{m.venue}{m.court ? ` · Court ${m.court}` : ''}</div></div>
                <div><b style={{ fontSize: 17, color: m.winner === 'A' ? 'var(--pri)' : undefined }}>{m.teamA && m.teamA.name}</b> <span className="bd-mut">vs</span> <b style={{ fontSize: 17, color: m.winner === 'B' ? 'var(--pri)' : undefined }}>{m.teamB && m.teamB.name}</b></div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`bd-pill ${m.status === 'live' ? 'live' : m.status === 'completed' ? 'done' : 'amb'}`}>{m.status}</span>
                  {m.status !== 'scheduled' && <div className="cond" style={{ fontSize: 20, marginTop: 4 }}>{gw('A')} - {gw('B')}</div>}
                </div>
              </Link>);
          })}</div>
        </div>))}
    </>
  );
}