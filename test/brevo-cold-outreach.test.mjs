import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fillTemplate,
  buildColdEmailPayload,
  enforceDailyCap,
  isBounceRateSafe,
  filterBlockedContacts,
  htmlToText
} from '../lib/brevo-cold-outreach.mjs';
import { readFileSync, readdirSync } from 'node:fs';

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

test('buildColdEmailPayload personnalise l_objet avec les tokens du template', () => {
  const payload = buildColdEmailPayload(
    { email: 'contact@exemple.fr', entreprise: 'Le Zinc', type: 'generique', segment: 'bar' },
    {
      template: '<p>{{SALUTATION}}</p>',
      subject: '{{ENTREPRISE}} : votre contrat',
      senderEmail: 'contact@mail.cabinetms.fr',
      senderName: 'M&S Strategy'
    }
  );
  assert.equal(payload.subject, 'Le Zinc : votre contrat');
  assert.equal(payload.textContent, 'Bonjour,');
});

test('htmlToText retire head, commentaires et preheader, garde les URL des liens', () => {
  const html = [
    '<html><head><title>T</title><style>p{}</style></head><body>',
    '<div style="display: none; max-height: 0;">Aperçu masqué</div>',
    '<!--[if mso]><v:rect></v:rect><![endif]-->',
    '<div>Bonjour,</div><div>Coût&nbsp;: 24&ndash;48h &amp; plus<br>ligne 2</div>',
    '<a href="https://cabinetms.fr/b2b.html?camp=mail-bar">Faire analyser ma facture</a>',
    '<a href="mailto:contact@mail.cabinetms.fr?subject=STOP">cliquez ici</a>',
    '</body></html>'
  ].join('');
  const text = htmlToText(html);
  assert.ok(!text.includes('Aperçu masqué'));
  assert.ok(!text.includes('v:rect'));
  assert.ok(!text.includes('<'));
  assert.match(text, /^Bonjour,\nCoût : 24–48h & plus\nligne 2/);
  assert.match(text, /Faire analyser ma facture \(https:\/\/cabinetms\.fr\/b2b\.html\?camp=mail-bar\)/);
  assert.match(text, /cliquez ici \(contact@mail\.cabinetms\.fr\?subject=STOP\)/);
});

// Garde-fous sur les vrais templates : tokens attendus, mentions CNIL
// obligatoires (spec, section conformite) et version texte exploitable.
const TEMPLATE_DIR = new URL('../content/cold-mail-b2b/', import.meta.url);
for (const file of readdirSync(TEMPLATE_DIR).filter((f) => f.endsWith('.html'))) {
  test(`template ${file} : tokens, mentions CNIL et version texte`, () => {
    const html = readFileSync(new URL(file, TEMPLATE_DIR), 'utf8');
    assert.match(html, /\{\{SALUTATION\}\}/);
    assert.match(html, /\{\{ENTREPRISE\}\}/);
    assert.match(html, /href="\{\{LIEN_FORMULAIRE\}\}"/);
    assert.match(html, /SIREN 752 139 477/);
    assert.match(html, /répondez STOP/);
    assert.match(html, /mailto:contact@mail\.cabinetms\.fr\?subject=STOP/);
    assert.match(html, /Répondez simplement «&nbsp;intéressé&nbsp;»/);
    const filled = fillTemplate(html, { SALUTATION: 'Bonjour,', ENTREPRISE: 'Exemple SARL', LIEN_FORMULAIRE: 'https://cabinetms.fr/b2b.html?camp=mail-test' });
    assert.ok(!/\{\{\w+\}\}/.test(filled), 'token non rempli');
    const text = htmlToText(filled);
    assert.match(text, /^Bonjour,/m);
    assert.match(text, /Faire analyser ma facture \(https:\/\/cabinetms\.fr\/b2b\.html\?camp=mail-test\)/);
    assert.ok(!/[<>]/.test(text), 'balise HTML restante dans la version texte');
  });
}
