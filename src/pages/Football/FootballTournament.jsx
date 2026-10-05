import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FAPI, { usePolling, fmtDate } from './footballApi';
import { formatLabel } from './StandingsTable';

/* Design tokens (white theme, same as FootballHome)
   ink #0f172a · body #475569 · muted #64748b · line #e2e8f0 · soft #f8fafc
   accent #0f7a4a · accent-dark #0b5d38 · accent-tint #ecfdf3
   fonts: Manrope (headings) + Inter (body)                                   */

const PAGE = 6; // cards shown per "Show more" step
const DAY = 864e5;
const TABS = [['all', 'All'], ['inter', 'Inter department'], ['central', 'Central'], ['franchise', 'Franchise']];
const ORDER = { ongoing: 0, upcoming: 1, completed: 2 };
const STATUS = {
  ongoing: { label: 'Live now', cls: 'bg-white text-red-700 ring-1 ring-red-200', dot: 'bg-red-600 animate-pulse motion-reduce:animate-none' },
  upcoming: { label: 'Upcoming', cls: 'bg-white text-[#0b5d38] ring-1 ring-slate-200', dot: 'bg-[#0f7a4a]' },
  completed: { label: 'Completed', cls: 'bg-white text-slate-600 ring-1 ring-slate-200', dot: 'bg-slate-400' },
};
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7a4a] focus-visible:ring-offset-2';
const cardShell = 'bg-white border border-slate-200 rounded-xl overflow-hidden';

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');
.fb-tour { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
.fb-tour .fb-h { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
.fb-tour .fb-num { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .fb-tour * { animation: none !important; transition: none !important; } }
`;

/* ---------- helpers ---------- */
function timing(t) {
  const s = t.startDate ? new Date(t.startDate) : null;
  const e = t.endDate ? new Date(t.endDate) : null;
  const now = Date.now();
  if (t.status === 'ongoing' && s && e && !isNaN(s) && !isNaN(e)) {
    const total = Math.max(1, Math.ceil((e - s) / DAY) + 1);
    const day = Math.min(total, Math.max(1, Math.floor((now - s) / DAY) + 1));
    return { pct: (day / total) * 100, label: `Day ${day} of ${total}` };
  }
  if (t.status === 'upcoming' && s && !isNaN(s)) {
    const d = Math.ceil((s - now) / DAY);
    return { label: d <= 0 ? 'Starts today' : `Starts in ${d} ${d === 1 ? 'day' : 'days'}` };
  }
  return null;
}

/* ---------- icons ---------- */
const Icon = ({ d, extra, className = 'w-4 h-4 shrink-0' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} />{extra}</svg>
);
const CalIcon = () => <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />;
const PinIcon = () => <Icon d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" extra={<circle cx="12" cy="10" r="3" />} />;
const TrophyIcon = () => <Icon className="w-10 h-10" d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z" />;
const SearchIcon = () => <Icon className="w-5 h-5" d="M21 21l-4.3-4.3" extra={<circle cx="11" cy="11" r="7" />} />;
const Chevron = () => <Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" d="M9 18l6-6-6-6" />;

/* ---------- shared pieces ---------- */
function Banner({ t, className = '' }) {
  const s = STATUS[t.status] || STATUS.completed;
  const cat = (TABS.find(([k]) => k === t.category) || [])[1];
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {t.banner
        ? <img src={t.banner} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
        : <div className="absolute inset-0 grid place-items-center text-slate-300"><TrophyIcon /></div>}
      <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-semibold pl-2 pr-3 py-1.5 rounded-full shadow-sm ${s.cls}`}>
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />{s.label}
      </span>
      {cat && <span className="absolute bottom-3 left-3 text-xs font-medium text-slate-700 px-2.5 py-1 rounded-full bg-white/95 shadow-sm">{cat}</span>}
    </div>
  );
}

