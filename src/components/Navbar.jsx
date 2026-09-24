import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { exploreMenuTree } from '../data/exploreMenuData';
import {
  Trophy, Lock, LogIn, UserPlus, User, LogOut, ChevronDown, LayoutGrid, ChevronRight, X, Sun, Moon
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home', short: 'Home', end: true },
  { to: '/about-us', label: 'About Club', short: 'About' },
  { to: '/team', label: 'Team', short: 'Team' },
  { to: '/events', label: 'Events', short: 'Events' },
  { to: '/contact', label: 'Contact Us', short: 'Contact' },
  { to: '/news', label: 'Newsfeed', short: 'News' },
];

const Navbar = ({ content, user, darkMode, setDarkMode, handleLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  /* ---------- Theme tokens ---------- */
  const t = darkMode
    ? {
        header: 'bg-slate-950/80 border-white/10',
        text: 'text-slate-100',
        muted: 'text-slate-400',
        link: 'text-slate-300 hover:text-white',
        linkActive: 'text-white',
        panel: 'bg-slate-950/95 border-white/10 text-slate-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]',
        divider: 'border-white/10',
        iconBtn: 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10',
        ghostBtn: 'text-slate-300 hover:text-white hover:bg-white/10',
        outlineBtn: 'border-white/15 text-slate-100 hover:bg-white/10',
        menuBtn: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/25',
        mobileRow: 'bg-slate-950/60 border-white/10',
        mobileLink: 'text-slate-300 hover:bg-white/10',
        mobileLinkActive: 'bg-emerald-500/15 text-emerald-300',
        catRow: 'border-white/10 hover:bg-white/[0.04]',
        catOpen: 'bg-white/[0.04] border-emerald-400/40',
        countChip: 'bg-white/10 text-slate-300',
        subLink: 'text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300',
        tile: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300',
        closeBtn: 'text-slate-400 hover:text-white hover:bg-white/10',
        userBtn: 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-100',
        dropdown: 'bg-slate-950 border-white/10 text-slate-200 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)]',
        chip: 'bg-white/5 border-white/10 text-slate-300',
        logout: 'text-red-400 hover:bg-red-500/10',
      }
    : {
        header: 'bg-white/80 border-slate-200/80',
        text: 'text-slate-900',
        muted: 'text-slate-500',
        link: 'text-slate-600 hover:text-slate-900',
        linkActive: 'text-emerald-800',
        panel: 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.35)]',
        divider: 'border-slate-200/80',
        iconBtn: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
        ghostBtn: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        outlineBtn: 'border-slate-300 text-slate-800 hover:bg-slate-50',
        menuBtn: 'bg-emerald-900 border-emerald-900 text-white hover:bg-emerald-800',
        mobileRow: 'bg-slate-50/80 border-slate-200/80',
        mobileLink: 'text-slate-600 hover:bg-white',
        mobileLinkActive: 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200',
        catRow: 'border-slate-200/80 hover:bg-slate-50',
        catOpen: 'bg-emerald-50/50 border-emerald-600/40',
        countChip: 'bg-slate-100 text-slate-600',
        subLink: 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800',
        tile: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        closeBtn: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
        userBtn: 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800',
        dropdown: 'bg-white border-slate-200 text-slate-800 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)]',
        chip: 'bg-slate-50 border-slate-200 text-slate-600',
        logout: 'text-red-600 hover:bg-red-50',
      };

  const focus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  return (
    <header
      className={`${t.header} ${t.text} backdrop-blur-xl border-b fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
    >
      {/* Local animation (respects reduced motion) */}
      <style>{`
        @keyframes nb-pop { from { opacity: 0; transform: translateY(-6px) scale(.985); } to { opacity: 1; transform: none; } }
        .nb-pop { animation: nb-pop .18s ease-out; transform-origin: top left; }
        @media (prefers-reduced-motion: reduce) { .nb-pop { animation: none; } }
      `}</style>

      {/* Fine accent line along the bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">

        {/* Left Section: Menu Button */}
        <div className="flex items-center sm:relative">
          <button
            onClick={() => setShowExploreMenu(!showExploreMenu)}
            aria-expanded={showExploreMenu}
            aria-haspopup="true"
            className={`${t.menuBtn} ${focus} h-10 pl-3 pr-3.5 rounded-lg border font-semibold text-sm flex items-center gap-2 transition-colors duration-200 active:scale-[0.98]`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Menu</span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${showExploreMenu ? 'rotate-180' : ''}`} />
          </button>

          {showExploreMenu && (
            <div
              className={`nb-pop absolute left-2 right-2 top-full mt-2 sm:left-0 sm:right-auto sm:mt-3 sm:w-[880px] sm:max-w-[calc(100vw-3rem)] ${t.panel} backdrop-blur-2xl border rounded-2xl p-4 sm:p-7 z-50 max-h-[80vh] overflow-y-auto custom-scrollbar`}
            >
              {/* Panel header */}
              <div className={`flex items-start justify-between gap-4 pb-5 mb-5 border-b ${t.divider}`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`${t.tile} w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl tracking-tight leading-tight">
                      Club directory
                    </h3>
                    <p className={`text-xs sm:text-[13px] ${t.muted} mt-0.5 leading-snug`}>
                      Committees, resources and portals in one place
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExploreMenu(false)}
                  aria-label="Close menu"
                  className={`${t.closeBtn} ${focus} p-2 rounded-lg transition-colors flex-shrink-0`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Home shortcut */}
              <div className="mb-5">
                <Link
                  to="/"
                  onClick={() => setShowExploreMenu(false)}
                  className={`${focus} inline-flex items-center gap-1.5 h-10 pl-4 pr-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors`}
                >
                  Home dashboard <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                {exploreMenuTree.map((cat, idx) => {
                  const isOpen = expandedCategory === cat.title;

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border overflow-hidden transition-colors duration-200 ${isOpen ? t.catOpen : t.catRow}`}
                    >
                      <button
                        onClick={() => toggleCategory(cat.title)}
                        aria-expanded={isOpen}
                        className={`${focus} w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 transition-colors`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className={`w-1 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${isOpen ? 'bg-emerald-500' : darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                          <span className={`truncate font-semibold text-sm sm:text-[15px] ${isOpen ? (darkMode ? 'text-emerald-300' : 'text-emerald-800') : ''}`}>
                            {cat.title}
                          </span>
                        </span>

                        <span className="flex items-center gap-2.5 flex-shrink-0">
                          <span className={`${t.countChip} text-[11px] px-2 py-0.5 rounded-md font-medium tabular-nums`}>
                            {cat.subItems.length}
                          </span>
                          <ChevronDown className={`w-4 h-4 ${t.muted} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </span>
                      </button>

                      {isOpen && (
                        <div className={`nb-pop px-3 pb-3 pt-1 border-t ${t.divider}`}>
                          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-1 pt-2">
                            {cat.subItems.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                to={sub.path}
                                onClick={() => setShowExploreMenu(false)}
                                className={`${t.subLink} ${focus} group flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors`}
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
                                <span className="truncate">{sub.name}</span>
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
          )}
        </div>

        {/* Center Section: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${focus} relative px-3.5 py-2 text-sm font-semibold transition-colors rounded-md ${isActive ? t.linkActive : t.link} ` +
                `after:absolute after:inset-x-3.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-emerald-500 after:origin-left after:transition-transform after:duration-200 ` +
                (isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Theme Toggle & User Auth Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`${t.iconBtn} ${focus} w-10 h-10 rounded-lg border transition-colors flex items-center justify-center flex-shrink-0`}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-haspopup="true"
                className={`${t.userBtn} ${focus} flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-full border transition-colors`}
              >
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="font-semibold text-sm hidden sm:inline max-w-[140px] truncate">
                  {user.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 ${t.muted} flex-shrink-0 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className={`nb-pop absolute right-0 mt-3 w-72 ${t.dropdown} border rounded-2xl p-2 z-50`} style={{ transformOrigin: 'top right' }}>
                  <div className={`px-3 pt-3 pb-3.5 border-b ${t.divider}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <p className={`text-xs ${t.muted} truncate`}>{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium mt-3">
                      <span className={`${t.chip} px-2.5 py-1 rounded-md border`}>Dept: {user.dept || 'N/A'}</span>
                      <span className={`${t.chip} px-2.5 py-1 rounded-md border`}>Batch: {user.batch || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className={`${t.logout} ${focus} w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors`}
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/admin"
                aria-label="Admin"
                className={`${t.ghostBtn} ${focus} h-10 px-2.5 sm:px-3.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0`}
              >
                <Lock className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
              </Link>

              <Link
                to="/login"
                className={`${t.outlineBtn} ${focus} h-10 px-3 sm:px-4 rounded-lg border text-sm font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0`}
              >
                <LogIn className="w-4 h-4 text-emerald-500" /> Login
              </Link>

              <Link
                to="/register"
                className={`${focus} h-10 px-3 sm:px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm shadow-emerald-900/20 flex items-center gap-1.5 transition-colors flex-shrink-0`}
              >
                <UserPlus className="w-4 h-4" /> Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Responsive Navigation Links Row */}
      <div className={`lg:hidden ${t.mobileRow} border-t`}>
        <nav
          aria-label="Primary mobile"
          className="flex items-center sm:justify-center gap-1 py-1.5 px-3 overflow-x-auto custom-scrollbar"
        >
          {NAV_LINKS.map(({ to, short, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${focus} px-3.5 py-1.5 rounded-md text-[13px] font-semibold whitespace-nowrap transition-colors ${isActive ? t.mobileLinkActive : t.mobileLink}`
              }
            >
              {short}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;