// test/b2c-compare.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2c.html', 'utf8');

test('b2c.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('b2c.html insère le comparatif entre "sur-mesure" et le formulaire d\'étude', () => {
  const source = html();
  const valsCloseIdx = source.indexOf('</section>', source.indexOf('<section class="vals">'));
  const compareIdx = source.indexOf('class="compare');
  const uploadIdx = source.indexOf('<section class="upload-section" id="upload">');
  assert.ok(compareIdx > valsCloseIdx);
  assert.ok(uploadIdx > compareIdx);
});

test('le comparatif B2C utilise la copie adaptée particuliers, pas la copie B2B', () => {
  const source = html();
  assert.match(source, /Suivi des évolutions tarifaires/);
  assert.match(source, /Conseiller dédié/);
  assert.match(source, /Temps passé à comparer/);
  assert.doesNotMatch(source, /Suivi des marchés de gros/, 'ne doit pas reprendre la formulation B2B');
});
