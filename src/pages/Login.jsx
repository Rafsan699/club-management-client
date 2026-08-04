import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // URL পরিবর্তন করা হলো: /api/auth/login এর বদলে /api/login
      const res = await axios.post('/api/login', formData);
      
      alert(res.data.message || 'Login successful!');
      
      // লোকাল স্টোরেজে ইউজার ডাটা সেভ করা
      localStorage.setItem('clubUser', JSON.stringify(res.data.user));
      
      // হোম পেজে নিয়ে যাওয়া
      navigate('/');
    } catch (err) {
      console.error('Login Error details:', err);
      alert(err.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf9f5] py-12 px-4 text-slate-800">
      <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 my-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-purple-600 flex items-center justify-center gap-3">
            <LogIn className="w-10 h-10" /> Member Login
          </h2>
          <p className="text-sm text-slate-500 font-medium">Welcome back! Please enter your credentials to continue.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Mail className="w-4 h-4 text-purple-600"/> Email Address
            </label>
            <input 
              type="email" 
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Lock className="w-4 h-4 text-purple-600"/> Password
            </label>
            <input 
              type="password" 
              required
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-xl font-bold text-sm tracking-wider uppercase transition shadow-lg disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-slate-500 text-xs">
          Don't have an account? <Link to="/registration" className="text-purple-600 font-bold hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  );
}