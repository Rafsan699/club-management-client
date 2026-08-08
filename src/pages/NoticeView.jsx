import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { FileText, RefreshCw, Sparkles, Calendar, Building2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

const NoticeView = ({ darkMode, setDarkMode, user, handleLogout }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const filteredNotices = notices.filter(n => {
    const matchesSearch = 
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.clubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.clubSubName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!selectedDate) return matchesSearch;

    const noticeDate = n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : '';
    return matchesSearch && noticeDate === selectedDate;
  });

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen ${darkMode ? 'bg-slate-950 text-emerald-500' : 'bg-slate-100 text-blue-600'} font-serif`}>
        <div className={`relative flex items-center justify-center p-6 ${darkMode ? 'bg-slate-900/80 border-emerald-500/20' : 'bg-white/80 border-blue-500/20'} rounded-2xl border shadow-xl backdrop-blur-xl`}>
          <RefreshCw className="w-8 h-8 animate-spin mb-2" />
          <span className={`text-xs font-semibold tracking-widest uppercase mt-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'} animate-pulse`}>Loading Official Archives...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-slate-900'} font-serif selection:bg-emerald-600 selection:text-white pb-20`}>
      
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        user={user} 
        handleLogout={handleLogout} 
      />

      <div className={`relative overflow-hidden border-b ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200/80 bg-white/60'} backdrop-blur-xl pt-28 pb-16 px-4 sm:px-8 shadow-sm`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-4 relative z-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-50 border border-blue-200 text-blue-700'} text-xs font-semibold tracking-wide shadow-sm`}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Verified Institutional Publications
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3 drop-shadow-sm">
            <Building2 className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-emerald-500' : 'text-blue-600'}`} /> Executive Notice Board
          </h1>
          
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} max-w-2xl leading-relaxed font-sans`}>
            Explore authentic, securely-compiled digital institutional notices generated on official administrative letterpads with verified signatories.
          </p>

          <div className="w-full max-w-xl mt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by title or organization..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500' : 'bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-blue-600'} border rounded-xl px-4 py-2.5 pl-10 text-xs focus:outline-none focus:ring-1 transition-all font-sans shadow-sm backdrop-blur-md`}
              />
            </div>

            <div className="w-full sm:w-auto relative flex items-center gap-2">
              <div className="relative w-full">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full sm:w-44 ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500' : 'bg-white/80 border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-blue-600'} border rounded-xl px-3 py-2.5 pl-10 text-xs focus:outline-none focus:ring-1 transition-all font-sans shadow-sm backdrop-blur-md cursor-pointer`}
                />
              </div>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  title="Clear Date Filter"
                  className={`p-2.5 ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-red-400' : 'bg-white/80 border-slate-200 text-slate-500 hover:text-red-600'} border rounded-xl transition-all shadow-sm cursor-pointer`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-8 mt-10">
        
        {filteredNotices.length === 0 ? (
          <div className={`${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/70 border-slate-200'} border rounded-2xl p-12 text-center space-y-3 backdrop-blur-md shadow-lg`}>
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>No Documents Found</h3>
            <p className="text-xs text-slate-500 font-sans">Try modifying your search criteria or clearing the date filter.</p>
          </div>
        ) : (
          <>
            <div className="space-y-16 flex flex-col items-center">
              {currentNotices.map((n) => (
                <div key={n._id} className="w-full flex flex-col items-center group">
                  
                  <div className={`w-full max-w-[794px] mb-3 flex items-center justify-between px-4 py-2 ${darkMode ? 'bg-slate-900/70 border-slate-800 text-slate-300' : 'bg-white/70 border-slate-200 text-slate-700'} border rounded-xl backdrop-blur-md shadow-sm font-sans`}>
                    <div className="flex items-center gap-2 text-xs font-medium truncate">
                      <FileText className={`w-4 h-4 ${darkMode ? 'text-emerald-500' : 'text-blue-600'} shrink-0`} />
                      <span className="truncate tracking-wide">{n.title || 'Untitled Notice Document'}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
                      <span className="hidden sm:inline-flex items-center gap-1">
                        <Calendar className={`w-3.5 h-3.5 ${darkMode ? 'text-emerald-500' : 'text-blue-600'}`} /> {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Official Pad'}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'} border font-semibold uppercase text-[10px]`}>
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* সম্পূর্ণ ফিক্সড রেসপন্সিভ কন্টেইনার যাতে কোনো অংশ কেটে না যায় */}
                  <div className="w-full flex justify-center overflow-x-auto py-4">
                    <div className="w-[794px] h-[1123px] min-w-[794px] scale-[0.50] sm:scale-[0.75] lg:scale-100 origin-top my-[-275px] sm:my-[-140px] lg:my-0 bg-white text-slate-900 px-10 pt-0 pb-8 shadow-2xl rounded-xl border border-slate-300 flex flex-col justify-between relative overflow-hidden font-serif">
                      
                      {n.watermarkImg && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          <img src={n.watermarkImg} alt="Watermark" style={{ width: n.watermarkSize || '320px', opacity: n.watermarkOpacity || '0.10' }} className="object-contain" />
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex -mx-10 mb-3 items-start">
                          <div className="w-16 h-20 bg-gradient-to-b from-blue-900 to-rose-600"></div>
                          <div className="w-14 h-14 bg-gradient-to-b from-indigo-800 to-rose-500"></div>
                          <div className="w-14 h-9 bg-gradient-to-b from-rose-600 to-pink-500"></div>
                        </div>

                        <div className="flex justify-between items-center relative px-12 pt-1 pb-2">
                          <div className="flex items-center justify-center pl-2" style={{ width: n.logoSize || '65px', height: n.logoSize || '65px' }}>
                            {n.logoLeft ? (
                              <img src={n.logoLeft} alt="Logo 1" className="w-full h-full object-contain" />
                            ) : (
                              <div className="text-[9px] border rounded-full w-full h-full flex items-center justify-center text-slate-400">Logo 1</div>
                            )}
                          </div>

                          <div className="text-center px-4">
                            <h2 className="text-[26px] font-extrabold tracking-wide uppercase leading-tight font-serif text-slate-900">{n.clubName}</h2>
                            <p className="text-[13px] font-bold tracking-wide uppercase font-serif text-slate-900 mt-1">{n.clubSubName}</p>
                          </div>

                          <div className="flex items-center justify-center pr-2" style={{ width: n.logoSize || '65px', height: n.logoSize || '65px' }}>
                            {n.logoRight ? (
                              <img src={n.logoRight} alt="Logo 2" className="w-full h-full object-contain" />
                            ) : (
                              <div className="text-[9px] border rounded-full w-full h-full flex items-center justify-center text-slate-400">Logo 2</div>
                            )}
                          </div>
                        </div>
                        <div className="border-b-[1.5px] border-slate-900 mt-1"></div>
                      </div>

                      <div className="relative flex-grow z-10 my-2">
                        {n.textBoxes && typeof n.textBoxes === 'string' ? (
                          JSON.parse(n.textBoxes).map((box) => (
                            <div
                              key={box.id}
                              style={{
                                position: 'absolute',
                                left: `${box.x}%`,
                                top: `${box.y}%`,
                                width: `${box.width}%`,
                                minHeight: `${box.height}px`,
                                backgroundColor: box.bg,
                                border: box.border,
                                fontSize: box.fontSize,
                                padding: '8px',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                              }}
                              className={`leading-relaxed overflow-hidden ${box.align}`}
                              dangerouslySetInnerHTML={{ __html: box.content }}
                            />
                          ))
                        ) : (
                          n.textBoxes?.map((box) => (
                            <div
                              key={box.id}
                              style={{
                                position: 'absolute',
                                left: `${box.x}%`,
                                top: `${box.y}%`,
                                width: `${box.width}%`,
                                minHeight: `${box.height}px`,
                                backgroundColor: box.bg,
                                border: box.border,
                                fontSize: box.fontSize,
                                padding: '8px',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                              }}
                              className={`leading-relaxed overflow-hidden ${box.align}`}
                              dangerouslySetInnerHTML={{ __html: box.content }}
                            />
                          ))
                        )}
                      </div>

                      <div className="pt-2 space-y-4 z-10">
                        <div className="flex justify-between px-6">
                          <div className="text-center relative" style={{ transform: `translate(${n.sig1X || 0}px, ${n.sig1Y || 0}px)` }}>
                            {n.sig1Img ? (
                              <img 
                                src={n.sig1Img} 
                                alt="Sign 1" 
                                style={{ width: n.sig1ImgWidth || '90px', height: n.sig1ImgHeight || '36px' }} 
                                className="mx-auto object-contain mb-0.5" 
                              />
                            ) : <div className="h-7"></div>}
                            <div style={{ fontSize: n.sig1FontSize || '11px' }} className={`${n.sig1FontWeight || 'font-bold'} leading-tight`}>{n.sig1Name}</div>
                            <div style={{ fontSize: n.sig1FontSize || '11px' }} className={`${n.sig1FontWeight || 'font-bold'} text-slate-800 leading-tight`}>{n.sig1Role}</div>
                            <div className="text-[10.5px] text-slate-700">{n.sig1Club || 'BRIU Sports Club'}</div>
                          </div>

                          <div className="text-center relative" style={{ transform: `translate(${n.sig2X || 0}px, ${n.sig2Y || 0}px)` }}>
                            {n.sig2Img ? (
                              <img 
                                src={n.sig2Img} 
                                alt="Sign 2" 
                                style={{ width: n.sig2ImgWidth || '90px', height: n.sig2ImgHeight || '36px' }} 
                                className="mx-auto object-contain mb-0.5" 
                              />
                            ) : <div className="h-7"></div>}
                            <div style={{ fontSize: n.sig2FontSize || '11px' }} className={`${n.sig2FontWeight || 'font-bold'} leading-tight`}>{n.sig2Name}</div>
                            <div style={{ fontSize: n.sig2FontSize || '11px' }} className={`${n.sig2FontWeight || 'font-bold'} text-slate-800 leading-tight`}>{n.sig2Role}</div>
                            <div className="text-[10.5px] text-slate-700">{n.sig2Club || 'BRIU Sports Club'}</div>
                          </div>
                        </div>

                        <div className={`bg-gradient-to-r ${n.footerTheme || 'from-indigo-950 via-rose-600 to-indigo-950'} text-white ${n.footerFontSize || 'text-[8.5px]'} py-2 px-8 flex flex-col gap-1 -mx-10 -mb-8 font-serif`}>
                          <div className="flex justify-between items-center">
                            <div>📧 {n.footerEmail}</div>
                            <div>📘 {n.footerSocial}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>📍 {n.footerAddress}</div>
                            <div>🌐 {n.footerWeb}</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={`mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 ${darkMode ? 'bg-slate-900/75 border-slate-800 text-slate-300' : 'bg-white/70 border-slate-200 text-slate-500'} border px-6 py-4 rounded-2xl backdrop-blur-md shadow-lg font-sans`}>
                
                <div className="text-xs">
                  Showing <span className={`${darkMode ? 'text-emerald-400' : 'text-blue-600'} font-semibold`}>{startIndex + 1}</span> to <span className={`${darkMode ? 'text-emerald-400' : 'text-blue-600'} font-semibold`}>{Math.min(startIndex + itemsPerPage, filteredNotices.length)}</span> of <span className={`${darkMode ? 'text-white' : 'text-slate-800'} font-semibold`}>{filteredNotices.length}</span> notices
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'} border text-xs font-medium disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                              currentPage === pageNum
                                ? `${darkMode ? 'bg-emerald-600' : 'bg-blue-600'} text-white font-bold scale-105 shadow-emerald-500/25`
                                : `${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'} border`
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'} border text-xs font-medium disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm`}
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
  );
};

export default NoticeView;