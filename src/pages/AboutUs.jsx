import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Compass, MapPin, Phone, Mail } from 'lucide-react';

const AboutUs = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/about');
      if (res.data) {
        setAbout(res.data);
      }
    } catch (err) {
      console.error("Error fetching about data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto slide effect for full-width banners
  useEffect(() => {
    if (about && about.banners && about.banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % about.banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [about]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-medium text-sm transition-colors duration-300 ${darkMode ? 'bg-[#0A0D14] text-slate-400' : 'bg-[#FAFAFB] text-slate-500'}`}>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!about) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-medium text-sm transition-colors duration-300 ${darkMode ? 'bg-[#0A0D14] text-rose-400' : 'bg-[#FAFAFB] text-rose-600'}`}>
        Failed to load About Us data.
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0D14] text-slate-100 selection:bg-indigo-500 selection:text-white' : 'bg-[#FAFAFB] text-slate-900 selection:bg-indigo-600 selection:text-white'} relative pb-32 font-sans overflow-x-hidden antialiased transition-colors duration-500`}>

      {/* Cinematic Hero Banner */}
      {about.banners && about.banners.length > 0 ? (
        <div className="relative w-full h-[520px] md:h-[640px] overflow-hidden bg-slate-950 shadow-2xl">
          <img 
            src={about.banners[currentBanner]} 
            alt="Club Banner" 
            className="w-full h-full object-cover object-center transition-all duration-1000 ease-out scale-105 opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/60 via-transparent to-transparent"></div>
          
          <div className="absolute inset-0 flex items-end pb-16 md:pb-20 px-6 md:px-16">
            <div className="max-w-6xl mx-auto w-full relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-white text-xs font-semibold tracking-wider uppercase shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span> 
                Official Club Profile
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white max-w-4xl leading-[1.1]">
                {about.title}
              </h1>
              <p className="text-slate-300 text-base md:text-lg font-normal max-w-2xl leading-relaxed">
                {about.subtitle || about.description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`w-full py-32 md:py-40 text-center shadow-inner relative overflow-hidden ${darkMode ? 'bg-gradient-to-b from-indigo-950/40 to-slate-950 border-b border-slate-800/50' : 'bg-gradient-to-b from-indigo-50/60 to-white border-b border-indigo-100/50'}`}>
          <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-4">
            <h1 className={`text-4xl md:text-6xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{about.title}</h1>
            <p className={`text-base md:text-lg font-normal max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{about.subtitle || about.description}</p>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20 md:pt-28 space-y-24 md:space-y-32 relative z-10">
        
        {/* Overview Description Box */}
        {about.description && (
          <div className={`max-w-3xl mx-auto text-center p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-2xl border transition-all duration-300 relative ${
            darkMode 
              ? 'bg-slate-900/60 border-slate-800/80 text-slate-200 shadow-black/40' 
              : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-slate-200/50'
          }`}>
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-md">
              Overview
            </div>
            <p className="text-lg md:text-xl font-normal leading-relaxed pt-2">
              {about.description}
            </p>
          </div>
        )}

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Mission Panel */}
          <div className={`p-8 md:p-10 rounded-[2.5rem] shadow-xl backdrop-blur-2xl border transition-all duration-300 group relative overflow-hidden ${
            darkMode 
              ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/40 shadow-black/40' 
              : 'bg-white/80 border-slate-200/80 hover:border-indigo-300 shadow-slate-200/50'
          }`}>
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-6 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
              <Target size={22} />
            </div>
            <h3 className={`text-2xl font-semibold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Our Mission
            </h3>
            <p className={`leading-relaxed text-base md:text-lg font-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {about.mission}
            </p>
          </div>

          {/* Vision Panel */}
          <div className={`p-8 md:p-10 rounded-[2.5rem] shadow-xl backdrop-blur-2xl border transition-all duration-300 group relative overflow-hidden ${
            darkMode 
              ? 'bg-slate-900/60 border-slate-800/80 hover:border-blue-500/40 shadow-black/40' 
              : 'bg-white/80 border-slate-200/80 hover:border-blue-300 shadow-slate-200/50'
          }`}>
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
              <Compass size={22} />
            </div>
            <h3 className={`text-2xl font-semibold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Our Vision
            </h3>
            <p className={`leading-relaxed text-base md:text-lg font-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {about.vision}
            </p>
          </div>

        </div>

        {/* Stats Counter Section */}
        {about.features && about.features.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {about.features.map((feat, index) => (
              <div 
                key={index} 
                className={`p-6 md:p-8 rounded-[2rem] border backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-[1.02] text-center group ${
                  darkMode 
                    ? 'bg-slate-900/50 border-slate-800/80 hover:border-indigo-500/40 shadow-black/30 text-slate-100' 
                    : 'bg-white/70 border-slate-200/80 hover:border-indigo-300 shadow-slate-200/40 text-slate-900'
                }`}
              >
                <h4 className="text-3xl md:text-4xl font-bold text-indigo-600 tracking-tight group-hover:scale-105 transition-transform duration-300">{feat.title}</h4>
                <p className={`text-xs md:text-sm font-medium mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{feat.subtitle}</p>
              </div>
            ))}
          </div>
        )}

        {/* Journey / Timeline Section */}
        {about.detailsSections && about.detailsSections.length > 0 && (
          <div className="space-y-16">
            <div className="text-center space-y-3">
              <span className={`inline-block text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${
                darkMode ? 'bg-indigo-950/50 border-indigo-800/60 text-indigo-400' : 'bg-indigo-50 border-indigo-200/60 text-indigo-600'
              }`}>
                Milestones
              </span>
              <h2 className={`text-3xl md:text-4xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Our Journey
              </h2>
            </div>

            {/* Central Timeline Container */}
            <div className="relative max-w-4xl mx-auto">
              <div className={`absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`}></div>

              <div className="space-y-8 md:space-y-12">
                {about.detailsSections.map((sec, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div key={sec.id || idx} className={`relative flex items-center w-full pl-10 md:pl-0 ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                      
                      <div className={`absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-600 border-4 ${darkMode ? 'border-[#0A0D14]' : 'border-[#FAFAFB]'} shadow-md z-10`}></div>

                      <div className={`w-full md:w-[calc(50%-32px)] ${isEven ? 'md:pr-2' : 'md:pl-2'}`}>
                        <div className={`p-6 md:p-8 rounded-[2.5rem] shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.01] border ${
                          darkMode 
                            ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/40 shadow-black/40' 
                            : 'bg-white/80 border-slate-200/80 hover:border-indigo-300 shadow-slate-200/50'
                        }`}>
                          <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase mb-3 border ${
                            darkMode ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          }`}>
                            {sec.heading}
                          </span>
                          <h3 className={`text-lg md:text-xl font-semibold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {sec.subheading}
                          </h3>
                          <p className={`text-sm md:text-base leading-relaxed font-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {sec.text}
                          </p>
                          {sec.imageUrl && (
                            <div className="pt-4 overflow-hidden rounded-2xl">
                              <img 
                                src={sec.imageUrl} 
                                alt="Journey visual" 
                                className={`h-48 md:h-56 w-full object-cover rounded-2xl shadow-sm border ${darkMode ? 'border-slate-800' : 'border-slate-100'}`} 
                              />
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Full-Width Premium Footer Panel */}
      <div className={`w-full border-t backdrop-blur-2xl py-16 px-6 md:px-16 mt-32 shadow-2xl relative z-20 transition-colors duration-500 ${
        darkMode ? 'bg-slate-950/90 border-slate-800/80 text-slate-100' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Club Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 tracking-widest uppercase">
              {about.contact?.companyName || about.title || "Club Info"}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              {about.contact?.shortDescription || about.subtitle || about.description || "Empowering members through sports and physical fitness."}
            </p>
          </div>

          {/* Column 2: Contact Us Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} /> Contact Us
            </h3>
            <div className="space-y-3 text-sm text-slate-300 font-normal">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{about.contact?.address || 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} className="text-indigo-400 shrink-0" />
                <span>{about.contact?.email || 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-indigo-400 shrink-0" />
                <span>{about.contact?.phone || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Column 3: Follow Us & Social Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Follow Us</h3>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {about.contact?.socialLinks && about.contact.socialLinks.length > 0 ? (
                about.contact.socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-medium hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center active:scale-95"
                  >
                    {social.platform}
                  </a>
                ))
              ) : (
                <span className="text-xs text-slate-500">No social links added yet.</span>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-12 pt-8 text-center text-xs text-slate-500 font-normal">
          {about.contact?.copyright || `© ${new Date().getFullYear()} ${about.title || "Club"}. All rights reserved.`}
        </div>
      </div>

    </div>
  );
};

export default AboutUs;