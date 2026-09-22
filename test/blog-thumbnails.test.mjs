// test/blog-thumbnails.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('blog.html', 'utf8');

test('blog.html ajoute une vignette photo sur chacune des 9 cartes article', () => {
  const source = html();
  const count = (source.match(/<div class="photo-ph blog-thumb[^"]*">/g) || []).length;
  assert.equal(count, 9, 'les 9 cartes .res-card doivent recevoir une vignette photo');
});

test('chacune des 9 vignettes affiche une vraie photo (pas seulement le placeholder texturé)', () => {
  const source = html();
  const modifiers = [
    'blog-thumb-article-1', 'blog-thumb-article-2',
    'blog-thumb-barometre-2022', 'blog-thumb-barometre-2023', 'blog-thumb-barometre-2024',
    'blog-thumb-barometre-2025', 'blog-thumb-barometre-2026-t1', 'blog-thumb-barometre-2026-t2',
    'blog-thumb-barometre-2026-t3',
  ];
  for (const cls of modifiers) {
    assert.match(source, new RegExp(`<div class="photo-ph blog-thumb ${cls}">`), `la carte ${cls} doit porter sa classe de vignette`);
    assert.match(source, new RegExp(`\\.${cls}\\{background:url\\("assets/[^"]+\\.webp"\\)[^}]*no-repeat\\}`), `${cls} doit avoir une vraie photo en background`);
  }
});

test('chaque vignette précède le res-tag de sa carte', () => {
  const source = html();
  const cardRe = /<a href="[^"]+" class="res-card(?! tool-card)[^"]*">/g;
  let match;
  let checked = 0;
  while ((match = cardRe.exec(source)) !== null) {
    const cardStart = match.index;
    const nextTagIdx = source.indexOf('res-tag', cardStart);
    const thumbIdx = source.indexOf('photo-ph blog-thumb', cardStart);
    assert.ok(thumbIdx > -1 && thumbIdx < nextTagIdx, `carte à l'offset ${cardStart} doit avoir sa vignette avant res-tag`);
    checked++;
  }
  assert.equal(checked, 9);
});

test('blog.html observe .photo-ph dans son reveal scroll', () => {
  assert.match(html(), /document\.querySelectorAll\('\.reveal,\s*\.photo-ph'\)\.forEach\(el => obs\.observe\(el\)\);/);
});

test('blog.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});
