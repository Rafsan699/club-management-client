import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Send, User, FileText, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [contactForm, setContactForm] = useState({ 
    name: '', 
    email: '', 
    subject: '', 
    message: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/contact', contactForm);
      if (res.data.success) {
        setSuccessMsg('Your message has been sent successfully!');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full transition-colors duration-500 font-sans relative antialiased selection:bg-blue-600 selection:text-white bg-[#f8fafc] text-slate-900"
    style={{
      backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <div className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-24 max-w-[1440px] mx-auto flex items-center justify-center">
        <div className="w-full max-w-3xl rounded-[2.5rem] border border-slate-200/90 bg-gradient-to-b from-white via-blue-50/30 to-white shadow-2xl shadow-slate-200/50 p-6 sm:p-10 md:p-12 backdrop-blur-2xl relative overflow-hidden group">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/10 blur-[120px] pointer-events-none"></div>

          <div className="text-center space-y-4 mb-10 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm inline-block bg-blue-50/80 border-blue-200 text-blue-700 shadow-blue-100/50">
              Get In Touch
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Send Us a Message
            </h1>
            <p className="text-slate-500 font-normal text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Have questions or queries? Fill out the form below and our team will get back to you.
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-lg shadow-emerald-950/5 backdrop-blur-xl relative z-10 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-blue-600" />
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Your Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-blue-600" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Subject</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 w-4 h-4 text-blue-600" />
                <input 
                  type="text" 
                  placeholder="Enter subject" 
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Message</label>
              <textarea 
                placeholder="Write your message here..." 
                rows="5"
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                required
                className="w-full p-4 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-blue-600/25 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30"
            >
              {submitting ? 'Sending Message...' : <><Send className="w-4 h-4" /> Send Message</>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Contact;