// test/index-mirror-stats.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('index.html', 'utf8');

test('index.html insère la Section 2 (chiffres en miroir) entre .brand et .seo-intro', () => {
  const source = html();
  const brandCloseIdx = source.indexOf('</section>', source.indexOf('<section class="brand">'));
  const mirrorIdx = source.indexOf('<div class="mirror-row');
  const seoIdx = source.indexOf('<section class="seo-intro">');
  assert.ok(mirrorIdx > brandCloseIdx, 'chiffres en miroir doit venir après le bandeau marque');
  assert.ok(seoIdx > mirrorIdx, 'seo-intro doit venir après les chiffres en miroir');
});

test('la Section 2 affiche les deux chiffres du gabarit avec le badge donnée d\'exemple', () => {
  const source = html();
  assert.match(source, /8\s?216/);
  assert.match(source, />94%</);
  assert.match(source, /gabarit — donnée d'exemple/);
});

test('la Section 2 contient un avertissement placeholder photo (rule-note)', () => {
  const source = html();
  const mirrorIdx = source.indexOf('<div class="mirror-row');
  const noteIdx = source.indexOf('<div class="rule-note', mirrorIdx);
  assert.ok(noteIdx > mirrorIdx, 'un rule-note doit suivre la Section 2');
  assert.ok(noteIdx - mirrorIdx < 3000, 'le rule-note doit être proche de la Section 2 (pas celui de la Section 6 plus bas)');
});
