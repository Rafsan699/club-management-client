import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import API, { useGet, useLiveSocket, img, initials, fmtDate } from './bdApi';

// Usage: <PlayerOfTournament tournamentId={t._id} />
// Shows ONE "Player of the Tournament" (updates live with performance).
// Click the card to open the full profile in a popup centered on the window.
// The popup is rendered in a portal on <body>, so parent cards (transform / blur) can never trap it.

const BLUE = '#1d4ed8', INK = '#0f172a', MUTE = '#64748b', LINE = '#dbe5ff';

const CSS = `
@keyframes potPulse{50%{opacity:.3}}
@keyframes potIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.pot-card{cursor:pointer;display:flex;gap:14px;align-items:center;padding:14px;border-radius:18px;background:linear-gradient(135deg,#eaf1ff,#f7fbff);border:1px solid ${LINE};color:${INK};transition:transform .15s,box-shadow .15s;text-align:left;width:100%;font:inherit}
.pot-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px -14px rgba(30,64,175,.5)}
.pot-card:focus-visible,.pot-x:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
.pot-card .pot-name{font-size:24px;font-weight:700;line-height:1.15;word-break:break-word}
.pot-ov{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;
  padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));overscroll-behavior:contain}
.pot-dialog{position:relative;width:min(680px,100%);max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);display:flex;flex-direction:column;background:linear-gradient(180deg,#f4f8ff,#eaf1ff);color:${INK};
  border-radius:24px;border:1px solid #fff;box-shadow:0 30px 80px -20px rgba(30,64,175,.5);animation:potIn .22s ease-out;overflow:hidden}
.pot-scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:26px;overscroll-behavior:contain}
.pot-x{position:absolute;top:14px;right:14px;z-index:2;width:40px;height:40px;border-radius:50%;border:1px solid ${LINE};background:#fff;color:${MUTE};font-size:22px;line-height:1;cursor:pointer}
.pot-head{display:flex;gap:18px;align-items:center;padding-right:46px}
.pot-title{font-size:34px;font-weight:700;line-height:1.1;word-break:break-word}
.pot-h{margin:22px 0 10px;font-size:22px;font-weight:700}
.pot-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.pot-recent{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px dashed ${LINE}}
.pot-recent:last-child{border-bottom:0}
@media (max-width:640px){
  .pot-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pot-scroll{padding:20px 16px}
  .pot-title{font-size:26px}
  .pot-h{font-size:19px}
  .pot-card .pot-name{font-size:21px}
}
@media (max-width:380px){ .pot-head{flex-direction:column;align-items:flex-start;padding-right:0;padding-top:34px} }
@media (prefers-reduced-motion:reduce){ .pot-dialog,.pot-card,.pot-live i{animation:none!important;transition:none!important} }
`;

