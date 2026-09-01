import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// Regression: le logo M&S Strategy (573x146px natif) n'avait pas de width/height,
// ce qui causait un layout shift (CLS 0.121 mesuré par Lighthouse mobile) le
// temps que l'image charge. Toutes les balises <img> du logo doivent réserver
// l'espace via les dimensions natives (le CSS impose height fixe + width:auto,
// donc ces attributs ne changent pas le rendu visuel).

const htmlFiles = readdirSync('.').filter((f) => f.endsWith('.html'));

test('toutes les balises <img> du logo M&S Strategy déclarent width="573" height="146"', () => {
  const offenders = [];
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const tags = html.match(/<img[^>]*ms-strategy-logo\.png[^>]*>/g) || [];
    for (const tag of tags) {
      if (!/width="573"/.test(tag) || !/height="146"/.test(tag)) {
        offenders.push(`${file}: ${tag}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `balises sans dimensions natives:\n${offenders.join('\n')}`);
});

test('au moins une balise <img> du logo a bien été trouvée (le test ne passe pas vide)', () => {
  const total = htmlFiles
    .map((file) => (readFileSync(file, 'utf8').match(/<img[^>]*ms-strategy-logo\.png[^>]*>/g) || []).length)
    .reduce((a, b) => a + b, 0);
  assert.ok(total >= 20, `attendu au moins 20 occurrences, trouvé ${total}`);
});
