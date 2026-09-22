// test/seo-articles-pages.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CATEGORY_BY_SLUG } from '../scripts/build-seo-articles.mjs';

const SLUGS = Object.keys(CATEGORY_BY_SLUG);

test('les 52 slugs du corpus SEO sont bien référencés', () => {
  assert.equal(SLUGS.length, 52);
});

test('chaque article SEO a une page HTML générée à la racine du dépôt', () => {
  for (const slug of SLUGS) {
    assert.ok(existsSync(`${slug}.html`), `${slug}.html doit exister`);
  }
});

test('chaque page article SEO utilise le placeholder photo nu (pas de vraie photo inventée)', () => {
  for (const slug of SLUGS) {
    const source = readFileSync(`${slug}.html`, 'utf8');
    assert.match(source, /<div class="photo-ph article-banner"><\/div>/, `${slug}.html doit utiliser le placeholder photo nu`);
    assert.doesNotMatch(source, /\.article-banner\{background:url/, `${slug}.html ne doit pas inventer de photo bannière`);
  }
});

test('chaque page article SEO charge le CSS partagé chantier-sections.css', () => {
  for (const slug of SLUGS) {
    const source = readFileSync(`${slug}.html`, 'utf8');
    assert.match(source, /<link rel="stylesheet" href="assets\/chantier-sections\.css">/, `${slug}.html doit charger chantier-sections.css`);
  }
});

test('chaque page article SEO déclare son canonical, son schema Article et son BreadcrumbList', () => {
  for (const slug of SLUGS) {
    const source = readFileSync(`${slug}.html`, 'utf8');
    assert.match(source, new RegExp(`<link rel="canonical" href="https://cabinetms\\.fr/${slug}\\.html">`), `${slug}.html doit déclarer son canonical`);
    assert.match(source, /"@type": "Article"/, `${slug}.html doit déclarer un schema Article`);
    assert.match(source, /"@type": "BreadcrumbList"/, `${slug}.html doit déclarer un BreadcrumbList`);
  }
});

test('chaque page article SEO pointe son CTA vers b2b.html#upload', () => {
  for (const slug of SLUGS) {
    const source = readFileSync(`${slug}.html`, 'utf8');
    assert.match(source, /<a href="b2b\.html#upload" class="cta-btn">/, `${slug}.html doit pointer son CTA vers b2b.html#upload`);
  }
});

test('blog.html contient un lien vers chacune des 52 pages articles SEO', () => {
  const blog = readFileSync('blog.html', 'utf8');
  for (const slug of SLUGS) {
    assert.match(blog, new RegExp(`href="${slug}\\.html"`), `blog.html doit lier vers ${slug}.html`);
  }
});

test('blog.html garde les 2 cartes vedettes existantes dans la section Analyses', () => {
  const blog = readFileSync('blog.html', 'utf8');
  assert.match(blog, /href="ms-blog-article-1\.html" class="res-card reveal"/);
  assert.match(blog, /href="ms-blog-article-2\.html" class="res-card reveal d1"/);
});
