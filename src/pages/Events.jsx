import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar, MapPin, RefreshCw, Image as ImageIcon, Search, ArrowLeft, ChevronLeft, ChevronRight, Mail } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const eventsPerPage = 6;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  if (loading) {
    return (
      <div 
        role="status" 
        aria-live="polite"
        className={`flex justify-center items-center h-[60vh] font-bold tracking-widest text-xs ${darkMode ? 'bg-[#090d16] text-blue-400' : 'bg-[#f8fafc] text-blue-600'}`}
      >
        <RefreshCw className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
        <span>LOADING EVENTS...</span>
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
      backgroundSize: '20px 20px',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>

      <div className="w-full px-3 sm:px-4 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10 max-w-[1200px] mx-auto overflow-x-hidden">

        {/* --- DETAIL VIEW --- */}
        {selectedEvent ? (
          <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in duration-300 px-1">
            <button
              onClick={() => setSelectedEvent(null)}
              aria-label="Back to Events List"
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-[11px] tracking-wide shadow-sm transition-all duration-300 border backdrop-blur-xl group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                darkMode 
                  ? 'bg-[#111827]/80 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700' 
                  : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-slate-200/50'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" /> Back to Events List
            </button>

            <div className={`rounded-2xl border shadow-xl overflow-hidden p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 backdrop-blur-2xl ${
              darkMode 
                ? 'bg-[#111827]/95 border-slate-800/80 shadow-black/60 text-white' 
                : 'bg-white/95 border-slate-200/90 shadow-xl shadow-slate-900/10 text-slate-900'
            }`}>
              {selectedEvent.imageUrl ? (
                /* সম্পূর্ণ ছবি কোনো ক্রপ বা কাটা ছাড়াই দেখানোর জন্য object-contain ব্যবহার করা হয়েছে */
                <div className="w-full max-h-[450px] min-h-[250px] overflow-hidden rounded-xl relative bg-slate-950/90 flex items-center justify-center shadow-md">
                  <img 
                    src={selectedEvent.imageUrl} 
                    alt={selectedEvent.title} 
                    loading="lazy" 
                    className="w-full h-full max-h-[450px] object-contain object-center" 
                  />
                </div>
              ) : (
                <div className={`w-full h-48 sm:h-64 md:h-[340px] rounded-xl flex items-center justify-center ${
                  darkMode ? 'bg-slate-800/80 text-slate-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <ImageIcon className="w-12 h-12" aria-hidden="true" />
                </div>
              )}

              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug break-words">
                  {selectedEvent.title}
                </h2>
                
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm ${
                    darkMode ? 'bg-blue-950/60 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200/80 text-blue-700'
                  }`}>
                    <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {selectedEvent.date}
                  </span>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm break-all ${
                    darkMode ? 'bg-blue-950/60 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200/80 text-blue-700'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {selectedEvent.location}
                  </span>
                </div>

                <div className={`pt-3 border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                  <p className={`text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line break-words ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- LIST & SEARCH VIEW --- */
          <div className="space-y-6 sm:space-y-8">
            
            {/* Header Title Section */}
            <div className="text-center space-y-2.5 max-w-xl mx-auto px-2">
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full border shadow-sm inline-block transition-colors duration-300 ${
                darkMode ? 'bg-blue-950/40 border-blue-800/60 text-blue-400 shadow-blue-950/20' : 'bg-blue-50/80 border-blue-200 text-blue-700 shadow-blue-100/50'
              }`}>
                Club Activities
              </span>
              <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                BRIU Sports Club Events
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-normal text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                Explore championships, workshops, and sports tournaments hosted by BRIU Sports Club.
              </p>
            </div>

            {/* Search Bar & Back Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-2xl mx-auto px-1">
              <button
                onClick={() => window.history.back()}
                aria-label="Back"
                className={`min-h-[38px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-[11px] tracking-wide shadow-sm transition-all duration-300 border backdrop-blur-xl group active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  darkMode 
                    ? 'bg-[#111827]/80 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700' 
                    : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-slate-200/50'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" /> Back
              </button>

              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  aria-label="Search events"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className={`w-full min-h-[38px] pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all duration-300 shadow-sm ${
                    darkMode 
                      ? 'bg-[#111827]/80 border-slate-800/80 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-white/90 border-slate-200/90 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>
            </div>

            {/* Events Grid */}
            {currentEvents.length === 0 ? (
              <div role="status" className={`text-center py-12 px-4 rounded-2xl border shadow-md max-w-xl mx-auto ${
                darkMode ? 'bg-[#111827]/80 border-slate-800/80 text-slate-400' : 'bg-white/90 border-slate-200/90 text-slate-500'
              }`}>
                <p className="font-bold text-xs tracking-wide">No events found matching your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-[1200px] mx-auto px-1">
                {currentEvents.map((ev) => (
                  <div 
                    key={ev._id} 
                    className={`w-full max-w-[340px] sm:max-w-none mx-auto rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border backdrop-blur-xl group flex flex-col justify-between ${
                      darkMode 
                        ? 'bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-900/90 border-blue-500/30 shadow-blue-950/40 hover:border-blue-500/60' 
                        : 'bg-gradient-to-b from-white via-blue-50/30 to-white border-slate-200/90 shadow-slate-200/50 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      {/* Image Banner - পুরো ছবি নিখুঁতভাবে দেখানোর জন্য object-contain এবং ডার্ক ব্যাকগ্রাউন্ড ফ্রেম */}
                      {ev.imageUrl ? (
                        <div className="h-48 sm:h-52 w-full overflow-hidden relative bg-slate-950/90 flex items-center justify-center">
                          <img 
                            src={ev.imageUrl} 
                            alt={ev.title} 
                            loading="lazy" 
                            className="w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105" 
                          />
                        </div>
                      ) : (
                        <div className={`w-full h-48 sm:h-52 flex items-center justify-center ${darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                          <ImageIcon className="w-8 h-8" aria-hidden="true" />
                        </div>
                      )}
                      
                      {/* Content Area */}
                      <div className="p-3.5 sm:p-4 space-y-2.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border max-w-full truncate ${
                              darkMode ? 'bg-blue-950/60 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200/80 text-blue-700'
                            }`}>
                              <Calendar className="w-2.5 h-2.5 inline-block mr-1 -mt-0.5 shrink-0" aria-hidden="true" />
                              <span className="truncate">{ev.date}</span>
                            </span>
                          </div>
                          <h3 className={`text-xs sm:text-sm font-bold tracking-tight line-clamp-2 break-words ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {ev.title}
                          </h3>
                        </div>

                        <p className={`text-[11px] line-clamp-2 leading-relaxed font-normal break-words ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {ev.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Location and Details Button Row */}
                    <div className={`p-3.5 sm:p-4 pt-2.5 flex items-center justify-between gap-2 border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] font-semibold min-w-0 flex-1">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" aria-hidden="true" />
                        <span className="truncate">{ev.location}</span>
                      </div>

                      <button 
                        onClick={() => setSelectedEvent(ev)}
                        aria-label={`View details for ${ev.title}`}
                        className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-[10px] font-bold tracking-wide gap-0.5 group-hover:translate-x-0.5 transition-transform duration-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-1.5 ${
                          darkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        Details <span className="text-[9px]" aria-hidden="true">→</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination Navigation" className="flex justify-center items-center gap-1.5 sm:gap-2 pt-4 flex-wrap overflow-x-auto max-w-full px-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className={`min-h-[38px] px-3 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-1 disabled:opacity-30 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    darkMode ? 'bg-[#111827]/80 border-slate-800/80 text-white hover:bg-slate-800' : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-white'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> Prev
                </button>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      aria-label={`Page ${index + 1}`}
                      aria-current={currentPage === index + 1 ? 'page' : undefined}
                      className={`min-h-[38px] min-w-[38px] w-9 h-9 rounded-xl text-[11px] font-bold border transition-all shadow-sm inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        currentPage === index + 1 
                          ? 'bg-blue-600 text-white border-transparent shadow-blue-500/30 scale-105' 
                          : darkMode 
                            ? 'bg-[#111827]/80 border-slate-800/80 text-slate-300 hover:bg-slate-800' 
                            : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className={`min-h-[38px] px-3 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-1 disabled:opacity-30 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    darkMode ? 'bg-[#111827]/80 border-slate-800/80 text-white hover:bg-slate-800' : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-white'
                  }`}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
              </nav>
            )}

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className={`w-full border-t mt-16 py-8 px-4 backdrop-blur-xl ${
        darkMode ? 'bg-[#0b101b]/95 border-slate-800 text-slate-300' : 'bg-white/90 border-slate-200/80 text-slate-700 shadow-sm'
      }`}>
        <div className="max-w-[1200px] mx-auto text-center space-y-2">
          <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>
            Contact Information
          </h3>
          <p className="text-xs font-medium break-words">
            Email: <a href="mailto:briu.sportsclub@gmail.com" className={`underline underline-offset-4 font-semibold transition-colors duration-200 break-all ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-900'}`}>briu.sportsclub@gmail.com</a>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Events;