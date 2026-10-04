import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from './header';
import API from '../../services/api';
import MatchHistoryView from './MatchHistoryView';
import TopPerformance from './TopPerformance';   // ADDED

/* ------------------------------------------------------------------
   DESIGN: Professional Light Theme — Larger Typography Scale
   Light BG #f8fafc · Paper #ffffff · Ink #0f172a · Ink2 #334155 · Mute #64748b
   Primary Pink/Rose #e11d48 · Accent Pink #ec4899 · Emerald #059669
------------------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Manrope:wght@400;500;600;700;800&display=swap');

.tn-root{--bg:#f8fafc;--paper:#ffffff;--ink:#0f172a;--ink2:#334155;--mute:#64748b;--line:rgba(15,23,42,.08);--tint:#f1f5f9;
  --rose:#e11d48;--pink:#ec4899;--pink-light:#fce7f3;--emerald:#059669;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Manrope',system-ui,sans-serif;position:relative;overflow-x:clip;
  padding:calc(var(--hdr,70px) + 20px) 20px 90px}
.tn-root *{box-sizing:border-box}
.tn-header-fix{position:fixed;top:0;left:0;right:0;z-index:500;box-shadow:0 10px 30px -14px rgba(15,23,42,.08)}

/* ambient blobs */
.tn-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.tn-blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35}
.tn-blob.a{width:46vmax;height:46vmax;left:-14vmax;top:-10vmax;background:radial-gradient(circle,rgba(236,72,153,.15),transparent 65%);animation:tnFloatA 18s ease-in-out infinite alternate}
.tn-blob.b{width:40vmax;height:40vmax;right:-12vmax;top:10vmax;background:radial-gradient(circle,rgba(225,29,72,.15),transparent 65%);animation:tnFloatB 22s ease-in-out infinite alternate}
.tn-blob.c{width:44vmax;height:44vmax;left:25vmax;bottom:-22vmax;background:radial-gradient(circle,rgba(5,150,105,.12),transparent 65%);animation:tnFloatA 26s ease-in-out infinite alternate-reverse}
@keyframes tnFloatA{to{transform:translate(8vmax,6vmax) scale(1.15)}}
@keyframes tnFloatB{to{transform:translate(-8vmax,10vmax) scale(.9)}}

.tn-wrap{position:relative;z-index:1;max-width:980px;margin:0 auto}

/* back button - larger font */
.tn-back{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:12px;background:var(--paper);border:1px solid var(--line);font-size:15px;color:var(--ink2);font-weight:700;cursor:pointer;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);transition:all .25s ease;margin-bottom:24px}
.tn-back:hover{background:var(--tint);border-color:rgba(236,72,153,.3);color:var(--pink);transform:translateX(-3px)}

/* hero section */
.tn-hero-simple{text-align:center;padding:20px 0 34px}
.tn-kicker{display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:99px;background:var(--paper);border:1px solid var(--line);font-size:14px;color:var(--pink);font-weight:800;box-shadow:0 4px 14px -6px rgba(15,23,42,.06);margin-bottom:14px}
.tn-live{width:10px;height:10px;border-radius:50%;background:var(--pink);animation:tnPulse 1.8s infinite}
@keyframes tnPulse{70%{box-shadow:0 0 0 11px rgba(236,72,153,0)}0%{box-shadow:0 0 0 0 rgba(236,72,153,.4)}}
.tn-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(28px,5vw,44px);line-height:1.2;margin:0 0 12px;letter-spacing:-.03em;color:var(--ink)}
.tn-sub{max-width:550px;margin:0 auto;color:var(--mute);font-size:16px;line-height:1.6;font-weight:500}

/* filters - larger font */
.tn-filter-group{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;justify-content:center}
.tn-filter-btn{padding:9px 18px;border-radius:99px;cursor:pointer;font-size:14px;font-weight:700;border:1px solid var(--line);background:var(--paper);color:var(--ink2);box-shadow:0 2px 8px -2px rgba(15,23,42,.04);transition:all .2s ease}
.tn-filter-btn.active{background:var(--pink);color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(236,72,153,.35)}

