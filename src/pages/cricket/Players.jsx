import React, { useState, useEffect, useRef } from 'react';
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

.pl-root{--bg:#f8fafc;--paper:#ffffff;--ink:#0f172a;--ink2:#334155;--mute:#64748b;--line:rgba(15,23,42,.08);--tint:#f1f5f9;
  --gold:#4f46e5;--gold2:#6366f1;--emerald:#059669;--rose:#e11d48;--sky:#0284c7;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Manrope',system-ui,sans-serif;position:relative;
  overflow-x:clip;padding:calc(var(--hdr,70px) + 18px) 20px 90px}
.pl-root *{box-sizing:border-box}

/* fixed header */
.pl-header-fix{position:fixed;top:0;left:0;right:0;z-index:500;box-shadow:0 10px 30px -14px rgba(15,23,42,.08)}

/* ambient blobs */
.pl-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.pl-blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35}
.pl-blob.a{width:46vmax;height:46vmax;left:-14vmax;top:-10vmax;background:radial-gradient(circle,rgba(2,132,199,.15),transparent 65%);animation:plFloatA 18s ease-in-out infinite alternate}
.pl-blob.b{width:40vmax;height:40vmax;right:-12vmax;top:8vmax;background:radial-gradient(circle,rgba(79,70,229,.15),transparent 65%);animation:plFloatB 22s ease-in-out infinite alternate}
.pl-blob.c{width:44vmax;height:44vmax;left:25vmax;bottom:-22vmax;background:radial-gradient(circle,rgba(5,150,105,.12),transparent 65%);animation:plFloatA 26s ease-in-out infinite alternate-reverse}
@keyframes plFloatA{to{transform:translate(8vmax,6vmax) scale(1.15)}}
@keyframes plFloatB{to{transform:translate(-8vmax,10vmax) scale(.9)}}

.pl-wrap{position:relative;z-index:1;max-width:1120px;margin:0 auto}

/* hero */
.pl-hero{position:relative;padding:44px 0 30px;display:grid;grid-template-columns:1.15fr .85fr;gap:30px;align-items:center}
.pl-kicker{display:inline-flex;align-items:center;gap:10px;padding:7px 14px;border-radius:99px;background:var(--paper);border:1px solid var(--line);font-size:13px;color:var(--gold);font-weight:700;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);opacity:0;animation:plRise .8s .1s forwards cubic-bezier(.2,.8,.2,1)}
.pl-live{width:9px;height:9px;border-radius:50%;background:var(--rose);box-shadow:0 0 0 0 rgba(225,29,72,.4);animation:plPulse 1.8s infinite}
@keyframes plPulse{70%{box-shadow:0 0 0 11px rgba(225,29,72,0)}100%{box-shadow:0 0 0 0 rgba(225,29,72,0)}}
.pl-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(42px,8vw,94px);line-height:.98;margin:20px 0 18px;letter-spacing:-.03em;color:var(--ink)}
.pl-title span{display:block;overflow:hidden;padding-bottom:.08em}
.pl-title span i{display:inline-block;font-style:normal;transform:translateY(115%);animation:plSlide 1s forwards cubic-bezier(.2,.9,.2,1)}
.pl-title span:nth-child(1) i{animation-delay:.2s}
.pl-title span:nth-child(2) i{animation-delay:.38s;background:linear-gradient(100deg,var(--gold),var(--sky),var(--emerald),var(--gold));background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation-name:plSlide,plShine;animation-duration:1s,7s;animation-delay:.38s,1.4s;animation-iteration-count:1,infinite;animation-fill-mode:forwards,none;animation-timing-function:cubic-bezier(.2,.9,.2,1),linear}
@keyframes plSlide{to{transform:translateY(0)}}
@keyframes plShine{to{background-position:-250% 0}}
.pl-sub{max-width:460px;color:var(--mute);font-size:16px;line-height:1.7;opacity:0;animation:plRise .9s .7s forwards}
@keyframes plRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