function Meta({ t }) {
  const range = `${fmtDate(t.startDate)}${t.endDate ? ` to ${fmtDate(t.endDate)}` : ''}`;
  return (
    <ul className="space-y-1.5 text-sm text-slate-500">
      <li className="flex items-center gap-2"><CalIcon /><span>{range}</span></li>
      {t.venue && <li className="flex items-center gap-2 min-w-0"><PinIcon /><span className="truncate">{t.venue}</span></li>}
    </ul>
  );
}

function Progress({ t }) {
  const p = timing(t);
  if (!p) return null;
  return (
    <div className="mt-4">
      {p.pct != null && (
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={Math.round(p.pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Tournament progress">
          <div className="h-full rounded-full bg-[#0f7a4a]" style={{ width: `${p.pct}%` }} />
        </div>
      )}
      <p className={`fb-num text-xs font-semibold ${p.pct != null ? 'mt-2' : ''} text-[#0b5d38]`}>{p.label}</p>
    </div>
  );
}

function Actions({ big }) {
  const h = big ? 'h-12' : 'h-11';
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link to="/sports/football/schedule" className={`group ${h} inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f7a4a] text-white text-sm font-semibold hover:bg-[#0b5d38] transition-colors ${focusRing}`}>Fixtures <Chevron /></Link>
      <Link to="/sports/football/point-table" className={`${h} inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors ${focusRing}`}>Standings</Link>
    </div>
  );
}

const Chip = ({ t }) => (
  <span className="inline-block max-w-full truncate text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf3] text-[#0b5d38]">{formatLabel(t)}</span>
);

/* ---------- cards ---------- */
function Featured({ t }) {
  return (
    <article className={`group grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${cardShell} hover:border-slate-300 hover:shadow-sm transition`}>
      <Banner t={t} className="h-56 sm:h-72 lg:h-full lg:min-h-[22rem]" />
      <div className="p-6 sm:p-8 flex flex-col min-w-0">
        <Chip t={t} />
        <h2 className="fb-h text-2xl sm:text-3xl font-extrabold leading-tight mt-3 text-slate-900 break-words">{t.name}</h2>
        <div className="mt-4"><Meta t={t} /></div>
        {t.description && <p className="mt-4 text-slate-600 leading-relaxed line-clamp-4 max-w-prose">{t.description}</p>}
        <Progress t={t} />
        <div className="mt-auto pt-6"><Actions big /></div>
      </div>
    </article>
  );
}

function TournamentCard({ t }) {
  return (
    <article className={`group min-w-0 flex flex-col ${cardShell} hover:border-slate-300 hover:shadow-sm transition`}>
      <Banner t={t} className="h-40" />
      <div className="flex flex-col flex-1 p-5">
        <h2 className="fb-h text-lg sm:text-xl font-bold leading-snug text-slate-900 break-words">{t.name}</h2>
        <div className="mt-2"><Chip t={t} /></div>
        <div className="mt-3"><Meta t={t} /></div>
        {t.description && <p className="text-sm leading-relaxed text-slate-600 mt-3 line-clamp-3">{t.description}</p>}
        <Progress t={t} />
        <div className="mt-auto pt-5"><Actions /></div>
      </div>
    </article>
  );
}

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i} className="h-[26rem] rounded-xl bg-slate-50 border border-slate-200 animate-pulse motion-reduce:animate-none" />)}
  </div>
);

const Empty = ({ title, text, action }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
    <p className="fb-h text-lg font-bold text-slate-900">{title}</p>
    <p className="text-sm text-slate-500 mt-1">{text}</p>
    {action}
  </div>
);

const fieldCls = `block w-full min-w-0 h-11 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 transition-colors ${focusRing}`;

