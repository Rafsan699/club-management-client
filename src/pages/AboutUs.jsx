import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Target, Compass, MapPin, Phone, Mail } from 'lucide-react';

const AboutUs = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await API.get('/api/about');
      if (res.data) {
        setAbout(res.data);
      }
    } catch (err) {
      console.error("Error fetching about data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto slide effect for full-width banners
  useEffect(() => {
    if (about && about.banners && about.banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % about.banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [about]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-medium text-sm transition-colors duration-300 ${darkMode ? 'bg-[#0F141C] text-slate-400' : 'bg-[#F6F4EF] text-slate-500'}`}>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-blue-700 border-t-transparent animate-spin"></div>
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!about) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-medium text-sm px-6 text-center transition-colors duration-300 ${darkMode ? 'bg-[#0F141C] text-rose-400' : 'bg-[#F6F4EF] text-rose-700'}`}>
        Failed to load About Us data.
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');
  let chapterNo = 0;
  const chapter = (label) => (
    <div className="md:sticky md:top-10 self-start flex md:block items-baseline gap-3">
      <span className="ab-serif text-3xl sm:text-4xl ab-acc leading-none">{pad(++chapterNo)}</span>
      <p className="md:mt-3 text-sm font-semibold ab-mute">{label}</p>
    </div>
  );

  const hasBanners = about.banners && about.banners.length > 0;

  return (
    <div className={`ab ${darkMode ? 'dark' : ''} min-h-screen relative antialiased selection:bg-blue-700 selection:text-white transition-colors duration-500`} style={{ overflowX: 'clip' }}>

      <div className="ab-progress" aria-hidden="true"></div>

      {/* ============ HERO ============ */}
      <section>
        <div className="max-w-[1160px] mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20">
          <p className="ab-rise text-sm font-semibold ab-acc flex items-center gap-2.5">
            <i className="w-1.5 h-1.5 bg-current inline-block"></i> Official Club Profile
          </p>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 mt-6 items-end">
            <div className={hasBanners ? 'lg:col-span-6' : 'lg:col-span-9'}>
              <h1 className="ab-rise ab-serif text-[clamp(2.5rem,8.5vw,5.75rem)] font-medium leading-[1.02] break-words" style={{ animationDelay: '.08s' }}>
                {about.title}
              </h1>
              <p className="ab-rise text-lg sm:text-xl ab-mute leading-relaxed max-w-xl mt-6" style={{ animationDelay: '.16s' }}>
                {about.subtitle || about.description}
              </p>
            </div>

            {hasBanners && (
              <figure className="lg:col-span-6 ab-rise" style={{ animationDelay: '.22s' }}>
                <div className="ab-clip relative rounded-md border ab-line ab-surf2 aspect-[4/3]">
                  <img
                    key={`img-${currentBanner}`}
                    src={about.banners[currentBanner]}
                    alt="Club Banner"
                    className="ab-swap absolute inset-0 w-full h-full object-contain object-center"
                  />
                </div>
                {about.banners.length > 1 && (
                  <figcaption className="flex items-center gap-4 mt-3 text-sm ab-mute tabular-nums">
                    <span>{currentBanner + 1} / {about.banners.length}</span>
                    <span className="flex-1 h-px bg-[var(--line)] relative ab-clip">
                      <i key={`bar-${currentBanner}`} className="ab-bar absolute inset-y-0 left-0 bg-[var(--ink)]"></i>
                    </span>
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </div>
      </section>

      {/* ============ OVERVIEW ============ */}
      {about.description && (
        <section className="py-14 sm:py-24">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="ab-rule mb-10 sm:mb-14"></div>
            <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              {chapter('Overview')}
              <div>
                <h3 className="ab-item ab-serif text-xl sm:text-2xl ab-mute">Welcome to {about.title}</h3>
                <p className="ab-fill ab-serif text-[clamp(1.5rem,4vw,2.75rem)] leading-[1.28] mt-5 break-words">
                  {about.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ MISSION & VISION ============ */}
      <section className="py-14 sm:py-24">
        <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
          <div className="ab-rule mb-10 sm:mb-14"></div>
          <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            {chapter('Mission & Vision')}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Mission Panel */}
              <div className="ab-wipe rounded-md p-7 sm:p-10 lg:min-h-[400px] flex flex-col justify-between gap-12 bg-[var(--ink)] text-[color:var(--bg)]" style={{ '--wf': 'inset(0 100% 0 0)' }}>
                <span className="w-11 h-11 rounded-md ab-iconbox grid place-items-center"><Target size={20} /></span>
                <div>
                  <h3 className="ab-serif text-3xl sm:text-4xl font-medium">Our Mission</h3>
                  <p className="text-base sm:text-lg leading-relaxed opacity-80 mt-4 break-words">{about.mission}</p>
                </div>
              </div>

              {/* Vision Panel */}
              <div className="ab-wipe rounded-md p-7 sm:p-10 lg:min-h-[400px] flex flex-col justify-between gap-12 bg-[var(--acc)] text-[color:var(--on-acc)]" style={{ '--wf': 'inset(0 0 0 100%)' }}>
                <span className="w-11 h-11 rounded-md ab-iconbox grid place-items-center"><Compass size={20} /></span>
                <div>
                  <h3 className="ab-serif text-3xl sm:text-4xl font-medium">Our Vision</h3>
                  <p className="text-base sm:text-lg leading-relaxed opacity-90 mt-4 break-words">{about.vision}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NUMBERS ============ */}
      {about.features && about.features.length > 0 && (
        <section className="py-14 sm:py-24">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="ab-rule mb-10 sm:mb-14"></div>
            <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              {chapter('At a glance')}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {about.features.map((feat, index) => (
                  <div key={index} className="ab-item">
                    <h4 className="ab-serif text-[clamp(2.5rem,7vw,4.5rem)] font-medium leading-none break-words">{feat.title}</h4>
                    <div className="h-[3px] w-8 bg-[var(--acc)] mt-4"></div>
                    <p className="text-sm sm:text-base ab-mute mt-3">{feat.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ JOURNEY ============ */}
      {about.detailsSections && about.detailsSections.length > 0 && (
        <section className="py-14 sm:py-24">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="ab-rule mb-10 sm:mb-14"></div>
            <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              {chapter('Milestones')}
              <h2 className="ab-item ab-serif text-[clamp(2.5rem,7vw,4.75rem)] font-medium leading-[1.02]">Our Journey</h2>
            </div>

            <div className="mt-12 sm:mt-16">
              {about.detailsSections.map((sec, idx) => (
                <article key={sec.id || idx} className="pb-12 sm:pb-16">
                  <div className="ab-rule mb-6 sm:mb-8 opacity-40"></div>
                  <div className="grid md:grid-cols-[200px_1fr] gap-3 md:gap-16">
                    <p className="ab-serif text-xl sm:text-2xl font-medium ab-acc md:sticky md:top-10 self-start break-words">{sec.heading}</p>

                    <div className="ab-item max-w-3xl">
                      <h3 className="ab-serif text-2xl sm:text-4xl font-medium leading-tight break-words">
                        {sec.subheading}
                      </h3>
                      <p className="text-base sm:text-lg ab-mute leading-relaxed mt-4 break-words">
                        {sec.text}
                      </p>
                      {sec.imageUrl && (
                        <div className="ab-clip mt-7 rounded-md border ab-line ab-surf2 flex items-center justify-center">
                          <img
                            src={sec.imageUrl}
                            alt="Journey visual"
                            className="ab-img h-56 sm:h-72 md:h-80 w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FOOTER PANEL ============ */}
      <footer className="bg-[var(--foot)] text-[#F1EEE7] mt-10">
        <div className="max-w-[1160px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

            {/* Club Info */}
            <div className="md:col-span-5">
              <h3 className="ab-serif text-3xl sm:text-4xl font-medium leading-tight break-words">
                {about.contact?.companyName || about.title || "Club Info"}
              </h3>
              <p className="text-base leading-relaxed text-white/65 mt-4 max-w-md">
                {about.contact?.shortDescription || about.subtitle || about.description || "Empowering members through sports and physical fitness."}
              </p>
            </div>

            {/* Contact Us Details */}
            <div className="md:col-span-4">
              <h3 className="text-sm font-semibold text-white/55 flex items-center gap-2">
                <Phone size={14} /> Contact Us
              </h3>
              <div className="space-y-4 text-base mt-5">
                <p className="flex items-start gap-3">
                  <MapPin size={18} className="text-white/55 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{about.contact?.address || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail size={18} className="text-white/55 shrink-0" />
                  <span className="break-all">{about.contact?.email || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone size={18} className="text-white/55 shrink-0" />
                  <span>{about.contact?.phone || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Follow Us & Social Links */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-semibold text-white/55">Follow Us</h3>
              <div className="flex flex-wrap gap-2.5 mt-5">
                {about.contact?.socialLinks && about.contact.socialLinks.length > 0 ? (
                  about.contact.socialLinks.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] inline-flex items-center px-4 rounded-md border border-white/25 text-sm hover:bg-[#F1EEE7] hover:text-[#16202E] transition active:scale-95"
                    >
                      {social.platform}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-white/50">No social links added yet.</span>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-white/15 mt-14 pt-6 text-sm text-white/50">
            {about.contact?.copyright || `© ${new Date().getFullYear()} ${about.title || "Club"}. All rights reserved.`}
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400..700&family=Public+Sans:wght@400;500;600&display=swap');

        @property --p { syntax: '<percentage>'; inherits: false; initial-value: 0%; }

        .ab {
          --bg: #F6F4EF; --surf: #FFFFFF; --surf2: #ECE9E1;
          --ink: #16202E; --mute: #5C6472; --line: #D9D5CB;
          --acc: #1F4FBF; --on-acc: #FFFFFF; --foot: #16202E;
          font-family: 'Public Sans', system-ui, sans-serif;
          background: var(--bg); color: var(--ink);
          -webkit-text-size-adjust: 100%;
        }
        .ab.dark {
          --bg: #0F141C; --surf: #171D28; --surf2: #1E2634;
          --ink: #EDEAE3; --mute: #98A1B0; --line: #2A3242;
          --acc: #7EA2FF; --on-acc: #0F141C; --foot: #0A0E14;
        }
        .ab .ab-serif { font-family: 'Newsreader', Georgia, 'Times New Roman', serif; letter-spacing: -0.015em; font-variant-numeric: lining-nums; }
        .ab .ab-surf2 { background: var(--surf2); }
        .ab .ab-line { border-color: var(--line); }
        .ab .ab-mute { color: var(--mute); }
        .ab .ab-acc { color: var(--acc); }
        .ab .ab-iconbox { border: 1px solid color-mix(in srgb, currentColor 40%, transparent); }
        .ab .ab-rule { height: 1px; background: var(--ink); transform-origin: left; }
        .ab h1, .ab h2, .ab h3, .ab h4, .ab p { overflow-wrap: break-word; }
        .ab a:focus-visible { outline: 2px solid var(--acc); outline-offset: 3px; }
        /* overflow:clip (not hidden) so scroll-driven timelines inside still bind to the page scroll */
        .ab .ab-clip { overflow: hidden; overflow: clip; }

        .ab-rise { animation: abRise .8s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes abRise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

        .ab-swap { animation: abSwap .9s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes abSwap { from { opacity: 0; scale: 1.03; } to { opacity: 1; scale: 1; } }

        .ab-bar { width: 100%; animation: abBar 4s linear both; transform-origin: left; }
        @keyframes abBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        .ab-progress { display: none; }

        /* ===== Scroll-driven reveals (progressive enhancement: without support everything is simply visible) ===== */
        @supports (animation-timeline: view()) {
          .ab-progress {
            display: block; position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60;
            background: var(--acc); transform-origin: 0 50%;
            animation: abProg linear both; animation-timeline: scroll(root);
          }
          @keyframes abProg { from { scale: 0 1; } to { scale: 1 1; } }

          /* hairline rules draw across the page */
          .ab-rule { animation: abRule linear both; animation-timeline: view(); animation-range: entry 0% entry 90%; }
          @keyframes abRule { from { scale: 0 1; } to { scale: 1 1; } }

          /* mission / vision panels wipe open from opposite sides */
          .ab-wipe { animation: abWipe linear both; animation-timeline: view(); animation-range: entry 0% entry 75%; }
          @keyframes abWipe { from { clip-path: var(--wf, inset(100% 0 0 0)); } to { clip-path: inset(0 0 0 0); } }

          /* items lift into place */
          .ab-item { animation: abItem linear both; animation-timeline: view(); animation-range: entry 0% entry 55%; }
          @keyframes abItem { from { opacity: 0; translate: 0 32px; } to { opacity: 1; translate: 0 0; } }

          /* overview statement fills with ink as you scroll */
          .ab-fill {
            background: linear-gradient(to bottom, var(--ink) 0 var(--p), color-mix(in srgb, var(--ink) 16%, transparent) var(--p) 100%);
            -webkit-background-clip: text; background-clip: text; color: transparent;
            animation: abFill linear both; animation-timeline: view(); animation-range: entry 30% cover 60%;
          }
          @keyframes abFill { from { --p: 0%; } to { --p: 100%; } }

          .ab-img { animation: abImg linear both; animation-timeline: view(); animation-range: cover 0% cover 65%; }
          @keyframes abImg { from { scale: 1.12; } to { scale: 1; } }
        }

        @media (prefers-reduced-motion: reduce) {
          .ab-rise, .ab-swap, .ab-bar { animation: none !important; }
          .ab-progress, .ab-rule, .ab-wipe, .ab-item, .ab-fill, .ab-img { animation: none !important; }
          .ab-fill { background: none; color: var(--ink); -webkit-background-clip: border-box; background-clip: border-box; }
        }
      `}</style>

    </div>
  );
};

export default AboutUs;