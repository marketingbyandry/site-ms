// test/calculateur-projection.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('ms-strategy-calculateur.html', 'utf8');

// buildProjection vit dans le script inline de la page, entre deux marqueurs.
function loadBuildProjection() {
  const m = html.match(/\/\* projection:start \*\/([\s\S]*?)\/\* projection:end \*\//);
  assert.ok(m, 'marqueurs projection:start / projection:end introuvables');
  return new Function(`${m[1]}; return buildProjection;`)();
}

const buildProjection = loadBuildProjection();

test('les deux contrats partent de 0 € et cumulent sur 6 ans', () => {
  const p = buildProjection(36000, .2);
  assert.equal(p.months, 72);
  for (const serie of [p.low, p.mid, p.high, p.ms]) {
    assert.equal(serie.length, 73);
    assert.equal(serie[0], 0);
    for (let m = 1; m <= p.months; m++) assert.ok(serie[m] > serie[m - 1]);
  }
});

test('sans négociation : hausse annuelle de 5 % (bas) à 7 % (haut)', () => {
  const p = buildProjection(12000, .2);
  // Année 1 au prix actuel, année 2 relevée de 5 % / 6 % / 7 %.
  assert.equal(p.mid[12], 12000);
  assert.equal(Math.round(p.low[24] - p.low[12]), 12600);
  assert.equal(Math.round(p.mid[24] - p.mid[12]), 12720);
  assert.equal(Math.round(p.high[24] - p.high[12]), 12840);
  for (let m = 0; m <= p.months; m++) assert.ok(p.low[m] <= p.mid[m] && p.mid[m] <= p.high[m]);
});

test('avec M&S : prix bloqué pendant les 3 ans du contrat', () => {
  const p = buildProjection(12000, .25);
  const step = p.ms[1];
  assert.equal(step, 750);
  for (let m = 1; m <= 36; m++) assert.equal(p.ms[m] - p.ms[m - 1], step);
});

test('renouvellement lancé 18 mois avant échéance, nouveau contrat de 3 ans au niveau de marché de ce moment', () => {
  const p = buildProjection(12000, .25);
  assert.equal(p.renewalAt, 1.5);
  assert.equal(p.contractYears, 3);
  const step2 = p.ms[37] - p.ms[36];
  assert.ok(Math.abs(step2 - 750 * Math.pow(1.06, 1.5)) < 1e-9);
  for (let m = 38; m <= 72; m++) assert.ok(Math.abs(p.ms[m] - p.ms[m - 1] - step2) < 1e-9);
});

test("même sans remise sur le prix, le blocage protège des hausses : l'écart ne fait que grandir", () => {
  const p = buildProjection(12000, 0);
  for (let m = 13; m <= p.months; m++) {
    assert.ok(p.ms[m] < p.low[m], `mois ${m}`);
    assert.ok(p.low[m] - p.ms[m] >= p.low[m - 1] - p.ms[m - 1]);
  }
});

test('les textes du calculateur parlent d\'un contrat de 3 ans, plus de 2 ans', () => {
  assert.doesNotMatch(html, /2 ans/);
  assert.match(html, /prochain contrat \(3 ans\)/);
});
