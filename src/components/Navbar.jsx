import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { exploreMenuTree } from '../data/exploreMenuData';
import { 
  Trophy, Lock, LogIn, UserPlus, User, LogOut, ChevronDown, Compass, ChevronRight, X, Sun, Moon 
} from 'lucide-react';

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

  return (
    <header className={`${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/85'} backdrop-blur-2xl border-b fixed inset-x-0 z-50 shadow-sm transition-all duration-300 ${showNavbar ? 'top-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Section: Menu Button */}
        <div className="flex items-center relative">
          <button 
            onClick={() => setShowExploreMenu(!showExploreMenu)}
            className="px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-650 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 sm:gap-2 transition-all duration-300 focus:outline-none hover:scale-105 active:scale-95"
          >
            <Compass className={`w-4 h-4 text-white ${showExploreMenu ? 'rotate-90' : ''} transition-transform duration-300`} />
            <span className="hidden xs:inline">Menu</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showExploreMenu ? 'rotate-180' : ''}`} />
          </button>

          {showExploreMenu && (
            <div className={`absolute top-12 left-0 w-[92vw] sm:w-[900px] max-w-[95vw] ${darkMode ? 'bg-slate-900/98 border-slate-800 text-slate-100' : 'bg-white/98 border-slate-200/80 text-slate-900'} backdrop-blur-2xl border rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-4 sm:p-8 z-50 max-h-[82vh] overflow-y-auto custom-scrollbar`}>
              
              <div className={`flex items-center justify-between pb-4 mb-5 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} rounded-2xl border shadow-sm`}>
                    <Trophy className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-base sm:text-xl uppercase tracking-wider`}>
                      Club Directory & Navigation
                    </h3>
                    <p className={`text-[11px] sm:text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>Browse all club resources, committees and portals instantly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowExploreMenu(false)}
                  className={`p-2 ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} rounded-2xl transition`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-5">
                <Link 
                  to="/"
                  onClick={() => setShowExploreMenu(false)}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.02]"
                >
                  <ChevronRight className="w-4 h-4" /> Home Page Dashboard
                </Link>
              </div>

              {/* All Categories Listed Clearly */}
              <div className="space-y-3">
                {exploreMenuTree.map((cat, idx) => {
                  const isOpen = expandedCategory === cat.title;

                  return (
                    <div 
                      key={idx} 
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200/80'
                      }`}
                    >
                      <button
                        onClick={() => toggleCategory(cat.title)}
                        className={`w-full text-left p-3.5 sm:p-4 flex items-center justify-between font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-xs sm:text-base uppercase tracking-wide transition-all hover:bg-emerald-500/5`}
                      >
                        <span className="flex items-center gap-2.5 sm:gap-3 truncate pr-2">
                          <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-emerald-600 shadow-md shadow-emerald-600/40 scale-110' : `${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}`}></span>
                          <span className={`truncate ${isOpen ? 'text-emerald-600' : ''}`}>{cat.title}</span>
                        </span>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                            {cat.subItems.length} items
                          </span>
                          <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className={`p-3 sm:p-4 pt-2 border-t ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white'} animate-in fade-in duration-200`}>
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                            {cat.subItems.map((sub, sIdx) => (
                              <Link 
                                key={sIdx}
                                to={sub.path}
                                onClick={() => setShowExploreMenu(false)}
                                className={`flex items-center gap-2 p-2.5 rounded-xl ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'} font-bold text-xs border shadow-sm transition-all duration-150 hover:scale-[1.02]`}
                              >
                                <span className="text-emerald-600 font-black">›</span>
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
        <nav className={`hidden lg:flex items-center gap-6 text-xs font-black tracking-widest uppercase ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <Link to="/" className="hover:text-emerald-600 transition flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Home</Link>
          <Link to="/about-us" className="hover:text-emerald-600 transition">About Club</Link>
          <Link to="/team" className="hover:text-emerald-600 transition">Team</Link>
          <Link to="/events" className="hover:text-emerald-600 transition">Events</Link>
          <Link to="/contact" className="hover:text-emerald-600 transition">Contact Us</Link>
          <Link to="/news" className="hover:text-emerald-600 transition">Newsfeed</Link>
        </nav>

        {/* Right Section: Theme Toggle & User Auth Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'} transition shadow-sm focus:outline-none flex items-center justify-center flex-shrink-0`}
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center gap-1.5 sm:gap-2 ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} py-1.5 px-2 sm:px-3 rounded-full border transition focus:outline-none shadow-sm`}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className={`font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'} text-xs hidden sm:inline truncate max-w-[100px]`}>
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
              </button>

              {showDropdown && (
                <div className={`absolute right-0 mt-2 w-60 sm:w-64 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-2xl shadow-xl py-3 px-4 z-50 animate-in fade-in`}>
                  <div className={`pb-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-sm truncate`}>{user.name}</p>
                    <p className="text-[11px] text-emerald-600 font-bold truncate mt-0.5">{user.email}</p>
                    <div className="flex gap-2 text-[10px] font-semibold text-slate-500 mt-2 flex-wrap">
                      <span className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'} px-2 py-0.5 rounded-md border`}>Dept: {user.dept || 'N/A'}</span>
                      <span className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'} px-2 py-0.5 rounded-md border`}>Batch: {user.batch || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg text-xs font-extrabold transition"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Link 
                to="/admin" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden xxs:inline">Admin</span>
              </Link>

              <Link 
                to="/login" 
                className={`${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'} text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1 transition hover:scale-105 active:scale-95 shadow-sm flex-shrink-0`}
              >
                <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" /> <span>Login</span>
              </Link>

              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <UserPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden xxs:inline">Register</span>
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Mobile/Responsive Navigation Links Row */}
      <div className={`lg:hidden flex items-center justify-around sm:justify-center gap-2 sm:gap-4 py-1.5 px-2 text-[10px] sm:text-[11px] font-black tracking-wider uppercase border-t overflow-x-auto custom-scrollbar ${darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
        <Link to="/" className="hover:text-emerald-600 transition whitespace-nowrap">Home</Link>
        <Link to="/about-us" className="hover:text-emerald-600 transition whitespace-nowrap">About</Link>
        <Link to="/team" className="hover:text-emerald-600 transition whitespace-nowrap">Team</Link>
        <Link to="/events" className="hover:text-emerald-600 transition whitespace-nowrap">Events</Link>
        <Link to="/contact" className="hover:text-emerald-600 transition whitespace-nowrap">Contact</Link>
        <Link to="/news" className="hover:text-emerald-600 transition whitespace-nowrap">News</Link>
      </div>
    </header>
  );
};

export default Navbar;