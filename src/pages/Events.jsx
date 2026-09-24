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
        className={`flex justify-center items-center h-[60vh] text-sm font-medium ${darkMode ? 'bg-[#0B111C] text-blue-400' : 'bg-[#F7F8FA] text-blue-700'}`}
        style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
      >
        <RefreshCw className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
        <span>Loading events...</span>
      </div>
    );
  }

  const renderPoster = (ev, cls, zoom = false) => (
    ev.imageUrl ? (
      <div className={`ev-surf2 overflow-hidden flex items-center justify-center ${cls}`}>
        <img
          src={ev.imageUrl}
          alt={ev.title}
          loading="lazy"
          className={`w-full h-full object-contain object-center ${zoom ? 'transition-transform duration-500 ease-out group-hover:scale-[1.03]' : ''}`}
        />
      </div>
    ) : (
      <div className={`ev-surf2 ev-mute flex items-center justify-center ${cls}`}>
        <ImageIcon className="w-10 h-10" aria-hidden="true" />
      </div>
    )
  );

  const btn = 'ev-btn min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 rounded-lg text-sm font-medium border ev-line ev-surf transition active:scale-[.98]';

  return (
    <div className={`ev ${darkMode ? 'dark' : ''} min-h-screen w-full antialiased selection:bg-blue-700 selection:text-white relative transition-colors duration-300`}
    style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      <div className="h-1 bg-[var(--navy)]"></div>

      <div className="w-full px-5 sm:px-8 py-10 sm:py-14 max-w-[1080px] mx-auto overflow-x-hidden">

        {/* --- DETAIL VIEW --- */}
        {selectedEvent ? (
          <article className="ev-fade max-w-[820px] mx-auto">
            <button
              onClick={() => setSelectedEvent(null)}
              aria-label="Back to Events List"
              className={`${btn} group`}
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" /> Back to Events List
            </button>

            <p className="text-sm font-medium ev-acc mt-10">BRIU Sports Club</p>
            <h2 className="ev-serif text-3xl sm:text-5xl font-semibold leading-[1.12] mt-3 break-words">
              {selectedEvent.title}
            </h2>

            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pb-8 border-b ev-line text-sm sm:text-base">
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 ev-acc shrink-0" aria-hidden="true" /> {selectedEvent.date}
              </span>
              <span className="flex items-center gap-2.5 break-words min-w-0">
                <MapPin className="w-4 h-4 ev-acc shrink-0" aria-hidden="true" /> {selectedEvent.location}
              </span>
            </div>

            <div className="mt-8 rounded-xl overflow-hidden border ev-line">
              {renderPoster(selectedEvent, 'w-full min-h-[240px] max-h-[520px] h-[300px] sm:h-[460px]')}
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-semibold ev-mute mb-3">About this event</h3>
              <p className="text-base sm:text-lg leading-[1.75] whitespace-pre-line break-words">
                {selectedEvent.description}
              </p>
            </div>
          </article>
        ) : (
          /* --- LIST & SEARCH VIEW --- */
          <div className="ev-fade">

            {/* Header Title Section */}
            <div className="pb-8 border-b ev-line">
              <p className="text-sm font-medium ev-acc">Club Activities</p>
              <h1 className="ev-serif text-4xl sm:text-6xl font-semibold leading-[1.05] mt-3">
                BRIU Sports Club Events
              </h1>
              <p className="ev-mute text-base sm:text-lg leading-relaxed max-w-2xl mt-4">
                Explore championships, workshops, and sports tournaments hosted by BRIU Sports Club.
              </p>
            </div>

            {/* Search Bar & Back Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-6">
              <button
                onClick={() => window.history.back()}
                aria-label="Back"
                className={`${btn} group shrink-0`}
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" /> Back
              </button>

              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none ev-mute">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  aria-label="Search events"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="ev-input w-full min-h-[40px] pl-10 pr-4 py-2 rounded-lg border ev-line ev-surf text-sm outline-none transition"
                />
              </div>

              <span className="text-sm ev-mute shrink-0 sm:pl-2">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {/* Events List */}
            {currentEvents.length === 0 ? (
              <div role="status" className="text-center py-16 px-4 rounded-xl border ev-line ev-surf ev-mute">
                <p className="font-medium">No events found matching your search criteria.</p>
              </div>
            ) : (
              <div className="border-t ev-line">
                {currentEvents.map((ev) => (
                  <article key={ev._id} className="ev-row group grid sm:grid-cols-[260px_1fr] gap-5 sm:gap-8 py-8 border-b ev-line">
                    <div className="rounded-lg overflow-hidden border ev-line self-start">
                      {renderPoster(ev, 'w-full h-48 sm:h-44', true)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm ev-mute">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <Calendar className="w-3.5 h-3.5 ev-acc shrink-0" aria-hidden="true" />
                          <span className="truncate">{ev.date}</span>
                        </span>
                        <span className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 ev-acc shrink-0" aria-hidden="true" />
                          <span className="truncate">{ev.location}</span>
                        </span>
                      </div>

                      <h3 className="ev-serif ev-title text-xl sm:text-2xl font-semibold leading-snug line-clamp-2 break-words mt-3 transition-colors">
                        {ev.title}
                      </h3>
                      <p className="ev-mute leading-relaxed line-clamp-2 break-words mt-2">
                        {ev.description}
                      </p>

                      <div className="mt-4 sm:mt-auto pt-2">
                        <button 
                          onClick={() => setSelectedEvent(ev)}
                          aria-label={`View details for ${ev.title}`}
                          className="ev-link min-h-[40px] inline-flex items-center gap-1.5 text-sm font-semibold ev-acc rounded"
                        >
                          View details <span aria-hidden="true" className="ev-arrow">→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination Navigation" className="flex justify-center items-center gap-2 pt-10 flex-wrap overflow-x-auto max-w-full">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className={`${btn} disabled:opacity-40 disabled:pointer-events-none`}
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" /> Prev
                </button>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      aria-label={`Page ${index + 1}`}
                      aria-current={currentPage === index + 1 ? 'page' : undefined}
                      className={`min-h-[40px] min-w-[40px] rounded-lg text-sm font-medium border transition inline-flex items-center justify-center ${
                        currentPage === index + 1
                          ? 'bg-[var(--navy)] text-white border-transparent'
                          : 'ev-surf ev-line ev-btn'
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
                  className={`${btn} disabled:opacity-40 disabled:pointer-events-none`}
                >
                  Next <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </nav>
            )}

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full bg-[var(--navy)] text-white mt-10">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white/60">Contact Information</h3>
            <p className="text-base mt-1.5 break-words">
              Email: <a href="mailto:briu.sportsclub@gmail.com" className="underline underline-offset-4 decoration-white/40 hover:decoration-white transition break-all">briu.sportsclub@gmail.com</a>
            </p>
          </div>
          <p className="text-sm text-white/50">BRIU Sports Club</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500..700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        .ev {
          --bg: #F7F8FA; --surf: #FFFFFF; --surf2: #EEF1F5;
          --ink: #111827; --mute: #5B6472; --line: #E2E6EC;
          --acc: #1D4ED8; --navy: #0F2A4A;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          background: var(--bg); color: var(--ink);
        }
        .ev.dark {
          --bg: #0B111C; --surf: #121A28; --surf2: #1A2436;
          --ink: #EDF1F7; --mute: #93A0B5; --line: #243149;
          --acc: #6B9BFF; --navy: #0A1424;
        }
        .ev .ev-serif { font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; letter-spacing: -0.01em; }
        .ev .ev-surf { background: var(--surf); }
        .ev .ev-surf2 { background: var(--surf2); }
        .ev .ev-line { border-color: var(--line); }
        .ev .ev-mute { color: var(--mute); }
        .ev .ev-acc { color: var(--acc); }
        .ev h1, .ev h2, .ev h3, .ev p { overflow-wrap: break-word; }
        .ev a:focus-visible, .ev button:focus-visible, .ev input:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }

        .ev-btn:hover:not(:disabled) { background: var(--surf2); }
        .ev-input:focus { border-color: var(--acc); box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 18%, transparent); }
        .ev-input::placeholder { color: var(--mute); }
        .ev-row:hover .ev-title { color: var(--acc); }
        .ev-arrow { transition: transform .25s ease; }
        .ev-link:hover .ev-arrow, .ev-row:hover .ev-arrow { transform: translateX(4px); }

        .ev-fade { animation: evFade .35s ease both; }
        @keyframes evFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .ev-fade { animation: none; } }
      `}</style>

    </div>
  );
};

export default Events;