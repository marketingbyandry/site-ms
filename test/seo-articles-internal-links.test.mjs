// test/seo-articles-internal-links.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { CATEGORY_BY_SLUG } from '../scripts/build-seo-articles.mjs';

const SLUGS = new Set(Object.keys(CATEGORY_BY_SLUG));

test('aucun lien interne ".ilink" des 52 articles SEO ne pointe vers une page inexistante', () => {
  for (const slug of SLUGS) {
    const source = readFileSync(`${slug}.html`, 'utf8');
    const linkRe = /href="([a-z0-9-]+)\.html" class="ilink"/g;
    let match;
    let found = 0;
    while ((match = linkRe.exec(source)) !== null) {
      found++;
      const target = match[1];
      assert.ok(existsSync(`${target}.html`), `${slug}.html: lien interne cassé vers ${target}.html`);
    }
    // Chaque article du corpus contient au moins un lien interne markdown d'après le brief.
    assert.ok(found >= 1, `${slug}.html devrait contenir au moins un lien interne .ilink`);
  }
});

test('aucun article SEO ne fait de lien interne vers lui-même', () => {
  for (const slug of SLUGS) {
    const source = readFileSync(`${slug}.html`, 'utf8');
    const selfLinkRe = new RegExp(`href="${slug}\\.html" class="ilink"`);
    assert.doesNotMatch(source, selfLinkRe, `${slug}.html ne doit pas pointer vers lui-même`);
  }
});
