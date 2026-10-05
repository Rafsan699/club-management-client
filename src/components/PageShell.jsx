import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';

/* Shared white-mode design system for all inner pages (same look as Home)
   ink #0f172a · body #475569 · muted #64748b · line #e2e8f0 · soft #f8fafc
   accent #0f7a4a · accent-dark #0b5d38 · tint #ecfdf3
   fonts: Manrope (headings) + Inter (body)

   PageShell does two things:
   1. Measures the extra top padding that the parent (App.jsx) leaves for the fixed header
      and cancels it, so there is no empty white gap under the header.
   2. Exposes --hdr (real header height) so page content can start right below the header. */

const findFixedHeader = () =>
  Array.from(document.querySelectorAll('header')).find(
    (h) => getComputedStyle(h).position === 'fixed'
  );

const PageShell = ({ className = '', children }) => {
  const ref = useRef(null);
  const pullRef = useRef(0);
  const [pull, setPull] = useState(0);
  const [hdr, setHdr] = useState(72);

  useEffect(() => { pullRef.current = pull; }, [pull]);

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const natural = el.getBoundingClientRect().top + window.scrollY + pullRef.current;
      setPull(Math.max(0, Math.round(natural)));
      const h = findFixedHeader();
      if (h) setHdr(Math.round(h.getBoundingClientRect().height));
    };
    measure();
    const t = setTimeout(measure, 300);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`pg min-h-screen relative selection:bg-[#0f7a4a] selection:text-white ${className}`}
      style={{ marginTop: pull ? -pull : undefined, '--hdr': `${hdr}px`, overflowX: 'clip' }}
    >
      {children}
      <style>{PAGE_CSS}</style>
    </div>
  );
};

export default PageShell;

/* ---------- Shared building blocks ---------- */

export const PageHero = ({ eyebrow, title, desc, aside, children }) => (
  <section className="pg-hero">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-[calc(var(--hdr)+2.5rem)] sm:pt-[calc(var(--hdr)+3.5rem)] pb-12 sm:pb-16">
      <div className={aside ? 'grid lg:grid-cols-2 gap-10 lg:gap-14 items-center' : ''}>
        <div className="min-w-0">
          {eyebrow && (
            <p className="rise mb-5">
              <span className="pg-eyebrow"><i className="w-2 h-2 rounded-full bg-[var(--acc)] inline-block"></i>{eyebrow}</span>
            </p>
          )}
          <h1 className="rise fd font-extrabold leading-[1.08] text-[clamp(2.25rem,5vw,3.5rem)] max-w-3xl" style={{ animationDelay: '.08s' }}>
            {title}
          </h1>
          {desc && (
            <p className="rise text-base sm:text-lg leading-relaxed max-w-xl mt-5" style={{ animationDelay: '.16s' }}>
              {desc}
            </p>
          )}
          {children}
        </div>
        {aside}
      </div>
    </div>
  </section>
);

export const SectionHead = ({ eyebrow, title, Icon, aside }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-8 sm:mb-10">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-4">
          <span className="pg-eyebrow">{Icon && <Icon className="w-4 h-4" />}{eyebrow}</span>
        </p>
      )}
      <h2 className="fd text-3xl sm:text-4xl font-extrabold leading-[1.15]">{title}</h2>
      <div className="pg-bar mt-4"></div>
    </div>
    {aside}
  </div>
);

