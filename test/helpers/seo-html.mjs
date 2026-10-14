// Helpers HTML partagés par les suites SEO (extraits de seo-courtier-pro.test.mjs).
import { readFileSync } from 'node:fs';

export const read = (f) => readFileSync(f, 'utf8');
export const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|’/g, "'").replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&nbsp;/g, ' ');
export const titleOf = (h) => decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
export const metaOf = (h) => decode((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
export const h1Of = (h) => decode(((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, ' '));
export const ldNodes = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((m) => JSON.parse(m[1])).flatMap((o) => o['@graph'] || [o]);
export const ldTypes = (h) => ldNodes(h).map((o) => o['@type']).flat();
export const faqVisible = (h) => [...h.matchAll(/<div class="faq-q">([\s\S]*?)<span class="faq-arr">/g)]
  .map((m) => norm(m[1].replace(/<[^>]+>/g, '')));
export const faqLd = (h) => {
  const f = ldNodes(h).find((o) => o['@type'] === 'FAQPage');
  return f ? f.mainEntity.map((q) => norm(q.name)) : [];
};
export const hasLink = (h, href) => new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(#[^"]*)?"`).test(h);

// Mot-clé principal réservé (title + meta) et forme attendue dans le H1, par page cible.
export const TARGETS = {
  'b2b.html': { key: 'courtier en energie pro', h1: 'courtier en energie pour professionnels' },
  'courtier-electricite-professionnel.html': { key: 'courtier electricite professionnel', h1: 'courtier en electricite' },
  'courtier-gaz-professionnel.html': { key: 'courtier gaz professionnel', h1: 'courtier gaz' },
};
