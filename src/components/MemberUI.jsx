import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

export const MemberCard = ({ member, onClick, highlight = false }) => {
  const img = member.img || member.image || FALLBACK_IMG;
  const dept = member.dept || member.department;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group h-full cursor-pointer"
    >
      <div className={`pg-card pg-card-hover h-full p-3 ${highlight ? '!border-[var(--acc)] ring-1 ring-[var(--acc)]' : ''}`}>
        <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-surf2">
          <img
            src={img}
            alt={member.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="px-1.5 pt-4 pb-2">
          <h3 className="fd text-lg font-bold leading-tight">{member.name}</h3>
          {member.role && <p className="pg-badge mt-2.5">{member.role}</p>}
          {dept && <p className="text-sm t-mute mt-2">{dept}</p>}
          <p className="text-xs font-semibold t-acc mt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View profile <ArrowRight className="w-3.5 h-3.5" />
          </p>
        </div>
      </div>
    </div>
  );
};

/* rows: [{ label, value, accent }]  ·  meta: [string]  ·  children: extra body content */
export const MemberModal = ({ member, onClose, meta = [], rows = [], children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!member) return null;
  const img = member.img || member.image || FALLBACK_IMG;

  return (
    <div
      className="pg-fade fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pg-pop pg-card pg-scroll relative w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-10 h-10 grid place-items-center rounded-full bg-white/90 hover:bg-white text-slate-700 shadow border bd-line transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="h-64 sm:h-72 bg-surf2 rounded-t-2xl overflow-hidden">
          <img src={img} alt={member.name} className="w-full h-full object-cover object-top" />
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          <div>
            <h3 className="fd text-2xl sm:text-3xl font-extrabold leading-tight">{member.name}</h3>
            {member.role && <p className="pg-badge mt-3">{member.role}</p>}
            {meta.filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm t-mute mt-2">{line}</p>
            ))}
          </div>

          {rows.length > 0 && (
            <dl className="border-t bd-line text-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between items-center gap-4 py-3.5 border-b bd-line last:border-b-0">
                  <dt className="t-mute">{r.label}</dt>
                  <dd className={`font-medium text-right max-w-[220px] truncate ${r.accent ? 't-acc' : 't-ink'}`}>
                    {r.value || 'N/A'}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};