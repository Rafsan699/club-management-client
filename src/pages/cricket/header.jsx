import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';

const NAV_ITEMS = [
  { to: '/sports/cricket', label: 'Home', mobileLabel: 'Home' },
  { to: '/sports/cricket/team', label: 'Teams', mobileLabel: 'Team' },
  { to: '/sports/cricket/player', label: 'Players', mobileLabel: 'Player' },
  { to: '/sports/cricket/tournament', label: 'Tournaments', mobileLabel: 'Tournament' },
  { to: '/sports/cricket/live', label: 'Live Match', mobileLabel: 'Live Match' },
  { to: '/sports/cricket/point-table', label: 'Point Table', mobileLabel: 'Point Table' },
  { to: '/sports/cricket/auction', label: 'Live Auction', mobileLabel: 'Live Auction' },
  //{ to: '/sports/cricket/news', label: 'News', mobileLabel: 'News' },
];

const MAIN_SITE_PATH = '/';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Admin panel theke logo fetch korar jonno (সঠিক ব্যাকএন্ড রাউট পাথ সহ)
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await API.get('/api/cricket/banner');
        if (response.data && response.data.logoUrl) {
          setLogoUrl(response.data.logoUrl);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };
    fetchLogo();
  }, []);

  // Scroll korle header ektu compact hobe
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (to) =>
    to === '/sports/cricket'
      ? location.pathname === to
      : location.pathname.startsWith(to);

  return (
    <>
      <style>{`
        @keyframes hdr-drop { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

        .hdr-line {
          background: linear-gradient(90deg, transparent, #38bdf8, #fbbf24, #38bdf8, transparent);
        }
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

        @media (prefers-reduced-motion: reduce) {
          .hdr-menu { animation: none !important; }
        }
      `}</style>

      <header
        className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a1224]/95 shadow-[0_10px_30px_-12px_rgba(56,189,248,0.35)]'
            : 'bg-[#0a1224]/85 shadow-[0_6px_24px_-14px_rgba(56,189,248,0.25)]'
        }`}
      >
        {/* Soft static ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-1/2 h-24 w-56 -translate-y-1/2 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute -right-10 top-1/2 h-24 w-56 -translate-y-1/2 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <div
          className={`container relative mx-auto px-4 flex justify-between items-center gap-3 transition-all duration-300 ${
            scrolled ? 'py-2' : 'py-3.5'
          }`}
        >
          {/* Logo Section (Admin panel theke controlled) */}
          <div
            className="group flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="relative h-11 w-11 flex-shrink-0">
              <span className="absolute -inset-1.5 rounded-full bg-amber-400/25 blur-md transition-opacity duration-300 group-hover:bg-amber-400/40" />
              <span className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-sky-400" />
              <div className="relative h-full w-full rounded-full bg-[#0a1224] p-[2px] transition-transform duration-300 group-hover:scale-105">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Cricket Logo"
                    className="h-full w-full object-contain rounded-full"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-sky-600 to-blue-900 text-amber-200 flex items-center justify-center font-bold rounded-full">
                    CP
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold tracking-wide text-slate-50 [text-shadow:0_0_16px_rgba(56,189,248,0.35)]">
                BRIU Sports Club
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                Cricket
              </span>
            </div>
          </div>

          {/* Desktop Navigation (lg theke, karon Main site button add hoyeche) */}
          <nav aria-label="Cricket" className="hidden lg:flex items-center gap-4 xl:gap-7 font-medium text-slate-300">
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

            <span className="mx-1 h-6 w-px bg-sky-400/25" aria-hidden="true" />

            {/* Main site button */}
            <Link
              to={MAIN_SITE_PATH}
              className="flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 px-3.5 py-1.5 text-sm font-semibold text-sky-100 shadow-[0_0_10px_rgba(56,189,248,0.2)] transition-all duration-300 hover:border-amber-300/60 hover:text-amber-200 hover:shadow-[0_0_16px_rgba(251,191,36,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <HomeIcon />
              Main site
            </Link>
          </nav>

          {/* Mobile View Hamburger / 3-Icon Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              className={`relative rounded-xl border p-2 text-slate-100 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                isOpen
                  ? 'border-amber-300/60 bg-amber-400/15 shadow-[0_0_16px_rgba(251,191,36,0.4)]'
                  : 'border-sky-400/30 bg-sky-500/10 shadow-[0_0_10px_rgba(56,189,248,0.25)] hover:shadow-[0_0_16px_rgba(251,191,36,0.4)]'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (3-Icon Click View) */}
        {isOpen && (
          <div className="hdr-menu lg:hidden relative border-t border-sky-400/20 bg-[#0a1224]/[0.98] px-4 pt-3 pb-5 flex flex-col gap-1.5 font-medium shadow-[0_20px_40px_-15px_rgba(56,189,248,0.35)]">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-xl px-4 py-2.5 transition-colors duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-amber-400/20 to-transparent text-amber-300 shadow-[inset_3px_0_0_#fbbf24]'
                      : 'text-slate-300 hover:bg-sky-500/10 hover:text-amber-200'
                  }`}
                >
                  {item.mobileLabel}
                </Link>
              );
            })}

            <div className="my-2 h-px bg-sky-400/20" />

            {/* Main site button (mobile) */}
            <Link
              to={MAIN_SITE_PATH}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 font-semibold text-sky-100 transition-colors duration-200 hover:border-amber-300/60 hover:text-amber-200"
            >
              <HomeIcon />
              Main site
            </Link>
          </div>
        )}

        {/* Static neon bottom line */}
        <div className="hdr-line absolute bottom-0 left-0 h-[2px] w-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
      </header>
    </>
  );
};

export default Header;