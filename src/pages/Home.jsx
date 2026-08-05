import React, { useState, useEffect } from 'react';
import API from '../services/api'; // আপনার প্রজেক্ট স্ট্রাকচার অনুযায়ী পাথ ঠিক করে নিন (যেমন: './api' বা '../services/api')
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DepartmentsSection from '../components/DepartmentsSection';
import Footer from '../components/Footer'; 
import { exploreMenuTree } from '../data/exploreMenuData';
import { 
  Trophy, Lock, LogIn, UserPlus, User, LogOut, ChevronDown, Compass, ChevronRight, X, Sparkles, Target, Activity, Flame, Shield, Calendar, Award, Globe, Zap, ArrowRight, Sun, Moon, MapPin, Phone, Mail 
} from 'lucide-react';

const Home = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // New state for handling Upcoming Event Details Modal on the same page
  const [showEventModal, setShowEventModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('clubUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // পোর্টের ঝামেলা এড়াতে এবং ব্যাকএন্ড থেকে ডেটা ফেচ নিশ্চিত করতে ফুল URL ব্যবহার করা হয়েছে[cite: 5]
    API.get('/api/club/content')
      .then(res => {
        if (res.data) {
          setContent(res.data);
        }
      })
      .catch(err => {
        console.error("Error fetching content:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('clubUser');
    setUser(null);
    setShowDropdown(false);
    navigate('/login');
  };

  const toggleCategory = (title) => {
    setExpandedCategory(prev => (prev === title ? null : title));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-slate-800 bg-[#f8fafc] px-4">
        <div className="flex items-center gap-4 sm:gap-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 sm:px-10 py-6 sm:py-7 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-full text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span className="text-base sm:text-lg font-black tracking-wider bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Loading Club Universe...</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-red-600 text-2xl bg-[#f8fafc] dark:bg-slate-950 px-4">
        <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl px-6 sm:px-8 py-6 rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/40 text-center max-w-md w-full">
          <p className="text-slate-900 dark:text-white font-black mb-2 text-lg sm:text-xl">Connection Error</p>
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Failed to load content from server. Please check backend connection.</span>
        </div>
      </div>
    );
  }

  const rawMembers = Array.isArray(content.members) ? content.members : [];
  
  const firstRow = rawMembers.slice(0, 3);
  const secondRow = rawMembers.slice(3, 7);
  const thirdRow = rawMembers.slice(7, 10);

  return (
    <div className={`${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'} min-h-screen font-sans pb-32 selection:bg-purple-500 selection:text-white relative overflow-x-hidden transition-colors duration-300`}>
      
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* HEADER SECTION */}
      <header className={`${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'} backdrop-blur-xl border-b fixed top-0 inset-x-0 z-50 transition-all shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 min-w-0">
              <div className="relative shrink-0">
                <button 
                  onClick={() => setShowExploreMenu(!showExploreMenu)}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all duration-200 focus:outline-none hover:scale-[1.02] active:scale-95"
                >
                  <Compass className={`w-4 h-4 sm:w-4.5 sm:h-4.5 text-white ${showExploreMenu ? 'rotate-90' : ''} transition-transform duration-300 shrink-0`} />
                  <span className="tracking-wide">Explore All</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showExploreMenu ? 'rotate-180' : ''} shrink-0`} />
                </button>

                {showExploreMenu && (
                  <div className={`fixed sm:absolute top-20 sm:top-16 left-3 right-3 sm:left-auto sm:right-auto sm:-left-6 w-auto sm:w-[95vw] max-w-[960px] ${darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200/90 text-slate-900'} backdrop-blur-2xl border rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 z-50 animate-in fade-in slide-in-from-top-4 max-h-[82vh] overflow-y-auto custom-scrollbar`}>
                    
                    <div className={`flex items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-3 ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} rounded-2xl border shadow-inner shrink-0`}>
                          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-base sm:text-xl uppercase tracking-wider truncate`}>
                            Club Directory & Navigation
                          </h3>
                          <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5 truncate`}>Browse all club resources, committees and portals instantly</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowExploreMenu(false)}
                        className={`p-2.5 ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} rounded-2xl transition shrink-0`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mb-5">
                      <Link 
                        to="/"
                        onClick={() => setShowExploreMenu(false)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all duration-200 hover:scale-[1.02]"
                      >
                        <ChevronRight className="w-4 h-4" /> Home Page Dashboard
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                      {exploreMenuTree.map((cat, idx) => {
                        const isOpen = expandedCategory === cat.title;

                        return (
                          <div 
                            key={idx} 
                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                              isOpen 
                                ? `${darkMode ? 'bg-slate-900 border-purple-500 ring-purple-500/10' : 'bg-white border-purple-500 ring-purple-500/10'} shadow-xl ring-4 col-span-1 md:col-span-2 lg:col-span-3` 
                                : `${darkMode ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-purple-500/40' : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:border-purple-500/40'} shadow-sm`
                            }`}
                          >
                            <button
                              onClick={() => toggleCategory(cat.title)}
                              className={`w-full text-left p-4 sm:p-4.5 flex items-center justify-between font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-xs sm:text-base uppercase tracking-wide transition-all`}
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className={`w-3 h-3 rounded-full transition-all duration-300 shrink-0 ${isOpen ? 'bg-purple-600 shadow-md shadow-purple-600/40 scale-110' : `${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}`}></span>
                                <span className={`truncate ${isOpen ? 'text-purple-600' : ''}`}>{cat.title}</span>
                              </span>
                              
                              <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-600' : ''} shrink-0`} />
                            </button>
                            
                            {isOpen && (
                              <div className={`p-4 pt-0 border-t ${darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'} animate-in fade-in duration-300`}>
                                <p className={`text-[10px] sm:text-xs font-black ${darkMode ? 'text-slate-500' : 'text-slate-400'} mb-3 uppercase tracking-wider`}>Sub Categories:</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                  {cat.subItems.map((sub, sIdx) => (
                                    <Link 
                                      key={sIdx}
                                      to={sub.path}
                                      onClick={() => setShowExploreMenu(false)}
                                      className={`flex items-center gap-2.5 p-2.5 rounded-xl ${darkMode ? 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-purple-500 hover:text-purple-400' : 'bg-white border-slate-200/80 text-slate-700 hover:border-purple-500 hover:text-purple-600'} font-bold text-xs shadow-sm transition-all duration-200 hover:scale-[1.02]`}
                                    >
                                      <span className="text-purple-600 font-black text-sm shrink-0">›</span>
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

              <Link to="/" className="flex items-center gap-3 group cursor-pointer focus:outline-none min-w-0">
                {content.logoUrl ? (
                  <img src={content.logoUrl} alt="University Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform shrink-0" />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                    alt="BRIU Sports Club Logo" 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover shadow-sm border ${darkMode ? 'border-slate-800' : 'border-slate-200'} group-hover:scale-105 transition-transform shrink-0`} 
                  />
                )}
                <div className="min-w-0">
                  <h1 className={`text-[9px] sm:text-[10px] font-black ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider leading-tight truncate`}>
                    {content.universityName || 'Brahmaputra International University'}
                  </h1>
                  <p className={`text-xs sm:text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'} tracking-wide mt-0.5 group-hover:text-purple-600 transition-colors truncate`}>
                    {content.clubTitle || 'BRIU SPORTS CLUB'}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-2xl border ${darkMode ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'} transition shadow-sm focus:outline-none flex items-center justify-center shrink-0`}
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2.5 ${darkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} p-1.5 sm:pr-4 rounded-full border transition focus:outline-none shadow-sm`}
                >
                  <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-sm shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>

                  <span className={`font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'} text-xs hidden sm:inline truncate max-w-[120px]`}>
                    {user.name}
                  </span>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {showDropdown && (
                  <div className={`absolute right-0 mt-3 w-64 sm:w-72 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-3xl shadow-2xl py-4 px-5 z-50 animate-in fade-in`}>
                    <div className={`pb-3.5 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <p className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'} text-sm truncate`}>{user.name}</p>
                      <p className="text-xs text-purple-600 font-bold truncate mt-0.5">{user.email}</p>
                      <div className="flex gap-2 text-[11px] font-semibold text-slate-500 mt-2.5 flex-wrap">
                        <span className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'} px-2.5 py-1 rounded-xl border`}>Dept: {user.dept || 'N/A'}</span>
                        <span className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'} px-2.5 py-1 rounded-xl border`}>Batch: {user.batch || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-2.5 rounded-2xl text-xs font-black transition"
                      >
                        <LogOut className="w-4 h-4" /> Logout Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
                <Link 
                  to="/admin" 
                  className="bg-purple-600 hover:bg-purple-500 text-white text-[11px] sm:text-xs font-black px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition hover:scale-105 active:scale-95 shrink-0"
                >
                  <Lock className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Admin Panel</span><span className="xs:hidden">Admin</span>
                </Link>

                <Link 
                  to="/login" 
                  className={`${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'} text-[11px] sm:text-xs font-black px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border flex items-center gap-1.5 transition hover:scale-105 active:scale-95 shadow-sm shrink-0`}
                >
                  <LogIn className="w-3.5 h-3.5 text-purple-600" /> Log in
                </Link>

                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-black px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition hover:scale-105 active:scale-95 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Registration</span><span className="xs:hidden">Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* SUB NAVIGATION BAR */}
        <nav className={`${darkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-900 text-slate-300 border-slate-800'} border-t overflow-x-auto custom-scrollbar`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 sm:gap-8 py-2.5 text-xs font-black tracking-widest uppercase whitespace-nowrap">
            <Link to="/" className="hover:text-purple-400 transition flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Home</Link>
            <Link to="/about-us" className="hover:text-purple-400 transition">About Club</Link>
            <Link to="/team" className="hover:text-purple-400 transition">team</Link>
            <Link to="/events" className="hover:text-purple-400 transition">Events</Link>
            <Link to="/contact" className="hover:text-purple-400 transition">Contact</Link>
          </div>
        </nav>
      </header>

      {/* HERO BANNER SECTION */}
      <section className={`relative overflow-hidden ${darkMode ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-slate-800' : 'bg-gradient-to-b from-white via-slate-50/50 to-white border-slate-200/80'} border-b pt-36 sm:pt-48 lg:pt-56 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 text-center`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0,transparent_70%)] pointer-events-none"></div>
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e110_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e110_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <div className={`inline-flex items-center gap-2 px-4 sm:px-4.5 py-2 rounded-full ${darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200/80 text-purple-700'} text-xs font-black uppercase tracking-widest shadow-sm backdrop-blur-md`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin shrink-0" /> Official Hub of Athletic Champions
          </div>
          
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tight leading-[1.15] px-2`}>
            {content.clubTitle || 'BRIU Sports Club'}
          </h1>
          
          <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm sm:text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4`}>
            Unleashing athletic excellence, fostering discipline, and building the future champions of Brahmaputra International University.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link to="/news" className="w-full sm:w-auto px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Explore Newsfeed <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#committee" className={`w-full sm:w-auto px-7 py-3.5 ${darkMode ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-800' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90'} rounded-2xl font-black text-sm border transition-all hover:scale-105 active:scale-95 shadow-sm backdrop-blur-md flex items-center justify-center`}>
              Meet Committee
            </a>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
        
        {/* ABOUT & OBJECTIVES SECTION */}
        <section id="about" className={`rounded-3xl relative overflow-hidden border ${darkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white/70 border-slate-200/80'} shadow-sm backdrop-blur-xl`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className={`px-6 sm:px-10 py-5 sm:py-6 font-black text-lg sm:text-xl flex items-center justify-between border-b ${darkMode ? 'border-slate-800/80 text-white' : 'border-slate-100 text-slate-900'}`}>
            <span className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-2xl border shadow-inner shrink-0 ${darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" /> 
              </div>
              <span className="truncate">Core Mission & Objectives</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3.5 py-1.5 rounded-full border border-purple-500/20 font-extrabold shrink-0">
              Overview
            </span>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 space-y-8 sm:space-y-10">
            <div>
              <h3 className={`text-base sm:text-lg lg:text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} mb-3 sm:mb-4 flex items-center gap-3`}>
                <div className={`p-2 ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} rounded-xl border shrink-0`}>
                  <Target className="w-4 h-4 text-purple-600" />
                </div> 
                Our Objective:
              </h3>
              <p className={`${darkMode ? 'text-slate-300 bg-slate-950/40 border-slate-800/60' : 'text-slate-700 bg-slate-50/80 border-slate-200/85'} leading-relaxed text-sm sm:text-base lg:text-lg font-medium p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-sm`}>
                {content.objective || 'Promoting sports and physical fitness among students.'}
              </p>
            </div>

            <div id="activities">
              <h3 className={`text-base sm:text-lg lg:text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} mb-4 flex items-center gap-3`}>
                <div className={`p-2 ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} rounded-xl border shrink-0`}>
                  <Activity className="w-4 h-4 text-purple-600" />
                </div> 
                Major Activities:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {content.activities && content.activities.length > 0 ? (
                  content.activities.map((act, idx) => (
                    <div key={idx} className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl ${darkMode ? 'bg-slate-950/40 border-slate-800/60 hover:border-purple-500/40 text-slate-200' : 'bg-slate-50/80 border-slate-200/85 hover:border-purple-500/40 text-slate-800'} font-bold text-xs sm:text-sm shadow-sm transition-all group`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0 shadow-sm shadow-purple-600/40 group-hover:scale-125 transition-transform"></span>
                      <span className="break-words">{act}</span>
                    </div>
                  ))
                ) : (
                  <div className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl ${darkMode ? 'bg-slate-950/40 border-slate-800/60 text-slate-200' : 'bg-slate-50/80 border-slate-200/85 text-slate-800'} font-bold text-xs sm:text-sm shadow-sm`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0 shadow-sm shadow-purple-600/40"></span>
                    <span>Annual Sports Tournament</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* COMMITTEE SECTION */}
        <section id="committee" className={`rounded-3xl p-6 sm:p-12 lg:p-16 text-center relative overflow-hidden border ${darkMode ? 'bg-slate-900/20 border-slate-800/50' : 'bg-white/60 border-slate-200/80'} shadow-sm backdrop-blur-xl`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="mb-12 sm:mb-16 space-y-2 sm:space-y-3 relative z-10 px-2">
            <span className="inline-block text-[11px] sm:text-xs uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full border border-amber-500/20 font-black shadow-sm">
              Leadership Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-amber-600 tracking-tight">
              Congratulations
            </h2>
            <h3 className={`text-xl sm:text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
              {content.committeeTitle || 'Executive Committee'}
            </h3>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 mx-auto mt-3 rounded-full shadow-sm"></div>
          </div>

          {content.convener?.name && (
            <div className="mb-16 sm:mb-20 flex flex-col items-center relative z-10 px-2">
              <div className="relative p-2 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-500 shadow-xl group">
                <img 
                  src={content.convener.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                  alt={content.convener.name} 
                  className={`w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full object-cover border-4 ${darkMode ? 'border-slate-950' : 'border-white'} shadow-xl group-hover:scale-105 transition-transform duration-500`}
                />
              </div>
              <h4 className={`text-lg sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} mt-5 tracking-wide`}>{content.convener.name}</h4>
              <p className="text-sm sm:text-base font-extrabold text-purple-600 mt-1">{content.convener.role}</p>
              <p className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{content.convener.dept}</p>
            </div>
          )}

          <div className="space-y-6 sm:space-y-10 relative z-10">
            {firstRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                {firstRow.map((member, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col items-center p-6 sm:p-8 rounded-3xl ${darkMode ? 'hover:bg-slate-900/60 border-slate-800/80 bg-slate-900/30' : 'hover:bg-white border-slate-200/85 bg-white/70'} transition-all duration-300 border shadow-sm group hover:-translate-y-1.5 ${idx === 1 ? `sm:-translate-y-4 ring-4 ring-purple-500/10 shadow-xl ${darkMode ? 'border-purple-500/40 bg-slate-900/60' : 'border-purple-500/40 bg-white'}` : ''}`}
                  >
                    <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/30 shadow-sm">
                      <img 
                        src={member.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                        alt={member.name} 
                        className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 ${darkMode ? 'border-slate-950' : 'border-white'} shadow-md group-hover:scale-105 transition duration-300`}
                      />
                    </div>
                    <h5 className={`text-sm sm:text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'} mt-4 leading-snug`}>{member.name}</h5>
                    <p className="text-xs sm:text-sm font-extrabold text-purple-600 mt-1">{member.role}</p>
                    <p className={`text-[11px] sm:text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{member.dept}</p>
                  </div>
                ))}
              </div>
            )}

            {secondRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {secondRow.map((member, idx) => (
                  <div key={idx} className={`flex flex-col items-center p-6 sm:p-8 rounded-3xl ${darkMode ? 'hover:bg-slate-900/60 border-slate-800/80 bg-slate-900/30' : 'hover:bg-white border-slate-200/85 bg-white/70'} transition-all duration-300 border shadow-sm group hover:-translate-y-1.5`}>
                    <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/30 shadow-sm">
                      <img 
                        src={member.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                        alt={member.name} 
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 ${darkMode ? 'border-slate-950' : 'border-white'} shadow-md group-hover:scale-105 transition duration-300`}
                      />
                    </div>
                    <h5 className={`text-sm sm:text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'} mt-4 leading-snug`}>{member.name}</h5>
                    <p className="text-xs sm:text-sm font-extrabold text-purple-600 mt-1">{member.role}</p>
                    <p className={`text-[11px] sm:text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{member.dept}</p>
                  </div>
                ))}
              </div>
            )}

            {thirdRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {thirdRow.map((member, idx) => (
                  <div key={idx} className={`flex flex-col items-center p-6 sm:p-8 rounded-3xl ${darkMode ? 'hover:bg-slate-900/60 border-slate-800/80 bg-slate-900/30' : 'hover:bg-white border-slate-200/85 bg-white/70'} transition-all duration-300 border shadow-sm group hover:-translate-y-1.5`}>
                    <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/30 shadow-sm">
                      <img 
                        src={member.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                        alt={member.name} 
                        className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 ${darkMode ? 'border-slate-950' : 'border-white'} shadow-md group-hover:scale-105 transition duration-300`}
                      />
                    </div>
                    <h5 className={`text-sm sm:text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'} mt-4 leading-snug`}>{member.name}</h5>
                    <p className="text-xs sm:text-sm font-extrabold text-purple-600 mt-1">{member.role}</p>
                    <p className={`text-[11px] sm:text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{member.dept}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING EVENT BANNER SECTION */}
        {content.upcomingEvent && (content.upcomingEvent.title || content.upcomingEvent.bannerUrl) && (
          <section className={`rounded-3xl border shadow-sm overflow-hidden relative ${darkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white/70 border-slate-200/85'} p-6 sm:p-10 backdrop-blur-xl`}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 relative z-10">
              {content.upcomingEvent.bannerUrl && (
                <div className="w-full lg:w-1/2 overflow-hidden rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-800">
                  <img 
                    src={content.upcomingEvent.bannerUrl} 
                    alt="Upcoming Event Banner" 
                    className="w-full h-auto max-h-[350px] object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              )}

              <div className={`w-full ${content.upcomingEvent.bannerUrl ? 'lg:w-1/2' : 'lg:w-full'} space-y-4 text-left`}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" /> Upcoming Event
                </div>

                <h3 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                  {content.upcomingEvent.title || 'Exciting Event Coming Up!'}
                </h3>

                <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                  {content.upcomingEvent.description || 'Stay tuned for more details regarding our upcoming sports event and activities.'}
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-xs font-bold text-slate-500">
                  {content.upcomingEvent.date && (
                    <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Date: {content.upcomingEvent.date}
                    </div>
                  )}
                  {content.upcomingEvent.location && (
                    <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Location: {content.upcomingEvent.location}
                    </div>
                  )}
                </div>

                {/* Modified button to open modal on the same page instead of redirecting or opening external window */}
                <div className="pt-2">
                  <button 
                    onClick={() => setShowEventModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs shadow-md shadow-purple-600/20 transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* DEPARTMENTS SECTION */}
        <div className={`rounded-3xl overflow-x-hidden`}>
          <div onClick={() => navigate('/departments')} className="cursor-pointer transition hover:opacity-95">
            <DepartmentsSection departments={content?.departments} />
          </div>
        </div>
      </main>

      {/* SAME PAGE EVENT DETAILS MODAL */}
      {showEventModal && content.upcomingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-950'} rounded-3xl shadow-2xl border p-6 sm:p-8 custom-scrollbar`}>
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20">
                  <Calendar className="w-5 h-5" />
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide">Event Full Details</h3>
              </div>
              <button 
                onClick={() => setShowEventModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {content.upcomingEvent.bannerUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <img src={content.upcomingEvent.bannerUrl} alt="Event Banner" className="w-full h-auto max-h-[300px] object-cover" />
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xl sm:text-2xl font-black tracking-tight">{content.upcomingEvent.title}</h4>
                <p className="text-sm font-medium leading-relaxed opacity-90">{content.upcomingEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {content.upcomingEvent.date && (
                  <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
                    <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                      <p className="text-xs font-black">{content.upcomingEvent.date}</p>
                    </div>
                  </div>
                )}
                {content.upcomingEvent.location && (
                  <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                      <p className="text-xs font-black">{content.upcomingEvent.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC CONTACT / FOOTER PANEL SECTION */}
      <div id="contact" className="w-full bg-slate-900 text-slate-100 py-12 sm:py-16 px-4 sm:px-8 lg:px-16 mt-20 sm:mt-32 shadow-2xl relative z-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          
          {/* Column 1: Club Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-amber-400 tracking-wide uppercase">
              {content.contact?.companyName || content.clubTitle || "Club Info"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {content.contact?.shortDescription || content.objective || "Empowering members through sports and physical fitness."}
            </p>
          </div>

          {/* Column 2: Contact Us Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Phone size={15} /> Contact Us
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="break-all sm:break-normal">{content.contact?.address || content.address || 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-amber-400 shrink-0" />
                <span className="break-all sm:break-normal">{content.contact?.email || content.email || 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-amber-400 shrink-0" />
                <span className="break-all sm:break-normal">{content.contact?.phone || content.phone || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Column 3: Follow Us & Social Apps Links from Admin Panel */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">Follow Us</h3>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {content.contact?.socialLinks && content.contact.socialLinks.length > 0 ? (
                content.contact.socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition shadow-md flex items-center justify-center border border-slate-700"
                  >
                    {social.platform}
                  </a>
                ))
              ) : (
                <span className="text-xs text-slate-400">No social links added yet.</span>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500 px-2">
          {content.contact?.copyright || `© ${new Date().getFullYear()} ${content.clubTitle || "Club"}. All rights reserved.`}
        </div>
      </div>

      {/* FLASH NEWS TICKER */}
      {content.flashNews && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-xl text-white text-xs sm:text-sm py-3 px-4 sm:px-8 flex items-center gap-4 z-50 border-t border-slate-800 shadow-[0_-15px_40px_rgba(0,0,0,0.15)]">
          <span className="bg-purple-500 text-slate-950 font-black px-3 py-1 rounded-xl text-[10px] uppercase tracking-widest shrink-0 z-10 shadow-md shadow-purple-500/30 animate-pulse flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" /> Live News
          </span>
          <div className="w-full overflow-hidden whitespace-nowrap relative">
            <div className="inline-block animate-marquee font-extrabold text-purple-400 tracking-wide text-xs sm:text-sm">
              {content.flashNews}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7); 
        }
      `}</style>

    </div>
  );
};

export default Home;