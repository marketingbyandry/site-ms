// test/seo-courtier-pro.test.mjs
// Chantier SEO « courtier » vague 1 — spec docs/superpowers/specs/2026-10-06-seo-courtier-pro-design.md
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

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

// ---------- Tâche 1 : b2b.html ----------
test('b2b.html : title, meta et H1 portent le mot-clé pro', () => {
  const h = read('b2b.html');
  assert.ok(norm(titleOf(h)).includes(TARGETS['b2b.html'].key), `title = ${titleOf(h)}`);
  assert.ok(norm(metaOf(h)).includes('courtier en energie pro'), `meta = ${metaOf(h)}`);
  assert.ok(norm(h1Of(h)).includes(TARGETS['b2b.html'].h1), `h1 = ${h1Of(h)}`);
  assert.doesNotMatch(h, /<h1 class="sr-only"/, 'le H1 doit être visible');
});

test('b2b.html : H2 formulés comme des requêtes', () => {
  const h2s = [...read('b2b.html').matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => norm(m[1].replace(/<[^>]+>/g, '')));
  assert.ok(h2s.some((t) => t.includes('comment travaille un courtier en energie pour entreprise')), h2s.join(' | '));
  assert.ok(h2s.some((t) => t.includes('courtier energie pro, comparateur ou achat en direct')), h2s.join(' | '));
  assert.ok(h2s.some((t) => t.includes('questions frequentes sur le courtage en energie pro')), h2s.join(' | '));
});

test('b2b.html : bloc réponse d\'abord avec définition et liens électricité/gaz', () => {
  const h = read('b2b.html');
  const m = h.match(/<section class="answer-first"[\s\S]*?<\/section>/);
  assert.ok(m, 'section.answer-first manquante');
  const block = m[0];
  assert.match(norm(block), /un courtier en energie pro est/);
  assert.match(norm(block), /remunere par les fournisseurs/);
  assert.ok(hasLink(block, 'courtier-electricite-professionnel.html'));
  assert.ok(hasLink(block, 'courtier-gaz-professionnel.html'));
  const words = block.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 220 && words <= 400, `~300 mots attendus, trouvé ${words}`);
});

test('b2b.html : FAQ de 8 questions identique au JSON-LD', () => {
  const h = read('b2b.html');
  const visible = faqVisible(h);
  assert.equal(visible.length, 8, `8 questions visibles attendues, trouvé ${visible.length}`);
  assert.deepEqual(faqLd(h), visible);
});