/* match ticket style */
.tn-list{display:grid;gap:24px}
.tn-item{opacity:0;animation:tnRise .9s forwards cubic-bezier(.2,.8,.2,1);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.tn-item:hover,.tn-item:focus-within{transform:translateY(-4px)}

.tn-ticket{position:relative;display:block;border-radius:24px;background:var(--paper);border:1px solid var(--line);
  box-shadow:0 4px 6px -1px rgba(15,23,42,.04),0 20px 25px -5px rgba(15,23,42,.06);
  padding:26px;cursor:pointer;outline:none;transition:border-color .3s,box-shadow .3s}
.tn-ticket:hover,.tn-ticket:focus-visible{border-color:rgba(236,72,153,.4);box-shadow:0 10px 15px -3px rgba(15,23,42,.06),0 25px 30px -10px rgba(236,72,153,.1)}

/* match header info inside ticket - bigger typography */
.tn-match-top{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;color:var(--mute);margin-bottom:16px;border-bottom:1px solid var(--line);padding-bottom:12px;flex-wrap:wrap;gap:10px;font-weight:600}
.tn-match-badges{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tn-badge-num{background:var(--pink);color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:800}
.tn-badge-grp{background:rgba(139,92,246,.12);color:#7c3aed;border:1px solid rgba(139,92,246,.25);padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700}
.tn-badge-stg{background:rgba(245,158,11,.12);color:#d97706;border:1px solid rgba(245,158,11,.25);padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700}
.tn-live-link{color:var(--pink);font-weight:800;font-size:13px;text-decoration:none;transition:opacity .2s}
.tn-live-link:hover{opacity:0.8}

/* teams row - larger font */
.tn-team-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.tn-team-info{display:flex;align-items:center;gap:14px}
.tn-team-avatar{width:42px;height:42px;border-radius:50%;background:var(--tint);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:var(--pink);border:1.5px solid rgba(236,72,153,.25);flex-shrink:0}
.tn-team-name{font-weight:800;font-size:17px;color:var(--ink)}
.tn-team-score{font-size:16px;font-weight:800;color:var(--ink)}
.tn-team-score span{font-size:13.5px;color:var(--mute);font-weight:600}

/* outcome / result box - larger font */
.tn-outcome{font-size:14px;color:var(--emerald);font-weight:700;margin:16px 0 12px;background:rgba(5,150,105,.08);padding:10px 14px;border-radius:10px;border:1px solid rgba(5,150,105,.18)}

/* ticket footer - larger font */
.tn-match-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:12px;font-size:13.5px;color:var(--mute);margin-top:14px;font-weight:600}
.tn-history-cue{color:var(--pink);font-weight:800}

/* top performance button */
.tn-top-wrap{display:flex;justify-content:center;margin:-8px 0 26px}
.tn-top-btn{display:inline-flex;align-items:center;gap:10px;padding:13px 26px;border:0;border-radius:99px;cursor:pointer;font:inherit;font-size:16px;font-weight:800;color:#fff;background:linear-gradient(120deg,#d97706,#f59e0b);box-shadow:0 10px 24px -8px rgba(217,119,6,.55);transition:transform .2s,box-shadow .2s}
.tn-top-btn:hover{transform:translateY(-2px);box-shadow:0 14px 28px -8px rgba(217,119,6,.6)}
@media (max-width:600px){.tn-top-btn{width:100%;justify-content:center;padding:13px 18px;font-size:15px}}

/* loader / empty */
.tn-loader{display:flex;flex-direction:column;align-items:center;gap:16px;padding:70px 0;color:var(--mute);font-weight:700;font-size:16px}
.tn-bounce{width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fbcfe8,#ec4899);animation:tnBounce .7s cubic-bezier(.3,0,.7,1) infinite alternate}
.tn-shadow{width:28px;height:6px;border-radius:50%;background:rgba(15,23,42,.12);margin-top:-12px;animation:tnSh .7s cubic-bezier(.3,0,.7,1) infinite alternate}
@keyframes tnBounce{from{transform:translateY(-40px)}to{transform:translateY(0)}}
@keyframes tnSh{from{transform:scale(.4);opacity:.3}to{transform:scale(1.2);opacity:.7}}

.tn-empty{text-align:center;padding:60px 20px;background:var(--paper);border:1px solid var(--line);border-radius:20px;color:var(--mute);font-weight:700;font-size:16px;box-shadow:0 4px 12px -4px rgba(15,23,42,.04)}

@keyframes tnRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

/* responsive */
@media (max-width:600px){
  .tn-root{padding:calc(var(--hdr,70px) + 14px) 14px 70px}
  .tn-ticket{padding:20px}
  .tn-team-name{font-size:15px}
  .tn-team-score{font-size:14.5px}
}
`;

function CentralSchedule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tournamentId = searchParams.get('id');
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState('all');

  const [historyMatch, setHistoryMatch] = useState(null);
  const [showTop, setShowTop] = useState(false);   // ADDED: Top Performance page
  const [historyData, setHistoryData] = useState({ ballLog: [], meta: {}, result: '', snapshot: null });
  const [historyLoading, setHistoryLoading] = useState(false);

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
    const fetchScheduleDetails = async () => {
      if (!tournamentId) return;
      try {
        setLoading(true);
        const res = await API.get(`/api/cricket/tournaments/${tournamentId}`);
        const tourData = res.data.tournament || res.data;
        setTournament(tourData);
        setSchedules(tourData.schedules || []);

        const autoId = searchParams.get('match');
        const autoMatch = autoId && (tourData.schedules || []).find((s) => String(s._id) === String(autoId));
        if (autoMatch) openHistory(autoMatch);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [tournamentId]);

  const loadHistory = async (matchId, silent = false) => {
    try {
      if (!silent) setHistoryLoading(true);
      const res = await API.get(`/api/cricket/live-score/${matchId}/history`);
      setHistoryData({
        ballLog: res.data.ballLog || [],
        meta: res.data.meta || {},
        result: res.data.result || '',
        snapshot: res.data.snapshot || null
      });
    } catch (error) {
      console.error('Error fetching match history:', error);
      if (!silent) setHistoryData({ ballLog: [], meta: {}, result: '', snapshot: null });
    } finally {
      if (!silent) setHistoryLoading(false);
    }
  };

  const setMatchParam = (id) => {
    const p = new URLSearchParams(window.location.search);
    if (id) p.set('match', id); else p.delete('match');
    setSearchParams(p, { replace: true });
  };

  const openHistory = (match) => {
    setHistoryMatch(match);
    setMatchParam(match._id);
    setHistoryData({ ballLog: [], meta: {}, result: '', snapshot: null });
    loadHistory(match._id);
  };

  const closeHistory = () => { setHistoryMatch(null); setMatchParam(null); };

  useEffect(() => {
    if (!historyMatch) return;
    const timer = setInterval(() => loadHistory(historyMatch._id, true), 10000);
    return () => clearInterval(timer);
  }, [historyMatch]);

  const getTeamInitials = (name) => {
    if (!name) return 'TM';
    const words = name.trim().split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
        
        <button className="tn-back" onClick={() => navigate(-1)}>
          &larr; Back Step
        </button>

        {loading ? (
          <div className="tn-loader">
            <div className="tn-bounce" />
            <div className="tn-shadow" />
            <p>Loading central tournament schedules...</p>
          </div>
        ) : !tournament ? (
          <div className="tn-empty">No central tournament selected or found!</div>
        ) : (
          <div>
            <section className="tn-hero-simple">
              <span className="tn-kicker"><i className="tn-live" /> Tournament Fixtures</span>
              <h1 className="tn-title">{tournament.name || tournament.tournamentName} - Match Schedules</h1>
              <p className="tn-sub">📍 Venue: {tournament.venue || 'TBA'}</p>
            </section>

            {/* ADDED: Top Performance (runs / wickets / sixes / fours / man of the match) */}
            <div className="tn-top-wrap">
              <button type="button" className="tn-top-btn" onClick={() => setShowTop(true)}>
                🏆 Top Performance
              </button>
            </div>

            {tournament.format === 'group_wise' && (tournament.groups || []).length > 0 && (
              <div className="tn-filter-group">
                {['all', ...(tournament.groups || []).map((g) => g.name)].map((g) => (
                  <button
                    key={g}
                    className={`tn-filter-btn ${groupFilter === g ? 'active' : ''}`}
                    onClick={() => setGroupFilter(g)}
                  >
                    {g === 'all' ? 'All Matches' : g}
                  </button>
                ))}
              </div>
            )}

            {schedules.length === 0 ? (
              <div className="tn-empty">
                No match schedules added for this tournament yet.
              </div>
            ) : (
              <div className="tn-list">
                {schedules
                  .filter((m) => groupFilter === 'all' || m.group === groupFilter)
                  .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0))
                  .map((match, index) => {
                    const num = match.matchNumber || index + 1;
                    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
                    const t1Name = match.team1 || 'Team A';
                    const t2Name = match.team2 || 'Team B';

                    return (
                      <div
                        key={match._id || index}
                        className="tn-item"
                        style={{ animationDelay: `${0.15 + index * 0.12}s` }}
                      >
                        <div
                          className="tn-ticket"
                          role="button"
                          tabIndex={0}
                          onClick={() => openHistory(match)}
                          onKeyDown={(e) => e.key === 'Enter' && openHistory(match)}
                        >
                          {/* Match Top Bar */}
                          <div className="tn-match-top">
                            <div className="tn-match-badges">
                              <span className="tn-badge-num">{num}{suffix} Match</span>
                              {match.group && <span className="tn-badge-grp">{match.group}</span>}
                              {match.stage && match.stage !== 'League' && <span className="tn-badge-stg">{match.stage}</span>}
                              <span>{match.date ? new Date(match.date).toLocaleString() : 'Date TBA'}</span>
                            </div>
                            <span
                              className="tn-live-link"
                              onClick={(e) => { e.stopPropagation(); navigate(`/livescore/${match._id}`); }}
                            >
                              Live Score &rarr;
                            </span>
                          </div>

                          {/* Team 1 */}
                          <div className="tn-team-row">
                            <div className="tn-team-info">
                              <span className="tn-team-avatar">{getTeamInitials(t1Name)}</span>
                              <span className="tn-team-name">{t1Name}</span>
                            </div>
                            <span className="tn-team-score">
                              {match.team1Score || '0/0'} <span>({match.team1Overs || '0.0'})</span>
                            </span>
                          </div>

                          {/* Team 2 */}
                          <div className="tn-team-row" style={{ marginBottom: '0' }}>
                            <div className="tn-team-info">
                              <span className="tn-team-avatar" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#ea580c', borderColor: 'rgba(249, 115, 22, 0.2)' }}>{getTeamInitials(t2Name)}</span>
                              <span className="tn-team-name">{t2Name}</span>
                            </div>
                            <span className="tn-team-score">
                              {match.team2Score || '0/0'} <span>({match.team2Overs || '0.0'})</span>
                            </span>
                          </div>

                          {/* Outcome / Result */}
                          {(match.result || match.outcome?.summary) && (
                            <div className="tn-outcome">
                              🏆 {match.result || match.outcome?.summary}
                            </div>
                          )}

                          {/* Match Footer */}
                          <div className="tn-match-footer">
                            <span>📍 {match.venue || tournament.venue || 'Venue TBA'}</span>
                            <span className="tn-history-cue">📜 Click to view match history</span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {showTop && (
        <TopPerformance
          tournamentId={tournamentId}
          tournamentName={tournament ? (tournament.name || tournament.tournamentName || '') : ''}
          onClose={() => setShowTop(false)}
        />
      )}

      {historyMatch && (
        <MatchHistoryView
          log={historyData.ballLog}
          meta={{ ...historyData.meta, result: historyData.meta.result || historyData.result || historyMatch.result || '' }}
          team1={historyMatch.team1}
          team2={historyMatch.team2}
          loading={historyLoading}
          snapshot={historyData.snapshot}
          matchId={historyMatch._id}   // ADDED: shows the Squads tab (Playing XI + player profiles)
          onClose={closeHistory}
        />
      )}
    </div>
  );
}

export default CentralSchedule;