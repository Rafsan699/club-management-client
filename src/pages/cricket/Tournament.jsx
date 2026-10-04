import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import API from '../../services/api';

/* ------------------------------------------------------------------
   DESIGN: Professional Light Theme — corporate, clean, sophisticated.
   Light BG #f8fafc · Paper #ffffff · Ink #0f172a · Ink2 #334155 · Mute #64748b
   Primary Indigo #4f46e5 · Accent Cyan #0284c7 · Emerald #059669 · Rose #e11d48
   Type: Fraunces (display) + Manrope (body)
------------------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Manrope:wght@400;500;600;700&display=swap');

.tn-root{--bg:#f8fafc;--paper:#ffffff;--ink:#0f172a;--ink2:#334155;--mute:#64748b;--line:rgba(15,23,42,.08);--tint:#f1f5f9;
  --gold:#4f46e5;--gold2:#6366f1;--rose:#e11d48;--sky:#0284c7;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Manrope',system-ui,sans-serif;position:relative;overflow-x:clip;
  padding:calc(var(--hdr,70px) + 18px) 20px 90px}
.tn-root *{box-sizing:border-box}
.tn-header-fix{position:fixed;top:0;left:0;right:0;z-index:500;box-shadow:0 10px 30px -14px rgba(15,23,42,.08)}

/* ambient blobs */
.tn-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.tn-blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35}
.tn-blob.a{width:46vmax;height:46vmax;left:-14vmax;top:-10vmax;background:radial-gradient(circle,rgba(2,132,199,.15),transparent 65%);animation:tnFloatA 18s ease-in-out infinite alternate}
.tn-blob.b{width:40vmax;height:40vmax;right:-12vmax;top:10vmax;background:radial-gradient(circle,rgba(79,70,229,.15),transparent 65%);animation:tnFloatB 22s ease-in-out infinite alternate}
.tn-blob.c{width:44vmax;height:44vmax;left:25vmax;bottom:-22vmax;background:radial-gradient(circle,rgba(5,150,105,.12),transparent 65%);animation:tnFloatA 26s ease-in-out infinite alternate-reverse}
@keyframes tnFloatA{to{transform:translate(8vmax,6vmax) scale(1.15)}}
@keyframes tnFloatB{to{transform:translate(-8vmax,10vmax) scale(.9)}}

.tn-wrap{position:relative;z-index:1;max-width:940px;margin:0 auto}

/* hero */
.tn-hero{display:grid;grid-template-columns:1.2fr .8fr;gap:20px;align-items:center;padding:44px 0 34px}
.tn-kicker{display:inline-flex;align-items:center;gap:10px;padding:7px 14px;border-radius:99px;background:var(--paper);border:1px solid var(--line);font-size:13px;color:var(--gold);font-weight:700;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);opacity:0;animation:tnRise .8s .1s forwards cubic-bezier(.2,.8,.2,1)}
.tn-live{width:9px;height:9px;border-radius:50%;background:var(--rose);animation:tnPulse 1.8s infinite}
@keyframes tnPulse{70%{box-shadow:0 0 0 11px rgba(225,29,72,0)}0%{box-shadow:0 0 0 0 rgba(225,29,72,.4)}}
.tn-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(40px,8vw,84px);line-height:1;margin:20px 0 16px;letter-spacing:-.03em;color:var(--ink)}
.tn-title span{display:block;overflow:hidden;padding-bottom:.08em}
.tn-title i{display:inline-block;font-style:normal;transform:translateY(115%);animation:tnSlide 1s forwards cubic-bezier(.2,.9,.2,1)}
.tn-title span:nth-child(1) i{animation-delay:.2s}
.tn-title span:nth-child(2) i{background:linear-gradient(100deg,var(--gold),var(--sky),var(--emerald),var(--gold));background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation-name:tnSlide,tnShine;animation-duration:1s,7s;animation-delay:.38s,1.4s;animation-iteration-count:1,infinite;animation-fill-mode:forwards,none;animation-timing-function:cubic-bezier(.2,.9,.2,1),linear}
@keyframes tnSlide{to{transform:translateY(0)}}
@keyframes tnShine{to{background-position:-250% 0}}
.tn-sub{max-width:440px;margin:0;color:var(--mute);font-size:16px;line-height:1.7;opacity:0;animation:tnRise .9s .7s forwards}
@keyframes tnRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

