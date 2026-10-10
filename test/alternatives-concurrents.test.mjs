// test/alternatives-concurrents.test.mjs
// Pages « alternative à <concurrent> » (SEO comparatif, publicité comparative L122-1 s. Code conso).
// Chaque page de ALTERNATIVES doit passer tous les tests ci-dessous.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { read, norm, titleOf, metaOf, h1Of, ldTypes, ldNodes, faqVisible, faqLd, TARGETS } from './helpers/seo-html.mjs';

// minWords : voir docs/alternatives/<dir>/serp.md (max(1200, round(0.8 x médiane SERP))).
export const ALTERNATIVES = {
  'alternative-selectra-professionnel.html': { name: 'Selectra', dir: 'selectra', minWords: 1200 },
  'alternative-opera-energie-professionnel.html': { name: 'Opéra Énergie', dir: 'opera-energie', minWords: 1200 },
};

export const visibleText = (h) => norm(
  h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '),
);
export const mainWords = (h) => {
  const m = h.match(/<article[\s\S]*?<\/article>/i);
  return m ? visibleText(m[0]).split(' ').filter(Boolean).length : 0;
};

// Lecture avec message clair si la page n'existe pas encore (pas de crash à l'import).
const load = (slug) => {
  assert.ok(existsSync(slug), `ENOENT : page manquante ${slug}`);
  return read(slug);
};
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const each = (label, fn) => {
  for (const [slug, cfg] of Object.entries(ALTERNATIVES)) {
    test(`${slug} : ${label}`, () => fn(load(slug), { slug, ...cfg }));
  }
};

each('title : ≤ 60 car., nom du concurrent, sans « meilleure »', (h, { name }) => {
  assert.ok(titleOf(h).length <= 60, `title = ${titleOf(h)} (${titleOf(h).length})`);
  assert.ok(norm(titleOf(h)).includes(norm(name)));
  assert.doesNotMatch(norm(titleOf(h)), /meilleure/);
});

each('meta : ≤ 155 car., nom + « professionnel », sans « meilleure alternative »', (h, { name }) => {
  assert.ok(metaOf(h).length > 0 && metaOf(h).length <= 155, `meta = ${metaOf(h)} (${metaOf(h).length})`);
  assert.ok(norm(metaOf(h)).includes(norm(name)));
  assert.ok(norm(metaOf(h)).includes('professionnel'));
  assert.doesNotMatch(norm(metaOf(h)), /meilleure alternative/);
});

each('H1 unique contenant « alternative a <nom> »', (h, { name }) => {
  assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
  assert.ok(norm(h1Of(h)).includes(`alternative a ${norm(name)}`), `h1 = ${h1Of(h)}`);
});

each('canonical exact', (h, { slug }) => {
  assert.ok(h.includes(`<link rel="canonical" href="https://cabinetms.fr/${slug}">`));
});

each('JSON-LD : Article, FAQPage, BreadcrumbList ; ni Review ni AggregateRating', (h) => {
  const types = ldTypes(h);
  for (const t of ['Article', 'FAQPage', 'BreadcrumbList']) assert.ok(types.includes(t), `${t} absent (${types})`);
  for (const t of ['Review', 'AggregateRating']) assert.ok(!types.includes(t), `${t} interdit`);
  assert.doesNotMatch(h, /"@type"\s*:\s*"(Review|AggregateRating)"/);
});

each('réponse directe : section.answer-first de 40 à 60 mots', (h) => {
  const m = h.match(/<section class="answer-first"[\s\S]*?<\/section>/);
  assert.ok(m, 'section.answer-first manquante');
  const n = words(visibleText(m[0]));
  assert.ok(n >= 40 && n <= 60, `40 à 60 mots attendus, trouvé ${n}`);
});

each('H2 « quand <nom> peut mieux vous convenir » présent', (h, { name }) => {
  const h2s = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => norm(m[1].replace(/<[^>]+>/g, '')));
  assert.ok(h2s.some((t) => t.includes(`quand ${norm(name)} peut mieux vous convenir`)), h2s.join(' | '));
});

