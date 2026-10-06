import React, { useEffect, useState } from 'react';
import FAPI, { usePolling } from './footballApi';
import StandingsTable, { formatLabel, tiebreakText } from './StandingsTable';

/* Palette (same as FootballTeam / FootballTournament)
   royal #1f5eff · navy #0a1f5c · mist #eaf1ff · line #dbe6fb · page #f4f8ff
   dark: page #060d20 · card #0c1a3d                                          */

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5eff] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#060d20]';
const STATUS = {
  ongoing: { label: 'Live now', cls: 'bg-[#1f5eff] text-white', dot: 'bg-white animate-pulse motion-reduce:animate-none' },
  upcoming: { label: 'Upcoming', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200', dot: 'bg-amber-500' },
  completed: { label: 'Completed', cls: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300', dot: 'bg-slate-400' },
};

const Stat = ({ label, value }) => (
  <div className="min-w-0 rounded-xl bg-[#f4f8ff] dark:bg-white/5 px-4 py-3">
    <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="mt-0.5 font-semibold text-[#0a1f5c] dark:text-white">{value}</dd>
  </div>
);

const Empty = ({ title, text }) => (
  <div className="rounded-2xl border border-dashed border-[#c9d9f7] dark:border-white/15 bg-white dark:bg-[#0c1a3d] px-6 py-14 text-center">
    <p className="text-lg font-bold text-[#0a1f5c] dark:text-white">{title}</p>
    <p className="text-slate-500 dark:text-slate-400 mt-1">{text}</p>
  </div>
);

const Skeleton = () => (
  <div className="rounded-2xl bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 p-5 space-y-3" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 rounded-lg bg-[#eaf1ff] dark:bg-white/10 animate-pulse motion-reduce:animate-none" />)}
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
    <div className="bg-[#f4f8ff] dark:bg-[#060d20] min-h-screen overflow-x-hidden">
      {/* ---------- Page header ---------- */}
      <div className="relative overflow-hidden border-b border-[#dbe6fb] dark:border-white/10 bg-gradient-to-b from-white via-[#eef4ff] to-[#f4f8ff] dark:from-[#0a1f5c] dark:via-[#12349a] dark:to-[#1f5eff]">
        <svg className="absolute inset-0 w-full h-full text-[#1f5eff] opacity-[0.09] dark:text-white dark:opacity-[0.13]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" /><circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-28">
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-[#0a1f5c] dark:text-white">Point table</h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-blue-100 max-w-xl">Live standings, updated automatically while matches are played.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
        {/* ---------- Tournament panel (overlaps header) ---------- */}
        <section aria-label="Choose a tournament" className="-mt-14 sm:-mt-16 relative z-10 bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_16px_40px_-24px_rgba(10,31,92,0.4)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-end">
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Tournament</span>
              <select value={tid} onChange={(e) => setTid(e.target.value)} disabled={tours.length === 0}
                className={`block w-full max-w-full min-w-0 h-12 px-3 rounded-xl border border-[#dbe6fb] dark:border-white/15 bg-[#f4f8ff] dark:bg-white/5 text-[#0a1f5c] dark:text-white font-semibold ${focusRing}`}>
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
                <span className="max-w-full truncate text-xs font-bold px-2.5 py-1.5 rounded-full bg-[#eaf1ff] text-[#1f5eff] dark:bg-[#1f5eff]/20 dark:text-sky-300">{formatLabel(cur)}</span>
              </div>
            )}
          </div>

          {cur && (
            <dl className={`mt-4 pt-4 border-t border-[#e6eefc] dark:border-white/10 grid grid-cols-2 gap-3 text-sm ${grouped ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <Stat label="Points for a win" value={cur.pointsWin ?? 3} />
              <Stat label="Points for a draw" value={cur.pointsDraw ?? 1} />
              {grouped && <Stat label="Qualify per group" value={`Top ${cur.qualifyPerGroup}`} />}
              <div className={`min-w-0 rounded-xl bg-[#f4f8ff] dark:bg-white/5 px-4 py-3 col-span-2 ${grouped ? 'md:col-span-1' : 'md:col-span-1'}`}>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Ties are broken by</dt>
                <dd className="mt-0.5 font-semibold text-[#0a1f5c] dark:text-white">{tiebreakText(cur)}</dd>
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
            <section className="bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(10,31,92,0.04),0_16px_40px_-26px_rgba(10,31,92,0.3)]">
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#e6eefc] dark:border-white/10">
                <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold text-[#0a1f5c] dark:text-white truncate">{cur?.name || 'Standings'}</h2>
                {time && (
                  <span className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${error ? 'bg-amber-500' : 'bg-emerald-500'}`} />
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
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#eaf1ff] border-l-4 border-[#1f5eff]" aria-hidden="true" />
              Top {cur.qualifyPerGroup} of every group qualify for the next stage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}