// test/b2b-compare.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2b.html', 'utf8');

test('b2b.html insère le comparatif entre "sur-mesure" et le formulaire d\'étude', () => {
  const source = html();
  const valsCloseIdx = source.indexOf('</section>', source.indexOf('<section class="vals">'));
  const compareIdx = source.indexOf('class="compare');
  const uploadIdx = source.indexOf('<section class="upload-section" id="upload">');
  assert.ok(compareIdx > valsCloseIdx, 'le comparatif doit venir après "sur-mesure"');
  assert.ok(uploadIdx > compareIdx, 'le formulaire d\'étude doit venir après le comparatif');
});

test('le comparatif B2B reprend les 5 lignes verbatim du gabarit', () => {
  const source = html();
  assert.match(source, /Mise en concurrence des offres/);
  assert.match(source, /Suivi des marchés de gros/);
  assert.match(source, /Interlocuteur dédié/);
  assert.match(source, /Alerte avant échéance de contrat/);
  assert.match(source, /Temps interne/);
  assert.match(source, /Sur économies réalisées/);
  assert.match(source, /<div class="cell brand">/);
});
