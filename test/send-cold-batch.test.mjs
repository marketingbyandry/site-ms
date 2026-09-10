import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runColdBatch, SENDER_EMAIL, SENDER_NAME } from '../scripts/send-cold-batch.mjs';

const TEMPLATE = '{{SALUTATION}} {{ENTREPRISE}} {{LIEN_FORMULAIRE}}';
// La plupart des tests ne portent pas sur la selection de template par
// secteur (couverte par son propre test ci-dessous) : ces contacts n'ont pas
// de `secteur`, donc runColdBatch retombe systematiquement sur `default`.
const SAME_TEMPLATE_ALL_SEGMENTS = { default: TEMPLATE };

// Simule la CLI composio sans reseau : enregistre chaque appel, repond aux
// deux formes utilisees par le script (blockedContacts, envoi d'un email).
function makeExecCli({ blockedEmails = [] } = {}) {
  const calls = [];
  const execCli = (args) => {
    calls.push(args);
    if (args[0] === 'proxy' && args[1].includes('/blockedContacts')) {
      return { contacts: blockedEmails.map((email) => ({ email })) };
    }
    if (args[0] === 'proxy' && args[1] === 'https://api.brevo.com/v3/smtp/email') {
      return { messageId: 'test-message-id' };
    }
    throw new Error(`appel composio inattendu: ${args.join(' ')}`);
  };
  execCli.calls = calls;
  return execCli;
}

test('envoie tous les contacts du lot quand rien n_est bloque', () => {
  const execCli = makeExecCli();
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A SARL', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B SARL', type: 'generique', segment: 'chr' }
  ];
  const result = runColdBatch({ batch, templates: SAME_TEMPLATE_ALL_SEGMENTS, alreadySentToday: 0, execCli, sleepFn: () => {} });
  assert.deepEqual(result.sent, ['a@exemple.fr', 'b@exemple.fr']);
  assert.equal(result.aborted, false);
});

test('retire du lot un contact deja sur la liste de suppression Brevo', () => {
  const execCli = makeExecCli({ blockedEmails: ['b@exemple.fr'] });
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A SARL', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B SARL', type: 'generique', segment: 'chr' }
  ];
  const result = runColdBatch({ batch, templates: SAME_TEMPLATE_ALL_SEGMENTS, alreadySentToday: 0, execCli, sleepFn: () => {} });
  assert.deepEqual(result.sent, ['a@exemple.fr']);
  assert.deepEqual(result.skippedBlocked, ['b@exemple.fr']);
});

test('n_envoie jamais plus que le plafond restant', () => {
  const execCli = makeExecCli();
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B', type: 'generique', segment: 'ind' },
    { email: 'c@exemple.fr', entreprise: 'C', type: 'generique', segment: 'ind' }
  ];
  const result = runColdBatch({ batch, templates: SAME_TEMPLATE_ALL_SEGMENTS, alreadySentToday: 0, execCli, cap: 2, sleepFn: () => {} });
  assert.deepEqual(result.sent, ['a@exemple.fr', 'b@exemple.fr']);
  assert.deepEqual(result.skippedCap, ['c@exemple.fr']);
});

test('abandonne sans rien envoyer si le taux de bounce du jour depasse le seuil', () => {
  const execCli = makeExecCli({ blockedEmails: ['x1@e.fr', 'x2@e.fr', 'x3@e.fr'] });
  const batch = [{ email: 'a@exemple.fr', entreprise: 'A', type: 'generique', segment: 'ind' }];
  // 3 bloques / 50 deja envoyes = 6% > seuil 5%
  const result = runColdBatch({ batch, templates: SAME_TEMPLATE_ALL_SEGMENTS, alreadySentToday: 50, execCli, thresholdPct: 5 });
  assert.equal(result.aborted, true);
  assert.equal(result.reason, 'bounce_rate');
  assert.deepEqual(result.sent, []);
  const sendCalls = execCli.calls.filter((c) => c[1] === 'https://api.brevo.com/v3/smtp/email');
  assert.equal(sendCalls.length, 0);
});

test('le payload envoye porte le bon expediteur et le bon lien de campagne', () => {
  const execCli = makeExecCli();
  const batch = [{
    email: 'a@exemple.fr',
    entreprise: 'A SARL',
    type: 'nominatif',
    destinataire: 'Jean Dupont',
    segment: 'tert'
  }];
  runColdBatch({
    batch,
    templates: { default: '{{SALUTATION}}{{LIEN_FORMULAIRE}}' },
    alreadySentToday: 0,
    execCli,
    sleepFn: () => {}
  });
  const sendCall = execCli.calls.find((c) => c[1] === 'https://api.brevo.com/v3/smtp/email');
  const payload = JSON.parse(sendCall[sendCall.indexOf('-d') + 1]);
  assert.equal(payload.sender.email, SENDER_EMAIL);
  assert.equal(payload.sender.name, SENDER_NAME);
  assert.match(payload.htmlContent, /camp=mail-tert/);
});

