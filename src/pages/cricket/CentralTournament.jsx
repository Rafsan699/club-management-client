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

/* back button */
.tn-back{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:12px;background:var(--paper);border:1px solid var(--line);font-size:14px;color:var(--ink2);font-weight:600;cursor:pointer;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);transition:all .25s ease;margin-bottom:24px}
.tn-back:hover{background:var(--tint);border-color:rgba(2,132,199,.3);color:var(--sky);transform:translateX(-3px)}

/* hero section */
.tn-hero-simple{text-align:center;padding:20px 0 34px}
.tn-kicker{display:inline-flex;align-items:center;gap:10px;padding:7px 14px;border-radius:99px;background:var(--paper);border:1px solid var(--line);font-size:13px;color:var(--sky);font-weight:700;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);margin-bottom:14px}
.tn-live{width:9px;height:9px;border-radius:50%;background:var(--sky);animation:tnPulse 1.8s infinite}
@keyframes tnPulse{70%{box-shadow:0 0 0 11px rgba(2,132,199,0)}0%{box-shadow:0 0 0 0 rgba(2,132,199,.4)}}
.tn-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(32px,6vw,56px);line-height:1.1;margin:0 0 12px;letter-spacing:-.03em;color:var(--ink)}
.tn-sub{max-width:500px;margin:0 auto;color:var(--mute);font-size:15px;line-height:1.6}

