import { createHash } from 'node:crypto';

// Meme pixel que src/analytics.js — public par nature, pas un secret.
export const META_PIXEL_ID = '1381584920727587';

export const META_GRAPH_EVENTS_URL = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`;

/**
 * Hache une valeur au format attendu par Meta pour l'Advanced Matching :
 * SHA-256 de la valeur normalisee (minuscules, espaces superflus retires).
 * Renvoie null si la valeur est vide, pour ne jamais envoyer un hash de
 * chaine vide (que Meta rejette).
 */
export function hashForMeta(value) {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) return null;
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Normalise un numero de telephone avant hachage : chiffres uniquement,
 * conformement au format attendu par Meta (E.164 sans le "+").
 */
export function normalizePhoneForMeta(value) {
  return (value || '').replace(/[^0-9]/g, '');
}

/**
 * Construit le corps de la requete POST /events de la Conversions API pour
 * un event "Lead" (depot de facture via le formulaire Tally). Pure — aucun
 * appel reseau ici, pour rester testable sous `node --test`.
 */
export function buildLeadEventPayload({
  eventId,
  eventSourceUrl,
  eventTime,
  email,
  phone,
  fbp,
  fbc,
  clientIpAddress,
  clientUserAgent,
  testEventCode
}) {
  const userData = {};
  const emailHash = hashForMeta(email);
  if (emailHash) userData.em = [emailHash];
  const phoneHash = hashForMeta(normalizePhoneForMeta(phone));
  if (phoneHash) userData.ph = [phoneHash];
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (clientIpAddress) userData.client_ip_address = clientIpAddress;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: userData
      }
    ]
  };

  if (testEventCode) payload.test_event_code = testEventCode;

  return payload;
}
