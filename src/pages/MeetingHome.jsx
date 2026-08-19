import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, ArrowRight, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

const MeetingHome = () => {
  const [meetings, setMeetings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const meetingsPerPage = 12; // প্রতি পেজে ১২টি করে মিটিং দেখাবে

  const navigate = useNavigate();

  useEffect(() => {
    // সঠিক এপিআই পাথ (/api/meetings) দিয়ে কল করা হলো
    API.get('/api/meetings')
      .then(res => {
        const meetingList = Array.isArray(res.data) ? res.data : [];
        console.log("All meetings from server:", meetingList);
        
        // শুধু পাবলিশ হওয়া মিটিংগুলো ফিল্টার করা
        const published = meetingList.filter(m => 
          m.isPublished === true || m.isPublished === "true"
        ); 
        
        setMeetings(published);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching meetings:", err);
        setLoading(false);
      });
  }, []);

  // সার্চ কুয়েরি অনুযায়ী মিটিং ফিল্টার করা
  const filteredMeetings = meetings.filter(m => 
    m.meetingDate && m.meetingDate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // সার্চ করলে প্রথম পেজে রিসেট করার লজিক
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleMeetingClick = (id) => {
    const isVerified = sessionStorage.getItem(`verified_meeting_${id}`);
    if (isVerified) {
      navigate(`/activities/meetings/view?id=${id}`);
    } else {
      navigate(`/activities/meetings/entry?id=${id}`);
    }
  };

  // --- Pagination Logic ---
  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = filteredMeetings.slice(indexOfFirstMeeting, indexOfLastMeeting);
  const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // পেজ পরিবর্তন হলে স্ক্রিন উপরে নিয়ে যাবে
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      
      {/* Hero Header Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-6">
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
          Meeting Archive & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Schedules</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Explore all official club meetings, access session details, and review attendance securely.
        </p>
      </div>

      {/* Modern Search Bar */}
      <div className="max-w-xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-purple-600" />
          <input 
            type="text" 
            placeholder="Search meeting by date (e.g. August)..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100 text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-xs tracking-wide">Loading meetings...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100 shadow-sm space-y-3 max-w-lg mx-auto p-8">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-slate-800 font-extrabold text-lg">No meetings found!</h3>
          <p className="text-xs text-slate-400 font-medium">No published meetings match your search criteria right now.</p>
        </div>
      ) : (
        <>
          {/* World-Class Meetings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMeetings.map((m) => (
              <div 
                key={m._id} 
                onClick={() => handleMeetingClick(m._id)}
                className="group relative bg-white/80 backdrop-blur-xl p-7 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 border border-purple-100/80 hover:border-purple-300 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl group-hover:bg-purple-200/60 transition-all duration-500 pointer-events-none -mr-10 -mt-10"></div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md">
                        Scheduled Date
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition">
                        {m.meetingDate}
                      </h3>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="w-full">
                    <p className="text-xs text-slate-600 bg-slate-50/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-100/80 leading-relaxed font-medium line-clamp-3">
                      {m.description && m.description.trim() !== "" 
                        ? m.description 
                        : "Click to enter secret code & view comprehensive details of this meeting session."}
                    </p>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 relative z-10 text-xs font-bold text-slate-700 group-hover:text-purple-700 transition-colors">
                  <span className="flex items-center gap-1.5 text-slate-500 group-hover:text-purple-600 transition-colors">
                    <Lock className="w-3.5 h-3.5 text-purple-500" /> View Attendance
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Professional Modern Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 pt-8">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center shadow-sm ${
                        currentPage === pageNumber
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200 scale-105'
                          : 'bg-white text-slate-700 border border-purple-100 hover:bg-purple-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MeetingHome;