import React, { useState } from 'react';
import FAPI, { usePolling } from './footballApi';

/* Palette
   royal #1f5eff · navy #0a1f5c · mist #eaf1ff · line #dbe6fb · page #f4f8ff
   dark: page #060d20 · card #0c1a3d                                          */

const PAGE = 12; // teams shown per "Show more" step
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5eff] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#060d20]';

const Chevron = ({ open }) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
  </svg>
);

const Logo = ({ t }) => t.logo
  ? <img src={t.logo} alt="" className="w-20 h-20 rounded-full object-cover bg-white ring-4 ring-white dark:ring-[#0c1a3d] shadow-md shrink-0" />
  : <span className="w-20 h-20 rounded-full bg-[#1f5eff] text-white grid place-items-center text-xl font-bold ring-4 ring-white dark:ring-[#0c1a3d] shadow-md shrink-0">{(t.shortName || t.name || '?').slice(0, 3)}</span>;

const Stat = ({ label, value }) => (
  <div className="min-w-0 px-3 first:pl-0 last:pr-0">
    <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="font-semibold text-[#0a1f5c] dark:text-white truncate" title={typeof value === 'string' ? value : undefined}>{value}</dd>
  </div>
);

function TeamCard({ t, open, onToggle }) {
  const players = t.players || [];
  return (
    <article className="min-w-0 flex flex-col bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(10,31,92,0.04),0_16px_40px_-26px_rgba(10,31,92,0.3)] hover:border-[#1f5eff]/60 transition-colors">
      {/* banner */}
      <div className="relative h-20 bg-gradient-to-br from-[#dbe6fb] via-[#eaf1ff] to-white dark:from-[#12349a]/60 dark:via-[#0f2a78]/40 dark:to-[#0c1a3d]">
        <svg className="absolute inset-0 w-full h-full text-[#1f5eff] opacity-[0.12]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 80" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="2"><circle cx="330" cy="40" r="34" /><line x1="330" y1="0" x2="330" y2="80" /><rect x="-20" y="14" width="70" height="52" /></g>
        </svg>
      </div>

      <div className="px-5 pb-5 flex flex-col flex-1">
        <div className="-mt-10 flex items-end gap-4">
          <Logo t={t} />
        </div>

        <div className="mt-3 min-w-0">
          <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold leading-tight text-[#0a1f5c] dark:text-white break-words">{t.name}</h2>
          {t.tournament?.name && (
            <span className="inline-block max-w-full truncate mt-2 text-xs font-bold px-2.5 py-1 rounded-full bg-[#eaf1ff] text-[#1f5eff] dark:bg-[#1f5eff]/20 dark:text-sky-300">{t.tournament.name}</span>
          )}
        </div>

        <dl className="grid grid-cols-3 divide-x divide-[#e6eefc] dark:divide-white/10 text-sm mt-5 pt-4 border-t border-[#e6eefc] dark:border-white/10">
          <Stat label="Captain" value={t.captain || '-'} />
          <Stat label="Coach" value={t.coach || '-'} />
          <Stat label="Players" value={players.length} />
        </dl>

        <div className="pt-5">
          {players.length > 0 ? (
            <>
              <button onClick={onToggle} aria-expanded={open}
                className={`w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors ${focusRing} ${
                  open ? 'bg-[#1f5eff] text-white' : 'bg-[#eaf1ff] text-[#1f5eff] hover:bg-[#dbe6fb] dark:bg-white/10 dark:text-sky-300 dark:hover:bg-white/15'}`}>
                {open ? 'Hide squad' : `View squad (${players.length})`}<Chevron open={open} />
              </button>
              {open && (
                <ul className="mt-3 rounded-xl border border-[#e6eefc] dark:border-white/10 divide-y divide-[#e6eefc] dark:divide-white/10 overflow-hidden">
                  {players.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-2.5 bg-[#fbfdff] dark:bg-white/5">
                      <span className="w-8 h-8 shrink-0 rounded-lg grid place-items-center text-sm font-bold bg-[#eaf1ff] text-[#1f5eff] dark:bg-[#1f5eff]/20 dark:text-sky-300">{p.jerseyNo || '–'}</span>
                      <span className="flex-1 min-w-0 truncate font-medium text-[#0a1f5c] dark:text-slate-100">{p.name}</span>
                      {p.position && <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">{p.position}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 rounded-xl bg-[#f4f8ff] dark:bg-white/5 py-3">Squad not published yet</p>
          )}
        </div>
      </div>
    </article>
  );
}

const Skeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i} className="h-72 rounded-2xl bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 animate-pulse" />)}
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
    <div className="bg-[#f4f8ff] dark:bg-[#060d20] min-h-screen overflow-x-hidden">
      {/* ---------- Page header ---------- */}
      <div className="relative overflow-hidden border-b border-[#dbe6fb] dark:border-white/10 bg-gradient-to-b from-white via-[#eef4ff] to-[#f4f8ff] dark:from-[#0a1f5c] dark:via-[#12349a] dark:to-[#1f5eff]">
        <svg className="absolute inset-0 w-full h-full text-[#1f5eff] opacity-[0.09] dark:text-white dark:opacity-[0.13]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" />
            <circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20 sm:pb-24">
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-[#0a1f5c] dark:text-white">Teams</h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-blue-100 max-w-xl">
            {teams.length > 0 ? `${teams.length} registered ${teams.length === 1 ? 'team' : 'teams'}. ` : ''}Meet the squads, captains and coaches.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        {/* ---------- Filter panel (overlaps header) ---------- */}
        <section className="-mt-12 sm:-mt-14 relative z-10 bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_16px_40px_-24px_rgba(10,31,92,0.4)]" aria-label="Find a team">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Search</span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
                <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search by team name"
                  className={`block w-full min-w-0 h-12 pl-11 pr-3 rounded-xl border border-[#dbe6fb] dark:border-white/15 bg-[#f4f8ff] dark:bg-white/5 text-[#0a1f5c] dark:text-white placeholder:text-slate-400 ${focusRing}`} />
              </span>
            </label>
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Tournament</span>
              <select value={tid} onChange={(e) => { setTid(e.target.value); setLimit(PAGE); }} aria-label="Tournament"
                className={`block w-full max-w-full min-w-0 h-12 px-3 rounded-xl border border-[#dbe6fb] dark:border-white/15 bg-[#f4f8ff] dark:bg-white/5 text-[#0a1f5c] dark:text-white font-semibold ${focusRing}`}>
                <option value="">All tournaments</option>
                {tournaments.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </label>
          </div>
        </section>

        {/* ---------- Team grid ---------- */}
        <div className="mt-8 sm:mt-10">
          {loading && <Skeleton />}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#c9d9f7] dark:border-white/15 bg-white dark:bg-[#0c1a3d] px-6 py-14 text-center">
              <p className="text-lg font-bold text-[#0a1f5c] dark:text-white">{teams.length === 0 ? 'No team registered yet' : 'No team found'}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{teams.length === 0 ? 'Teams will appear here once they are added.' : 'Try a different name or tournament.'}</p>
              {(q || tid) && (
                <button onClick={clear} className={`mt-5 px-5 py-2.5 rounded-xl bg-[#1f5eff] text-white font-bold hover:bg-[#1749d6] transition-colors ${focusRing}`}>Clear filters</button>
              )}
            </div>
          )}

          {filtered.length > 0 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Showing <b className="text-[#0a1f5c] dark:text-white">{shown.length}</b> of {filtered.length}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
                {shown.map((t) => <TeamCard key={t._id} t={t} open={open === t._id} onToggle={() => setOpen(open === t._id ? null : t._id)} />)}
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