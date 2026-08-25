import { META_GRAPH_EVENTS_URL, buildLeadEventPayload } from '../lib/capi.mjs';

// Recoit, cote serveur, la confirmation d'un depot de facture (Tally
// onSubmit, voir b2b.html/b2c.html) et la retransmet a la Conversions API
// Meta. Ne fait rien sans META_CAPI_ACCESS_TOKEN : tant que ce secret n'est
// pas configure dans Vercel (Project Settings -> Environment Variables),
// l'endpoint repond 204 sans appeler Meta plutot que d'echouer bruyamment.
//
// RGPD : appele uniquement si l'utilisateur a accepte le bandeau cookies
// (verifie cote client dans b2b.html/b2c.html avant l'appel) — cet endpoint
// fait confiance a l'appelant plutot que de relire le cookie de consentement,
// qui n'est pas transmis par le client volontairement.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(204).end();
    return;
  }

  const { eventId, eventSourceUrl, email, phone, fbp, fbc } = req.body || {};
  if (!eventId || !eventSourceUrl) {
    res.status(400).json({ error: 'eventId et eventSourceUrl sont requis' });
    return;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIpAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : (forwardedFor || '').split(',')[0].trim() || undefined;

  const payload = buildLeadEventPayload({
    eventId,
    eventSourceUrl,
    eventTime: Math.floor(Date.now() / 1000),
    email,
    phone,
    fbp,
    fbc,
    clientIpAddress,
    clientUserAgent: req.headers['user-agent'],
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE
  });

  try {
    const metaResponse = await fetch(`${META_GRAPH_EVENTS_URL}?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!metaResponse.ok) {
      const body = await metaResponse.text();
      console.error('Meta CAPI a refuse l\'event', metaResponse.status, body);
    }
  } catch (err) {
    console.error('Meta CAPI injoignable', err);
  }

  // Reponse envoyee que Meta ait accepte l'event ou non : un rejet cote Meta
  // (token expire, format invalide) ne doit jamais faire echouer le depot
  // de facture pour le visiteur.
  res.status(204).end();
}