test('choisit le template du bon secteur pour chaque contact du lot', () => {
  const execCli = makeExecCli();
  const batch = [
    { email: 'resto@exemple.fr', entreprise: 'Le Bon Plat', type: 'generique', segment: 'chr', secteur: 'restaurant' },
    { email: 'boul@exemple.fr', entreprise: 'Boulangerie Dupont', type: 'generique', segment: 'ind', secteur: 'boulangerie' },
    { email: 'ferme@exemple.fr', entreprise: 'GAEC des Collines', type: 'generique', segment: 'agri', secteur: 'agriculture' }
  ];
  runColdBatch({
    batch,
    templates: {
      restaurant: 'TEMPLATE_RESTAURANT {{LIEN_FORMULAIRE}}',
      boulangerie: 'TEMPLATE_BOULANGERIE {{LIEN_FORMULAIRE}}',
      agriculture: 'TEMPLATE_AGRICULTURE {{LIEN_FORMULAIRE}}',
      default: 'TEMPLATE_DEFAULT {{LIEN_FORMULAIRE}}'
    },
    alreadySentToday: 0,
    execCli,
    sleepFn: () => {}
  });
  const sendCalls = execCli.calls.filter((c) => c[1] === 'https://api.brevo.com/v3/smtp/email');
  const payloads = sendCalls.map((c) => JSON.parse(c[c.indexOf('-d') + 1]));
  assert.match(payloads[0].htmlContent, /^TEMPLATE_RESTAURANT/);
  assert.match(payloads[1].htmlContent, /^TEMPLATE_BOULANGERIE/);
  assert.match(payloads[2].htmlContent, /^TEMPLATE_AGRICULTURE/);
});

test('retombe sur le template par defaut quand le secteur est absent ou non reconnu', () => {
  const execCli = makeExecCli();
  const batch = [
    { email: 'sans-secteur@exemple.fr', entreprise: 'A', type: 'generique', segment: 'tert' },
    { email: 'secteur-inconnu@exemple.fr', entreprise: 'B', type: 'generique', segment: 'log', secteur: 'entrepot' }
  ];
  runColdBatch({
    batch,
    templates: { default: 'TEMPLATE_DEFAULT {{LIEN_FORMULAIRE}}', restaurant: 'TEMPLATE_RESTAURANT {{LIEN_FORMULAIRE}}' },
    alreadySentToday: 0,
    execCli,
    sleepFn: () => {}
  });
  const sendCalls = execCli.calls.filter((c) => c[1] === 'https://api.brevo.com/v3/smtp/email');
  const payloads = sendCalls.map((c) => JSON.parse(c[c.indexOf('-d') + 1]));
  assert.match(payloads[0].htmlContent, /^TEMPLATE_DEFAULT/);
  assert.match(payloads[1].htmlContent, /^TEMPLATE_DEFAULT/);
});

test('espace les envois d_un delai entre chaque email du lot', () => {
  const execCli = makeExecCli();
  const sleeps = [];
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B', type: 'generique', segment: 'ind' },
    { email: 'c@exemple.fr', entreprise: 'C', type: 'generique', segment: 'ind' }
  ];
  runColdBatch({
    batch,
    templates: SAME_TEMPLATE_ALL_SEGMENTS,
    alreadySentToday: 0,
    execCli,
    delayMs: 3000,
    sleepFn: (ms) => sleeps.push(ms)
  });
  // Un delai apres chaque envoi sauf le dernier : 2 delais pour 3 envois.
  assert.deepEqual(sleeps, [3000, 3000]);
});

test('preserve partial send results when composio proxy fails on 2nd contact', () => {
  let emailCallCount = 0;
  const calls = [];
  const execCli = (args) => {
    calls.push(args);
    if (args[0] === 'proxy' && args[1].includes('/blockedContacts')) {
      return { contacts: [] };
    }
    if (args[0] === 'proxy' && args[1] === 'https://api.brevo.com/v3/smtp/email') {
      emailCallCount++;
      if (emailCallCount === 2) {
        throw new Error('Connection timeout from composio proxy');
      }
      return { messageId: 'test-message-id' };
    }
    throw new Error(`appel composio inattendu: ${args.join(' ')}`);
  };
  execCli.calls = calls;

  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B', type: 'generique', segment: 'ind' },
    { email: 'c@exemple.fr', entreprise: 'C', type: 'generique', segment: 'ind' }
  ];
  const result = runColdBatch({
    batch,
    templates: SAME_TEMPLATE_ALL_SEGMENTS,
    alreadySentToday: 0,
    execCli,
    sleepFn: () => {}
  });

  assert.deepEqual(result.sent, ['a@exemple.fr']);
  assert.equal(result.aborted, true);
  assert.equal(result.reason, 'send_error');
  assert.equal(result.error, 'Connection timeout from composio proxy');
  assert.equal(result.failedContact, 'b@exemple.fr');

  // Verify we attempted exactly 2 smtp/email calls (1st succeeded, 2nd failed)
  // and did NOT attempt to send to the 3rd contact
  const sendCalls = execCli.calls.filter((c) => c[1] === 'https://api.brevo.com/v3/smtp/email');
  assert.equal(sendCalls.length, 2, 'should attempt 1st and 2nd, but not 3rd');

  // Verify no payload was sent for c@exemple.fr (3rd contact)
  const sentEmails = sendCalls.map((call) => {
    const payload = JSON.parse(call[call.indexOf('-d') + 1]);
    return payload.to[0].email;
  });
  assert.deepEqual(sentEmails, ['a@exemple.fr', 'b@exemple.fr'], 'attempted 1st and 2nd emails only');
});
