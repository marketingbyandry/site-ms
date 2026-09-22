// test/b2b-cases-grid.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2b.html', 'utf8');

test('b2b.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('b2b.html insère la grille de résultats par secteur entre les 4 étapes et "sur-mesure"', () => {
  const source = html();
  const howCloseIdx = source.indexOf('</section>', source.indexOf('<section class="how-band">'));
  const casesIdx = source.indexOf('<div class="cases-grid-3">');
  const valsIdx = source.indexOf('<section class="vals">');
  assert.ok(casesIdx > howCloseIdx, 'la grille de résultats doit venir après les 4 étapes');
  assert.ok(valsIdx > casesIdx, '"sur-mesure" doit venir après la grille de résultats');
});

test('la grille de résultats affiche 3 cas sectoriels sans le badge "gabarit — données d\'exemple"', () => {
  const source = html();
  assert.doesNotMatch(source, /gabarit — données d'exemple/);
  assert.match(source, /Restauration · 14 sites/);
  assert.match(source, /−21%/);
  assert.match(source, /Industrie agroalimentaire/);
  assert.match(source, /−17%/);
  assert.match(source, /Commerce de détail/);
  assert.match(source, /−19%/);
});
