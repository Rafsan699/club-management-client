import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FAPI, { usePolling, fmtDate } from './footballApi';
import { formatLabel } from './StandingsTable';

/* Palette (same as FootballTeam)
   royal #1f5eff · navy #0a1f5c · mist #eaf1ff · line #dbe6fb · page #f4f8ff
   dark: page #060d20 · card #0c1a3d                                          */

const PAGE = 6; // cards shown per "Show more" step
const DAY = 864e5;
const TABS = [['all', 'All'], ['inter', 'Inter department'], ['central', 'Central'], ['franchise', 'Franchise']];
const ORDER = { ongoing: 0, upcoming: 1, completed: 2 };
const STATUS = {
  ongoing: { label: 'Live now', cls: 'bg-[#1f5eff] text-white', dot: 'bg-white animate-pulse motion-reduce:animate-none' },
  upcoming: { label: 'Upcoming', cls: 'bg-white/90 text-[#0a1f5c]', dot: 'bg-amber-400' },
  completed: { label: 'Completed', cls: 'bg-black/40 text-white backdrop-blur', dot: 'bg-slate-300' },
};
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5eff] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#060d20]';
const cardShell = 'bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(10,31,92,0.04),0_16px_40px_-26px_rgba(10,31,92,0.3)]';

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
const Icon = ({ d, extra }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} />{extra}</svg>
);
const CalIcon = () => <Icon d="M4 7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 10h16M8 3v4M16 3v4" />;
const PinIcon = () => <Icon d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" extra={<circle cx="12" cy="10" r="2.5" />} />;
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

const Pitch = ({ id }) => (
  <svg className="absolute inset-0 w-full h-full text-white opacity-[0.14]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 160" aria-hidden="true" data-k={id}>
    <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="10" y="10" width="380" height="140" /><line x1="200" y1="10" x2="200" y2="150" /><circle cx="200" cy="80" r="26" /><rect x="10" y="45" width="52" height="70" /><rect x="338" y="45" width="52" height="70" /></g>
  </svg>
);

/* ---------- shared pieces ---------- */
function Banner({ t, className = '' }) {
  const s = STATUS[t.status] || STATUS.completed;
  const cat = (TABS.find(([k]) => k === t.category) || [])[1];
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#1f5eff] via-[#12349a] to-[#0a1f5c] ${className}`}>
      {t.banner
        ? <img src={t.banner} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
        : <Pitch id={t._id} />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f5c]/70 via-transparent to-black/10" />
      <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-bold pl-2 pr-3 py-1.5 rounded-full ${s.cls}`}>
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />{s.label}
      </span>
      {cat && <span className="absolute bottom-3 left-3 text-xs font-semibold text-white/90 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">{cat}</span>}
    </div>
  );
}

function Meta({ t }) {
  const range = `${fmtDate(t.startDate)}${t.endDate ? ` to ${fmtDate(t.endDate)}` : ''}`;
  return (
    <ul className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
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
        <div className="h-1.5 rounded-full bg-[#eaf1ff] dark:bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={Math.round(p.pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Tournament progress">
          <div className="h-full rounded-full bg-gradient-to-r from-[#1f5eff] to-sky-400" style={{ width: `${p.pct}%` }} />
        </div>
      )}
      <p className={`text-xs font-semibold ${p.pct != null ? 'mt-2' : ''} text-[#1f5eff] dark:text-sky-300`}>{p.label}</p>
    </div>
  );
}

function Actions({ big }) {
  const h = big ? 'h-12' : 'h-11';
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link to="/sports/football/schedule" className={`group ${h} inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f5eff] text-white text-sm font-bold hover:bg-[#1749d6] transition-colors ${focusRing}`}>Fixtures <Arrow /></Link>
      <Link to="/sports/football/point-table" className={`${h} inline-flex items-center justify-center rounded-xl bg-[#eaf1ff] text-[#1f5eff] text-sm font-bold hover:bg-[#dbe6fb] transition-colors dark:bg-white/10 dark:text-sky-300 dark:hover:bg-white/15 ${focusRing}`}>Standings</Link>
    </div>
  );
}

const Chip = ({ t }) => (
  <span className="inline-block max-w-full truncate text-xs font-bold px-2.5 py-1 rounded-full bg-[#eaf1ff] text-[#1f5eff] dark:bg-[#1f5eff]/20 dark:text-sky-300">{formatLabel(t)}</span>
);

/* ---------- cards ---------- */
function Featured({ t }) {
  return (
    <article className={`group grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${cardShell} hover:border-[#1f5eff]/60 transition-colors`}>
      <Banner t={t} className="h-56 sm:h-72 lg:h-full lg:min-h-[22rem]" />
      <div className="p-6 sm:p-8 flex flex-col min-w-0">
        <Chip t={t} />
        <h2 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-bold leading-none mt-3 text-[#0a1f5c] dark:text-white break-words">{t.name}</h2>
        <div className="mt-4"><Meta t={t} /></div>
        {t.description && <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 max-w-prose">{t.description}</p>}
        <Progress t={t} />
        <div className="mt-auto pt-6"><Actions big /></div>
      </div>
    </article>
  );
}

function TournamentCard({ t }) {
  return (
    <article className={`group min-w-0 flex flex-col ${cardShell} hover:border-[#1f5eff]/60 transition-colors`}>
      <Banner t={t} className="h-40" />
      <div className="flex flex-col flex-1 p-5">
        <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold leading-tight text-[#0a1f5c] dark:text-white break-words">{t.name}</h2>
        <div className="mt-2"><Chip t={t} /></div>
        <div className="mt-3"><Meta t={t} /></div>
        {t.description && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mt-3 line-clamp-3">{t.description}</p>}
        <Progress t={t} />
        <div className="mt-auto pt-5"><Actions /></div>
      </div>
    </article>
  );
}

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i} className="h-[26rem] rounded-2xl bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 animate-pulse motion-reduce:animate-none" />)}
  </div>
);

