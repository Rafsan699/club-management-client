import React, { useState } from 'react';
import FAPI, { usePolling } from './footballApi';

/* Palette (same as the other football pages)
   royal #1f5eff · navy #0a1f5c · mist #eaf1ff · line #dbe6fb · page #f4f8ff
   dark: page #060d20 · card #0c1a3d · glow sky-400                           */

const PAGE = 12; // players shown per "Show more" step
const POS = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' };
const POS_CLS = {
  GK: 'bg-amber-400 text-amber-950', DEF: 'bg-sky-400 text-sky-950',
  MID: 'bg-emerald-400 text-emerald-950', FWD: 'bg-rose-400 text-rose-950',
};
const FILTERS = [['all', 'All'], ['available', 'Available'], ['sold', 'Sold'], ['unsold', 'Unsold']];
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5eff] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#060d20]';

const money = (n) => (typeof n === 'number' ? n.toLocaleString() : n ?? '-');
const initials = (n = '') => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

/* All motion lives here and switches off for people who prefer reduced motion. */
const CSS = `
@media (prefers-reduced-motion: no-preference) {
  .fa-spin { animation: fa-spin 7s linear infinite; }
  .fa-pulse { animation: fa-pulse 1.6s ease-out infinite; }
  .fa-float { animation: fa-float 4s ease-in-out infinite; }
  .fa-pop { animation: fa-pop .55s cubic-bezier(.2,1.4,.4,1); }
  .fa-flash { animation: fa-flash 1.1s ease-out; }
  .fa-ring { animation: fa-ring 2.6s ease-out infinite; }
  .fa-sheen::after { animation: fa-sheen 3.4s ease-in-out infinite; }
  .fa-glow { animation: fa-glow 3s ease-in-out infinite; }
}
@keyframes fa-spin { to { transform: rotate(360deg); } }
@keyframes fa-pulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,.6); } 100% { box-shadow: 0 0 0 12px rgba(239,68,68,0); } }
@keyframes fa-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes fa-pop { 0% { transform: scale(.82); opacity: .3; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
@keyframes fa-flash { 0% { background-color: rgba(56,189,248,.45); } 100% { background-color: rgba(255,255,255,.06); } }
@keyframes fa-ring { 0% { transform: scale(.5); opacity: .55; } 100% { transform: scale(1.7); opacity: 0; } }
@keyframes fa-sheen { 0%,55% { transform: translateX(-130%); } 100% { transform: translateX(130%); } }
@keyframes fa-glow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
.fa-sheen { position: relative; overflow: hidden; }
.fa-sheen::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.22) 50%, transparent 65%); transform: translateX(-130%); pointer-events: none; }
.fa-bidtext { text-shadow: 0 0 28px rgba(56,189,248,.75), 0 0 64px rgba(31,94,255,.65); }
`;

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);

function Avatar({ p, className = '', text = 'text-3xl' }) {
  return p.photo
    ? <img src={p.photo} alt="" loading="lazy" className={`object-cover ${className}`} />
    : <div className={`grid place-items-center font-['Barlow_Condensed'] font-bold text-white bg-gradient-to-br from-[#1f5eff] to-[#0a1f5c] ${text} ${className}`} aria-hidden="true">{initials(p.name)}</div>;
}

