import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Founders = () => {
  const [founders, setFounders] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/api/founders/list')
      .then(res => {
        setFounders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching founders:", err);
        setError("Failed to load founders.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black tracking-[0.25em] uppercase text-slate-500 animate-pulse">Loading Founding Panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="bg-red-50 border border-red-200 p-6 sm:p-8 rounded-[2rem] text-center max-w-md w-full space-y-4 shadow-xl">
          <p className="text-red-600 font-bold text-sm tracking-wide">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* Ultra-Modern Professional Light Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-[#f1f5f9] text-slate-900 pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-8 lg:px-16 border-b border-slate-200">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-5 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] mx-auto sm:mx-0 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>BRIUSC</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 uppercase leading-[1.15]">
            BRIU Sports Club  <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              Founders Panel
            </span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm lg:text-base max-w-2xl font-normal leading-relaxed mx-auto sm:mx-0">
            Founding Panel — BRIU Sports Club

Founded in 2026, BRIU Sports Club was established with a vision to foster sportsmanship, leadership, teamwork, and a strong athletic culture within the university community. The Founding Panel represents the dedicated individuals who laid the foundation of the club and shaped its early vision, values, and direction. Their commitment marks the beginning of a journey toward excellence in university sports and a lasting legacy for future generations.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full px-4 sm:px-8 lg:px-16 py-12 sm:py-20 space-y-16 sm:space-y-28 max-w-6xl mx-auto">
        
        {/* Editorial Alternating Leadership Stream */}
        <div className="space-y-16 sm:space-y-24">
          {founders.map((founder, index) => {
            const isEven = index % 2 === 0;
            const sequenceNum = String(index + 1).padStart(2, '0');

            return (
              <div 
                key={founder._id}
                className={`flex flex-col lg:flex-row items-center gap-6 sm:gap-10 lg:gap-16 ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Responsive Portrait Component */}
                <div className="w-full lg:w-5/12 relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/15 to-indigo-600/15 rounded-[2.2rem] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div 
                    onClick={() => setSelectedFounder(founder)}
                    className="relative cursor-pointer overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-lg aspect-[4/5] w-full"
                  >
                    {/* Editorial Index Badge */}
                    <div className="absolute top-3.5 left-3.5 z-25 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white font-black text-[10px] px-3 py-1 rounded-full tracking-widest shadow-md">
                      {sequenceNum} // FOUNDER
                    </div>

                    <img 
                      src={founder.img} 
                      alt={founder.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5 sm:p-6">
                      <span className="w-full text-center sm:text-left text-white text-[11px] font-bold tracking-wider uppercase bg-blue-600 hover:bg-blue-700 py-2.5 px-4 rounded-xl shadow-md transition-colors">
                        View Full Profile →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Block */}
                <div className="w-full lg:w-7/12 space-y-5 text-center sm:text-left">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {founder.dept && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-block">
                          Dept. of {founder.dept}
                        </span>
                      )}
                      {founder.batch && (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 inline-block shadow-sm">
                          Batch: {founder.batch}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight break-words">
                      {founder.name}
                    </h2>
                  </div>

                  <div className="border-t border-slate-200 pt-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {founder.email && (
                        <div className="bg-white/80 backdrop-blur border border-slate-200 p-3.5 rounded-xl space-y-0.5 text-left shadow-sm">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                          <p className="text-xs font-semibold text-blue-600 break-all">{founder.email}</p>
                        </div>
                      )}
                      {founder.phone && (
                        <div className="bg-white/80 backdrop-blur border border-slate-200 p-3.5 rounded-xl space-y-0.5 text-left shadow-sm">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Number</p>
                          <p className="text-xs font-semibold text-slate-800 break-all">{founder.phone}</p>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => setSelectedFounder(founder)}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 font-extrabold text-[11px] uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      <span>Explore Profile Details</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Founding Legacy Section */}
        <div className="border-t border-slate-200 pt-16 sm:pt-24 space-y-10">
          <div className="text-center space-y-2.5 max-w-lg mx-auto">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm inline-block">
              Historical Timeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
              Our Founding Legacy
            </h2>
            <p className="text-slate-600 text-xs">
              Milestones that shaped the foundation of BRIU Sports Club.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2.5 hover:border-blue-300 transition-colors shadow-sm">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block">2026</span>
              <h3 className="text-sm font-bold text-slate-900">Club Founded</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Official establishment of BRIU Sports Club to promote campus athletics.</p>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2.5 hover:border-blue-300 transition-colors shadow-sm">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block">2026</span>
              <h3 className="text-sm font-bold text-slate-900">Founding Panel Established</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Core founding committee takes charge of organizational structure and vision.</p>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2.5 hover:border-blue-300 transition-colors shadow-sm">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block">2026</span>
              <h3 className="text-sm font-bold text-slate-900">First Major Activities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Initiation of departmental sports events and recruitment drives.</p>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2.5 hover:border-blue-300 transition-colors shadow-sm">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block">Future</span>
              <h3 className="text-sm font-bold text-slate-900">Growth & Development</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Continuous expansion toward premier inter-university sports participation.</p>
            </div>
          </div>
        </div>

      </div>

      {/* 100% Mobile Responsive Profile Modal */}
      {selectedFounder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-7 max-w-sm sm:max-w-md w-full relative space-y-5 shadow-2xl my-auto">
            <button 
              onClick={() => setSelectedFounder(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 font-bold text-xs w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200"
            >
              ✕
            </button>
            
            <div className="text-center space-y-3 pt-1">
              <img 
                src={selectedFounder.img} 
                alt={selectedFounder.name} 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl object-cover mx-auto shadow-md border-2 border-slate-100" 
              />
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 break-words">{selectedFounder.name}</h3>
                <p className="font-extrabold text-[11px] uppercase tracking-wider text-blue-600">
                  {selectedFounder.batch ? `Batch: ${selectedFounder.batch}` : ''}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-800 uppercase text-right">{selectedFounder.dept || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Batch</span>
                <span className="font-bold text-blue-600 text-right">{selectedFounder.batch || 'N/A'}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-2.5 gap-1">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-semibold text-blue-600 break-all sm:text-right">{selectedFounder.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Phone</span>
                <span className="font-semibold text-slate-800 text-right">{selectedFounder.phone || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedFounder(null)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Founders;