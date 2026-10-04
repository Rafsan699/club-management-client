import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { exploreMenuTree } from '../data/exploreMenuData';
import logoImage from './logo.jpg';
import {
  Menu as MenuIcon, X, ChevronDown, Compass, Lock, LogIn, UserPlus, LogOut, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about-us', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
  { to: '/news', label: 'Newsfeed' },
];

// App.jsx e props pass kora ache, tai signature same rakhlam (darkMode ekhane use hocche na,
// header sob mode-e dark navy neon theme-e thakbe)
const Navbar = ({ user, handleLogout }) => {
  const location = useLocation();
  const headerRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [openCat, setOpenCat] = useState(null); // mobile accordion
  const [scrolled, setScrolled] = useState(false);

  const closeAll = () => {
    setMobileOpen(false);
    setExploreOpen(false);
    setUserOpen(false);
  };

  // Logged in thakle "Account" (Login/Register) category dekhano dorkar nai
  const categories = useMemo(
    () =>
      exploreMenuTree.filter(
        (c) => c.title && c.subItems?.length && !(user && c.title === 'Account')
      ),
    [user]
  );

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  // Route change hole sob menu bondho
  useEffect(() => {
    closeAll();
    setOpenCat(null);
  }, [location.pathname]);

  // Scroll korle header compact
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Baire click / Esc chaple bondho
  useEffect(() => {
    const onDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) closeAll();
    };
    const onKey = (e) => e.key === 'Escape' && closeAll();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Mobile menu khola thakle background scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Desktop size-e gele mobile menu auto bondho
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const onChange = (e) => e.matches && setMobileOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const AuthButtons = ({ stretch = false }) => (
    <div className={stretch ? 'grid grid-cols-3 gap-2' : 'flex items-center gap-2'}>
      <Link
        to="/admin"
        className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-xs font-bold text-[#0a1224] shadow-[0_0_14px_rgba(251,191,36,0.35)] transition hover:brightness-110 active:scale-95"
      >
        <Lock className="h-3.5 w-3.5" /> Admin
      </Link>
      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-100 transition hover:border-amber-300/60 hover:text-amber-200 active:scale-95"
      >
        <LogIn className="h-3.5 w-3.5 text-sky-300" /> Login
      </Link>
      <Link
        to="/register"
        className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-bold text-white shadow-[0_0_14px_rgba(56,189,248,0.35)] transition hover:brightness-110 active:scale-95"
      >
        <UserPlus className="h-3.5 w-3.5" /> Register
      </Link>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes hdr-drop { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .hdr-line { background: linear-gradient(90deg, transparent, #38bdf8, #fbbf24, #38bdf8, transparent); }
        .hdr-link { position: relative; transition: color .3s ease, text-shadow .3s ease; }
        .hdr-link::after {
          content:''; position:absolute; left:50%; bottom:-6px; height:2px; width:0; border-radius:2px;
          background: linear-gradient(90deg,#fbbf24,#fcd34d);
          box-shadow: 0 0 8px rgba(251,191,36,.7);
          transform: translateX(-50%); transition: width .3s ease;
        }
        .hdr-link:hover { color:#fde68a; text-shadow: 0 0 12px rgba(251,191,36,.5); }
        .hdr-link:hover::after, .hdr-link[data-active='true']::after { width:100%; }
        .hdr-link[data-active='true'] { color:#fcd34d; text-shadow: 0 0 12px rgba(251,191,36,.45); }
        .hdr-menu { animation: hdr-drop .25s ease both; }
        .hdr-scroll { scrollbar-width: thin; scrollbar-color: rgba(56,189,248,.4) transparent; }
        @media (prefers-reduced-motion: reduce) { .hdr-menu { animation: none !important; } }
      `}</style>

      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a1224]/95 shadow-[0_10px_30px_-12px_rgba(56,189,248,0.35)]'
            : 'bg-[#0a1224]/85 shadow-[0_6px_24px_-14px_rgba(56,189,248,0.25)]'
        }`}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-1/2 h-24 w-56 -translate-y-1/2 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute -right-10 top-1/2 h-24 w-56 -translate-y-1/2 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <div
          className={`relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            scrolled ? 'py-2' : 'py-3.5'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="group flex min-w-0 items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 rounded-xl">
            <div className="relative h-11 w-11 flex-shrink-0">
              <span className="absolute -inset-1.5 rounded-full bg-amber-400/25 blur-md transition-opacity duration-300 group-hover:bg-amber-400/40" />
              <span className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-sky-400" />
              <div className="relative h-full w-full rounded-full bg-[#0a1224] p-[2px] transition-transform duration-300 group-hover:scale-105">
                <img src={logoImage} alt="BRIU Sports Club logo" className="h-full w-full rounded-full object-cover" />
              </div>
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-lg font-extrabold tracking-wide text-slate-50 sm:text-xl [text-shadow:0_0_16px_rgba(56,189,248,0.35)]">
                BRIU Sports Club
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-300/90">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                Official Club Portal
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden items-center gap-7 font-medium text-slate-300 xl:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                data-active={isActive(item.to)}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className="hdr-link py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-3 xl:flex">
            <button
              onClick={() => { setExploreOpen((v) => !v); setUserOpen(false); }}
              aria-expanded={exploreOpen}
              aria-controls="explore-panel"
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold text-slate-100 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                exploreOpen
                  ? 'border-amber-300/60 bg-amber-400/15 shadow-[0_0_16px_rgba(251,191,36,0.4)]'
                  : 'border-sky-400/30 bg-sky-500/10 hover:shadow-[0_0_16px_rgba(251,191,36,0.4)]'
              }`}
            >
              <Compass className={`h-4 w-4 transition-transform duration-300 ${exploreOpen ? 'rotate-90 text-amber-300' : 'text-sky-300'}`} />
              Explore
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => { setUserOpen((v) => !v); setExploreOpen(false); }}
                  aria-expanded={userOpen}
                  className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 py-1.5 pl-1.5 pr-3 text-slate-100 transition hover:border-amber-300/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-[#0a1224]">
                    {initial}
                  </span>
                  <span className="max-w-[110px] truncate text-sm font-semibold">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userOpen && (
                  <div className="hdr-menu absolute right-0 mt-3 w-64 rounded-2xl border border-sky-400/25 bg-[#0a1224]/95 p-4 shadow-[0_20px_40px_-15px_rgba(56,189,248,0.4)] backdrop-blur-xl">
                    <p className="truncate text-sm font-bold text-slate-50">{user.name}</p>
                    <p className="mt-0.5 truncate text-xs text-amber-300">{user.email}</p>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-slate-300">
                      <span className="rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5">Dept: {user.dept || 'N/A'}</span>
                      <span className="rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5">Batch: {user.batch || 'N/A'}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-3 flex w-full items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => { setMobileOpen((v) => !v); setExploreOpen(false); }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-panel"
            className={`relative flex-shrink-0 rounded-xl border p-2 text-slate-100 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 xl:hidden ${
              mobileOpen
                ? 'border-amber-300/60 bg-amber-400/15 shadow-[0_0_16px_rgba(251,191,36,0.4)]'
                : 'border-sky-400/30 bg-sky-500/10 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
            }`}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Desktop explore panel: topic-wise columns */}
        {exploreOpen && (
          <div
            id="explore-panel"
            className="hdr-menu absolute left-0 right-0 top-full hidden border-t border-sky-400/20 bg-[#0a1224]/95 shadow-[0_25px_50px_-15px_rgba(56,189,248,0.35)] backdrop-blur-xl xl:block"
          >
            <div className="hdr-scroll mx-auto max-h-[70vh] max-w-7xl overflow-y-auto px-8 py-7">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-8 gap-y-7">
                {categories.map((cat) => (
                  <div key={cat.title}>
                    <h3 className="mb-3 flex items-center gap-2 border-b border-sky-400/15 pb-2 text-base font-bold text-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                      {cat.title}
                    </h3>
                    <ul className="space-y-1">
                      {cat.subItems.map((sub) => (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            aria-current={isActive(sub.path) ? 'page' : undefined}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive(sub.path)
                                ? 'bg-gradient-to-r from-amber-400/20 to-transparent text-amber-300 shadow-[inset_3px_0_0_#fbbf24]'
                                : 'text-slate-300 hover:bg-sky-500/10 hover:text-amber-200'
                            }`}
                          >
                            <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile panel: nav links + topic accordions + account, sob ekhane */}
        {mobileOpen && (
          <div
            id="mobile-panel"
            className="hdr-menu hdr-scroll relative max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-sky-400/20 bg-[#0a1224]/95 px-4 pb-6 pt-4 shadow-[0_20px_40px_-15px_rgba(56,189,248,0.35)] xl:hidden"
          >
            {/* Main links */}
            <nav aria-label="Main mobile" className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-amber-400/20 to-transparent text-amber-300 shadow-[inset_3px_0_0_#fbbf24]'
                        : 'border border-sky-400/15 text-slate-300 hover:bg-sky-500/10 hover:text-amber-200'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Topic-wise accordions */}
            <p className="mb-2 mt-5 px-1 text-sm font-semibold text-slate-400">Explore the club</p>
            <div className="space-y-2">
              {categories.map((cat) => {
                const open = openCat === cat.title;
                return (
                  <div key={cat.title} className="overflow-hidden rounded-xl border border-sky-400/20 bg-sky-500/5">
                    <button
                      onClick={() => setOpenCat(open ? null : cat.title)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-sky-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300"
                    >
                      <span className={`flex items-center gap-2.5 text-sm font-bold ${open ? 'text-amber-300' : 'text-slate-100'}`}>
                        <span className={`h-2 w-2 rounded-full transition-all ${open ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-slate-600'}`} />
                        {cat.title}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-200">{cat.subItems.length}</span>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180 text-amber-300' : ''}`} />
                      </span>
                    </button>
                    {open && (
                      <ul className="hdr-menu border-t border-sky-400/15 p-2">
                        {cat.subItems.map((sub) => (
                          <li key={sub.path}>
                            <Link
                              to={sub.path}
                              aria-current={isActive(sub.path) ? 'page' : undefined}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                isActive(sub.path)
                                  ? 'bg-amber-400/15 text-amber-300'
                                  : 'text-slate-300 hover:bg-sky-500/10 hover:text-amber-200'
                              }`}
                            >
                              <ChevronRight className="h-3.5 w-3.5 text-sky-400" />
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Account */}
            <div className="mt-5 border-t border-sky-400/15 pt-4">
              {user ? (
                <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-bold text-[#0a1224]">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-50">{user.name}</p>
                      <p className="truncate text-xs text-amber-300">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5">Dept: {user.dept || 'N/A'}</span>
                    <span className="rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5">Batch: {user.batch || 'N/A'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <AuthButtons stretch />
              )}
            </div>
          </div>
        )}

        {/* Neon bottom line */}
        <div className="hdr-line pointer-events-none absolute bottom-0 left-0 h-[2px] w-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
      </header>
    </>
  );
};

export default Navbar;