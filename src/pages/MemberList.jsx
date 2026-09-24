import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Mail, ArrowRight, X, Users, Search, ShieldCheck, LayoutGrid } from 'lucide-react';

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

  // Derived scoreboard stats — purely presentational, no change to filtering logic
  const departmentCount = new Set(members.map(m => m.department).filter(Boolean)).size;
  const batchCount = new Set(members.map(m => m.batch).filter(Boolean)).size;

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen ${darkMode ? 'bg-[#0B1120] text-amber-500' : 'bg-slate-50 text-amber-600'} font-sans`}>
        <div className={`relative flex flex-col items-center gap-4 px-10 py-8 ${darkMode ? 'bg-[#111a2e] border-white/10' : 'bg-white border-slate-200'} rounded-sm border shadow-2xl`}>
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className={`text-[11px] font-semibold tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>LOADING MEMBER ROSTER</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-amber-500 selection:text-slate-900 pb-24`}>

      {/* গ্লোবাল নেভবার হেডার */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Scoreboard-style Hero */}
      <div className={`relative overflow-hidden ${darkMode ? 'bg-[#0B1120]' : 'bg-[#0F1B33]'} pt-28 pb-14 px-4 sm:px-8`}>
        {/* subtle diagonal pitch-stripe texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(115deg, #fff 0px, #fff 2px, transparent 2px, transparent 64px)',
          }}
        ></div>
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-amber-500">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400/90">BRIU SPORTS CLUB</span>
            </div>

            <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              Member Roster
            </h1>
            <div className="mt-4 w-14 h-[3px] bg-amber-500 rounded-full"></div>

            <p className="mt-5 text-sm text-slate-400 max-w-xl leading-relaxed">
              Every athlete, organizer and department captain who makes up the club — searchable by name, department or batch.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-md mt-8 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, department, or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 focus:bg-white/[0.09] transition-colors"
              />
            </div>

            {/* Scoreboard stats strip */}
            <div className="mt-8 flex items-stretch gap-8 sm:gap-14">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{members.length}</div>
                <div className="text-[10px] tracking-widest text-slate-500 mt-1">MEMBERS</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{departmentCount}</div>
                <div className="text-[10px] tracking-widest text-slate-500 mt-1">DEPARTMENTS</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{batchCount}</div>
                <div className="text-[10px] tracking-widest text-slate-500 mt-1">BATCHES</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-12">

        <div className="flex items-center justify-between mb-5">
          <div className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
            {filteredMembers.length} {filteredMembers.length === 1 ? 'result' : 'results'}
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className={`${darkMode ? 'bg-[#111a2e] border-white/10' : 'bg-white border-slate-200'} border rounded-sm p-14 text-center space-y-3`}>
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>No members match that search</h3>
            <p className="text-xs text-slate-500">Try a different name, department, or batch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredMembers.map(member => (
              <div
                key={member._id}
                className={`${darkMode ? 'bg-[#111a2e] border-white/10 hover:border-amber-500/40' : 'bg-white border-slate-200 hover:border-amber-400/60'} border rounded-sm overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col group`}
              >
                {/* মেম্বার ছবি */}
                <div className={`w-full h-44 sm:h-52 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} overflow-hidden relative`}>
                  {member.img ? (
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                  )}
                  {/* jersey-style batch badge */}
                  <div className={`absolute top-2.5 left-2.5 ${darkMode ? 'bg-slate-950/80' : 'bg-white/90'} backdrop-blur-sm border ${darkMode ? 'border-white/10' : 'border-slate-200'} text-[10px] font-bold px-2 py-0.5 rounded-sm ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                    {member.batch || 'N/A'}
                  </div>
                </div>

                {/* ইনফো সেকশন */}
                <div className={`p-4 flex-1 flex flex-col justify-between ${darkMode ? 'bg-[#111a2e]' : 'bg-white'}`}>
                  <div>
                    <h3 className={`font-bold text-sm leading-snug truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {member.name}
                    </h3>
                    <p className={`text-[11px] font-medium ${darkMode ? 'text-amber-400' : 'text-amber-700'} mt-1 truncate`}>
                      {member.department || 'General Department'}
                    </p>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                      Semester {member.semester || 'N/A'}
                    </p>
                  </div>

                  {/* ফুটার অংশ */}
                  <div className={`flex items-center justify-between pt-3 mt-3 border-t ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className={`flex items-center ${darkMode ? 'text-slate-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-700'} transition-colors`}>
                      <Mail className="w-3.5 h-3.5 cursor-pointer" />
                    </div>
                    <button
                      onClick={() => setSelectedMember(member)}
                      className={`flex items-center gap-1 text-[11px] font-semibold ${darkMode ? 'text-slate-200 hover:text-amber-400' : 'text-slate-700 hover:text-amber-700'} transition-colors cursor-pointer`}
                    >
                      View profile <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* পপ-আপ মোডাল */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className={`${darkMode ? 'bg-[#111a2e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} w-full max-w-sm rounded-sm shadow-2xl overflow-hidden relative border`}>

              <button
                onClick={() => setSelectedMember(null)}
                className={`absolute top-3 right-3 ${darkMode ? 'bg-slate-950/70 text-slate-200 hover:bg-slate-800' : 'bg-white/90 text-slate-700 hover:bg-slate-100'} p-1.5 rounded-full transition-all z-10 cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-60 w-full overflow-hidden bg-slate-100 relative">
                <img src={selectedMember.img} className="w-full h-full object-cover object-center" alt={selectedMember.name} />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              <div className="p-6 text-center">
                <h2 className="text-lg font-extrabold">{selectedMember.name}</h2>
                <p className={`text-[11px] font-semibold uppercase tracking-wide mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>{selectedMember.department}</p>

                <div className={`mt-5 border-t ${darkMode ? 'border-white/10' : 'border-slate-100'} grid grid-cols-2 text-left text-xs pt-4`}>
                  <div className="pr-3">
                    <span className="text-slate-500 block text-[10px] font-semibold mb-0.5">Batch</span>
                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} text-sm`}>{selectedMember.batch || 'N/A'}</span>
                  </div>
                  <div className={`pl-3 border-l ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                    <span className="text-slate-500 block text-[10px] font-semibold mb-0.5">Semester</span>
                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} text-sm`}>{selectedMember.semester || 'N/A'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="mt-6 w-full bg-amber-500 text-slate-950 py-2.5 rounded-sm font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Close profile
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