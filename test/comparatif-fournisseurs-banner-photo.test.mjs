// test/comparatif-fournisseurs-banner-photo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const PHOTO = 'assets/comparatif-fournisseurs-savee-photo.webp';
const html = () => readFileSync('comparatif-fournisseurs-electricite-pro.html', 'utf8');

// Le test « affiche la vraie photo bannière » est retiré : le gabarit v2 (PR #100) supprime toute bannière photo
// (cf. comparatif-fournisseurs-v2.test.mjs). Le fichier image reste en place.

test('la photo bannière du comparatif existe et reste sous 300 Ko', () => {
  assert.ok(existsSync(PHOTO), `${PHOTO} doit exister`);
  assert.ok(statSync(PHOTO).size < 300 * 1024, `${PHOTO} doit peser moins de 300 Ko`);
});
