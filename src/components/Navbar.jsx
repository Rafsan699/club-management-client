import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { exploreMenuTree } from '../data/exploreMenuData';
import logoImage from './logo.jpg';
import {
  Lock, LogIn, UserPlus, User, LogOut, ChevronDown, ChevronRight, Menu, X
} from 'lucide-react';

/*
  Palette
  ink    #0e2b22  deep bottle green (text, brand mark)
  green  #14684e  primary actions, active states
  brass  #b08a4e  single accent: directory top rule + open-category marker
  wash   #f7f8f6  page/panel background
  line   #dfe3dd  hairlines
*/

const NAV_LINKS = [
  { to: '/', label: 'Home', short: 'Home', end: true },
  { to: '/about-us', label: 'About Club', short: 'About' },
  { to: '/team', label: 'Team', short: 'Team' },
  { to: '/events', label: 'Events', short: 'Events' },
  { to: '/contact', label: 'Contact Us', short: 'Contact' },
  { to: '/news', label: 'Newsfeed', short: 'News' },
];

const getClubName = (content) => {
  const raw = content && (content.clubName || content.name || content.title);
  return typeof raw === 'string' && raw.trim() ? raw.trim() : 'BRIUSC';
};

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14684e] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const Navbar = ({ content, user, handleLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const clubName = getClubName(content);

  const logoSrc = logoImage || content?.logo || content?.logoUrl || content?.clubLogo || null;

  const toggleCategory = (title) => {
    setExpandedCategory(prev => (prev === title ? null : title));
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
        setShowExploreMenu(false);
        setShowDropdown(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!showExploreMenu) return undefined;
    const isSheet = window.matchMedia('(max-width: 1023px)').matches;
    const previousOverflow = document.body.style.overflow;
    if (isSheet) document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowExploreMenu(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showExploreMenu]);

  const closeMenu = () => setShowExploreMenu(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap');
        .nb-serif { font-family: 'Newsreader', Georgia, 'Times New Roman', serif; }
        .nb-noscrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .nb-noscrollbar::-webkit-scrollbar { display: none; }
        @keyframes nb-pop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .nb-pop { animation: nb-pop .18s ease-out; }
        @media (prefers-reduced-motion: reduce) { .nb-pop { animation: none; } }
      `}</style>

      <header
        className={`fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#dfe3dd] transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center gap-2 sm:gap-4">

          {/* Left: Sudhu Menu Button + Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            
            {/* Sudhu ekti Menu Button */}
            <button
              onClick={() => setShowExploreMenu(!showExploreMenu)}
              aria-expanded={showExploreMenu}
              aria-haspopup="dialog"
              aria-label="Open club menu"
              className={`${focusRing} h-9 w-9 sm:h-10 sm:w-auto sm:px-3.5 rounded-lg border flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors flex-shrink-0 ${
                showExploreMenu
                  ? 'bg-[#0e2b22] border-[#0e2b22] text-white'
                  : 'bg-white border-[#dfe3dd] text-[#0e2b22] hover:bg-[#f3f5f1]'
              }`}
            >
              <Menu className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown className={`hidden sm:block w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${showExploreMenu ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div
                className="nb-serif w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#0e2b22] text-[#e9d6b0] text-[17px] sm:text-[19px] font-semibold flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#dfe3dd]"
              >
                {logoSrc ? (
                  <img src={logoSrc} alt={clubName} className="w-full h-full object-cover" />
                ) : (
                  clubName.charAt(0).toUpperCase()
                )}
              </div>
              <Link to="/" className={`${focusRing} flex items-center min-w-0 rounded-lg`} aria-label={`${clubName} home`}>
                <span className="nb-serif hidden md:block text-[18px] font-semibold text-[#0e2b22] truncate max-w-[200px] xl:max-w-[260px]">
                  {clubName}
                </span>
              </Link>
            </div>
          </div>

          {/* Center: primary links (desktop) */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1" aria-label="Primary">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${focusRing} relative px-3.5 py-2 text-[13.5px] font-medium rounded-md transition-colors ${isActive ? 'text-[#0e2b22]' : 'text-slate-500 hover:text-[#0e2b22]'} ` +
                  `after:absolute after:inset-x-3.5 after:-bottom-[13px] after:h-0.5 after:bg-[#14684e] after:origin-center after:transition-transform after:duration-200 ` +
                  (isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right: account */}
          <div className="ml-auto lg:ml-0 flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                  className={`${focusRing} flex items-center gap-2 h-9 sm:h-10 pl-1 pr-2.5 sm:pr-3 rounded-full border border-[#dfe3dd] bg-white hover:bg-[#f3f5f1] text-[#0e2b22] transition-colors`}
                >
                  <span className="w-6 h-6 sm:w-7 sm:h-7 bg-[#14684e] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm hidden sm:inline max-w-[140px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div
                    className="nb-pop absolute right-0 mt-3 w-72 max-w-[calc(100vw-1.5rem)] bg-white border border-[#dfe3dd] rounded-2xl p-2 z-50 shadow-[0_24px_60px_-24px_rgba(14,43,34,0.4)]"
                    style={{ transformOrigin: 'top right' }}
                  >
                    <div className="px-3 pt-3 pb-4 border-b border-[#e6e9e3]">
                      <div className="flex items-center gap-3">
                        <span className="w-11 h-11 bg-[#14684e] text-white rounded-full flex items-center justify-center font-semibold text-base flex-shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#0e2b22] truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <dl className="grid grid-cols-2 gap-2 mt-3.5 text-xs">
                        <div className="rounded-lg bg-[#f7f8f6] border border-[#e6e9e3] px-3 py-2">
                          <dt className="text-slate-500">Department</dt>
                          <dd className="font-semibold text-[#0e2b22] mt-0.5 truncate">{user.dept || 'N/A'}</dd>
                        </div>
                        <div className="rounded-lg bg-[#f7f8f6] border border-[#e6e9e3] px-3 py-2">
                          <dt className="text-slate-500">Batch</dt>
                          <dd className="font-semibold text-[#0e2b22] mt-0.5 truncate">{user.batch || 'N/A'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleLogout}
                        className={`${focusRing} w-full flex items-center gap-2.5 px-3 h-11 rounded-lg text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors`}
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/admin"
                  aria-label="Admin"
                  className={`${focusRing} h-9 w-9 sm:h-10 sm:w-auto sm:px-2.5 rounded-lg flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0e2b22] hover:bg-[#f3f5f1] transition-colors`}
                >
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>

                <Link
                  to="/login"
                  className={`${focusRing} h-9 px-2.5 sm:px-3.5 rounded-lg border border-[#c9cfc6] bg-white hover:bg-[#f3f5f1] text-[#0e2b22] text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors`}
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14684e]" /> Login
                </Link>

                <Link
                  to="/register"
                  className={`${focusRing} h-9 px-2.5 sm:px-3.5 rounded-lg bg-[#14684e] hover:bg-[#0f5540] text-white text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors`}
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Tablet / phone: compact tab-style link row */}
        <nav
          aria-label="Primary mobile"
          className="lg:hidden border-t border-[#e6e9e3] bg-white"
        >
          <div className="nb-noscrollbar flex items-stretch sm:justify-center h-10 px-1 overflow-x-auto">
            {NAV_LINKS.map(({ to, short, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${focusRing} px-2.5 sm:px-4 flex items-center text-[12px] sm:text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive ? 'border-[#14684e] text-[#0e2b22]' : 'border-transparent text-slate-500 hover:text-[#0e2b22]'
                  }`
                }
              >
                {short}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      {/* ---------- Club menu dropdown drawer ---------- */}
      {showExploreMenu && (
        <>
          <div
            className="hidden lg:block fixed inset-0 z-40 bg-[#0e2b22]/25"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-[60] lg:z-50 lg:inset-x-0 lg:top-16 lg:bottom-auto lg:pointer-events-none">
            <div className="h-full lg:h-auto lg:max-w-7xl lg:mx-auto lg:px-8">
              <section
                role="dialog"
                aria-modal="true"
                aria-label="Club directory"
                className="nb-pop relative flex flex-col h-full w-full bg-white overflow-hidden lg:h-auto lg:w-[800px] lg:max-h-[min(78vh,740px)] lg:mt-3 lg:rounded-2xl lg:border lg:border-[#dfe3dd] lg:shadow-[0_30px_80px_-30px_rgba(14,43,34,0.5)] lg:pointer-events-auto"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 bg-[#b08a4e]" aria-hidden="true" />

                <div className="flex-shrink-0 flex items-start justify-between gap-4 px-4 sm:px-7 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 border-b border-[#dfe3dd] bg-white">
                  <div className="min-w-0">
                    <h2 className="nb-serif text-[26px] sm:text-[28px] leading-tight font-semibold text-[#0e2b22]">
                      Club directory
                    </h2>
                    <p className="text-[13px] text-slate-500 mt-1">
                      Committees, resources and portals
                    </p>
                  </div>
                  <button
                    onClick={closeMenu}
                    aria-label="Close directory"
                    className={`${focusRing} w-11 h-11 -mr-1 rounded-full border border-[#dfe3dd] text-slate-600 hover:text-[#0e2b22] hover:bg-[#f3f5f1] flex items-center justify-center transition-colors flex-shrink-0`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#f7f8f6] px-4 sm:px-7 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className={`${focusRing} flex items-center justify-between h-12 px-4 rounded-xl bg-[#0e2b22] hover:bg-[#153a2f] text-white text-sm font-semibold transition-colors`}
                  >
                    Home dashboard
                    <ChevronRight className="w-4 h-4 text-[#e9d6b0]" />
                  </Link>

                  <div className="mt-5 bg-white border border-[#dfe3dd] rounded-xl overflow-hidden divide-y divide-[#e6e9e3]">
                    {exploreMenuTree.map((cat, idx) => {
                      const isOpen = expandedCategory === cat.title;

                      return (
                        <div key={idx}>
                          <button
                            onClick={() => toggleCategory(cat.title)}
                            aria-expanded={isOpen}
                            className={`${focusRing} relative w-full min-h-[3.5rem] px-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-[#fafbf9] ${
                              isOpen ? 'before:absolute before:left-0 before:inset-y-0 before:w-[3px] before:bg-[#b08a4e]' : ''
                            }`}
                          >
                            <span className={`truncate text-[15px] font-semibold ${isOpen ? 'text-[#14684e]' : 'text-[#0e2b22]'}`}>
                              {cat.title}
                            </span>
                            <span className="flex items-center gap-2.5 flex-shrink-0">
                              <span className="min-w-[1.5rem] text-center text-xs font-medium tabular-nums text-slate-500 bg-[#eef1ec] rounded-full px-2 py-0.5">
                                {cat.subItems.length}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#14684e]' : ''}`} />
                            </span>
                          </button>

                          {isOpen && (
                            <div className="nb-pop bg-[#f7f8f6] border-t border-[#e6e9e3] overflow-hidden">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -mb-px">
                                {cat.subItems.map((sub, sIdx) => (
                                  <Link
                                    key={sIdx}
                                    to={sub.path}
                                    onClick={closeMenu}
                                    className={`${focusRing} group flex items-center justify-between gap-3 min-h-[3rem] px-4 text-[14px] font-medium text-[#1f3a30] border-b border-[#e6e9e3] hover:bg-white hover:text-[#14684e] transition-colors`}
                                  >
                                    <span className="truncate">{sub.name}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#14684e]" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;