/* ---------- page ---------- */
export default function FootballTournament() {
  const [list, setList] = useState([]);
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  usePolling(() => FAPI.get('/tournaments')
    .then((r) => { setList(r.data); setError(false); })
    .catch(() => setError(true))
    .finally(() => setLoading(false)), 15000);

  const term = q.trim().toLowerCase();
  const filtered = list
    .filter((t) => (cat === 'all' || t.category === cat) && (!st || t.status === st) && (!term || t.name?.toLowerCase().includes(term)))
    .sort((a, b) => (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3));

  const count = (k) => (k === 'all' ? list.length : list.filter((t) => t.category === k).length);
  const live = list.filter((t) => t.status === 'ongoing').length;
  const filtering = !!(q || st || cat !== 'all');
  const reset = () => { setQ(''); setSt(''); setCat('all'); setLimit(PAGE); };

  // highlight a live tournament on top when nothing is filtered
  const hero = !filtering && filtered[0]?.status === 'ongoing' ? filtered[0] : null;
  const rest = hero ? filtered.slice(1) : filtered;
  const shown = rest.slice(0, limit);
  const left = rest.length - shown.length;

  return (
    <div className="fb-tour bg-white min-h-screen overflow-x-hidden text-slate-700">
      <style>{FONT_CSS}</style>

      {/* ---------- Page header ---------- */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="fb-h text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">Tournaments</h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl leading-relaxed">
            {list.length > 0 ? `${list.length} ${list.length === 1 ? 'tournament' : 'tournaments'}${live ? `, ${live} live right now. ` : '. '}` : ''}
            Follow fixtures and standings.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ---------- Filters ---------- */}
        <section aria-label="Find a tournament">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
            <label className="block min-w-0">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Search</span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
                <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search by tournament name"
                  className={`${fieldCls} pl-11 pr-3`} />
              </span>
            </label>
            <label className="block min-w-0">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Status</span>
              <select value={st} onChange={(e) => { setSt(e.target.value); setLimit(PAGE); }}
                className={`${fieldCls} px-3 font-medium`}>
                <option value="">All statuses</option>
                <option value="ongoing">Live now</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>

          <div role="tablist" aria-label="Tournament category" className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200">
            {TABS.map(([k, l]) => {
              const on = cat === k;
              return (
                <button key={k} role="tab" aria-selected={on} onClick={() => { setCat(k); setLimit(PAGE); }}
                  className={`relative shrink-0 px-4 py-3 inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-md ${focusRing} ${
                    on ? 'text-[#0f7a4a]' : 'text-slate-500 hover:text-slate-900'}`}>
                  {l}
                  <span className={`fb-num text-xs px-1.5 py-0.5 rounded-full ${on ? 'bg-[#ecfdf3] text-[#0b5d38]' : 'bg-slate-100 text-slate-500'}`}>{count(k)}</span>
                  {on && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#0f7a4a]" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- Content ---------- */}
        <div className="mt-8" aria-live="polite">
          {loading && <Skeleton />}

          {!loading && error && list.length === 0 && (
            <Empty title="Couldn’t load tournaments" text="Check your connection. We’ll try again automatically." />
          )}

          {!loading && !error && filtered.length === 0 && (
            <Empty
              title={list.length === 0 ? 'No tournament yet' : 'No tournament found'}
              text={list.length === 0 ? 'Tournaments will appear here once they are created.' : 'Try a different name, status or category.'}
              action={filtering && <button onClick={reset} className={`mt-5 px-5 py-2.5 rounded-lg bg-[#0f7a4a] text-white text-sm font-semibold hover:bg-[#0b5d38] transition-colors ${focusRing}`}>Clear filters</button>} />
          )}

          {filtered.length > 0 && (
            <>
              <p className="text-sm text-slate-500 mb-4">
                Showing <b className="fb-num text-slate-900">{shown.length + (hero ? 1 : 0)}</b> of <span className="fb-num">{filtered.length}</span>
              </p>
              {hero && <div className="mb-6"><Featured t={hero} /></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {shown.map((t) => <TournamentCard key={t._id} t={t} />)}
              </div>
              {left > 0 && (
                <div className="mt-10 text-center">
                  <button onClick={() => setLimit(limit + PAGE)}
                    className={`px-6 h-11 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors ${focusRing}`}>
                    Show more ({left} left)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}