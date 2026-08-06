import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Mail, ArrowRight, X, Sun, Moon, ArrowLeft } from 'lucide-react';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get('/api/members/list');
        setMembers(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching members:', err);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return <div className="text-center py-20 font-bold text-purple-600">Loading Members...</div>;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'} py-8 px-3 sm:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto">
        
        {/* স্টিকি হেডার: ব্যাকগ্রাউন্ড কালার ছাড়া শুধুমাত্র ব্লার ইফেক্ট */}
        <div className="sticky top-0 z-40 py-4 mb-6 backdrop-blur-md bg-transparent transition-colors duration-300">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Meet Our Members
              </h2>
              <div className="w-10 h-1 bg-purple-600 mx-auto mt-1 rounded-full"></div>
            </div>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>
          </div>
        </div>

        {/* কার্ড গ্রিড */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {members.map(member => (
            <div 
              key={member._id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* মেম্বার ছবি */}
              <div className="w-full h-48 sm:h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-center" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
              </div>

              {/* ইনফো সেকশন */}
              <div className="p-3.5 flex-1 flex flex-col justify-between bg-purple-900 dark:bg-purple-950 text-white">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm tracking-wide leading-snug truncate text-purple-100">
                    {member.name}
                  </h3>
                  <p className="text-[10px] font-semibold text-purple-300 mt-0.5 truncate uppercase">
                    {member.department}
                  </p>
                  <p className="text-[9px] font-medium text-purple-300/80 mt-0.5">
                    Batch: {member.batch} | Sem: {member.semester}
                  </p>
                </div>

                {/* ফুটার অংশ */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-purple-800">
                  <div className="flex items-center text-purple-300">
                    <Mail className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
                  </div>
                  <button 
                    onClick={() => setSelectedMember(member)}
                    className="flex items-center gap-0.5 text-[10px] font-bold text-purple-200 hover:text-white transition-colors"
                  >
                    Profile <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* পপ-আপ মোডাল */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
              
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-3 right-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={selectedMember.image} className="w-full h-full object-cover object-center" alt={selectedMember.name} />
              </div>

              <div className="p-5 text-center">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedMember.name}</h2>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold uppercase mt-0.5">{selectedMember.department}</p>
                
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Batch</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{selectedMember.batch}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Semester</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{selectedMember.semester}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMember(null)}
                  className="mt-5 w-full bg-purple-600 text-white py-2 rounded-xl font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-200 dark:shadow-none"
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