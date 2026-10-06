export const TWO_GIS_URL =
  'https://2gis.kg/bishkek/search/%D0%A0%D0%B5%D1%81%D1%82%D0%BE%D1%80%D0%B0%D0%BD%20%D0%AB%D1%80%D1%8B%D1%81%D0%BA%D1%8B%20%D0%A4%D1%80%D1%83%D0%BD%D0%B7%D0%B5%20160%20%D0%91%D0%B8%D1%88%D0%BA%D0%B5%D0%BA';

export const RSVP_ENDPOINT = '';

export const weddingConfig = {
  groom: 'Орозали',
  bride: 'Айгерим',
  date: {
    iso: '2026-09-19T16:00:00+06:00',
    day: 19,
    month: 'Сентябрь',
    monthGenitive: 'сентябрь',
    year: 2026,
    weekday: 'Ишемби',
    time: '16:00',
    timezone: 'Asia/Bishkek',
  },
  venue: {
    name: '«Ырыскы» рестораны',
    city: 'Бишкек',
    address: 'Фрунзе көч., 160',
    twoGisUrl: TWO_GIS_URL,
  },
  whatsapp: {
    phone: '996550551588',
    displayPhone: '+996 550 551 588',
    questionText:
      'Саламатсызбы! Орозали менен Айгеримдин үйлөнүү тою боюнча суроом бар эле.',
  },
  music: {
    enabled: true,
    src: '/audio/perfect.mp3',
    title: 'Ed Sheeran — Perfect',
    volume: 0.42,
  },
  timeline: [
    { time: '16:00', title: 'Конокторду тосуп алуу', icon: 'glasses' },
    { time: '16:30', title: 'Тойдун башталышы', icon: 'rings' },
    { time: '17:00', title: 'Майрамдык дасторкон', icon: 'dinner' },
    { time: '20:00', title: 'Бий жана куттуктоолор', icon: 'celebration' },
  ],
  texts: {
    invitation:
      'Сиздерди жашообуздагы эң маанилүү жана бактылуу күндөрдүн бири — үй-бүлөбүз түптөлгөн күндүн кубанычын биз менен бөлүшүүгө чын жүрөктөн чакырабыз.',
    invitationClosing: 'Бул кечти сиздер менен бирге өткөрсөк, абдан бактылуу болобуз.',
    dressCode:
      'Биз үчүн эң башкысы — сиздердин келишиңиздер! Бирок кечебиздин түс гаммасын колдоп келсеңиздер, өзгөчө ыраазы болобуз.',
    rsvp:
      'Өзгөчө күнүбүзгө даярдана алышыбыз үчүн катышарыңызды ырастап коюуңузду өтүнөбүз.',
  },
};

export const getWhatsAppUrl = (message) =>
  `https://wa.me/${weddingConfig.whatsapp.phone}?text=${encodeURIComponent(message)}`;
