import { RSVP_ENDPOINT, weddingConfig } from './weddingConfig.js';

export async function submitRsvp(name) {
  if (!RSVP_ENDPOINT) {
    return { mode: 'whatsapp', name };
  }

  const response = await fetch(RSVP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Жооп жөнөтүлгөн жок. Кайра аракет кылып көрүңүз.');
  }

  return { mode: 'api', name };
}

export function getRsvpWhatsAppMessage(name) {
  return `Саламатсызбы! Менин атым ${name}. ${weddingConfig.groom} менен ${weddingConfig.bride}дин үйлөнүү тоюна катышарымды ырастайм.`;
}
