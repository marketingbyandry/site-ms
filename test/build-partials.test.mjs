// test/build-partials.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  loadSite,
  renderPartial,
  applyPartials,
  listPages,
  syncPages,
} from '../scripts/build-partials.mjs';

test('renderPartial remplace les {{variables}} par les valeurs de site.json', () => {
  assert.equal(renderPartial('Réponse sous {{delai}}', { delai: '24h' }), 'Réponse sous 24h');
});

test('renderPartial échoue sur une variable absente de site.json', () => {
  assert.throws(() => renderPartial('{{inconnue}}', {}), /inconnue/);
});

test('applyPartials remplace le contenu entre les marqueurs et garde les marqueurs', () => {
  const html = 'a <!-- partial:x -->ancien<!-- /partial:x --> b';
  assert.equal(applyPartials(html, { x: 'neuf' }), 'a <!-- partial:x -->neuf<!-- /partial:x --> b');
});

test('applyPartials échoue sur un partial inconnu', () => {
  assert.throws(() => applyPartials('<!-- partial:y -->…<!-- /partial:y -->', {}), /inconnu : y/);
});

test('toutes les pages sont synchronisées avec partials/ et data/site.json', () => {
  assert.deepEqual(syncPages({ write: false }), [], 'lancer npm run build:partials');
});

test('les templates d\'articles embarquent les blocs partagés', () => {
  // Le gabarit v2 n'a volontairement pas de bouton flottant (CTA intercalés à la place).
  const expected = {
    'blog-article-template.html': ['floating-cta', 'cta-reassure'],
    'barometre-article-template.html': ['floating-cta', 'cta-reassure'],
    'blog-article-v2-template.html': ['cta-reassure'],
  };
  for (const [tpl, names] of Object.entries(expected)) {
    const html = readFileSync(path.join(ROOT, 'templates', tpl), 'utf8');
    for (const name of names) {
      assert.match(html, new RegExp(`<!-- partial:${name} -->`), `${tpl} : ${name}`);
    }
  }
});

// Garde-fou pour le texte libre (meta, FAQ, prose) qui n'est pas un partial :
// tout délai de réponse annoncé doit être celui de data/site.json.
test('tous les délais de réponse annoncés correspondent à data/site.json', () => {
  const delai = Number.parseInt(loadSite().delai, 10);
  const files = [...listPages(), 'llms.txt'];
  const mismatches = [];
  for (const file of files) {
    const text = readFileSync(path.join(ROOT, file), 'utf8');
    for (const m of text.matchAll(/(?:sous|en moins de) (\d+) ?(?:h|heures)\b/gi)) {
      if (Number(m[1]) !== delai) mismatches.push(`${file} : « ${m[0]} »`);
    }
  }
  assert.deepEqual(mismatches, []);
});
