import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { exploreMenuTree } from '../data/exploreMenuData';
import { 
  Trophy, Lock, LogIn, UserPlus, User, LogOut, ChevronDown, Compass, ChevronRight, X, Sun, Moon 
} from 'lucide-react';

const Navbar = ({ content, user, darkMode, setDarkMode, handleLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (title) => {
    setExpandedCategory(prev => (prev === title ? null : title));
  };

  return (
    <header className={`${darkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white/85 border-slate-200/85'} backdrop-blur-2xl border-b fixed top-0 inset-x-0 z-50 shadow-sm transition-all`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-4 sm:gap-6 relative w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowExploreMenu(!showExploreMenu)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-650 text-white rounded-2xl font-black text-sm sm:text-base shadow-md shadow-emerald-600/20 flex items-center gap-2.5 transition-all duration-300 focus:outline-none hover:scale-[1.03] active:scale-95"
              >
                <Compass className={`w-5 h-5 text-white ${showExploreMenu ? 'rotate-90' : ''} transition-transform duration-300`} />
                <span>Explore Menu</span>
                <ChevronDown className={`w-4 h-4 ml-0.5 transition-transform duration-300 ${showExploreMenu ? 'rotate-180' : ''}`} />
              </button>

              {showExploreMenu && (
                <div className={`absolute top-16 -left-4 sm:-left-8 w-[95vw] max-w-[950px] ${darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200/80 text-slate-900'} backdrop-blur-2xl border rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.12)] p-6 sm:p-10 z-50 animate-in fade-in slide-in-from-top-4 max-h-[82vh] overflow-y-auto custom-scrollbar`}>
                  
                  <div className={`flex items-center justify-between pb-6 mb-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} rounded-2xl border shadow-sm`}>
                        <Trophy className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-xl sm:text-2xl uppercase tracking-wider`}>
                          Club Directory & Navigation
                        </h3>
                        <p className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>Browse all club resources, committees and portals instantly</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowExploreMenu(false)}
                      className={`p-3 ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} rounded-2xl transition`}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <Link 
                      to="/"
                      onClick={() => setShowExploreMenu(false)}
                      className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm sm:text-base shadow-md shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <ChevronRight className="w-5 h-5" /> Home Page Dashboard
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                    {exploreMenuTree.map((cat, idx) => {
                      const isOpen = expandedCategory === cat.title;

                      return (
                        <div 
                          key={idx} 
                          className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                            isOpen 
                              ? `${darkMode ? 'bg-slate-900 border-emerald-500 ring-emerald-500/10' : 'bg-white border-emerald-500 ring-emerald-500/10'} shadow-xl ring-4 col-span-1 md:col-span-2 lg:col-span-3` 
                              : `${darkMode ? 'bg-slate-900/70 border-slate-800 hover:bg-slate-900 hover:border-emerald-500/40' : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-emerald-500/40'} shadow-sm`
                          }`}
                        >
                          <button
                            onClick={() => toggleCategory(cat.title)}
                            className={`w-full text-left p-5 flex items-center justify-between font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-base sm:text-lg uppercase tracking-wide transition-all`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-emerald-600 shadow-md shadow-emerald-600/40 scale-110' : `${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}`}></span>
                              <span className={isOpen ? 'text-emerald-600 text-lg' : ''}>{cat.title}</span>
                            </span>
                            
                            <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                          </button>
                          
                          {isOpen && (
                            <div className={`p-5 pt-0 border-t ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'} animate-in fade-in duration-300`}>
                              <p className={`text-xs font-black ${darkMode ? 'text-slate-500' : 'text-slate-400'} mb-4 uppercase tracking-wider`}>Sub Categories:</p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {cat.subItems.map((sub, sIdx) => (
                                  <Link 
                                    key={sIdx}
                                    to={sub.path}
                                    onClick={() => setShowExploreMenu(false)}
                                    className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-400' : 'bg-white border-slate-200/85 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'} font-bold text-sm shadow-sm transition-all duration-200 hover:scale-[1.02]`}
                                  >
                                    <span className="text-emerald-600 font-black text-lg">›</span>
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

            <Link to="/" className="flex items-center gap-3.5 group cursor-pointer focus:outline-none">
              {content?.logoUrl ? (
                <img src={content.logoUrl} alt="University Logo" className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                  alt="BRIU Sports Club Logo" 
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-sm border ${darkMode ? 'border-slate-800' : 'border-slate-200'} group-hover:scale-105 transition-transform`} 
                />
              )}
              <div>
                <h1 className={`text-[10px] sm:text-xs font-black ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider leading-tight`}>
                  {content?.universityName || 'Brahmaputra International University'}
                </h1>
                <p className={`text-xs sm:text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'} tracking-wide mt-0.5 group-hover:text-emerald-600 transition-colors`}>
                  {content?.clubTitle || 'BRIU SPORTS CLUB'}
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-end">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'} transition shadow-sm focus:outline-none flex items-center justify-center`}
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center gap-3 ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} p-2 sm:pr-5 rounded-full border transition focus:outline-none shadow-sm`}
              >
                <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center font-black text-base shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>

                <span className={`font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'} text-sm hidden sm:inline`}>
                  {user.name}
                </span>

                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {showDropdown && (
                <div className={`absolute right-0 mt-3 w-72 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-3xl shadow-xl py-4 px-5 z-50 animate-in fade-in`}>
                  <div className={`pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-base truncate`}>{user.name}</p>
                    <p className="text-xs text-emerald-600 font-bold truncate mt-0.5">{user.email}</p>
                    <div className="flex gap-2 text-xs font-semibold text-slate-500 mt-2.5">
                      <span className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'} px-2.5 py-1 rounded-lg border`}>Dept: {user.dept || 'N/A'}</span>
                      <span className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'} px-2.5 py-1 rounded-lg border`}>Batch: {user.batch || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 text-red-600 hover:bg-red-50 p-2.5 rounded-xl text-sm font-extrabold transition"
                    >
                      <LogOut className="w-4 h-4" /> Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <Link 
                to="/admin" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition hover:scale-105 active:scale-95"
              >
                <Lock className="w-4 h-4" /> Admin Panel
              </Link>

              <Link 
                to="/login" 
                className={`${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'} text-xs sm:text-sm font-black px-4 sm:px-5 py-2.5 rounded-2xl border flex items-center gap-2 transition hover:scale-105 active:scale-95 shadow-sm`}
              >
                <LogIn className="w-4 h-4 text-emerald-600" /> Log in
              </Link>

              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2.5 rounded-2xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition hover:scale-105 active:scale-95"
              >
                <UserPlus className="w-4 h-4" /> Registration
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* সাব-নেভিগেশন বারে শুধুমাত্র আপনার কাঙ্ক্ষিত অপশনগুলো রাখা হলো */}
      <nav className={`${darkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-900 text-slate-300 border-slate-800'} border-t`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-wrap gap-8 py-3 text-xs sm:text-sm font-black tracking-widest uppercase">
          <Link to="/" className="hover:text-emerald-400 transition flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Home</Link>
          <Link to="/about-us" className="hover:text-emerald-400 transition">About Club</Link>
          <Link to="/team" className="hover:text-emerald-400 transition">Team</Link>
          <Link to="/events" className="hover:text-emerald-400 transition">Events</Link>
          <Link to="/contact" className="hover:text-emerald-400 transition">Contact Us</Link>
          <Link 
  to="/news" 
  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-purple-600 transition"
>
  Newsfeed
</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;