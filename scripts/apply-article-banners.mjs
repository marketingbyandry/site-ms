// scripts/apply-article-banners.mjs
//
// Pose la photo bannière (source Savee) de chaque article SEO listé dans
// data/article-banners.json : une règle `.article-banner{background:url(...)}`
// ajoutée en fin du <style> inline de la page. Idempotent : relancer le script
// remplace le bloc existant au lieu de le dupliquer.
//
// Usage : node scripts/apply-article-banners.mjs
// Le générateur d'articles (build-seo-articles.mjs) appelle aussi
// applyBannerToHtml, pour qu'une régénération ne perde pas les photos.

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

export const MANIFEST_PATH = new URL('../data/article-banners.json', import.meta.url);

const MARK = '/* ── BANNIÈRE (photo Savee, data/article-banners.json) ── */';
const BLOCK_RE = /\n\/\* ── BANNIÈRE \(photo Savee, data\/article-banners\.json\) ── \*\/\n\.article-banner\{[^}]*\}\n/;

export function loadBannerManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

/** Retourne l'entrée « done » du manifeste pour ce slug, ou null. */
export function bannerFor(slug, manifest = loadBannerManifest()) {
  const entry = manifest.articles.find((a) => a.slug === slug);
  return entry && entry.status === 'done' && entry.photo ? entry : null;
}

export function bannerRule(entry) {
  return `.article-banner{background:url("${entry.photo}") center ${entry.pos_y || '50%'}/cover no-repeat}`;
}

/** Insère (ou remplace) la règle bannière dans le premier <style> inline. */
export function applyBannerToHtml(html, entry) {
  if (!entry) return html;
  const block = `\n${MARK}\n${bannerRule(entry)}\n`;
  if (BLOCK_RE.test(html)) return html.replace(BLOCK_RE, block);
  const close = html.indexOf('</style>');
  if (close === -1) throw new Error('Aucun </style> inline où poser la bannière');
  return html.slice(0, close) + block + html.slice(close);
}

export function applyAll(rootDir, manifest = loadBannerManifest()) {
  const applied = [];
  for (const entry of manifest.articles) {
    if (entry.status !== 'done') continue;
    const file = path.join(rootDir, `${entry.slug}.html`);
    const html = readFileSync(file, 'utf8');
    const next = applyBannerToHtml(html, entry);
    if (next !== html) writeFileSync(file, next);
    applied.push(entry.slug);
  }
  return applied;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const applied = applyAll(root);
  console.log(`Bannière posée sur ${applied.length} articles`);
}
