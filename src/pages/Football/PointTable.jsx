import React, { useEffect, useState } from 'react';
import FAPI, { usePolling } from './footballApi';
import StandingsTable, { formatLabel, tiebreakText } from './StandingsTable';

/* Palette (same as the Cricket home)
   bg #060912 · ink #eef2ff · soft #93a0bd · line white/10
   gold #f2c14e · cyan #3dd6d0 · violet #a78bfa · live #ff4d6d · button text #0a0e1c */

const GOLD = '#f2c14e';
const CYAN = '#3dd6d0';
const VIOLET = '#a78bfa';

const glass = 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10';
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c14e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060912]';
const STATUS = {
  ongoing: { label: 'Live now', cls: 'bg-[#ff4d6d] text-white shadow-[0_0_22px_-4px_#ff4d6d]', dot: 'bg-white animate-pulse motion-reduce:animate-none' },
  upcoming: { label: 'Upcoming', cls: 'bg-[#f2c14e]/15 text-[#f2c14e] border border-[#f2c14e]/35', dot: 'bg-[#f2c14e]' },
  completed: { label: 'Completed', cls: 'bg-white/10 text-[#93a0bd]', dot: 'bg-[#93a0bd]' },
};

const Ambient = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
    <span className="absolute rounded-full w-[560px] h-[560px] -top-44 -left-36 opacity-[0.18]" style={{ background: `radial-gradient(closest-side, ${GOLD} 35%, transparent 100%)` }} />
    <span className="absolute rounded-full w-[520px] h-[520px] top-[35%] -right-44 opacity-[0.22]" style={{ background: 'radial-gradient(closest-side, #3348ff 35%, transparent 100%)' }} />
    <span className="absolute rounded-full w-[480px] h-[480px] -bottom-44 left-[20%] opacity-[0.16]" style={{ background: `radial-gradient(closest-side, ${VIOLET} 35%, transparent 100%)` }} />
    <span className="absolute inset-0" style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
      WebkitMaskImage: 'radial-gradient(ellipse at 50% 20%, #000, transparent 72%)',
      maskImage: 'radial-gradient(ellipse at 50% 20%, #000, transparent 72%)'
    }} />
  </div>
);

const Stat = ({ label, value }) => (
  <div className="min-w-0 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
    <dt className="text-xs text-[#93a0bd]">{label}</dt>
    <dd className="mt-0.5 font-semibold text-[#eef2ff]">{value}</dd>
  </div>
);

const Empty = ({ title, text }) => (
  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center">
    <p className="text-lg font-bold text-[#eef2ff]">{title}</p>
    <p className="text-[#93a0bd] mt-1">{text}</p>
  </div>
);

const Skeleton = () => (
  <div className={`rounded-2xl ${glass} p-5 space-y-3`} aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 rounded-lg bg-white/10 animate-pulse motion-reduce:animate-none" />)}
  </div>
);

