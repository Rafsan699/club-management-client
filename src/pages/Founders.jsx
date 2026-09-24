import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ArrowUpRight, Mail, Phone, X } from 'lucide-react';

/*
  Palette (shared with Navbar)
  ink    #0e2b22  deep bottle green
  green  #14684e  actions, links
  brass  #b08a4e  single accent (ledger rule, timeline markers, name underline)
  wash   #f7f8f6  page background
  line   #dfe3dd  hairlines
*/

const MILESTONES = [
  { year: '2026', title: 'Club founded', text: 'Official establishment of BRIU Sports Club to promote campus athletics.' },
  { year: '2026', title: 'Founding Panel established', text: 'Core founding committee takes charge of organizational structure and vision.' },
  { year: '2026', title: 'First major activities', text: 'Initiation of departmental sports events and recruitment drives.' },
  { year: 'Future', title: 'Growth & development', text: 'Continuous expansion toward premier inter-university sports participation.' },
];

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14684e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f6]';

const telHref = (phone) => `tel:${String(phone).replace(/[^\d+]/g, '')}`;

const Founders = () => {
  const [founders, setFounders] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/api/founders/list')
      .then(res => {
        setFounders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching founders:", err);
        setError("Failed to load founders.");
        setLoading(false);
      });
  }, []);

  // While a profile is open: Escape closes it and the page behind stays put.
  useEffect(() => {
    if (!selectedFounder) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedFounder(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedFounder]);

  const styles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap');
      .fd-serif { font-family: 'Newsreader', Georgia, 'Times New Roman', serif; }
      @keyframes fd-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      .fd-rise { animation: fd-rise .22s ease-out; }
      @media (prefers-reduced-motion: reduce) { .fd-rise { animation: none; } }
    `}</style>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f6] px-4">
        {styles}
        <div className="text-center" role="status" aria-live="polite">
          <div className="w-10 h-10 border-[3px] border-[#dfe3dd] border-t-[#14684e] rounded-full animate-spin mx-auto motion-reduce:animate-none" />
          <p className="mt-5 text-sm font-medium text-slate-500">Loading founding panel</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f6] px-4">
        {styles}
        <div className="w-full max-w-md bg-white border border-[#dfe3dd] rounded-2xl p-7 sm:p-8 text-center shadow-[0_24px_60px_-30px_rgba(14,43,34,0.35)]" role="alert">
          <span className="block w-10 h-0.5 bg-[#b08a4e] mx-auto mb-5" />
          <h2 className="fd-serif text-2xl font-semibold text-[#0e2b22]">Founders could not be loaded</h2>
          <p className="mt-2 text-sm text-slate-600">{error} Check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className={`${focusRing} mt-6 w-full h-12 rounded-lg bg-[#14684e] hover:bg-[#0f5540] text-white text-sm font-semibold transition-colors`}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f8f6] text-[#0e2b22] font-sans antialiased selection:bg-[#14684e] selection:text-white overflow-x-hidden">
      {styles}

      {/* Hero */}
      <section className="bg-white border-b border-[#dfe3dd] pt-32 sm:pt-36 lg:pt-40 pb-14 sm:pb-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <h1 className="fd-serif text-[40px] sm:text-[56px] lg:text-[64px] leading-[1.06] tracking-tight font-semibold text-[#0e2b22]">
              The Founding Panel of BRIU Sports Club
            </h1>

            <div className="mt-6 sm:mt-8 max-w-[62ch] space-y-4 text-[15px] sm:text-base leading-[1.75] text-slate-600">
              <p>
                Founded in 2026, BRIU Sports Club was established with a vision to foster sportsmanship, leadership, teamwork, and a strong athletic culture within the university community.
              </p>
              <p>
                The Founding Panel represents the dedicated individuals who laid the foundation of the club and shaped its early vision, values, and direction. Their commitment marks the beginning of a journey toward excellence in university sports and a lasting legacy for future generations.
              </p>
            </div>
          </div>

          <dl className="lg:col-span-5 border-t-2 border-[#b08a4e] divide-y divide-[#e6e9e3]">
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-sm text-slate-500">Established</dt>
              <dd className="fd-serif text-[28px] font-semibold text-[#0e2b22] tabular-nums">2026</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-sm text-slate-500">Founding members</dt>
              <dd className="fd-serif text-[28px] font-semibold text-[#0e2b22] tabular-nums">{founders.length}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-sm text-slate-500">Club</dt>
              <dd className="fd-serif text-[28px] font-semibold text-[#0e2b22]">BRIUSC</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Founders */}
      <section className="px-4 sm:px-8 lg:px-16 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10 sm:mb-14">
            <h2 className="fd-serif text-[30px] sm:text-[36px] leading-tight font-semibold text-[#0e2b22]">
              Founding members
            </h2>
            <p className="text-sm text-slate-500 pb-1.5">Tap a portrait to view the full profile</p>
          </div>

          {founders.length === 0 ? (
            <p className="text-slate-600 text-[15px]">No founding members have been added yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {founders.map((founder) => (
                <li key={founder._id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedFounder(founder)}
                    aria-label={`View profile of ${founder.name}`}
                    className={`${focusRing} group block w-full text-left rounded-xl`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#dfe3dd] bg-[#e9ede7]">
                      {founder.img ? (
                        <img
                          src={founder.img}
                          alt={founder.name}
                          loading="lazy"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <span className="fd-serif absolute inset-0 flex items-center justify-center text-7xl font-semibold text-[#14684e]/40">
                          {founder.name ? founder.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                      <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 h-9 pl-3.5 pr-3 rounded-full bg-white/95 text-[13px] font-semibold text-[#0e2b22] shadow-sm">
                        View profile
                        <ArrowUpRight className="w-4 h-4 text-[#14684e]" />
                      </span>
                    </div>

                    <h3 className="fd-serif mt-5 text-[26px] leading-snug font-semibold text-[#0e2b22] break-words underline decoration-transparent decoration-2 underline-offset-[6px] group-hover:decoration-[#b08a4e] transition-colors">
                      {founder.name}
                    </h3>
                  </button>

                  {(founder.dept || founder.batch) && (
                    <dl className="mt-4 border-t border-[#dfe3dd] divide-y divide-[#e6e9e3] text-[14px]">
                      {founder.dept && (
                        <div className="flex items-baseline justify-between gap-4 py-2.5">
                          <dt className="text-slate-500">Department</dt>
                          <dd className="font-medium text-[#0e2b22] text-right">{founder.dept}</dd>
                        </div>
                      )}
                      {founder.batch && (
                        <div className="flex items-baseline justify-between gap-4 py-2.5">
                          <dt className="text-slate-500">Batch</dt>
                          <dd className="font-medium text-[#0e2b22] text-right">{founder.batch}</dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {(founder.email || founder.phone) && (
                    <div className="mt-2 space-y-1">
                      {founder.email && (
                        <a
                          href={`mailto:${founder.email}`}
                          className={`${focusRing} flex items-start gap-2.5 py-1.5 text-[14px] font-medium text-[#14684e] hover:text-[#0f5540] rounded`}
                        >
                          <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="break-all">{founder.email}</span>
                        </a>
                      )}
                      {founder.phone && (
                        <a
                          href={telHref(founder.phone)}
                          className={`${focusRing} flex items-start gap-2.5 py-1.5 text-[14px] font-medium text-[#0e2b22] hover:text-[#14684e] rounded`}
                        >
                          <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#14684e]" />
                          <span className="break-all">{founder.phone}</span>
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Founding legacy — a real sequence, so it is drawn as a timeline */}
      <section className="bg-white border-t border-[#dfe3dd] px-4 sm:px-8 lg:px-16 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="fd-serif text-[30px] sm:text-[36px] leading-tight font-semibold text-[#0e2b22]">
            Our founding legacy
          </h2>
          <p className="mt-3 text-[15px] text-slate-600 max-w-[52ch]">
            Milestones that shaped the foundation of BRIU Sports Club.
          </p>

          <ol className="mt-12 grid grid-cols-1 lg:grid-cols-4 lg:gap-8 border-l lg:border-l-0 lg:border-t border-[#dfe3dd] ml-1.5 lg:ml-0">
            {MILESTONES.map((m, i) => (
              <li key={i} className="relative pl-8 pb-10 last:pb-0 lg:pl-0 lg:pt-8 lg:pb-0">
                <span
                  className="absolute left-0 top-1.5 -translate-x-1/2 lg:translate-x-0 lg:top-0 lg:-translate-y-1/2 w-3 h-3 rounded-full bg-[#b08a4e] ring-4 ring-white"
                  aria-hidden="true"
                />
                <p className="fd-serif text-[22px] font-semibold text-[#14684e]">{m.year}</p>
                <h3 className="mt-1 text-[16px] font-semibold text-[#0e2b22]">{m.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-600 max-w-[36ch]">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Profile: bottom sheet on phones, centered dialog on larger screens */}
      {selectedFounder && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[#0e2b22]/55 sm:p-6"
          onClick={() => setSelectedFounder(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedFounder.name} profile`}
            onClick={(e) => e.stopPropagation()}
            className="fd-rise relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto overscroll-contain bg-white rounded-t-2xl sm:rounded-2xl shadow-[0_30px_80px_-20px_rgba(14,43,34,0.6)]"
          >
            <div className="relative aspect-[4/3] sm:aspect-[5/4] bg-[#e9ede7]">
              {selectedFounder.img ? (
                <img
                  src={selectedFounder.img}
                  alt={selectedFounder.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <span className="fd-serif absolute inset-0 flex items-center justify-center text-8xl font-semibold text-[#14684e]/40">
                  {selectedFounder.name ? selectedFounder.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
              <button
                onClick={() => setSelectedFounder(null)}
                aria-label="Close profile"
                className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/95 text-[#0e2b22] hover:bg-white flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14684e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 sm:px-7 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <h3 className="fd-serif text-[30px] leading-tight font-semibold text-[#0e2b22] break-words">
                {selectedFounder.name}
              </h3>
              <span className="block w-10 h-0.5 bg-[#b08a4e] mt-3" />

              <dl className="mt-5 divide-y divide-[#e6e9e3] border-y border-[#e6e9e3] text-[14px]">
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-slate-500">Department</dt>
                  <dd className="font-medium text-[#0e2b22] text-right">{selectedFounder.dept || 'N/A'}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-slate-500">Batch</dt>
                  <dd className="font-medium text-[#0e2b22] text-right">{selectedFounder.batch || 'N/A'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 py-3">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium sm:text-right break-all">
                    {selectedFounder.email ? (
                      <a href={`mailto:${selectedFounder.email}`} className="text-[#14684e] hover:text-[#0f5540] underline underline-offset-4 decoration-[#14684e]/30">
                        {selectedFounder.email}
                      </a>
                    ) : 'N/A'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="font-medium text-right">
                    {selectedFounder.phone ? (
                      <a href={telHref(selectedFounder.phone)} className="text-[#0e2b22] hover:text-[#14684e]">
                        {selectedFounder.phone}
                      </a>
                    ) : 'N/A'}
                  </dd>
                </div>
              </dl>

              <button
                onClick={() => setSelectedFounder(null)}
                className="mt-6 w-full h-12 rounded-lg bg-[#0e2b22] hover:bg-[#153a2f] text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14684e] focus-visible:ring-offset-2"
              >
                Close profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Founders;