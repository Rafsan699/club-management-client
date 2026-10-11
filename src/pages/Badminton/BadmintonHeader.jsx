import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BASE } from './bdApi';

export const TABS = [
  { to: BASE, label: 'Overview', end: true },
  { to: `${BASE}/tournament`, label: 'Tournaments' },
  { to: `${BASE}/team`, label: 'Teams' },
  { to: `${BASE}/players`, label: 'Players' },
  { to: `${BASE}/live`, label: 'Live', live: true }, // 📽️ fullscreen projector view
  { to: `${BASE}/schedule`, label: 'Schedule' },
  { to: `${BASE}/point-table`, label: 'Point Table' },
  { to: `${BASE}/projector`, label: 'Projector' },
];

export default function BadmintonHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = () => TABS.map((t) => (
    <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'on' : '')} onClick={() => setOpen(false)}>
      {t.live && <i className="bdh-live" />}{t.label}
    </NavLink>
  ));
  return (
    <>
      <div className="bdh-spacer" aria-hidden="true" />
      <header className={`bdh ${scrolled ? 'sc' : ''}`}>
        <div className="bdh-in">
          <Link to={BASE} className="bdh-brand">
            <span className="bdh-logo">
              <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentNode.textContent = '🏸'; }} />
            </span>
            <div><div className="bdh-title">BRIU <b>Sports Club</b></div><div className="bdh-sub">Badminton</div></div>
          </Link>
          <nav className="bdh-nav" aria-label="Badminton">
            {links()}
            <span className="bdh-sep" />
            <Link to="/" className="bdh-main">Main site</Link>
          </nav>
          <button className={`bdh-burger ${open ? 'open' : ''}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
        </div>
        {open && (
          <nav className="bdh-menu">
            {links()}
            <Link to="/" className="bdh-main" onClick={() => setOpen(false)}>Main site</Link>
          </nav>
        )}
      </header>
    </>
  );
}