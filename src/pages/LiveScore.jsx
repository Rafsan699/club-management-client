import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const LiveScore = () => {
  const socket = useContext(SocketContext);
  const [matchData, setMatchData] = useState({
    teamA: 'Team Alpha',
    teamB: 'Team Bravo',
    scoreA: '145/3',
    scoreB: '0/0',
    overs: '16.4'
  });

  useEffect(() => {
    if (!socket) return;
    socket.on('scoreUpdate', (data) => setMatchData(data));
    return () => socket.off('scoreUpdate');
  }, [socket]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
        <span className="text-red-500 font-bold flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span> LIVE MATCH
        </span>
        <span className="text-gray-400">T20 Championship</span>
      </div>

      <div className="grid grid-cols-3 text-center items-center py-6">
        <div>
          <h2 className="text-2xl font-bold">{matchData.teamA}</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mt-2">{matchData.scoreA}</p>
        </div>
        <div>
          <span className="text-xl font-bold text-gray-500">VS</span>
          <p className="text-sm text-gray-400 mt-2">Overs: {matchData.overs}</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{matchData.teamB}</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mt-2">{matchData.scoreB}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveScore;