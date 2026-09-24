import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { useParams } from 'react-router-dom';

const CommitteeDetails = ({ darkMode, setDarkMode, user, handleLogout }) => {
  const { id } = useParams();
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  // স্ক্রল করে হাইড বা শো করার জন্য স্টেট
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/api/previous-committee/${id}`);
        setCommittee(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9] px-4">
        <div className="flex items-center gap-4 text-[#0B1220]">
          <div className="w-9 h-9 border-[3px] border-[#2563EB] border-t-transparent rounded-full animate-spin shrink-0"></div>
          <p className="text-lg font-semibold">Loading Committee Details...</p>
        </div>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9] px-4">
        <div className="bg-white border border-[#D6DDE8] rounded-3xl px-8 py-7 text-center max-w-md w-full">
          <p className="text-red-600 font-semibold">Committee not found.</p>
        </div>
      </div>
    );
  }

  const members = committee.members || [];

  // ১. মডারেটর ফিল্টার (রোল বা ক্যাটাগরি চেক করে)
  const moderator = members.find(m => 
    m.category?.toLowerCase().includes('moderator') || 
    m.role?.toLowerCase().includes('moderator')
  );

  // ২. ক্যাটাগরি বা রোলের ভিত্তিতে মেম্বার ফিল্টারিং
  const president = members.find(m => m.role?.toLowerCase().includes('president') && !m.role?.toLowerCase().includes('vice'));
  const vicePresident = members.find(m => m.role?.toLowerCase().includes('vice president'));
  const generalSecretary = members.find(m => m.role?.toLowerCase().includes('general secretary') || m.role?.toLowerCase().includes('gs'));

  // ৩. এই পদগুলোর বাইরে বাকি মেম্বারগণ
  const otherMembers = members.filter(m => 
    m !== moderator && m !== president && m !== vicePresident && m !== generalSecretary
  );

  // ৪. প্রথম সারির ৩ জনের স্পেশাল অ্যারে
  const topRowMembers = [vicePresident, president, generalSecretary].filter(Boolean);

  let sectionCounter = 0;
  const nextNum = () => String(++sectionCounter).padStart(2, '0');

  const sectionHead = (title, count) => (
    <div className="flex items-end justify-between gap-6 pb-5 border-b tm-line mb-10">
      <div>
        <span className="mono text-xs tm-acc">{nextNum()}</span>
        <h2 className="fd fd-cond text-4xl sm:text-6xl font-extrabold leading-none mt-2">{title}</h2>
      </div>
      <span className="mono text-xs tm-mute pb-1 shrink-0">{count} {count === 1 ? 'member' : 'members'}</span>
    </div>
  );

  const renderCard = (member, highlight = false) => {
    const memberImageSrc = member.img || member.image || "https://via.placeholder.com/150";
    return (
      <div onClick={() => setSelectedMember(member)} className="tm-card group cursor-pointer">
        <div className={`relative overflow-hidden rounded-2xl aspect-[4/5] tm-surf2 ${highlight ? 'ring-2 ring-[var(--acc)] ring-offset-4 ring-offset-[var(--bg)]' : ''}`}>
          <img src={memberImageSrc} alt={member.name} className="w-full h-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-105" />
          <i className="tm-br tl"></i><i className="tm-br tr"></i><i className="tm-br bl"></i><i className="tm-br brr"></i>
          <span className="tm-view mono text-[11px]">View profile ↗</span>
        </div>
        <div className="pt-4">
          <h3 className="fd text-lg font-semibold leading-tight truncate">{member.name}</h3>
          <p className="mono text-[11px] tm-acc mt-1.5 truncate">{member.role}</p>
          <p className="text-sm tm-mute mt-1 truncate">{member.department || member.dept}</p>
        </div>
      </div>
    );
  };

  const gridCls = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12';

  return (
    <div className={`tm ${darkMode ? 'dark' : ''} min-h-screen w-full antialiased selection:bg-blue-600 selection:text-white relative transition-colors duration-500`}>
      
      {/* Navbar: স্ক্রল ডাউনে হাইড এবং আপ করলে শো করার লজিকসহ */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} user={user} handleLogout={handleLogout} />
      </div>

      {/* HERO SECTION */}
      <header className="relative isolate overflow-hidden bg-[var(--deep)] text-white">
        <div className="tm-grid absolute inset-0 -z-10"></div>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-32 pb-14 sm:pt-40 sm:pb-20">
          <p className="rise mono text-xs sm:text-sm text-[#8FB0FF] flex items-center gap-3">
            <span className="w-10 h-px bg-current"></span> Session / Year: {committee.year}
          </p>
          <h1 className="rise fd fd-cond text-[clamp(2.5rem,8vw,7.5rem)] font-extrabold leading-[.9] mt-4" style={{ animationDelay: '.08s' }}>
            {committee.committeeName}
          </h1>
          <div className="rise flex flex-col md:flex-row md:items-end justify-between gap-8 mt-8" style={{ animationDelay: '.18s' }}>
            <p className="text-white/70 max-w-md text-base sm:text-lg leading-relaxed">
              Complete committee members and leadership details for this session.
            </p>
            <dl className="flex gap-12">
              <div>
                <dt className="mono text-xs text-white/50">Total Members</dt>
                <dd className="fd fd-cond text-5xl font-bold mt-1">{members.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <div className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-24 space-y-24 max-w-[1440px] mx-auto">
        {members.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No members found in this committee.</p>
        ) : (
          <div className="space-y-24">
            
            {/* CLUB MODERATOR SECTION (শুধু Moderator এবং নাম) */}
            {moderator && (
              <section className="scroll-mt-24">
                {sectionHead('Club Moderator', 1)}
                <div className="grid md:grid-cols-[minmax(0,360px)_1fr] rounded-3xl overflow-hidden bg-[var(--deep)] text-white shadow-xl">
                  <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[420px] overflow-hidden">
                    <img src={moderator.img || moderator.image || "https://via.placeholder.com/150"} alt={moderator.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center gap-4 relative">
                    <div className="tm-grid absolute inset-0 opacity-40 pointer-events-none"></div>
                    
                    {/* Moderator বড় অক্ষরে এবং নিচে নাম */}
                    <div className="relative space-y-2">
                      <p className="mono text-lg sm:text-xl text-[#8FB0FF] uppercase tracking-wider font-bold">Moderator</p>
                      <h3 className="fd fd-cond text-5xl sm:text-7xl font-extrabold leading-[0.95]">{moderator.name}</h3>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* COMMITTEE MEMBERS SECTION */}
            <section className="scroll-mt-24">
              {sectionHead(committee.committeeName, members.length)}

              {topRowMembers.length > 0 && (
                <div className="flex flex-col md:grid md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto items-end mb-16">
                  {topRowMembers.map((member) => {
                    const isPresidentCenter = member === president;

                    let mobileOrderClass = '';
                    if (member === president) {
                      mobileOrderClass = 'order-1 md:order-none';
                    } else if (member === vicePresident) {
                      mobileOrderClass = 'order-2 md:order-none';
                    } else if (member === generalSecretary) {
                      mobileOrderClass = 'order-3 md:order-none';
                    }

                    return (
                      <div key={member._id} className={`w-full max-w-[340px] mx-auto ${mobileOrderClass} ${isPresidentCenter ? 'md:-translate-y-6 lg:-translate-y-10' : ''}`}>
                        {renderCard(member, isPresidentCenter)}
                      </div>
                    );
                  })}
                </div>
              )}

              {otherMembers.length > 0 && (
                <div className={gridCls}>
                  {otherMembers.map(member => (
                    <div key={member._id}>{renderCard(member)}</div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-[var(--deep)] text-white relative overflow-hidden">
        <div className="tm-grid absolute inset-0 opacity-50 pointer-events-none"></div>
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-12 sm:py-16 text-center">
          <p className="mono text-xs text-white/50">BRIU Sports Club • Committee Archive</p>
        </div>
      </footer>

      {/* PROFILE MODAL (সাধারণ মেম্বারদের জন্য) */}
      {selectedMember && (
        <div className="tm-fade fixed inset-0 bg-[#050912]/75 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="tm-pop tm-surf border tm-line rounded-3xl max-w-md w-full relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center text-sm transition active:scale-95"
              title="Close"
            >
              ✕
            </button>

            <div className="relative h-72 sm:h-80 tm-surf2">
              <img 
                src={selectedMember.img || selectedMember.image || "https://via.placeholder.com/150"} 
                alt={selectedMember.name} 
                className="w-full h-full object-cover object-top" 
              />
              <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, var(--surf), transparent)' }}></div>
            </div>

            <div className="p-6 sm:p-8 -mt-4 relative space-y-6">
              <div>
                <h3 className="fd fd-cond text-4xl sm:text-5xl font-extrabold leading-[.95]">{selectedMember.name}</h3>
                <p className="mono text-xs tm-acc mt-3">{selectedMember.role}</p>
              </div>

              <dl className="border-t tm-line text-sm">
                <div className="flex justify-between items-center gap-4 py-3.5 border-b tm-line">
                  <dt className="tm-mute">Department</dt>
                  <dd className="font-medium text-right max-w-[210px] truncate">{selectedMember.department || selectedMember.dept || 'N/A'}</dd>
                </div>
                {selectedMember.batch && (
                  <div className="flex justify-between items-center gap-4 py-3.5 border-b tm-line">
                    <dt className="tm-mute">Batch</dt>
                    <dd className="mono text-xs font-medium">{selectedMember.batch}</dd>
                  </div>
                )}
                <div className="flex justify-between items-center gap-4 py-3.5 border-b tm-line">
                  <dt className="tm-mute">Email</dt>
                  <dd className="font-medium tm-acc truncate max-w-[210px]">{selectedMember.email || 'N/A'}</dd>
                </div>
                <div className="flex justify-between items-center gap-4 py-3.5">
                  <dt className="tm-mute">Phone</dt>
                  <dd className="font-medium">{selectedMember.phone || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        html { scroll-behavior: smooth; }

        .tm {
          --bg: #F3F5F9; --surf: #FFFFFF; --surf2: #E7ECF4;
          --ink: #0B1220; --mute: #5A6577; --line: #D6DDE8;
          --acc: #2563EB; --deep: #0A1224;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          background: var(--bg); color: var(--ink);
        }
        .tm.dark {
          --bg: #070B14; --surf: #0E1626; --surf2: #152036;
          --ink: #E9EEF8; --mute: #8C9AB3; --line: #1E2B44; --acc: #5B8CFF;
        }
        .tm .fd { font-family: 'Archivo', 'IBM Plex Sans', sans-serif; letter-spacing: -0.02em; }
        .tm .fd-cond { font-stretch: 75%; letter-spacing: -0.01em; }
        .tm .mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: .04em; }
        .tm .tm-surf { background: var(--surf); }
        .tm .tm-surf2 { background: var(--surf2); }
        .tm .tm-line { border-color: var(--line); }
        .tm .tm-mute { color: var(--mute); }
        .tm .tm-acc { color: var(--acc); }
        .tm h1, .tm h2, .tm h3, .tm p { overflow-wrap: break-word; }
        .tm a:focus-visible, .tm button:focus-visible { outline: 2px solid var(--acc); outline-offset: 3px; }

        .tm-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px),
            radial-gradient(60% 90% at 88% 0%, rgba(37,99,235,.55), transparent 70%);
          background-size: 64px 64px, 64px 64px, 100% 100%;
          animation: gridPan 40s linear infinite;
        }
        @keyframes gridPan { to { background-position: 64px 64px, 64px 64px, 0 0; } }

        .rise { animation: rise .9s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }

        .tm-br { position: absolute; width: 20px; height: 20px; border: 2px solid #fff; opacity: 0; transition: all .45s cubic-bezier(.2,.7,.2,1); pointer-events: none; }
        .tm-br.tl { top: 22px; left: 22px; border-right: 0; border-bottom: 0; }
        .tm-br.tr { top: 22px; right: 22px; border-left: 0; border-bottom: 0; }
        .tm-br.bl { bottom: 22px; left: 22px; border-right: 0; border-top: 0; }
        .tm-br.brr { bottom: 22px; right: 22px; border-left: 0; border-top: 0; }
        .tm-card:hover .tm-br.tl { top: 12px; left: 12px; opacity: 1; }
        .tm-card:hover .tm-br.tr { top: 12px; right: 12px; opacity: 1; }
        .tm-card:hover .tm-br.bl { bottom: 12px; left: 12px; opacity: 1; }
        .tm-card:hover .tm-br.brr { bottom: 12px; right: 12px; opacity: 1; }
        .tm-view { display: none; }
        @media (hover: hover) {
          .tm-view { display: block; position: absolute; left: 50%; bottom: 20px; translate: -50% 12px; opacity: 0; background: #fff; color: #0B1220; padding: 8px 16px; border-radius: 999px; white-space: nowrap; transition: all .45s cubic-bezier(.2,.7,.2,1); }
          .tm-card:hover .tm-view { translate: -50% 0; opacity: 1; }
        }

        .tm-fade { animation: tmFade .25s ease both; }
        .tm-pop { animation: tmPop .45s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes tmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tmPop { from { opacity: 0; transform: translateY(24px) scale(.97); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .tm-grid, .rise, .tm-card, .tm-fade, .tm-pop { animation: none !important; }
        }
      `}</style>

    </div>
  );
};

export default CommitteeDetails;