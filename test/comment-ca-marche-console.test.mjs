// test/comment-ca-marche-console.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('comment-ca-marche.html', 'utf8');

test('comment-ca-marche.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('comment-ca-marche.html insère le widget console entre les étapes et "Comparer davantage"', () => {
  const source = html();
  const stepsCloseIdx = source.indexOf('</section>', source.indexOf('<section class="steps">'));
  const consoleIdx = source.indexOf('<section class="console-standalone');
  const seoIdx = source.indexOf('<section class="seo-intro">');
  assert.ok(consoleIdx > stepsCloseIdx, 'le widget doit venir après les étapes');
  assert.ok(seoIdx > consoleIdx, '"Comparer davantage" doit venir après le widget');
});

test('le widget console affiche les 4 lignes du gabarit sans étiquette de fraîcheur (décision utilisateur)', () => {
  const source = html();
  assert.match(source, /0,182 €\/kWh/);
  assert.match(source, /−4,2%/);
  assert.match(source, /favorable/);
  assert.match(source, />8\s?216</);
});
