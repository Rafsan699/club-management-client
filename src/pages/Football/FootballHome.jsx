import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FAPI, { usePolling, fmtDate } from './footballApi';
import StandingsTable, { formatLabel } from './StandingsTable';

/* Palette
   royal #1f5eff · navy #0a1f5c · mist #eaf1ff · line #dbe6fb · page #f4f8ff
   dark: page #060d20 · card #0c1a3d                                          */

const ICONS = {
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  teams: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01'
};
const Icon = ({ name, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
);

const Logo = ({ t, size = 'w-12 h-12' }) => t?.logo
  ? <img src={t.logo} alt="" className={`${size} rounded-full object-cover bg-white ring-1 ring-[#dbe6fb] dark:ring-white/10 shrink-0`} />
  : <span className={`${size} rounded-full bg-[#1f5eff] text-white grid place-items-center text-xs font-bold shrink-0`}>{(t?.shortName || t?.name || '?').slice(0, 3)}</span>;

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5eff] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#060d20]';

const Panel = ({ title, sub, to, action = 'View all', children, className = '' }) => (
  <section className={`bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl shadow-[0_1px_2px_rgba(10,31,92,0.04),0_16px_40px_-24px_rgba(10,31,92,0.3)] ${className}`}>
    <header className="flex items-start justify-between gap-3 px-4 sm:px-7 pt-5 sm:pt-7">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-1.5 self-stretch min-h-[2rem] rounded-full bg-[#1f5eff] shrink-0" />
        <div className="min-w-0">
          <h2 className="font-['Barlow_Condensed'] text-[1.75rem] sm:text-4xl font-bold leading-tight text-[#0a1f5c] dark:text-white break-words">{title}</h2>
          {sub && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-words">{sub}</p>}
        </div>
      </div>
      {to && (
        <Link to={to} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-[#1f5eff] dark:text-sky-300 bg-[#eaf1ff] dark:bg-white/10 hover:bg-[#dbe6fb] dark:hover:bg-white/15 transition-colors ${focusRing}`}>{action}</Link>
      )}
    </header>
    <div className="p-4 sm:p-7 min-w-0">{children}</div>
  </section>
);

const StatusPill = ({ m }) => {
  if (m.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE {m.minute}'
      </span>
    );
  }
  if (m.status === 'completed') {
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 shrink-0">Full time</span>;
  }
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#eaf1ff] text-[#1f5eff] dark:bg-[#1f5eff]/20 dark:text-sky-300 shrink-0">Upcoming</span>;
};

const Side = ({ t }) => (
  <div className="flex flex-col items-center gap-2 text-center min-w-0">
    <Logo t={t} size="w-12 h-12 sm:w-14 sm:h-14" />
    <span className="text-sm font-semibold leading-tight line-clamp-2 break-words w-full text-[#0a1f5c] dark:text-white">{t?.shortName || t?.name}</span>
  </div>
);

const MatchCard = ({ m }) => (
  <article className="min-w-0 rounded-2xl border border-[#dbe6fb] dark:border-white/10 bg-[#fbfdff] dark:bg-white/5 p-4 sm:p-5 flex flex-col gap-4">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate min-w-0">{m.tournament?.name}{m.round && ` · ${m.round}`}</p>
      <StatusPill m={m} />
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <Side t={m.teamA} />
      <b className="font-['Barlow_Condensed'] text-3xl sm:text-4xl text-[#0a1f5c] dark:text-white px-1 whitespace-nowrap">
        {m.status === 'upcoming' ? 'vs' : `${m.scoreA} - ${m.scoreB}`}
      </b>
      <Side t={m.teamB} />
    </div>
    <p className="text-xs sm:text-sm text-center text-slate-500 dark:text-slate-400 border-t border-[#e6eefc] dark:border-white/10 pt-3 truncate">
      {fmtDate(m.date)}{m.time && ` · ${m.time}`}{m.venue && ` · ${m.venue}`}
    </p>
  </article>
);

const Empty = ({ children }) => (
  <div className="rounded-xl border border-dashed border-[#c9d9f7] dark:border-white/15 bg-[#f4f8ff] dark:bg-white/5 px-4 py-8 text-center text-slate-500 dark:text-slate-400">{children}</div>
);

const byDate = (a, b) => new Date(a.date) - new Date(b.date);

export default function FootballHome() {
  const [d, setD] = useState({ matches: [], tournaments: [], teams: [], players: [], table: [] });
  const [tab, setTab] = useState(null);

  usePolling(async () => {
    try {
      const [m, t, tm, p] = await Promise.all([FAPI.get('/matches'), FAPI.get('/tournaments'), FAPI.get('/teams'), FAPI.get('/auction')]);
      const active = t.data.find((x) => x.status === 'ongoing') || t.data[0];
      const table = active ? (await FAPI.get(`/points/table/${active._id}`)).data : [];
      setD({ matches: m.data, tournaments: t.data, teams: tm.data, players: p.data, table, active });
    } catch (e) { /* silent: next poll retries */ }
  }, 8000);

  const live = d.matches.filter((m) => m.status === 'live');
  const upcoming = d.matches.filter((m) => m.status === 'upcoming').sort(byDate).slice(0, 6);
  const results = d.matches.filter((m) => m.status === 'completed').sort((a, b) => byDate(b, a)).slice(0, 6);
  const hero = live[0] || upcoming[0];
  const livePlayer = d.players.find((p) => p.status === 'live');
  const sold = d.players.filter((p) => p.status === 'sold');
  const active = d.active;

  const tabs = [['live', 'Live', live], ['upcoming', 'Upcoming', upcoming], ['results', 'Results', results]];
  const current = tab || (live.length ? 'live' : upcoming.length ? 'upcoming' : 'results');
  const shown = tabs.find(([k]) => k === current)[2];
  const emptyText = { live: 'No match is live right now.', upcoming: 'No upcoming matches. New fixtures appear here once they are scheduled.', results: 'No results yet. Finished matches appear here.' }[current];

  const stats = [
    ['Tournaments', d.tournaments.length, '/sports/football/tournament', 'trophy'],
    ['Teams', d.teams.length, '/sports/football/team', 'teams'],
    ['Matches', d.matches.length, '/sports/football/schedule', 'calendar'],
    ['Players sold', sold.length, '/sports/football/auction', 'tag']
  ];

  return (
    <div className="bg-[#f4f8ff] dark:bg-[#060d20] min-h-screen overflow-x-hidden">
      {/* ---------- Hero ---------- */}
      <div className="relative overflow-hidden text-[#0a1f5c] dark:text-white border-b border-[#dbe6fb] dark:border-white/10 bg-gradient-to-b from-white via-[#eef4ff] to-[#f4f8ff] dark:from-[#0a1f5c] dark:via-[#12349a] dark:to-[#1f5eff]">
        <svg className="absolute inset-0 w-full h-full text-[#1f5eff] opacity-[0.09] dark:text-white dark:opacity-[0.13]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 300" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="3"><rect x="20" y="20" width="760" height="260" /><line x1="400" y1="20" x2="400" y2="280" />
            <circle cx="400" cy="150" r="55" /><rect x="20" y="85" width="110" height="130" /><rect x="670" y="85" width="110" height="130" /></g>
        </svg>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-28 text-center">
          <p className="text-sm sm:text-base font-medium text-[#1f5eff] dark:text-blue-100">Brahmaputra International University</p>
          <h1 className="font-['Barlow_Condensed'] text-6xl sm:text-7xl md:text-8xl font-bold leading-none mt-2 text-[#0a1f5c] dark:text-white">BRIU Football</h1>

          {hero ? (
            <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-10 bg-white dark:bg-[#0c1a3d] text-[#0a1f5c] dark:text-white border border-[#dbe6fb] dark:border-white/10 rounded-3xl p-5 sm:p-8 shadow-[0_24px_60px_-28px_rgba(10,31,92,0.35)]">
              <div className="flex justify-center mb-5">
                {hero.status === 'live'
                  ? <StatusPill m={hero} />
                  : <span className="bg-[#eaf1ff] dark:bg-[#1f5eff]/20 text-[#1f5eff] dark:text-sky-300 px-3.5 py-1.5 rounded-full text-sm font-bold">Next match · {fmtDate(hero.date)}{hero.time && ` · ${hero.time}`}</span>}
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
                <div className="flex flex-col items-center gap-3 min-w-0">
                  <Logo t={hero.teamA} size="w-16 h-16 sm:w-24 sm:h-24" />
                  <b className="text-sm sm:text-lg leading-tight line-clamp-2 break-words w-full">{hero.teamA?.name}</b>
                </div>
                <div className="font-['Barlow_Condensed'] text-5xl sm:text-7xl font-bold whitespace-nowrap">
                  {hero.status === 'upcoming' ? 'vs' : `${hero.scoreA} - ${hero.scoreB}`}
                </div>
                <div className="flex flex-col items-center gap-3 min-w-0">
                  <Logo t={hero.teamB} size="w-16 h-16 sm:w-24 sm:h-24" />
                  <b className="text-sm sm:text-lg leading-tight line-clamp-2 break-words w-full">{hero.teamB?.name}</b>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-5 pt-4 border-t border-[#e6eefc] dark:border-white/10 truncate">
                {hero.tournament?.name}{hero.round && ` · ${hero.round}`}{hero.venue && ` · ${hero.venue}`}
              </p>
            </div>
          ) : (
            <p className="mt-8 text-slate-500 dark:text-blue-100">Fixtures will appear here once the schedule is published.</p>
          )}

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/sports/football/schedule" className={`px-6 py-3 rounded-xl bg-[#1f5eff] text-white font-bold shadow-sm hover:bg-[#1749d6] transition-colors ${focusRing}`}>See full schedule</Link>
            <Link to="/sports/football/point-table" className={`px-6 py-3 rounded-xl border border-[#1f5eff]/30 bg-white dark:bg-transparent dark:border-white/40 text-[#1f5eff] dark:text-white font-bold hover:bg-[#eaf1ff] dark:hover:bg-white/10 transition-colors ${focusRing}`}>Open point table</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        {/* ---------- Stats strip (overlaps hero) ---------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 -mt-12 sm:-mt-14 relative z-10 mb-8 sm:mb-10">
          {stats.map(([label, value, to, icon]) => (
            <Link key={label} to={to}
              className={`group bg-white dark:bg-[#0c1a3d] border border-[#dbe6fb] dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_16px_40px_-24px_rgba(10,31,92,0.4)] hover:border-[#1f5eff] transition-colors ${focusRing}`}>
              <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl grid place-items-center bg-[#eaf1ff] dark:bg-[#1f5eff]/20 text-[#1f5eff] dark:text-sky-300 mb-3 sm:mb-4"><Icon name={icon} /></span>
              <b className="block font-['Barlow_Condensed'] text-4xl sm:text-5xl leading-none text-[#0a1f5c] dark:text-white">{value}</b>
              <span className="block text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          {/* ---------- Match center ---------- */}
          <Panel title="Fixtures and results" sub="Live scores, upcoming matches and latest results" to="/sports/football/schedule">
            <div className="grid grid-cols-3 gap-2 mb-5 sm:flex sm:overflow-x-auto sm:pb-1" role="tablist">
              {tabs.map(([k, label, list]) => (
                <button key={k} role="tab" aria-selected={current === k} onClick={() => setTab(k)}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-full text-[13px] sm:text-sm font-semibold transition-colors sm:shrink-0 ${focusRing} ${
                    current === k ? 'bg-[#1f5eff] text-white shadow-sm' : 'bg-[#eaf1ff] text-[#0a1f5c] hover:bg-[#dbe6fb] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'}`}>
                  {k === 'live' && list.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  {label}
                  <span className={`hidden sm:inline text-xs px-1.5 rounded-full ${current === k ? 'bg-white/25' : 'bg-white dark:bg-white/10'}`}>{list.length}</span>
                </button>
              ))}
            </div>
            {shown.length > 0
              ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((m) => <MatchCard key={m._id} m={m} />)}</div>
              : <Empty>{emptyText}</Empty>}
          </Panel>

          {/* ---------- Standings + side column ---------- */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 items-start">
            <Panel className="lg:col-span-2 min-w-0" title="Standings" sub={active?.name} to="/sports/football/point-table" action="Full table">
              {d.table.length > 0
                ? <StandingsTable rows={d.table} format={active?.format} limit={8} bare />
                : <Empty>Standings will appear after the first completed match.</Empty>}
            </Panel>

            <div className="flex flex-col gap-6 sm:gap-8 min-w-0">
              <Panel title="Tournament in focus">
                {active ? (
                  <div>
                    <h3 className="text-lg font-bold text-[#0a1f5c] dark:text-white leading-snug">{active.name}</h3>
                    <p className="inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full capitalize bg-[#eaf1ff] text-[#1f5eff] dark:bg-[#1f5eff]/20 dark:text-sky-300">{active.status}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{formatLabel(active)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {fmtDate(active.startDate)}{active.endDate && ` to ${fmtDate(active.endDate)}`}{active.venue && ` · ${active.venue}`}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <Link to="/sports/football/schedule" className={`text-center px-3 py-2.5 rounded-xl bg-[#1f5eff] text-white text-sm font-bold hover:bg-[#1749d6] transition-colors ${focusRing}`}>Fixtures</Link>
                      <Link to="/sports/football/point-table" className={`text-center px-3 py-2.5 rounded-xl border border-[#1f5eff]/30 text-[#1f5eff] dark:text-sky-300 text-sm font-bold hover:bg-[#eaf1ff] dark:hover:bg-white/10 transition-colors ${focusRing}`}>Standings</Link>
                    </div>
                  </div>
                ) : <Empty>No tournament yet.</Empty>}
              </Panel>

              <Panel title="Player auction" to="/sports/football/auction" action="Open">
                {livePlayer ? (
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
                    </span>
                    <h3 className="text-lg font-bold text-[#0a1f5c] dark:text-white mt-3">{livePlayer.name} <span className="font-medium text-slate-500 dark:text-slate-400">({livePlayer.position})</span></h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Current bid <b className="text-[#0a1f5c] dark:text-white">{livePlayer.currentBid}</b>{livePlayer.currentTeam && ` by ${livePlayer.currentTeam.name}`}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No player on the block right now. <b className="text-[#0a1f5c] dark:text-white">{sold.length}</b> players sold so far.</p>
                )}
              </Panel>
            </div>
          </div>

          {/* ---------- Tournaments ---------- */}
          <Panel title="Tournaments" sub="Browse every competition" to="/sports/football/tournament">
            {d.tournaments.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {d.tournaments.slice(0, 3).map((t) => (
                  <Link key={t._id} to="/sports/football/tournament"
                    className={`group rounded-2xl overflow-hidden border border-[#dbe6fb] dark:border-white/10 bg-[#fbfdff] dark:bg-white/5 hover:border-[#1f5eff] transition-colors ${focusRing}`}>
                    {t.banner
                      ? <img src={t.banner} alt="" className="h-40 sm:h-44 w-full object-cover" />
                      : <div className="h-40 sm:h-44 bg-gradient-to-br from-[#0a1f5c] to-[#1f5eff] grid place-items-center text-white/80"><Icon name="trophy" className="w-12 h-12" /></div>}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <b className="text-[#0a1f5c] dark:text-white leading-snug">{t.name}</b>
                        <span className="text-xs font-bold px-2 py-1 rounded-full capitalize bg-[#eaf1ff] text-[#1f5eff] dark:bg-[#1f5eff]/20 dark:text-sky-300 shrink-0">{t.status}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 capitalize">{t.category}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatLabel(t)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : <Empty>No tournament has been added yet.</Empty>}
          </Panel>

          {/* ---------- Teams ---------- */}
          <Panel title="Teams" sub={`${d.teams.length} registered`} to="/sports/football/team">
            {d.teams.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {d.teams.slice(0, 12).map((t) => (
                  <Link key={t._id} to="/sports/football/team"
                    className={`flex flex-col items-center gap-2.5 text-center rounded-2xl p-3 sm:p-4 bg-[#f4f8ff] dark:bg-white/5 border border-transparent hover:border-[#1f5eff] transition-colors ${focusRing}`}>
                    <Logo t={t} size="w-14 h-14 sm:w-16 sm:h-16" />
                    <span className="text-xs sm:text-sm font-semibold leading-tight line-clamp-2 break-words w-full text-[#0a1f5c] dark:text-slate-100">{t.name}</span>
                  </Link>
                ))}
              </div>
            ) : <Empty>No team has been registered yet.</Empty>}
          </Panel>
        </div>
      </div>
    </div>
  );
}