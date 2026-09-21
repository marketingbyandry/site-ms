// test/ms-blog-barometre-2022-banner-photo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('ms-blog-barometre-2022.html', 'utf8');

test('ms-blog-barometre-2022.html affiche la vraie photo bannière (symbole du choc géopolitique 2022)', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.article-banner\{background:url\("assets\/barometre-2022-photo\.webp"\)/);
  assert.match(source, /<div class="photo-ph article-banner"><\/div>/, 'le dot-grid décoratif doit être retiré sur une vraie photo');
});