each('tableau : .tbl-scroll > table.alt-compare, ≥ 6 lignes, cellule concurrent sourcée', (h) => {
  assert.match(h, /<div class="tbl-scroll">\s*<table class="alt-compare"/, 'div.tbl-scroll > table.alt-compare manquant');
  const tbl = h.match(/<table class="alt-compare"[\s\S]*?<\/table>/)[0];
  const tbody = (tbl.match(/<tbody[\s\S]*?<\/tbody>/) || [''])[0];
  const rows = [...tbody.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((m) => m[0]);
  assert.ok(rows.length >= 6, `≥ 6 lignes attendues, trouvé ${rows.length}`);
  rows.forEach((r, i) => {
    const td = [...r.matchAll(/<td[\s\S]*?<\/td>/g)].map((m) => m[0])[1] || '';
    assert.ok(/href="https?:\/\//.test(td) || norm(td).includes('non communique'), `ligne ${i + 1} : cellule concurrent non sourcée`);
  });
});

each('mention « informations sur <nom> vérifiées le JJ/MM/AAAA » = dateModified, pas dans le futur', (h, { name }) => {
  const p = (h.match(/<p class="alt-verified">([\s\S]*?)<\/p>/) || [])[1];
  assert.ok(p, 'p.alt-verified manquant');
  const m = norm(p.replace(/<[^>]+>/g, '')).match(new RegExp(`informations sur ${norm(name)} verifiees le (\\d{2})/(\\d{2})/(\\d{4})`));
  assert.ok(m, `mention absente : ${p}`);
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const art = ldNodes(h).find((o) => [o['@type']].flat().includes('Article'));
  assert.ok(art, 'Article absent');
  assert.equal(String(art.dateModified).slice(0, 10), iso, 'dateModified ≠ date de vérification');
  assert.ok(iso <= new Date().toISOString().slice(0, 10), 'date dans le futur');
});

each('FAQ : 5 ou 6 questions, visibles = JSON-LD', (h) => {
  const v = faqVisible(h);
  assert.ok(v.length === 5 || v.length === 6, `5 ou 6 questions attendues, trouvé ${v.length}`);
  assert.deepEqual(faqLd(h), v);
});

each('au moins 2 CTA vers b2b.html#upload', (h) => {
  assert.ok((h.match(/href="b2b\.html#upload"/g) || []).length >= 2);
});

each('mots interdits absents du texte visible', (h) => {
  const t = visibleText(h);
  assert.doesNotMatch(t, /le meilleur|le moins cher|imbattable|arnaque/);
  for (const m of t.matchAll(/garanti/g)) {
    const around = t.slice(Math.max(0, m.index - 60), m.index + 60 + 7);
    assert.ok(around.includes('coupure'), `« garanti » sans « coupure » à ≤ 60 car. : …${around}…`);
  }
});

each('chaque « meilleure alternative » est suivi de « pour » dans les 80 caractères', (h) => {
  const t = visibleText(h);
  for (const m of t.matchAll(/meilleure alternative/g)) {
    const after = t.slice(m.index + 'meilleure alternative'.length, m.index + 'meilleure alternative'.length + 80);
    assert.match(after, /\bpour\b/, `« meilleure alternative » sans « pour » : ${after}`);
  }
});

each('aucune <img> dont src ou alt contient le nom du concurrent', (h, { name }) => {
  for (const [tag] of h.matchAll(/<img\b[^>]*>/gi)) {
    const src = (tag.match(/\bsrc="([^"]*)"/i) || [])[1] || '';
    const alt = (tag.match(/\balt="([^"]*)"/i) || [])[1] || '';
    assert.ok(!norm(`${src} ${alt}`).includes(norm(name)), `img interdite : ${tag}`);
  }
});

each('contenu principal ≥ minWords', (h, { minWords }) => {
  assert.ok(mainWords(h) >= minWords, `${mainWords(h)} mots < ${minWords}`);
});

each('dossier de preuves : faits.md, serp.md, note-avocat.md et au moins une capture', (h, { dir }) => {
  const base = `docs/alternatives/${dir}`;
  for (const f of ['faits.md', 'serp.md', 'note-avocat.md']) assert.ok(existsSync(`${base}/${f}`), `${base}/${f} manquant`);
  assert.ok(existsSync(`${base}/captures`) && readdirSync(`${base}/captures`).length >= 1, `${base}/captures vide`);
});

each('anti-cannibalisation : aucun mot-clé de TARGETS dans le title', (h) => {
  for (const { key } of Object.values(TARGETS)) assert.ok(!norm(titleOf(h)).includes(key), `title contient « ${key} »`);
});

test('.vercelignore exclut docs/ (dossiers de preuves non déployés)', () => {
  const lines = read('.vercelignore').split(/\r?\n/).map((l) => l.trim());
  assert.ok(lines.includes('docs/'), '.vercelignore doit contenir « docs/ »');
});
