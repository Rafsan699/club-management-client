import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, ShieldAlert, ArrowLeft, UserCheck, UserX, Sparkles, X, FileText, ChevronRight } from 'lucide-react';

const MeetingDetailsUser = () => {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('id');
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Member for Modal View
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (!meetingId) {
      navigate('/activities/meetings');
      return;
    }

    const isVerified = sessionStorage.getItem(`verified_meeting_${meetingId}`);
    if (!isVerified) {
      navigate(`/activities/meetings/entry?id=${meetingId}`);
      return;
    }

    API.get(`/api/meetings/${meetingId}`)
      .then(res => {
        setMeeting(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching meeting details:", err);
        setError('Failed to load meeting details or meeting not found.');
        setLoading(false);
      });
  }, [meetingId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600/25 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="font-bold text-slate-500 text-xs tracking-wider uppercase">Loading secure session...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30 px-4 space-y-5">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 flex items-center gap-3 font-semibold text-xs shadow-lg backdrop-blur-xl">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error || 'Meeting not found!'}</span>
        </div>
        <button 
          onClick={() => navigate('/activities/meetings')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Meetings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-indigo-50/30 to-slate-100/60 py-10 px-4 sm:px-6 max-w-md sm:max-w-3xl lg:max-w-4xl mx-auto space-y-8 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Ultra Premium White Glass Hero Header */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.08)] border border-white/80 space-y-6 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-indigo-500/15 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur-xl text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Official Report
          </span>
          <button 
            onClick={() => navigate('/activities/meetings')}
            className="px-4 py-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all backdrop-blur-xl border border-slate-200/60 flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <div className="space-y-2 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Calendar className="w-6 h-6" />
            </div>
            {meeting.meetingDate || 'Meeting Details'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg leading-relaxed">
            Review participant attendance records and individual meeting session notes securely verified by administration.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        
        {/* Present Members List */}
        <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-7 rounded-[2.5rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] border border-white/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <UserCheck className="w-4 h-4 text-emerald-600" /> Present Members
            </h2>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 shadow-sm">
              {meeting.presentMembers?.length || 0}
            </span>
          </div>
          
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {meeting.presentMembers && meeting.presentMembers.length > 0 ? (
              meeting.presentMembers.map((m, idx) => (
                <div 
                  key={m.memberId || m._id || idx} 
                  onClick={() => setSelectedMember(m)}
                  className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/40 via-white to-slate-50/50 border border-emerald-100/80 flex items-center justify-between gap-4 shadow-sm hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/60 transition-all duration-300 cursor-pointer group hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img 
                      src={m.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} 
                      alt={m.name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-200 shadow-sm flex-shrink-0 group-hover:border-emerald-400 transition-colors" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug truncate">{m.name}</h4>
                      <p className="text-[11px] text-emerald-700/80 font-bold leading-tight mt-1 truncate">
                        {m.role || 'Member'} {m.dept || m.department ? `• ${m.dept || m.department}` : ''} {m.batch && m.batch !== 'N/A' ? `(${m.batch})` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-bold">No members marked present.</p>
              </div>
            )}
          </div>
        </div>

        {/* Absent Members List */}
        <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-7 rounded-[2.5rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] border border-white/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <UserX className="w-4 h-4 text-rose-600" /> Absent Members
            </h2>
            <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-black rounded-full border border-rose-200 shadow-sm">
              {meeting.absentMembers?.length || 0}
            </span>
          </div>
          
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {meeting.absentMembers && meeting.absentMembers.length > 0 ? (
              meeting.absentMembers.map((m, idx) => (
                <div 
                  key={m.memberId || m._id || idx} 
                  onClick={() => setSelectedMember(m)}
                  className="p-4 rounded-2xl bg-gradient-to-r from-slate-50/60 via-white to-rose-50/30 border border-slate-100/80 flex items-center justify-between gap-4 shadow-sm hover:border-rose-200 hover:shadow-md hover:bg-rose-50/40 transition-all duration-300 cursor-pointer group hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img 
                      src={m.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} 
                      alt={m.name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-sm flex-shrink-0 opacity-85 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-rose-900 transition-colors leading-snug truncate">{m.name}</h4>
                      <p className="text-[11px] text-slate-500 font-bold leading-tight mt-1 truncate">
                        {m.role || 'Member'} {m.dept || m.department ? `• ${m.dept || m.department}` : ''} {m.batch && m.batch !== 'N/A' ? `(${m.batch})` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-bold">No absent members recorded.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Member Detail Modal with White Professional Glass Theme */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] max-w-md w-full p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-white space-y-6 relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setSelectedMember(null)} 
              className="absolute top-5 right-5 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all z-10 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3 pt-2 flex-shrink-0">
              <div className="relative inline-block">
                <img 
                  src={selectedMember.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                  alt={selectedMember.name} 
                  className="w-20 h-20 rounded-3xl object-cover border-4 border-indigo-50 shadow-xl mx-auto" 
                />
              </div>
              <div className="space-y-1 px-2">
                <h3 className="text-base font-black text-slate-950 tracking-wide break-words">{selectedMember.name}</h3>
                <p className="text-xs text-indigo-600 font-black uppercase tracking-wider">
                  {selectedMember.role || 'Member'}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedMember.dept || selectedMember.department || 'N/A'} {selectedMember.batch && selectedMember.batch !== 'N/A' ? `• Batch: ${selectedMember.batch}` : ''}
                </p>
              </div>
            </div>

            {/* Scrollable Agenda / Notes Section inside Modal */}
            <div className="space-y-2.5 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/60 flex-1 overflow-hidden flex flex-col shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2 flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Agenda / Personal Notes
              </span>
              <div className="overflow-y-auto pr-1 max-h-48 custom-scrollbar">
                <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedMember.agendas && selectedMember.agendas !== "" 
                    ? selectedMember.agendas 
                    : "No specific agenda or notes provided for this participant."}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMember(null)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex-shrink-0 uppercase tracking-widest"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MeetingDetailsUser;