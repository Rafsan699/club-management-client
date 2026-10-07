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

/* Palette (same as FootballHome)
   bg #060912 · ink #eef2ff · soft #93a0bd · line white/10
   gold #f2c14e (active, focus) · cyan #3dd6d0 (Main site link) · violet #a78bfa · button text #0a0e1c
   Header is always dark, matching the page below it. */

const focus =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c14e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060912]';

const bar = 'w-[22px] h-[2.5px] rounded bg-[#eef2ff] transition-transform motion-reduce:transition-none';

export default function FootballHeader() {
  const [open, setOpen] = useState(false);

  // desktop nav link
  const cls = ({ isActive }) =>
    `relative px-3.5 py-2 rounded-lg text-[15px] font-semibold transition-colors motion-reduce:transition-none ${focus} ${
      isActive
        ? 'text-[#f2c14e] bg-[#f2c14e]/10 border border-[#f2c14e]/35 after:content-[""] after:absolute after:left-3 after:right-3 after:-bottom-[9px] after:h-[3px] after:rounded-full after:bg-[#f2c14e] after:shadow-[0_0_12px_#f2c14e] max-lg:after:hidden'
        : 'text-[#93a0bd] border border-transparent hover:text-[#eef2ff] hover:bg-white/10'
    }`;

  // mobile menu link
  const mobileCls = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold transition-colors motion-reduce:transition-none ${focus} ${
      isActive
        ? 'text-[#f2c14e] bg-[#f2c14e]/10 border border-[#f2c14e]/35'
        : 'text-[#eef2ff] border border-transparent hover:bg-white/10'
    }`;

  const mainSite = `px-3.5 py-2 rounded-lg text-[15px] font-bold text-[#3dd6d0] bg-[#3dd6d0]/10 border border-[#3dd6d0]/35 hover:brightness-125 transition ${focus}`;

  return (
    <header className="sticky top-0 z-50 bg-[#060912]/90 backdrop-blur text-[#eef2ff] shadow-[0_14px_32px_-18px_rgba(0,0,0,0.9)]">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* logo + club name */}
        <Link to="/sports/football" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl ${focus}`}>
          <img
            src={logo}
            alt="BRIU Sports Club logo"
            width="48"
            height="48"
            className="w-12 h-12 rounded-xl bg-[#060d20] object-cover shrink-0 ring-1 ring-white/15 shadow-[0_0_24px_-6px_#f2c14e]"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
          />
          <span className="leading-none">
            <span className="block font-['Barlow_Condensed'] text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(100deg,#fff_15%,#f2c14e_55%,#3dd6d0_100%)]">
              BRIU Sports Club
            </span>
            <span className="block text-xs font-semibold text-[#3dd6d0] mt-0.5">Football</span>
          </span>
        </Link>

        {/* desktop */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Football">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>
          ))}
          <span className="w-px h-6 bg-white/15 mx-2" aria-hidden="true" />
          <Link to="/" className={mainSite}>Main site</Link>
        </nav>

        {/* phone: hamburger */}
        <button
          className={`lg:hidden w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-[5px] hover:bg-white/15 transition-colors ${focus}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className={`${bar} ${open ? 'translate-y-[7.5px] rotate-45' : ''}`} />
          <span className={`${bar} ${open ? 'opacity-0' : ''}`} />
          <span className={`${bar} ${open ? '-translate-y-[7.5px] -rotate-45' : ''}`} />
        </button>
      </div>

      {/* gold → cyan accent line (replaces the old blue border) */}
      <div className="h-[3px] bg-[linear-gradient(90deg,#f2c14e,#ffdf8a_45%,#3dd6d0)] shadow-[0_0_18px_rgba(242,193,78,0.45)]" aria-hidden="true" />

      {/* phone menu */}
      {open && (
        <nav className="lg:hidden bg-[#060912]/95 border-b border-white/10" aria-label="Football mobile">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1.5">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={mobileCls} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <Link to="/" onClick={() => setOpen(false)} className={`${mainSite} text-center py-3`}>Main site</Link>
          </div>
        </nav>
      )}
    </header>
  );
}