import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Header from './header';

/* ------------------------------------------------------------------ */
/*  Reveal: plain wrapper. Kept so the markup and props stay unchanged.   */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line no-unused-vars
const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div', style, ...rest }) => (
  <Tag className={`pc-reveal pc-visible ${className}`} style={style} {...rest}>
    {children}
  </Tag>
);

/* ------------------------------------------------------------------ */
/*  Media: shows the image, falls back to `fallback` when the URL is   */
/*  missing OR the image fails to load (broken link / deleted file).   */
/* ------------------------------------------------------------------ */
const Media = ({ src, alt, fallback, lazy = true }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  StatNumber: shows the value, zero-padded.                          */
/* ------------------------------------------------------------------ */
const StatNumber = ({ value }) => (
  <span className="pc-stat-value">{String(value).padStart(2, '0')}</span>
);

/* ------------------------------------------------------------------ */
/*  ScrollProgress: glowing bar showing how far down the page.         */
/*  Uses transform (no layout work) instead of animating width.        */
/* ------------------------------------------------------------------ */
const ScrollProgress = () => {
  const fillRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const value = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="pc-progress-track">
      <div ref={fillRef} className="pc-progress-fill" />
    </div>
  );
};

// A string coming from the server (even an empty one) wins; only a missing value falls back.
const txt = (v, fallback) => (typeof v === 'string' ? v : fallback);

// Non-empty server string wins, then a value derived from other data, then the previous value.
const pick = (serverVal, derived, prev) => {
  if (typeof serverVal === 'string' && serverVal !== '') return serverVal;
  return derived !== undefined ? derived : prev;
};

