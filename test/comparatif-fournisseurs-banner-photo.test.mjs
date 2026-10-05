// test/comparatif-fournisseurs-banner-photo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const PHOTO = 'assets/comparatif-fournisseurs-savee-photo.webp';
const html = () => readFileSync('comparatif-fournisseurs-electricite-pro.html', 'utf8');

test('comparatif-fournisseurs-electricite-pro.html affiche la vraie photo bannière', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.article-banner\{background:url\("assets\/comparatif-fournisseurs-savee-photo\.webp"\)/);
  assert.match(source, /<div class="photo-ph article-banner"><\/div>/, 'le dot-grid décoratif doit être retiré sur une vraie photo');
});

test('la photo bannière du comparatif existe et reste sous 300 Ko', () => {
  assert.ok(existsSync(PHOTO), `${PHOTO} doit exister`);
  assert.ok(statSync(PHOTO).size < 300 * 1024, `${PHOTO} doit peser moins de 300 Ko`);
});