/* hero ball arc */
.pl-arc{position:relative;aspect-ratio:1/.82;width:100%}
.pl-arc svg{width:100%;height:100%;overflow:visible}
.pl-arc .trail{fill:none;stroke:url(#plg);stroke-width:3;stroke-linecap:round;stroke-dasharray:6 9;animation:plDash 1.4s linear infinite}
@keyframes plDash{to{stroke-dashoffset:-30}}
.pl-ball{position:absolute;left:0;top:0;width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fda4af,#e11d48 50%,#9f1239);box-shadow:0 10px 24px rgba(225,29,72,.3);offset-path:path('M 20 300 Q 260 -80 520 250');offset-rotate:0deg;animation:plFly 4.8s cubic-bezier(.45,.05,.4,1) infinite}
.pl-ball::after{content:'';position:absolute;inset:0;border-radius:50%;border-top:2px dashed rgba(255,255,255,.85);transform:rotate(-30deg) scale(.72);animation:plSpin 1s linear infinite}
@keyframes plFly{0%{offset-distance:0%;opacity:0}8%{opacity:1}92%{opacity:1}100%{offset-distance:100%;opacity:0}}
@keyframes plSpin{to{transform:rotate(330deg) scale(.72)}}

/* hero stats */
.pl-stats{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);margin-top:14px;border:1px solid var(--line);border-radius:22px;overflow:hidden;background:rgba(255,255,255,.85);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 20px 40px -20px rgba(15,23,42,.08);opacity:0;animation:plRise 1s .9s forwards}
.pl-stat{position:relative;padding:24px 26px;border-right:1px solid var(--line)}
.pl-stat:last-child{border-right:0}
.pl-stat::before{content:'';position:absolute;left:26px;top:0;width:34px;height:4px;border-radius:0 0 4px 4px;background:var(--c,var(--gold))}
.pl-stat:nth-child(1){--c:var(--gold)}.pl-stat:nth-child(2){--c:var(--sky)}.pl-stat:nth-child(3){--c:var(--emerald)}.pl-stat:nth-child(4){--c:var(--rose)}
.pl-stat b{display:block;font-family:'Fraunces',serif;font-size:clamp(26px,4vw,46px);font-weight:800;line-height:1;color:var(--ink)}
.pl-stat small{display:block;margin-top:9px;color:var(--mute);font-size:13px;font-weight:600}

/* marquee */
.pl-marquee{position:relative;margin:36px -20px 0;padding:16px 0;background:linear-gradient(100deg,#ffffff,#f1f5f9 55%,#ffffff);overflow:hidden;box-shadow:0 10px 30px -15px rgba(15,23,42,.06);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.pl-track{display:flex;gap:46px;width:max-content;animation:plMarq 40s linear infinite}
.pl-marquee:hover .pl-track{animation-play-state:paused}
.pl-track span{display:inline-flex;align-items:center;gap:12px;font-family:'Fraunces',serif;font-size:22px;white-space:nowrap;color:var(--ink)}
.pl-track em{font-style:normal;font-family:'Manrope',sans-serif;font-size:13px;color:var(--gold);font-weight:700}
.pl-track span::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--gold)}
@keyframes plMarq{to{transform:translateX(-50%)}}

/* search */
.pl-find{position:sticky;top:calc(var(--hdr,70px) + 10px);z-index:400;display:flex;justify-content:flex-end;margin:26px 0 22px;pointer-events:none}
.pl-search{position:relative;width:min(250px,100%);pointer-events:auto}
.pl-search input{width:100%;padding:9px 38px 9px 38px;border-radius:99px;background:rgba(255,255,255,.9);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1.5px solid var(--line);color:var(--ink);font:600 13px 'Manrope',sans-serif;outline:none;box-shadow:0 8px 20px -10px rgba(15,23,42,.08);transition:border-color .25s,box-shadow .25s}
.pl-search input::placeholder{color:var(--mute);font-weight:500}
.pl-search input:focus{border-color:var(--gold);box-shadow:0 0 0 4px rgba(79,70,229,.15),0 8px 20px -10px rgba(15,23,42,.08)}
.pl-search>svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:15px;height:15px;stroke:var(--mute);fill:none;stroke-width:2.3;stroke-linecap:round;pointer-events:none}
.pl-count{position:absolute;right:10px;top:50%;transform:translateY(-50%);min-width:22px;padding:2px 7px;border-radius:99px;background:var(--tint);color:var(--gold);font-size:11px;font-weight:700;text-align:center;pointer-events:none}
.pl-clear{position:absolute;right:7px;top:50%;transform:translateY(-50%);width:22px;height:22px;border:0;border-radius:50%;background:var(--tint);color:var(--ink);font-size:10px;cursor:pointer;line-height:1}

/* grid + cards */
.pl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr));gap:26px}
.pl-reveal{opacity:0;transform:translateY(46px) scale(.97);transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1);transition-delay:var(--d,0s)}
.pl-reveal.in{opacity:1;transform:none}

