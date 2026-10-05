import React, { useState } from 'react';
import FAPI, { usePolling } from './footballApi';

/* Design tokens (white theme, same as FootballHome)
   ink #0f172a · body #475569 · muted #64748b · line #e2e8f0 · soft #f8fafc
   accent #0f7a4a · accent-dark #0b5d38 · accent-tint #ecfdf3
   fonts: Manrope (headings) + Inter (body)                                   */

const PAGE = 12; // teams shown per "Show more" step
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7a4a] focus-visible:ring-offset-2';
const fieldCls = `block w-full min-w-0 h-11 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 transition-colors ${focusRing}`;

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');
.fb-page { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
.fb-page .fb-h { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
.fb-page .fb-num { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .fb-page * { animation: none !important; transition: none !important; } }
`;

const Chevron = ({ open }) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Logo = ({ t }) => t.logo
  ? <img src={t.logo} alt="" className="w-14 h-14 rounded-full object-cover bg-white ring-1 ring-slate-200 shrink-0" />
  : <span className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 grid place-items-center text-sm font-semibold shrink-0">{(t.shortName || t.name || '?').slice(0, 3)}</span>;

const Stat = ({ label, value }) => (
  <div className="min-w-0 px-3 first:pl-0 last:pr-0">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="fb-num mt-0.5 text-sm font-semibold text-slate-900 truncate" title={typeof value === 'string' ? value : undefined}>{value}</dd>
  </div>
);

function TeamCard({ t, open, onToggle }) {
  const players = t.players || [];
  return (
    <article className="min-w-0 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition">
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-4">
          <Logo t={t} />
          <div className="min-w-0">
            <h2 className="fb-h text-lg font-bold leading-snug text-slate-900 break-words">{t.name}</h2>
            {t.tournament?.name && (
              <span className="inline-block max-w-full truncate mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf3] text-[#0b5d38]">{t.tournament.name}</span>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-slate-200 mt-5 pt-4 border-t border-slate-100">
          <Stat label="Captain" value={t.captain || '-'} />
          <Stat label="Coach" value={t.coach || '-'} />
          <Stat label="Players" value={players.length} />
        </dl>

        <div className="pt-5 mt-auto">
          {players.length > 0 ? (
            <>
              <button onClick={onToggle} aria-expanded={open}
                className={`w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${focusRing} ${
                  open ? 'bg-[#0f7a4a] text-white hover:bg-[#0b5d38]' : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}>
                <UsersIcon />{open ? 'Hide squad' : `View squad (${players.length})`}<Chevron open={open} />
              </button>
              {open && (
                <ul className="mt-3 rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {players.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white">
                      <span className="fb-num w-8 h-8 shrink-0 rounded-md grid place-items-center text-sm font-semibold bg-slate-100 text-slate-700">{p.jerseyNo || '–'}</span>
                      <span className="flex-1 min-w-0 truncate text-sm font-medium text-slate-900">{p.name}</span>
                      {p.position && <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-md bg-[#ecfdf3] text-[#0b5d38]">{p.position}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-center text-slate-500 rounded-lg bg-slate-50 py-2.5">Squad not published yet</p>
          )}
        </div>
      </div>
    </article>
  );
}

const Skeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i} className="h-60 rounded-xl bg-slate-50 border border-slate-200 animate-pulse" />)}
  </div>
);

export default function FootballTeam() {
  const [teams, setTeams] = useState([]);
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const [tid, setTid] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);

  usePolling(() => FAPI.get('/teams').then((r) => setTeams(r.data)).catch(() => {}).finally(() => setLoading(false)), 20000);

  const tournaments = [];
  teams.forEach((t) => { if (t.tournament?._id && !tournaments.some((x) => x._id === t.tournament._id)) tournaments.push(t.tournament); });

  const term = q.trim().toLowerCase();
  const filtered = teams.filter((t) =>
    (!tid || t.tournament?._id === tid) &&
    (!term || t.name?.toLowerCase().includes(term) || t.shortName?.toLowerCase().includes(term)));
  const shown = filtered.slice(0, limit);
  const left = filtered.length - shown.length;
  const clear = () => { setQ(''); setTid(''); setLimit(PAGE); };

  return (
    <div className="fb-page bg-white min-h-screen overflow-x-hidden text-slate-700">
      <style>{FONT_CSS}</style>

      {/* ---------- Page header ---------- */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="fb-h text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">Teams</h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl leading-relaxed">
            {teams.length > 0 ? `${teams.length} registered ${teams.length === 1 ? 'team' : 'teams'}. ` : ''}Meet the squads, captains and coaches.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ---------- Filters ---------- */}
        <section aria-label="Find a team">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <label className="block min-w-0">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Search</span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
                <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search by team name"
                  className={`${fieldCls} pl-11 pr-3`} />
              </span>
            </label>
            <label className="block min-w-0">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Tournament</span>
              <select value={tid} onChange={(e) => { setTid(e.target.value); setLimit(PAGE); }} aria-label="Tournament"
                className={`${fieldCls} px-3 font-medium`}>
                <option value="">All tournaments</option>
                {tournaments.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </label>
          </div>
        </section>

        {/* ---------- Team grid ---------- */}
        <div className="mt-8">
          {loading && <Skeleton />}

          {!loading && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <p className="fb-h text-lg font-bold text-slate-900">{teams.length === 0 ? 'No team registered yet' : 'No team found'}</p>
              <p className="text-sm text-slate-500 mt-1">{teams.length === 0 ? 'Teams will appear here once they are added.' : 'Try a different name or tournament.'}</p>
              {(q || tid) && (
                <button onClick={clear} className={`mt-5 px-5 py-2.5 rounded-lg bg-[#0f7a4a] text-white text-sm font-semibold hover:bg-[#0b5d38] transition-colors ${focusRing}`}>Clear filters</button>
              )}
            </div>
          )}

          {filtered.length > 0 && (
            <>
              <p className="text-sm text-slate-500 mb-4">Showing <b className="fb-num text-slate-900">{shown.length}</b> of <span className="fb-num">{filtered.length}</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
                {shown.map((t) => <TeamCard key={t._id} t={t} open={open === t._id} onToggle={() => setOpen(open === t._id ? null : t._id)} />)}
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