import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from './header';
import API from '../../services/api';

/* ------------------------------------------------------------------
   DESIGN: Professional Light Theme (Matched with Tournament.jsx)
------------------------------------------------------------------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Manrope:wght@400;500;600;700;800&display=swap');

.pt-root{--bg:#f8fafc;--paper:#ffffff;--ink:#0f172a;--ink2:#334155;--mute:#64748b;--line:rgba(15,23,42,.08);--tint:#f1f5f9;
  --gold:#4f46e5;--gold2:#6366f1;--rose:#e11d48;--sky:#0284c7;--emerald:#059669;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Manrope',system-ui,sans-serif;position:relative;overflow-x:clip;
  padding:calc(var(--hdr,70px) + 20px) 20px 90px}
.pt-root *{box-sizing:border-box}
.pt-header-fix{position:fixed;top:0;left:0;right:0;z-index:500;box-shadow:0 10px 30px -14px rgba(15,23,42,.08)}

/* ambient blobs */
.pt-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.pt-blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35}
.pt-blob.a{width:46vmax;height:46vmax;left:-14vmax;top:-10vmax;background:radial-gradient(circle,rgba(2,132,199,.15),transparent 65%);animation:ptFloatA 18s ease-in-out infinite alternate}
.pt-blob.b{width:40vmax;height:40vmax;right:-12vmax;top:10vmax;background:radial-gradient(circle,rgba(79,70,229,.15),transparent 65%);animation:ptFloatB 22s ease-in-out infinite alternate}
.pt-blob.c{width:44vmax;height:44vmax;left:25vmax;bottom:-22vmax;background:radial-gradient(circle,rgba(5,150,105,.12),transparent 65%);animation:ptFloatA 26s ease-in-out infinite alternate-reverse}
@keyframes ptFloatA{to{transform:translate(8vmax,6vmax) scale(1.15)}}
@keyframes ptFloatB{to{transform:translate(-8vmax,10vmax) scale(.9)}}

.pt-wrap{position:relative;z-index:1;max-width:940px;margin:0 auto}

/* back button */
.pt-back{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:12px;background:var(--paper);border:1px solid var(--line);font-size:15px;color:var(--ink2);font-weight:700;cursor:pointer;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);transition:all .25s ease;margin-bottom:24px}
.pt-back:hover{background:var(--tint);border-color:rgba(79,70,229,.3);color:var(--gold);transform:translateX(-3px)}

/* hero section */
.pt-hero-simple{text-align:center;padding:10px 0 24px}
.pt-kicker{display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:99px;background:var(--paper);border:1px solid var(--line);font-size:14px;color:var(--gold);font-weight:800;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);margin-bottom:14px}
.pt-live{width:10px;height:10px;border-radius:50%;background:var(--rose);animation:ptPulse 1.8s infinite}
@keyframes ptPulse{70%{box-shadow:0 0 0 11px rgba(225,29,72,0)}0%{box-shadow:0 0 0 0 rgba(225,29,72,.4)}}
.pt-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(28px,5vw,42px);line-height:1.2;margin:0 0 10px;letter-spacing:-.03em;color:var(--ink)}
.pt-sub{max-width:550px;margin:0 auto;color:var(--mute);font-size:15px;line-height:1.6;font-weight:500}

/* search bar */
.pt-search-box{margin:0 auto 24px;max-width:480px;position:relative}
.pt-search-input{width:100%;padding:14px 20px 14px 46px;border-radius:14px;background:var(--paper);border:1px solid var(--line);font-size:15px;color:var(--ink);font-weight:600;outline:none;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);transition:all .25s ease}
.pt-search-input:focus{border-color:rgba(79,70,229,.4);box-shadow:0 0 0 4px rgba(79,70,229,.1)}
.pt-search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--mute);width:18px;height:18px}

