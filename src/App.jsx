import { useEffect, useMemo, useRef, useState } from 'react';
import { getRsvpWhatsAppMessage, submitRsvp } from './rsvp.js';
import { getWhatsAppUrl, RSVP_ENDPOINT, weddingConfig } from './weddingConfig.js';

const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);
const palette = ['#6f0b1a', '#a95063', '#c9979e', '#a99a8c', '#8a9270', '#4f253b'];

function useCountdown() {
  const getTimeLeft = () => {
    const difference = Math.max(new Date(weddingConfig.date.iso).getTime() - Date.now(), 0);
    return {
      total: difference,
      days: Math.floor(difference / 86400000),
      hours: Math.floor(difference / 3600000) % 24,
      minutes: Math.floor(difference / 60000) % 60,
      seconds: Math.floor(difference / 1000) % 60,
    };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return timeLeft;
}

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function App() {
  const [introState, setIntroState] = useState('closed');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicUnavailable, setIsMusicUnavailable] = useState(false);
  const heroRef = useRef(null);
  const audioRef = useRef(null);
  const introStartedRef = useRef(false);
  const introTimerRef = useRef(null);

  useReveal();

  const openInvitation = () => {
    if (introStartedRef.current || introState !== 'closed') return;
    introStartedRef.current = true;
    const audio = audioRef.current;
    if (audio && weddingConfig.music.enabled) {
      audio.volume = weddingConfig.music.volume;
      if (!audio.src) {
        audio.src = weddingConfig.music.src;
        audio.load();
      }
      audio.play().catch(() => setIsMusicPlaying(false));
    }
    setIntroState('opening');
    document.body.classList.add('scroll-locked');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    introTimerRef.current = window.setTimeout(() => {
      setIntroState('opened');
      document.body.classList.remove('scroll-locked');
      heroRef.current?.focus({ preventScroll: true });
    }, reducedMotion ? 220 : 2200);
  };

  useEffect(() => {
    document.body.classList.add('scroll-locked');
    return () => {
      document.body.classList.remove('scroll-locked');
      if (introTimerRef.current) window.clearTimeout(introTimerRef.current);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setIsMusicPlaying(false));
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        loop
        playsInline
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
        onError={() => setIsMusicUnavailable(true)}
      />
      {introState !== 'opened' && <EnvelopeIntro state={introState} onOpen={openInvitation} />}
      <main className={`invitation-page ${introState === 'opened' ? 'is-opened' : ''}`}>
        <div className="invitation-shell">
          <HeroSection heroRef={heroRef} />
          <GuestMessageSection />
          <CalendarSection />
          <FloralDivider />
          <DressCodeSection />
          <FloralDivider mirrored />
          <TimelineSection />
          <LocationSection />
          <CountdownSection />
          <ContactSection />
          <RSVPSection />
          <FinalSection />
        </div>
      </main>
      {introState === 'opened' && weddingConfig.music.enabled && !isMusicUnavailable && (
        <button
          className={`music-control ${isMusicPlaying ? 'is-playing' : ''}`}
          type="button"
          onClick={toggleMusic}
          aria-label={isMusicPlaying ? `${weddingConfig.music.title}: музыканы тынытуу` : `${weddingConfig.music.title}: музыканы күйгүзүү`}
          aria-pressed={isMusicPlaying}
          title={isMusicPlaying ? `${weddingConfig.music.title} — тынытуу` : `${weddingConfig.music.title} чыгармасын күйгүзүү`}
        >
          <MusicIcon isPlaying={isMusicPlaying} />
        </button>
      )}
    </>
  );
}

function EnvelopeIntro({ state, onOpen }) {
  return (
    <div className={`envelope-intro ${state === 'opening' ? 'is-opening' : ''}`}>
      <div className="envelope-scene">
        <div className="envelope-card" aria-hidden="true"><span>Орозали</span><i>&</i><span>Айгерим</span></div>
        <div className="envelope-back" aria-hidden="true" />
        <div className="envelope-paper envelope-paper--left" aria-hidden="true" />
        <div className="envelope-paper envelope-paper--right" aria-hidden="true" />
        <div className="envelope-paper envelope-paper--bottom" aria-hidden="true" />
        <div className="envelope-flap" aria-hidden="true" />
        <svg className="envelope-seams" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="envelope-seam envelope-seam--flap" d="M1 1L50 52L99 1" />
          <path className="envelope-seam envelope-seam--pocket" d="M1 99L50 48L99 99" />
        </svg>
        <button
          className="wax-seal wax-seal--button"
          type="button"
          aria-label="Чакырууну ачуу"
          onClick={onOpen}
          disabled={state !== 'closed'}
        ><span>О & А</span></button>
      </div>
      <p className="open-hint">Ачуу үчүн мөөрдү басыңыз</p>
    </div>
  );
}

function HeroSection({ heroRef }) {
  return (
    <section className="hero-section" aria-label="Үйлөнүү тоюна чакыруу" tabIndex="-1" ref={heroRef}>
      <img className="hero-flower hero-flower--left" src="/assets/floral-corner.webp" width="1024" height="1536" alt="" aria-hidden="true" />
      <img className="hero-flower hero-flower--right" src="/assets/floral-hanging.webp" width="1024" height="1536" alt="" aria-hidden="true" />
      <div className="hero-plaque" aria-hidden="true">
        <svg viewBox="0 0 400 610" preserveAspectRatio="none"><path d="M92 20C92 10 104 4 116 9C141 18 166 5 200 5C234 5 259 18 284 9C296 4 308 10 308 20C308 45 320 57 343 59C356 60 362 74 355 85C345 102 348 124 368 137C381 146 381 165 368 174C350 187 350 213 369 226C382 235 382 254 369 263C350 276 350 302 369 315C382 324 382 343 369 352C350 365 350 391 369 404C382 413 382 432 369 441C350 454 348 481 366 495C378 505 376 524 362 531C335 545 318 563 309 590C306 601 294 607 284 601C258 586 232 604 200 604C168 604 142 586 116 601C106 607 94 601 91 590C82 563 65 545 38 531C24 524 22 505 34 495C52 481 50 454 31 441C18 432 18 413 31 404C50 391 50 365 31 352C18 343 18 324 31 315C50 302 50 276 31 263C18 254 18 235 31 226C50 213 50 187 32 174C19 165 19 146 32 137C52 124 55 102 45 85C38 74 44 60 57 59C80 57 92 45 92 20Z" /></svg>
      </div>
      <div className="hero-copy">
        <p className="hero-kicker">Тойго чакыруу</p>
        <h1><span>{weddingConfig.groom}</span><i>&</i><span>{weddingConfig.bride}</span></h1>
        <div className="hero-date"><span>{weddingConfig.date.weekday}</span><b>{weddingConfig.date.day}</b><span>{weddingConfig.date.monthGenitive}</span></div>
        <p className="hero-year">{weddingConfig.date.year}</p>
      </div>
      <div className="scroll-cue" aria-hidden="true"><span>Төмөн сүрүңүз</span><i /><i /><i /></div>
    </section>
  );
}

function GuestMessageSection() {
  return (
    <section className="story-section guest-section paper-section">
      <img className="hanging-flower" src="/assets/floral-hanging.webp" width="1024" height="1536" loading="lazy" alt="" aria-hidden="true" />
      <div className="ornamental-frame reveal-stagger" data-reveal="right">
        <p className="script-title">Урматтуу коноктор!</p>
        <p>{weddingConfig.texts.invitation}</p>
        <p>{weddingConfig.texts.invitationClosing}</p>
      </div>
    </section>
  );
}

function CalendarSection() {
  const emptyCells = useMemo(() => Array.from({ length: 1 }), []);
  return (
    <section className="story-section calendar-section paper-section" aria-labelledby="calendar-heading">
      <img className="section-flower section-flower--calendar" src="/assets/floral-corner.webp" width="1024" height="1536" loading="lazy" alt="" aria-hidden="true" />
      <div className="section-frame calendar-frame reveal-stagger" data-reveal="left">
        <p className="script-title" id="calendar-heading">Сентябрь</p>
        <div className="calendar" aria-label="2026-жылдын сентябрь айынын календары">
          {['Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш', 'Жк'].map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}
          {emptyCells.map((_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
          {calendarDays.map((day) => (
            <span className={`calendar-day ${day === 19 ? 'is-wedding-day' : ''}`} key={day}>
              {day === 19 && <HeartShape className="calendar-heart" />}<b>{day}</b>
            </span>
          ))}
        </div>
        <p className="calendar-date">2026-жылдын 19-сентябры</p>
        <p className="save-date">Бул күндү биз үчүн сактап коюңуздар <HeartOutline /></p>
      </div>
    </section>
  );
}

function DressCodeSection() {
  return (
    <section className="story-section dress-section paper-section" aria-labelledby="dress-heading">
      <img className="dress-flower" src="/assets/floral-corner.webp" width="1024" height="1536" loading="lazy" alt="" aria-hidden="true" />
      <div className="dress-content section-frame dress-frame reveal-stagger" data-reveal="right">
        <p className="script-title" id="dress-heading">Кийим үлгүсү</p>
        <p className="section-copy">{weddingConfig.texts.dressCode}</p>
        <FashionIllustration />
        <div className="palette" aria-label="Кеченин түс палитрасы">{palette.map((color) => <span key={color} style={{ '--swatch': color }} />)}</div>
      </div>
    </section>
  );
}

function TimelineSection() {
  const sectionRef = useRef(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const heartRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const heart = heartRef.current;
    if (!section || !svg || !path || !heart) return undefined;

    const totalLength = path.getTotalLength();
    path.style.strokeDasharray = `${totalLength}`;
    let frame = 0;
    const update = () => {
      frame = 0;
      const sectionRect = section.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const progress = Math.min(Math.max((window.innerHeight / 2 - sectionRect.top) / sectionRect.height, 0), 1);
      const point = path.getPointAtLength(totalLength * progress);
      const x = (point.x / 400) * svgRect.width;
      const y = (point.y / 1600) * svgRect.height;
      heart.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      path.style.strokeDashoffset = `${totalLength * (1 - progress)}`;
    };
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="timeline-section paper-section" aria-labelledby="timeline-heading">
      <div className="section-heading reveal-stagger" data-reveal="left"><p className="section-overline">19-сентябрь</p><p className="script-title" id="timeline-heading">Той программасы</p></div>
      <div className="timeline-track" ref={sectionRef}>
        <svg className="timeline-path" ref={svgRef} viewBox="0 0 400 1600" preserveAspectRatio="none" aria-hidden="true">
          <path className="timeline-path-base" d="M200 35 C335 150 335 300 200 390 C65 480 65 620 200 710 C335 800 335 945 200 1035 C65 1125 65 1300 200 1560" />
          <path ref={pathRef} d="M200 35 C335 150 335 300 200 390 C65 480 65 620 200 710 C335 800 335 945 200 1035 C65 1125 65 1300 200 1560" />
        </svg>
        <span className="moving-heart" ref={heartRef} aria-hidden="true"><HeartShape /></span>
        <div className="timeline-events">{weddingConfig.timeline.map((event, index) => (
          <article className={`timeline-event timeline-event--${index + 1}`} data-reveal={index % 2 === 0 ? 'left' : 'right'} key={event.time}><TimelineIcon name={event.icon} /><time>{event.time}</time><h3>{event.title}</h3></article>
        ))}</div>
      </div>
    </section>
  );
}

function LocationSection() {
  return (
    <section className="story-section location-section paper-section" aria-labelledby="location-heading">
      <img className="section-flower section-flower--location" src="/assets/floral-hanging.webp" width="1024" height="1536" loading="lazy" alt="" aria-hidden="true" />
      <div className="section-frame location-frame reveal-stagger" data-reveal="right">
      <LocationPin /><p className="script-title" id="location-heading">Той өтүүчү жер</p><p className="venue-label">Ресторан</p><h2>«Ырыскы»</h2>
      <p className="venue-address">{weddingConfig.venue.city} ш.<br />{weddingConfig.venue.address}</p>
      <a className="primary-link" href={weddingConfig.venue.twoGisUrl} target="_blank" rel="noopener noreferrer">2GIS'тен ачуу</a>
      </div>
    </section>
  );
}

function CountdownSection() {
  const timeLeft = useCountdown();
  return (
    <section className="countdown-section paper-section" aria-labelledby="countdown-heading"><LaceDivider /><div className="countdown-content reveal-stagger" data-reveal="left">
      <p className="script-title" id="countdown-heading">Тойго чейин калды:</p>
      {timeLeft.total > 0 ? <div className="countdown-grid" aria-live="polite"><Counter value={timeLeft.days} label="Күн" /><Counter value={timeLeft.hours} label="Саат" /><Counter value={timeLeft.minutes} label="Мүнөт" /><Counter value={timeLeft.seconds} label="Секунд" /></div> : <p className="wedding-day-message">Бүгүн биздин өзгөчө күнүбүз!</p>}
    </div><LaceDivider /></section>
  );
}

function ContactSection() {
  const questionUrl = getWhatsAppUrl(weddingConfig.whatsapp.questionText);
  return (
    <section className="story-section contact-section paper-section" aria-labelledby="contact-heading">
      <img className="section-flower section-flower--contact" src="/assets/floral-corner.webp" width="1024" height="1536" loading="lazy" alt="" aria-hidden="true" />
      <div className="section-frame contact-frame reveal-stagger" data-reveal="right">
      <p className="script-title" id="contact-heading">Суроолоруңуз барбы?</p><p className="section-copy">Эгер суроолоруңуз болсо,<br />бизге жазыңыздар — кубануу менен жооп беребиз.</p>
      <a className="whatsapp-link" href={questionUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp аркылуу бизге жазуу"><WhatsAppIcon /><span>{weddingConfig.whatsapp.displayPhone}</span></a>
      </div>
    </section>
  );
}

function RSVPSection() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setStatus('error');
      setMessage('Сураныч, атыңызды жазыңыз — кеминде эки тамга болушу керек.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const result = await submitRsvp(trimmedName);
      setName(trimmedName);
      setStatus(result.mode === 'api' ? 'success' : 'fallback');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Жооп жөнөтүлгөн жок.');
    }
  };

  const whatsappUrl = getWhatsAppUrl(getRsvpWhatsAppMessage(name));
  return (
    <section className="story-section rsvp-section paper-section" aria-labelledby="rsvp-heading">
      <img className="rsvp-flower" src="/assets/floral-corner.webp" width="1024" height="1536" loading="lazy" alt="" aria-hidden="true" />
      <div className="rsvp-content section-frame rsvp-frame reveal-stagger" data-reveal="left"><p className="script-title" id="rsvp-heading">Анкета</p><p className="section-copy">{weddingConfig.texts.rsvp}</p>
        {status !== 'success' && status !== 'fallback' && <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="guest-name">Сиздин атыңыз</label><input id="guest-name" name="name" type="text" value={name} onChange={(event) => { setName(event.target.value); if (status === 'error') setStatus('idle'); }} placeholder="Атыңызды жазыңыз" maxLength="100" autoComplete="name" aria-describedby={status === 'error' ? 'rsvp-error' : undefined} aria-invalid={status === 'error'} />
          {status === 'error' && <p className="form-message is-error" id="rsvp-error">{message}</p>}<button className="primary-button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Жөнөтүлүүдө…' : 'Катышууну ырастоо'}</button>
        </form>}
        {status === 'success' && <p className="rsvp-success">Рахмат, {name}! Бул күндү сиз менен бирге өткөрүүгө кубанычтабыз. <HeartOutline /></p>}
        {status === 'fallback' && <div className="rsvp-success"><p>Рахмат, {name}! Эми ырастоону жөнөтүү гана калды.</p><a className="primary-link" href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp аркылуу жөнөтүү</a></div>}
        {!RSVP_ENDPOINT && status === 'idle' && <p className="form-note">Ырастоо WhatsApp аркылуу жөнөтүлөт.</p>}
      </div>
    </section>
  );
}

function FinalSection() {
  return (
    <section className="final-section paper-section" aria-label="Жыйынтыктоочу кайрылуу"><img className="final-flower" src="/assets/floral-hanging.webp" width="1024" height="1536" loading="lazy" alt="" aria-hidden="true" />
      <div className="final-copy reveal-stagger" data-reveal="right"><p className="final-respect">Урматтоо менен,</p><p className="final-names">{weddingConfig.groom}<i>&</i>{weddingConfig.bride}</p><div className="wax-heart" aria-hidden="true"><HeartShape /></div><p className="final-wait">Сиздерди күтөбүз!</p><time dateTime="2026-09-19">19.09.2026</time></div>
    </section>
  );
}

function Counter({ value, label }) {
  return <div className="counter"><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>;
}

function HeartShape({ className = '' }) {
  return <svg className={className} viewBox="0 0 64 58" aria-hidden="true"><path d="M32 55C26 48 5 35 3 20C1 7 17-1 27 8L32 13L37 8C47-1 63 7 61 20C59 35 38 48 32 55Z" /><path className="heart-highlight" d="M12 17C13 11 19 9 23 12" /></svg>;
}

function HeartOutline() {
  return <svg className="inline-heart" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20C9 17 1 12 2 6C3 1 9 1 12 5C15 1 21 1 22 6C23 12 15 17 12 20Z" /></svg>;
}

function FashionIllustration() {
  return <svg className="fashion-illustration" viewBox="0 0 360 190" aria-hidden="true"><g className="fashion-line"><circle cx="83" cy="26" r="11" /><path d="M83 38C66 53 66 76 65 96L39 174H127L101 96C99 75 100 54 83 38Z" /><path d="M66 61L43 101M100 61L123 101" /><circle cx="180" cy="25" r="11" /><path d="M180 37L151 64L162 105L148 174H212L198 105L209 64Z" /><path d="M151 64L129 105M209 64L231 105" /><circle cx="277" cy="26" r="11" /><path d="M277 38C257 51 255 78 257 101L239 174H315L297 101C299 78 297 51 277 38Z" /><path d="M257 64L239 105M297 64L315 105" /></g><path className="fashion-fill fashion-fill--one" d="M83 48C71 61 72 82 72 98L51 166H115L94 98C94 82 95 61 83 48Z" /><path className="fashion-fill fashion-fill--two" d="M180 46L159 68L169 105L158 166H202L191 105L201 68Z" /><path className="fashion-fill fashion-fill--three" d="M277 48C264 61 264 81 265 101L250 166H304L289 101C290 81 290 61 277 48Z" /></svg>;
}

function TimelineIcon({ name }) {
  const common = { className: 'timeline-icon', viewBox: '0 0 80 70', 'aria-hidden': true };
  if (name === 'rings') return <svg {...common}><ellipse cx="32" cy="37" rx="19" ry="13" /><ellipse cx="49" cy="37" rx="19" ry="13" /><path d="M23 20L32 10L41 20M28 15H36" /></svg>;
  if (name === 'dinner') return <svg {...common}><circle cx="40" cy="37" r="23" /><circle cx="40" cy="37" r="14" /><path d="M9 12V61M4 12V31C4 37 14 37 14 31V12M67 12V61M62 12C62 28 72 28 72 12" /></svg>;
  if (name === 'celebration') return <svg {...common}><path d="M27 12V48C27 57 15 60 11 53C8 47 14 41 27 44M27 20L57 13V41C57 50 45 53 41 46C38 40 44 34 57 37M27 29L57 22" /><path d="M66 15L70 10M67 25H74M12 21L7 16" /></svg>;
  return <svg {...common}><path d="M11 9H36L32 31C31 39 17 39 16 31L11 9ZM44 9H69L64 31C63 39 49 39 48 31L44 9ZM24 38V57M56 38V57M14 58H34M46 58H66" /><path d="M14 20H34M47 20H67" /></svg>;
}

function LocationPin() {
  return <svg className="location-pin" viewBox="0 0 64 80" aria-hidden="true"><path d="M32 76C27 67 8 48 8 30C8 16 19 5 32 5C45 5 56 16 56 30C56 48 37 67 32 76Z" /><circle cx="32" cy="30" r="8" /></svg>;
}

function WhatsAppIcon() {
  return <svg className="whatsapp-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="M54 31C54 43 44 53 32 53C28 53 24 52 21 50L10 54L14 43C11 39 10 35 10 31C10 19 20 9 32 9C44 9 54 19 54 31Z" /><path d="M25 20C23 20 20 24 21 27C23 36 30 43 39 44C42 44 45 40 44 38L38 35L35 38C31 36 28 33 26 29L29 26L25 20Z" /></svg>;
}

function MusicIcon({ isPlaying }) {
  return isPlaying ? (
    <svg className="music-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M8 12V20M4 14V18M12 9V23M18 11L25 8V19C25 23 20 24 18 21C17 18 20 16 25 17M18 11V22" />
    </svg>
  ) : (
    <svg className="music-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M10 10V22M6 12V20M14 13V19M20 10L26 8V19C26 23 21 24 19 21C18 18 21 16 26 17M20 10V22" />
      <path className="music-icon-slash" d="M6 5L27 27" />
    </svg>
  );
}

function LaceDivider() {
  return <svg className="lace-divider" viewBox="0 0 600 48" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="lace" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M0 24C8 6 16 6 24 24C32 42 40 42 48 24M0 24C8 42 16 42 24 24C32 6 40 6 48 24" /><circle cx="24" cy="24" r="5" /><circle cx="0" cy="24" r="3" /></pattern></defs><rect width="600" height="48" fill="url(#lace)" /></svg>;
}

function FloralDivider({ mirrored = false }) {
  return (
    <div className={`floral-divider ${mirrored ? 'is-mirrored' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 360 68">
        <path className="floral-divider-line" d="M16 34C88 34 110 25 148 34C166 38 174 38 180 34C186 30 194 30 212 34C250 43 272 34 344 34" />
        <path className="floral-divider-stem" d="M180 34C168 24 167 14 176 8M180 34C192 24 193 14 184 8" />
        <path className="floral-divider-leaf" d="M173 20C159 17 154 23 160 29C166 31 171 27 173 20ZM187 20C201 17 206 23 200 29C194 31 189 27 187 20Z" />
        <path className="floral-divider-flower" d="M180 13C174 8 176 3 180 6C184 3 186 8 180 13Z" />
      </svg>
    </div>
  );
}

export default App;
