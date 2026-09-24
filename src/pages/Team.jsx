import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/api/team')
      .then(res => {
        setMembers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching team:", err);
        setError("Failed to load team members.");
        setLoading(false);
      });
  }, []);

  // ক্যাটাগরি দিয়ে প্রাইমারি ফিল্টারিং
  const moderator = members.find(m => m.category?.toLowerCase() === 'moderator');
  const executiveMembers = members.filter(m => m.category?.toLowerCase() === 'executive');
  const generalMembers = members.filter(m => m.category?.toLowerCase() === 'general');

  // নতুন যোগ করা ক্যাটাগরিগুলোর ফিল্টারিং
  const eSportsMembers = members.filter(m => m.category?.toLowerCase() === 'e-sports division');
  const athleticsMembers = members.filter(m => m.category?.toLowerCase() === 'athletics');
  const cricketMembers = members.filter(m => m.category?.toLowerCase() === 'cricket');
  const footballMembers = members.filter(m => m.category?.toLowerCase() === 'football');
  const badmintonMembers = members.filter(m => m.category?.toLowerCase() === 'badminton');
  const volleyballMembers = members.filter(m => m.category?.toLowerCase() === 'volleyball');
  const ludoMembers = members.filter(m => m.category?.toLowerCase() === 'ludo');
  const carromMembers = members.filter(m => m.category?.toLowerCase() === 'carrom');
  const chessMembers = members.filter(m => m.category?.toLowerCase() === 'chess');
  const tableTennisMembers = members.filter(m => m.category?.toLowerCase() === 'table tennis');
  const deadLiftMembers = members.filter(m => m.category?.toLowerCase() === 'dead lift');

  // এক্সিকিউটিভ ক্যাটাগরি থেকে বিশেষ ৩টি রোল আলাদা করা (President, Vice President, General Secretary)
  const president = executiveMembers.find(m => m.role?.toLowerCase().includes('president') && !m.role?.toLowerCase().includes('vice'));
  const vicePresident = executiveMembers.find(m => m.role?.toLowerCase().includes('vice president'));
  const generalSecretary = executiveMembers.find(m => m.role?.toLowerCase().includes('general secretary') || m.role?.toLowerCase().includes('gs'));

  // এই ৩টি পদের বাইরে বাকি এক্সিকিউটিভ মেম্বারগণ
  const otherExecutives = executiveMembers.filter(m => 
    m !== president && m !== vicePresident && m !== generalSecretary
  );

  // প্রথম সারির ৩ জনের স্পেশাল অ্যারে: ডেস্কটপ মোডে প্রেসিডেন্ট মাঝে [vicePresident, president, generalSecretary]
  const topRowExecutives = [vicePresident, president, generalSecretary].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9] px-4">
        <div className="flex items-center gap-4 text-[#0B1220]">
          <div className="w-9 h-9 border-[3px] border-[#2563EB] border-t-transparent rounded-full animate-spin shrink-0"></div>
          <p className="text-lg font-semibold">Loading Team Members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9] px-4">
        <div className="bg-white border border-[#D6DDE8] rounded-3xl px-8 py-7 text-center max-w-md w-full">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  // Sections rendered after the executive block, in the same order as before
  const sectionList = [
    ['executive-members', 'Executive Members', generalMembers],
    ['e-sports-division', 'E-Sports Division', eSportsMembers],
    ['athletics', 'Athletics', athleticsMembers],
    ['cricket', 'Cricket', cricketMembers],
    ['football', 'Football', footballMembers],
    ['badminton', 'Badminton', badmintonMembers],
    ['volleyball', 'Volleyball', volleyballMembers],
    ['ludo', 'Ludo', ludoMembers],
    ['carrom', 'Carrom', carromMembers],
    ['chess', 'Chess', chessMembers],
    ['table-tennis', 'Table Tennis', tableTennisMembers],
    ['dead-lift', 'Dead Lift', deadLiftMembers],
  ];

  const navItems = [
    ...(moderator ? [{ id: 'moderator', label: 'Moderator' }] : []),
    ...(executiveMembers.length > 0 ? [{ id: 'executive', label: 'Executive Committee' }] : []),
    ...sectionList.filter(([, , list]) => list.length > 0).map(([id, label]) => ({ id, label })),
  ];

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

  const renderCard = (member, highlight = false) => (
    <div onClick={() => setSelectedMember(member)} className="tm-card group cursor-pointer">
      <div className={`relative overflow-hidden rounded-2xl aspect-[4/5] tm-surf2 ${highlight ? 'ring-2 ring-[var(--acc)] ring-offset-4 ring-offset-[var(--bg)]' : ''}`}>
        <img src={member.img} alt={member.name} className="w-full h-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-105" />
        <i className="tm-br tl"></i><i className="tm-br tr"></i><i className="tm-br bl"></i><i className="tm-br brr"></i>
        <span className="tm-view mono text-[11px]">View profile ↗</span>
      </div>
      <div className="pt-4">
        <h3 className="fd text-lg font-semibold leading-tight truncate">{member.name}</h3>
        <p className="mono text-[11px] tm-acc mt-1.5 truncate">{member.role}</p>
        <p className="text-sm tm-mute mt-1 truncate">{member.dept}</p>
      </div>
    </div>
  );

  const gridCls = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12';

  return (
    <div className={`tm ${darkMode ? 'dark' : ''} min-h-screen w-full antialiased selection:bg-blue-600 selection:text-white relative transition-colors duration-500`}>

      {/* HERO */}
      <header className="relative isolate overflow-hidden bg-[var(--deep)] text-white">
        <div className="tm-grid absolute inset-0 -z-10"></div>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-24 pb-14 sm:pt-32 sm:pb-20">
          <p className="rise mono text-xs sm:text-sm text-[#8FB0FF] flex items-center gap-3">
            <span className="w-10 h-px bg-current"></span> BRIU Sports Club
          </p>
          <h1 className="rise fd fd-cond text-[clamp(3.75rem,14vw,11.5rem)] font-extrabold leading-[.86] mt-6" style={{ animationDelay: '.08s' }}>
            Meet Our<br />Team
          </h1>
          <div className="rise flex flex-col md:flex-row md:items-end justify-between gap-8 mt-10" style={{ animationDelay: '.18s' }}>
            <p className="text-white/70 max-w-md text-base sm:text-lg leading-relaxed">
              The dedicated academic and student leaders driving excellence at BRIU Sports Club.
            </p>
            <dl className="flex gap-12">
              <div>
                <dt className="mono text-xs text-white/50">Members</dt>
                <dd className="fd fd-cond text-5xl font-bold mt-1">{members.length}</dd>
              </div>
              <div>
                <dt className="mono text-xs text-white/50">Sections</dt>
                <dd className="fd fd-cond text-5xl font-bold mt-1">{navItems.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* SECTION INDEX */}
      {navItems.length > 0 && (
        <nav className="tm-glass sticky top-0 z-30 border-b tm-line">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-3 flex gap-2 overflow-x-auto tm-noscroll">
            {navItems.map(n => (
              <a key={n.id} href={`#${n.id}`} className="tm-chip shrink-0 text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">{n.label}</a>
            ))}
          </div>
        </nav>
      )}

      <div className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-24 space-y-24 sm:space-y-36 max-w-[1440px] mx-auto">

        {/* 1. MODERATOR */}
        {moderator && (
          <section id="moderator" className="scroll-mt-24">
            {sectionHead('BRIU Sports Club Moderator', 1)}
            <div onClick={() => setSelectedMember(moderator)} className="tm-card group cursor-pointer grid md:grid-cols-[minmax(0,360px)_1fr] rounded-3xl overflow-hidden bg-[var(--deep)] text-white">
              <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[420px] overflow-hidden">
                <img src={moderator.img} alt={moderator.name} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-105" />
              </div>
              <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-end gap-5 relative">
                <div className="tm-grid absolute inset-0 opacity-40 pointer-events-none"></div>
                <p className="mono text-xs sm:text-sm text-[#8FB0FF] relative">{moderator.role}</p>
                <h3 className="fd fd-cond text-5xl sm:text-7xl font-extrabold leading-[.92] relative">{moderator.name}</h3>
                <p className="text-white/70 text-lg relative">{moderator.dept}</p>
                <span className="mono text-xs relative inline-flex items-center gap-2 mt-2 group-hover:gap-4 transition-all">View profile ↗</span>
              </div>
            </div>
          </section>
        )}

        {/* 2. EXECUTIVE COMMITTEE */}
        {executiveMembers.length > 0 && (
          <section id="executive" className="scroll-mt-24">
            {sectionHead('Executive Committee', executiveMembers.length)}

            {topRowExecutives.length > 0 && (
              <div className="flex flex-col md:grid md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto items-end">
                {topRowExecutives.map((member) => {
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

            {otherExecutives.length > 0 && (
              <div className={`${gridCls} mt-20`}>
                {otherExecutives.map(member => (
                  <div key={member._id}>{renderCard(member)}</div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3+. GENERAL, E-SPORTS, ATHLETICS, CRICKET, FOOTBALL, BADMINTON, VOLLEYBALL, LUDO, CARROM, CHESS, TABLE TENNIS, DEAD LIFT */}
        {sectionList.map(([id, title, list]) => list.length > 0 && (
          <section key={id} id={id} className="scroll-mt-24">
            {sectionHead(title, list.length)}
            <div className={gridCls}>
              {list.map(member => (
                <div key={member._id}>{renderCard(member)}</div>
              ))}
            </div>
          </section>
        ))}

      </div>

      {/* CONTACT INFO FOOTER */}
      <footer className="w-full bg-[var(--deep)] text-white relative overflow-hidden">
        <div className="tm-grid absolute inset-0 opacity-50 pointer-events-none"></div>
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-16 sm:py-24">
          <p className="mono text-xs sm:text-sm text-[#8FB0FF]">Contact Information</p>
          <p className="fd fd-cond text-[clamp(2rem,6.5vw,5rem)] font-extrabold leading-[.95] mt-5 break-words">
            <a href="mailto:briu.sportsclub@gmail.com" className="tm-email hover:text-[#8FB0FF] transition-colors">briu.sportsclub@gmail.com</a>
          </p>
        </div>
      </footer>

      {/* PROFILE MODAL */}
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
              <img src={selectedMember.img} alt={selectedMember.name} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, var(--surf), transparent)' }}></div>
            </div>

            <div className="p-6 sm:p-8 -mt-4 relative space-y-6">
              <div>
                <h3 className="fd fd-cond text-4xl sm:text-5xl font-extrabold leading-[.95]">{selectedMember.name}</h3>

                {selectedMember.category?.toLowerCase() === 'moderator' ? (
                  <div className="mt-3 space-y-1">
                    <p className="mono text-xs tm-acc">{selectedMember.role}</p>
                    <p className="mono text-[11px] tm-mute">BRIU Sports Club</p>
                    <p className="text-sm sm:text-base font-medium pt-1">
                      {selectedMember.designation || 'Lecturer, Department Of Law'}
                    </p>
                  </div>
                ) : (
                  <p className="mono text-xs tm-acc mt-3">{selectedMember.role}</p>
                )}
              </div>

              <dl className="border-t tm-line text-sm">
                <div className="flex justify-between items-center gap-4 py-3.5 border-b tm-line">
                  <dt className="tm-mute">Category</dt>
                  <dd className="mono text-xs font-medium">{selectedMember.category}</dd>
                </div>

                {selectedMember.category?.toLowerCase() !== 'moderator' && (
                  <div className="flex justify-between items-center gap-4 py-3.5 border-b tm-line">
                    <dt className="tm-mute">Department</dt>
                    <dd className="font-medium text-right max-w-[210px] truncate">{selectedMember.dept}</dd>
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

        .tm-glass { background: color-mix(in srgb, var(--surf) 85%, transparent); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
        .tm-noscroll { scrollbar-width: none; }
        .tm-noscroll::-webkit-scrollbar { display: none; }
        .tm-chip { background: var(--surf2); transition: background .25s, color .25s; }
        .tm-chip:hover { background: var(--acc); color: #fff; }

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

        /* corner brackets + hover label on member photos */
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

        /* scroll-linked reveal (only where the browser supports it; otherwise cards are simply visible) */
        @supports (animation-timeline: view()) {
          .tm-card { animation: cardIn linear both; animation-timeline: view(); animation-range: entry 0% entry 35%; }
        }
        @keyframes cardIn { from { opacity: 0; translate: 0 36px; } to { opacity: 1; translate: 0 0; } }

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

export default Team;