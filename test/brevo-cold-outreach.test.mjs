import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fillTemplate,
  buildColdEmailPayload,
  enforceDailyCap,
  isBounceRateSafe,
  filterBlockedContacts
} from '../lib/brevo-cold-outreach.mjs';

test('fillTemplate remplace tous les tokens connus', () => {
  const result = fillTemplate('{{SALUTATION}} {{ENTREPRISE}}', {
    SALUTATION: 'Bonjour Jean,',
    ENTREPRISE: 'Exemple SARL'
  });
  assert.equal(result, 'Bonjour Jean, Exemple SARL');
});

test('fillTemplate laisse un token inconnu tel quel', () => {
  const result = fillTemplate('{{INCONNU}}', {});
  assert.equal(result, '{{INCONNU}}');
});

test('buildColdEmailPayload utilise le prenom pour un contact nominatif', () => {
  const payload = buildColdEmailPayload(
    {
      email: 'j.dupont@exemple.fr',
      entreprise: 'Exemple SARL',
      type: 'nominatif',
      destinataire: 'Jean Dupont',
      segment: 'ind'
    },
    {
      template: '{{SALUTATION}}|{{ENTREPRISE}}|{{LIEN_FORMULAIRE}}',
      subject: 'Sujet',
      senderEmail: 'contact@mail.cabinetms.fr',
      senderName: 'M&S Strategy'
    }
  );
  assert.equal(
    payload.htmlContent,
    'Bonjour Jean,|Exemple SARL|https://cabinetms.fr/b2b.html?camp=mail-ind'
  );
  assert.deepEqual(payload.to, [{ email: 'j.dupont@exemple.fr', name: 'Jean Dupont' }]);
});

test('buildColdEmailPayload utilise une salutation generique pour un contact generique', () => {
  const payload = buildColdEmailPayload(
    { email: 'contact@exemple.fr', entreprise: 'Exemple SARL', type: 'generique', segment: 'chr' },
    {
      template: '{{SALUTATION}}',
      subject: 'Sujet',
      senderEmail: 'contact@mail.cabinetms.fr',
      senderName: 'M&S Strategy'
    }
  );
  assert.equal(payload.htmlContent, 'Bonjour,');
});

test('enforceDailyCap tronque au plafond restant', () => {
  const batch = [1, 2, 3, 4, 5];
  assert.deepEqual(enforceDailyCap(batch, 48, 50), [1, 2]);
});

test('enforceDailyCap renvoie un lot vide si le plafond est deja atteint', () => {
  assert.deepEqual(enforceDailyCap([1, 2, 3], 50, 50), []);
});

test('isBounceRateSafe est vrai sous le seuil', () => {
  assert.equal(isBounceRateSafe(2, 50, 5), true); // 4%
});

test('isBounceRateSafe est faux au-dessus du seuil', () => {
  assert.equal(isBounceRateSafe(3, 50, 5), false); // 6%
});

test('isBounceRateSafe est vrai si rien n_a encore ete envoye', () => {
  assert.equal(isBounceRateSafe(0, 0, 5), true);
});

test('filterBlockedContacts separe les contacts supprimes des autres, insensible a la casse', () => {
  const batch = [
    { email: 'a@exemple.fr' },
    { email: 'B@Exemple.fr' },
    { email: 'c@exemple.fr' }
  ];
  const { toSend, skipped } = filterBlockedContacts(batch, ['b@exemple.fr']);
  assert.deepEqual(toSend.map((c) => c.email), ['a@exemple.fr', 'c@exemple.fr']);
  assert.deepEqual(skipped.map((c) => c.email), ['B@Exemple.fr']);
});
