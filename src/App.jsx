import React, { useEffect, useMemo, useRef, useState } from 'react';

const weddingDate = new Date('2026-09-19T17:00:00+06:00');
const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);

const heroPhoto =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85';
const finalPhoto =
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=85';

const restaurant = {
  name: 'Ресторан “Ала-Тоо Grand”',
  address: 'г. Бишкек, ул. Аалы Токомбаева 43',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=%D0%A0%D0%B5%D1%81%D1%82%D0%BE%D1%80%D0%B0%D0%BD%20%D0%90%D0%BB%D0%B0-%D0%A2%D0%BE%D0%BE%20Grand%20%D0%90%D0%B0%D0%BB%D1%8B%20%D0%A2%D0%BE%D0%BA%D0%BE%D0%BC%D0%B1%D0%B0%D0%B5%D0%B2%D0%B0%2043%20%D0%91%D0%B8%D1%88%D0%BA%D0%B5%D0%BA',
};

function getCountdown() {
  const diff = Math.max(weddingDate.getTime() - Date.now(), 0);

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getCountdown);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return timeLeft;
}

function App() {
  const [guestName, setGuestName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const audioRef = useRef(null);
  const timeLeft = useCountdown();
  const calendarOffset = useMemo(() => Array.from({ length: 1 }, (_, index) => index), []);

  useEffect(() => {
    const sections = document.querySelectorAll('.section-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.16 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = 0.45;
    audio.play().catch(() => {});
  }, []);

  function submitGuest(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="page">
      <audio ref={audioRef} src="/audio/perfect.mp3" loop autoPlay preload="auto" />

      <section className="hero" aria-label="Свадебное приглашение">
        <img className="hero__image" src={heroPhoto} alt="Свадебная фотография пары" />
        <div className="hero__fallback" aria-hidden="true" />
        <div className="hero__shade" />
        <div className="hero__content">
          <p className="eyebrow">Wedding invitation</p>
          <h1>Орозали & Айгерим</h1>
          <p className="hero__names">Орозали Ильязов · Айгерим Адил кызы</p>
          <p className="hero__date">19 сентября 2026</p>
        </div>
      </section>

      <section className="invitation section-reveal">
        <LemonDecor />
        <p className="script">Урматтуу коноктор!</p>
        <p>
          Сиздерди биздин үйлөнүү үлпөт тоюбузга арналган салтанаттуу кечеге келип,
          ак дасторконубуздан даам татып, баталарыңызды берип кетүүгө чакырабыз.
        </p>
        <div className="couple-names">
          <span>Орозали Ильязов</span>
          <span>Айгерим Адил кызы</span>
        </div>
      </section>

      <section className="calendar-section section-reveal" aria-labelledby="calendar-title">
        <p className="script" id="calendar-title">
          Сентябрь
        </p>
        <p className="section-note">Свадьба состоится в субботу, 19 сентября 2026 года</p>
        <div className="calendar" aria-label="Календарь сентября 2026">
          {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day) => (
            <span className="calendar__weekday" key={day}>
              {day}
            </span>
          ))}
          {calendarOffset.map((item) => (
            <span key={`offset-${item}`} aria-hidden="true" />
          ))}
          {calendarDays.map((day) => (
            <span className={day === 19 ? 'calendar__day is-wedding' : 'calendar__day'} key={day}>
              {day}
            </span>
          ))}
        </div>
      </section>

      <section className="countdown section-reveal" aria-labelledby="countdown-title">
        <p className="script" id="countdown-title">
          До свадьбы
        </p>
        <div className="countdown__grid">
          <Counter value={timeLeft.days} label="дней" />
          <Counter value={timeLeft.hours} label="часов" />
          <Counter value={timeLeft.minutes} label="минут" />
          <Counter value={timeLeft.seconds} label="секунд" />
        </div>
      </section>

      <section className="restaurant section-reveal">
        <DecorDivider />
        <p className="script">Ресторан</p>
        <h2>{restaurant.name}</h2>
        <p>{restaurant.address}</p>
        <a className="map-link" href={restaurant.mapUrl} target="_blank" rel="noreferrer">
          Открыть карту
        </a>
      </section>

      <section className="program section-reveal">
        <p className="script">Программа</p>
        <div className="timeline">
          <div>
            <time>16:00</time>
            <span>Сбор гостей</span>
          </div>
          <div>
            <time>17:00</time>
            <span>Начало торжества</span>
          </div>
          <div>
            <time>22:00</time>
            <span>Торт кесүү аземи</span>
          </div>
        </div>
      </section>

      <section className="rsvp section-reveal">
        <p className="script">Анкета</p>
        <p>Пожалуйста, напишите имя, чтобы мы знали, кто придёт на свадьбу.</p>
        <form onSubmit={submitGuest}>
          <label>
            <span>Ваше имя</span>
            <input
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Например: Азамат"
              required
            />
          </label>
          <button className="submit-button" type="submit">
            Отправить
          </button>
        </form>
        {submitted && <p className="success">Спасибо, {guestName}. Ваш ответ принят.</p>}
      </section>

      <section className="closing section-reveal">
        <img src={finalPhoto} alt="Свадебная фотография" />
        <p className="script">Будем ждать вас</p>
        <p>Ваше присутствие станет для нас большой радостью.</p>
      </section>

      <footer className="footer">
        <span>Орозали & Айгерим</span>
        <small>19.09.2026 · Wedding Invitation</small>
      </footer>
    </main>
  );
}

function Counter({ value, label }) {
  return (
    <div className="counter">
      <span>{String(value).padStart(2, '0')}</span>
      <small>{label}</small>
    </div>
  );
}

function LemonDecor() {
  return (
    <div className="lemon-decor" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function DecorDivider() {
  return (
    <div className="decor-divider" aria-hidden="true">
      <span />
    </div>
  );
}

export default App;
