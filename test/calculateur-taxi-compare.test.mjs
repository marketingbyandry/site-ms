// test/calculateur-taxi-compare.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('ms-strategy-calculateur.html', 'utf8');

// buildCompare vit dans le script inline de la page, entre deux marqueurs.
function loadBuildCompare() {
  const m = html.match(/\/\* compare:start \*\/([\s\S]*?)\/\* compare:end \*\//);
  assert.ok(m, 'marqueurs compare:start / compare:end introuvables');
  return new Function(`${m[1]}; return buildCompare;`)();
}

const buildCompare = loadBuildCompare();

test('sans M&S = coût annuel actuel, avec M&S = coût moins le surcoût du compteur', () => {
  const c = buildCompare(45000, 8400);
  assert.equal(c.without, 45000);
  assert.equal(c.withMs, 36600);
  assert.equal(c.excess, 8400);
  assert.equal(c.monthly, 700);
});

test('les largeurs relatives se complètent : vert + hachures = barre rouge entière', () => {
  const c = buildCompare(45000, 8400);
  assert.ok(Math.abs(c.withRatio + c.excessRatio - 1) < 1e-12);
  assert.ok(Math.abs(c.excessRatio - 8400 / 45000) < 1e-12);
});

test('aucune valeur négative ni division par zéro', () => {
  assert.deepEqual(
    { ...buildCompare(0, 0) },
    { without: 0, withMs: 0, excess: 0, withRatio: 0, excessRatio: 0, monthly: 0 },
  );
  assert.equal(buildCompare(1000, 5000).withMs, 0);
});

test('la case perte en cours compare sans / avec M&S en barres horizontales', () => {
  assert.match(html, /id="taxi-compare"/);
  assert.match(html, /Sans M&amp;S Strategy/);
  assert.match(html, /Avec M&amp;S Strategy/);
  assert.doesNotMatch(html, /taxi-bars/);
});