/* trophy */
.tn-trophy{position:relative;width:min(100%,280px);justify-self:center;aspect-ratio:1;opacity:0;animation:tnRise 1s .6s forwards}
.tn-trophy svg{width:100%;height:100%;overflow:visible}
.tn-cup{animation:tnFloat 5s ease-in-out infinite;transform-origin:center}
@keyframes tnFloat{50%{transform:translateY(-10px)}}
.tn-orbit{transform-origin:100px 110px;animation:tnOrbit 18s linear infinite}
@keyframes tnOrbit{to{transform:rotate(360deg)}}
.tn-glint{animation:tnGlint 3.2s ease-in-out infinite}
@keyframes tnGlint{0%,100%{opacity:.2}50%{opacity:.9}}

/* tickets */
.tn-list{display:grid;gap:22px}
.tn-item{opacity:0;animation:tnRise .9s forwards cubic-bezier(.2,.8,.2,1);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.tn-item:hover,.tn-item:focus-within{transform:translateY(-6px)}

.tn-ticket{--stub:176px;position:relative;display:grid;grid-template-columns:var(--stub) 1fr;min-height:150px;cursor:pointer;outline:none;border-radius:24px;background:var(--paper);border:1px solid var(--line);
  box-shadow:0 4px 6px -1px rgba(15,23,42,.04),0 20px 25px -5px rgba(15,23,42,.06);
  -webkit-mask-image:radial-gradient(circle 13px at var(--stub) 0,#0000 98%,#000),radial-gradient(circle 13px at var(--stub) 100%,#0000 98%,#000);
  -webkit-mask-composite:source-in;
  mask-image:radial-gradient(circle 13px at var(--stub) 0,#0000 98%,#000),radial-gradient(circle 13px at var(--stub) 100%,#0000 98%,#000);
  mask-composite:intersect;
  transition:border-color .3s,box-shadow .3s}

.tn-ticket:hover,.tn-ticket:focus-visible{border-color:rgba(79,70,229,.4);box-shadow:0 10px 15px -3px rgba(15,23,42,.06),0 25px 30px -10px rgba(79,70,229,.1)}

.tn-stub{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:20px 10px;overflow:hidden;color:#fff;
  background:radial-gradient(circle at 20% 0%,var(--c),transparent 62%),linear-gradient(160deg,var(--ink),var(--ink2));
  border-right:2px dashed rgba(255,255,255,.28)}
.tn-stub::before{content:'';position:absolute;inset:auto -30% -45% -30%;aspect-ratio:1;border-radius:50%;border:1.5px solid var(--c);opacity:.35;transition:transform .8s cubic-bezier(.2,.8,.2,1),opacity .4s}
.tn-ticket:hover .tn-stub::before{transform:scale(1.25);opacity:.6}
.tn-stub b{position:relative;font-family:'Fraunces',serif;font-weight:800;font-size:56px;line-height:1;color:var(--c2)}
.tn-stub small{position:relative;font-size:12px;font-weight:600;color:rgba(255,255,255,.75)}

.tn-main{position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px 26px;overflow:hidden}
.tn-main::before{content:'';position:absolute;inset:0;background:radial-gradient(420px circle at 100% 0%,color-mix(in srgb,var(--c) 15%,transparent),transparent 70%);opacity:.55;transition:opacity .4s}
.tn-ticket:hover .tn-main::before{opacity:1}
.tn-text{position:relative;min-width:0}
.tn-text h3{margin:0;font-family:'Fraunces',serif;font-weight:600;font-size:clamp(20px,3.4vw,26px);line-height:1.2;color:var(--ink)}
.tn-line{display:block;width:38px;height:4px;margin:12px 0;border-radius:4px;background:linear-gradient(90deg,var(--c),var(--c2));transition:width .6s cubic-bezier(.2,.8,.2,1)}
.tn-ticket:hover .tn-line{width:96px}
.tn-text p{margin:0;max-width:430px;font-size:14px;line-height:1.65;color:var(--mute);font-weight:500}
.tn-go{position:relative;flex:none;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;border:1.5px solid var(--line);background:#fff;color:var(--ink);transition:background .35s,color .35s,transform .35s,border-color .35s}
.tn-go svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.tn-ticket:hover .tn-go,.tn-ticket:focus-visible .tn-go{background:linear-gradient(135deg,var(--c),var(--c2));border-color:transparent;color:#fff;transform:rotate(-45deg) scale(1.08)}
.tn-ticket:focus-visible .tn-main{box-shadow:inset 0 0 0 3px var(--c)}

/* loader */
.tn-loader{display:flex;flex-direction:column;align-items:center;gap:20px;padding:90px 0;color:var(--mute);font-weight:600}
.tn-bounce{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fda4af,#e11d48);animation:tnBounce .7s cubic-bezier(.3,0,.7,1) infinite alternate}
.tn-shadow{width:26px;height:6px;border-radius:50%;background:rgba(15,23,42,.15);margin-top:-14px;animation:tnSh .7s cubic-bezier(.3,0,.7,1) infinite alternate}
@keyframes tnBounce{from{transform:translateY(-46px)}to{transform:translateY(0)}}
@keyframes tnSh{from{transform:scale(.4);opacity:.3}to{transform:scale(1.2);opacity:.7}}

/* responsive */
@media (max-width:760px){
  .tn-hero{grid-template-columns:1fr;padding:26px 0 22px}
  .tn-trophy{display:none}
}
@media (max-width:600px){
  .tn-root{padding:calc(var(--hdr,70px) + 12px) 14px 70px}
  .tn-sub{font-size:14.5px}
  .tn-list{gap:18px}
  .tn-ticket{--sh:78px;grid-template-columns:1fr;grid-template-rows:var(--sh) auto;min-height:0;border-radius:22px;
    -webkit-mask-image:radial-gradient(circle 12px at 0 var(--sh),#0000 98%,#000),radial-gradient(circle 12px at 100% var(--sh),#0000 98%,#000);
    mask-image:radial-gradient(circle 12px at 0 var(--sh),#0000 98%,#000),radial-gradient(circle 12px at 100% var(--sh),#0000 98%,#000)}
  .tn-stub{flex-direction:row;justify-content:flex-start;gap:12px;padding:0 24px;border-right:0;border-bottom:2px dashed rgba(255,255,255,.28)}
  .tn-stub b{font-size:40px}
  .tn-stub::before{inset:-60% -10% auto auto;width:140px}
  .tn-main{padding:20px 18px 22px}
  .tn-go{width:44px;height:44px}
}
@media (prefers-reduced-motion:reduce){
  .tn-root *,.tn-root *::before,.tn-root *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .tn-title i,.tn-kicker,.tn-sub,.tn-trophy,.tn-item{opacity:1;transform:none}
}
`;

function Tournament() {
  const navigate = useNavigate();

  const [tournamentsFromDB, setTournamentsFromDB] = useState([]);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);
  const [hdr, setHdr] = useState(70);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHdr(el.offsetHeight > 0 ? el.offsetHeight : 70);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const res = await API.get('/api/cricket/tournaments');
        setTournamentsFromDB(res.data || []);
      } catch (error) {
        console.error('Error fetching tournaments from database:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const categoryDetails = {
    central_tournament: {
      title: "Central Cricket Tournament",
      themeColor: "#0284c7",
      themeLight: "#e0f2fe",
      description: "View central zonal cricket tournaments, knockout stages, and match updates."
    },
    franchise_tournament: {
      title: "Franchise Cricket Tournament",
      themeColor: "#059669",
      themeLight: "#d1fae5",
      description: "Check premier league franchise tournaments, auction stats, and trophy battles."
    },
    inter_university: {
      title: "Inter University Cricket Tournament",
      themeColor: "#4f46e5",
      themeLight: "#e0e7ff",
      description: "Explore inter-university championship fixtures, standings, and participating universities."
    }
  };

  const handleCategoryClick = (catKey) => {
    if (catKey === 'inter_university') {
      navigate('/sports/cricket/inter-tournament');
    } else if (catKey === 'central_tournament') {
      navigate('/sports/cricket/central-tournament');
    } else if (catKey === 'franchise_tournament') {
      navigate('/sports/cricket/franchise-tournament');
    }
  };

  return (
    <div className="tn-root" style={{ '--hdr': `${hdr}px` }}>
      <style>{CSS}</style>

      <div className="tn-ambient" aria-hidden="true">
        <div className="tn-blob a" />
        <div className="tn-blob b" />
        <div className="tn-blob c" />
      </div>

      <div className="tn-header-fix" ref={headerRef}>
        <Header />
      </div>

      <div className="tn-wrap">
        <section className="tn-hero">
          <div>
            <span className="tn-kicker"><i className="tn-live" /> Cricket</span>
            <h1 className="tn-title">
              <span><i>Pick your Tournament</i></span>
              <span><i>tournament.</i></span>
            </h1>
            <p className="tn-sub">
              Choose a group to see its tournaments, fixtures, and standings.
            </p>
          </div>

          <div className="tn-trophy" aria-hidden="true">
            <svg viewBox="0 0 200 220">
              <defs>
                <linearGradient id="tnGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#818cf8" />
                  <stop offset=".5" stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#3730a3" />
                </linearGradient>
              </defs>
              <g className="tn-orbit">
                <circle cx="100" cy="110" r="92" fill="none" stroke="#64748b" strokeOpacity=".2" strokeWidth="1.5" strokeDasharray="3 8" />
                <circle cx="100" cy="18" r="7" fill="#e11d48" />
                <circle cx="192" cy="110" r="4" fill="#0284c7" />
                <circle cx="8" cy="110" r="4" fill="#059669" />
              </g>
              <g className="tn-cup">
                <path d="M60 36h80v46c0 30-18 50-40 54-22-4-40-24-40-54z" fill="url(#tnGold)" />
                <path d="M60 48H38c0 24 10 38 28 42M140 48h22c0 24-10 38-28 42" fill="none" stroke="url(#tnGold)" strokeWidth="9" strokeLinecap="round" />
                <rect x="92" y="136" width="16" height="30" fill="url(#tnGold)" />
                <path d="M64 170h72l6 16H58z" fill="#0f172a" />
                <rect x="64" y="166" width="72" height="8" rx="3" fill="url(#tnGold)" />
                <path className="tn-glint" d="M74 50c-2 22 4 38 14 46" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </section>

        {loading && (
          <div className="tn-loader">
            <div className="tn-bounce" />
            <div className="tn-shadow" />
            <p>Loading tournaments...</p>
          </div>
        )}

        {!loading && (
          <div className="tn-list">
            {Object.keys(categoryDetails).map((catKey, idx) => {
              const cat = categoryDetails[catKey];
              const count = tournamentsFromDB.filter(t => t.category === catKey).length;

              return (
                <div
                  key={catKey}
                  className="tn-item"
                  style={{ '--c': cat.themeColor, '--c2': cat.themeLight, animationDelay: `${0.15 + idx * 0.14}s` }}
                >
                  <article
                    className="tn-ticket"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCategoryClick(catKey)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(catKey)}
                  >
                    <div className="tn-stub">
                      <b>{count}</b>
                      <small>{count === 1 ? 'tournament' : 'tournaments'}</small>
                    </div>

                    <div className="tn-main">
                      <div className="tn-text">
                        <h3>{cat.title}</h3>
                        <i className="tn-line" />
                        <p>{cat.description}</p>
                      </div>
                      <span className="tn-go" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </span>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tournament;