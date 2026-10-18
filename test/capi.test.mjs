import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashForMeta, normalizePhoneForMeta, buildLeadEventPayload } from '../lib/capi.mjs';

test('hashForMeta normalise (minuscules, espaces) avant de hacher', () => {
  const expected = createHash('sha256').update('jean.dupont@example.com').digest('hex');
  assert.equal(hashForMeta('  Jean.Dupont@Example.com  '), expected);
});

test('hashForMeta renvoie null pour une valeur vide', () => {
  assert.equal(hashForMeta(''), null);
  assert.equal(hashForMeta(undefined), null);
});

test('normalizePhoneForMeta ne garde que les chiffres', () => {
  assert.equal(normalizePhoneForMeta('+33 6 12 34 56 78'), '33612345678');
});

test('buildLeadEventPayload omet em/ph quand email et telephone sont absents', () => {
  const payload = buildLeadEventPayload({
    eventId: 'evt-1',
    eventSourceUrl: 'https://cabinetms.fr/b2b.html',
    eventTime: 1700000000
  });
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].event_name, 'Lead');
  assert.equal(payload.data[0].action_source, 'website');
  assert.equal('em' in payload.data[0].user_data, false);
  assert.equal('ph' in payload.data[0].user_data, false);
});

test('buildLeadEventPayload hache email et telephone dans user_data', () => {
  const payload = buildLeadEventPayload({
    eventId: 'evt-2',
    eventSourceUrl: 'https://cabinetms.fr/b2c.html',
    eventTime: 1700000000,
    email: 'test@example.com',
    phone: '0612345678',
    fbp: 'fb.1.111.222',
    fbc: 'fb.1.111.333',
    clientIpAddress: '1.2.3.4',
    clientUserAgent: 'test-agent'
  });
  const event = payload.data[0];
  assert.equal(event.user_data.em[0], createHash('sha256').update('test@example.com').digest('hex'));
  assert.equal(event.user_data.ph[0], createHash('sha256').update('0612345678').digest('hex'));
  assert.equal(event.user_data.fbp, 'fb.1.111.222');
  assert.equal(event.user_data.fbc, 'fb.1.111.333');
  assert.equal(event.user_data.client_ip_address, '1.2.3.4');
  assert.equal(event.user_data.client_user_agent, 'test-agent');
});

test('buildLeadEventPayload ajoute test_event_code seulement si fourni', () => {
  const withCode = buildLeadEventPayload({
    eventId: 'evt-3',
    eventSourceUrl: 'https://cabinetms.fr/b2b.html',
    eventTime: 1700000000,
    testEventCode: 'TEST12345'
  });
  assert.equal(withCode.test_event_code, 'TEST12345');

  const withoutCode = buildLeadEventPayload({
    eventId: 'evt-4',
    eventSourceUrl: 'https://cabinetms.fr/b2b.html',
    eventTime: 1700000000
  });
  assert.equal('test_event_code' in withoutCode, false);
});

// ── Validation de /api/capi-lead ──
// L'endpoint est public : sans ces garde-fous, n'importe quel script peut
// envoyer de faux "Lead" a Meta (empoisonnement de l'optimisation des pubs).
import { validateLeadRequest } from '../lib/capi.mjs';
import handler from '../api/capi-lead.js';

const VALID_BODY = {
  eventId: '3f2b8c1e-9a4d-4e2b-8f1a-0c5d6e7f8a9b',
  eventSourceUrl: 'https://cabinetms.fr/b2b.html?utm_source=linkedin',
  email: 'jean.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  fbp: 'fb.1.1596403881668.1116446470',
  fbc: 'fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890'
};

test('validateLeadRequest accepte une requete legitime du site', () => {
  const result = validateLeadRequest({ origin: 'https://cabinetms.fr', body: VALID_BODY });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, VALID_BODY);
});

test('validateLeadRequest refuse une origine etrangere ou absente (403)', () => {
  for (const origin of ['https://evil.example', 'https://cabinetms.fr.evil.example', 'null', undefined]) {
    const result = validateLeadRequest({ origin, body: VALID_BODY });
    assert.equal(result.ok, false, `origine acceptee a tort : ${origin}`);
    assert.equal(result.status, 403);
  }
});

test('validateLeadRequest refuse une page source hors du site (400)', () => {
  for (const eventSourceUrl of ['https://evil.example/b2b.html', 'javascript:alert(1)', 'pas une url', 'https://cabinetms.fr/' + 'a'.repeat(3000)]) {
    const result = validateLeadRequest({ origin: 'https://cabinetms.fr', body: { ...VALID_BODY, eventSourceUrl } });
    assert.equal(result.ok, false, `eventSourceUrl acceptee a tort : ${eventSourceUrl.slice(0, 60)}`);
    assert.equal(result.status, 400);
  }
});

test('validateLeadRequest refuse un eventId absent ou malforme (400)', () => {
  for (const eventId of [undefined, '', 'a b', 'x'.repeat(200), { $ne: 1 }]) {
    const result = validateLeadRequest({ origin: 'https://cabinetms.fr', body: { ...VALID_BODY, eventId } });
    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
  }
});

test('validateLeadRequest accepte le format de repli de l\'eventId (navigateurs sans randomUUID)', () => {
  const result = validateLeadRequest({ origin: 'https://cabinetms.fr', body: { ...VALID_BODY, eventId: '1700000000000-0.123456789' } });
  assert.equal(result.ok, true);
});

test('validateLeadRequest ecarte les champs optionnels invalides sans perdre le lead', () => {
  const result = validateLeadRequest({
    origin: 'https://cabinetms.fr',
    body: { ...VALID_BODY, email: 'pas-un-email', phone: 'x'.repeat(100), fbp: '<script>', fbc: 42 }
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.email, null);
  assert.equal(result.value.phone, null);
  assert.equal(result.value.fbp, null);
  assert.equal(result.value.fbc, null);
});

test('validateLeadRequest refuse un corps absent ou non-objet (400)', () => {
  for (const body of [undefined, null, 'texte', []]) {
    const result = validateLeadRequest({ origin: 'https://cabinetms.fr', body });
    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
  }
});

function fakeRes() {
  return {
    statusCode: null,
    status(code) { this.statusCode = code; return this; },
    end() { return this; },
    json() { return this; }
  };
}

test('handler /api/capi-lead renvoie 403 a une origine etrangere, meme sans token Meta', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', headers: { origin: 'https://evil.example' }, body: VALID_BODY }, res);
  assert.equal(res.statusCode, 403);
});

test('handler /api/capi-lead renvoie 405 hors POST', async () => {
  const res = fakeRes();
  await handler({ method: 'GET', headers: {}, body: undefined }, res);
  assert.equal(res.statusCode, 405);
});
