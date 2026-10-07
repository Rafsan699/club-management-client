import React, { useState } from 'react';
import FAPI, { usePolling } from './footballApi';

/* Palette (same as the Cricket home)
   bg #060912 · ink #eef2ff · soft #93a0bd · line white/10
   gold #f2c14e · cyan #3dd6d0 · violet #a78bfa · live #ff4d6d · button text #0a0e1c
   Each team card gets its own --accent (cyan / violet / gold), like the cricket cards. */

const GOLD = '#f2c14e';
const CYAN = '#3dd6d0';
const VIOLET = '#a78bfa';
const ACCENTS = [CYAN, VIOLET, GOLD];

const PAGE = 12; // teams shown per "Show more" step

const tint = (pct) => `color-mix(in srgb, var(--accent, ${GOLD}) ${pct}%, transparent)`;
const glass = 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10';
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c14e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060912]';
const field = `block w-full max-w-full min-w-0 h-12 px-3 rounded-xl border border-white/15 bg-white/5 text-[#eef2ff] font-semibold [color-scheme:dark] ${focusRing}`;

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
  ? <img src={t.logo} alt="" className="w-20 h-20 rounded-full object-cover bg-white ring-4 ring-[#0b1226] shadow-md shrink-0" />
  : <span className="w-20 h-20 rounded-full bg-[var(--accent)] text-[#0a0e1c] grid place-items-center text-xl font-bold ring-4 ring-[#0b1226] shadow-md shrink-0">{(t.shortName || t.name || '?').slice(0, 3)}</span>;

const Stat = ({ label, value }) => (
  <div className="min-w-0 px-3 first:pl-0 last:pr-0">
    <dt className="text-xs text-[#93a0bd]">{label}</dt>
    <dd className="font-semibold text-[#eef2ff] truncate" title={typeof value === 'string' ? value : undefined}>{value}</dd>
  </div>
);

