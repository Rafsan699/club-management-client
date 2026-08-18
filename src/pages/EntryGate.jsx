import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Lock, KeyRound, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

const EntryGate = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/api/form/verify', { entryCode: code });
      if (res.data.success) {
        localStorage.setItem('formAccessGranted', 'true');
        navigate('/dynamic-form');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Entry Code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-100 selection:bg-purple-600 selection:text-white">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <form 
          onSubmit={handleVerify} 
          className="bg-slate-900/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-purple-950/50 border border-purple-500/20 relative overflow-hidden space-y-6"
        >
          {/* Top Gradient Border Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"></div>

          {/* Header Info */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-xs tracking-widest uppercase border border-purple-500/20 mx-auto">
              <Sparkles size={14} /> Secure Access
            </div>

            <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-3xl flex items-center justify-center mx-auto border border-purple-500/20 shadow-inner">
              <Lock size={28} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Enter Access Code</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Please enter the secure entry code provided by the administrator to access and fill out the form.
              </p>
            </div>
          </div>

          {/* Input Field */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                <KeyRound size={20} />
              </div>
              <input 
                type="password" 
                placeholder="Enter Entry Code" 
                value={code} 
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError('');
                }} 
                className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-slate-100 text-center tracking-[0.3em] text-lg placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm focus:bg-slate-950 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300 font-bold" 
                required 
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-bold flex items-center justify-center gap-1.5 animate-pulse bg-rose-950/30 p-3 rounded-xl border border-rose-500/20">
                <AlertCircle size={16} /> {error}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-2xl font-black text-base shadow-xl shadow-purple-900/50 hover:shadow-purple-700/80 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Access Form'
            )}
          </button>

          {/* Footer Security Badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <ShieldCheck size={16} /> End-to-End Encrypted Verification
          </div>

        </form>
      </div>
    </div>
  );
};

export default EntryGate;