function Pic({ p, size, ring = '#8fd3f4' }) {
  const st = { width: size, height: size, borderRadius: '50%', border: `3px solid ${ring}`, flex: '0 0 auto' };
  return p.photo
    ? <img src={img(p.photo)} alt={p.name} style={{ ...st, objectFit: 'cover', background: '#fff' }} />
    : <div style={{ ...st, display: 'grid', placeItems: 'center', background: '#e0ecff', color: BLUE, fontWeight: 700, fontSize: size * 0.36 }}>{initials(p.name)}</div>;
}
const Tile = ({ label, value }) => (
  <div style={{ background: 'rgba(255,255,255,.75)', border: `1px solid ${LINE}`, borderRadius: 14, padding: '12px 6px', textAlign: 'center', minWidth: 0 }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: BLUE, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 10.5, letterSpacing: '.06em', color: MUTE, marginTop: 4, textTransform: 'uppercase' }}>{label}</div>
  </div>
);
const Chip = ({ r }) => (
  <i style={{ fontStyle: 'normal', width: 24, height: 24, borderRadius: 7, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#fff', background: r === 'W' ? '#22c55e' : '#ef4444', flex: '0 0 auto' }}>{r}</i>
);
const LiveDot = () => (
  <span className="pot-live" style={{ background: '#dc2626', color: '#fff', padding: '1px 8px', borderRadius: 99, fontSize: 10.5 }}>
    <i style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#fff', marginRight: 4, animation: 'potPulse 1.2s infinite' }} />LIVE
  </span>
);

/* ---------- profile popup ---------- */
function ProfileModal({ row, isWinner, final, onClose }) {
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState('');
  const closeRef = useRef(null);
  const pid = row.player._id;

  useEffect(() => {
    let off = false;
    setInfo(null); setErr('');
    API.get(`/players/${pid}/stats`).then((r) => { if (!off) setInfo(r.data); }).catch((e) => { if (!off) setErr(e?.response?.data?.error || e.message); });
    return () => { off = true; };
  }, [pid]);

  // Esc closes, background scroll locked, focus moves to the close button and returns afterwards
  useEffect(() => {
    const prevFocus = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = old;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
  }, [onClose]);

  const p = (info && info.player) || row.player;
  const s = info && info.stats;
  const teams = (info && info.teams) || [];

  return createPortal(
    <div className="pot-ov" onClick={onClose}>
      <style>{CSS}</style>
      <div className="pot-dialog" role="dialog" aria-modal="true" aria-label={`${p.name} profile`} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="pot-x" onClick={onClose} aria-label="Close">×</button>
        <div className="pot-scroll">
          <div className="pot-head">
            <Pic p={p} size={96} ring={isWinner ? '#f2b705' : '#8fd3f4'} />
            <div style={{ minWidth: 0 }}>
              {isWinner && (
                <span style={{ display: 'inline-block', background: '#fff4cc', color: '#8a6100', border: '1px solid #f2d36b', borderRadius: 99, fontSize: 12, fontWeight: 700, padding: '3px 10px', marginBottom: 6 }}>
                  🏆 Player of the Tournament{!final ? ' · Live' : ''}
                </span>
              )}
              <div className="pot-title">{p.name}</div>
              <div style={{ color: MUTE, fontSize: 14, marginTop: 4 }}>
                {[p.department, p.batch && `Batch ${p.batch}`, p.hand && `${p.hand}-handed`].filter(Boolean).join(' · ') || '—'}
              </div>
              {s && s.form && s.form.length > 0 && <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>{s.form.map((r, i) => <Chip key={i} r={r} />)}</div>}
            </div>
          </div>

          {p.bio && <p style={{ margin: '14px 0 0', fontSize: 14, color: MUTE }}>{p.bio}</p>}

          <div className="pot-h">In this tournament{row.playing ? ' · Playing now' : ''}</div>
          <div className="pot-grid">
            <Tile label="Rating" value={row.rating} />
            <Tile label="Matches" value={row.played} />
            <Tile label="Wins" value={row.won} />
            <Tile label="Win rate" value={`${row.winRate}%`} />
            <Tile label="Games W-L" value={`${row.gamesWon}-${row.gamesLost}`} />
            <Tile label="Points scored" value={row.pointsFor} />
            <Tile label="Point diff" value={`${row.pointDiff > 0 ? '+' : ''}${row.pointDiff}`} />
          </div>
          <div style={{ fontSize: 13, color: MUTE, marginTop: 8 }}>Team: {row.team}{row.champion ? ' · Champion' : ''}</div>

          <div className="pot-h">Career</div>
          {err && <div style={{ color: '#dc2626', fontSize: 13 }}>{err}</div>}
          {!s && !err && <div style={{ color: MUTE, fontSize: 13 }}>Loading…</div>}
          {s && (
            <>
              <div className="pot-grid">
                <Tile label="Matches" value={s.played} />
                <Tile label="Wins" value={s.won} />
                <Tile label="Losses" value={s.lost} />
                <Tile label="Win rate" value={`${s.winRate}%`} />
                <Tile label="Games W-L" value={`${s.gamesWon}-${s.gamesLost}`} />
                <Tile label="Points scored" value={s.pointsScored} />
                <Tile label="Singles" value={`${s.singles.won}/${s.singles.played}`} />
                <Tile label="Doubles" value={`${s.doubles.won}/${s.doubles.played}`} />
              </div>
              {teams.length > 0 && (
                <div style={{ fontSize: 13, color: MUTE, marginTop: 12 }}>
                  Teams: {teams.map((t) => `${t.name}${t.tournament ? ` (${t.tournament.name})` : ''}`).join(' · ')}
                </div>
              )}
              {s.recent && s.recent.length > 0 && (
                <>
                  <div className="pot-h">Recent matches</div>
                  {s.recent.slice(0, 5).map((m, i) => (
                    <div className="pot-recent" key={i}>
                      <Chip r={m.result} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>vs {m.opponent}</div>
                        <div style={{ fontSize: 12, color: MUTE }}>{m.tournament}{m.date ? ` · ${fmtDate(m.date, false)}` : ''}</div>
                      </div>
                      <div style={{ color: MUTE, fontSize: 14, textAlign: 'right' }}>{m.score}</div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- main ---------- */
export default function PlayerOfTournament({ tournamentId, showTable = false, top = 5 }) {
  const { data, loading, error, reload } = useGet(tournamentId ? `/player-of-tournament?tournament=${tournamentId}` : null);
  const [selId, setSelId] = useState('');

  // reload shortly after any match update in this tournament (live)
  const timer = useRef(null);
  const onUpdate = useCallback((m) => {
    const tid = m && m.tournament && (m.tournament._id || m.tournament);
    if (String(tid) !== String(tournamentId)) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => reload(), 400);
  }, [tournamentId, reload]);
  const connected = useLiveSocket(onUpdate);
  useEffect(() => () => clearTimeout(timer.current), []);
  const close = useCallback(() => setSelId(''), []);

  if (!data && loading) return <p>Loading…</p>;
  if (!data && error) return <p>{error}</p>;
  if (!data || !data.winner) return <p>No matches have started yet.</p>;

  const w = data.winner;
  const live = data.liveMatches > 0;
  const sel = selId ? data.ranking.find((r) => String(r.player._id) === String(selId)) : null; // popup stats follow live updates

  return (
    <div>
      <style>{CSS}</style>
      <button type="button" className="pot-card" aria-haspopup="dialog" aria-label={`Player of the Tournament: ${w.player.name}. Open profile`} onClick={() => setSelId(w.player._id)}>
        <Pic p={w.player} size={72} ring="#f2b705" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, fontWeight: 700, color: '#8a6100' }}>
            <span>🏆 Player of the Tournament</span>
            {!data.final && live && <LiveDot />}
          </div>
          <div className="pot-name">{w.player.name}</div>
          <div style={{ color: MUTE, fontSize: 13 }}>{[w.team, w.player.department, w.player.batch && `Batch ${w.player.batch}`].filter(Boolean).join(' · ')}</div>
          <div style={{ color: BLUE, fontSize: 13, marginTop: 4, fontWeight: 600 }}>{w.won}W–{w.lost}L · Rating {w.rating} · Tap for profile</div>
        </div>
      </button>

      {!data.final && (
        <p style={{ fontSize: 12, color: MUTE, margin: '8px 2px 0' }}>
          {connected ? 'Updates live as matches are played.' : 'Live updates reconnecting…'} Final once the tournament ends.
        </p>
      )}

      {showTable && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left', color: MUTE }}><th>#</th><th>Player</th><th>Team</th><th>W</th><th>Rating</th></tr></thead>
            <tbody>
              {data.ranking.slice(0, top).map((r, i) => (
                <tr key={r.player._id} onClick={() => setSelId(r.player._id)} style={{ cursor: 'pointer' }}>
                  <td>{i + 1}</td><td>{r.player.name}</td><td>{r.team}</td><td>{r.won}</td><td><b>{r.rating}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && <ProfileModal row={sel} isWinner={String(sel.player._id) === String(w.player._id)} final={data.final} onClose={close} />}
    </div>
  );
}