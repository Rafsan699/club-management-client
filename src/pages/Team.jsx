import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/api/team')
      .then(res => {
        setMembers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching team:", err);
        setError("Failed to load team members.");
        setLoading(false);
      });
  }, []);

  // Categorize members efficiently
  const convener = members.find(m => m.category?.toLowerCase() === 'convener' || m.role?.toLowerCase().includes('convener'));
  const executives = members.filter(m => m.category?.toLowerCase() === 'executive' || m.role?.toLowerCase().includes('executive'));
  const generalMembers = members.filter(m => m.category?.toLowerCase() === 'general' || m.role?.toLowerCase().includes('general'));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold animate-pulse">Loading Team Members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans relative antialiased selection:bg-blue-600 selection:text-white ${
      darkMode 
        ? 'bg-[#090d16] text-slate-100' 
        : 'bg-[#f8fafc] text-slate-900'
    }`}
    style={{
      backgroundImage: darkMode 
        ? 'radial-gradient(rgba(30, 58, 138, 0.12) 1px, transparent 1px)' 
        : 'radial-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>

      <div className="w-full px-5 sm:px-8 lg:px-16 py-12 sm:py-16 space-y-24 sm:space-y-32 max-w-[1440px] mx-auto">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className={`text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm inline-block transition-colors duration-300 ${
            darkMode ? 'bg-blue-950/40 border-blue-800/60 text-blue-400 shadow-blue-950/20' : 'bg-blue-50/80 border-blue-200 text-blue-700 shadow-blue-100/50'
          }`}>
            University Leadership
          </span>
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Meet Our Team
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-normal text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            The dedicated academic and student leaders driving excellence at BRIU Sports Club.
          </p>
        </div>

        {/* ================= 1. CONVENER SECTION ================= */}
        {convener && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className={`text-xs sm:text-sm font-bold tracking-[0.25em] uppercase inline-block border-b pb-2 ${
                darkMode ? 'text-blue-400 border-blue-500/30' : 'text-blue-900 border-blue-600/20'
              }`}>
                BRIU Sports Club Convener
              </h2>
            </div>
            <div className="flex justify-center">
              <div 
                onClick={() => setSelectedMember(convener)}
                className={`w-full max-w-[320px] rounded-[2rem] overflow-hidden shadow-xl cursor-pointer transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl border backdrop-blur-xl group relative ${
                  darkMode 
                    ? 'bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-900/90 border-blue-500/30 shadow-blue-950/50 hover:border-blue-500/60' 
                    : 'bg-gradient-to-b from-white via-blue-50/30 to-white border-slate-200/90 shadow-slate-200/60 hover:border-blue-300'
                }`}
              >
                <div className="h-64 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                  <img src={convener.img} alt={convener.name} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-50 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{convener.name}</h3>
                    <p className={`font-semibold text-xs uppercase tracking-wider mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{convener.role}</p>
                  </div>
                  <div className={`pt-4 flex justify-between items-center border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border truncate max-w-[170px] ${
                      darkMode ? 'bg-blue-950/60 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200/80 text-blue-700'
                    }`}>
                      {convener.dept}
                    </span>
                    <span className={`text-xs font-bold tracking-wide flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300 ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Profile <span className="text-[10px]">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. EXECUTIVE COMMITTEE ================= */}
        {executives.length > 0 && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className={`text-xs sm:text-sm font-bold tracking-[0.25em] uppercase inline-block border-b pb-2 ${
                darkMode ? 'text-blue-400 border-blue-500/30' : 'text-blue-900 border-blue-600/20'
              }`}>
                Executive Committees
              </h2>
            </div>

            {/* First Row: 3 Members */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-end">
              {executives.slice(0, 3).map((member, idx) => (
                <div 
                  key={member._id}
                  onClick={() => setSelectedMember(member)}
                  className={`w-full max-w-[320px] mx-auto rounded-[2rem] overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl border backdrop-blur-xl group relative ${
                    idx === 1 ? 'md:-translate-y-4 lg:-translate-y-6' : ''
                  } ${
                    darkMode 
                      ? 'bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-900/90 border-blue-500/30 shadow-blue-950/50 hover:border-blue-500/60' 
                      : 'bg-gradient-to-b from-white via-blue-50/30 to-white border-slate-200/90 shadow-slate-200/60 hover:border-blue-300'
                  }`}
                >
                  <div className="h-60 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-50 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</h3>
                      <p className={`font-semibold text-xs uppercase tracking-wider mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{member.role}</p>
                    </div>
                    <div className={`pt-4 flex justify-between items-center border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border truncate max-w-[170px] ${
                        darkMode ? 'bg-blue-950/60 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200/80 text-blue-700'
                      }`}>
                        {member.dept}
                      </span>
                      <span className={`text-xs font-bold tracking-wide flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        Profile <span className="text-[10px]">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subsequent Rows: 4 Members per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {executives.slice(3).map(member => (
                <div 
                  key={member._id}
                  onClick={() => setSelectedMember(member)}
                  className={`w-full max-w-[320px] mx-auto rounded-[2rem] overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border backdrop-blur-xl group relative ${
                    darkMode 
                      ? 'bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-900/90 border-blue-500/30 shadow-blue-950/40 hover:border-blue-500/60' 
                      : 'bg-gradient-to-b from-white via-blue-50/30 to-white border-slate-200/90 shadow-slate-200/50 hover:border-blue-300'
                  }`}
                >
                  <div className="h-56 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-50 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="p-5 space-y-3.5">
                    <div>
                      <h3 className={`text-base font-bold tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</h3>
                      <p className={`font-semibold text-[11px] uppercase tracking-wider truncate mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{member.role}</p>
                    </div>
                    <div className={`pt-3.5 flex justify-between items-center border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border truncate max-w-[130px] ${
                        darkMode ? 'bg-blue-950/60 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200/80 text-blue-700'
                      }`}>
                        {member.dept}
                      </span>
                      <span className={`text-[11px] font-bold tracking-wide group-hover:translate-x-1 transition-transform duration-300 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        Profile <span className="text-[10px]">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3. GENERAL MEMBERS ================= */}
        {generalMembers.length > 0 && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className={`text-xs sm:text-sm font-bold tracking-[0.25em] uppercase inline-block border-b pb-2 ${
                darkMode ? 'text-blue-400 border-blue-500/30' : 'text-blue-900 border-blue-600/20'
              }`}>
                Wing Leaders 
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {generalMembers.map(member => (
                <div 
                  key={member._id}
                  onClick={() => setSelectedMember(member)}
                  className={`w-full max-w-[320px] mx-auto rounded-[2rem] overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border backdrop-blur-xl group relative ${
                    darkMode 
                      ? 'bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-900/90 border-blue-500/30 shadow-blue-950/40 hover:border-blue-500/60' 
                      : 'bg-gradient-to-b from-white via-blue-50/30 to-white border-slate-200/90 shadow-slate-200/50 hover:border-blue-300'
                  }`}
                >
                  <div className="h-56 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-50 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="p-5 space-y-3.5">
                    <div>
                      <h3 className={`text-base font-bold tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</h3>
                      <p className={`font-semibold text-[11px] uppercase tracking-wider truncate mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{member.role}</p>
                    </div>
                    <div className={`pt-3.5 flex justify-between items-center border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border truncate max-w-[130px] ${
                        darkMode ? 'bg-blue-950/60 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200/80 text-blue-700'
                      }`}>
                        {member.dept}
                      </span>
                      <span className={`text-[11px] font-bold tracking-wide group-hover:translate-x-1 transition-transform duration-300 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        Profile <span className="text-[10px]">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= CONTACT INFO FOOTER ================= */}
      <footer className={`w-full border-t mt-28 py-12 px-6 backdrop-blur-xl ${
        darkMode ? 'bg-[#0b101b]/95 border-slate-800 text-slate-300' : 'bg-white/90 border-slate-200/80 text-slate-700 shadow-sm'
      }`}>
        <div className="max-w-[1440px] mx-auto text-center space-y-3">
          <h3 className={`text-xs font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>
            Contact Information
          </h3>
          <p className="text-sm font-medium">
            Email: <a href="mailto:briu.sportsclub@gmail.com" className={`underline underline-offset-4 font-semibold transition-colors duration-200 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-900'}`}>briu.sportsclub@gmail.com</a>
          </p>
        </div>
      </footer>

      {/* ================= PROFILE MODAL ================= */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200">
          <div className={`border rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full relative space-y-6 shadow-2xl backdrop-blur-2xl transform transition-all scale-100 ${
            darkMode ? 'bg-[#111827]/95 border-slate-800/80 text-white shadow-black/60' : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl shadow-slate-900/10'
          }`}>
            <button 
              onClick={() => setSelectedMember(null)}
              className={`absolute top-5 right-5 font-bold text-xs w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title="Close"
            >
              ✕
            </button>

            <div className="text-center space-y-3 pt-2">
              <div className="relative inline-block">
                <img 
                  src={selectedMember.img} 
                  alt={selectedMember.name} 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover mx-auto border-4 border-blue-500/30 shadow-xl" 
                />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">{selectedMember.name}</h3>
                <p className={`font-bold text-xs uppercase tracking-wider mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {selectedMember.role}
                </p>
              </div>
            </div>

            <div className={`border rounded-2xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm font-medium ${
              darkMode ? 'bg-[#090d16]/70 border-slate-800/80 text-slate-300' : 'bg-slate-50/80 border-slate-200/80 text-slate-700'
            }`}>
              <div className="flex justify-between items-center border-b pb-2.5 border-slate-500/15">
                <span className="text-slate-400 font-normal">Category</span>
                <span className="uppercase font-bold tracking-wider text-[11px]">{selectedMember.category}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2.5 border-slate-500/15">
                <span className="text-slate-400 font-normal">Department</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{selectedMember.dept}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2.5 border-slate-500/15">
                <span className="text-slate-400 font-normal">Email</span>
                <span className={`font-semibold truncate max-w-[200px] ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{selectedMember.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-normal">Phone</span>
                <span className="font-semibold">{selectedMember.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Team;