import React from 'react';
import { Link } from 'react-router-dom';
import { BASE, fmtDate } from './bdApi';
import Scoreboard from './Scoreboard';

export default function MatchCard({ m }) {
  return (
    <Link to={`${BASE}/match/${m._id}`} className="bd-click" style={{ display: 'block' }}>
      <Scoreboard m={m} compact />
      <div className="bd-mut" style={{ margin: '6px 4px 0' }}>{fmtDate(m.scheduledAt)}{m.venue ? ` · ${m.venue}` : ''}</div>
    </Link>
  );
}