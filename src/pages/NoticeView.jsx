import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { FileText, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const NoticeView = ({ darkMode, setDarkMode, user, handleLogout }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = notices.slice(startIndex, startIndex + itemsPerPage);

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
    <div className={`min-h-screen w-full overflow-x-hidden ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-slate-900'} font-serif pb-20`}>
      
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        user={user} 
        handleLogout={handleLogout} 
      />

      <div className="max-w-4xl mx-auto px-2 sm:px-6 pt-24 w-full">
        
        {notices.length === 0 ? (
          <div className={`${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/70 border-slate-200'} border rounded-2xl p-8 text-center space-y-2 backdrop-blur-md shadow-lg`}>
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>No Documents Found</h3>
          </div>
        ) : (
          <>
            <div className="space-y-6 flex flex-col items-center w-full">
              {currentNotices.map((n) => (
                <div key={n._id} className="w-full flex flex-col items-center group">
                  
                  {/* Fully Responsive Compact A4 Scale Container */}
                  <div className="w-full flex justify-center overflow-x-auto py-1">
                    <div className="w-[794px] h-[1123px] min-w-[794px] scale-[0.42] sm:scale-[0.68] lg:scale-100 origin-top my-[-320px] sm:my-[-180px] lg:my-0 bg-white text-slate-900 px-10 pt-0 pb-8 shadow-2xl rounded-xl border border-slate-300 flex flex-col justify-between relative overflow-hidden font-serif">
                      
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
              <div className={`mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 ${darkMode ? 'bg-slate-900/75 border-slate-800 text-slate-300' : 'bg-white/70 border-slate-200 text-slate-500'} border px-4 py-3 rounded-xl backdrop-blur-md shadow-lg font-sans w-full`}>
                
                <div className="text-[11px]">
                  Showing <span className={`${darkMode ? 'text-emerald-400' : 'text-blue-600'} font-semibold`}>{startIndex + 1}</span> to <span className={`${darkMode ? 'text-emerald-400' : 'text-blue-600'} font-semibold`}>{Math.min(startIndex + itemsPerPage, notices.length)}</span> of <span className={`${darkMode ? 'text-white' : 'text-slate-800'} font-semibold`}>{notices.length}</span> notices
                </div>

                <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'} border text-[11px] font-medium disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
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
                            className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center shadow-sm ${
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
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'} border text-[11px] font-medium disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm`}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
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