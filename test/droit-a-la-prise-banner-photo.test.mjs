// test/droit-a-la-prise-banner-photo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

// Page du top 10 GA4 : la bannière dégradée vide est remplacée par une vraie photo
// de copropriété déjà présente sur le site (pas de visuel inventé).
const PHOTO = 'assets/appartement-maison-photo.webp';
const html = () => readFileSync('droit-a-la-prise-copropriete.html', 'utf8');

test('droit-a-la-prise-copropriete.html affiche la vraie photo bannière', () => {
  const source = html();
  const inlineStyle = source.slice(source.indexOf('<style>'), source.indexOf('</style>'));
  assert.match(inlineStyle, /\.article-banner\{background:url\("assets\/appartement-maison-photo\.webp"\)/);
  assert.match(source, /<div class="photo-ph article-banner"><\/div>/);
});

test('la photo bannière du droit à la prise existe et reste sous 300 Ko', () => {
  assert.ok(existsSync(PHOTO), `${PHOTO} doit exister`);
  assert.ok(statSync(PHOTO).size < 300 * 1024, `${PHOTO} doit peser moins de 300 Ko`);
});
