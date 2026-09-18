// test/resultats-cases-grid.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('resultats.html', 'utf8');

test('resultats.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('resultats.html insère la grille de résultats entre "méthode structurée" et "économies adaptées"', () => {
  const source = html();
  const seoCloseIdx = source.indexOf('</section>', source.indexOf('<section class="seo-intro">'));
  const casesIdx = source.indexOf('<div class="cases-grid-3">');
  const valsIdx = source.indexOf('<section class="vals">');
  assert.ok(casesIdx > seoCloseIdx, 'la grille de résultats doit venir après "méthode structurée"');
  assert.ok(valsIdx > casesIdx, '"économies adaptées" doit venir après la grille de résultats');
});

test('la grille de résultats affiche le badge et les 3 cas sectoriels du gabarit', () => {
  const source = html();
  assert.match(source, /gabarit — données d'exemple/);
  assert.match(source, /−21%/);
  assert.match(source, /−17%/);
  assert.match(source, /−19%/);
});
