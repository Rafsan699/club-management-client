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
  
  // States for header scroll hide/show
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false); // Hide on scroll down
      } else {
        setShowNavbar(true); // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const savedUser = localStorage.getItem('clubUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // পোর্টের ঝামেলা এড়াতে এবং ব্যাকএন্ড থেকে ডেটা ফেচ নিশ্চিত করতে ফুল URL ব্যবহার করা হয়েছে
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
      <div className="min-h-screen flex items-center justify-center font-normal text-2xl text-slate-800 bg-[#f8fafc] px-4">
        <div className="flex items-center gap-4 sm:gap-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 sm:px-10 py-6 sm:py-7 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-full text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span className="text-base sm:text-lg font-medium tracking-wider bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Loading Club Universe...</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center font-normal text-red-600 text-2xl bg-[#f8fafc] dark:bg-slate-950 px-4">
        <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl px-6 sm:px-8 py-6 rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/40 text-center max-w-md w-full">
          <p className="text-slate-900 dark:text-white font-medium mb-2 text-lg sm:text-xl">Connection Error</p>
          <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400">Failed to load content from server. Please check backend connection.</span>
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
      
      {/* HEADER PANEL SECTION */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'} ${darkMode ? 'bg-slate-950/90 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'} backdrop-blur-md border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Menu / Explore Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowExploreMenu(!showExploreMenu)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'}`}
            >
              <Compass className="w-3.5 h-3.5 text-purple-500" /> Menu <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </div>

          {/* Nav Options in One Line */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-wider">
            <a href="#" className="hover:text-purple-600 transition">Home</a>
            <a href="#about" className="hover:text-purple-600 transition">About</a>
            <a href="#committee" className="hover:text-purple-600 transition">Club</a>
            <a href="#committee" className="hover:text-purple-600 transition">Team</a>
            <a href="#activities" className="hover:text-purple-600 transition">Events</a>
            <a href="#contact" className="hover:text-purple-600 transition">Contact</a>
            <Link to="/news" className="hover:text-purple-600 transition">Newsfeed</Link>
          </nav>

          {/* Right side: Login / Register & Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} border`}
                >
                  <User className="w-3.5 h-3.5 text-purple-500" />
                  <span className="max-w-[80px] truncate">{user.name || 'User'}</span>
                </button>
                {showDropdown && (
                  <div className={`absolute right-0 mt-2 w-40 rounded-xl shadow-xl border py-1 z-50 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-purple-500 hover:text-white flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to="/login" className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition">
                  Login
                </Link>
                <Link to="/register" className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${darkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'}`}>
                  Register
                </Link>
              </div>
            )}

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-lg border transition ${darkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Explore Menu Dropdown/Modal */}
      {showExploreMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-start pt-16 px-4">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl border p-4 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Explore Menu</span>
              <button onClick={() => setShowExploreMenu(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 text-xs font-medium">
              <a href="#" onClick={() => setShowExploreMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition">Home</a>
              <a href="#about" onClick={() => setShowExploreMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition">About</a>
              <a href="#committee" onClick={() => setShowExploreMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition">Club & Team</a>
              <a href="#activities" onClick={() => setShowExploreMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition">Events</a>
              <a href="#contact" onClick={() => setShowExploreMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition">Contact</a>
              <Link to="/news" onClick={() => setShowExploreMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition">Newsfeed</Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* HERO BANNER SECTION */}
      <section className={`scroll-reveal relative overflow-hidden ${darkMode ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-slate-800' : 'bg-gradient-to-b from-white via-slate-50/50 to-white border-slate-200/80'} border-b pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 text-center`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0,transparent_70%)] pointer-events-none"></div>
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e110_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e110_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <div className={`inline-flex items-center gap-2 px-4.5 py-2 rounded-full ${darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200/80 text-purple-700'} text-xs font-medium uppercase tracking-widest shadow-sm backdrop-blur-md`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin shrink-0" /> Brahmaputra International University Sports Club
          </div>
          
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-medium ${darkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tight leading-[1.15] px-2`}>
            {content.clubTitle || 'BRIU Sports Club'}
          </h1>
          
          <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm sm:text-lg lg:text-xl font-normal max-w-2xl mx-auto leading-relaxed px-4`}>
            Unleashing athletic excellence, fostering discipline, and building the future champions of Brahmaputra International University.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link to="/news" className="w-full sm:w-auto px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-medium text-sm shadow-lg shadow-purple-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Explore Newsfeed <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/founders" className={`w-full sm:w-auto px-7 py-3.5 ${darkMode ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-800' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90'} rounded-2xl font-medium text-sm border transition-all hover:scale-105 active:scale-95 shadow-sm backdrop-blur-md flex items-center justify-center`}>
              Founders Panel
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
        
        {/* ABOUT & OBJECTIVES SECTION */}
        <section id="about" className={`scroll-reveal rounded-3xl relative overflow-hidden border ${darkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white/70 border-slate-200/80'} shadow-sm backdrop-blur-xl`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className={`px-6 sm:px-10 py-5 sm:py-6 font-medium text-lg sm:text-xl flex items-center justify-between border-b ${darkMode ? 'border-slate-800/80 text-white' : 'border-slate-100 text-slate-900'}`}>
            <span className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-2xl border shadow-inner shrink-0 ${darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" /> 
              </div>
              <span className="truncate">Core Mission & Objectives</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3.5 py-1.5 rounded-full border border-purple-500/20 font-medium shrink-0">
              Overview
            </span>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 space-y-8 sm:space-y-10">
            <div>
              <h3 className={`text-base sm:text-lg lg:text-xl font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-3 sm:mb-4 flex items-center gap-3`}>
                <div className={`p-2 ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} rounded-xl border shrink-0`}>
                  <Target className="w-4 h-4 text-purple-600" />
                </div> 
                Our Objective:
              </h3>
              <p className={`${darkMode ? 'text-slate-300 bg-slate-950/40 border-slate-800/60' : 'text-slate-700 bg-slate-50/80 border-slate-200/85'} leading-relaxed text-sm sm:text-base lg:text-lg font-normal p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-sm`}>
                {content.objective || 'Promoting sports and physical fitness among students.'}
              </p>
            </div>

            <div id="activities">
              <h3 className={`text-base sm:text-lg lg:text-xl font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-4 flex items-center gap-3`}>
                <div className={`p-2 ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} rounded-xl border shrink-0`}>
                  <Activity className="w-4 h-4 text-purple-600" />
                </div> 
                Major Activities:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {content.activities && content.activities.length > 0 ? (
                  content.activities.map((act, idx) => (
                    <div key={idx} className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl ${darkMode ? 'bg-slate-950/40 border-slate-800/60 hover:border-purple-500/40 text-slate-200' : 'bg-slate-50/80 border-slate-200/85 hover:border-purple-500/40 text-slate-800'} font-normal text-xs sm:text-sm shadow-sm transition-all group`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0 shadow-sm shadow-purple-600/40 group-hover:scale-125 transition-transform"></span>
                      <span className="break-words">{act}</span>
                    </div>
                  ))
                ) : (
                  <div className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl ${darkMode ? 'bg-slate-950/40 border-slate-800/60 text-slate-200' : 'bg-slate-50/80 border-slate-200/85 text-slate-800'} font-normal text-xs sm:text-sm shadow-sm`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0 shadow-sm shadow-purple-600/40"></span>
                    <span>Annual Sports Tournament</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* COMMITTEE SECTION */}
        <section id="committee" className={`scroll-reveal rounded-3xl p-6 sm:p-12 lg:p-16 text-center relative overflow-hidden border ${darkMode ? 'bg-slate-900/20 border-slate-800/50' : 'bg-white/60 border-slate-200/80'} shadow-sm backdrop-blur-xl`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="mb-12 sm:mb-16 space-y-2 sm:space-y-3 relative z-10 px-2">
            <span className="inline-block text-[11px] sm:text-xs uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full border border-amber-500/20 font-medium shadow-sm">
              Congratulations
            </span>
            <h2 className={`text-2xl sm:text-4xl font-serif font-medium ${darkMode ? 'text-slate-100' : 'text-black'} tracking-tight`}>
              {content.committeeHeader || 'Executive Committee 2026'}
            </h2>
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
              <h4 className={`text-lg sm:text-2xl font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mt-5 tracking-wide`}>{content.convener.name}</h4>
              <p className="text-sm sm:text-base font-normal text-purple-600 mt-1">{content.convener.role}</p>
              <p className={`text-xs sm:text-sm font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{content.convener.dept}</p>
            </div>
          )}

          <div className="space-y-6 sm:space-y-10 relative z-10">
            {firstRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                {firstRow.map((member, idx) => {
                  const isVicePresident = member.role && member.role.toLowerCase().includes('vice president');
                  
                  return (
                    <div 
                      key={idx} 
                      className={`scroll-card flex flex-col items-center p-6 sm:p-8 rounded-3xl ${darkMode ? 'hover:bg-slate-900/60 border-slate-800/80 bg-slate-900/30' : 'hover:bg-white border-slate-200/85 bg-white/70'} transition-all duration-300 border shadow-sm group hover:-translate-y-1.5 ${idx === 1 ? `sm:-translate-y-4 ring-4 ring-purple-500/10 shadow-xl ${darkMode ? 'border-purple-500/40 bg-slate-900/60' : 'border-purple-500/40 bg-white'}` : ''} ${isVicePresident ? 'order-first sm:order-none' : ''}`}
                    >
                      <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/30 shadow-sm">
                        <img 
                          src={member.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                          alt={member.name} 
                          className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 ${darkMode ? 'border-slate-950' : 'border-white'} shadow-md group-hover:scale-105 transition duration-300`}
                        />
                      </div>
                      <h5 className={`text-sm sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mt-4 leading-snug`}>{member.name}</h5>
                      <p className="text-xs sm:text-sm font-normal text-purple-600 mt-1">{member.role}</p>
                      <p className={`text-[11px] sm:text-xs font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{member.dept}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {secondRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {secondRow.map((member, idx) => {
                  const isVicePresident = member.role && member.role.toLowerCase().includes('vice president');
                  return (
                    <div key={idx} className={`scroll-card flex flex-col items-center p-6 sm:p-8 rounded-3xl ${darkMode ? 'hover:bg-slate-900/60 border-slate-800/80 bg-slate-900/30' : 'hover:bg-white border-slate-200/85 bg-white/70'} transition-all duration-300 border shadow-sm group hover:-translate-y-1.5 ${isVicePresident ? 'order-first sm:order-none' : ''}`}>
                      <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/30 shadow-sm">
                        <img 
                          src={member.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                          alt={member.name} 
                          className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 ${darkMode ? 'border-slate-950' : 'border-white'} shadow-md group-hover:scale-105 transition duration-300`}
                        />
                      </div>
                      <h5 className={`text-sm sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mt-4 leading-snug`}>{member.name}</h5>
                      <p className="text-xs sm:text-sm font-normal text-purple-600 mt-1">{member.role}</p>
                      <p className={`text-[11px] sm:text-xs font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{member.dept}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {thirdRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {thirdRow.map((member, idx) => {
                  const isVicePresident = member.role && member.role.toLowerCase().includes('vice president');
                  return (
                    <div key={idx} className={`scroll-card flex flex-col items-center p-6 sm:p-8 rounded-3xl ${darkMode ? 'hover:bg-slate-900/60 border-slate-800/80 bg-slate-900/30' : 'hover:bg-white border-slate-200/85 bg-white/70'} transition-all duration-300 border shadow-sm group hover:-translate-y-1.5 ${isVicePresident ? 'order-first sm:order-none' : ''}`}>
                      <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/30 shadow-sm">
                        <img 
                          src={member.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                          alt={member.name} 
                          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 ${darkMode ? 'border-slate-950' : 'border-white'} shadow-md group-hover:scale-105 transition duration-300`}
                        />
                      </div>
                      <h5 className={`text-sm sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mt-4 leading-snug`}>{member.name}</h5>
                      <p className="text-xs sm:text-sm font-normal text-purple-600 mt-1">{member.role}</p>
                      <p className={`text-[11px] sm:text-xs font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{member.dept}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING EVENT BANNER SECTION */}
        {content.upcomingEvent && (content.upcomingEvent.title || content.upcomingEvent.bannerUrl) && (
          <section className={`scroll-reveal rounded-3xl border shadow-sm overflow-hidden relative ${darkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white/70 border-slate-200/85'} p-6 sm:p-10 backdrop-blur-xl`}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 relative z-10">
              {content.upcomingEvent.bannerUrl && (
                <div className="w-full lg:w-1/2 overflow-hidden rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-800">
                  <img 
                    src={content.upcomingEvent.bannerUrl} 
                    alt="Upcoming Event Banner" 
                    className="scroll-image w-full h-auto max-h-[350px] object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              )}

              <div className={`w-full ${content.upcomingEvent.bannerUrl ? 'lg:w-1/2' : 'lg:w-full'} space-y-4 text-left`}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-normal text-[11px] uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" /> Upcoming Event
                </div>

                <h3 className={`text-xl sm:text-2xl font-medium ${darkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                  {content.upcomingEvent.title || 'Exciting Event Coming Up!'}
                </h3>

                <p className={`text-xs sm:text-sm font-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                  {content.upcomingEvent.description || 'Stay tuned for more details regarding our upcoming sports event and activities.'}
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-xs font-normal text-slate-500">
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

                <div className="pt-2">
                  <button 
                    onClick={() => setShowEventModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-normal text-xs shadow-md shadow-purple-600/20 transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* DEPARTMENTS SECTION */}
        <div className={`scroll-reveal rounded-3xl overflow-x-hidden`}>
          <div>
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
                <h3 className="text-lg sm:text-xl font-medium uppercase tracking-wide">Event Full Details</h3>
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
                <h4 className="text-xl sm:text-2xl font-medium tracking-tight">{content.upcomingEvent.title}</h4>
                <p className="text-sm font-normal leading-relaxed opacity-90">{content.upcomingEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {content.upcomingEvent.date && (
                  <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
                    <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-normal text-slate-400">Date</p>
                      <p className="text-xs font-medium">{content.upcomingEvent.date}</p>
                    </div>
                  </div>
                )}
                {content.upcomingEvent.location && (
                  <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-normal text-slate-400">Location</p>
                      <p className="text-xs font-medium">{content.upcomingEvent.location}</p>
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
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-amber-400 tracking-wide uppercase">
              {content.contact?.companyName || content.clubTitle || "Club Info"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {content.contact?.shortDescription || content.objective || "Empowering members through sports and physical fitness."}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Phone size={15} /> Contact Us
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-normal">
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

          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <h3 className="text-xs font-medium text-amber-400 uppercase tracking-widest">Follow Us</h3>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {content.contact?.socialLinks && content.contact.socialLinks.length > 0 ? (
                content.contact.socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-normal hover:bg-amber-500 hover:text-slate-950 transition shadow-md flex items-center justify-center border border-slate-700"
                  >
                    {social.platform}
                  </a>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-normal">No social links added yet.</span>
              )}
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500 px-2 font-normal">
          {content.contact?.copyright || `© ${new Date().getFullYear()} ${content.clubTitle || "Club"}. All rights reserved.`}
        </div>
      </div>

      {/* FLASH NEWS TICKER */}
      {content.flashNews && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-xl text-white text-xs sm:text-sm py-3 px-4 sm:px-8 flex items-center gap-4 z-50 border-t border-slate-800 shadow-[0_-15px_40px_rgba(0,0,0,0.15)]">
          <span className="bg-purple-500 text-slate-950 font-medium px-3 py-1 rounded-xl text-[10px] uppercase tracking-widest shrink-0 z-10 shadow-md shadow-purple-500/30 animate-pulse flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" /> Live News
          </span>
          <div className="w-full overflow-hidden whitespace-nowrap relative">
            <div className="inline-block animate-marquee font-normal text-purple-400 tracking-wide text-xs sm:text-sm">
              {content.flashNews}
            </div>
          </div>
        </div>
      )}

      <style>{`
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        @supports (animation-timeline: view()) {
          .scroll-reveal {
            animation: sectionReveal linear both;
            animation-timeline: view();
            animation-range: entry 0% cover 30%;
            will-change: transform, opacity, filter;
          }

          .scroll-card {
            animation: cardReveal linear both;
            animation-timeline: view();
            animation-range: entry 0% cover 25%;
            will-change: transform, opacity;
          }

          .scroll-image {
            animation: imageReveal linear both;
            animation-timeline: view();
            animation-range: entry 0% cover 38%;
            will-change: transform;
          }

          @keyframes sectionReveal {
            from {
              opacity: 0;
              transform: translate3d(0, 54px, 0) scale(.985);
              filter: blur(7px);
            }
            55% {
              opacity: .9;
              transform: translate3d(0, 10px, 0) scale(.995);
              filter: blur(1.5px);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes cardReveal {
            from {
              opacity: 0;
              transform: translate3d(0, 34px, 0) scale(.97);
            }
            60% {
              opacity: .92;
              transform: translate3d(0, 6px, 0) scale(.995);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes imageReveal {
            from { transform: scale(1.08); }
            to { transform: scale(1); }
          }
        }

        img { max-width: 100%; }
        p, span, h1, h2, h3, h4, h5, h6 { overflow-wrap: anywhere; }
        main { width: 100%; min-width: 0; }
        header { max-width: 100vw; }

        .custom-scrollbar {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 640px) {
          html { scroll-padding-top: 4.5rem; }

          main {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .fixed.inset-0.z-50 > div {
            max-width: calc(100vw - 1.25rem);
            max-height: min(90dvh, 760px);
          }

          @supports (animation-timeline: view()) {
            .scroll-reveal {
              animation-range: entry 0% cover 24%;
            }

            .scroll-card {
              animation-range: entry 0% cover 21%;
            }

            @keyframes sectionReveal {
              from {
                opacity: 0;
                transform: translate3d(0, 30px, 0) scale(.99);
                filter: blur(4px);
              }
              60% {
                opacity: .92;
                transform: translate3d(0, 5px, 0) scale(.998);
                filter: blur(1px);
              }
              to {
                opacity: 1;
                transform: translate3d(0, 0, 0) scale(1);
                filter: blur(0);
              }
            }

            @keyframes cardReveal {
              from {
                opacity: 0;
                transform: translate3d(0, 20px, 0) scale(.985);
              }
              to {
                opacity: 1;
                transform: translate3d(0, 0, 0) scale(1);
              }
            }
          }
        }

        @media (max-width: 374px) {
          main {
            padding-left: .75rem;
            padding-right: .75rem;
          }

          header > div {
            padding-left: .65rem !important;
            padding-right: .65rem !important;
            gap: .4rem !important;
          }

          header .flex.items-center.gap-2 {
            gap: .25rem !important;
          }

          header .flex.items-center.gap-1\\.5 {
            gap: .25rem !important;
          }

          header button,
          header a {
            flex-shrink: 1;
          }
        }

        @media (max-height: 560px) and (max-width: 900px) {
          .fixed.inset-0.z-50 > div {
            max-height: 84dvh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }

          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }

          .scroll-reveal,
          .scroll-card,
          .scroll-image {
            animation: none !important;
            transform: none !important;
            filter: none !important;
            opacity: 1 !important;
          }
        }

        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
          will-change: transform;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
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