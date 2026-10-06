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

// ---------- Tâches 2 et 3 : pages de service ----------
const SERVICE_PAGES = {
  'courtier-electricite-professionnel.html': {
    mustLink: ['b2b.html', 'courtier-gaz-professionnel.html', 'turpe-2026-professionnels.html',
      'prix-fixe-vs-indexe-electricite-pro.html', 'puissance-souscrite-entreprise-kva.html',
      'vnu-2026-versement-nucleaire-universel.html', 'comparatif-fournisseurs-electricite-pro.html',
      'tarif-electricite-professionnel-paris.html'],
    terms: ['c5', 'c4', 'puissance souscrite', 'turpe', 'accise', 'arenh', 'prix fixe', 'indexe'],
  },
  'courtier-gaz-professionnel.html': {
    mustLink: ['b2b.html', 'courtier-electricite-professionnel.html', 'accise-electricite-gaz-2026.html',
      'gaz-professionnel-paris.html'],
    terms: ['t1', 't4', 'peg', 'ttf', 'accise', 'cta', 'echeance'],
  },
};

for (const [file, spec] of Object.entries(SERVICE_PAGES)) {
  test(`${file} : existe, title/meta/H1 ciblés`, { skip: !existsSync(file) && 'page pas encore créée' }, () => {
    const h = read(file);
    assert.ok(norm(titleOf(h)).includes(TARGETS[file].key), `title = ${titleOf(h)}`);
    assert.ok(norm(metaOf(h)).includes(TARGETS[file].key.replace(' professionnel', '')), `meta = ${metaOf(h)}`);
    assert.ok(norm(h1Of(h)).includes(TARGETS[file].h1), `h1 = ${h1Of(h)}`);
  });

  test(`${file} : JSON-LD Service + FAQPage (8 Q identiques) + BreadcrumbList`, { skip: !existsSync(file) && 'page pas encore créée' }, () => {
    const h = read(file);
    const types = ldTypes(h);
    for (const t of ['Service', 'FAQPage', 'BreadcrumbList', 'Organization']) assert.ok(types.includes(t), `${t} manquant`);
    assert.equal(faqVisible(h).length, 8);
    assert.deepEqual(faqLd(h), faqVisible(h));
    assert.match(h, /<link rel="canonical" href="https:\/\/cabinetms\.fr\/[a-z-]+\.html">/);
    assert.match(h, /<script type="module" src="assets\/site-search\.js"><\/script>/);
  });

  test(`${file} : contenu spécifique (≥ 1 200 mots, termes techniques) et liens sortants`, { skip: !existsSync(file) && 'page pas encore créée' }, () => {
    const h = read(file);
    const main = h.slice(h.indexOf('<section class="phero">'), h.lastIndexOf('</main>') > 0 ? h.lastIndexOf('</main>') : h.indexOf('<footer'));
    const text = norm(main.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' '));
    const words = text.split(' ').filter(Boolean).length;
    assert.ok(words >= 1200, `≥ 1 200 mots attendus, trouvé ${words}`);
    for (const t of spec.terms) assert.ok(text.includes(t), `terme « ${t} » absent`);
    for (const href of spec.mustLink) assert.ok(hasLink(h, href), `lien vers ${href} manquant`);
    // Les liens « Pour aller plus loin » (service-rel) citent légitimement des pages villes.
    const sansMaillage = norm(main.replace(/<section class="city-rel service-rel">[\s\S]*?<\/section>/, '').replace(/<[^>]+>/g, ' '));
    assert.doesNotMatch(sansMaillage, /toulouse|blagnac|colomiers/, 'reste du gabarit ville');
  });
}

// ---------- Tâche 4 : articles ----------
export const ARTICLES = ['courtier-energie-gratuit-remuneration', 'courtier-ou-comparateur-energie-pro',
  'choisir-courtier-energie-criteres-pieges', 'courtage-energie-tpe-pme'];

for (const slug of ARTICLES) {
  test(`article ${slug} : généré, lié à b2b, source versionnée, listé dans blog.html`, () => {
    assert.ok(existsSync(`${slug}.html`), `${slug}.html absent`);
    assert.ok(existsSync(`content/seo-courtier/${slug}.md`), 'copie markdown versionnée absente');
    const h = read(`${slug}.html`);
    assert.ok(hasLink(h, 'b2b.html'), 'lien vers b2b.html manquant');
    const words = h.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 1200, `≥ 1 200 mots attendus, trouvé ${words}`);
    for (const t of Object.values(TARGETS)) assert.ok(!norm(titleOf(h)).includes(t.key), `title cannibalise « ${t.key} »`);
    assert.ok(hasLink(read('blog.html'), `${slug}.html`), 'absent de blog.html');
  });
}

// ---------- Tâche 5 : maillage ----------
const CITIES = ['paris', 'lille', 'strasbourg', 'lyon', 'rennes', 'nantes', 'bordeaux', 'toulouse', 'montpellier', 'marseille'];

test('triangle des pages de service', () => {
  const b2b = read('b2b.html');
  assert.ok(hasLink(b2b, 'courtier-electricite-professionnel.html'));
  assert.ok(hasLink(b2b, 'courtier-gaz-professionnel.html'));
  for (const slug of ARTICLES) assert.ok(hasLink(b2b, `${slug}.html`), `b2b.html → ${slug}`);
});

test('pages villes → pages de service', () => {
  for (const c of CITIES) {
    const courtier = read(`courtier-energie-${c}.html`);
    assert.ok(hasLink(courtier, 'b2b.html'), `courtier-energie-${c} → b2b`);
    assert.ok(hasLink(courtier, 'courtier-electricite-professionnel.html'), `courtier-energie-${c} → électricité`);
    assert.ok(hasLink(read(`gaz-professionnel-${c}.html`), 'courtier-gaz-professionnel.html'), `gaz-professionnel-${c} → gaz`);
    assert.ok(hasLink(read(`tarif-electricite-professionnel-${c}.html`), 'courtier-electricite-professionnel.html'), `tarif-${c} → électricité`);
  }
});

test('articles existants proches → page de service', () => {
  const map = {
    'courtier-en-energie-role.html': 'b2b.html',
    'comparatif-fournisseurs-electricite-pro.html': 'courtier-electricite-professionnel.html',
    'prix-fixe-vs-indexe-electricite-pro.html': 'courtier-electricite-professionnel.html',
    'resilier-contrat-electricite-entreprise.html': 'courtier-electricite-professionnel.html',
    'decrypter-facture-electricite-pro.html': 'courtier-electricite-professionnel.html',
    'turpe-2026-professionnels.html': 'courtier-electricite-professionnel.html',
    'achat-groupe-energie-pme-franchises.html': 'b2b.html',
  };
  for (const [file, href] of Object.entries(map)) assert.ok(hasLink(read(file), href), `${file} → ${href}`);
});

test('courtier-en-energie-role.html recentré sur la définition', () => {
  assert.match(norm(titleOf(read('courtier-en-energie-role.html'))), /^qu'est-ce qu'un courtier en energie/);
});

test('aucune ancre « cliquez ici » sur les liens du chantier', () => {
  for (const f of ['b2b.html', 'courtier-electricite-professionnel.html', 'courtier-gaz-professionnel.html', ...ARTICLES.map((s) => `${s}.html`)]) {
    assert.doesNotMatch(norm(read(f)), />\s*(cliquez ici|en savoir plus)\s*</, f);
  }
});
