// test/ms-blog-article-2-banner-photo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('ms-blog-article-2.html', 'utf8');

test('ms-blog-article-2.html (Anticiper son renouvellement) affiche la vraie photo bannière', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.article-banner\{background:url\("assets\/renouvellement-savee-photo\.webp"\)/);
  assert.match(source, /<div class="photo-ph article-banner"><\/div>/, 'le dot-grid décoratif doit être retiré sur une vraie photo');
});
