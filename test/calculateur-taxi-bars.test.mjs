// test/calculateur-taxi-bars.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('ms-strategy-calculateur.html', 'utf8');

// buildMonthBars vit dans le script inline de la page, entre deux marqueurs.
function loadBuildMonthBars() {
  const m = html.match(/\/\* bars:start \*\/([\s\S]*?)\/\* bars:end \*\//);
  assert.ok(m, 'marqueurs bars:start / bars:end introuvables');
  return new Function(`${m[1]}; return buildMonthBars;`)();
}

const buildMonthBars = loadBuildMonthBars();
const PER_DAY = 10;

test('un bâton par mois du 1er janvier au mois en cours, le mois en cours partiellement rempli', () => {
  const bars = buildMonthBars(new Date(2026, 0, 1), new Date(2026, 9, 16), 0, PER_DAY);
  assert.equal(bars.length, 10);
  assert.deepEqual(bars.map((b) => b.state), [...Array(9).fill('past'), 'current']);
  assert.equal(bars[0].full, 31 * PER_DAY);
  assert.equal(bars[0].filled, 31 * PER_DAY);
  assert.equal(bars[1].full, 28 * PER_DAY);
  assert.equal(bars[9].filled, 15 * PER_DAY);
});

test('le premier mois ne compte qu\'à partir du jour du renouvellement', () => {
  const bars = buildMonthBars(new Date(2026, 6, 11), new Date(2026, 9, 1), 0, PER_DAY);
  assert.equal(bars.length, 4);
  assert.equal(bars[0].filled, 21 * PER_DAY);
  assert.equal(bars[0].full, 31 * PER_DAY);
});

test('les mois encore engagés apparaissent comme bâtons à venir, vides', () => {
  const bars = buildMonthBars(new Date(2026, 8, 1), new Date(2026, 9, 2), 3, PER_DAY);
  assert.deepEqual(bars.map((b) => b.state), ['past', 'current', 'future', 'future', 'future']);
  assert.deepEqual(bars.slice(2).map((b) => b.month), [10, 11, 0]);
  assert.ok(bars.slice(2).every((b) => b.filled === 0 && b.full > 0));
});

test('au plus 24 mois passés et 24 mois à venir, le mois en cours toujours inclus', () => {
  const bars = buildMonthBars(new Date(2022, 0, 1), new Date(2026, 9, 2), 36, PER_DAY);
  assert.equal(bars.filter((b) => b.state !== 'future').length, 24);
  assert.equal(bars.filter((b) => b.state === 'future').length, 24);
  assert.equal(bars[23].state, 'current');
});

test('la case perte en cours contient l\'histogramme mensuel', () => {
  assert.match(html, /id="taxi-bars"/);
  assert.match(html, /1 bâton = 1 mois/);
});
