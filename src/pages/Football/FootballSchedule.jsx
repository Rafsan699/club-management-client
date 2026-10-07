import React, { useState } from 'react';
import FAPI, { usePolling } from './footballApi';

/* Palette (same as the Cricket home)
   bg #060912 · ink #eef2ff · soft #93a0bd · line white/10
   gold #f2c14e · cyan #3dd6d0 · violet #a78bfa · live #ff4d6d · button text #0a0e1c */

const GOLD = '#f2c14e';
const CYAN = '#3dd6d0';
const VIOLET = '#a78bfa';

const tint = (pct) => `color-mix(in srgb, var(--accent, ${GOLD}) ${pct}%, transparent)`;
const glass = 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10';
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c14e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060912]';
const primaryBtn = 'bg-[linear-gradient(100deg,#f2c14e,#ffdf8a_50%,#3dd6d0)] text-[#0a0e1c] font-bold shadow-[0_12px_40px_-10px_rgba(242,193,78,0.55)] hover:brightness-105 transition';
const field = `block w-full max-w-full min-w-0 h-12 px-3 rounded-xl border border-white/15 bg-white/5 text-[#eef2ff] font-semibold [color-scheme:dark] ${focusRing}`;

const STATUS = [['all', 'All'], ['live', 'Live'], ['upcoming', 'Upcoming'], ['completed', 'Results']];
const EVENT_ICON = { goal: '⚽', yellow: '🟨', red: '🟥', sub: '🔁' };

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

