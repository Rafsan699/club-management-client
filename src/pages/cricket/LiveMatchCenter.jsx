import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../../services/api';              // client api.js (baseURL = VITE_API_URL)
import MatchHistoryView, { BallChip, useCountUp, TeamBadge, PlayingXISquads } from './MatchHistoryView'; // <- adjust the path to where your file lives

/* =====================================================================
 *  LiveMatchCenter  (client, read-only, NO refresh needed)
 *  - loads live score + ball-by-ball history once
 *  - joins the match room with socket.io and applies every update instantly
 *  - Cricbuzz-style live header on top, Squads / Scorecard / Overs / Commentary below
 *    (styles come from MatchHistoryView's CB_CSS, so finished matches look exactly the same)
 * ===================================================================== */

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FLASH_BG = { WICKET: '#d32f2f', SIX: '#7b1fa2', FOUR: '#1e88e5' };

const fmtOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;
const rate = (runs, balls) => (balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00');

const lastEventText = (e) => {
  if (!e) return '';
  if (e.kind === 'adjust') return `Extra runs added: +${e.runs}`;
  if (e.kind === 'retire') return `${(e.player && e.player.name) || 'Batter'} retired`;
  const bw = (e.bowler && e.bowler.name) || 'Bowler';
  const st = (e.striker && e.striker.name) || 'Batter';
  let r;
  if (e.wicket) r = `OUT! ${(e.wicket.batter && e.wicket.batter.name) || st} (${e.wicket.howOut})`;
  else if (e.extraKind === 'wd') r = 'Wide';
  else if (e.extraKind === 'nb') r = `No ball${e.batRuns ? ` + ${e.batRuns}` : ''}`;
  else if (e.extraKind === 'b') r = `${e.totalRuns} bye${e.totalRuns === 1 ? '' : 's'}`;
  else if (e.extraKind === 'lb') r = `${e.totalRuns} leg bye${e.totalRuns === 1 ? '' : 's'}`;
  else if (e.batRuns === 4) r = 'FOUR';
  else if (e.batRuns === 6) r = 'SIX';
  else if (e.batRuns === 0) r = 'dot ball';
  else r = `${e.batRuns} run${e.batRuns === 1 ? '' : 's'}`;
  return `${bw} to ${st}: ${r}`;
};

const flashFor = (e) => {
  if (!e || e.kind === 'adjust' || e.kind === 'retire') return null;
  if (e.wicket) return { text: 'WICKET', bg: FLASH_BG.WICKET };
  if (e.batRuns === 6) return { text: 'SIX', bg: FLASH_BG.SIX };
  if (e.batRuns === 4) return { text: 'FOUR', bg: FLASH_BG.FOUR };
  return null;
};


/* ---------- live match header ---------- */
const LiveScoreboard = ({ live, ballLog, matchInfo, team1, team2, connected, flash }) => {
  const started = !!(live && live.matchStarted) || ballLog.length > 0;
  const done = !!(live && (live.result || live.matchStatus === 'Completed' || live.matchStatus === 'Finished'));
  const isLive = started && !done;

  const balls = (live && live.ballsCount) || 0;
  const runs = (live && live.runs) || 0;
  const wkts = (live && live.wickets) || 0;
  const limit = (live && live.oversLimit) || 20;
  const chasing = live && live.innings === '2nd Innings' && Number(live.target) > 0;
  const need = chasing ? live.target - runs : 0;
  const ballsLeft = Math.max(0, limit * 6 - balls);
  const shownRuns = useCountUp(runs);
  const pct = Math.min(100, chasing ? (runs / live.target) * 100 : (balls / (limit * 6)) * 100);

  const innEntries = useMemo(() => ballLog.filter((e) => live && e.innings === live.innings), [ballLog, live]);
  const lastEntry = innEntries[innEntries.length - 1];
  const innScores = useMemo(() => {
    const m = new Map();
    ballLog.forEach((e) => {
      if (!e.innings || e.kind === 'retire') return;
      const r = m.get(e.innings) || { team: e.battingTeam || '', runs: 0, wkts: 0, legal: 0 };
      if (e.battingTeam && !r.team) r.team = e.battingTeam;
      if (e.scoreAfter) { r.runs = e.scoreAfter.runs; r.wkts = e.scoreAfter.wickets; }
      if (e.kind === 'ball' && e.legal) r.legal += 1;
      m.set(e.innings, r);
    });
    return [...m.values()];
  }, [ballLog]);
  const thisOver = lastEntry ? innEntries.filter((e) => e.over === lastEntry.over) : [];

  const batters = live ? [live.striker, live.nonStriker].filter((b) => b && b.name) : [];
  const bowler = live && live.currentBowler && live.currentBowler.name ? live.currentBowler : null;

  const t1 = matchInfo.team1 || team1 || 'Team 1';
  const t2 = matchInfo.team2 || team2 || 'Team 2';
  const batTeam = (live && live.battingTeam) || '';
  const otherTeam = batTeam === t1 ? t2 : batTeam === t2 ? t1 : '';

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      {flash && (
        <div className="cb-flash" key={flash.id} style={{ background: flash.bg }}>{flash.text}</div>
      )}

      <div className="cb-card cb-flush">
        <div className="cb-live-top">
          {isLive ? (
            <span className="cb-tag"><span className="cb-dot" />LIVE</span>
          ) : (
            <span className={`cb-tag ${done ? 'fin' : 'up'}`}>{done ? 'FINISHED' : 'UPCOMING'}</span>
          )}
          <span className="ttl">{t1} vs {t2}</span>
          {matchInfo.tournamentName && <span>{matchInfo.tournamentName}</span>}
          <span className={`cb-conn${connected ? ' ok' : ''}`}><i />{connected ? 'Connected' : 'Reconnecting...'}</span>
        </div>

        {!started ? (
          <div className="cb-empty">
            Match has not started yet. This page updates by itself when the toss is done and play begins.
            {(matchInfo.date || matchInfo.venue) && (
              <div style={{ marginTop: 6, fontWeight: 500, color: 'var(--ink)' }}>{[matchInfo.date, matchInfo.time, matchInfo.venue].filter(Boolean).join(' | ')}</div>
            )}
          </div>
        ) : (
          <>
            <div className="cb-vs">
              {[t1, t2].map((t) => {
                const sc = innScores.find((x) => x.team === t);
                const isBat = t === batTeam;
                return (
                  <div key={t} className={`cb-side${isBat ? ' on' : ''}`}>
                    <TeamBadge name={t} size={46} />
                    <div className="tn">{t}</div>
                    <div className="ts">{isBat ? `${shownRuns}-${wkts}` : sc ? `${sc.runs}-${sc.wkts}` : '-'}</div>
                    <div className="to">{isBat ? `${fmtOvers(balls)} / ${limit} Ov` : sc ? `${fmtOvers(sc.legal)} Ov` : 'Yet to bat'}</div>
                  </div>
                );
              })}
            </div>

            {done ? (
              <div className="cb-stat done">{live.result || 'Match completed'}</div>
            ) : chasing ? (
              <div className="cb-stat">{need > 0 ? `${batTeam} need ${need} runs from ${ballsLeft} balls` : 'Target reached'}</div>
            ) : (
              <div className="cb-stat nrm">{live && live.tossWinner ? `${live.tossWinner} won the toss` : 'Batting first'}</div>
            )}

            <div className="cb-prog"><i style={{ width: `${pct}%` }} /></div>

            <div className="cb-rates">
              <span>CRR <b>{rate(runs, balls)}</b></span>
              {chasing && need > 0 && ballsLeft > 0 && !done && <span>RRR <b>{((need / ballsLeft) * 6).toFixed(2)}</b></span>}
              {live && live.extras && <span>Extras <b>{live.extras.total || 0}</b></span>}
            </div>

            {batters.length > 0 && (
              <div className="cb-scroll" style={{ borderTop: '1px solid var(--line)' }}>
                <table className="cb-tbl">
                  <thead><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
                  <tbody>
                    {batters.map((b, i) => (
                      <tr key={i}>
                        <td><span className="cb-pn">{b.name}{i === 0 ? ' *' : ''}</span></td>
                        <td className="r">{b.runs || 0}</td>
                        <td>{b.balls || 0}</td>
                        <td>{b.fours || 0}</td>
                        <td>{b.sixes || 0}</td>
                        <td>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                  {bowler && (
                    <>
                      <thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th></th></tr></thead>
                      <tbody>
                        <tr>
                          <td><span className="cb-pn">{bowler.name}</span></td>
                          <td>{bowler.overs || 0}.{bowler.ballsInOver || 0}</td>
                          <td>{bowler.maidens || 0}</td>
                          <td>{bowler.runsConceded || 0}</td>
                          <td className="r">{bowler.wickets || 0}</td>
                          <td />
                        </tr>
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            )}

            <div className="cb-tov">
              <span className="lb">This over</span>
              <div className="cb-balls">{thisOver.map((e) => <BallChip key={e.id} e={e} />)}</div>
              <span className={`cb-last${lastEntry && lastEntry.wicket ? ' w' : ''}`}>{lastEventText(lastEntry)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- page ---------- */
const LiveMatchCenter = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [live, setLive] = useState(null);
  const [hist, setHist] = useState({ ballLog: [], meta: {}, so: null, snapshot: null, matchInfo: null, updatedAt: null });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [flash, setFlash] = useState(null);

  const lastIdRef = useRef(null);
  const histStampRef = useRef(0);
  const flashTimer = useRef(null);

  const applyHistory = (h) => {
    const stamp = h.updatedAt ? new Date(h.updatedAt).getTime() : 0;
    if (stamp && stamp < histStampRef.current) return;   // ignore an older, late-arriving update
    if (stamp) histStampRef.current = stamp;

    const log = Array.isArray(h.ballLog) ? h.ballLog : [];
    const last = log[log.length - 1];
    // celebrate only NEW events (not the first load)
    if (lastIdRef.current !== null && last && last.id !== lastIdRef.current) {
      const f = flashFor(last);
      if (f) {
        setFlash({ ...f, id: last.id });
        clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(null), 3000);
      }
    }
    lastIdRef.current = last ? last.id : '';
    setHist((prev) => ({ ...prev, ...h, ballLog: log }));
  };

  const loadAll = async () => {
    try {
      const [liveRes, histRes] = await Promise.all([
        API.get(`/api/cricket/live-score/${matchId}`),
        API.get(`/api/cricket/live-score/${matchId}/history`)
      ]);
      setLive(liveRes.data);
      applyHistory(histRes.data);
    } catch (err) {
      console.error('Could not load match:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lastIdRef.current = null;
    histStampRef.current = 0;
    loadAll();

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    const join = () => { setConnected(true); socket.emit('joinMatch', matchId); };
    socket.on('connect', join);                                  // also re-joins after a reconnect
    socket.io.on('reconnect', loadAll);                          // catch up on anything missed while offline
    socket.on('disconnect', () => setConnected(false));
    socket.on('liveScoreUpdated', (d) => { if (d && String(d.matchId) === String(matchId)) setLive(d); });
    socket.on('matchHistoryUpdated', (d) => { if (d && String(d.matchId) === String(matchId)) applyHistory(d); });

    return () => {
      clearTimeout(flashTimer.current);
      socket.emit('leaveMatch', matchId);
      socket.disconnect();
    };
  }, [matchId]);

  const info = hist.matchInfo || {};
  const team1 = (hist.meta && hist.meta.team1) || info.team1 || '';
  const team2 = (hist.meta && hist.meta.team2) || info.team2 || '';
  const squad1 = (live && live.team1Squad && live.team1Squad.length ? live.team1Squad : hist.team1Squad) || [];
  const squad2 = (live && live.team2Squad && live.team2Squad.length ? live.team2Squad : hist.team2Squad) || [];

  const meta = {
    ...hist.meta,
    tossWinner: (live && live.tossWinner) || (hist.meta && hist.meta.tossWinner) || '',
    tossDecision: (live && live.tossDecision) || (hist.meta && hist.meta.tossDecision) || '',
    totalOvers: (hist.meta && hist.meta.totalOvers) || (live && live.oversLimit) || '',
    result: (live && live.result) || (hist.meta && hist.meta.result) || ''
  };

  return (
    <MatchHistoryView
      log={hist.ballLog}
      meta={meta}
      team1={team1}
      team2={team2}
      loading={loading}
      snapshot={hist.snapshot}
      onClose={() => navigate(-1)}
      live={live}
      barSlot={live && (live.matchStarted || hist.ballLog.length > 0) ? (
        <span className="cb-minisc"><i />{live.runs || 0}-{live.wickets || 0}<small>({fmtOvers(live.ballsCount || 0)})</small></span>
      ) : null}
      topSlot={
        <LiveScoreboard live={live} ballLog={hist.ballLog} matchInfo={info} team1={team1} team2={team2} connected={connected} flash={flash} />
      }
      squadsSlot={
        <PlayingXISquads matchId={matchId} team1={team1} team2={team2} keys1={squad1} keys2={squad2} live={live} />
      }
    />
  );
};

export default LiveMatchCenter;