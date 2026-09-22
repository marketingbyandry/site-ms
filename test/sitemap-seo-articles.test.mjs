// test/sitemap-seo-articles.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORY_BY_SLUG } from '../scripts/build-seo-articles.mjs';

const SLUGS = Object.keys(CATEGORY_BY_SLUG);

test('sitemap.xml référence les 52 pages articles SEO avec le format attendu', () => {
  const sitemap = readFileSync('sitemap.xml', 'utf8');
  for (const slug of SLUGS) {
    const entryRe = new RegExp(
      `<url>\\s*<loc>https://cabinetms\\.fr/${slug}\\.html</loc>\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>\\s*<changefreq>\\w+</changefreq>\\s*<priority>[0-9.]+</priority>\\s*</url>`,
    );
    assert.match(sitemap, entryRe, `sitemap.xml doit référencer ${slug}.html avec lastmod/changefreq/priority`);
  }
});

test('sitemap.xml reste un document XML bien formé', () => {
  const sitemap = readFileSync('sitemap.xml', 'utf8');
  const opens = (sitemap.match(/<url>/g) || []).length;
  const closes = (sitemap.match(/<\/url>/g) || []).length;
  assert.equal(opens, closes, 'chaque <url> doit être fermé');
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
});
