import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from './logo.jpg'; // client/src/pages/Football/logo.jpg

const LINKS = [
  { to: '/sports/football', label: 'Home', end: true },
  { to: '/sports/football/tournament', label: 'Tournaments' },
  { to: '/sports/football/team', label: 'Teams' },
  { to: '/sports/football/schedule', label: 'Schedule' },
  { to: '/sports/football/point-table', label: 'Point Table' },
  { to: '/sports/football/auction', label: 'Auction' }
];

/* Palette
   royal  #1f5eff  primary / active
   navy   #0a1f5c  text + dark-mode surface base (#0a1530)
   mist   #eaf1ff  hover tint
   line   #dbe6fb  borders                                  */

const Sun = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const Moon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export default function FootballHeader({ darkMode, setDarkMode }) {
  const [open, setOpen] = useState(false);

  const focus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5eff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a1530]';

  const cls = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-[15px] font-semibold transition-colors ${focus} ${
      isActive
        ? 'bg-[#1f5eff] text-white shadow-sm'
        : 'text-[#0a1f5c] dark:text-slate-200 hover:bg-[#eaf1ff] dark:hover:bg-white/10'
    }`;

  const ghost = `px-3.5 py-2 rounded-lg text-[15px] font-semibold text-[#1f5eff] dark:text-sky-300 border border-[#1f5eff]/25 dark:border-sky-300/25 hover:bg-[#eaf1ff] dark:hover:bg-white/10 transition-colors ${focus}`;

  const toggle = `w-9 h-9 grid place-items-center rounded-lg border border-[#dbe6fb] dark:border-white/10 bg-[#f4f8ff] dark:bg-white/10 text-[#1f5eff] dark:text-sky-300 hover:bg-[#eaf1ff] dark:hover:bg-white/20 transition-colors ${focus}`;

  const bar = 'w-[22px] h-[2.5px] rounded bg-[#0a1f5c] dark:bg-white';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a1530]/95 backdrop-blur text-[#0a1f5c] dark:text-white border-b-4 border-[#1f5eff] shadow-[0_10px_28px_-16px_rgba(10,31,92,0.35)]">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* logo + club name */}
        <Link to="/sports/football" className={`flex items-center gap-3 rounded-lg ${focus}`} onClick={() => setOpen(false)}>
          <img src={logo} alt="BRIU Sports Club logo" width="48" height="48"
            className="w-12 h-12 rounded-xl bg-[#060d20] object-cover shrink-0 ring-2 ring-[#1f5eff]/25 shadow-sm"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
          <span className="leading-none">
            <span className="block font-['Barlow_Condensed'] text-2xl font-bold tracking-tight text-[#0a1f5c] dark:text-white">BRIU Sports Club</span>
            <span className="block text-xs font-semibold text-[#1f5eff] dark:text-sky-300 mt-0.5">Football</span>
          </span>
        </Link>

        {/* desktop: components dane */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Football">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>)}
          <span className="w-px h-6 bg-[#dbe6fb] dark:bg-white/15 mx-2" aria-hidden="true" />
          <Link to="/" className={ghost}>Main site</Link>
          <button onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} className={`ml-1 ${toggle}`}>
            {darkMode ? <Sun /> : <Moon />}
          </button>
        </nav>

        {/* phone: 3 icon (hamburger) */}
        <button
          className={`lg:hidden w-11 h-11 rounded-lg bg-[#eaf1ff] dark:bg-white/10 flex flex-col items-center justify-center gap-[5px] ${focus}`}
          aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className={`${bar} transition-transform ${open ? 'translate-y-[7.5px] rotate-45' : ''}`} />
          <span className={`${bar} transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`${bar} transition-transform ${open ? '-translate-y-[7.5px] -rotate-45' : ''}`} />
        </button>
      </div>

      {/* phone menu: 3 icon er vitore components */}
      {open && (
        <nav className="lg:hidden border-t border-[#dbe6fb] dark:border-white/10" aria-label="Football mobile">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls} onClick={() => setOpen(false)}>{l.label}</NavLink>)}
            <div className="h-px bg-[#dbe6fb] dark:bg-white/10 my-2" />
            <Link to="/" onClick={() => setOpen(false)} className={`${ghost} text-left`}>Main site</Link>
            <button onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 text-left px-3.5 py-2 rounded-lg font-semibold text-[#0a1f5c] dark:text-slate-200 hover:bg-[#eaf1ff] dark:hover:bg-white/10 ${focus}`}>
              {darkMode ? <Sun /> : <Moon />}{darkMode ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}