export default function PointTable() {
  const [tours, setTours] = useState([]);
  const [tid, setTid] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    FAPI.get('/tournaments').then((r) => {
      setTours(r.data);
      const pick = r.data.find((t) => t.status === 'ongoing') || r.data[0];
      if (pick) setTid(pick._id); else setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, []);

  const load = () => {
    if (!tid) return Promise.resolve();
    return FAPI.get(`/points/table/${tid}`)
      .then((r) => { setRows(r.data); setError(false); setUpdated(new Date()); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  usePolling(load, 8000);
  useEffect(() => { if (tid) { setLoading(true); setRows([]); load(); } }, [tid]); // eslint-disable-line

  const cur = tours.find((t) => t._id === tid);
  const grouped = cur?.format === 'group_round_robin';
  const st = STATUS[cur?.status];
  const time = updated ? updated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    /* "dark" class switches StandingsTable's own dark: styles on (class-based dark mode) */
    <div className="dark relative isolate bg-[#060912] text-[#eef2ff] min-h-screen overflow-x-hidden" style={{ '--accent': GOLD }}>
      <Ambient />

      {/* ---------- Page header ---------- */}
      <div className="relative overflow-hidden border-b border-white/10">
        <svg className="absolute inset-0 w-full h-full text-white opacity-[0.07]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" /><circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-28">
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-transparent bg-clip-text bg-[linear-gradient(100deg,#fff_15%,#f2c14e_42%,#3dd6d0_62%,#fff_88%)] [filter:drop-shadow(0_0_28px_rgba(242,193,78,0.25))]">Point table</h1>
          <p className="mt-3 text-base sm:text-lg text-[#93a0bd] max-w-xl">Live standings, updated automatically while matches are played.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
        {/* ---------- Tournament panel (overlaps header) ---------- */}
        <section aria-label="Choose a tournament" className={`-mt-14 sm:-mt-16 relative z-10 ${glass} rounded-2xl p-4 sm:p-6 shadow-[0_30px_60px_-36px_rgba(0,0,0,0.8)]`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-end">
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-[#93a0bd] mb-1.5">Tournament</span>
              <select value={tid} onChange={(e) => setTid(e.target.value)} disabled={tours.length === 0}
                className={`block w-full max-w-full min-w-0 h-12 px-3 rounded-xl border border-white/15 bg-white/5 text-[#eef2ff] font-semibold [color-scheme:dark] ${focusRing}`}>
                {tours.length === 0 && <option value="">No tournament</option>}
                {tours.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </label>
            {cur && (
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {st && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold pl-2 pr-3 py-1.5 rounded-full ${st.cls}`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />{st.label}
                  </span>
                )}
                <span className="max-w-full truncate text-xs font-bold px-2.5 py-1.5 rounded-full bg-[#3dd6d0]/15 text-[#3dd6d0] border border-[#3dd6d0]/35">{formatLabel(cur)}</span>
              </div>
            )}
          </div>

          {cur && (
            <dl className={`mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-sm ${grouped ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <Stat label="Points for a win" value={cur.pointsWin ?? 3} />
              <Stat label="Points for a draw" value={cur.pointsDraw ?? 1} />
              {grouped && <Stat label="Qualify per group" value={`Top ${cur.qualifyPerGroup}`} />}
              <div className={`min-w-0 rounded-xl bg-white/5 border border-white/10 px-4 py-3 col-span-2 ${grouped ? 'md:col-span-1' : 'md:col-span-1'}`}>
                <dt className="text-xs text-[#93a0bd]">Ties are broken by</dt>
                <dd className="mt-0.5 font-semibold text-[#eef2ff]">{tiebreakText(cur)}</dd>
              </div>
            </dl>
          )}
        </section>

        {/* ---------- Standings ---------- */}
        <div className="mt-8 sm:mt-10" aria-live="polite">
          {loading && <Skeleton />}

          {!loading && error && rows.length === 0 && (
            <Empty title="Couldn’t load standings" text="Check your connection. We’ll try again automatically." />
          )}

          {!loading && !error && rows.length === 0 && (
            <Empty title={tours.length === 0 ? 'No tournament yet' : 'No standings yet'} text={tours.length === 0 ? 'Standings will appear once a tournament is created.' : 'The table fills in after the first match is played.'} />
          )}

          {rows.length > 0 && (
            <section style={{ '--accent': CYAN }} className={`${glass} rounded-2xl overflow-hidden shadow-[0_30px_60px_-36px_rgba(0,0,0,0.8)]`}>
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-1.5 h-7 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] shrink-0" />
                  <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold text-[#eef2ff] truncate">{cur?.name || 'Standings'}</h2>
                </div>
                {time && (
                  <span className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-[#93a0bd]">
                    <span className={`w-2 h-2 rounded-full ${error ? 'bg-[#f2c14e]' : 'bg-[#3dd6d0] shadow-[0_0_8px_#3dd6d0]'}`} />
                    {error ? `Offline, last updated ${time}` : `Updated ${time}`}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto p-2 sm:p-4">
                <StandingsTable rows={rows} format={cur?.format} />
              </div>
            </section>
          )}

          {grouped && rows.length > 0 && (
            <p className="mt-4 text-sm text-[#93a0bd] flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#f2c14e]/15 border-l-4 border-[#f2c14e]" aria-hidden="true" />
              Top {cur.qualifyPerGroup} of every group qualify for the next stage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}