.pl-card{--rx:0deg;--ry:0deg;--mx:50%;--my:0%;position:relative;border-radius:26px;padding:26px 24px 0;cursor:pointer;overflow:hidden;isolation:isolate;background:var(--paper);border:1px solid var(--line);
  box-shadow:0 4px 6px -1px rgba(15,23,42,.04),0 20px 25px -5px rgba(15,23,42,.06);
  transform:perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));transition:transform .25s ease-out,border-color .3s,box-shadow .3s;outline:none}
.pl-card:hover,.pl-card:focus-visible{border-color:rgba(79,70,229,.4);box-shadow:0 10px 15px -3px rgba(15,23,42,.06),0 25px 30px -10px rgba(79,70,229,.1)}
.pl-card::before{content:'';position:absolute;inset:0;z-index:-1;background:radial-gradient(280px circle at var(--mx) var(--my),rgba(79,70,229,.06),transparent 70%);opacity:0;transition:opacity .3s}
.pl-card:hover::before{opacity:1}
.pl-card::after{content:'';position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--gold),var(--sky),var(--emerald))}

.pl-head{display:flex;gap:16px;align-items:center}
.pl-head>div:last-child{min-width:0}
.pl-av{position:relative;flex:none;width:70px;height:70px;border-radius:50%;padding:3px;background:conic-gradient(from 0deg,var(--gold),var(--sky),var(--emerald),var(--gold));animation:plSpin2 7s linear infinite}
@keyframes plSpin2{to{transform:rotate(360deg)}}
.pl-av>*{animation:plSpin2 7s linear infinite reverse}
.pl-av img,.pl-av .ph{width:100%;height:100%;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);font-family:'Fraunces',serif;font-weight:800;font-size:22px;color:var(--gold);border:3px solid var(--paper)}
.pl-name{margin:0;font-family:'Fraunces',serif;font-size:21px;font-weight:600;line-height:1.15;color:var(--ink);overflow-wrap:anywhere}
.pl-meta{margin:5px 0 0;font-size:13px;color:var(--mute);line-height:1.5;font-weight:500;overflow-wrap:anywhere}
.pl-role{display:inline-block;margin-top:8px;padding:3px 11px;border-radius:99px;font-size:12px;font-weight:700;color:var(--gold);background:rgba(79,70,229,.08);border:1px solid rgba(79,70,229,.2)}