const Crest = ({ t }) => t?.logo
  ? <img src={t.logo} alt="" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover bg-white ring-1 ring-white/10 shrink-0" />
  : <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f2c14e] text-[#0a0e1c] grid place-items-center text-xs font-bold shrink-0">{(t?.shortName || t?.name || '?').slice(0, 3)}</span>;

const StatusPill = ({ m }) => {
  if (m.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#ff4d6d] text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 shadow-[0_0_22px_-4px_#ff4d6d]">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE {m.minute}'
      </span>
    );
  }
  if (m.status === 'completed') {
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-[#93a0bd] shrink-0">Full time</span>;
  }
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#3dd6d0]/15 text-[#3dd6d0] border border-[#3dd6d0]/35 shrink-0">Upcoming</span>;
};

// team A sits on the left (name, then crest next to the score); team B mirrors it. Phone: crest above name.
const Team = ({ t, right }) => (
  <div className={`flex flex-col items-center gap-2 text-center min-w-0 sm:gap-4 ${right ? 'sm:flex-row sm:text-left' : 'sm:flex-row-reverse sm:text-right'}`}>
    <Crest t={t} />
    <span className="text-sm sm:text-lg font-semibold leading-tight line-clamp-2 break-words text-[#eef2ff] min-w-0">{t?.name}</span>
  </div>
);

const MatchCard = ({ m }) => {
  const footer = [m.time, m.venue].filter(Boolean).join(' · ');
  return (
    <article className={`${glass} rounded-2xl p-4 sm:p-6 shadow-[0_30px_60px_-36px_rgba(0,0,0,0.8)] hover:border-[#f2c14e]/40 transition-colors ${
      m.status === 'live' ? '!border-[#ff4d6d] ring-1 ring-[#ff4d6d]/30 shadow-[0_0_60px_-24px_#ff4d6d]' : ''}`}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-xs sm:text-sm text-[#93a0bd] truncate min-w-0">{m.tournament?.name}{m.round && ` · ${m.round}`}</p>
        <StatusPill m={m} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <Team t={m.teamA} />
        <div className="text-center px-1 sm:px-4 min-w-[84px]">
          <b className="block font-['Barlow_Condensed'] text-4xl sm:text-5xl leading-none text-[#eef2ff] whitespace-nowrap">
            {m.status === 'upcoming' ? 'vs' : `${m.scoreA} - ${m.scoreB}`}
          </b>
          {m.status === 'upcoming' && m.time && <span className="block mt-1 text-xs sm:text-sm font-semibold text-[#3dd6d0]">{m.time}</span>}
        </div>
        <Team t={m.teamB} right />
      </div>

      {footer && (
        <p className="mt-5 pt-4 border-t border-white/10 text-xs sm:text-sm text-center text-[#93a0bd] truncate">{footer}</p>
      )}

      {m.events?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {m.events.map((ev, i) => (
            <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs sm:text-sm text-[#eef2ff]">
              {ev.minute != null && <b className="text-[#f2c14e]">{ev.minute}'</b>}
              <span aria-hidden="true">{EVENT_ICON[ev.type] || '•'}</span>
              <span>{ev.player || (ev.team === 'A' ? m.teamA?.name : m.teamB?.name)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

const dateKey = (m) => { const d = new Date(m.date); return isNaN(d) ? 'tba' : d.toDateString(); };
const dayLabel = (k, date) => (k === 'tba'
  ? 'Date to be announced'
  : new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

const Skeleton = () => (
  <div className="space-y-4" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i} className={`h-44 rounded-2xl ${glass} animate-pulse`} />)}
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
    /* "dark" class keeps any child component's dark: styles on (class-based dark mode) */
    <div className="dark relative isolate bg-[#060912] text-[#eef2ff] min-h-screen overflow-x-hidden" style={{ '--accent': GOLD }}>
      <Ambient />

      {/* ---------- Page header ---------- */}
      <div className="relative overflow-hidden border-b border-white/10">
        <svg className="absolute inset-0 w-full h-full text-white opacity-[0.07]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" />
            <circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20 sm:pb-24">
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-transparent bg-clip-text bg-[linear-gradient(100deg,#fff_15%,#f2c14e_42%,#3dd6d0_62%,#fff_88%)] [filter:drop-shadow(0_0_28px_rgba(242,193,78,0.25))]">Schedule and results</h1>
          <p className="mt-3 text-base sm:text-lg text-[#93a0bd] max-w-xl">Live scores, upcoming fixtures and final results from every tournament.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
        {/* ---------- Filter panel (overlaps header) ---------- */}
        <section className={`-mt-12 sm:-mt-14 relative z-10 ${glass} rounded-2xl p-4 sm:p-6 shadow-[0_30px_60px_-36px_rgba(0,0,0,0.8)]`} aria-label="Filters">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:items-end">
            <label className="block min-w-0">
              <span className="block text-sm font-semibold text-[#93a0bd] mb-1.5">Tournament</span>
              <select value={tid} onChange={(e) => setTid(e.target.value)} aria-label="Tournament" className={field}>
                <option value="">All tournaments</option>
                {tours.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </label>

            <div className="min-w-0">
              <span className="block text-sm font-semibold text-[#93a0bd] mb-1.5">Match status</span>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist">
                {STATUS.map(([k, label]) => (
                  <button key={k} role="tab" aria-selected={st === k} onClick={() => setSt(k)}
                    className={`shrink-0 inline-flex items-center gap-2 h-12 px-4 rounded-xl text-sm font-semibold transition-colors ${focusRing} ${
                      st === k ? 'bg-[#f2c14e] text-[#0a0e1c] shadow-[0_10px_30px_-8px_#f2c14e]' : 'bg-white/10 text-[#93a0bd] hover:bg-white/15 hover:text-[#eef2ff]'}`}>
                    {k === 'live' && count('live') > 0 && <span className="w-2 h-2 rounded-full bg-[#ff4d6d] animate-pulse" />}
                    {label}
                    <span className={`text-xs px-1.5 rounded-full ${st === k ? 'bg-black/15' : 'bg-white/10'}`}>{count(k)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Match list ---------- */}
        <div className="mt-8 sm:mt-10">
          {loading && <Skeleton />}

          {!loading && shown.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center">
              <p className="text-lg font-bold text-[#eef2ff]">No matches found</p>
              <p className="text-[#93a0bd] mt-1">Try another tournament or status.</p>
              {(tid || st !== 'all') && (
                <button onClick={() => { setTid(''); setSt('all'); }}
                  className={`mt-5 px-5 py-2.5 rounded-xl ${primaryBtn} ${focusRing}`}>Clear filters</button>
              )}
            </div>
          )}

          {liveNow.length > 0 && (
            <section className="mb-8 sm:mb-10">
              <h2 className="flex items-center gap-2 font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold text-[#eef2ff] mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d6d] shadow-[0_0_10px_#ff4d6d] animate-pulse" />Live now
              </h2>
              <div className="space-y-4">{liveNow.map((m) => <MatchCard key={m._id} m={m} />)}</div>
            </section>
          )}

          {groups.map((g) => (
            <section key={g.k} className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1.5 h-7 rounded-full bg-[#f2c14e] shadow-[0_0_10px_#f2c14e] shrink-0" />
                <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold leading-none text-[#eef2ff]">{dayLabel(g.k, g.date)}</h2>
                {g.k === today && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f2c14e] text-[#0a0e1c]">Today</span>}
                <span className="ml-auto text-sm text-[#93a0bd] shrink-0">{g.items.length} {g.items.length === 1 ? 'match' : 'matches'}</span>
              </div>
              <div className="space-y-4">{g.items.map((m) => <MatchCard key={m._id} m={m} />)}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}