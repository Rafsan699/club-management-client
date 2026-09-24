import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Trophy, Calendar } from 'lucide-react';

const PreviousCommitteesList = ({ darkMode, setDarkMode, user, handleLogout }) => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  // স্ক্রল করে হেডার হাইড বা শো করার জন্য স্টেট
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const res = await API.get('/api/previous-committee/list');
        setCommittees(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommittees();
  }, []);

  // স্ক্রল ইভেন্ট হ্যান্ডলার (ডাউন করলে হাইড, আপ করলে শো)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // নিচের দিকে স্ক্রল করলে নেভবার হাইড হবে
        setShowNavbar(false);
      } else {
        // ওপরের দিকে স্ক্রল করলে নেভবার শো করবে
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // নাম্বারকে Ordinal (1st, 2nd, 3rd, 4th...) ফরম্যাটে রূপান্তর করার ফাংশন
  const getOrdinalSuffix = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0B1120] text-white' : 'bg-slate-50 text-slate-800'}`}>
        <div className="flex flex-col items-center gap-4 px-10 py-8">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-500">LOADING COMMITTEE ARCHIVE</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>

      {/* Navbar: স্ক্রল ডাউনে হাইড এবং আপ করলে শো করার ট্রানজিশনসহ */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} user={user} handleLogout={handleLogout} />
      </div>

      {/* Heritage Hero */}
      <div className={`relative overflow-hidden ${darkMode ? 'bg-[#0B1120]' : 'bg-[#0F1B33]'} pt-28 pb-14 px-4 sm:px-8`}>
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(115deg, #fff 0px, #fff 2px, transparent 2px, transparent 64px)',
          }}
        ></div>
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-amber-500">
            <Trophy className="w-4 h-4" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400/90">CLUB HERITAGE</span>
          </div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.05]">
            Previous Committees
          </h1>
          <div className="mt-4 w-14 h-[3px] bg-amber-500 rounded-full"></div>
          <p className="mt-5 text-sm text-slate-400 max-w-lg leading-relaxed">
            Every executive panel that has led the club, in order, from its founding term to the present.
          </p>
        </div>
      </div>

      {/* কমিটি লিস্ট — Timeline */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-12 pb-16">
        {committees.length === 0 ? (
          <div className={`text-center py-16 ${darkMode ? 'bg-[#111a2e] border-white/10' : 'bg-white border-slate-200'} rounded-sm border`}>
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 font-semibold text-xs">No previous committees found.</p>
          </div>
        ) : (
          <div className="relative">
            {/* vertical timeline rail */}
            <div className={`absolute left-[27px] top-2 bottom-2 w-px ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

            <div className="space-y-3">
              {committees.map((committee, index) => {
                const serialNumber = getOrdinalSuffix(index + 1);

                return (
                  <div key={committee._id} className="relative flex gap-5 group">
                    {/* ordinal marker */}
                    <div className="shrink-0 relative z-10 mt-4">
                      <div className={`w-[56px] h-[56px] rounded-sm border flex flex-col items-center justify-center ${darkMode ? 'bg-[#111a2e] border-white/10 group-hover:border-amber-500/50' : 'bg-white border-slate-200 group-hover:border-amber-400/60'} transition-colors`}>
                        <span className={`text-sm font-extrabold leading-none ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                          {serialNumber}
                        </span>
                        <span className="text-[8px] tracking-widest text-slate-500 mt-1">PANEL</span>
                      </div>
                    </div>

                    {/* committee card */}
                    <div className={`flex-1 ${darkMode ? 'bg-[#111a2e] border-white/10 hover:border-amber-500/40' : 'bg-white border-slate-200 hover:border-amber-400/60'} border rounded-sm px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200`}>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3 text-amber-500" /> {committee.year}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Users className="w-3 h-3 text-amber-500" /> {committee.members?.length || 0} members
                          </span>
                        </div>
                        <h2 className={`text-base font-bold truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          {committee.committeeName}
                        </h2>
                      </div>

                      <Link
                        to={`/members/alumni/${committee._id}`}
                        className={`w-full sm:w-auto py-2 px-4 rounded-sm text-xs font-semibold flex items-center justify-center sm:justify-start gap-1.5 transition-colors shrink-0 ${darkMode ? 'bg-white/[0.06] text-slate-200 hover:bg-amber-500 hover:text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-amber-500 hover:text-slate-950'}`}
                      >
                        View panel <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousCommitteesList;