import React, { useState } from 'react';
import FAPI, { usePolling } from './footballApi';

/* Design tokens (white theme, same as FootballHome)
   ink #0f172a · body #475569 · muted #64748b · line #e2e8f0 · soft #f8fafc
   accent #0f7a4a · accent-dark #0b5d38 · accent-tint #ecfdf3
   fonts: Manrope (headings) + Inter (body)                                   */

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7a4a] focus-visible:ring-offset-2';
const fieldCls = `block w-full min-w-0 h-11 rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 transition-colors ${focusRing}`;

const STATUS = [['all', 'All'], ['live', 'Live'], ['upcoming', 'Upcoming'], ['completed', 'Results']];

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');
.fb-page { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
.fb-page .fb-h { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
.fb-page .fb-num { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .fb-page * { animation: none !important; transition: none !important; } }
`;

/* Event icons: goal / yellow card / red card / substitution */
const EventIcon = ({ type }) => {
  const base = { viewBox: '0 0 24 24', className: 'w-4 h-4 shrink-0', 'aria-hidden': true };
  if (type === 'goal') return (
    <svg {...base} fill="none" stroke="#0f7a4a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 8V3M15.5 10.5L20 9M14.2 14.5l2.6 3.6M9.8 14.5l-2.6 3.6M8.5 10.5L4 9" />
    </svg>
  );
  if (type === 'yellow') return <svg {...base}><rect x="6" y="3" width="12" height="18" rx="2" fill="#facc15" /></svg>;
  if (type === 'red') return <svg {...base}><rect x="6" y="3" width="12" height="18" rx="2" fill="#dc2626" /></svg>;
  if (type === 'sub') return (
    <svg {...base} fill="none" stroke="#475569" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
    </svg>
  );
  return <span aria-hidden="true" className="text-slate-400">•</span>;
};

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
);

const Crest = ({ t }) => t?.logo
  ? <img src={t.logo} alt="" className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover bg-white ring-1 ring-slate-200 shrink-0" />
  : <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 grid place-items-center text-xs font-semibold shrink-0">{(t?.shortName || t?.name || '?').slice(0, 3)}</span>;

const StatusPill = ({ m }) => {
  if (m.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 ring-1 ring-red-200 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />Live {m.minute}'
      </span>
    );
  }
  if (m.status === 'completed') {
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0">Full time</span>;
  }
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf3] text-[#0b5d38] shrink-0">Upcoming</span>;
};

// team A sits on the left (name, then crest next to the score); team B mirrors it. Phone: crest above name.
const Team = ({ t, right }) => (
  <div className={`flex flex-col items-center gap-2 text-center min-w-0 sm:gap-4 ${right ? 'sm:flex-row sm:text-left' : 'sm:flex-row-reverse sm:text-right'}`}>
    <Crest t={t} />
    <span className="text-sm sm:text-base font-semibold leading-tight line-clamp-2 break-words text-slate-900 min-w-0">{t?.name}</span>
  </div>
);

const MatchCard = ({ m }) => (
  <article className={`bg-white rounded-xl border p-4 sm:p-5 ${m.status === 'live' ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}>
    <div className="flex items-center justify-between gap-3 mb-5">
      <p className="text-xs text-slate-500 truncate min-w-0">{m.tournament?.name}{m.round && ` · ${m.round}`}</p>
      <StatusPill m={m} />
    </div>

    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
      <Team t={m.teamA} />
      <div className="text-center px-1 sm:px-4 min-w-[84px]">
        <b className="fb-h fb-num block text-3xl sm:text-4xl font-extrabold leading-none text-slate-900 whitespace-nowrap">
          {m.status === 'upcoming' ? 'vs' : `${m.scoreA} - ${m.scoreB}`}
        </b>
        {m.status === 'upcoming' && m.time && <span className="fb-num block mt-1.5 text-xs sm:text-sm font-semibold text-[#0f7a4a]">{m.time}</span>}
      </div>
      <Team t={m.teamB} right />
    </div>

    {(m.time || m.venue) && (
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs sm:text-sm text-slate-500">
        {m.time && <span className="inline-flex items-center gap-1.5"><ClockIcon />{m.time}</span>}
        {m.venue && <span className="inline-flex items-center gap-1.5 min-w-0"><PinIcon /><span className="truncate">{m.venue}</span></span>}
      </div>
    )}

    {m.events?.length > 0 && (
      <ul className="mt-4 flex flex-wrap gap-2">
        {m.events.map((ev, i) => (
          <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs sm:text-sm text-slate-700">
            {ev.minute != null && <b className="fb-num text-slate-900">{ev.minute}'</b>}
            <EventIcon type={ev.type} />
            <span>{ev.player || (ev.team === 'A' ? m.teamA?.name : m.teamB?.name)}</span>
          </li>
        ))}
      </ul>
    )}
  </article>
);

const dateKey = (m) => { const d = new Date(m.date); return isNaN(d) ? 'tba' : d.toDateString(); };
const dayLabel = (k, date) => (k === 'tba'
  ? 'Date to be announced'
  : new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

const Skeleton = () => (
  <div className="space-y-4" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-slate-50 border border-slate-200 animate-pulse" />)}
  </div>
);

export default function FootballSchedule() {
  const [matches, setMatches] = useState([]);
  const [tours, setTours] = useState([]);
  const [tid, setTid] = useState('');
  const [st, setSt] = useState('all');
  const [loading, setLoading] = useState(true);

  usePolling(async () => {
    try {
      const [m, t] = await Promise.all([FAPI.get('/matches'), FAPI.get('/tournaments')]);
      setMatches(m.data); setTours(t.data);
    } catch (e) { /* retry next poll */ } finally { setLoading(false); }
  }, 5000);

  const base = matches.filter((m) => !tid || m.tournament?._id === tid);
  const count = (k) => (k === 'all' ? base.length : base.filter((m) => m.status === k).length);
  const shown = base.filter((m) => st === 'all' || m.status === st);

  const liveNow = st === 'all' ? shown.filter((m) => m.status === 'live') : [];
  const rest = st === 'all' ? shown.filter((m) => m.status !== 'live') : shown;

  const dir = st === 'completed' ? -1 : 1;
  const sorted = [...rest].sort((a, b) => ((new Date(a.date) - new Date(b.date)) || (a.time || '').localeCompare(b.time || '')) * dir);
  const groups = [];
  sorted.forEach((m) => {
    const k = dateKey(m);
    let g = groups[groups.length - 1];
    if (!g || g.k !== k) { g = { k, date: m.date, items: [] }; groups.push(g); }
    g.items.push(m);
  });
  const today = new Date().toDateString();

  return (
    <div className="fb-page bg-white min-h-screen overflow-x-hidden text-slate-700">
      <style>{FONT_CSS}</style>

      {/* ---------- Page header ---------- */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="fb-h text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">Schedule and results</h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl leading-relaxed">Live scores, upcoming fixtures and final results from every tournament.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ---------- Filters ---------- */}
        <section aria-label="Filters">
          <label className="block min-w-0 md:max-w-xs">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Tournament</span>
            <select value={tid} onChange={(e) => setTid(e.target.value)} aria-label="Tournament" className={`${fieldCls} px-3 font-medium`}>
              <option value="">All tournaments</option>
              {tours.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </label>

          <div className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Match status">
            {STATUS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={st === k} onClick={() => setSt(k)}
                className={`relative shrink-0 inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-md ${focusRing} ${
                  st === k ? 'text-[#0f7a4a]' : 'text-slate-500 hover:text-slate-900'}`}>
                {k === 'live' && count('live') > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                {label}
                <span className={`fb-num text-xs px-1.5 py-0.5 rounded-full ${st === k ? 'bg-[#ecfdf3] text-[#0b5d38]' : 'bg-slate-100 text-slate-500'}`}>{count(k)}</span>
                {st === k && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#0f7a4a]" />}
              </button>
            ))}
          </div>
        </section>

        {/* ---------- Match list ---------- */}
        <div className="mt-8">
          {loading && <Skeleton />}

          {!loading && shown.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <p className="fb-h text-lg font-bold text-slate-900">No matches found</p>
              <p className="text-sm text-slate-500 mt-1">Try another tournament or status.</p>
              {(tid || st !== 'all') && (
                <button onClick={() => { setTid(''); setSt('all'); }}
                  className={`mt-5 px-5 py-2.5 rounded-lg bg-[#0f7a4a] text-white text-sm font-semibold hover:bg-[#0b5d38] transition-colors ${focusRing}`}>Clear filters</button>
              )}
            </div>
          )}

          {liveNow.length > 0 && (
            <section className="mb-10">
              <h2 className="fb-h flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />Live now
              </h2>
              <div className="space-y-4">{liveNow.map((m) => <MatchCard key={m._id} m={m} />)}</div>
            </section>
          )}

          {groups.map((g) => (
            <section key={g.k} className="mb-10">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <h2 className="fb-h text-lg sm:text-xl font-bold leading-tight text-slate-900">{dayLabel(g.k, g.date)}</h2>
                {g.k === today && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0f7a4a] text-white">Today</span>}
                <span className="fb-num ml-auto text-sm text-slate-500 shrink-0">{g.items.length} {g.items.length === 1 ? 'match' : 'matches'}</span>
              </div>
              <div className="space-y-4">{g.items.map((m) => <MatchCard key={m._id} m={m} />)}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}