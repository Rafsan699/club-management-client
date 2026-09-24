import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DepartmentsSection from '../components/DepartmentsSection';
import Footer from '../components/Footer';
import { exploreMenuTree } from '../data/exploreMenuData';
import { 
  Trophy, Lock, LogIn, UserPlus, User, LogOut, ChevronDown, Compass, ChevronRight, X, Sparkles, Target, Activity, Flame, Shield, Calendar, Award, Globe, Zap, ArrowRight, Sun, Moon, MapPin, Phone, Mail 
} from 'lucide-react';

const Home = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const [showEventModal, setShowEventModal] = useState(false);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('clubUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    API.get('/api/club/content')
      .then(res => {
        if (res.data) {
          setContent(res.data);
        }
      })
      .catch(err => {
        console.error("Error fetching content:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const defaultBanners = [
    {
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c6232660102?auto=format&fit=crop&w=1920&q=80",
      title: content?.clubTitle || 'BRIU Sports Club',
      subtitle: "Unleashing athletic excellence, fostering discipline, and building the future champions.",
      link: "/news"
    }
  ];

  const activeBanners = (content?.banners && content.banners.length > 0) ? content.banners : defaultBanners;

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    }, 2000);

    return () => clearInterval(slideTimer);
  }, [activeBanners.length]);

  const handleLogout = () => {
    localStorage.removeItem('clubUser');
    setUser(null);
    setShowDropdown(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] px-4">
        <div className="flex items-center gap-4 text-[#0F172A]">
          <div className="w-9 h-9 border-[3px] border-[#2563EB] border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span className="text-base font-medium">Loading club content…</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] px-4">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] px-8 py-7 text-center max-w-md w-full shadow-sm">
          <p className="text-[#0F172A] font-semibold mb-2 text-xl">Connection error</p>
          <span className="text-sm text-[#64748B]">Content could not be loaded from the server. Check the backend connection and reload.</span>
        </div>
      </div>
    );
  }

  const rawMembers = Array.isArray(content.members) ? [...content.members] : [];
  
  const pIndex = rawMembers.findIndex(m => m.role && m.role.toLowerCase().includes('president') && !m.role.toLowerCase().includes('vice'));
  const vpIndex = rawMembers.findIndex(m => m.role && m.role.toLowerCase().includes('vice president'));

  if (pIndex !== -1 && vpIndex !== -1 && vpIndex < pIndex) {
    const temp = rawMembers[pIndex];
    rawMembers[pIndex] = rawMembers[vpIndex];
    rawMembers[vpIndex] = temp;
  }

  const firstRow = rawMembers.slice(0, 3);
  const secondRow = rawMembers.slice(3, 7);
  const thirdRow = rawMembers.slice(7, 10);

  const currentBanner = activeBanners[currentSlideIndex] || activeBanners[0];

  const fallbackImg = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  const renderMember = (member, key, extra = '', highlight = false) => (
    <div key={key} className={`group ${extra}`}>
      <div className={`relative overflow-hidden rounded-2xl aspect-[4/5] b-surf2 shadow-sm ${highlight ? 'ring-2 ring-[var(--acc)] ring-offset-4 ring-offset-[var(--bg)]' : ''}`}>
        <img
          src={member.img || fallbackImg}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <h5 className="fd text-lg sm:text-xl font-semibold mt-4 leading-tight text-[#0F172A]">{member.name}</h5>
      <p className="text-sm font-medium b-acc mt-1">{member.role}</p>
      <p className="text-sm b-mute mt-0.5">{member.dept}</p>
    </div>
  );

  return (
    <div className={`briu min-h-screen ${content.flashNews ? 'pb-14' : ''} selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden transition-colors duration-300`}>

      {showExploreMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-start pt-20 px-4" onClick={() => setShowExploreMenu(false)}>
          <div onClick={(e) => e.stopPropagation()} className="briu-menu w-full max-w-sm rounded-3xl shadow-2xl border b-line b-surf p-3 sm:ml-[max(0px,calc((100vw-72rem)/2))]">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="fd text-lg font-semibold">Explore</span>
              <button onClick={() => setShowExploreMenu(false)} aria-label="Close menu" className="p-2 rounded-full hover:bg-[var(--surf2)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-medium">
              {[['#', 'Home'], ['#about', 'About'], ['#committee', 'Club & team'], ['#activities', 'Events'], ['#contact', 'Contact']].map(([href, label]) => (
                <a key={label} href={href} onClick={() => setShowExploreMenu(false)} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[var(--acc)] hover:text-white transition">
                  {label} <ChevronRight className="w-4 h-4 opacity-50" />
                </a>
              ))}
              <Link to="/news" onClick={() => setShowExploreMenu(false)} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[var(--acc)] hover:text-white transition">
                Newsfeed <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative isolate min-h-[100svh] flex items-end overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 -z-10">
          {activeBanners.map((b, idx) => (
            <img
              key={idx}
              src={b.imageUrl || b.bannerImage}
              alt=""
              className={`hero-img absolute inset-0 w-full h-full object-cover ${idx === currentSlideIndex ? 'on' : ''}`}
            />
          ))}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,.95) 0%, rgba(15,23,42,.6) 45%, rgba(15,23,42,.35) 100%)' }}></div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 pt-40 pb-16 sm:pb-20">
          <p className="rise flex items-center gap-3 text-sm sm:text-base text-white/80 mb-6 font-medium">
            <span className="w-8 h-[3px] rounded bg-[var(--acc)]"></span>
            Brahmaputra International University Sports Club
          </p>

          <h1 className="rise fd font-extrabold leading-[.92] max-w-5xl text-[clamp(2.75rem,9vw,7rem)] tracking-tight text-white" style={{ animationDelay: '.1s' }}>
            {currentBanner.title || content.clubTitle || 'BRIU Sports Club'}
          </h1>

          <p className="rise text-slate-300 text-base sm:text-xl max-w-xl leading-relaxed mt-6 font-normal" style={{ animationDelay: '.2s' }}>
            {currentBanner.subtitle || "Unleashing athletic excellence, fostering discipline, and building the future champions of Brahmaputra International University."}
          </p>

          <div className="rise mt-9 flex flex-col sm:flex-row gap-3" style={{ animationDelay: '.3s' }}>
            {currentBanner.link ? (
              <a href={currentBanner.link} className="px-7 py-3.5 rounded-full bg-[var(--acc)] hover:opacity-95 text-white font-semibold text-sm sm:text-base transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                Explore more <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link to="/news" className="px-7 py-3.5 rounded-full bg-[var(--acc)] hover:opacity-95 text-white font-semibold text-sm sm:text-base transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                Explore newsfeed <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link to="/founders" className="px-7 py-3.5 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition flex items-center justify-center">
              Founders panel
            </Link>
          </div>

          {activeBanners.length > 1 && (
            <div className="flex items-center gap-4 mt-12">
              <div className="flex items-center gap-2">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-[3px] rounded-full transition-all duration-500 ${currentSlideIndex === idx ? 'w-14 bg-[var(--acc)]' : 'w-6 bg-white/30 hover:bg-white/60'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <span className="text-sm text-white/60 tabular-nums">{currentSlideIndex + 1} / {activeBanners.length}</span>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 space-y-24 sm:space-y-36">

        {/* ABOUT */}
        <section id="about" className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-[var(--deep)] text-[var(--acc)] mb-6 shadow-sm">
              <Trophy className="w-6 h-6" />
            </span>
            <h2 className="fd text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1] text-[#0F172A]">Core mission &amp; objectives</h2>
          </div>

          <div className="lg:col-span-7 space-y-14">
            <div>
              <h3 className="flex items-center gap-2.5 text-sm font-semibold b-mute mb-4 uppercase tracking-wider">
                <Target className="w-4 h-4 b-acc" /> Our objective
              </h3>
              <p className="fd text-2xl sm:text-3xl font-medium leading-snug max-w-2xl text-[#1E293B]">
                {content.objective || 'Promoting sports and physical fitness among students.'}
              </p>
            </div>

            <div id="activities">
              <h3 className="flex items-center gap-2.5 text-sm font-semibold b-mute mb-2 uppercase tracking-wider">
                <Activity className="w-4 h-4 b-acc" /> Major activities
              </h3>
              <ul className="border-t b-line">
                {content.activities && content.activities.length > 0 ? (
                  content.activities.map((act, idx) => (
                    <li key={idx} className="act-row flex items-center justify-between gap-4 py-5 border-b b-line text-base sm:text-lg font-medium text-[#1E293B]">
                      <span className="break-words">{act}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 b-acc act-arrow" />
                    </li>
                  ))
                ) : (
                  <li className="flex items-center justify-between gap-4 py-5 border-b b-line text-base sm:text-lg font-medium text-[#1E293B]">
                    <span>Annual Sports Tournament</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* COMMITTEE */}
        <section id="committee">
          <div className="max-w-2xl mb-14 sm:mb-20">
            <span className="inline-block text-sm font-semibold text-white bg-[var(--acc)] px-3.5 py-1 rounded-full mb-5 shadow-sm">Congratulations</span>
            <h2 className="fd text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1] text-[#0F172A]">
              {content.committeeHeader || 'Executive Committee 2026'}
            </h2>
          </div>

          {content.moderator?.name && (
            <div className="mb-16 sm:mb-24 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 rounded-3xl b-surf border b-line p-5 sm:p-8 shadow-sm">
              <img
                src={content.moderator.image || fallbackImg}
                alt={content.moderator.name}
                className="w-40 h-48 sm:w-48 sm:h-56 rounded-2xl object-cover shrink-0 shadow-sm"
              />
              <div>
                <p className="text-sm font-semibold b-acc mb-2 tracking-wide uppercase text-xs">{content.moderator.role}</p>
                <h4 className="fd text-3xl sm:text-4xl font-bold leading-tight text-[#0F172A]">{content.moderator.name}</h4>
                <p className="text-base mt-3 font-medium text-[#334155]">{content.moderator.designation || 'BRIUSC'}</p>
                <p className="text-base b-mute mt-0.5">{content.moderator.dept}</p>
              </div>
            </div>
          )}

          <div className="space-y-14 sm:space-y-20">
            {firstRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-12 items-end">
                {(() => {
                  const sortedRow = [...firstRow];
                  const pIdx = sortedRow.findIndex(m => m.role && m.role.toLowerCase().includes('president') && !m.role.toLowerCase().includes('vice'));
                  const vpIdx = sortedRow.findIndex(m => m.role && m.role.toLowerCase().includes('vice president'));
                  
                  if (pIdx !== -1 && vpIdx !== -1) {
                    const president = sortedRow[pIdx];
                    const vicePresident = sortedRow[vpIdx];
                    const other = sortedRow.filter((_, i) => i !== pIdx && i !== vpIdx)[0];
                    
                    return [
                      { member: vicePresident, orderClass: 'order-2 sm:order-1', highlight: false },
                      { member: president, orderClass: 'order-1 sm:order-2 sm:-translate-y-8', highlight: true },
                      { member: other, orderClass: 'order-3 sm:order-3', highlight: false }
                    ];
                  }
                  return sortedRow.map(m => ({ member: m, orderClass: '', highlight: false }));
                })().map(({ member, orderClass, highlight }, idx) => {
                  if (!member) return null;
                  return renderMember(member, idx, orderClass, highlight);
                })}
              </div>
            )}

            {secondRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {secondRow.map((member, idx) => renderMember(member, idx))}
              </div>
            )}

            {thirdRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-12">
                {thirdRow.map((member, idx) => renderMember(member, idx))}
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING EVENT */}
        {content.upcomingEvent && (content.upcomingEvent.title || content.upcomingEvent.bannerUrl) && (
          <section className={`rounded-[2rem] overflow-hidden bg-[#0F172A] text-white grid shadow-xl ${content.upcomingEvent.bannerUrl ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
            {content.upcomingEvent.bannerUrl && (
              <div className="overflow-hidden bg-black/20 min-h-[260px]">
                <img
                  src={content.upcomingEvent.bannerUrl}
                  alt="Upcoming Event Banner"
                  className="w-full h-full object-contain sm:object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}

            <div className="p-7 sm:p-12 lg:p-14 flex flex-col justify-center gap-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--acc)] uppercase tracking-wider text-xs">
                <Calendar className="w-4 h-4" /> Upcoming event
              </p>

              <h3 className="fd text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] text-white">
                {content.upcomingEvent.title || 'Exciting Event Coming Up!'}
              </h3>

              <p className="text-slate-300 leading-relaxed max-w-lg">
                {content.upcomingEvent.description || 'Stay tuned for more details regarding our upcoming sports event and activities.'}
              </p>

              <div className="border-t border-white/10">
                {content.upcomingEvent.date && (
                  <div className="flex items-center gap-3 py-4 border-b border-white/10 text-sm sm:text-base">
                    <Calendar className="w-4 h-4 text-[var(--acc)] shrink-0" />
                    <span className="text-white/60 w-20 shrink-0">Date</span> {content.upcomingEvent.date}
                  </div>
                )}
                {content.upcomingEvent.location && (
                  <div className="flex items-center gap-3 py-4 border-b border-white/10 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 text-[var(--acc)] shrink-0" />
                    <span className="text-white/60 w-20 shrink-0">Location</span> {content.upcomingEvent.location}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0F172A] font-semibold text-sm hover:bg-slate-100 transition shadow-sm cursor-pointer"
                >
                  View details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* DEPARTMENTS */}
        <div className="overflow-x-hidden">
          <div>
            <DepartmentsSection departments={content?.departments} />
          </div>
        </div>
      </main>

      {/* EVENT DETAILS MODAL */}
      {showEventModal && content.upcomingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowEventModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="briu-modal relative w-full max-w-2xl max-h-[90vh] overflow-y-auto b-surf rounded-3xl shadow-2xl border b-line p-6 sm:p-8 custom-scrollbar">

            <div className="flex items-center justify-between pb-4 border-b b-line mb-6">
              <h3 className="fd text-xl sm:text-2xl font-bold text-[#0F172A]">Event details</h3>
              <button onClick={() => setShowEventModal(false)} aria-label="Close" className="w-10 h-10 grid place-items-center rounded-full hover:bg-[var(--surf2)] transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {content.upcomingEvent.bannerUrl && (
                <div className="rounded-2xl overflow-hidden b-surf2 border border-[#E2E8F0]">
                  <img src={content.upcomingEvent.bannerUrl} alt="Event Banner" className="w-full h-auto max-h-[300px] object-contain" />
                </div>
              )}

              <div className="space-y-3">
                <h4 className="fd text-2xl sm:text-3xl font-bold leading-tight text-[#0F172A]">{content.upcomingEvent.title}</h4>
                <p className="leading-relaxed b-mute">{content.upcomingEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.upcomingEvent.date && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl b-surf2 border border-[#E2E8F0]">
                    <Calendar className="w-5 h-5 b-acc shrink-0" />
                    <div>
                      <p className="text-xs b-mute">Date</p>
                      <p className="text-sm font-semibold text-[#0F172A]">{content.upcomingEvent.date}</p>
                    </div>
                  </div>
                )}
                {content.upcomingEvent.location && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl b-surf2 border border-[#E2E8F0]">
                    <MapPin className="w-5 h-5 b-acc shrink-0" />
                    <div>
                      <p className="text-xs b-mute">Location</p>
                      <p className="text-sm font-semibold text-[#0F172A]">{content.upcomingEvent.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONTACT / FOOTER */}
      <div id="contact" className="w-full bg-[#0F172A] text-white pt-16 sm:pt-24 pb-8 px-5 sm:px-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <h3 className="fd text-[clamp(2.25rem,7vw,5.5rem)] font-extrabold leading-[.95] max-w-4xl text-white">
            {content.contact?.companyName || content.clubTitle || "Club Info"}
          </h3>
          <p className="text-slate-300 leading-relaxed max-w-xl mt-5">
            {content.contact?.shortDescription || content.objective || "Empowering members through sports and physical fitness."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-14 pt-10 border-t border-white/10">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--acc)] flex items-center gap-2 uppercase tracking-wider text-xs">
                <Phone size={15} /> Contact us
              </h3>
              <div className="space-y-3 text-sm sm:text-base text-slate-200">
                <p className="flex items-start gap-3">
                  <MapPin size={16} className="text-[var(--acc)] shrink-0 mt-1" />
                  <span className="break-all sm:break-normal">{content.contact?.address || content.address || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail size={16} className="text-[var(--acc)] shrink-0" />
                  <span className="break-all sm:break-normal">{content.contact?.email || content.email || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone size={16} className="text-[var(--acc)] shrink-0" />
                  <span className="break-all sm:break-normal">{content.contact?.phone || content.phone || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--acc)] uppercase tracking-wider text-xs">Follow us</h3>
              <div className="flex flex-wrap gap-2.5">
                {content.contact?.socialLinks && content.contact.socialLinks.length > 0 ? (
                  content.contact.socialLinks.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full border border-white/20 text-sm hover:bg-white hover:text-[#0F172A] transition font-medium"
                    >
                      {social.platform}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No social links added yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-14 pt-6 border-t border-white/10 text-sm text-slate-400">
            {content.contact?.copyright || `© ${new Date().getFullYear()} ${content.clubTitle || "Club"}. `}
          </div>
        </div>
      </div>

      {/* FLASH NEWS TICKER */}
      {content.flashNews && (
        <div className="fixed bottom-0 inset-x-0 bg-[#0F172A]/95 backdrop-blur-xl text-white text-sm py-2.5 px-4 sm:px-8 flex items-center gap-4 z-50 border-t border-white/10 shadow-lg">
          <span className="bg-[var(--acc)] text-white font-semibold px-3 py-1 rounded-full text-xs shrink-0 z-10 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-current shrink-0" /> Live news
          </span>
          <div className="w-full overflow-hidden whitespace-nowrap relative">
            <div className="inline-block animate-marquee text-slate-200">
              {content.flashNews}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400..700&display=swap');

        html { scroll-behavior: smooth; scroll-padding-top: 3rem; }
        body { overflow-x: hidden; }

        .briu {
          --bg: #FAFAFC; --surf: #FFFFFF; --surf2: #F1F5F9;
          --ink: #0F172A; --mute: #64748B; --line: #E2E8F0;
          --acc: #2563EB; --deep: #0F172A;
          font-family: 'Figtree', system-ui, sans-serif;
          background: var(--bg); color: var(--ink);
        }
        .briu .fd { font-family: 'Bricolage Grotesque', 'Figtree', system-ui, sans-serif; letter-spacing: -0.03em; }
        .briu .b-surf { background: var(--surf); }
        .briu .b-surf2 { background: var(--surf2); }
        .briu .b-line { border-color: var(--line); }
        .briu .b-mute { color: var(--mute); }
        .briu .b-acc { color: var(--acc); }
        
        .briu p, .briu h1, .briu h2, .briu h3, .briu h4, .briu h5 { overflow-wrap: break-word; }
        .briu img { max-width: 100%; }
        .briu a:focus-visible, .briu button:focus-visible { outline: 2px solid var(--acc); outline-offset: 3px; }

        /* Modal + menu sit inside .briu so they inherit the tokens */
        .briu-modal, .briu-menu { color: var(--ink); }

        .hero-img { opacity: 0; transform: scale(1.06); transition: opacity .9s ease, transform 6s ease-out; }
        .hero-img.on { opacity: 1; transform: scale(1); }

        .rise { animation: rise .9s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }

        .act-row .act-arrow { opacity: 0; transform: translateX(-8px); transition: all .25s ease; }
        .act-row:hover .act-arrow { opacity: 1; transform: none; }

        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; animation: marquee 25s linear infinite; will-change: transform; }
        .animate-marquee:hover { animation-play-state: paused; }

        .custom-scrollbar { overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, .3); border-radius: 10px; }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

    </div>
  );
};

export default Home;