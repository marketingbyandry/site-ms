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