/* ---------- Live stage ---------- */
function LiveStage({ live }) {
  const raised = typeof live?.currentBid === 'number' && typeof live?.basePrice === 'number' ? live.currentBid - live.basePrice : 0;
  return (
    <section aria-live="polite" aria-label="Live bidding" className="-mt-14 sm:-mt-16 relative z-10">
      {/* rotating glow border */}
      <div className="relative rounded-3xl p-[2px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(31,94,255,0.7)]">
        <div className="fa-spin absolute -inset-[60%]" style={{ background: live ? 'conic-gradient(from 0deg, #1f5eff, #38bdf8, #0a1f5c 35%, #1f5eff 60%, #38bdf8 85%, #1f5eff)' : 'conic-gradient(from 0deg, #1f5eff55, #0a1f5c, #1f5eff55)' }} aria-hidden="true" />
        <div className="relative rounded-[calc(1.5rem-2px)] bg-gradient-to-br from-[#0a1f5c] via-[#0c2670] to-[#060d20] text-white overflow-hidden">
          {/* ambient glow + pitch lines */}
          <div className="fa-glow absolute -top-24 left-1/4 w-[28rem] h-[28rem] rounded-full bg-[#1f5eff]/40 blur-3xl pointer-events-none" aria-hidden="true" />
          <svg className="absolute inset-0 w-full h-full text-white opacity-[0.07]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" /><circle cx="400" cy="150" r="55" /></g>
          </svg>

          {live ? (
            <div className="relative p-6 sm:p-8 grid md:grid-cols-[auto_minmax(0,1fr)] gap-6 md:gap-10 items-center">
              <div className="relative mx-auto md:mx-0">
                <span className="fa-ring absolute inset-0 rounded-2xl border-2 border-sky-300/60" aria-hidden="true" />
                <div className="fa-float relative p-1 rounded-2xl bg-gradient-to-br from-sky-300 to-[#1f5eff] shadow-[0_0_50px_rgba(56,189,248,0.45)]">
                  <Avatar p={live} text="text-6xl" className="w-40 h-40 sm:w-52 sm:h-52 rounded-[0.9rem]" />
                </div>
              </div>

              <div className="min-w-0 text-center md:text-left">
                <span className="fa-pulse inline-flex items-center gap-2 bg-red-600 text-xs font-bold pl-2.5 pr-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-white" />Live bidding
                </span>
                <h2 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl font-bold leading-none mt-3 break-words">{live.name}</h2>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 text-xs font-bold">
                  {live.position && <span className={`px-2.5 py-1 rounded-full ${POS_CLS[live.position] || 'bg-white/20'}`}>{POS[live.position] || live.position}</span>}
                  {live.department && <span className="px-2.5 py-1 rounded-full bg-white/15">{live.department}</span>}
                  <span className="px-2.5 py-1 rounded-full bg-white/15">Base {money(live.basePrice)}</span>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 items-center md:items-start">
                  <div>
                    <p className="text-sm text-blue-100/80">Current bid</p>
                    {/* key restarts the animation on every new bid */}
                    <p key={live.currentBid} className="fa-pop fa-bidtext font-['Barlow_Condensed'] text-7xl sm:text-8xl font-bold leading-none text-white">{money(live.currentBid)}</p>
                    {raised > 0 && <p className="text-sm font-semibold text-sky-300 mt-1">+{money(raised)} above base</p>}
                  </div>
                  <div key={live.currentTeam?._id || live.currentTeam?.name || 'none'} className="fa-flash rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3 backdrop-blur min-w-0 max-w-full">
                    <p className="text-xs text-blue-100/80">{live.currentTeam ? 'Highest bidder' : 'No bids yet'}</p>
                    <p className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold truncate">{live.currentTeam ? live.currentTeam.name : 'Waiting for the first bid'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative px-6 py-14 text-center">
              <div className="relative mx-auto w-20 h-20 mb-5" aria-hidden="true">
                <span className="fa-ring absolute inset-0 rounded-full border-2 border-sky-300/60" />
                <span className="fa-ring absolute inset-0 rounded-full border-2 border-sky-300/60 [animation-delay:1.3s]" />
                <span className="absolute inset-0 grid place-items-center text-3xl">⚽</span>
              </div>
              <p className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-bold">No player on the block</p>
              <p className="text-blue-100/80 mt-1 max-w-md mx-auto">This page updates by itself when the next player goes live.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Player card ---------- */
function PlayerCard({ p }) {
  const sold = p.status === 'sold';
  return (
    <article className={`group min-w-0 flex flex-col bg-white dark:bg-[#0c1a3d] border rounded-2xl overflow-hidden transition-[border-color,box-shadow,transform] duration-300 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${
      sold ? 'border-[#1f5eff]/40 hover:shadow-[0_0_0_1px_rgba(31,94,255,0.5),0_20px_50px_-18px_rgba(31,94,255,0.6)]'
           : 'border-[#dbe6fb] dark:border-white/10 hover:border-[#1f5eff]/60 hover:shadow-[0_20px_50px_-22px_rgba(31,94,255,0.55)]'}`}>
      <div className="relative h-44 overflow-hidden bg-[#0a1f5c]">
        <Avatar p={p} text="text-5xl" className="h-full w-full transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f5c]/80 via-transparent to-transparent" />
        {p.position && <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${POS_CLS[p.position] || 'bg-white text-[#0a1f5c]'}`}>{POS[p.position] || p.position}</span>}
        {sold && <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-[#1f5eff] text-white shadow-[0_0_18px_rgba(56,189,248,0.8)]">Sold</span>}
        {p.status === 'unsold' && <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur">Unsold</span>}
        <h2 className="absolute bottom-3 left-4 right-4 font-['Barlow_Condensed'] text-2xl font-bold leading-tight text-white truncate">{p.name}</h2>
      </div>

      <div className={`flex-1 px-4 py-3.5 ${sold ? 'fa-sheen' : ''}`}>
        {p.department && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.department}</p>}
        {sold ? (
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Sold to</p>
              <p className="font-semibold text-[#0a1f5c] dark:text-white truncate">{p.soldTo?.name || '-'}</p>
            </div>
            <p className="font-['Barlow_Condensed'] text-3xl font-bold leading-none text-[#1f5eff] dark:text-sky-300 shrink-0">{money(p.soldPrice)}</p>
          </div>
        ) : p.status === 'unsold' ? (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">No team bid on this player.</p>
        ) : (
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Base price</p>
            <p className="font-['Barlow_Condensed'] text-2xl font-bold leading-none text-[#0a1f5c] dark:text-white">{money(p.basePrice)}</p>
          </div>
        )}
      </div>
    </article>
  );
}

const Skeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 rounded-2xl bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 animate-pulse motion-reduce:animate-none" />)}
  </div>
);

const Empty = ({ title, text, action }) => (
  <div className="rounded-2xl border border-dashed border-[#c9d9f7] dark:border-white/15 bg-white dark:bg-[#0c1a3d] px-6 py-14 text-center">
    <p className="text-lg font-bold text-[#0a1f5c] dark:text-white">{title}</p>
    <p className="text-slate-500 dark:text-slate-400 mt-1">{text}</p>
    {action}
  </div>
);

/* ---------- Page ---------- */
export default function FootballAuction() {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  usePolling(() => FAPI.get('/auction')
    .then((r) => { setPlayers(r.data); setError(false); })
    .catch(() => setError(true))
    .finally(() => setLoading(false)), 3000);

  const live = players.find((p) => p.status === 'live');
  const pool = players.filter((p) => p.status !== 'live');
  const count = (k) => (k === 'all' ? pool.length : pool.filter((p) => p.status === k).length);
  const term = q.trim().toLowerCase();
  const filtered = pool.filter((p) => (filter === 'all' || p.status === filter) && (!term || p.name?.toLowerCase().includes(term)));
  const shown = filtered.slice(0, limit);
  const left = filtered.length - shown.length;
  const filtering = filter !== 'all' || !!q;
  const reset = () => { setFilter('all'); setQ(''); setLimit(PAGE); };

  return (
    <div className="bg-[#f4f8ff] dark:bg-[#060d20] min-h-screen overflow-x-hidden">
      <style>{CSS}</style>

      {/* ---------- Page header ---------- */}
      <div className="relative overflow-hidden border-b border-[#dbe6fb] dark:border-white/10 bg-gradient-to-b from-white via-[#eef4ff] to-[#f4f8ff] dark:from-[#0a1f5c] dark:via-[#12349a] dark:to-[#1f5eff]">
        <svg className="absolute inset-0 w-full h-full text-[#1f5eff] opacity-[0.09] dark:text-white dark:opacity-[0.13]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" /><circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-28">
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-[#0a1f5c] dark:text-white">Player auction</h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-blue-100 max-w-xl">
            {players.length > 0 ? `${players.length} players, ${players.filter((p) => p.status === 'sold').length} sold. ` : ''}Watch every bid as it happens.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <LiveStage live={live} />

        {/* ---------- Filters ---------- */}
        <section aria-label="Find a player" className="mt-8 sm:mt-10 bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-[0_16px_40px_-26px_rgba(10,31,92,0.35)]">
          <div role="tablist" aria-label="Player status" className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0">
            {FILTERS.map(([k, l]) => {
              const on = filter === k;
              return (
                <button key={k} role="tab" aria-selected={on} onClick={() => { setFilter(k); setLimit(PAGE); }}
                  className={`shrink-0 h-10 px-4 inline-flex items-center gap-2 rounded-full text-sm font-bold border transition-colors ${focusRing} ${
                    on ? 'bg-[#1f5eff] border-[#1f5eff] text-white shadow-[0_0_20px_-4px_rgba(31,94,255,0.8)]'
                       : 'bg-white border-[#dbe6fb] text-slate-600 hover:bg-[#eaf1ff] dark:bg-transparent dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10'}`}>
                  {l}
                  <span className={`text-xs px-1.5 rounded-md ${on ? 'bg-white/20' : 'bg-[#eaf1ff] text-[#1f5eff] dark:bg-white/10 dark:text-sky-300'}`}>{count(k)}</span>
                </button>
              );
            })}
          </div>
          <label className="relative block lg:ml-auto lg:w-72 min-w-0">
            <span className="sr-only">Search players</span>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
            <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search by player name"
              className={`block w-full min-w-0 h-11 pl-11 pr-3 rounded-xl border border-[#dbe6fb] dark:border-white/15 bg-[#f4f8ff] dark:bg-white/5 text-[#0a1f5c] dark:text-white placeholder:text-slate-400 ${focusRing}`} />
          </label>
        </section>

        {/* ---------- Players ---------- */}
        <div className="mt-8">
          {loading && <Skeleton />}

          {!loading && error && players.length === 0 && (
            <Empty title="Couldn’t load the auction" text="Check your connection. We’ll try again automatically." />
          )}

          {!loading && !error && filtered.length === 0 && (
            <Empty
              title={pool.length === 0 ? 'No players yet' : 'No player found'}
              text={pool.length === 0 ? 'Players will appear here once they are added to the auction.' : 'Try a different name or status.'}
              action={filtering && <button onClick={reset} className={`mt-5 px-5 py-2.5 rounded-xl bg-[#1f5eff] text-white font-bold hover:bg-[#1749d6] transition-colors ${focusRing}`}>Clear filters</button>} />
          )}

          {filtered.length > 0 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Showing <b className="text-[#0a1f5c] dark:text-white">{shown.length}</b> of {filtered.length}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {shown.map((p) => <PlayerCard key={p._id} p={p} />)}
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