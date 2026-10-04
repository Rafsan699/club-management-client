import React from 'react';

export const formatLabel = (t) => {
  if (!t) return '';
  const legs = t.legs === 2 ? 'home & away' : 'single leg';
  return t.format === 'group_round_robin'
    ? `Group stage + round robin · ${t.groupCount} groups · top ${t.qualifyPerGroup} qualify · ${legs}`
    : `Round robin · ${legs}`;
};

export const tiebreakText = (t) => (t?.tiebreak === 'uefa'
  ? 'head-to-head points, head-to-head goal difference, head-to-head goals, then overall goal difference and goals scored'
  : 'goal difference, goals scored, then head-to-head record');

const gdText = (r) => { const d = r.gf - r.ga; return d > 0 ? `+${d}` : d; };

function Table({ rows, compact, highlightLeader, bare }) {
  const wrap = bare
    ? 'overflow-x-auto rounded-xl border border-[#dbe6fb] dark:border-white/10'
    : 'overflow-x-auto rounded-2xl border border-[#dbe6fb] dark:border-white/10 bg-white dark:bg-[#0c1a3d] shadow-[0_12px_32px_-20px_rgba(10,31,92,0.25)]';
  return (
    <div className={`${wrap} dark:text-slate-100`}>
      <table className="w-full min-w-[360px] text-sm">
        <thead className="bg-[#f4f8ff] dark:bg-white/5 text-slate-500 dark:text-slate-400">
          <tr className="text-left [&>th]:py-3 [&>th]:px-2 [&>th]:font-semibold">
            <th className="!pl-4">#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th>
            {!compact && <><th>GF</th><th>GA</th></>}<th>GD</th><th className="!pr-4">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r._id}
              className={`border-t border-[#e6eefc] dark:border-white/10 [&>td]:py-3 [&>td]:px-2 ${
                r.qualified ? 'bg-green-50 dark:bg-green-500/10' : highlightLeader && i === 0 ? 'bg-[#eaf1ff] dark:bg-[#1f5eff]/15' : ''}`}>
              <td className={`!pl-4 font-bold ${r.qualified ? 'border-l-4 border-green-600' : highlightLeader && i === 0 ? 'border-l-4 border-[#1f5eff]' : ''}`}>{r.rank || i + 1}</td>
              <td className="font-semibold whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  {r.team?.logo && <img src={r.team.logo} alt="" className="w-7 h-7 rounded-full object-cover bg-white" />}{r.team?.name}
                </span>
              </td>
              <td>{r.played}</td><td>{r.won}</td><td>{r.drawn}</td><td>{r.lost}</td>
              {!compact && <><td>{r.gf}</td><td>{r.ga}</td></>}
              <td>{gdText(r)}</td>
              <td className="!pr-4 font-bold text-[#0a1f5c] dark:text-white">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// rows come from GET /points/table/:id (already ranked, with group / rank / qualified)
// bare = no outer card (use inside a Panel)
export default function StandingsTable({ rows, format, compact = false, limit, bare = false }) {
  if (format === 'group_round_robin') {
    const groups = {};
    rows.forEach((r) => { (groups[r.group || ''] = groups[r.group || ''] || []).push(r); });
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Object.keys(groups).sort().map((g) => (
          <div key={g} className="min-w-0">
            <h3 className="font-['Barlow_Condensed'] text-xl font-bold text-[#0a1f5c] dark:text-white mb-2">{g ? `Group ${g}` : 'Not in a group yet'}</h3>
            <Table rows={groups[g]} compact bare={bare} />
          </div>
        ))}
      </div>
    );
  }
  return <Table rows={limit ? rows.slice(0, limit) : rows} compact={compact} bare={bare} highlightLeader />;
}