.pl-big{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
.pl-big div{padding:13px 6px;border-radius:16px;text-align:center;background:var(--tint)}
.pl-big b{display:block;font-family:'Fraunces',serif;font-size:27px;font-weight:800;line-height:1;color:var(--ink)}
.pl-big small{display:block;margin-top:6px;font-size:12px;color:var(--mute);font-weight:600}
.pl-bars{margin-top:16px;display:grid;gap:11px}
.pl-bar-row{display:grid;grid-template-columns:62px 1fr;align-items:center;gap:10px;font-size:12px;color:var(--mute);font-weight:600}
.pl-rail{height:7px;border-radius:9px;background:var(--tint);overflow:hidden}
.pl-fill{height:100%;width:0;border-radius:9px;transition:width 1.4s cubic-bezier(.2,.8,.2,1) .25s}
.in .pl-fill,.pl-open .pl-fill{width:var(--w)}
.pl-fill.runs{background:linear-gradient(90deg,var(--emerald),#34d399)}
.pl-fill.wkts{background:linear-gradient(90deg,var(--rose),#fb7185)}
.pl-fill.mtch{background:linear-gradient(90deg,var(--gold),var(--gold2))}

/* stat strip */
.pl-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:22px -24px 0;padding:15px 24px;background:linear-gradient(110deg,#f8fafc,#f1f5f9);color:var(--ink2);font-size:12px;font-weight:600;border-top:1px solid var(--line)}
.pl-foot b{color:var(--gold);font-family:'Fraunces',serif;font-size:16px;margin-left:5px}
.pl-foot .go{color:var(--gold);font-weight:700;display:inline-flex;gap:6px;align-items:center}
.pl-foot .go::after{content:'→';transition:transform .3s}
.pl-card:hover .pl-foot .go::after{transform:translateX(5px)}

/* states */
.pl-empty{grid-column:1/-1;text-align:center;padding:70px 20px;border-radius:26px;border:2px dashed var(--line);background:var(--paper);color:var(--mute)}
.pl-empty h3{font-family:'Fraunces',serif;color:var(--ink);font-size:26px;margin:14px 0 6px}
.pl-loader{display:flex;flex-direction:column;align-items:center;gap:20px;padding:90px 0;color:var(--mute);font-weight:600}
.pl-bounce{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fda4af,#e11d48);animation:plBounce .7s cubic-bezier(.3,0,.7,1) infinite alternate}
.pl-shadow{width:26px;height:6px;border-radius:50%;background:rgba(15,23,42,.15);margin-top:-14px;animation:plSh .7s cubic-bezier(.3,0,.7,1) infinite alternate}
@keyframes plBounce{from{transform:translateY(-46px)}to{transform:translateY(0)}}
@keyframes plSh{from{transform:scale(.4);opacity:.3}to{transform:scale(1.2);opacity:.7}}

/* modal */
.pl-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:plFade .35s ease}
@keyframes plFade{from{opacity:0}}
.pl-modal{position:relative;width:100%;max-width:500px;max-height:92vh;max-height:92dvh;overflow-y:auto;border-radius:30px;background:var(--paper);box-shadow:0 25px 50px -12px rgba(15,23,42,.25);border:1px solid var(--line);animation:plPop .6s cubic-bezier(.2,1.2,.3,1)}
@keyframes plPop{from{opacity:0;transform:translateY(60px) scale(.9)}}
.pl-banner{position:relative;padding:40px 24px 56px;text-align:center;overflow:hidden;color:var(--ink);background:radial-gradient(circle at 50% -10%,rgba(79,70,229,.1),transparent 60%),radial-gradient(circle at 100% 100%,rgba(2,132,199,.08),transparent 50%),linear-gradient(160deg,#f8fafc,#f1f5f9)}
.pl-banner .pl-av{width:124px;height:124px;margin:0 auto 16px;padding:4px;box-shadow:0 10px 25px -5px rgba(15,23,42,.1)}
.pl-banner .pl-av .ph{font-size:40px;border-color:var(--paper)}
.pl-banner .pl-av img{border-color:var(--paper)}
.pl-banner h2{position:relative;margin:0;font-family:'Fraunces',serif;font-size:30px;font-weight:800;color:var(--ink);overflow-wrap:anywhere}
.pl-banner p{position:relative;margin:6px 0 0;font-size:14px;color:var(--mute)}
.pl-banner .rl{display:inline-block;margin-top:12px;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;color:#ffffff;background:linear-gradient(100deg,var(--gold2),var(--gold))}
.pl-x{position:absolute;top:14px;right:14px;z-index:5;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer;font-size:15px;box-shadow:0 4px 10px rgba(15,23,42,.05);transition:transform .3s,background .3s,color .3s}
.pl-x:hover{transform:rotate(90deg);background:var(--rose);color:#fff;border-color:var(--rose)}
.pl-body{position:relative;margin-top:-28px;padding:26px 24px 26px;border-radius:28px 28px 0 0;background:var(--paper)}
.pl-body h4{margin:0 0 14px;font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:var(--ink)}
.pl-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}
.pl-tile{padding:14px 8px;border-radius:16px;text-align:center;background:var(--tint);opacity:0;animation:plRise .6s forwards}
.pl-tile b{display:block;font-family:'Fraunces',serif;font-size:25px;font-weight:800;line-height:1;color:var(--ink)}
.pl-tile small{display:block;margin-top:7px;font-size:12px;color:var(--mute);font-weight:600}
.pl-tile.dk{background:linear-gradient(150deg,#f1f5f9,#e2e8f0);box-shadow:inset 0 0 0 1px rgba(79,70,229,.15)}
.pl-tile.dk b{color:var(--gold)}
.pl-tile.dk small{color:var(--mute)}
.pl-tile:nth-child(1){animation-delay:.25s}.pl-tile:nth-child(2){animation-delay:.32s}.pl-tile:nth-child(3){animation-delay:.39s}
.pl-tile:nth-child(4){animation-delay:.46s}.pl-tile:nth-child(5){animation-delay:.53s}.pl-tile:nth-child(6){animation-delay:.6s}
.pl-close{width:100%;margin-top:22px;padding:14px;border:0;border-radius:15px;cursor:pointer;font:700 15px 'Manrope',sans-serif;color:#ffffff;background:linear-gradient(100deg,var(--gold2),var(--gold),var(--gold2));background-size:200% 100%;transition:background-position .6s,transform .2s,box-shadow .3s}
.pl-close:hover{background-position:100% 0;transform:translateY(-2px);box-shadow:0 10px 20px -8px rgba(79,70,229,.4)}

/* ---- RESPONSIVE ---- */
@media (max-width:820px){
  .pl-hero{grid-template-columns:1fr;padding-top:30px;gap:10px}
  .pl-arc{display:none}
  .pl-stats{grid-template-columns:repeat(2,1fr)}
  .pl-stat:nth-child(2){border-right:0}
  .pl-stat:nth-child(-n+2){border-bottom:1px solid var(--line)}
}
@media (max-width:560px){
  .pl-root{padding:calc(var(--hdr,70px) + 12px) 14px 70px}
  .pl-hero{padding:20px 0 18px}
  .pl-sub{font-size:14.5px}
  .pl-stat{padding:18px 16px}
  .pl-stat::before{left:16px}
  .pl-marquee{margin:26px -14px 0;padding:12px 0}
  .pl-track{gap:32px}
  .pl-track span{font-size:18px}
  .pl-find{justify-content:center;margin:20px 0 18px}
  .pl-search{width:min(230px,80%)}
  .pl-grid{gap:18px}
  .pl-card{padding:24px 18px 0;border-radius:22px}
  .pl-av{width:62px;height:62px}
  .pl-name{font-size:19px}
  .pl-big{gap:8px}
  .pl-big b{font-size:23px}
  .pl-foot{margin:20px -18px 0;padding:13px 18px;font-size:11px}
  .pl-foot b{font-size:14px}
  .pl-overlay{padding:10px}
  .pl-modal{border-radius:26px}
  .pl-banner{padding:34px 16px 52px}
  .pl-banner .pl-av{width:104px;height:104px}
  .pl-banner h2{font-size:25px}
  .pl-body{padding:22px 16px 22px}
  .pl-tiles{gap:8px}
  .pl-tile{padding:12px 4px}
  .pl-tile b{font-size:21px}
}
@media (max-width:340px){.pl-foot .go{display:none}}
@media (prefers-reduced-motion:reduce){
  .pl-root *,.pl-root *::before,.pl-root *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .pl-reveal{opacity:1;transform:none}
  .pl-title span i,.pl-kicker,.pl-sub,.pl-stats,.pl-tile{opacity:1;transform:none}
}
`;

function useCountUp(target, duration = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function HeroStat({ value, label }) {
  const n = useCountUp(value);
  return (
    <div className="pl-stat">
      <b>{n.toLocaleString()}</b>
      <small>{label}</small>
    </div>
  );
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`pl-reveal ${shown ? 'in' : ''}`} style={{ '--d': `${delay}s` }}>
      {children}
    </div>
  );
}

function Avatar({ player }) {
  return (
    <div className="pl-av">
      {player.image ? (
        <img src={player.image} alt={player.name} />
      ) : (
        <div className="ph">{player.name ? player.name.substring(0, 2).toUpperCase() : 'PL'}</div>
      )}
    </div>
  );
}

const pct = (v, max) => `${max > 0 ? Math.min(100, Math.round(((Number(v) || 0) / max) * 100)) : 0}%`;

function Players() {
  const [searchTerm, setSearchTerm] = useState('');
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/cricket/club/players');
      if (res && Array.isArray(res.data)) {
        setPlayersData(res.data);
        localStorage.setItem('clubCricketPlayers', JSON.stringify(res.data));
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching players from database:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const localData = localStorage.getItem('clubCricketPlayers');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        setPlayersData(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setPlayersData([]);
      }
    } else {
      setPlayersData([]);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const handleStorageChange = () => fetchPlayers();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', fetchPlayers);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', fetchPlayers);
    };
  }, []);

  useEffect(() => {
    if (!selectedPlayer) return;
    const onKey = (e) => e.key === 'Escape' && setSelectedPlayer(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedPlayer]);

  const filteredPlayers = playersData.filter(player =>
    player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sum = (key) => playersData.reduce((a, p) => a + (Number(p.stats?.[key]) || 0), 0);
  const max = (key) => playersData.reduce((a, p) => Math.max(a, Number(p.stats?.[key]) || 0), 0);
  const maxRuns = max('runs');
  const maxWkts = max('wickets');
  const maxMatches = max('matches');
  const marqueeItems = [...playersData]
    .sort((a, b) => (Number(b.stats?.runs) || 0) - (Number(a.stats?.runs) || 0))
    .slice(0, 10);

  const handleTilt = (e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  const resetTilt = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  return (
    <div className="pl-root" style={{ '--hdr': `${hdr}px` }}>
      <style>{CSS}</style>

      <div className="pl-ambient" aria-hidden="true">
        <div className="pl-blob a" />
        <div className="pl-blob b" />
        <div className="pl-blob c" />
      </div>

      <div className="pl-header-fix" ref={headerRef}>
        <Header />
      </div>

      <div className="pl-wrap">
        <section className="pl-hero">
          <div>
            <span className="pl-kicker"><i className="pl-live" /> Club cricket squad</span>
            <h1 className="pl-title">
              <span><i>Meet the</i></span>
              <span><i>players.</i></span>
            </h1>
            <p className="pl-sub">
              Every batter, bowler and all-rounder in one place. Search the squad and open any card for full career numbers.
            </p>
          </div>

          <div className="pl-arc" aria-hidden="true">
            <svg viewBox="0 0 540 330">
              <defs>
                <linearGradient id="plg" x1="0" x2="1">
                  <stop offset="0" stopColor="#0284c7" stopOpacity="0" />
                  <stop offset=".5" stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <path className="trail" d="M 20 300 Q 260 -80 520 250" />
              <ellipse cx="520" cy="262" rx="26" ry="7" fill="rgba(15,23,42,.1)" />
            </svg>
            <div className="pl-ball" />
          </div>

          {!loading && (
            <div className="pl-stats">
              <HeroStat value={playersData.length} label="Players in squad" />
              <HeroStat value={sum('matches')} label="Matches played" />
              <HeroStat value={sum('runs')} label="Runs scored" />
              <HeroStat value={sum('wickets')} label="Wickets taken" />
            </div>
          )}
        </section>

        {marqueeItems.length > 0 && (
          <div className="pl-marquee" aria-hidden="true">
            <div className="pl-track">
              {[...marqueeItems, ...marqueeItems].map((p, i) => (
                <span key={`${p.id || p._id}-${i}`}>
                  {p.name} <em>{p.stats?.runs || 0} runs</em>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pl-find">
          <label className="pl-search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search players"
            />
            {searchTerm ? (
              <button type="button" className="pl-clear" onClick={() => setSearchTerm('')} aria-label="Clear search">✕</button>
            ) : (
              <span className="pl-count">{playersData.length}</span>
            )}
          </label>
        </div>

        {loading ? (
          <div className="pl-loader">
            <div className="pl-bounce" />
            <div className="pl-shadow" />
            <p>Loading players data...</p>
          </div>
        ) : (
          <div className="pl-grid">
            {filteredPlayers.length === 0 ? (
              <div className="pl-empty">
                <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M5.5 5.5c3 2.5 3 10.5 0 13M18.5 5.5c-3 2.5-3 10.5 0 13" strokeDasharray="2 2.5" /></svg>
                <h3>No players found or added yet!</h3>
                <p style={{ fontSize: '14px' }}>Please add players from the Admin Panel.</p>
              </div>
            ) : (
              filteredPlayers.map((player, i) => (
                <Reveal key={player.id || player._id} delay={(i % 3) * 0.08}>
                  <article
                    className="pl-card"
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedPlayer(player)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedPlayer(player)}
                    onMouseMove={handleTilt}
                    onMouseLeave={resetTilt}
                  >
                    <div className="pl-head">
                      <Avatar player={player} />
                      <div>
                        <h3 className="pl-name">{player.name}</h3>
                        <p className="pl-meta">{player.department} | Batch: {player.batch}</p>
                        <p className="pl-meta" style={{ margin: 0 }}>ID: {player.id}</p>
                        {player.role && <span className="pl-role">{player.role}</span>}
                      </div>
                    </div>

                    <div className="pl-big">
                      <div><b>{player.stats?.matches || 0}</b><small>Matches</small></div>
                      <div><b style={{ color: 'var(--emerald)' }}>{player.stats?.runs || 0}</b><small>Runs</small></div>
                      <div><b style={{ color: 'var(--rose)' }}>{player.stats?.wickets || 0}</b><small>Wickets</small></div>
                    </div>

                    <div className="pl-bars">
                      <div className="pl-bar-row">
                        Batting
                        <div className="pl-rail"><div className="pl-fill runs" style={{ '--w': pct(player.stats?.runs, maxRuns) }} /></div>
                      </div>
                      <div className="pl-bar-row">
                        Bowling
                        <div className="pl-rail"><div className="pl-fill wkts" style={{ '--w': pct(player.stats?.wickets, maxWkts) }} /></div>
                      </div>
                    </div>

                    <div className="pl-foot">
                      <span>SR<b>{player.stats?.strikeRate || 0}</b></span>
                      <span>Avg<b>{player.stats?.average || 0}</b></span>
                      <span>Econ<b>{player.stats?.economy || 0}</b></span>
                      <span className="go">Profile</span>
                    </div>
                  </article>
                </Reveal>
              ))
            )}
          </div>
        )}
      </div>

      {selectedPlayer && (
        <div className="pl-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="pl-modal pl-open" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="pl-x" onClick={() => setSelectedPlayer(null)} aria-label="Close">✕</button>

            <div className="pl-banner">
              <Avatar player={selectedPlayer} />
              <h2>{selectedPlayer.name}</h2>
              <p>{selectedPlayer.department} • Batch: {selectedPlayer.batch}</p>
              <p style={{ fontSize: '13px' }}>ID: {selectedPlayer.id}</p>
              {selectedPlayer.role && <span className="rl">{selectedPlayer.role}</span>}
            </div>

            <div className="pl-body">
              <h4>Career Statistics</h4>
              <div className="pl-bars" style={{ marginTop: 0 }}>
                <div className="pl-bar-row" style={{ gridTemplateColumns: '68px 1fr' }}>
                  Matches
                  <div className="pl-rail"><div className="pl-fill mtch" style={{ '--w': pct(selectedPlayer.stats?.matches, maxMatches) }} /></div>
                </div>
                <div className="pl-bar-row" style={{ gridTemplateColumns: '68px 1fr' }}>
                  Runs
                  <div className="pl-rail"><div className="pl-fill runs" style={{ '--w': pct(selectedPlayer.stats?.runs, maxRuns) }} /></div>
                </div>
                <div className="pl-bar-row" style={{ gridTemplateColumns: '68px 1fr' }}>
                  Wickets
                  <div className="pl-rail"><div className="pl-fill wkts" style={{ '--w': pct(selectedPlayer.stats?.wickets, maxWkts) }} /></div>
                </div>
              </div>

              <div className="pl-tiles">
                <div className="pl-tile"><b>{selectedPlayer.stats?.matches || 0}</b><small>Matches</small></div>
                <div className="pl-tile"><b style={{ color: 'var(--emerald)' }}>{selectedPlayer.stats?.runs || 0}</b><small>Runs</small></div>
                <div className="pl-tile"><b style={{ color: 'var(--rose)' }}>{selectedPlayer.stats?.wickets || 0}</b><small>Wickets</small></div>
                <div className="pl-tile dk"><b>{selectedPlayer.stats?.strikeRate || 0}</b><small>Strike Rate</small></div>
                <div className="pl-tile dk"><b>{selectedPlayer.stats?.average || 0}</b><small>Average</small></div>
                <div className="pl-tile dk"><b>{selectedPlayer.stats?.economy || 0}</b><small>Economy</small></div>
              </div>

              <button className="pl-close" onClick={() => setSelectedPlayer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Players;