import React, { useEffect, useState } from 'react';
import FAPI, { usePolling } from './footballApi';
import StandingsTable, { formatLabel, tiebreakText } from './StandingsTable';

/* Design tokens (white theme, same as FootballHome)
   ink #0f172a · body #475569 · muted #64748b · line #e2e8f0 · soft #f8fafc
   accent #0f7a4a · accent-dark #0b5d38 · accent-tint #ecfdf3
   fonts: Manrope (headings) + Inter (body)                                   */

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7a4a] focus-visible:ring-offset-2';
const STATUS = {
  ongoing: { label: 'Live now', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200', dot: 'bg-red-600 animate-pulse motion-reduce:animate-none' },
  upcoming: { label: 'Upcoming', cls: 'bg-[#ecfdf3] text-[#0b5d38]', dot: 'bg-[#0f7a4a]' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');
.fb-page { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
.fb-page .fb-h { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
.fb-page .fb-num { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .fb-page * { animation: none !important; transition: none !important; } }
`;

const Stat = ({ label, value }) => (
  <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="fb-num mt-0.5 text-sm font-semibold text-slate-900">{value}</dd>
  </div>
);

const Empty = ({ title, text }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
    <p className="fb-h text-lg font-bold text-slate-900">{title}</p>
    <p className="text-sm text-slate-500 mt-1">{text}</p>
  </div>
);

const Skeleton = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse motion-reduce:animate-none" />)}
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
    <div className="fb-page bg-white min-h-screen overflow-x-hidden text-slate-700">
      <style>{FONT_CSS}</style>

      {/* ---------- Page header ---------- */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="fb-h text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">Point table</h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl leading-relaxed">Live standings, updated automatically while matches are played.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ---------- Tournament selector and rules ---------- */}
        <section aria-label="Choose a tournament">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-end">
            <label className="block min-w-0">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Tournament</span>
              <select value={tid} onChange={(e) => setTid(e.target.value)} disabled={tours.length === 0}
                className={`block w-full max-w-full min-w-0 h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400 ${focusRing}`}>
                {tours.length === 0 && <option value="">No tournament</option>}
                {tours.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </label>
            {cur && (
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {st && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold pl-2 pr-3 py-1.5 rounded-full ${st.cls}`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />{st.label}
                  </span>
                )}
                <span className="max-w-full truncate text-xs font-semibold px-2.5 py-1.5 rounded-full bg-[#ecfdf3] text-[#0b5d38]">{formatLabel(cur)}</span>
              </div>
            )}
          </div>

          {cur && (
            <dl className={`mt-5 grid grid-cols-2 gap-3 ${grouped ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <Stat label="Points for a win" value={cur.pointsWin ?? 3} />
              <Stat label="Points for a draw" value={cur.pointsDraw ?? 1} />
              {grouped && <Stat label="Qualify per group" value={`Top ${cur.qualifyPerGroup}`} />}
              <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3 col-span-2 md:col-span-1">
                <dt className="text-xs text-slate-500">Ties are broken by</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">{tiebreakText(cur)}</dd>
              </div>
            </dl>
          )}
        </section>

        {/* ---------- Standings ---------- */}
        <div className="mt-8" aria-live="polite">
          {loading && <Skeleton />}

          {!loading && error && rows.length === 0 && (
            <Empty title="Couldn’t load standings" text="Check your connection. We’ll try again automatically." />
          )}

          {!loading && !error && rows.length === 0 && (
            <Empty title={tours.length === 0 ? 'No tournament yet' : 'No standings yet'} text={tours.length === 0 ? 'Standings will appear once a tournament is created.' : 'The table fills in after the first match is played.'} />
          )}

          {rows.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="fb-h text-lg sm:text-xl font-bold text-slate-900 truncate">{cur?.name || 'Standings'}</h2>
                {time && (
                  <span className="fb-num shrink-0 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
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
            <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#ecfdf3] border-l-4 border-[#0f7a4a]" aria-hidden="true" />
              Top {cur.qualifyPerGroup} of every group qualify for the next stage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}