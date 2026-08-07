import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Mail, ArrowRight, X, Users, Sparkles, Search } from 'lucide-react';

const MemberList = ({ darkMode, setDarkMode, user, handleLogout }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get('/api/members/list');
        setMembers(res.data.data);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search only
  const filteredMembers = members.filter(member => {
    return (
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.batch?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen ${darkMode ? 'bg-slate-950 text-indigo-500' : 'bg-slate-50 text-indigo-600'} font-serif`}>
        <div className={`relative flex items-center justify-center p-6 ${darkMode ? 'bg-slate-900/80 border-indigo-500/20' : 'bg-white/80 border-indigo-500/20'} rounded-2xl border shadow-xl backdrop-blur-xl`}>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className={`text-xs font-semibold tracking-widest uppercase mt-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'} animate-pulse`}>Loading Official Member Directory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-slate-100/50 to-indigo-50/30 text-slate-900'} font-serif selection:bg-indigo-600 selection:text-white pb-20`}>
      
      {/* গ্লোবাল নেভবার হেডার */}
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        user={user} 
        handleLogout={handleLogout} 
      />

      {/* World-Class Executive Header Banner */}
      <div className={`relative overflow-hidden border-b ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200/80 bg-white/70'} backdrop-blur-xl pt-28 pb-16 px-4 sm:px-8 shadow-sm`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.04),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-4 relative z-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${darkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border border-indigo-100 text-indigo-700'} text-xs font-semibold tracking-wide shadow-sm`}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> BRIU Sports Club
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3 drop-shadow-sm">
            <Users className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} /> Meet Our Members
          </h1>
          
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} max-w-2xl leading-relaxed font-sans`}>
            Discover and connect with the elite members, brilliant minds, and active student leaders driving excellence across departments.
          </p>

          {/* Search Bar Container */}
          <div className="w-full max-w-md mt-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, department, or batch..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:ring-indigo-600'} border rounded-xl px-4 py-3 pl-10 text-xs focus:outline-none focus:ring-1 transition-all font-sans shadow-sm backdrop-blur-md`}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-10">
        
        {filteredMembers.length === 0 ? (
          <div className={`${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-12 text-center space-y-3 backdrop-blur-md shadow-lg`}>
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>No Members Found</h3>
            <p className="text-xs text-slate-500 font-sans">Try modifying your search criteria to find what you are looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredMembers.map(member => (
              <div 
                key={member._id} 
                className={`${darkMode ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-slate-200/90 hover:border-indigo-400'} border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group`}
              >
                {/* মেম্বার ছবি */}
                <div className={`w-full h-48 sm:h-56 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} overflow-hidden relative`}>
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[10px] text-white font-sans bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                      Verified Member
                    </span>
                  </div>
                </div>

                {/* ইনফো সেকশন - ওয়ার্ল্ড ক্লাস ক্লিন হোয়াইট/ডার্ক ডিজাইন */}
                <div className={`p-4 flex-1 flex flex-col justify-between ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                  <div>
                    <h3 className={`font-bold text-xs sm:text-sm tracking-wide leading-snug truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
                      {member.name}
                    </h3>
                    <p className={`text-[10px] font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mt-0.5 truncate uppercase font-sans`}>
                      {member.department || 'General Department'}
                    </p>
                    <p className={`text-[9px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5 font-sans`}>
                      Batch: {member.batch || 'N/A'} | Sem: {member.semester || 'N/A'}
                    </p>
                  </div>

                  {/* ফুটার অংশ */}
                  <div className={`flex items-center justify-between pt-3 mt-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} font-sans`}>
                    <div className="flex items-center text-slate-400 hover:text-indigo-600 transition-colors">
                      <Mail className="w-3.5 h-3.5 cursor-pointer" />
                    </div>
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className={`flex items-center gap-1 text-[11px] font-bold ${darkMode ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'} px-2.5 py-1 rounded-lg border transition-all cursor-pointer`}
                    >
                      Profile <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* পপ-আপ মোডাল */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 border`}>
              
              <button 
                onClick={() => setSelectedMember(null)}
                className={`absolute top-3 right-3 ${darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} p-1.5 rounded-full transition-all z-10 cursor-pointer shadow-sm`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={selectedMember.image} className="w-full h-full object-cover object-center" alt={selectedMember.name} />
              </div>

              <div className="p-6 text-center font-serif">
                <h2 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedMember.name}</h2>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase mt-0.5 font-sans">{selectedMember.department}</p>
                
                <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'} grid grid-cols-2 gap-2 text-left text-xs p-3.5 rounded-2xl font-sans`}>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Batch</span>
                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} text-xs`}>{selectedMember.batch || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Semester</span>
                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} text-xs`}>{selectedMember.semester || 'N/A'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMember(null)}
                  className="mt-5 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 cursor-pointer font-sans"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberList;