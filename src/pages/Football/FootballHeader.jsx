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

/* Design tokens (white theme, same as the other Football pages)
   ink #0f172a · body #475569 · line #e2e8f0 · soft #f8fafc
   accent #0f7a4a · accent-dark #0b5d38 · accent-tint #ecfdf3
   fonts: Manrope (brand) + Inter (links)                                     */

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');
.fb-header { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
.fb-header .fb-h { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
@media (prefers-reduced-motion: reduce) { .fb-header * { transition: none !important; } }
`;

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  </svg>
);

// kept in the signature so the parent can still pass them; the site is white-theme only now
export default function FootballHeader({ darkMode, setDarkMode }) { // eslint-disable-line no-unused-vars
  const [open, setOpen] = useState(false);

  const focus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7a4a] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const cls = ({ isActive }) =>
    `relative px-3.5 py-2 rounded-md text-sm font-semibold transition-colors ${focus} ${
      isActive
        ? 'text-[#0f7a4a] bg-[#ecfdf3]'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const ghost = `inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition-colors ${focus}`;

  const bar = 'w-5 h-[2px] rounded bg-slate-800';

  return (
    <header className="fb-header sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900">
      <style>{FONT_CSS}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* logo + club name */}
        <Link to="/sports/football" className={`flex items-center gap-3 rounded-md ${focus}`} onClick={() => setOpen(false)}>
          <img src={logo} alt="BRIU Sports Club logo" width="40" height="40"
            className="w-10 h-10 rounded-lg bg-slate-100 object-cover shrink-0 ring-1 ring-slate-200"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
          <span className="leading-none">
            <span className="fb-h block text-lg font-extrabold text-slate-900">BRIU Sports Club</span>
            <span className="block text-xs font-medium text-[#0f7a4a] mt-1">Football</span>
          </span>
        </Link>

        {/* desktop: links on the right */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Football">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>)}
          <span className="w-px h-6 bg-slate-200 mx-3" aria-hidden="true" />
          <Link to="/" className={ghost}><ExternalIcon />Main site</Link>
        </nav>

        {/* phone: hamburger */}
        <button
          className={`lg:hidden w-10 h-10 rounded-md border border-slate-300 bg-white flex flex-col items-center justify-center gap-[5px] hover:bg-slate-50 transition-colors ${focus}`}
          aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className={`${bar} transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`${bar} transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`${bar} transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </div>

      {/* phone menu */}
      {open && (
        <nav className="lg:hidden border-t border-slate-200 bg-white" aria-label="Football mobile">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls} onClick={() => setOpen(false)}>{l.label}</NavLink>)}
            <div className="h-px bg-slate-200 my-2" />
            <Link to="/" onClick={() => setOpen(false)} className={ghost}><ExternalIcon />Main site</Link>
          </div>
        </nav>
      )}
    </header>
  );
}