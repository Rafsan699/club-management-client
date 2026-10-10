import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGet, useLiveSocket } from './bdApi';
import PageHead from './PageHead';

export default function BadmintonPointTable() {
  const [sp, setSp] = useSearchParams();
  const { data: tours } = useGet('/tournaments');
  const tid = sp.get('t') || '';
  const stage = sp.get('s') || '';

  useEffect(() => {
    if (!tid && tours && tours.length) { const pick = tours.find((t) => t.status === 'ongoing') || tours[0]; setSp({ t: pick._id }, { replace: true }); }
  }, [tours, tid]); // eslint-disable-line

  const { data, loading, reload } = useGet(tid ? `/standings?tournament=${tid}${stage ? `&stage=${stage}` : ''}` : null);
  useLiveSocket((m) => { if (m.status === 'completed') reload(); });

  const stale = !data || !data.tournament || String(data.tournament._id) !== tid;
  const advancing = data && data.stage < data.totalRounds;
  const plan = (data && data.plan) || [];
  const roundName = data && plan[data.stage - 1] ? plan[data.stage - 1].name : '';

  return (
    <>
      <PageHead title="Point table" sub="Calculated automatically from match results" />
      <div className="bd-tabs">
        <select value={tid} onChange={(e) => setSp({ t: e.target.value })}>
          {(tours || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      {loading && stale ? <div className="bd-empty">Loading…</div> : !data || !data.tournament ? <div className="bd-empty">Tournament not found</div> : (
        <>
          {data.champion && (
            <div className="bd-card" style={{ marginBottom: 16 }}>
              <span className="bd-pill done">Champion</span>
              <h3 style={{ margin: '8px 0 0', fontSize: 26 }}>🏆 {data.champion.name}</h3>
            </div>
          )}

          {plan.length > 1 && (
            <div className="bd-tabs">
              {plan.map((p) => {
                const locked = p.no > data.currentStage;
                return (
                  <button key={p.no} className={data.stage === p.no ? 'on' : ''} disabled={locked}
                    style={locked ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                    onClick={() => setSp({ t: tid, s: String(p.no) })}>{p.name}</button>
                );
              })}
            </div>
          )}

          {data.expected > 0 && (
            <div className="bd-mut" style={{ marginBottom: 10 }}>
              {roundName} · Matches completed: {data.done}/{data.expected}
              {advancing ? ` · Top ${data.advance} of each group advance` : ''}
            </div>
          )}

          {!data.groups.length ? <div className="bd-empty">No teams in this round</div> : data.groups.map((g) => (
            <div key={g.group} className="bd-card" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>
                {data.groups.length > 1 ? `${roundName} · Group ${g.group}` : roundName || data.tournament.name}
              </h3>
              <div className="bd-scroll">
                <table className="bd-tbl">
                  <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>GW</th><th>GL</th><th>PF</th><th>PA</th><th>Diff</th><th>Pts</th></tr></thead>
                  <tbody>
                    {g.rows.map((r, i) => {
                      const isChamp = data.champion && String(data.champion._id) === String(r.team._id);
                      const qualify = (advancing && r.played && i < data.advance) || isChamp;
                      return (
                        <tr key={r.team._id} className={qualify ? 'q' : ''}>
                          <td>{i + 1}</td><td><b>{r.team.name}</b>{isChamp ? ' 🏆' : ''}</td><td>{r.played}</td><td>{r.won}</td><td>{r.lost}</td>
                          <td>{r.gamesFor}</td><td>{r.gamesAgainst}</td><td>{r.pointsFor}</td><td>{r.pointsAgainst}</td>
                          <td>{r.pointDiff > 0 ? `+${r.pointDiff}` : r.pointDiff}</td><td><b>{r.pts}</b></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="bd-mut" style={{ marginTop: 8 }}>
                P played · W won · L lost · GW/GL games won/lost · PF/PA points for/against · Win = {data.tournament.pointsPerWin} pts · Ranking: Pts → head-to-head (2 teams tie) → game diff → point diff
                {advancing ? ' · Highlighted rows advance to the next round' : ''}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}