export const PageFooter = ({ id = 'contact', title, description, address, email, phone, socialLinks, copyright }) => {
  const hasContact = address || email || phone;
  return (
    <footer id={id} className="mt-16 sm:mt-24 bg-soft border-t bd-line px-5 sm:px-8 pt-14 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto">
        <h3 className="fd text-3xl sm:text-4xl font-extrabold leading-[1.15] max-w-4xl">{title}</h3>
        {description && <p className="leading-relaxed max-w-xl mt-4">{description}</p>}

        {(hasContact || Array.isArray(socialLinks)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {hasContact && (
              <div className="pg-card p-6 sm:p-7 space-y-4">
                <h4 className="text-sm font-semibold t-acc flex items-center gap-2"><Phone size={15} /> Contact us</h4>
                <div className="space-y-3 text-sm sm:text-base">
                  {address && (
                    <p className="flex items-start gap-3"><MapPin size={16} className="t-acc shrink-0 mt-1" /><span>{address}</span></p>
                  )}
                  {email && (
                    <p className="flex items-center gap-3">
                      <Mail size={16} className="t-acc shrink-0" />
                      <a href={`mailto:${email}`} className="break-all hover:text-[var(--acc)] transition-colors">{email}</a>
                    </p>
                  )}
                  {phone && (
                    <p className="flex items-center gap-3"><Phone size={16} className="t-acc shrink-0" /><span>{phone}</span></p>
                  )}
                </div>
              </div>
            )}

            {Array.isArray(socialLinks) && (
              <div className="pg-card p-6 sm:p-7 space-y-4">
                <h4 className="text-sm font-semibold t-acc flex items-center gap-2"><Globe size={15} /> Follow us</h4>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="pg-btn">{s.platform}</a>
                    ))
                  ) : (
                    <span className="text-sm t-mute">No social links added yet.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 pt-6 border-t bd-line text-sm t-mute">
          {copyright || `© ${new Date().getFullYear()} ${title || 'BRIU Sports Club'}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
};

export const Spinner = ({ label }) => (
  <div className="flex items-center gap-4">
    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0f7a4a] rounded-full animate-spin shrink-0"></div>
    <span className="text-base font-medium t-ink">{label}</span>
  </div>
);

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');

html { scroll-behavior: smooth; }

.pg {
  --bg:#ffffff; --surf:#ffffff; --surf2:#f1f5f9; --soft:#f8fafc;
  --ink:#0f172a; --mute:#64748b; --line:#e2e8f0;
  --acc:#0f7a4a; --acc-dark:#0b5d38; --tint:#ecfdf3;
  font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
  background:var(--bg); color:#475569; -webkit-font-smoothing:antialiased;
}
.pg.pg-soft { background:var(--soft); }
.pg h1,.pg h2,.pg h3,.pg h4,.pg h5 { color:var(--ink); }
.pg h1,.pg h2,.pg h3,.pg h4,.pg h5,.pg p { overflow-wrap:break-word; }
.pg .fd { font-family:'Manrope','Inter',system-ui,sans-serif; letter-spacing:-0.02em; }
.pg .t-ink { color:var(--ink); } .pg .t-mute { color:var(--mute); } .pg .t-acc { color:var(--acc); }
.pg .bg-surf { background:var(--surf); } .pg .bg-surf2 { background:var(--surf2); } .pg .bg-soft { background:var(--soft); }
.pg .bd-line { border-color:var(--line); }
.pg .on-acc, .pg .on-acc h3, .pg .on-acc p { color:#fff; }
.pg img { max-width:100%; }
.pg a:focus-visible,.pg button:focus-visible,.pg input:focus-visible,.pg [role=button]:focus-visible { outline:2px solid var(--acc); outline-offset:2px; }

.pg-hero {
  background: radial-gradient(60% 90% at 92% 0%, #ecfdf3 0%, transparent 70%), linear-gradient(180deg,#f8fafc,#ffffff);
  border-bottom:1px solid var(--line);
}
.pg-card { background:#fff; border:1px solid var(--line); border-radius:1rem; box-shadow:0 1px 2px rgba(15,23,42,.05); }
.pg-card-hover { transition:box-shadow .3s ease, border-color .3s ease, transform .3s ease; }
.pg-card-hover:hover { box-shadow:0 18px 36px -22px rgba(15,23,42,.35); border-color:#cbd5e1; }
.pg-eyebrow { display:inline-flex; align-items:center; gap:.5rem; font-size:.875rem; font-weight:600; color:var(--acc-dark); background:var(--tint); padding:.375rem .875rem; border-radius:999px; }
.pg-badge { display:inline-flex; align-items:center; gap:.375rem; font-size:.75rem; font-weight:600; color:var(--acc-dark); background:var(--tint); padding:.25rem .75rem; border-radius:999px; }
.pg-badge-neutral { color:#475569; background:var(--surf2); }
.pg-badge-rose { color:#be123c; background:#fff1f2; }
.pg-bar { height:.25rem; width:3.5rem; border-radius:999px; background:var(--acc); }
.pg-iconbox { display:inline-grid; place-items:center; width:2.75rem; height:2.75rem; border-radius:.75rem; background:var(--tint); color:var(--acc); flex-shrink:0; }

.pg-btn { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:2.5rem; padding:0 1rem; border-radius:.5rem; border:1px solid #cbd5e1; background:#fff; color:var(--ink); font-size:.875rem; font-weight:600; transition:background .2s,border-color .2s,color .2s; cursor:pointer; }
.pg-btn:hover:not(:disabled) { background:var(--soft); border-color:var(--acc); }
.pg-btn:disabled { opacity:.4; cursor:not-allowed; }
.pg-btn-primary { background:var(--acc); border-color:var(--acc); color:#fff; }
.pg-btn-primary:hover:not(:disabled) { background:var(--acc-dark); border-color:var(--acc-dark); }
.pg-input { width:100%; min-height:2.75rem; padding:.5rem 1rem; border-radius:.5rem; border:1px solid #cbd5e1; background:#fff; color:var(--ink); font-size:.9375rem; outline:none; transition:border-color .2s, box-shadow .2s; }
.pg-input:focus { border-color:var(--acc); box-shadow:0 0 0 3px rgba(15,122,74,.15); }
.pg-input::placeholder { color:#94a3b8; }
.pg-chip { background:var(--surf2); color:#334155; transition:background .2s,color .2s; }
.pg-chip:hover { background:var(--acc); color:#fff; }
.pg-noscroll { scrollbar-width:none; } .pg-noscroll::-webkit-scrollbar { display:none; }
.pg-scroll { scrollbar-width:thin; scrollbar-color:#cbd5e1 transparent; overscroll-behavior:contain; }

.rise { animation:pgRise .6s ease-out both; }
@keyframes pgRise { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
.pg-fade { animation:pgFade .25s ease both; }
@keyframes pgFade { from { opacity:0; } to { opacity:1; } }
.pg-pop { animation:pgPop .35s cubic-bezier(.2,.7,.2,1) both; }
@keyframes pgPop { from { opacity:0; transform:translateY(16px) scale(.98); } to { opacity:1; transform:none; } }
.pg-swap { animation:pgSwap .8s ease both; }
@keyframes pgSwap { from { opacity:0; } to { opacity:1; } }
.pg-progress { width:100%; height:100%; transform-origin:left; animation:pgProg 4s linear both; background:var(--acc); }
@keyframes pgProg { from { transform:scaleX(0); } to { transform:scaleX(1); } }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior:auto; }
  .rise,.pg-fade,.pg-pop,.pg-swap,.pg-progress { animation:none !important; }
}
`;