// Enter / Space activates a div that acts like a button.
const onActivate = (fn) => (e) => {
  if (e.target !== e.currentTarget) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

const initials = (name) => (name ? String(name).trim().charAt(0).toUpperCase() : '') || '?';
const staggerDelay = (idx) => Math.min(idx, 7) * 70;

const handleSpotlight = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty('--mx', `${x}%`);
  e.currentTarget.style.setProperty('--my', `${y}%`);
};

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const CHome = () => {
  const [homeData, setHomeData] = useState({
    title: 'Welcome to Cricket World',
    topText: 'Follow your favorite teams, players, tournaments and stay updated with the latest cricket news.',
    subTitle: '',
    footerText: '',
    bannerImageUrl: '',
    exploreButtonText: 'Explore Tournaments',

    officialTeamHeading: 'Official National Team',
    officialTeamSubText: 'Meet the elite members representing the nation',

    centralTeamHeading: 'Central Teams',
    centralTeamSubText: 'Explore all regional and central cricket squads',

    franchiseTeamHeading: 'Franchise Teams',
    franchiseTeamSubText: 'Explore premier T20 league franchise setups',

    matchReportBannerUrl: '',
    matchReportBadge: 'Match Report',
    matchReportTitle: 'Ellis goes down as Aussies fall under another spin spell',
    matchReportDesc: 'Openers laid formidable platform for a record chase but middle-order once again stumbles against Proteas tweakers.',
    matchReportMeta: '1h ago • Louis Cameron, at Wanderers Stadium, Johannesburg',
    headlinesHeading: 'Latest Headlines',
    moreNewsButtonText: 'More News',

    tournamentHubHeading: 'Tournament Hub & Actions',
    tournamentHubSubText: 'Check full schedules, live match centers and tournament history',

    officialPlayers: [
      { name: "Tamim Iqbal", role: "Batsman" },
      { name: "Shakib Al Hasan", role: "All-Rounder" },
      { name: "Taskin Ahmed", role: "Bowler" },
      { name: "Mustafizur Rahman", role: "Bowler" },
      { name: "Mushfiqur Rahim", role: "Wicket Keeper" },
      { name: "Liton Das", role: "Wicket Keeper" },
      { name: "Mehidy Hasan Miraz", role: "All-Rounder" },
      { name: "Najmul Hossain Shanto", role: "Batsman" }
    ],
    centralTeams: [
      { name: "Dhaka Division", zone: "Central Zone", coach: "Khaled Mahmud" },
      { name: "Chattogram Division", zone: "Eastern Zone", coach: "Aftab Ahmed" },
      { name: "Rajshahi Division", zone: "Northern Zone", coach: "Hannana Sarkar" },
      { name: "Khulna Division", zone: "South-Western Zone", coach: "Talha Jubair" },
      { name: "Barishal Division", zone: "Southern Zone", coach: "Shahriar Nafees" },
      { name: "Sylhet Division", zone: "North-Eastern Zone", coach: "Rajin Saleh" }
    ],
    franchiseTeams: [
      { name: "Dhaka Capitals", owner: "Bashundhara Group", captain: "Tamim Iqbal" },
      { name: "Chattogram Kings", owner: "Squrie Group", captain: "Mehidy Hasan" },
      { name: "Rajshahi Royals", owner: "Symphony", captain: "Nazmul Shanto" },
      { name: "Khulna Tigers", owner: "Gemcon", captain: "Anamul Haque" },
      { name: "Barishal Dominators", owner: "Fortune Group", captain: "Soumya Sarkar" },
      { name: "Sylhet Strikers", owner: "Future Sports", captain: "Zakir Hasan" }
    ],
    latestHeadlines: [
      { date: "26 Sep 2026", title: "Cummins edges towards ODI comeback, middle-order in focus" },
      { date: "26 Sep 2026", title: "Markram insists on 'nothing disrespectful' in Aussies' return" },
      { date: "26 Sep 2026", title: "Inglis racing the clock for Proteas Tests after finger blow" },
      { date: "25 Sep 2026", title: "Pietersen open to England Test return for Ashes mentoring role" },
      { date: "25 Sep 2026", title: "'Ruthless' cricket key as WA look to take the next step" }
    ]
  });

  // false until the first fetch finishes (success or fail), so sample data never flashes as real content
  const [ready, setReady] = useState(false);

  // Modal State for profile popup
  const [selectedProfile, setSelectedProfile] = useState(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchHomeData = async () => {
      try {
        const res = await API.get('/api/cricket/banner');
        if (cancelled) return;
        const data = res.data.data || res.data;

        if (data) {
          // Admin panel: the FIRST headline is the big Match Report card.
          const hl = Array.isArray(data.latestHeadlines) ? data.latestHeadlines : null;
          const first = hl && hl.length ? hl[0] : null;
          // list exists but empty -> report text is empty (hidden); no list at all -> keep previous
          const derive = (v) => (hl ? (first ? v : '') : undefined);

          setHomeData(prev => ({
            ...prev,
            title: data.title || prev.title,
            topText: data.topText || data.description || prev.topText,
            subTitle: txt(data.subTitle, prev.subTitle),
            footerText: txt(data.footerText, prev.footerText),

            bannerImageUrl: typeof data.bannerImageUrl === 'string' ? data.bannerImageUrl : (data.bannerImage || data.imageUrl || data.url || prev.bannerImageUrl),
            exploreButtonText: data.buttonText || data.exploreButtonText || prev.exploreButtonText,

            officialTeamHeading: data.officialTeamHeading || prev.officialTeamHeading,
            officialTeamSubText: txt(data.officialTeamSubText, prev.officialTeamSubText),

            centralTeamHeading: data.centralTeamHeading || prev.centralTeamHeading,
            centralTeamSubText: txt(data.centralTeamSubText, prev.centralTeamSubText),

            franchiseTeamHeading: data.franchiseTeamHeading || prev.franchiseTeamHeading,
            franchiseTeamSubText: txt(data.franchiseTeamSubText, prev.franchiseTeamSubText),

            matchReportBannerUrl: typeof data.matchReportBannerUrl === 'string' ? data.matchReportBannerUrl : (data.matchReportImageUrl || data.matchReportImage || prev.matchReportBannerUrl),
            matchReportBadge: data.matchReportBadge || (first && first.category) || prev.matchReportBadge,
            matchReportTitle: pick(data.matchReportTitle, derive(first ? (first.title || '') : ''), prev.matchReportTitle),
            matchReportDesc: pick(data.matchReportDesc, derive(first ? (first.description || '') : ''), prev.matchReportDesc),
            matchReportMeta: pick(
              data.matchReportMeta,
              derive(first ? [first.time || first.date, first.author].filter(Boolean).join(' • ') : ''),
              prev.matchReportMeta
            ),

            headlinesHeading: data.headlinesHeading || prev.headlinesHeading,
            moreNewsButtonText: data.moreNewsButtonText || prev.moreNewsButtonText,

            tournamentHubHeading: data.tournamentHubHeading || prev.tournamentHubHeading,
            tournamentHubSubText: txt(data.tournamentHubSubText, prev.tournamentHubSubText),

            officialPlayers: Array.isArray(data.officialPlayers) ? data.officialPlayers : prev.officialPlayers,
            centralTeams: Array.isArray(data.centralTeams) ? data.centralTeams : prev.centralTeams,
            franchiseTeams: Array.isArray(data.franchiseTeams) ? data.franchiseTeams : prev.franchiseTeams,
            latestHeadlines: Array.isArray(data.latestHeadlines) ? data.latestHeadlines : prev.latestHeadlines
          }));
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching home data from admin:', error);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    fetchHomeData();
    return () => { cancelled = true; };
  }, []);

  // Modal: Escape to close, Tab stays inside, page scroll locked, focus restored on close
  useEffect(() => {
    if (!selectedProfile) return undefined;

    const trigger = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeBtnRef.current) closeBtnRef.current.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedProfile(null);
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const items = modalRef.current.querySelectorAll(FOCUSABLE);
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [selectedProfile]);

  // NOTE: these are plain render functions (not inner components) so cards
  // are NOT re-mounted every time the modal opens/closes.
  const renderPlayerCard = (player, idx) => {
    const open = () => setSelectedProfile({ ...player, type: 'player' });
    return (
      <Reveal
        key={idx}
        delay={staggerDelay(idx)}
        className="pc-card pc-player tone-gold"
        onMouseMove={handleSpotlight}
        onClick={open}
        onKeyDown={onActivate(open)}
        role="button"
        tabIndex={0}
        aria-label={`View ${player.name || 'player'}`}
      >
        <div className="pc-media">
          <Media
            src={player.imageUrl}
            alt=""
            fallback={<div className="pc-media-fallback">{initials(player.name)}</div>}
          />
          <div className="pc-media-shade" />
        </div>
        <div className="pc-card-body">
          <h3>{player.name}</h3>
          {player.role && <span className="pc-pill">{player.role}</span>}
        </div>
      </Reveal>
    );
  };

  const renderTeamCard = (team, idx, sub, tag, tone) => {
    const open = () => setSelectedProfile({ ...team, type: 'team', sub, tag });
    return (
      <Reveal
        key={idx}
        delay={staggerDelay(idx)}
        className={`pc-card pc-team tone-${tone}`}
        onMouseMove={handleSpotlight}
        onClick={open}
        onKeyDown={onActivate(open)}
        role="button"
        tabIndex={0}
        aria-label={`View ${team.name || 'team'}`}
      >
        <div className="pc-media pc-media-logo">
          <Media
            src={team.logoUrl}
            alt=""
            fallback={<div className="pc-media-fallback">{initials(team.name)}</div>}
          />
        </div>
        <div className="pc-card-body">
          <h3>{team.name}</h3>
          {sub && <p className="pc-card-sub">{sub}</p>}
          {tag && <span className="pc-pill">{tag}</span>}
        </div>
      </Reveal>
    );
  };

  // Headlines repeated until there are enough to fill the width, then doubled so the loop is seamless
  const baseHeadlines = homeData.latestHeadlines;
  const tickerReps = baseHeadlines.length ? Math.ceil(6 / baseHeadlines.length) : 0;
  const tickerHalf = Array.from({ length: tickerReps }).flatMap(() => baseHeadlines);
  const tickerItems = [...tickerHalf, ...tickerHalf];

  const hasReport = !!(homeData.matchReportTitle || homeData.matchReportDesc || homeData.matchReportBannerUrl);
  const hide = (show) => (show ? undefined : { display: 'none' });

  const profile = selectedProfile;
  const teamRows = profile && profile.type !== 'player'
    ? [['Zone', profile.zone], ['Coach', profile.coach], ['Owner', profile.owner], ['Captain', profile.captain]].filter(([, v]) => v)
    : [];

  return (
    <div className="pc-root min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        @property --ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes pcSpin { to { --ang: 360deg; } }
        @keyframes pcPulse { from { transform: scale(1); opacity: .7; } to { transform: scale(3); opacity: 0; } }

        .pc-root {
          --pc-bg: #060912;
          --pc-ink: #eef2ff;
          --pc-soft: #93a0bd;
          --pc-line: rgba(255,255,255,0.09);
          --pc-glass: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02));
          --pc-gold: #f2c14e;
          --pc-cyan: #3dd6d0;
          --pc-violet: #a78bfa;
          --pc-live: #ff4d6d;
          --accent: var(--pc-gold);
          position: relative; isolation: isolate;
          background: var(--pc-bg); color: var(--pc-ink);
          font-family: 'Figtree', 'Segoe UI', sans-serif;
          overflow-x: clip;
        }
        .pc-display { font-family: 'Bricolage Grotesque', 'Segoe UI', sans-serif; letter-spacing: -0.02em; }

        /* ---------- Ambient background ---------- */
        .pc-ambient { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
        .pc-amb-orb { position: absolute; border-radius: 50%; background: radial-gradient(closest-side, var(--c) 35%, transparent 100%); }
        .pc-amb-1 { width: 560px; height: 560px; top: -180px; left: -140px; --c: var(--pc-gold); opacity: .18; }
        .pc-amb-2 { width: 520px; height: 520px; top: 35%; right: -180px; --c: #3348ff; opacity: .22; }
        .pc-amb-3 { width: 480px; height: 480px; bottom: -180px; left: 20%; --c: var(--pc-violet); opacity: .16; }
        .pc-amb-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: radial-gradient(ellipse at 50% 20%, #000, transparent 72%);
          mask-image: radial-gradient(ellipse at 50% 20%, #000, transparent 72%);
        }

        /* header sits just under the progress bar (z 60) */
        .pc-sticky-header { position: sticky; top: 0; z-index: 59; }

        .pc-progress-track { position: fixed; top: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.05); z-index: 60; }
        .pc-progress-fill { width: 100%; height: 100%; transform: scaleX(0); transform-origin: left; will-change: transform; background: linear-gradient(90deg, var(--pc-gold), var(--pc-cyan), var(--pc-violet)); box-shadow: 0 0 14px var(--pc-cyan); }

        .pc-content { transition: opacity .35s ease; }

        /* ---------- Hero ---------- */
        .pc-hero { position: relative; padding: clamp(3.5rem, 8vw, 6.5rem) 1.25rem clamp(3rem, 6vw, 5rem); overflow: hidden; border-bottom: 1px solid var(--pc-line); }
        .pc-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; background-color: #0a1022; }
        .pc-hero-bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(6,9,18,.92), rgba(6,9,18,.6)), linear-gradient(to top, var(--pc-bg), transparent 45%); }

        .pc-orb { position: absolute; border-radius: 50%; background: radial-gradient(closest-side, var(--c) 35%, transparent 100%); pointer-events: none; }
        .pc-orb-a { width: 400px; height: 400px; --c: var(--pc-gold); opacity: .22; top: -140px; left: -80px; }
        .pc-orb-b { width: 360px; height: 360px; --c: var(--pc-cyan); opacity: .2; bottom: -150px; right: -80px; }

        .pc-hero-inner { position: relative; z-index: 2; max-width: 76rem; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
        @media (min-width: 960px) { .pc-hero-inner { grid-template-columns: 1.4fr 1fr; align-items: center; } }

        .pc-kicker { display: inline-flex; align-items: center; gap: .65rem; margin-bottom: 1.4rem; padding: .4rem .95rem .4rem .75rem; border-radius: 999px; border: 1px solid var(--pc-line); background: var(--pc-glass); backdrop-filter: blur(10px); }
        .pc-kicker-dot { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--pc-live); }
        .pc-kicker-dot::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: var(--pc-live); animation: pcPulse 1.8s ease-out infinite; }
        .pc-kicker span { font-size: .8rem; color: var(--pc-soft); font-weight: 600; }

        .pc-hero h1 {
          font-size: clamp(2.3rem, 5.6vw, 4rem); font-weight: 800; line-height: 1.04; max-width: 36rem;
          background: linear-gradient(100deg, #fff 15%, var(--pc-gold) 42%, var(--pc-cyan) 62%, #fff 88%);
          background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
          background-position: 50% 0;
          filter: drop-shadow(0 0 28px rgba(242,193,78,.25));
        }
        .pc-hero .pc-subtitle { margin-top: 1rem; max-width: 34rem; color: var(--pc-ink); font-size: 1.12rem; font-weight: 600; line-height: 1.5; }
        .pc-hero p.pc-lead { margin-top: 1.3rem; max-width: 34rem; color: var(--pc-soft); font-size: 1.02rem; line-height: 1.75; }

        .pc-cta {
          position: relative; overflow: hidden; margin-top: 2.2rem; display: inline-flex; align-items: center; gap: .6rem;
          padding: .95rem 1.8rem; border-radius: 999px; border: none; cursor: pointer; font: 700 .94rem 'Figtree', sans-serif; color: #0a0e1c;
          background: linear-gradient(100deg, var(--pc-gold), #ffdf8a 50%, var(--pc-cyan));
          box-shadow: 0 0 0 1px rgba(255,255,255,.2) inset, 0 12px 40px -8px rgba(242,193,78,.55);
          transition: transform .25s ease;
        }
        .pc-cta:hover { transform: translateY(-3px) scale(1.02); }
        .pc-cta svg { width: 16px; height: 16px; transition: transform .25s ease; }
        .pc-cta:hover svg { transform: translateX(5px); }

        /* ---------- Glass + glowing border ---------- */
        .pc-glass {
          position: relative; isolation: isolate;
          background: var(--pc-glass); border: 1px solid var(--pc-line);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-radius: 22px; box-shadow: 0 30px 60px -36px rgba(0,0,0,.8);
        }
        .pc-glow-border::after {
          content: ''; position: absolute; inset: 0; padding: 1.5px; border-radius: inherit; pointer-events: none;
          background: conic-gradient(from var(--ang), transparent 0 60%, var(--accent) 82%, transparent 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
          animation: pcSpin 6s linear infinite;
        }

        .pc-stat-card { padding: 1.7rem 1.8rem; --accent: var(--pc-cyan); box-shadow: 0 30px 80px -30px rgba(61,214,208,.35); }
        .pc-stat-card-head { display: flex; justify-content: space-between; font-size: .75rem; font-weight: 700; letter-spacing: .04em; color: var(--pc-soft); padding-bottom: .9rem; border-bottom: 1px solid var(--pc-line); margin-bottom: .6rem; }
        .pc-stat-row { display: flex; justify-content: space-between; align-items: center; padding: .8rem 0; }
        .pc-stat-row + .pc-stat-row { border-top: 1px solid var(--pc-line); }
        .pc-stat-label { font-size: .88rem; color: var(--pc-soft); }
        .pc-stat-value { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.9rem; background: linear-gradient(100deg, var(--pc-gold), var(--pc-cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 14px rgba(61,214,208,.45)); }

        /* ---------- Live ticker ---------- */
        .pc-ticker { position: relative; overflow: hidden; border-bottom: 1px solid var(--pc-line); background: rgba(255,255,255,.025); }
        .pc-ticker::before, .pc-ticker::after { content: ''; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2; pointer-events: none; }
        .pc-ticker::before { left: 0; background: linear-gradient(to right, var(--pc-bg), transparent); }
        .pc-ticker::after { right: 0; background: linear-gradient(to left, var(--pc-bg), transparent); }
        /* spacing is padding on each item (not flex gap) so -50% lands exactly on the loop point */
        .pc-ticker-track { display: flex; width: max-content; padding: .85rem 0; animation: pcMarquee 50s linear infinite; will-change: transform; }
        .pc-ticker:hover .pc-ticker-track { animation-play-state: paused; }
        .pc-ticker-item { display: inline-flex; align-items: center; gap: .7rem; padding-right: 3rem; font-size: .84rem; color: var(--pc-soft); white-space: nowrap; }
        .pc-ticker-item i { width: 6px; height: 6px; border-radius: 50%; background: var(--pc-gold); box-shadow: 0 0 10px var(--pc-gold); }
        .pc-ticker-item b { color: var(--pc-ink); font-weight: 600; }
        @keyframes pcMarquee { to { transform: translateX(-50%); } }

        /* ---------- Sections ---------- */
        .pc-section { max-width: 76rem; margin: 0 auto; padding: clamp(2.6rem, 6vw, 4.2rem) 1.25rem; }
        .pc-section-head { margin-bottom: 2.1rem; }
        .pc-eyebrow { display: flex; align-items: center; gap: .7rem; font-size: .78rem; font-weight: 700; letter-spacing: .04em; color: var(--accent); margin-bottom: .6rem; text-shadow: 0 0 16px var(--accent); }
        .pc-eyebrow::after { content: ''; height: 2px; width: 64px; border-radius: 2px; background: linear-gradient(90deg, var(--accent), transparent); box-shadow: 0 0 10px var(--accent); }
        .pc-section-head h2 { font-family: 'Bricolage Grotesque', sans-serif; letter-spacing: -.02em; font-weight: 800; font-size: clamp(1.5rem, 3.2vw, 2.1rem); color: var(--pc-ink); }
        .pc-section-head p { font-size: .92rem; color: var(--pc-soft); margin-top: .4rem; max-width: 34rem; line-height: 1.6; }
        .pc-sec-gold { --accent: var(--pc-gold); }
        .pc-sec-cyan { --accent: var(--pc-cyan); }
        .pc-sec-violet { --accent: var(--pc-violet); }
        .pc-sec-live { --accent: var(--pc-live); }

        .pc-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; }
        @media (min-width: 560px) { .pc-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 860px) { .pc-grid { grid-template-columns: repeat(4,1fr); } }
        @media (min-width: 1180px) { .pc-grid { grid-template-columns: repeat(5,1fr); } }
        /* teams: 6 cards must not leave one orphan (2 / 3 / 3 / 6 columns) */
        .pc-grid-teams { grid-template-columns: repeat(2,1fr); }
        @media (min-width: 560px) { .pc-grid-teams { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1180px) { .pc-grid-teams { grid-template-columns: repeat(6,1fr); } }

        /* ---------- Cards ---------- */
        .pc-root .tone-gold { --accent: var(--pc-gold); }
        .pc-root .tone-a { --accent: var(--pc-cyan); }
        .pc-root .tone-c { --accent: var(--pc-violet); }

        .pc-card {
          position: relative; isolation: isolate; overflow: hidden; cursor: pointer;
          background: var(--pc-glass); border: 1px solid var(--pc-line); border-radius: 20px;
          backdrop-filter: blur(12px);
          transition: transform .35s cubic-bezier(.2,.8,.2,1), border-color .35s, box-shadow .35s;
        }
        .pc-card::before {
          content: ''; position: absolute; inset: 0; z-index: 1; border-radius: inherit; pointer-events: none;
          background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, var(--accent) 28%, transparent), transparent 62%);
          opacity: 0; transition: opacity .35s;
        }
        .pc-card::after {
          content: ''; position: absolute; inset: 0; z-index: 3; padding: 1.5px; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .35s;
          background: conic-gradient(from var(--ang), transparent 0 60%, var(--accent) 82%, transparent 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
        }
        @media (hover: hover) {
          .pc-card:hover { transform: translateY(-8px); border-color: color-mix(in srgb, var(--accent) 45%, transparent); box-shadow: 0 26px 60px -22px color-mix(in srgb, var(--accent) 70%, transparent); }
          .pc-card:hover::before { opacity: 1; }
          .pc-card:hover::after { opacity: 1; animation: pcSpin 6s linear infinite; }
        }
        .pc-card:focus-visible { transform: translateY(-4px); border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
        .pc-card:focus-visible::after { opacity: 1; }
        .pc-root :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

        .pc-media { position: relative; width: 100%; aspect-ratio: 4 / 5; background: #0d1530; overflow: hidden; }
        .pc-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .7s cubic-bezier(.2,.8,.2,1); }
        @media (hover: hover) { .pc-card:hover .pc-media img { transform: scale(1.08); } }
        .pc-media-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,9,18,.85), transparent 60%); }
        .pc-media-fallback {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 2.6rem; color: var(--accent);
          background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--accent) 30%, #10183a), #0a1024 70%);
          text-shadow: 0 0 26px var(--accent);
        }
        .pc-media-logo { aspect-ratio: 1 / 1; padding: 0; }
        .pc-media-logo img { object-fit: contain; padding: 1.2rem; }

        .pc-card-body { position: relative; z-index: 2; padding: 1rem 1.05rem 1.2rem; }
        .pc-card-body h3 { font-size: .95rem; font-weight: 700; line-height: 1.3; color: var(--pc-ink); }
        .pc-card-sub { font-size: .8rem; color: var(--pc-soft); margin-top: .25rem; }
        .pc-pill { display: inline-block; margin-top: .65rem; font-size: .75rem; font-weight: 700; padding: .25rem .7rem; border-radius: 999px; color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); }

        /* ---------- Modal ---------- */
        .pc-modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(3,5,12,.75); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 1rem; overflow-y: auto; }
        .pc-modal-box { position: relative; overflow: hidden; max-width: 480px; width: 100%; border-radius: 26px; background: linear-gradient(180deg, #121a36, #0a1022); border: 1px solid rgba(255,255,255,.12); box-shadow: 0 40px 90px -20px rgba(0,0,0,.8), 0 0 80px -20px var(--accent); }
        .pc-modal-close { position: absolute; top: 1rem; right: 1rem; z-index: 10; width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--pc-line); background: rgba(6,9,18,.6); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; transition: background .2s, transform .3s, box-shadow .2s; }
        .pc-modal-close:hover { background: var(--accent); color: #0a0e1c; transform: rotate(90deg); box-shadow: 0 0 20px var(--accent); }
        .pc-modal-banner { position: relative; width: 100%; aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--accent) 45%, #10183a), #0a1024 75%); overflow: hidden; }
        .pc-modal-banner img { width: 100%; height: 100%; object-fit: cover; }
        .pc-modal-banner::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, #0a1022, transparent 55%); }
        .pc-modal-initial { font-family: 'Bricolage Grotesque', sans-serif; font-size: 3.8rem; font-weight: 800; color: var(--accent); text-shadow: 0 0 34px var(--accent); }
        .pc-modal-content { position: relative; padding: 1.4rem 2rem 2rem; text-align: center; }
        .pc-modal-content h2 { font-family: 'Bricolage Grotesque', sans-serif; letter-spacing: -.02em; font-size: 1.8rem; font-weight: 800; color: var(--accent); text-shadow: 0 0 26px color-mix(in srgb, var(--accent) 55%, transparent); margin-bottom: .6rem; }
        .pc-modal-content p { color: var(--pc-soft); font-size: .95rem; margin-top: .55rem; }
        .pc-modal-content p strong { color: var(--pc-ink); }
        .pc-modal-btn { margin-top: 1.6rem; padding: .7rem 1.7rem; border: none; border-radius: 999px; cursor: pointer; font: 700 .9rem 'Figtree', sans-serif; color: #0a0e1c; background: var(--accent); box-shadow: 0 10px 30px -8px var(--accent); transition: transform .2s; }
        .pc-modal-btn:hover { transform: translateY(-2px); }

        /* ---------- Report + feed ---------- */
        .pc-report-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 1024px) { .pc-report-grid { grid-template-columns: 1.5fr 1fr; } }
        .pc-report { padding: 1.4rem; --accent: var(--pc-live); }
        .pc-report-media { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 16px; overflow: hidden; background: radial-gradient(circle at 30% 20%, #1a2550, #0a1024 75%); }
        .pc-report-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.8,.2,1); }
        @media (hover: hover) { .pc-report:hover .pc-report-media img { transform: scale(1.05); } }
        .pc-report-media-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,9,18,.85), transparent 60%); }
        .pc-report-badge { position: absolute; left: 1.1rem; bottom: 1.1rem; display: inline-flex; align-items: center; gap: .5rem; background: rgba(6,9,18,.7); border: 1px solid color-mix(in srgb, var(--pc-live) 55%, transparent); color: #ff9db0; backdrop-filter: blur(8px); font-size: .78rem; font-weight: 700; padding: .38rem .9rem; border-radius: 999px; box-shadow: 0 0 22px -4px var(--pc-live); }
        .pc-report-badge::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--pc-live); }
        /* not clickable (no link in the data), so no pointer cursor */
        .pc-report-title { font-family: 'Bricolage Grotesque', sans-serif; letter-spacing: -.02em; font-weight: 800; font-size: clamp(1.3rem, 2.6vw, 1.85rem); line-height: 1.22; margin-top: 1.3rem; transition: color .25s, text-shadow .25s; color: var(--pc-ink); }
        .pc-report-title:hover { color: var(--pc-gold); text-shadow: 0 0 26px rgba(242,193,78,.5); }
        .pc-report-desc { color: var(--pc-soft); font-size: .93rem; line-height: 1.7; margin-top: .75rem; }
        .pc-report-meta { font-size: .8rem; color: var(--pc-soft); margin-top: 1.1rem; padding-top: .95rem; border-top: 1px solid var(--pc-line); }

        .pc-feed { padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; height: 100%; --accent: var(--pc-gold); }
        .pc-feed h3 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.1rem; padding-bottom: .95rem; border-bottom: 1px solid var(--pc-line); margin-bottom: .4rem; color: var(--pc-ink); }
        .pc-feed-item { display: flex; gap: .9rem; padding: 1rem 0; transition: transform .25s; }
        .pc-feed-item + .pc-feed-item { border-top: 1px solid var(--pc-line); }
        .pc-feed-item:hover { transform: translateX(6px); }
        .pc-feed-dot { width: 8px; height: 8px; margin-top: .42rem; border-radius: 50%; background: rgba(255,255,255,.2); flex-shrink: 0; transition: background .25s, box-shadow .25s; }
        .pc-feed-item:hover .pc-feed-dot { background: var(--pc-gold); box-shadow: 0 0 12px var(--pc-gold); }
        .pc-feed-date { font-size: .75rem; color: var(--pc-soft); margin-bottom: .2rem; }
        .pc-feed-title { font-size: .88rem; line-height: 1.45; transition: color .25s; color: var(--pc-ink); }
        .pc-feed-item:hover .pc-feed-title { color: var(--pc-gold); }
        .pc-more-btn { position: relative; overflow: hidden; margin-top: 1rem; width: 100%; text-align: center; padding: .85rem; font: 700 .85rem 'Figtree', sans-serif; color: #0a0e1c; border: none; border-radius: 999px; cursor: pointer; background: linear-gradient(100deg, var(--pc-gold), #ffdf8a); box-shadow: 0 12px 32px -10px rgba(242,193,78,.6); transition: transform .2s, box-shadow .2s; }
        .pc-more-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px -8px rgba(242,193,78,.75); }

        /* ---------- Hub ---------- */
        .pc-hub-grid { display: grid; grid-template-columns: 1fr; gap: 1.1rem; }
        @media (min-width: 768px) { .pc-hub-grid { grid-template-columns: repeat(3,1fr); } }
        .pc-hub-card { padding: 1.8rem; display: flex; flex-direction: column; justify-content: space-between; transition: transform .35s cubic-bezier(.2,.8,.2,1), border-color .35s, box-shadow .35s; }
        .pc-hub-card::before { content: ''; position: absolute; inset: 0; z-index: 0; border-radius: inherit; pointer-events: none; background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, var(--accent) 24%, transparent), transparent 62%); opacity: 0; transition: opacity .35s; }
        @media (hover: hover) {
          .pc-hub-card:hover { transform: translateY(-8px); border-color: color-mix(in srgb, var(--accent) 45%, transparent); box-shadow: 0 26px 60px -22px color-mix(in srgb, var(--accent) 70%, transparent); }
          .pc-hub-card:hover::before { opacity: 1; }
        }
        .pc-hub-card.a { --accent: var(--pc-cyan); }
        .pc-hub-card.b { --accent: var(--pc-live); }
        .pc-hub-card.c { --accent: var(--pc-gold); }
        .pc-hub-card > div, .pc-hub-card > button { position: relative; z-index: 2; }
        .pc-hub-icon { width: 3rem; height: 3rem; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 1.2rem; background: color-mix(in srgb, var(--accent) 16%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); box-shadow: 0 0 28px -4px var(--accent); transition: transform .4s cubic-bezier(.2,.8,.2,1); }
        @media (hover: hover) { .pc-hub-card:hover .pc-hub-icon { transform: scale(1.12) rotate(-6deg); } }
        .pc-hub-card h3 { font-family: 'Bricolage Grotesque', sans-serif; letter-spacing: -.01em; font-weight: 800; font-size: 1.2rem; color: var(--pc-ink); }
        .pc-hub-card p { color: var(--pc-soft); font-size: .88rem; line-height: 1.65; margin: .6rem 0 1.7rem; }
        .pc-hub-btn { align-self: flex-start; font: 700 .82rem 'Figtree', sans-serif; color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); padding: .7rem 1.25rem; border-radius: 999px; cursor: pointer; transition: background .25s, color .25s, box-shadow .25s; }
        .pc-hub-btn:hover { background: var(--accent); color: #0a0e1c; box-shadow: 0 0 28px -2px var(--accent); }

        /* ---------- Footer note (admin: "Footer / Bottom Notice Text") ---------- */
        .pc-footer-note { max-width: 76rem; margin: 0 auto; padding: 2rem 1.25rem 3rem; text-align: center; color: var(--pc-soft); font-size: .85rem; line-height: 1.6; border-top: 1px solid var(--pc-line); }

        /* ---------- Phones & touch: skip costly blur effects for smooth scrolling ---------- */
        @media (max-width: 900px), (pointer: coarse) {
          .pc-glass, .pc-card, .pc-kicker, .pc-report-badge { backdrop-filter: none; -webkit-backdrop-filter: none; }
          .pc-sticky-header header { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background-color: rgba(10,18,36,.97) !important; }
          .pc-modal-overlay { backdrop-filter: none; background: rgba(3,5,12,.88); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pc-root *, .pc-root *::before, .pc-root *::after { animation: none !important; transition: none !important; }
          .pc-reveal { opacity: 1 !important; }
          .pc-hero h1 { color: var(--pc-ink); -webkit-text-fill-color: var(--pc-ink); background: none; }
        }
      `}</style>

      <div className="pc-ambient" aria-hidden="true">
        <span className="pc-amb-orb pc-amb-1" />
        <span className="pc-amb-orb pc-amb-2" />
        <span className="pc-amb-orb pc-amb-3" />
        <span className="pc-amb-grid" />
      </div>

      <ScrollProgress />

      {/* HEADER */}
      <div className="pc-sticky-header">
        <Header />
      </div>

      {/* Everything below fades in once real data has loaded (no sample-data flash) */}
      <div className="pc-content" style={{ opacity: ready ? 1 : 0 }}>

        {/* HERO */}
        <section className="pc-hero">
          {homeData.bannerImageUrl && (
            <div className="pc-hero-bg" style={{ backgroundImage: `url(${JSON.stringify(homeData.bannerImageUrl)})` }} />
          )}
          <div className="pc-orb pc-orb-a" />
          <div className="pc-orb pc-orb-b" />

          <div className="pc-hero-inner">
            <div>
              <div className="pc-kicker">
                <span className="pc-kicker-dot" />
                <span>Live match center &amp; squad tracker</span>
              </div>
              <h1 className="pc-display">{homeData.title}</h1>
              {homeData.subTitle && <p className="pc-subtitle">{homeData.subTitle}</p>}
              <p className="pc-lead">{homeData.topText}</p>
              {/* Explore Now Button updated with /sports/cricket/tournament path */}
              <button className="pc-cta" onClick={() => navigate('/sports/cricket/tournament')}>
                <span>{homeData.exploreButtonText}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            <Reveal delay={150} className="pc-glass pc-glow-border pc-stat-card">
              <div className="pc-stat-card-head">
                <span>SQUAD OVERVIEW</span>
                <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="pc-stat-row">
                <span className="pc-stat-label">Official Players</span>
                <StatNumber value={homeData.officialPlayers.length} />
              </div>
              <div className="pc-stat-row">
                <span className="pc-stat-label">Central Teams</span>
                <StatNumber value={homeData.centralTeams.length} />
              </div>
              <div className="pc-stat-row">
                <span className="pc-stat-label">Franchise teams</span>
                <StatNumber value={homeData.franchiseTeams.length} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* HEADLINE TICKER */}
        <div className="pc-ticker" aria-hidden="true" style={hide(homeData.latestHeadlines.length > 0)}>
          <div className="pc-ticker-track">
            {tickerItems.map((item, i) => (
              <span key={i} className="pc-ticker-item">
                <i /> <b>{item.date || item.time}</b> {item.title}
              </span>
            ))}
          </div>
        </div>

        {/* OFFICIAL NATIONAL TEAM */}
        <section className="pc-section pc-sec-gold" style={hide(homeData.officialPlayers.length > 0)}>
          <Reveal className="pc-section-head">
            <div>
              <div className="pc-eyebrow">Squad</div>
              <h2>{homeData.officialTeamHeading}</h2>
              {homeData.officialTeamSubText && <p>{homeData.officialTeamSubText}</p>}
            </div>
          </Reveal>

          <div className="pc-grid">
            {homeData.officialPlayers.map((player, idx) => renderPlayerCard(player, idx))}
          </div>
        </section>

        {/* CENTRAL TEAMS */}
        <section className="pc-section pc-sec-cyan" style={hide(homeData.centralTeams.length > 0)}>
          <Reveal className="pc-section-head">
            <div>
              <div className="pc-eyebrow">Domestic</div>
              <h2>{homeData.centralTeamHeading}</h2>
              {homeData.centralTeamSubText && <p>{homeData.centralTeamSubText}</p>}
            </div>
          </Reveal>

          <div className="pc-grid pc-grid-teams">
            {homeData.centralTeams.map((team, idx) => renderTeamCard(team, idx, team.zone, team.coach, 'a'))}
          </div>
        </section>

        {/* FRANCHISE TEAMS */}
        <section className="pc-section pc-sec-violet" style={hide(homeData.franchiseTeams.length > 0)}>
          <Reveal className="pc-section-head">
            <div>
              <div className="pc-eyebrow">League</div>
              <h2>{homeData.franchiseTeamHeading}</h2>
              {homeData.franchiseTeamSubText && <p>{homeData.franchiseTeamSubText}</p>}
            </div>
          </Reveal>

          <div className="pc-grid pc-grid-teams">
            {homeData.franchiseTeams.map((team, idx) => renderTeamCard(team, idx, team.captain ? `Captain: ${team.captain}` : '', team.owner, 'c'))}
          </div>
        </section>

        {/* MATCH REPORT + HEADLINES */}
        <section className="pc-section pc-sec-live">
          <Reveal className="pc-section-head">
            <div>
              <div className="pc-eyebrow">On the field</div>
              <h2>{homeData.headlinesHeading}</h2>
            </div>
          </Reveal>

          <div className="pc-report-grid" style={hasReport ? undefined : { gridTemplateColumns: '1fr' }}>
            <Reveal className="pc-glass pc-glow-border pc-report" style={hide(hasReport)}>
              <div className="pc-report-media">
                <Media src={homeData.matchReportBannerUrl} alt="" fallback={null} />
                <div className="pc-report-media-shade" />
                <span className="pc-report-badge">{homeData.matchReportBadge}</span>
              </div>
              <h3 className="pc-report-title">{homeData.matchReportTitle}</h3>
              <p className="pc-report-desc">{homeData.matchReportDesc}</p>
              {homeData.matchReportMeta && <div className="pc-report-meta">{homeData.matchReportMeta}</div>}
            </Reveal>

            <Reveal delay={120} className="pc-glass pc-feed">
              <div>
                <h3>Latest wire</h3>
                {homeData.latestHeadlines.length === 0 && <p className="pc-card-sub">No headlines yet.</p>}
                {homeData.latestHeadlines.map((item, index) => (
                  <div key={index} className="pc-feed-item">
                    <span className="pc-feed-dot" />
                    <div>
                      <div className="pc-feed-date">{item.date || item.time}</div>
                      <div className="pc-feed-title">{item.title}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="pc-more-btn" onClick={() => navigate('/news')}>
                {homeData.moreNewsButtonText}
              </button>
            </Reveal>
          </div>
        </section>

        {/* TOURNAMENT HUB */}
        <section className="pc-section pc-sec-cyan">
          <Reveal className="pc-section-head">
            <div>
              <div className="pc-eyebrow">Control room</div>
              <h2>{homeData.tournamentHubHeading}</h2>
              {homeData.tournamentHubSubText && <p>{homeData.tournamentHubSubText}</p>}
            </div>
          </Reveal>

          <div className="pc-hub-grid">
            <Reveal className="pc-glass pc-hub-card a" onMouseMove={handleSpotlight}>
              <div>
                <div className="pc-hub-icon" aria-hidden="true">📅</div>
                <h3>Tournament schedule</h3>
                <p>View all upcoming fixtures, series timelines and ongoing championship calendars.</p>
              </div>
              <button className="pc-hub-btn" onClick={() => navigate('/sports/cricket/tournament')}>View schedule</button>
            </Reveal>

            <Reveal delay={100} className="pc-glass pc-hub-card b" onMouseMove={handleSpotlight}>
              <div>
                <div className="pc-hub-icon" aria-hidden="true">🔴</div>
                <h3>Ongoing &amp; live matches</h3>
                <p>Watch real-time ball-by-ball updates, live scores, and commentary streams.</p>
              </div>
              <button className="pc-hub-btn" onClick={() => navigate('/sports/cricket/live')}>Live center</button>
            </Reveal>

            <Reveal delay={200} className="pc-glass pc-hub-card c" onMouseMove={handleSpotlight}>
              <div>
                <div className="pc-hub-icon" aria-hidden="true">🕒</div>
                <h3>Tournament history</h3>
                <p>Explore archive scorecards, past tournament winners and historical stats.</p>
              </div>
              <button className="pc-hub-btn" onClick={() => navigate('/sports/cricket/tournament')}>Explore archives</button>
            </Reveal>
          </div>
        </section>

        {/* FOOTER NOTICE (controlled from admin panel) */}
        {homeData.footerText && <div className="pc-footer-note">{homeData.footerText}</div>}
      </div>

      {/* POPUP / MODAL FOR PROFILE DETAILS */}
      {profile && (
        <div className="pc-modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div
            ref={modalRef}
            className={`pc-modal-box ${profile.type === 'player' ? 'tone-gold' : (profile.captain ? 'tone-c' : 'tone-a')}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeBtnRef} className="pc-modal-close" aria-label="Close" onClick={() => setSelectedProfile(null)}>×</button>
            <div className="pc-modal-banner">
              <Media
                src={profile.imageUrl || profile.logoUrl}
                alt={profile.name}
                lazy={false}
                fallback={<span className="pc-modal-initial">{initials(profile.name)}</span>}
              />
            </div>
            <div className="pc-modal-content">
              <h2 id="pc-modal-title">{profile.name}</h2>
              {profile.type === 'player' ? (
                <p><strong>Role:</strong> {profile.role || 'Player'}</p>
              ) : (
                <div>
                  {teamRows.length === 0 && <p>No details added yet.</p>}
                  {teamRows.map(([label, value]) => (
                    <p key={label}><strong>{label}:</strong> {value}</p>
                  ))}
                </div>
              )}
              <button className="pc-modal-btn" onClick={() => setSelectedProfile(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CHome;