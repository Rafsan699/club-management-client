import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, AlertCircle } from 'lucide-react';

const MeetingEntry = () => {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('id');
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingId) {
      navigate('/activities/meetings');
    }
  }, [meetingId, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // সঠিক এপিআই পাথ (/api/meetings/verify-code) দিয়ে কল করা হলো
      const res = await API.post('/api/meetings/verify-code', { meetingId, code });
      
      if (res.data) {
        sessionStorage.setItem(`verified_meeting_${meetingId}`, 'true');
        navigate(`/activities/meetings/view?id=${meetingId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Entry Code! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] px-4 pt-20">
      <form onSubmit={handleVerify} className="bg-white p-8 rounded-3xl shadow-xl border border-purple-100 max-w-md w-full space-y-6 text-center animate-in fade-in duration-300">
        
        <div className="w-14 h-14 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mx-auto border border-purple-200">
          <KeyRound className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900">Enter Meeting Code</h2>
          <p className="text-xs text-slate-500">This page is protected. Enter the code provided by admin to access.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <input 
          type="text" 
          placeholder="Enter secret code" 
          value={code} 
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
          }} 
          required 
          className="w-full px-4 py-3.5 rounded-2xl border border-purple-200 text-center text-sm font-bold tracking-widest focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
        />
        
        <button 
          type="submit" 
          disabled={loading || !code.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? 'Verifying...' : 'Verify & Enter'}
        </button>
        
      </form>
    </div>
  );
};

export default MeetingEntry;