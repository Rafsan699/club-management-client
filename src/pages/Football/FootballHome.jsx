import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FAPI, { usePolling, fmtDate } from './footballApi';
import StandingsTable, { formatLabel } from './StandingsTable';

/* Design tokens (white theme)
   ink #0f172a · body #475569 · muted #64748b · line #e2e8f0 · soft #f8fafc
   accent (pitch green) #0f7a4a · accent-dark #0b5d38 · accent-tint #ecfdf3
   fonts: Manrope (headings) + Inter (body)                                   */

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');
.fb-home { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
.fb-home .fb-h { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
.fb-home .fb-num { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .fb-home * { animation: none !important; transition: none !important; } }
`;

const ICONS = {
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  teams: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  tag: 'M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42zM7.5 7.5h.01',
  chevron: 'M9 18l6-6-6-6',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  gavel: 'M14 13l-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8'
};
const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
);

const Logo = ({ t, size = 'w-12 h-12' }) => t?.logo
  ? <img src={t.logo} alt="" className={`${size} rounded-full object-cover bg-white ring-1 ring-slate-200 shrink-0`} />
  : <span className={`${size} rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 grid place-items-center text-xs font-semibold shrink-0`}>{(t?.shortName || t?.name || '?').slice(0, 3)}</span>;

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7a4a] focus-visible:ring-offset-2';

const SectionHead = ({ title, sub, to, action = 'View all' }) => (
  <header className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
    <div className="min-w-0">
      <h2 className="fb-h text-xl sm:text-2xl font-bold text-slate-900 break-words">{title}</h2>
      {sub && <p className="text-sm text-slate-500 mt-1 break-words">{sub}</p>}
    </div>
    {to && (
      <Link to={to} className={`shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-[#0f7a4a] hover:text-[#0b5d38] rounded-md ${focusRing}`}>
        {action}<Icon name="chevron" className="w-4 h-4" />
      </Link>
    )}
  </header>
);

const Panel = ({ title, sub, to, action, children, className = '' }) => (
  <section className={`min-w-0 ${className}`}>
    <SectionHead title={title} sub={sub} to={to} action={action} />
    {children}
  </section>
);

const Box = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>
);

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

const Side = ({ t }) => (
  <div className="flex flex-col items-center gap-2 text-center min-w-0">
    <Logo t={t} size="w-11 h-11 sm:w-12 sm:h-12" />
    <span className="text-sm font-semibold leading-tight line-clamp-2 break-words w-full text-slate-900">{t?.shortName || t?.name}</span>
  </div>
);

const Meta = ({ icon, children }) => (
  <span className="inline-flex items-center gap-1.5 min-w-0">
    <Icon name={icon} className="w-3.5 h-3.5 shrink-0 text-slate-400" /><span className="truncate">{children}</span>
  </span>
);

const MatchCard = ({ m }) => (
  <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-4 hover:border-slate-300 transition-colors">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-slate-500 truncate min-w-0">{m.tournament?.name}{m.round && ` · ${m.round}`}</p>
      <StatusPill m={m} />
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <Side t={m.teamA} />
      <b className="fb-h fb-num text-2xl sm:text-3xl font-extrabold text-slate-900 px-1 whitespace-nowrap">
        {m.status === 'upcoming' ? 'vs' : `${m.scoreA} - ${m.scoreB}`}
      </b>
      <Side t={m.teamB} />
    </div>
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
      <Meta icon="calendar">{fmtDate(m.date)}</Meta>
      {m.time && <Meta icon="clock">{m.time}</Meta>}
      {m.venue && <Meta icon="pin">{m.venue}</Meta>}
    </div>
  </article>
);

const Empty = ({ children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">{children}</div>
);

const Badge = ({ children }) => (
  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize bg-[#ecfdf3] text-[#0b5d38] shrink-0">{children}</span>
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
    <div className="fb-home bg-white min-h-screen overflow-x-hidden text-slate-700">
      <style>{FONT_CSS}</style>

      {/* ---------- Hero ---------- */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0f7a4a]">Brahmaputra International University</p>
            <h1 className="fb-h text-5xl sm:text-6xl font-extrabold leading-[1.05] mt-3 text-slate-900">BRIU Football</h1>
            <p className="mt-4 max-w-md text-base text-slate-600 leading-relaxed">
              Live scores, fixtures, standings and the player auction for every university tournament.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/sports/football/schedule" className={`px-5 py-3 rounded-lg bg-[#0f7a4a] text-white text-sm font-semibold text-center hover:bg-[#0b5d38] transition-colors ${focusRing}`}>See full schedule</Link>
              <Link to="/sports/football/point-table" className={`px-5 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold text-center hover:bg-slate-50 transition-colors ${focusRing}`}>Open point table</Link>
            </div>
          </div>

          {hero ? (
            <div className="w-full min-w-0 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-28px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-between gap-3 mb-6">
                {hero.status === 'live'
                  ? <StatusPill m={hero} />
                  : <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf3] text-[#0b5d38]">Next match</span>}
                <p className="text-xs text-slate-500 truncate">{hero.tournament?.name}{hero.round && ` · ${hero.round}`}</p>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-5">
                <div className="flex flex-col items-center gap-3 min-w-0 text-center">
                  <Logo t={hero.teamA} size="w-16 h-16 sm:w-20 sm:h-20" />
                  <b className="text-sm sm:text-base font-semibold leading-tight line-clamp-2 break-words w-full text-slate-900">{hero.teamA?.name}</b>
                </div>
                <div className="fb-h fb-num text-4xl sm:text-6xl font-extrabold text-slate-900 whitespace-nowrap">
                  {hero.status === 'upcoming' ? 'vs' : `${hero.scoreA} - ${hero.scoreB}`}
                </div>
                <div className="flex flex-col items-center gap-3 min-w-0 text-center">
                  <Logo t={hero.teamB} size="w-16 h-16 sm:w-20 sm:h-20" />
                  <b className="text-sm sm:text-base font-semibold leading-tight line-clamp-2 break-words w-full text-slate-900">{hero.teamB?.name}</b>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-slate-500">
                <Meta icon="calendar">{fmtDate(hero.date)}</Meta>
                {hero.time && <Meta icon="clock">{hero.time}</Meta>}
                {hero.venue && <Meta icon="pin">{hero.venue}</Meta>}
              </div>
            </div>
          ) : (
            <Empty>Fixtures will appear here once the schedule is published.</Empty>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* ---------- Stats ---------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-200 divide-slate-200 overflow-hidden mb-12 sm:mb-16 bg-white divide-y lg:divide-y-0 lg:divide-x [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-slate-200 lg:[&>*:nth-child(odd)]:border-r-0">
          {stats.map(([label, value, to, icon]) => (
            <Link key={label} to={to} className={`group flex items-center gap-4 p-4 sm:p-6 hover:bg-slate-50 transition-colors ${focusRing}`}>
              <span className="w-10 h-10 shrink-0 rounded-lg grid place-items-center bg-[#ecfdf3] text-[#0f7a4a]"><Icon name={icon} /></span>
              <span className="min-w-0">
                <b className="fb-h fb-num block text-2xl sm:text-3xl font-extrabold leading-none text-slate-900">{value}</b>
                <span className="block text-sm text-slate-500 mt-1 truncate">{label}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-12 sm:gap-16">
          {/* ---------- Match center ---------- */}
          <Panel title="Fixtures and results" sub="Live scores, upcoming matches and latest results" to="/sports/football/schedule">
            <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto" role="tablist">
              {tabs.map(([k, label, list]) => (
                <button key={k} role="tab" aria-selected={current === k} onClick={() => setTab(k)}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-md ${focusRing} ${
                    current === k ? 'text-[#0f7a4a]' : 'text-slate-500 hover:text-slate-900'}`}>
                  {k === 'live' && list.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  {label}
                  <span className={`fb-num text-xs px-1.5 py-0.5 rounded-full ${current === k ? 'bg-[#ecfdf3] text-[#0b5d38]' : 'bg-slate-100 text-slate-500'}`}>{list.length}</span>
                  {current === k && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#0f7a4a]" />}
                </button>
              ))}
            </div>
            {shown.length > 0
              ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((m) => <MatchCard key={m._id} m={m} />)}</div>
              : <Empty>{emptyText}</Empty>}
          </Panel>

          {/* ---------- Standings + side column ---------- */}
          <div className="grid gap-10 lg:gap-8 lg:grid-cols-3 items-start">
            <Panel className="lg:col-span-2" title="Standings" sub={active?.name} to="/sports/football/point-table" action="Full table">
              {d.table.length > 0
                ? <Box className="p-2 sm:p-4 overflow-hidden"><StandingsTable rows={d.table} format={active?.format} limit={8} bare /></Box>
                : <Empty>Standings will appear after the first completed match.</Empty>}
            </Panel>

            <div className="flex flex-col gap-10 min-w-0">
              <Panel title="Tournament in focus">
                {active ? (
                  <Box className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="fb-h text-lg font-bold text-slate-900 leading-snug">{active.name}</h3>
                      <Badge>{active.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-3">{formatLabel(active)}</p>
                    <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-500">
                      <Meta icon="calendar">{fmtDate(active.startDate)}{active.endDate && ` to ${fmtDate(active.endDate)}`}</Meta>
                      {active.venue && <Meta icon="pin">{active.venue}</Meta>}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <Link to="/sports/football/schedule" className={`text-center px-3 py-2.5 rounded-lg bg-[#0f7a4a] text-white text-sm font-semibold hover:bg-[#0b5d38] transition-colors ${focusRing}`}>Fixtures</Link>
                      <Link to="/sports/football/point-table" className={`text-center px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors ${focusRing}`}>Standings</Link>
                    </div>
                  </Box>
                ) : <Empty>No tournament yet.</Empty>}
              </Panel>

              <Panel title="Player auction" to="/sports/football/auction" action="Open">
                <Box className="p-5">
                  {livePlayer ? (
                    <div>
                      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 ring-1 ring-red-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />Live now
                      </span>
                      <h3 className="fb-h text-lg font-bold text-slate-900 mt-3">{livePlayer.name} <span className="text-sm font-medium text-slate-500">({livePlayer.position})</span></h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Current bid <b className="fb-num text-slate-900">{livePlayer.currentBid}</b>{livePlayer.currentTeam && ` by ${livePlayer.currentTeam.name}`}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 shrink-0 rounded-lg grid place-items-center bg-slate-100 text-slate-500"><Icon name="gavel" /></span>
                      <p className="text-sm text-slate-500">No player on the block right now. <b className="fb-num text-slate-900">{sold.length}</b> players sold so far.</p>
                    </div>
                  )}
                </Box>
              </Panel>
            </div>
          </div>

          {/* ---------- Tournaments ---------- */}
          <Panel title="Tournaments" sub="Browse every competition" to="/sports/football/tournament">
            {d.tournaments.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {d.tournaments.slice(0, 3).map((t) => (
                  <Link key={t._id} to="/sports/football/tournament"
                    className={`group rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition ${focusRing}`}>
                    {t.banner
                      ? <img src={t.banner} alt="" className="h-40 sm:h-44 w-full object-cover" />
                      : <div className="h-40 sm:h-44 bg-slate-100 grid place-items-center text-slate-400"><Icon name="trophy" className="w-10 h-10" /></div>}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <b className="fb-h text-slate-900 leading-snug">{t.name}</b>
                        <Badge>{t.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 capitalize">{t.category}</p>
                      <p className="text-sm text-slate-500">{formatLabel(t)}</p>
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
                    className={`flex flex-col items-center gap-2.5 text-center rounded-xl p-3 sm:p-4 bg-white border border-slate-200 hover:border-[#0f7a4a] transition-colors ${focusRing}`}>
                    <Logo t={t} size="w-14 h-14 sm:w-16 sm:h-16" />
                    <span className="text-xs sm:text-sm font-semibold leading-tight line-clamp-2 break-words w-full text-slate-900">{t.name}</span>
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