function TeamCard({ t, open, onToggle, accent }) {
  const players = t.players || [];
  return (
    <article style={{ '--accent': accent }}
      className={`min-w-0 flex flex-col ${glass} rounded-2xl overflow-hidden shadow-[0_30px_60px_-36px_rgba(0,0,0,0.8)] hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_26px_60px_-22px_var(--accent)] transition`}>
      {/* banner */}
      <div className="relative h-20" style={{ background: `radial-gradient(circle at 30% 20%, ${tint(45)}, #0a1024 75%)` }}>
        <svg className="absolute inset-0 w-full h-full text-white opacity-[0.12]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 80" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="2"><circle cx="330" cy="40" r="34" /><line x1="330" y1="0" x2="330" y2="80" /><rect x="-20" y="14" width="70" height="52" /></g>
        </svg>
      </div>

      <div className="px-5 pb-5 flex flex-col flex-1">
        <div className="-mt-10 flex items-end gap-4">
          <Logo t={t} />
        </div>

        <div className="mt-3 min-w-0">
          <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold leading-tight text-[#eef2ff] break-words">{t.name}</h2>
          {t.tournament?.name && (
            <span className="inline-block max-w-full truncate mt-2 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ color: 'var(--accent)', background: tint(14), border: `1px solid ${tint(35)}` }}>{t.tournament.name}</span>
          )}
        </div>

        <dl className="grid grid-cols-3 divide-x divide-white/10 text-sm mt-5 pt-4 border-t border-white/10">
          <Stat label="Captain" value={t.captain || '-'} />
          <Stat label="Coach" value={t.coach || '-'} />
          <Stat label="Players" value={players.length} />
        </dl>

        <div className="pt-5">
          {players.length > 0 ? (
            <>
              <button onClick={onToggle} aria-expanded={open}
                style={open ? undefined : { color: 'var(--accent)', background: tint(10), border: `1px solid ${tint(40)}` }}
                className={`w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${focusRing} ${
                  open ? 'bg-[var(--accent)] text-[#0a0e1c] shadow-[0_10px_30px_-8px_var(--accent)]' : 'hover:brightness-125'}`}>
                {open ? 'Hide squad' : `View squad (${players.length})`}<Chevron open={open} />
              </button>
              {open && (
                <ul className="mt-3 rounded-xl border border-white/10 divide-y divide-white/10 overflow-hidden">
                  {players.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white/5">
                      <span className="w-8 h-8 shrink-0 rounded-lg grid place-items-center text-sm font-bold"
                        style={{ color: 'var(--accent)', background: tint(16), border: `1px solid ${tint(35)}` }}>{p.jerseyNo || '–'}</span>
                      <span className="flex-1 min-w-0 truncate font-medium text-[#eef2ff]">{p.name}</span>
                      {p.position && <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-md bg-white/10 text-[#93a0bd]">{p.position}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-center text-[#93a0bd] rounded-xl bg-white/5 py-3">Squad not published yet</p>
          )}
        </div>
      </div>
    </article>
  );
}

const Skeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i} className={`h-72 rounded-2xl ${glass} animate-pulse`} />)}
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
    /* "dark" class keeps any child component's dark: styles on (class-based dark mode) */
    <div className="dark relative isolate bg-[#060912] text-[#eef2ff] min-h-screen overflow-x-hidden" style={{ '--accent': GOLD }}>
      <Ambient />

      {/* ---------- Page header ---------- */}
      <div className="relative overflow-hidden border-b border-white/10">
        <svg className="absolute inset-0 w-full h-full text-white opacity-[0.07]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" />
            <circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20 sm:pb-24">
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-transparent bg-clip-text bg-[linear-gradient(100deg,#fff_15%,#f2c14e_42%,#3dd6d0_62%,#fff_88%)] [filter:drop-shadow(0_0_28px_rgba(242,193,78,0.25))]">Teams</h1>
          <p className="mt-3 text-base sm:text-lg text-[#93a0bd] max-w-xl">
            {teams.length > 0 ? `${teams.length} registered ${teams.length === 1 ? 'team' : 'teams'}. ` : ''}Meet the squads, captains and coaches.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        {/* ---------- Filter panel (overlaps header) ---------- */}
        <section className={`-mt-12 sm:-mt-14 relative z-10 ${glass} rounded-2xl p-4 sm:p-6 shadow-[0_30px_60px_-36px_rgba(0,0,0,0.8)]`} aria-label="Find a team">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-[#93a0bd] mb-1.5">Search</span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93a0bd] pointer-events-none"><SearchIcon /></span>
                <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search by team name"
                  className={`block w-full min-w-0 h-12 pl-11 pr-3 rounded-xl border border-white/15 bg-white/5 text-[#eef2ff] placeholder:text-[#93a0bd] ${focusRing}`} />
              </span>
            </label>
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-[#93a0bd] mb-1.5">Tournament</span>
              <select value={tid} onChange={(e) => { setTid(e.target.value); setLimit(PAGE); }} aria-label="Tournament" className={field}>
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
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center">
              <p className="text-lg font-bold text-[#eef2ff]">{teams.length === 0 ? 'No team registered yet' : 'No team found'}</p>
              <p className="text-[#93a0bd] mt-1">{teams.length === 0 ? 'Teams will appear here once they are added.' : 'Try a different name or tournament.'}</p>
              {(q || tid) && (
                <button onClick={clear} className={`mt-5 px-5 py-2.5 rounded-xl bg-[linear-gradient(100deg,#f2c14e,#ffdf8a_50%,#3dd6d0)] text-[#0a0e1c] font-bold hover:brightness-105 transition ${focusRing}`}>Clear filters</button>
              )}
            </div>
          )}

          {filtered.length > 0 && (
            <>
              <p className="text-sm text-[#93a0bd] mb-4">Showing <b className="text-[#f2c14e]">{shown.length}</b> of {filtered.length}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
                {shown.map((t, i) => <TeamCard key={t._id} t={t} accent={ACCENTS[i % ACCENTS.length]} open={open === t._id} onToggle={() => setOpen(open === t._id ? null : t._id)} />)}
              </div>
              {left > 0 && (
                <div className="mt-8 text-center">
                  <button onClick={() => setLimit(limit + PAGE)}
                    className={`px-6 h-12 rounded-xl border border-white/20 bg-white/5 text-[#eef2ff] font-bold hover:bg-white/10 hover:border-[#f2c14e]/50 transition-colors ${focusRing}`}>
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