const Empty = ({ title, text, action }) => (
  <div className="rounded-2xl border border-dashed border-[#c9d9f7] dark:border-white/15 bg-white dark:bg-[#0c1a3d] px-6 py-14 text-center">
    <p className="text-lg font-bold text-[#0a1f5c] dark:text-white">{title}</p>
    <p className="text-slate-500 dark:text-slate-400 mt-1">{text}</p>
    {action}
  </div>
);

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
    <div className="bg-[#f4f8ff] dark:bg-[#060d20] min-h-screen overflow-x-hidden">
      {/* ---------- Page header ---------- */}
      <div className="relative overflow-hidden border-b border-[#dbe6fb] dark:border-white/10 bg-gradient-to-b from-white via-[#eef4ff] to-[#f4f8ff] dark:from-[#0a1f5c] dark:via-[#12349a] dark:to-[#1f5eff]">
        <svg className="absolute inset-0 w-full h-full text-[#1f5eff] opacity-[0.09] dark:text-white dark:opacity-[0.13]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" /><circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-28">
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-[#0a1f5c] dark:text-white">Tournaments</h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-blue-100 max-w-xl">
            {list.length > 0 ? `${list.length} ${list.length === 1 ? 'tournament' : 'tournaments'}${live ? `, ${live} live right now. ` : '. '}` : ''}
            Follow fixtures and standings.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        {/* ---------- Filter panel (overlaps header) ---------- */}
        <section aria-label="Find a tournament" className="-mt-14 sm:-mt-16 relative z-10 bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_16px_40px_-24px_rgba(10,31,92,0.4)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Search</span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
                <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search by tournament name"
                  className={`block w-full min-w-0 h-12 pl-11 pr-3 rounded-xl border border-[#dbe6fb] dark:border-white/15 bg-[#f4f8ff] dark:bg-white/5 text-[#0a1f5c] dark:text-white placeholder:text-slate-400 ${focusRing}`} />
              </span>
            </label>
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Status</span>
              <select value={st} onChange={(e) => { setSt(e.target.value); setLimit(PAGE); }}
                className={`block w-full max-w-full min-w-0 h-12 px-3 rounded-xl border border-[#dbe6fb] dark:border-white/15 bg-[#f4f8ff] dark:bg-white/5 text-[#0a1f5c] dark:text-white font-semibold ${focusRing}`}>
                <option value="">All statuses</option>
                <option value="ongoing">Live now</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>

          <div role="tablist" aria-label="Tournament category" className="mt-4 pt-4 border-t border-[#e6eefc] dark:border-white/10 flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            {TABS.map(([k, l]) => {
              const on = cat === k;
              return (
                <button key={k} role="tab" aria-selected={on} onClick={() => { setCat(k); setLimit(PAGE); }}
                  className={`shrink-0 h-10 px-4 inline-flex items-center gap-2 rounded-full text-sm font-bold border transition-colors ${focusRing} ${
                    on ? 'bg-[#1f5eff] border-[#1f5eff] text-white'
                       : 'bg-white border-[#dbe6fb] text-slate-600 hover:bg-[#eaf1ff] dark:bg-transparent dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10'}`}>
                  {l}
                  <span className={`text-xs px-1.5 rounded-md ${on ? 'bg-white/20' : 'bg-[#eaf1ff] text-[#1f5eff] dark:bg-white/10 dark:text-sky-300'}`}>{count(k)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- Content ---------- */}
        <div className="mt-8 sm:mt-10" aria-live="polite">
          {loading && <Skeleton />}

          {!loading && error && list.length === 0 && (
            <Empty title="Couldn’t load tournaments" text="Check your connection. We’ll try again automatically." />
          )}

          {!loading && !error && filtered.length === 0 && (
            <Empty
              title={list.length === 0 ? 'No tournament yet' : 'No tournament found'}
              text={list.length === 0 ? 'Tournaments will appear here once they are created.' : 'Try a different name, status or category.'}
              action={filtering && <button onClick={reset} className={`mt-5 px-5 py-2.5 rounded-xl bg-[#1f5eff] text-white font-bold hover:bg-[#1749d6] transition-colors ${focusRing}`}>Clear filters</button>} />
          )}

          {filtered.length > 0 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Showing <b className="text-[#0a1f5c] dark:text-white">{shown.length + (hero ? 1 : 0)}</b> of {filtered.length}
              </p>
              {hero && <div className="mb-6"><Featured t={hero} /></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {shown.map((t) => <TournamentCard key={t._id} t={t} />)}
              </div>
              {left > 0 && (
                <div className="mt-8 text-center">
                  <button onClick={() => setLimit(limit + PAGE)}
                    className={`px-6 h-12 rounded-xl border border-[#1f5eff]/30 bg-white dark:bg-transparent text-[#1f5eff] dark:text-sky-300 font-bold hover:bg-[#eaf1ff] dark:hover:bg-white/10 transition-colors ${focusRing}`}>
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