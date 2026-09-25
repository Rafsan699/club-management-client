import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import {
  FileText,
  RefreshCw,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  Pin,
  ShieldCheck,
  Award
} from 'lucide-react';

const NoticeView = ({
  darkMode,
  setDarkMode,
  user,
  handleLogout
}) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const itemsPerPage = 6;

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await API.get('/api/notices');
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNoticeContent = (n) => {
    if (n.content) return n.content;
    if (n.description) return n.description;

    if (n.textBoxes && Array.isArray(n.textBoxes) && n.textBoxes.length > 0) {
      return n.textBoxes.map(box => box.content || '').filter(Boolean).join('\n\n');
    }

    return 'No description provided for this notice.';
  };

  const filteredNotices = notices.filter((n) => {
    const contentText = getNoticeContent(n);
    const matchesSearch =
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.clubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contentText.toLowerCase().includes(searchTerm.toLowerCase());

    if (!selectedDate) {
      return matchesSearch;
    }

    const noticeDate = n.createdAt
      ? new Date(n.createdAt).toISOString().split('T')[0]
      : '';

    return matchesSearch && noticeDate === selectedDate;
  });

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  const bg = darkMode ? 'bg-[#121118]' : 'bg-[#F4F5F7]';
  const fg = darkMode ? 'text-[#F1EFEA]' : 'text-[#1A1A22]';
  const panelBg = darkMode ? 'bg-[#191821]' : 'bg-[#FFFFFF]';
  const line = darkMode ? 'border-[#2A2735]' : 'border-[#D6D6DF]';
  const lineSoft = darkMode ? 'border-[#221F2B]' : 'border-[#E2E2E8]';
  const divider = darkMode ? 'bg-[#221F2B]' : 'bg-[#E2E2E8]';
  const rule = darkMode ? 'bg-[#2A2735]' : 'bg-[#1A1A22]';
  const muted = darkMode ? 'text-[#9690A0]' : 'text-[#62626E]';
  const mutedSoft = darkMode ? 'text-[#686274]' : 'text-[#8C8C9A]';
  const accent = darkMode ? 'text-[#C96B93]' : 'text-[#6A2B52]';
  const accentBg = darkMode ? 'bg-[#C96B93]' : 'bg-[#6A2B52]';
  const gold = darkMode ? 'text-[#E2C279]' : 'text-[#8E6C2D]';
  const inputBase = darkMode
    ? 'bg-[#121118] border-[#2A2735] text-[#F1EFEA] placeholder-[#4F4A5C] focus:border-[#C96B93]'
    : 'bg-[#FFFFFF] border-[#D6D6DF] text-[#1A1A22] placeholder-[#9E9BAE] focus:border-[#6A2B52]';
  const iconMuted = darkMode ? 'text-[#686274]' : 'text-[#8C8C9A]';

  const backLink = darkMode
    ? 'text-[#9690A0] hover:text-[#F1EFEA]'
    : 'text-[#62626E] hover:text-[#1A1A22]';
  const clearBtn = darkMode
    ? 'border-[#2A2735] text-[#9690A0] hover:text-[#C96B93] hover:border-[#C96B93]'
    : 'border-[#D6D6DF] text-[#62626E] hover:text-[#6A2B52] hover:border-[#6A2B52]';
  const rowHover = darkMode ? 'hover:bg-[#191821]' : 'hover:bg-[#FFFFFF] shadow-sm';
  const rowTitleHover = darkMode ? 'group-hover:text-[#C96B93]' : 'group-hover:text-[#6A2B52]';
  const pageBtn = darkMode
    ? 'text-[#686274] hover:text-[#F1EFEA] disabled:opacity-30 disabled:hover:text-[#686274]'
    : 'text-[#8C8C9A] hover:text-[#1A1A22] disabled:opacity-30 disabled:hover:text-[#8C8C9A]';
  const pageNumInactive = darkMode ? 'text-[#686274] hover:text-[#F1EFEA]' : 'text-[#8C8C9A] hover:text-[#1A1A22]';
  const pageNumActive = darkMode ? 'text-[#F1EFEA]' : 'text-[#1A1A22]';

  const fontStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
      .gz-serif { font-family: 'Fraunces', Georgia, serif; font-feature-settings: 'ss02' 1; }
      .gz-sans { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
      .gz-tnum { font-variant-numeric: tabular-nums; }
      .gz-grain {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
        background-size: 140px 140px;
      }
    `}</style>
  );

  const Seal = ({ size = 48 }) => (
    <div className={`relative flex items-center justify-center rounded-full border border-current p-2`} style={{ width: size, height: size }}>
      <div className="absolute inset-1 rounded-full border border-current opacity-40 border-dashed" />
      <Award className="w-5 h-5 opacity-90" />
    </div>
  );

  if (loading) {
    return (
      <div className={`gz-sans relative flex flex-col justify-center items-center h-screen ${bg} ${fg} overflow-hidden`}>
        {fontStyles}
        <div className="gz-grain absolute inset-0 pointer-events-none mix-blend-overlay opacity-40" />
        <RefreshCw className={`w-5 h-5 animate-spin ${accent} relative`} />
        <span className={`text-[12px] tracking-widest uppercase mt-4 relative ${muted}`}>
          Loading Archives&hellip;
        </span>
      </div>
    );
  }

  return (
    <div className={`gz-sans relative min-h-screen ${bg} ${fg} pb-24`}>
      {fontStyles}
      <div className="gz-grain fixed inset-0 pointer-events-none mix-blend-overlay opacity-[0.12] z-0" />

      <div className="relative z-10">
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          user={user}
          handleLogout={handleLogout}
        />

        {/* Masthead */}
        <div className={`border-b ${line} pt-28 pb-10 px-6 backdrop-blur-sm`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`${accent} p-1 bg-current/5 rounded-full`}>
                  <Seal />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`w-3.5 h-3.5 ${gold}`} />
                    <span className={`text-[11px] font-semibold tracking-widest uppercase ${muted}`}>Official Registry</span>
                  </div>
                  <h1 className={`gz-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-none ${fg}`}>
                    Notices 
                  </h1>
                </div>
              </div>
              <span className={`gz-tnum hidden sm:block text-[11px] ${mutedSoft} whitespace-nowrap`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className={`mt-6 h-px w-full ${rule} opacity-80`} />

            <p className={`gz-serif italic text-[15px] mt-4 max-w-xl ${muted}`}>
              Verified announcements and updates. Members gain access to exclusive circulars upon authentication.
            </p>

            {/* Search + Date */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${iconMuted}`} />
                <input
                  type="text"
                  placeholder="Search by title, organization, or publication context..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${inputBase} border rounded-lg px-4 py-3 pl-11 text-[13px] shadow-sm focus:outline-none focus:ring-1 focus:ring-current transition-all`}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${iconMuted}`} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`gz-tnum w-full sm:w-48 ${inputBase} border rounded-lg px-3 py-3 pl-11 text-[13px] shadow-sm focus:outline-none focus:ring-1 focus:ring-current transition-all cursor-pointer`}
                  />
                </div>

                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    title="Clear date filter"
                    className={`p-3 border rounded-lg ${clearBtn} transition-colors cursor-pointer shadow-sm`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-6 mt-10">
          {selectedNotice ? (
            /* NOTICE DETAIL VIEW - Executive Ledger Style */
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className={`inline-flex items-center gap-2 text-[13px] font-medium ${backLink} transition-colors cursor-pointer`}
                >
                  <ArrowLeft className="w-4 h-4" /> Return to directory
                </button>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold border ${line} ${muted} tracking-widest uppercase rounded-full shadow-xs`}>
                  <span className={`w-2 h-2 rounded-full ${accentBg} animate-pulse`}></span>
                  Verified Notice
                </div>
              </div>

              <div className={`relative border ${line} ${panelBg} overflow-hidden shadow-2xl rounded-2xl`}>
                <div className={`absolute inset-3 border pointer-events-none ${lineSoft} rounded-xl opacity-60 hidden sm:block`} />

                <div className={`absolute right-10 top-28 opacity-[0.04] ${accent} pointer-events-none`}>
                  <Seal size={300} />
                </div>

                <div className={`relative flex flex-wrap items-center justify-between gap-4 px-8 sm:px-16 py-6 border-b ${lineSoft}`}>
                  <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-md bg-current/10 ${accent}`}>
                    {selectedNotice.category || 'General Notice'}
                  </span>
                  <span className={`gz-tnum text-[12px] ${mutedSoft} font-medium`}>
                    {selectedNotice.publishDate || selectedNotice.date || (selectedNotice.createdAt ? new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent Publication')}
                  </span>
                </div>

                <div className="relative px-8 sm:px-16 pt-12 pb-6">
                  <h2 className={`gz-serif text-2xl sm:text-4xl font-semibold leading-tight ${fg} tracking-tight`}>
                    {selectedNotice.title}
                  </h2>
                </div>

                <div
                  className={`relative px-8 sm:px-16 py-6 text-[15px] sm:text-base leading-relaxed ${fg} opacity-95 space-y-4`}
                  dangerouslySetInnerHTML={{ __html: getNoticeContent(selectedNotice) }}
                />

                <div className={`relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-8 sm:px-16 py-8 border-t ${lineSoft} text-[12px] ${mutedSoft} gz-serif italic`}>
                  <span>{selectedNotice.footerTagline || 'Excellence · Integrity · Leadership'}</span>
                  <span className="not-italic tracking-widest uppercase text-[10px] font-semibold opacity-80 border border-current px-3 py-1 rounded">Authorized Document</span>
                </div>
              </div>
            </div>
          ) : (
            /* NOTICE LIST VIEW */
            <>
              {filteredNotices.length === 0 ? (
                <div className={`border ${line} rounded-2xl py-20 text-center ${panelBg} shadow-sm`}>
                  <FileText className={`w-10 h-10 mx-auto ${iconMuted}`} />
                  <h3 className={`gz-serif text-lg font-semibold mt-4 ${fg}`}>No records found</h3>
                  <p className={`text-[13px] mt-1 ${mutedSoft}`}>Try modifying your keywords or removing the date filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentNotices.map((n) => {
                    const created = n.createdAt ? new Date(n.createdAt) : null;
                    const day = created ? created.getDate() : null;
                    const month = created ? created.toLocaleDateString('en-US', { month: 'short' }) : null;
                    const year = created ? created.getFullYear() : null;
                    const displayDate = n.publishDate || n.date || (created ? `${month} ${day}, ${year}` : 'Recent');
                    const snippetText = getNoticeContent(n).replace(/<[^>]*>?/gm, '');

                    return (
                      <div
                        key={n._id}
                        onClick={() => setSelectedNotice(n)}
                        className={`group relative flex items-stretch gap-5 sm:gap-8 p-6 sm:p-7 border ${line} rounded-2xl cursor-pointer transition-all duration-300 ${rowHover} shadow-xs hover:shadow-md`}
                      >
                        <div className={`absolute left-0 top-3 bottom-3 w-[4px] ${accentBg} scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 rounded-r`} />

                        {/* Date chit */}
                        <div className={`w-16 sm:w-20 flex-shrink-0 text-center flex flex-col justify-center border-r ${lineSoft} pr-4`}>
                          {day ? (
                            <>
                              <div className={`gz-serif gz-tnum text-3xl leading-none font-bold ${fg}`}>{day}</div>
                              <div className={`gz-tnum text-[11px] uppercase tracking-wider font-medium mt-2 ${mutedSoft}`}>{month} {year}</div>
                            </>
                          ) : (
                            <div className={`text-[12px] ${mutedSoft}`}>{displayDate}</div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-current/10 ${accent}`}>
                              {n.category || 'General'}
                            </span>
                            {n.isPinned && (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-current/10 ${gold}`}>
                                <Pin className="w-3 h-3" /> Priority
                              </span>
                            )}
                          </div>

                          <h3 className={`gz-serif text-lg sm:text-xl font-semibold leading-snug ${fg} ${rowTitleHover} transition-colors`}>
                            {n.title || 'Untitled notice'}
                          </h3>

                          <p className={`text-[13px] mt-2 line-clamp-2 ${muted} leading-relaxed`}>
                            {snippetText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`gz-tnum mt-10 p-4 border ${line} rounded-xl ${panelBg} flex items-center justify-between text-[13px] shadow-xs`}>
                  <div className={mutedSoft}>
                    Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredNotices.length)}</span> of <span className="font-semibold">{filteredNotices.length}</span> entries
                  </div>

                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`inline-flex items-center gap-1.5 font-medium ${pageBtn} transition-colors cursor-pointer`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="hidden sm:flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNum = index + 1;
                        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-7 h-7 rounded-lg transition-all cursor-pointer flex items-center justify-center font-medium ${
                                currentPage === pageNum
                                  ? `${accentBg} text-white shadow-xs`
                                  : pageNumInactive
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className={mutedSoft}>&hellip;</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`inline-flex items-center gap-1.5 font-medium ${pageBtn} transition-colors cursor-pointer`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeView;