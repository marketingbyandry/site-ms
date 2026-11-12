// test/article-banners-savee.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { CATEGORY_BY_SLUG } from '../scripts/build-seo-articles.mjs';
import { loadBannerManifest, applyBannerToHtml, bannerRule } from '../scripts/apply-article-banners.mjs';

const manifest = loadBannerManifest();
const LEGACY = new Set(['comparatif-fournisseurs-electricite-pro', 'droit-a-la-prise-copropriete']);

test('le manifeste couvre tous les articles SEO sans photo historique', () => {
  const expected = Object.keys(CATEGORY_BY_SLUG).filter((s) => !LEGACY.has(s)).sort();
  assert.deepEqual(manifest.articles.map((a) => a.slug).sort(), expected);
});

const done = manifest.articles.filter((a) => a.status === 'done');
const pending = manifest.articles.filter((a) => a.status !== 'done');

test('chaque entrée du manifeste a un statut done ou pending', () => {
  for (const a of manifest.articles) assert.ok(['done', 'pending'].includes(a.status), `${a.slug}: statut ${a.status}`);
  assert.ok(done.length >= 38, `au moins 38 articles illustrés (actuellement ${done.length})`);
});

test('un article encore pending garde le placeholder dégradé (aucune photo à moitié posée)', () => {
  for (const a of pending) {
    const source = readFileSync(`${a.slug}.html`, 'utf8');
    assert.doesNotMatch(source, /\.article-banner\{background:url/, `${a.slug}.html ne doit pas avoir de photo`);
    assert.equal(a.photo, undefined, `${a.slug}: pas de photo dans le manifeste`);
  }
});

test('chaque photo bannière existe, est un WebP de moins de 300 Ko et vient de Savee', () => {
  for (const a of done) {
    assert.match(a.photo, /^assets\/banners\/[a-z0-9-]+\.webp$/, `${a.slug}: chemin photo`);
    assert.ok(existsSync(a.photo), `${a.photo} doit exister`);
    assert.ok(statSync(a.photo).size < 300 * 1024, `${a.photo} doit peser moins de 300 Ko`);
    assert.match(a.savee_url, /^https:\/\/savee\.com\/i\//, `${a.slug}: source Savee tracée`);
  }
});

test('deux articles ne partagent jamais la même photo', () => {
  const photos = done.map((a) => a.photo);
  assert.equal(new Set(photos).size, photos.length);
});

test('chaque page article porte sa règle bannière dans le <style> inline, une seule fois', () => {
  for (const a of done) {
    const source = readFileSync(`${a.slug}.html`, 'utf8');
    const inline = source.slice(source.indexOf('<style>'), source.indexOf('</style>'));
    assert.ok(inline.includes(bannerRule(a)), `${a.slug}.html doit contenir ${bannerRule(a)}`);
    assert.equal(source.split('.article-banner{background:url').length - 1, 1, `${a.slug}.html: une seule règle bannière`);
    assert.match(source, /<div class="photo-ph article-banner"><\/div>/);
  }
});

test('applyBannerToHtml est idempotent et remplace l’ancienne photo', () => {
  const html = '<style>body{}</style>';
  const a = { photo: 'assets/banners/a.webp', pos_y: '40%' };
  const once = applyBannerToHtml(html, a);
  assert.equal(applyBannerToHtml(once, a), once);
  const swapped = applyBannerToHtml(once, { photo: 'assets/banners/b.webp' });
  assert.ok(swapped.includes('assets/banners/b.webp') && !swapped.includes('assets/banners/a.webp'));
  assert.equal(applyBannerToHtml(html, null), html);
});
