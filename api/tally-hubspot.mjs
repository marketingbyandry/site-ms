import crypto from 'node:crypto';

/* ════════════════════════════════════════
   Pont Tally → HubSpot.

   Tally poste ici chaque soumission du formulaire « Transmettre ma facture ».
   On vérifie la signature, on traduit les champs Tally en propriétés HubSpot,
   puis on pousse le tout dans l'API Forms de HubSpot.

   Pourquoi l'API Forms (api.hsforms.com) et pas l'API CRM (api.hubapi.com) :
   elle est non authentifiée, donc aucun token à stocker ; elle fonctionne sur
   HubSpot Free ; et elle accepte le `hutk`, ce qui permet à HubSpot de
   rattacher l'historique de navigation anonyme au contact créé. L'API CRM
   n'offre ni l'un ni l'autre.

   Variables d'environnement Vercel (Settings → Environment Variables) :
     TALLY_SIGNING_SECRET  — Tally → formulaire → Integrations → Webhooks
     HUBSPOT_PORTAL_ID     — HubSpot → Settings → Account Defaults
     HUBSPOT_FORM_GUID     — GUID du formulaire HubSpot cible
     HUBSPOT_REGION        — « eu1 » si le portail est hébergé dans l'UE (défaut : us)
   ════════════════════════════════════════ */

const CAMPAIGN_TO_HUBSPOT = {
  source: 'ms_source',
  utm_source: 'ms_utm_source',
  utm_medium: 'ms_utm_medium',
  utm_campaign: 'ms_utm_campaign',
  utm_term: 'ms_utm_term',
  utm_content: 'ms_utm_content',
  gclid: 'ms_gclid',
  msclkid: 'ms_msclkid',
  landing_page: 'ms_landing_page',
  referrer: 'ms_referrer',
  page_url: 'ms_page_url',
  variant: 'ms_ab_variant'
};

function normalizeLabel(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/* Tally identifie ses champs par type ET par libellé. On s'appuie d'abord sur
   le type (fiable, indépendant du wording du formulaire), et on retombe sur le
   libellé pour les champs texte génériques. */
function hubspotPropertyFor(field) {
  const label = normalizeLabel(field.label);

  if (field.type === 'INPUT_EMAIL' || /\bmail\b/.test(label)) return 'email';
  if (field.type === 'INPUT_PHONE_NUMBER' || /\b(tel|telephone|phone|portable)\b/.test(label)) return 'phone';

  if (/\bprenom\b/.test(label)) return 'firstname';
  if (/\bnom\b/.test(label)) return 'lastname';
  if (/\b(entreprise|societe|raison sociale)\b/.test(label)) return 'company';
  if (/\bsiret\b/.test(label)) return 'ms_siret';
  if (/\b(code postal|cp)\b/.test(label)) return 'zip';
  if (/\bville\b/.test(label)) return 'city';

  return null;
}

function flattenValue(value) {
  if (value === null || value === undefined) return '';

  // Champ fichier : Tally renvoie [{ id, name, url, mimeType, size }].
  // On garde les URL — c'est la facture, la pièce la plus utile du lead.
  if (Array.isArray(value)) {
    return value
      .map((item) => (item && typeof item === 'object' ? item.url || item.name || JSON.stringify(item) : String(item)))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function buildSubmission(payload) {
  const fields = Array.isArray(payload?.data?.fields) ? payload.data.fields : [];

  const properties = new Map();
  const leftovers = [];
  const context = {
    pageName: payload?.data?.formName || 'Tally — Transmettre ma facture'
  };

  for (const field of fields) {
    const value = flattenValue(field.value);
    if (!value) continue;

    const key = String(field.key || '');
    const label = normalizeLabel(field.label);

    // Le hutk n'est pas une propriété de contact : il sert de contexte
    // pour que HubSpot fusionne la session de navigation avec le contact.
    if (label === 'hutk' || key === 'hutk') {
      context.hutk = value;
      continue;
    }

    if (label === 'page url' || key === 'page_url') {
      context.pageUri = value;
    }

    const campaignProperty = CAMPAIGN_TO_HUBSPOT[label.replace(/ /g, '_')] || CAMPAIGN_TO_HUBSPOT[key];
    if (campaignProperty) {
      properties.set(campaignProperty, value);
      continue;
    }

    const property = hubspotPropertyFor(field);
    if (property) {
      properties.set(property, value);
    } else {
      leftovers.push(`${field.label || key} : ${value}`);
    }
  }

  // Tout ce qui n'a pas de propriété dédiée finit dans un champ texte plutôt
  // que d'être perdu — y compris les liens vers la facture uploadée.
  if (leftovers.length) {
    properties.set('message', leftovers.join('\n'));
  }

  if (payload?.data?.submissionPdfUrl) {
    properties.set('ms_tally_submission_url', payload.data.submissionPdfUrl);
  }

  return {
    fields: [...properties].map(([name, value]) => ({
      objectTypeId: '0-1',
      name,
      value: String(value).slice(0, 65536)
    })),
    context
  };
}

function signatureMatches(rawBody, secret, received) {
  if (!received) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(received);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const secret = process.env.TALLY_SIGNING_SECRET;
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;

  // Endpoint public : sans secret configuré on refuse tout, plutôt que
  // d'accepter des soumissions forgées par n'importe qui.
  if (!secret || !portalId || !formGuid) {
    console.error('[tally-hubspot] configuration incomplète (secret / portalId / formGuid)');
    return new Response('Not configured', { status: 503 });
  }

  const rawBody = await request.text();

  if (!signatureMatches(rawBody, secret, request.headers.get('tally-signature'))) {
    console.warn('[tally-hubspot] signature invalide — soumission rejetée');
    return new Response('Invalid signature', { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (payload?.eventType && payload.eventType !== 'FORM_RESPONSE') {
    return new Response(JSON.stringify({ ignored: payload.eventType }), { status: 200 });
  }

  const submission = buildSubmission(payload);

  if (!submission.fields.some((field) => field.name === 'email')) {
    // HubSpot exige un email pour créer un contact. On le signale sans
    // demander à Tally de rejouer : le rejeu produirait la même erreur.
    console.error('[tally-hubspot] soumission sans email, ignorée', payload?.data?.submissionId);
    return new Response(JSON.stringify({ skipped: 'missing email' }), { status: 200 });
  }

  const region = process.env.HUBSPOT_REGION === 'eu1' ? '-eu1' : '';
  const endpoint = `https://api${region}.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('[tally-hubspot] HubSpot a refusé la soumission', response.status, detail);
    // 502 → Tally rejoue automatiquement, ce qui couvre les incidents HubSpot.
    return new Response('HubSpot rejected the submission', { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
