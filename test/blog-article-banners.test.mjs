// test/blog-article-banners.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ARTICLES = [
  'ms-blog-article-1.html', 'ms-blog-article-2.html',
  'ms-blog-barometre-2022.html', 'ms-blog-barometre-2023.html', 'ms-blog-barometre-2024.html',
  'ms-blog-barometre-2025.html', 'ms-blog-barometre-2026-t1.html', 'ms-blog-barometre-2026-t2.html',
  'ms-blog-barometre-2026-t3.html',
];

test('chaque page article charge le CSS partagé chantier-sections.css', () => {
  for (const page of ARTICLES) {
    assert.match(readFileSync(page, 'utf8'), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/, `${page} doit charger chantier-sections.css`);
  }
});

test('chaque page article insère une bannière photo avant .article-meta, dans le header hero', () => {
  for (const page of ARTICLES) {
    const source = readFileSync(page, 'utf8');
    const headerIdx = source.indexOf('<header class="hero">');
    assert.ok(headerIdx > -1, `${page}: header hero introuvable`);
    const bannerIdx = source.indexOf('<div class="photo-ph article-banner">', headerIdx);
    const metaIdx = source.indexOf('<div class="article-meta">', headerIdx);
    assert.ok(bannerIdx > headerIdx && bannerIdx < metaIdx, `${page}: la bannière doit être entre <header class="hero"> et .article-meta`);
  }
});

test('chaque page article observe .photo-ph via un observer dédié (classe .in)', () => {
  for (const page of ARTICLES) {
    const source = readFileSync(page, 'utf8');
    assert.match(source, /document\.querySelectorAll\('\.photo-ph'\)\.forEach\(el => photoObs\.observe\(el\)\);/, `${page} doit observer .photo-ph`);
  }
});
