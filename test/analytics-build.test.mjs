import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildAnalytics } from '../scripts/build-analytics.mjs';

test('assets/analytics.js correspond au build de src/analytics.js', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ms-analytics-'));
  const outfile = join(dir, 'analytics.js');
  await buildAnalytics(outfile);

  const [fresh, committed] = await Promise.all([
    readFile(outfile, 'utf8'),
    readFile('assets/analytics.js', 'utf8')
  ]);

  assert.equal(
    fresh,
    committed,
    'assets/analytics.js est perime — lancer `npm run build:analytics` et commiter la sortie'
  );
});

test('le bundle expose window.msInitAnalytics pour cookie-consent.js', async () => {
  const bundle = await readFile('assets/analytics.js', 'utf8');
  assert.match(
    bundle,
    /msInitAnalytics/,
    'le contrat avec assets/cookie-consent.js a disparu du bundle'
  );
});

test('le bundle lit le cookie ms_camp pour la super-property camp', async () => {
  const bundle = await readFile('assets/analytics.js', 'utf8');
  assert.match(
    bundle,
    /ms_camp/,
    'la mesure de campagne par segment/email a disparu du bundle'
  );
});

test('le bundle initialise le Pixel Meta avec le bon identifiant', async () => {
  const bundle = await readFile('assets/analytics.js', 'utf8');
  assert.match(
    bundle,
    /1381584920727587/,
    "l'identifiant du Pixel Meta a disparu du bundle"
  );
});