/* tickets */
.tn-list{display:grid;gap:22px}
.tn-item{opacity:0;animation:tnRise .9s forwards cubic-bezier(.2,.8,.2,1);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.tn-item:hover,.tn-item:focus-within{transform:translateY(-6px)}

.tn-ticket{--stub:150px;position:relative;display:grid;grid-template-columns:var(--stub) 1fr;min-height:140px;cursor:pointer;outline:none;border-radius:24px;background:var(--paper);border:1px solid var(--line);
  box-shadow:0 4px 6px -1px rgba(15,23,42,.04),0 20px 25px -5px rgba(15,23,42,.06);
  -webkit-mask-image:radial-gradient(circle 13px at var(--stub) 0,#0000 98%,#000),radial-gradient(circle 13px at var(--stub) 100%,#0000 98%,#000);
  -webkit-mask-composite:source-in;
  mask-image:radial-gradient(circle 13px at var(--stub) 0,#0000 98%,#000),radial-gradient(circle 13px at var(--stub) 100%,#0000 98%,#000);
  mask-composite:intersect;
  transition:border-color .3s,box-shadow .3s}

.tn-ticket:hover,.tn-ticket:focus-visible{border-color:rgba(2,132,199,.4);box-shadow:0 10px 15px -3px rgba(15,23,42,.06),0 25px 30px -10px rgba(2,132,199,.1)}

.tn-stub{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:20px 10px;overflow:hidden;
  background:radial-gradient(circle at 20% 0%,var(--c2),transparent 62%),linear-gradient(160deg,var(--ink),var(--ink2));
  border-right:2px dashed rgba(255,255,255,.28)}
.tn-stub img{width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.2)}
.tn-stub-fallback{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:12px;letter-spacing:0.5px;border:2px solid rgba(255,255,255,0.2)}

.tn-main{position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px 26px;overflow:hidden}
.tn-main::before{content:'';position:absolute;inset:0;background:radial-gradient(420px circle at 100% 0%,color-mix(in srgb,var(--c) 15%,transparent),transparent 70%);opacity:.55;transition:opacity .4s}
.tn-ticket:hover .tn-main::before{opacity:1}
.tn-text{position:relative;min-width:0}
.tn-text h3{margin:0;font-family:'Fraunces',serif;font-weight:700;font-size:clamp(18px,2.8vw,22px);line-height:1.2;color:var(--ink)}
.tn-line{display:block;width:38px;height:4px;margin:10px 0;border-radius:4px;background:linear-gradient(90deg,var(--c),var(--c2));transition:width .6s cubic-bezier(.2,.8,.2,1)}
.tn-ticket:hover .tn-line{width:96px}
.tn-text p{margin:0 0 10px 0;max-width:430px;font-size:13.5px;line-height:1.6;color:var(--mute);font-weight:500}

.tn-meta{display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--ink2);font-weight:600}
.tn-meta span{display:inline-flex;align-items:center;gap:4px}

.tn-go{position:relative;flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;border:1.5px solid var(--line);background:#fff;color:var(--ink);transition:background .35s,color .35s,transform .35s,border-color .35s}
.tn-go svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.tn-ticket:hover .tn-go,.tn-ticket:focus-visible .tn-go{background:linear-gradient(135deg,var(--c),var(--c2));border-color:transparent;color:#fff;transform:rotate(-45deg) scale(1.08)}

/* pagination */
.tn-pagination{display:flex;justify-content:space-between;align-items:center;margin-top:34px;padding:0 4px}
.tn-page-btn{padding:10px 18px;background:var(--paper);border:1px solid var(--line);color:var(--ink);border-radius:12px;cursor:pointer;font-weight:600;font-size:14px;box-shadow:0 4px 12px -4px rgba(15,23,42,.05);transition:all .2s ease}
.tn-page-btn:hover:not(:disabled){background:var(--tint);border-color:rgba(2,132,199,.3);color:var(--sky)}
.tn-page-btn:disabled{opacity:.5;cursor:not-allowed}
.tn-page-info{font-size:14px;color:var(--mute);font-weight:600}

/* loader & empty states */
.tn-loader{display:flex;flex-direction:column;align-items:center;gap:16px;padding:70px 0;color:var(--mute);font-weight:600}
.tn-bounce{width:24px;height:24px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#7dd3fc,#0284c7);animation:tnBounce .7s cubic-bezier(.3,0,.7,1) infinite alternate}
.tn-shadow{width:24px;height:6px;border-radius:50%;background:rgba(15,23,42,.12);margin-top:-12px;animation:tnSh .7s cubic-bezier(.3,0,.7,1) infinite alternate}
@keyframes tnBounce{from{transform:translateY(-40px)}to{transform:translateY(0)}}
@keyframes tnSh{from{transform:scale(.4);opacity:.3}to{transform:scale(1.2);opacity:.7}}

.tn-empty{text-align:center;padding:50px 20px;background:var(--paper);border:1px solid var(--line);border-radius:20px;color:var(--mute);font-weight:600;box-shadow:0 4px 12px -4px rgba(15,23,42,.04)}

@keyframes tnRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

/* responsive */
@media (max-width:600px){
  .tn-root{padding:calc(var(--hdr,70px) + 12px) 14px 70px}
  .tn-ticket{--stub:78px;grid-template-columns:1fr;grid-template-rows:var(--stub) auto;min-height:0;border-radius:22px;
    -webkit-mask-image:radial-gradient(circle 12px at 0 var(--stub),#0000 98%,#000),radial-gradient(circle 12px at 100% var(--stub),#0000 98%,#000);
    mask-image:radial-gradient(circle 12px at 0 var(--stub),#0000 98%,#000),radial-gradient(circle 12px at 100% var(--stub),#0000 98%,#000)}
  .tn-stub{flex-direction:row;justify-content:flex-start;gap:12px;padding:0 20px;border-right:0;border-bottom:2px dashed rgba(255,255,255,.28)}
  .tn-stub img,.tn-stub-fallback{width:46px;height:46px}
  .tn-main{padding:20px 18px 22px}
  .tn-go{width:42px;height:42px}
}
`;

function CentralTournament() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    const fetchCentralTournaments = async () => {
      try {
        setLoading(true);
        const res = await API.get('/api/cricket/tournaments');
        const filtered = (res.data || []).filter(t => t.category === 'central_tournament');
        setTournaments(filtered);
      } catch (error) {
        console.error('Error fetching central tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCentralTournaments();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTournaments = tournaments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tournaments.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
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
        
        {/* Back Button */}
        <button className="tn-back" onClick={() => navigate(-1)}>
          &larr; Back Step
        </button>

        {/* Hero Header */}
        <section className="tn-hero-simple">
          <span className="tn-kicker"><i className="tn-live" /> Central Zonal</span>
          <h1 className="tn-title">Central Cricket Tournament</h1>
          <p className="tn-sub">
            View central zonal cricket tournaments, knockout stages, and match updates.
          </p>
        </section>

        {loading && (
          <div className="tn-loader">
            <div className="tn-bounce" />
            <div className="tn-shadow" />
            <p>Loading central tournaments...</p>
          </div>
        )}

        {!loading && tournaments.length === 0 && (
          <div className="tn-empty">
            No tournaments available in this category yet.
          </div>
        )}

        {!loading && tournaments.length > 0 && (
          <>
            <div className="tn-list">
              {currentTournaments.log ? null : currentTournaments.map((tournament, idx) => {
                const tourName = tournament.name || tournament.tournamentName;
                const tourLogo = tournament.logo;
                const tourDesc = tournament.description || 'No description provided.';
                const tourDate = tournament.date || tournament.startDate 
                  ? new Date(tournament.date || tournament.startDate).toLocaleDateString() 
                  : 'Date: TBA';
                const tourVenue = tournament.venue || 'Venue TBA';
                const teamsCount = tournament.teamsCount || 0;

                return (
                  <div
                    key={tournament._id}
                    className="tn-item"
                    style={{ '--c': '#0284c7', '--c2': '#e0f2fe', animationDelay: `${0.15 + idx * 0.12}s` }}
                  >
                    <article
                      className="tn-ticket"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/sports/cricket/central-schedule?id=${tournament._id}`)}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/sports/cricket/central-schedule?id=${tournament._id}`)}
                    >
                      <div className="tn-stub">
                        {tourLogo ? (
                          <img src={tourLogo} alt={tourName} />
                        ) : (
                          <div className="tn-stub-fallback">BRIUSC</div>
                        )}
                      </div>

                      <div className="tn-main">
                        <div className="tn-text">
                          <h3>{tourName}</h3>
                          <i className="tn-line" />
                          <p>{tourDesc}</p>
                          
                          <div className="tn-meta">
                            <span>📅 {tourDate}</span>
                            <span>📍 {tourVenue}</span>
                            <span>👥 Teams: {teamsCount}</span>
                          </div>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="tn-pagination">
                <button 
                  className="tn-page-btn"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  &larr; Previous
                </button>

                <span className="tn-page-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button 
                  className="tn-page-btn"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default CentralTournament = CentralTournament;