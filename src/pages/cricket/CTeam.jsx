import React, { useState, useEffect } from 'react';
import Header from './header';
import API from '../../services/api'; // আপনার প্রজেক্টের API সার্ভিস পাথ অনুযায়ী ঠিক করে নিন

/* ------------------------------------------------------------------
   UI-only helpers (no business logic)
------------------------------------------------------------------- */
const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

// Cursor-following spotlight for cards
const trackGlow = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

// Animated number count-up
function CountUp({ value, duration = 1000 }) {
  const n = Number(value);
  const valid = Number.isFinite(n);
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!valid) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(n); return; }
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [n, valid, duration]);

  return <>{valid ? v.toLocaleString() : (value ?? '-')}</>;
}

function Avatar({ src, name, size = 56 }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.36 };
  if (!src || failed) {
    return <div className="ct-avatar ct-avatar-fallback" style={style} aria-hidden="true">{initials(name)}</div>;
  }
  return <img className="ct-avatar" src={src} alt={name || ''} style={style} onError={() => setFailed(true)} />;
}

function Chevron() {
  return (
    <svg className="ct-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CTeam() {
  const [selectedCategory, setSelectedCategory] = useState(null); // 'official', 'central', 'franchise'
  const [selectedTeam, setSelectedTeam] = useState(null);         // Selected Team object
  const [selectedPlayer, setSelectedPlayer] = useState(null);     // Selected Player object

  const [teamsFromDB, setTeamsFromDB] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams from backend API on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await API.get('/api/cricket/teams');
        setTeamsFromDB(res.data || []);
      } catch (error) {
        console.error('Error fetching teams from database:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Category Configuration for UI styling and titles
  const categoryDetails = {
    official: {
      title: "BRIU Cricket Team Squad",
      short: "Official squad",
      themeColor: "#f2c14e",
      description: ""
    },
    central: {
      title: "Central Cricket Teams",
      short: "Central teams",
      themeColor: "#3dd6d0",
      description: ""
    },
    franchise: {
      title: "Franchise Cricket Teams",
      short: "Franchise teams",
      themeColor: "#a78bfa",
      description: ""
    }
  };

  // Filter teams based on selected category from database
  const filteredTeams = teamsFromDB.filter(t => t.category === selectedCategory);

  const handleBack = () => {
    if (selectedPlayer) {
      setSelectedPlayer(null);
    } else if (selectedTeam) {
      setSelectedTeam(null);
    } else {
      setSelectedCategory(null);
    }
  };

  // Breadcrumb jumps (reuse the same state setters)
  const goTiers = () => { setSelectedPlayer(null); setSelectedTeam(null); setSelectedCategory(null); };
  const goCategory = () => { setSelectedPlayer(null); setSelectedTeam(null); };
  const goTeam = () => { setSelectedPlayer(null); };

  const accent = selectedCategory ? categoryDetails[selectedCategory].themeColor : '#f2c14e';
  const atRoot = !selectedCategory && !selectedTeam && !selectedPlayer;

  // Key so each level replays its entrance animation on change
  const viewKey = `${selectedCategory}-${selectedTeam?._id || ''}-${selectedPlayer?._id || selectedPlayer?.id || ''}`;

  return (
    <div className="ct-page" style={{ '--accent': accent }}>
      <div className="ct-bg" aria-hidden="true">
        <span className="ct-orb ct-orb-1" />
        <span className="ct-orb ct-orb-2" />
        <span className="ct-orb ct-orb-3" />
        <span className="ct-grid" />
      </div>

      <Header />

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

          @property --ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

          .ct-page {
            --bg: #060912;
            --ink: #eef2ff;
            --muted: #93a0bd;
            --line: rgba(255, 255, 255, 0.09);
            --glass: linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.02));
            position: relative; isolation: isolate; overflow-x: hidden;
            min-height: 100vh; background: var(--bg); color: var(--ink);
            font-family: 'Figtree', 'Segoe UI', Tahoma, sans-serif;
          }
          .ct-page *, .ct-page *::before, .ct-page *::after { box-sizing: border-box; }
          .ct-display { font-family: 'Bricolage Grotesque', 'Segoe UI', sans-serif; letter-spacing: -0.02em; }
          .ct-wrap { position: relative; width: 100%; max-width: 900px; margin: 0 auto; padding: 22px 16px 64px; }

          /* ---------- Ambient background ---------- */
          .ct-bg { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
          .ct-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .5; transition: background 1s ease; }
          .ct-orb-1 { width: 520px; height: 520px; top: -160px; left: -120px; background: var(--accent); opacity: .28; animation: ctFloatA 18s ease-in-out infinite; }
          .ct-orb-2 { width: 460px; height: 460px; top: 30%; right: -160px; background: #3348ff; opacity: .25; animation: ctFloatB 22s ease-in-out infinite; }
          .ct-orb-3 { width: 420px; height: 420px; bottom: -160px; left: 25%; background: var(--accent); opacity: .16; animation: ctFloatA 26s ease-in-out infinite reverse; }
          .ct-grid {
            position: absolute; inset: 0;
            background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
            background-size: 44px 44px;
            -webkit-mask-image: radial-gradient(ellipse at 50% 30%, #000 0%, transparent 70%);
            mask-image: radial-gradient(ellipse at 50% 30%, #000 0%, transparent 70%);
          }
          @keyframes ctFloatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(90px, 70px) scale(1.15); } }
          @keyframes ctFloatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-100px, -60px) scale(1.1); } }

          /* ---------- Entrance animations ---------- */
          .ct-in { animation: ctRise .7s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--i, 0) * 80ms); }
          @keyframes ctRise { from { opacity: 0; transform: translateY(22px) scale(.98); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
          @keyframes ctSpin { to { --ang: 360deg; } }

          /* ---------- Breadcrumb bar ---------- */
          .ct-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 26px; min-height: 42px; animation: ctRise .5s cubic-bezier(.2,.8,.2,1) both; }
          .ct-back {
            flex: none; display: inline-flex; align-items: center; gap: 6px;
            height: 42px; padding: 0 18px 0 12px; border-radius: 999px;
            border: 1px solid var(--line); background: var(--glass); backdrop-filter: blur(12px);
            color: var(--ink); font: 600 14px 'Figtree', sans-serif; cursor: pointer;
            transition: box-shadow .25s, border-color .25s, transform .2s;
          }
          .ct-back svg { transition: transform .25s; }
          .ct-back:hover { border-color: color-mix(in srgb, var(--accent) 60%, transparent); box-shadow: 0 0 24px -4px var(--accent); }
          .ct-back:hover svg { transform: translateX(-3px); }
          .ct-crumbs { display: flex; align-items: center; gap: 6px; overflow-x: auto; white-space: nowrap; scrollbar-width: none; font-size: 14px; color: var(--muted); }
          .ct-crumbs::-webkit-scrollbar { display: none; }
          .ct-crumb { background: none; border: 0; padding: 4px 2px; font: inherit; color: var(--muted); cursor: pointer; transition: color .2s; }
          .ct-crumb:hover { color: var(--ink); }
          .ct-crumb[aria-current="page"] { color: var(--accent); font-weight: 700; cursor: default; text-shadow: 0 0 18px var(--accent); }
          .ct-sep { opacity: .35; }

          /* ---------- Headings ---------- */
          .ct-h1 { margin: 0 0 8px; font-size: clamp(30px, 6.5vw, 46px); line-height: 1.04; font-weight: 800; }
          .ct-h1-sheen {
            background: linear-gradient(100deg, #fff 20%, var(--accent) 45%, #fff 70%);
            background-size: 220% 100%; -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent; color: transparent;
            animation: ctSheen 6s ease-in-out infinite;
          }
          @keyframes ctSheen { 0%,100% { background-position: 100% 0; } 50% { background-position: 0 0; } }
          .ct-h1-glow { color: var(--accent); text-shadow: 0 0 32px color-mix(in srgb, var(--accent) 60%, transparent); }
          .ct-lead { margin: 0 0 28px; color: var(--muted); font-size: 15.5px; line-height: 1.6; max-width: 58ch; }

          /* ---------- Glass row / card ---------- */
          .ct-list { display: flex; flex-direction: column; gap: 14px; }
          .ct-row {
            position: relative; isolation: isolate; overflow: hidden;
            width: 100%; text-align: left; font: inherit; color: inherit; cursor: pointer;
            background: var(--glass); backdrop-filter: blur(14px);
            border: 1px solid var(--line); border-radius: 18px;
            display: flex; align-items: center; gap: 16px;
            transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .35s, border-color .35s;
          }
          /* cursor spotlight */
          .ct-row::before {
            content: ''; position: absolute; inset: 0; z-index: -1; opacity: 0; transition: opacity .35s;
            background: radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--accent) 26%, transparent), transparent 62%);
          }
          /* rotating glow border */
          .ct-row::after {
            content: ''; position: absolute; inset: 0; padding: 1.5px; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .35s;
            background: conic-gradient(from var(--ang), transparent 0 62%, var(--accent) 82%, transparent 100%);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
            mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
            animation: ctSpin 3.5s linear infinite;
          }
          .ct-row:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--accent) 45%, transparent);
            box-shadow: 0 18px 50px -18px color-mix(in srgb, var(--accent) 65%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent); }
          .ct-row:hover::before, .ct-row:hover::after { opacity: 1; }
          .ct-row:active { transform: translateY(-1px) scale(.995); }
          .ct-page :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

          .ct-chevron { flex: none; color: var(--muted); transition: transform .3s, color .3s, filter .3s; }
          .ct-row:hover .ct-chevron { color: var(--accent); transform: translateX(5px); filter: drop-shadow(0 0 8px var(--accent)); }

          /* ---------- Avatar ---------- */
          .ct-avatar { flex: none; border-radius: 50%; object-fit: cover; display: block; background: #121a30; border: 2px solid color-mix(in srgb, var(--accent) 55%, transparent); transition: box-shadow .35s, transform .35s; }
          .ct-row:hover .ct-avatar { box-shadow: 0 0 22px color-mix(in srgb, var(--accent) 70%, transparent); transform: scale(1.06); }
          .ct-avatar-fallback { display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--accent); background: radial-gradient(circle at 30% 25%, #1c2748, #0c1226); font-family: 'Bricolage Grotesque', sans-serif; }

          /* ---------- Level 1: tiers ---------- */
          .ct-tier { padding: 0; min-height: 124px; }
          .ct-tier::after { opacity: .55; }
          .ct-tier-num {
            flex: none; align-self: stretch; width: 104px; position: relative; overflow: hidden;
            background: linear-gradient(160deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #0a1022));
            color: #070b16; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
            box-shadow: 0 0 44px -6px var(--accent);
          }
          .ct-tier-num::after { content: ''; position: absolute; top: 0; left: -80%; width: 60%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); transform: skewX(-20deg); animation: ctShine 4.5s ease-in-out infinite; }
          .ct-row:nth-child(2) .ct-tier-num::after { animation-delay: 1.2s; }
          .ct-row:nth-child(3) .ct-tier-num::after { animation-delay: 2.4s; }
          @keyframes ctShine { 0% { left: -80%; } 45%,100% { left: 160%; } }
          .ct-tier-num b { font-family: 'Bricolage Grotesque', sans-serif; font-size: 42px; line-height: 1; font-weight: 800; }
          .ct-tier-num span { font-size: 12px; font-weight: 700; opacity: .75; }
          .ct-tier-body { flex: 1; padding: 18px 0; min-width: 0; }
          .ct-tier-body h3 { margin: 0 0 5px; font-size: 21px; font-weight: 800; color: var(--ink); }
          .ct-tier-body p { margin: 0; font-size: 14px; color: var(--muted); line-height: 1.5; }
          .ct-tier .ct-chevron { margin-right: 18px; }

          /* ---------- Level 2: teams ---------- */
          .ct-team { padding: 18px; }
          .ct-team-body { flex: 1; min-width: 0; }
          .ct-team-body h3 { margin: 0 0 4px; font-size: 19px; font-weight: 800; }
          .ct-team-body p { margin: 0; font-size: 14px; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .ct-pill, .ct-role {
            display: inline-block; border-radius: 999px; font-weight: 700; color: var(--accent);
            background: color-mix(in srgb, var(--accent) 14%, transparent);
            border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
          }
          .ct-pill { margin-top: 10px; padding: 3px 11px; font-size: 12px; }
          .ct-role { padding: 2px 10px; font-size: 12px; }

          /* ---------- Level 3: players ---------- */
          .ct-team-head { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
          .ct-team-head .ct-avatar { box-shadow: 0 0 26px color-mix(in srgb, var(--accent) 60%, transparent); }
          .ct-player { padding: 15px 18px; }
          .ct-player-main { flex: 1; min-width: 0; }
          .ct-player-main h4 { margin: 0 0 6px; font-size: 17.5px; font-weight: 700; }
          .ct-mini { display: flex; gap: 20px; flex: none; }
          .ct-mini div { text-align: right; min-width: 46px; }
          .ct-mini b { display: block; font-family: 'Bricolage Grotesque', sans-serif; font-size: 21px; font-weight: 800; line-height: 1.1; }
          .ct-row:hover .ct-mini b { color: var(--accent); text-shadow: 0 0 14px var(--accent); }
          .ct-mini span { font-size: 11px; color: var(--muted); font-weight: 600; }
          .ct-player-sub { display: none; gap: 12px; margin-top: 8px; font-size: 12px; color: var(--muted); }
          .ct-player-sub b { color: var(--ink); }
          @media (max-width: 560px) {
            .ct-mini { display: none; }
            .ct-player-sub { display: flex; }
            .ct-tier-num { width: 82px; }
            .ct-tier-num b { font-size: 32px; }
            .ct-tier-body h3 { font-size: 18px; }
          }

          /* ---------- Level 4: profile ---------- */
          .ct-profile { position: relative; overflow: hidden; border-radius: 26px; border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); background: var(--glass), #0a1022; backdrop-filter: blur(16px); box-shadow: 0 30px 80px -30px color-mix(in srgb, var(--accent) 55%, transparent); }
          .ct-cover { position: relative; height: 130px; overflow: hidden;
            background: radial-gradient(520px 180px at 18% 0%, color-mix(in srgb, var(--accent) 60%, transparent), transparent 70%), linear-gradient(135deg, #111a36, #0a1022); }
          .ct-cover::after { content: ''; position: absolute; top: 0; left: -40%; width: 40%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.12), transparent); transform: skewX(-20deg); animation: ctShine 5s ease-in-out infinite; }
          .ct-profile-body { padding: 0 26px 30px; }
          .ct-profile-top { display: flex; align-items: flex-end; gap: 20px; margin-top: -54px; flex-wrap: wrap; }
          .ct-orbit { position: relative; flex: none; padding: 5px; border-radius: 50%; }
          .ct-orbit::before, .ct-orbit::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from var(--ang), var(--accent), transparent 35%, var(--accent) 70%, transparent); animation: ctSpin 3.2s linear infinite; }
          .ct-orbit::after { filter: blur(16px); opacity: .75; }
          .ct-orbit .ct-avatar { position: relative; z-index: 1; border: 4px solid #0a1022; }
          .ct-profile-name { padding-bottom: 6px; min-width: 0; }
          .ct-profile-name h2 { margin: 0 0 8px; font-size: clamp(28px, 6.5vw, 38px); font-weight: 800; line-height: 1.05; }
          .ct-bio { margin: 24px 0 26px; max-width: 62ch; font-size: 15.5px; line-height: 1.75; color: #c3cce3; }
          .ct-bio.ct-bio-empty { color: var(--muted); font-style: italic; }
          .ct-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .ct-stat { position: relative; padding: 20px 10px; text-align: center; border-radius: 18px; border: 1px solid var(--line); background: var(--glass); overflow: hidden; }
          .ct-stat::before { content: ''; position: absolute; inset: auto 0 0 0; height: 60%; background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%); }
          .ct-stat b { position: relative; display: block; font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(30px, 8vw, 46px); font-weight: 800; line-height: 1; color: var(--accent); text-shadow: 0 0 26px color-mix(in srgb, var(--accent) 70%, transparent); }
          .ct-stat span { position: relative; display: block; margin-top: 8px; font-size: 13px; color: var(--muted); font-weight: 600; }

          /* ---------- Empty + loading ---------- */
          .ct-empty { padding: 40px 22px; text-align: center; border: 1px dashed rgba(255,255,255,.18); border-radius: 18px; color: var(--muted); font-size: 15px; background: var(--glass); }
          .ct-skel { height: 110px; border-radius: 18px; border: 1px solid var(--line); background: linear-gradient(90deg, rgba(255,255,255,.03) 25%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.03) 75%); background-size: 220% 100%; animation: ctShimmer 1.4s linear infinite; }
          @keyframes ctShimmer { to { background-position: -220% 0; } }

          @media (prefers-reduced-motion: reduce) {
            .ct-page *, .ct-page *::before, .ct-page *::after { animation: none !important; transition: none !important; }
            .ct-h1-sheen { -webkit-text-fill-color: var(--ink); color: var(--ink); background: none; }
          }
        `}
      </style>

      <div className="ct-wrap">

        {/* Back + breadcrumb */}
        {!atRoot && (
          <nav className="ct-bar" aria-label="Breadcrumb">
            <button className="ct-back" onClick={handleBack}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <div className="ct-crumbs">
              <button className="ct-crumb" onClick={goTiers}>All teams</button>
              {selectedCategory && (<>
                <span className="ct-sep">/</span>
                <button className="ct-crumb" onClick={goCategory} aria-current={!selectedTeam ? 'page' : undefined}>
                  {categoryDetails[selectedCategory].short}
                </button>
              </>)}
              {selectedTeam && (<>
                <span className="ct-sep">/</span>
                <button className="ct-crumb" onClick={goTeam} aria-current={!selectedPlayer ? 'page' : undefined}>
                  {selectedTeam.name}
                </button>
              </>)}
              {selectedPlayer && (<>
                <span className="ct-sep">/</span>
                <span className="ct-crumb" aria-current="page">{selectedPlayer.name}</span>
              </>)}
            </div>
          </nav>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="ct-list" role="status" aria-label="Loading teams">
            <div className="ct-skel" /><div className="ct-skel" /><div className="ct-skel" />
          </div>
        )}

        {!loading && (
          <div key={viewKey}>

            {/* ---------------- LEVEL 1: TIERS ---------------- */}
            {!selectedCategory && (
              <div>
                <h2 className="ct-h1 ct-display ct-h1-sheen ct-in">Cricket teams</h2>
                <p className="ct-lead ct-in" style={{ '--i': 1 }}>Choose a group to see its teams, players and career numbers.</p>

                <div className="ct-list">
                  {Object.keys(categoryDetails).map((catKey, idx) => {
                    const cat = categoryDetails[catKey];
                    const count = teamsFromDB.filter(t => t.category === catKey).length;
                    return (
                      <button
                        key={catKey}
                        onClick={() => setSelectedCategory(catKey)}
                        onMouseMove={trackGlow}
                        className="ct-row ct-tier ct-in"
                        style={{ '--accent': cat.themeColor, '--i': idx + 2 }}
                      >
                        <div className="ct-tier-num">
                          <b><CountUp value={count} /></b>
                          <span>{count === 1 ? 'team' : 'teams'}</span>
                        </div>
                        <div className="ct-tier-body">
                          <h3 className="ct-display">{cat.title}</h3>
                          <p>{cat.description}</p>
                        </div>
                        <Chevron />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------- LEVEL 2: TEAM LIST ---------------- */}
            {selectedCategory && !selectedTeam && !selectedPlayer && (
              <div>
                <h2 className="ct-h1 ct-display ct-h1-glow ct-in">{categoryDetails[selectedCategory].title}</h2>
                <p className="ct-lead ct-in" style={{ '--i': 1 }}>Tap a team to see its players.</p>

                {filteredTeams.length === 0 ? (
                  <div className="ct-empty ct-in" style={{ '--i': 2 }}>
                    No teams in this group yet. Check back soon, or go back and try another group.
                  </div>
                ) : (
                  <div className="ct-list">
                    {filteredTeams.map((team, idx) => (
                      <button
                        key={team._id}
                        onClick={() => setSelectedTeam(team)}
                        onMouseMove={trackGlow}
                        className="ct-row ct-team ct-in"
                        style={{ '--i': idx + 2 }}
                      >
                        <Avatar src={team.logo} name={team.name} size={62} />
                        <div className="ct-team-body">
                          <h3 className="ct-display">{team.name}</h3>
                          <p>{team.description || 'No description provided.'}</p>
                          <span className="ct-pill">{team.players?.length || 0} players</span>
                        </div>
                        <Chevron />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------------- LEVEL 3: PLAYER LIST ---------------- */}
            {selectedTeam && !selectedPlayer && (
              <div>
                <div className="ct-team-head ct-in">
                  <Avatar src={selectedTeam.logo} name={selectedTeam.name} size={58} />
                  <h2 className="ct-h1 ct-display ct-h1-glow" style={{ margin: 0 }}>{selectedTeam.name}</h2>
                </div>
                <p className="ct-lead ct-in" style={{ marginTop: 12, '--i': 1 }}>
                  {selectedTeam.players?.length || 0} players. Tap a player to see the full profile.
                </p>

                {(!selectedTeam.players || selectedTeam.players.length === 0) ? (
                  <div className="ct-empty ct-in" style={{ '--i': 2 }}>No players in this team yet.</div>
                ) : (
                  <div className="ct-list">
                    {selectedTeam.players.map((player, idx) => (
                      <button
                        key={player._id || player.id}
                        onClick={() => setSelectedPlayer(player)}
                        onMouseMove={trackGlow}
                        className="ct-row ct-player ct-in"
                        style={{ '--i': idx + 2 }}
                      >
                        <Avatar src={player.img} name={player.name} size={58} />
                        <div className="ct-player-main">
                          <h4>{player.name}</h4>
                          <span className="ct-role">{player.role}</span>
                          <div className="ct-player-sub">
                            <span>Matches <b>{player.matches}</b></span>
                            <span>Runs <b>{player.runs}</b></span>
                            <span>Wkts <b>{player.wickets}</b></span>
                          </div>
                        </div>
                        <div className="ct-mini">
                          <div><b>{player.matches}</b><span>Matches</span></div>
                          <div><b>{player.runs}</b><span>Runs</span></div>
                          <div><b>{player.wickets}</b><span>Wickets</span></div>
                        </div>
                        <Chevron />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------------- LEVEL 4: PLAYER PROFILE ---------------- */}
            {selectedPlayer && (
              <article className="ct-profile ct-in">
                <div className="ct-cover" />
                <div className="ct-profile-body">
                  <div className="ct-profile-top">
                    <div className="ct-orbit">
                      <Avatar src={selectedPlayer.img} name={selectedPlayer.name} size={112} />
                    </div>
                    <div className="ct-profile-name">
                      <h2 className="ct-display">{selectedPlayer.name}</h2>
                      <span className="ct-role">{selectedPlayer.role}</span>
                    </div>
                  </div>

                  <p className={`ct-bio ${selectedPlayer.bio ? '' : 'ct-bio-empty'}`}>
                    {selectedPlayer.bio || 'No career summary has been added for this player yet.'}
                  </p>

                  <div className="ct-stats">
                    <div className="ct-stat ct-in" style={{ '--i': 2 }}><b><CountUp value={selectedPlayer.matches} /></b><span>Matches</span></div>
                    <div className="ct-stat ct-in" style={{ '--i': 3 }}><b><CountUp value={selectedPlayer.runs} /></b><span>Career runs</span></div>
                    <div className="ct-stat ct-in" style={{ '--i': 4 }}><b><CountUp value={selectedPlayer.wickets} /></b><span>Wickets</span></div>
                  </div>
                </div>
              </article>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CTeam;