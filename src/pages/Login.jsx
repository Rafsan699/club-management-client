import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { LogIn, Lock, Mail } from 'lucide-react';
import PageShell from '../components/PageShell';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send login request to backend
      const res = await API.post('/api/auth/login', formData);

      const userData = res.data.user;

      // Extra frontend security check: block non-admin users who are not approved
      if (userData.role !== 'admin' && userData.status !== 'approved') {
        alert('Your account is pending approval by the admin. Please wait for approval.');
        setLoading(false);
        return;
      }

      alert(res.data.message || 'Login successful!');

      // Save user data to localStorage
      localStorage.setItem('clubUser', JSON.stringify(userData));

      // Go to home page
      navigate('/');
    } catch (err) {
      console.error('Login Error details:', err);
      alert(err.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell className="pg-soft">
      <div className="min-h-screen flex items-center justify-center px-4 pt-[calc(var(--hdr)+2rem)] pb-16">
        <form
          onSubmit={handleSubmit}
          className="pg-card rise w-full max-w-md p-7 sm:p-10 space-y-7 shadow-[0_1px_2px_rgba(15,23,42,.04),0_24px_48px_-32px_rgba(15,23,42,.3)]"
        >
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <span className="pg-iconbox !w-14 !h-14 !rounded-2xl"><LogIn className="w-6 h-6" /></span>
            </div>
            <h1 className="fd text-3xl font-extrabold">Member login</h1>
            <p className="text-sm t-mute">Welcome back! Please enter your credentials to continue.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="login-email" className="flex items-center gap-2 text-sm font-semibold t-ink mb-2">
                <Mail className="w-4 h-4 t-acc" /> Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pg-input"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="flex items-center gap-2 text-sm font-semibold t-ink mb-2">
                <Lock className="w-4 h-4 t-acc" /> Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pg-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="pg-btn pg-btn-primary w-full !min-h-[3rem] !text-base">
            {loading ? 'Logging in…' : 'Login'}
          </button>

          <p className="text-center text-sm t-mute">
            Don't have an account?{' '}
            <Link to="/registration" className="t-acc font-semibold hover:underline">Register here</Link>
          </p>
        </form>
      </div>
    </PageShell>
  );
}