/* tournament ticket cards style */
.pt-list{display:grid;gap:22px}
.pt-item{opacity:0;animation:ptRise .9s forwards cubic-bezier(.2,.8,.2,1);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.pt-item:hover,.pt-item:focus-within{transform:translateY(-6px)}

.pt-ticket{--stub:176px;position:relative;display:grid;grid-template-columns:var(--stub) 1fr;min-height:130px;cursor:pointer;outline:none;border-radius:24px;background:var(--paper);border:1px solid var(--line);
  box-shadow:0 4px 6px -1px rgba(15,23,42,.04),0 20px 25px -5px rgba(15,23,42,.06);
  -webkit-mask-image:radial-gradient(circle 13px at var(--stub) 0,#0000 98%,#000),radial-gradient(circle 13px at var(--stub) 100%,#0000 98%,#000);
  -webkit-mask-composite:source-in;
  mask-image:radial-gradient(circle 13px at var(--stub) 0,#0000 98%,#000),radial-gradient(circle 13px at var(--stub) 100%,#0000 98%,#000);
  mask-composite:intersect;
  transition:border-color .3s,box-shadow .3s}

.pt-ticket:hover,.pt-ticket:focus-visible{border-color:rgba(79,70,229,.4);box-shadow:0 10px 15px -3px rgba(15,23,42,.06),0 25px 30px -10px rgba(79,70,229,.1)}

.pt-stub{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:20px 10px;overflow:hidden;color:#fff;
  background:radial-gradient(circle at 20% 0%,var(--c,#4f46e5),transparent 62%),linear-gradient(160deg,var(--ink),var(--ink2));
  border-right:2px dashed rgba(255,255,255,.28)}
.pt-stub::before{content:'';position:absolute;inset:auto -30% -45% -30%;aspect-ratio:1;border-radius:50%;border:1.5px solid var(--c,#4f46e5);opacity:.35;transition:transform .8s cubic-bezier(.2,.8,.2,1),opacity .4s}
.pt-ticket:hover .pt-stub::before{transform:scale(1.25);opacity:.6}
.pt-stub b{position:relative;font-family:'Fraunces',serif;font-weight:800;font-size:22px;line-height:1.2;color:#fff;text-align:center;padding:0 6px}
.pt-stub small{position:relative;font-size:12px;font-weight:600;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.05em}

.pt-main{position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px 26px;overflow:hidden}
.pt-main::before{content:'';position:absolute;inset:0;background:radial-gradient(420px circle at 100% 0%,color-mix(in srgb,var(--c,#4f46e5) 15%,transparent),transparent 70%);opacity:.55;transition:opacity .4s}
.pt-ticket:hover .pt-main::before{opacity:1}
.pt-text{position:relative;min-width:0}
.pt-text h3{margin:0;font-family:'Fraunces',serif;font-weight:700;font-size:clamp(18px,3vw,22px);line-height:1.2;color:var(--ink)}
.pt-line{display:block;width:38px;height:4px;margin:10px 0;border-radius:4px;background:linear-gradient(90deg,var(--c,#4f46e5),var(--sky));transition:width .6s cubic-bezier(.2,.8,.2,1)}
.pt-ticket:hover .pt-line{width:80px}
.pt-text p{margin:0;font-size:13.5px;color:var(--mute);font-weight:600}
.pt-go{position:relative;flex:none;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;border:1.5px solid var(--line);background:#fff;color:var(--ink);transition:background .35s,color .35s,transform .35s,border-color .35s}
.pt-go svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.pt-ticket:hover .pt-go{background:linear-gradient(135deg,var(--c,#4f46e5),var(--sky));border-color:transparent;color:#fff;transform:rotate(-45deg) scale(1.08)}

/* tables / boxes design */
.pt-box{background:var(--paper);border:1px solid var(--line);border-radius:20px;margin-bottom:24px;overflow:hidden;box-shadow:0 4px 14px -4px rgba(15,23,42,.04)}
.pt-box h3{margin:0;padding:16px 20px;background:var(--tint);color:var(--gold);font-family:'Fraunces',serif;font-size:17px;font-weight:700;border-bottom:1px solid var(--line)}
.pt-scroll{overflow-x:auto}
.pt-table{width:100%;border-collapse:collapse;font-size:14px;min-width:600px}
.pt-table th{color:var(--mute);font-weight:700;text-align:center;padding:14px 10px;border-bottom:1px solid var(--line);background:var(--paper)}
.pt-table td{text-align:center;padding:14px 10px;border-bottom:1px solid var(--line);color:var(--ink2);font-weight:600}
.pt-table th:nth-child(2),.pt-table td:nth-child(2){text-align:left}
.pt-table tr:last-child td{border-bottom:0}
.pt-pts{font-weight:800!important;color:var(--emerald)}
.pos{color:var(--emerald);font-weight:700}
.neg{color:var(--rose);font-weight:700}
.pt-top td:first-child{box-shadow:inset 4px 0 var(--emerald)}

/* match results list */
.pt-res{padding:16px 20px;border-bottom:1px solid var(--line);font-size:14px;font-weight:600;color:var(--ink2)}
.pt-res:last-child{border-bottom:0}
.pt-res b{color:var(--ink);font-size:15px}
.pt-res span{color:var(--mute);font-size:13px;display:inline-block;margin:4px 0}
.pt-res-sum{color:var(--emerald);font-weight:700;margin-top:4px}

/* pagination controls */
.pt-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:var(--paper);border-top:1px solid var(--line);font-size:14px;color:var(--mute);font-weight:600}
.pt-page-btns{display:flex;gap:10px}
.pt-page-btn{padding:8px 16px;border-radius:10px;background:var(--tint);border:1px solid var(--line);color:var(--ink);font-weight:700;cursor:pointer;transition:all .2s}
.pt-page-btn:hover:not(:disabled){background:var(--gold);color:#fff;border-color:transparent}
.pt-page-btn:disabled{opacity:0.4;cursor:not-allowed}

/* loader & empty states */
.pt-loader{display:flex;flex-direction:column;align-items:center;gap:16px;padding:70px 0;color:var(--mute);font-weight:700;font-size:16px}
.pt-bounce{width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#a5b4fc,#4f46e5);animation:ptBounce .7s cubic-bezier(.3,0,.7,1) infinite alternate}
.pt-shadow{width:28px;height:6px;border-radius:50%;background:rgba(15,23,42,.12);margin-top:-12px;animation:ptSh .7s cubic-bezier(.3,0,.7,1) infinite alternate}
@keyframes ptBounce{from{transform:translateY(-40px)}to{transform:translateY(0)}}
@keyframes ptSh{from{transform:scale(.4);opacity:.3}to{transform:scale(1.2);opacity:.7}}
.pt-empty{text-align:center;padding:50px 20px;background:var(--paper);border:1px solid var(--line);border-radius:20px;color:var(--mute);font-weight:700;font-size:15px;box-shadow:0 4px 12px -4px rgba(15,23,42,.04)}

@keyframes ptRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

@media (max-width:600px){
  .pt-root{padding:calc(var(--hdr,70px) + 14px) 14px 70px}
  .pt-ticket{--stub:120px;min-height:110px}
  .pt-stub b{font-size:16px}
  .pt-main{padding:16px}
}
`;

const fmtNrr = (n) => (n > 0 ? `+${n.toFixed(3)}` : n.toFixed(3));
const catLabel = {
  inter_university: 'Inter University',
  franchise_tournament: 'Franchise',
  central_tournament: 'Central'
};

const PAGE_SIZE = 10;

function PointTable() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedId = params.get('id');

  const [tournaments, setTournaments] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset pagination when tournament selection changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
  }, [selectedId]);

  // 1) Tournament list
  useEffect(() => {
    if (selectedId) return;
    setLoading(true);
    API.get('/api/cricket/tournaments')
      .then((res) => setTournaments(res.data || []))
      .catch(() => setError('Tournament load kora jayni'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  // 2) Selected tournament er point table (10 sec por por auto refresh)
  const loadTable = useCallback(async (silent) => {
    if (!selectedId) return;
    try {
      if (!silent) setLoading(true);
      const res = await API.get(`/api/cricket/point-table/${selectedId}`);
      setData(res.data);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Point table load kora jayni');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    setData(null);
    loadTable(false);
    if (!selectedId) return undefined;
    const t = setInterval(() => loadTable(true), 10000);
    return () => clearInterval(t);
  }, [selectedId, loadTable]);

  // Filtered Tournaments list for Search (when viewing list)
  const filteredTournaments = useMemo(() => {
    if (!searchQuery.trim()) return tournaments;
    return tournaments.filter(t => 
      t.tournamentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (catLabel[t.category] || t.category)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tournaments, searchQuery]);

  // Pagination logic for Tournaments or Standings rows if they exceed 10
  const paginatedTournaments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTournaments.slice(start, start + PAGE_SIZE);
  }, [filteredTournaments, currentPage]);

  const totalPages = Math.ceil(filteredTournaments.length / PAGE_SIZE);

  return (
    <div className="pt-root" style={{ '--hdr': `${hdr}px` }}>
      <style>{css}</style>

      <div className="pt-ambient" aria-hidden="true">
        <div className="pt-blob a" />
        <div className="pt-blob b" />
        <div className="pt-blob c" />
      </div>

      <div className="pt-header-fix" ref={headerRef}>
        <Header />
      </div>

      <div className="pt-wrap">
        {selectedId && (
          <button className="pt-back" onClick={() => setParams({})}>← Tournaments</button>
        )}
        {!selectedId && (
          <button className="pt-back" onClick={() => navigate(-1)}>← Back</button>
        )}

        {error && <div className="pt-empty">{error}</div>}
        {loading && !error && (
          <div className="pt-loader">
            <div className="pt-bounce" />
            <div className="pt-shadow" />
            <p>Loading...</p>
          </div>
        )}

        {/* Tournament list */}
        {!selectedId && !loading && !error && (
          <>
            <section className="pt-hero-simple">
              <span className="pt-kicker"><i className="pt-live" /> Standings</span>
              <h2 className="pt-title">Point Table</h2>
              <p className="pt-sub">Select Tournament</p>
            </section>

            {/* Search Bar */}
            <div className="pt-search-box">
              <svg className="pt-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="pt-search-input"
                placeholder="Search tournament by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="pt-list">
              {paginatedTournaments.map((t, idx) => (
                <div
                  key={t._id}
                  className="pt-item"
                  style={{ animationDelay: `${0.15 + idx * 0.1}s` }}
                >
                  <article
                    className="pt-ticket"
                    role="button"
                    tabIndex={0}
                    onClick={() => setParams({ id: t._id })}
                    onKeyDown={(e) => e.key === 'Enter' && setParams({ id: t._id })}
                  >
                    <div className="pt-stub">
                      <b>{catLabel[t.category] || t.category}</b>
                      <small>{t.status}</small>
                    </div>

                    <div className="pt-main">
                      <div className="pt-text">
                        <h3>{t.tournamentName}</h3>
                        <i className="pt-line" />
                        <p>{t.format === 'group_wise' ? 'Group wise tournament' : 'Standard league format'}</p>
                      </div>
                      <span className="pt-go" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </span>
                    </div>
                  </article>
                </div>
              ))}
              {paginatedTournaments.length === 0 && <div className="pt-empty">Kono tournament nai</div>}
            </div>

            {/* Pagination Controls for Tournaments if > 10 */}
            {totalPages > 1 && (
              <div className="pt-pagination" style={{ marginTop: '24px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <span>Page {currentPage} of {totalPages}</span>
                <div className="pt-page-btns">
                  <button
                    className="pt-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="pt-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Point table */}
        {selectedId && data && !loading && (
          <>
            <section className="pt-hero-simple">
              <span className="pt-kicker"><i className="pt-live" /> Live Standings</span>
              <h2 className="pt-title">{data.tournament.name} - Point Table</h2>
              <p className="pt-sub">Win = 2 • Tie / No Result = 1 • Loss = 0</p>
            </section>

            {data.tables.length === 0 && <div className="pt-empty">Ekhono kono match nai</div>}

            {data.tables.map((tb) => {
              // Filtering team standings by search query if needed or handling table row pagination if > 10
              const filteredStandings = tb.standings.filter(r => 
                r.team.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              // Local pagination for table standings if rows exceed 10
              const tableTotalPages = Math.ceil(filteredStandings.length / PAGE_SIZE);
              const paginatedStandings = filteredStandings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

              return (
                <div className="pt-box" key={tb.name}>
                  {data.tournament.format === 'group_wise' && <h3>{tb.name}</h3>}
                  
                  {/* Standings search filter input inside tournament view */}
                  <div style={{ padding: '16px 20px 0' }}>
                    <input
                      type="text"
                      className="pt-search-input"
                      style={{ padding: '10px 16px', fontSize: '13px' }}
                      placeholder="Search team in table..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  <div className="pt-scroll" style={{ marginTop: '14px' }}>
                    <table className="pt-table">
                      <thead>
                        <tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>T</th><th>NR</th><th>NRR</th><th>Pts</th></tr>
                      </thead>
                      <tbody>
                        {paginatedStandings.map((r, i) => {
                          const actualIdx = (currentPage - 1) * PAGE_SIZE + i;
                          return (
                            <tr key={r.team} className={actualIdx === 0 && r.played > 0 ? 'pt-top' : ''}>
                              <td>{actualIdx + 1}</td>
                              <td>{r.team}</td>
                              <td>{r.played}</td>
                              <td>{r.won}</td>
                              <td>{r.lost}</td>
                              <td>{r.tied}</td>
                              <td>{r.noResult}</td>
                              <td className={r.nrr >= 0 ? 'pos' : 'neg'}>{fmtNrr(r.nrr)}</td>
                              <td className="pt-pts">{r.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination Controls if standings > 10 */}
                  {tableTotalPages > 1 && (
                    <div className="pt-pagination">
                      <span>Page {currentPage} of {tableTotalPages}</span>
                      <div className="pt-page-btns">
                        <button
                          className="pt-page-btn"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        >
                          Previous
                        </button>
                        <button
                          className="pt-page-btn"
                          disabled={currentPage === tableTotalPages}
                          onClick={() => setCurrentPage(p => Math.min(p + 1, tableTotalPages))}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {data.results.length > 0 && (
              <div className="pt-box">
                <h3>Match Results</h3>
                {data.results.map((m) => (
                  <div className="pt-res" key={m.matchId}>
                    <b>{m.team1} vs {m.team2}</b><br />
                    <span>{m.team1Score} ({m.team1Overs}) • {m.team2Score} ({m.team2Overs})</span><br />
                    <div className="pt-res-sum">{m.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PointTable;