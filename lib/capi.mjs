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

/* ════════════════════════════════════════
   VALIDATION DE /api/capi-lead

   L'endpoint est public : sans garde-fou, n'importe quel script peut envoyer
   de faux "Lead" a Meta et fausser l'optimisation des campagnes. On n'accepte
   donc que les appels venant des pages du site, avec des champs au format
   attendu.

   Limite assumee : l'en-tete Origin se forge depuis un script hors
   navigateur (curl). Ce controle bloque les appels depuis d'autres sites et
   les robots naifs ; la parade complete est un webhook Tally signe, cote
   serveur, plus une limite de debit dans le Vercel Firewall.
   ════════════════════════════════════════ */
export const ALLOWED_ORIGINS = ['https://cabinetms.fr', 'https://www.cabinetms.fr'];

// randomUUID(), ou le repli `Date.now() + '-' + Math.random()` des pages.
const EVENT_ID_PATTERN = /^[A-Za-z0-9.-]{8,64}$/;
const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9+().\s-]{6,32}$/;
// Cookies Meta : fb.<sous-domaine>.<horodatage>.<identifiant>
const FB_COOKIE_PATTERN = /^fb\.[0-9]\.[0-9]{10,16}\.[A-Za-z0-9_.-]{1,500}$/;
const MAX_URL_LENGTH = 2048;

function matchOrNull(value, pattern) {
  return typeof value === 'string' && pattern.test(value) ? value : null;
}

/**
 * Valide un appel a /api/capi-lead. Pure, pour rester testable sous
 * `node --test`. Renvoie { ok: true, value } ou { ok: false, status, error }.
 * Les champs obligatoires invalides font rejeter la requete ; les champs
 * optionnels invalides sont simplement ecartes (null), pour ne jamais perdre
 * un vrai lead a cause d'une saisie inhabituelle.
 */
export function validateLeadRequest({ origin, body }) {
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return { ok: false, status: 403, error: 'origine non autorisee' };
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, status: 400, error: 'corps JSON attendu' };
  }

  const { eventId, eventSourceUrl, email, phone, fbp, fbc } = body;

  if (!matchOrNull(eventId, EVENT_ID_PATTERN)) {
    return { ok: false, status: 400, error: 'eventId invalide' };
  }

  let sourceUrl = null;
  if (typeof eventSourceUrl === 'string' && eventSourceUrl.length <= MAX_URL_LENGTH) {
    try {
      sourceUrl = new URL(eventSourceUrl);
    } catch {
      sourceUrl = null;
    }
  }
  if (!sourceUrl || !ALLOWED_ORIGINS.includes(sourceUrl.origin)) {
    return { ok: false, status: 400, error: 'eventSourceUrl invalide' };
  }

  return {
    ok: true,
    value: {
      eventId,
      eventSourceUrl,
      email: matchOrNull(email, EMAIL_PATTERN),
      phone: matchOrNull(phone, PHONE_PATTERN),
      fbp: matchOrNull(fbp, FB_COOKIE_PATTERN),
      fbc: matchOrNull(fbc, FB_COOKIE_PATTERN)
    }
  };
}
