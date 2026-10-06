import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPage, sitemapPaths, resolveInternal, auditSite } from '../scripts/site-audit.mjs';

const clean = `<html><head>
<title>Courtier énergie pro | M&S Strategy</title>
<meta name="description" content="Un courtier indépendant qui renégocie vos contrats d'électricité et de gaz professionnels.">
<link rel="canonical" href="https://cabinetms.fr/x.html">
<script type="application/ld+json">{"@type":"Article","datePublished":"2026-09-01"}</script>
</head><body><h1>Titre</h1><img src="a.webp" width="10" height="10"><a href="b2b.html#faq">B2B</a></body></html>`;

const checks = (r) => r.issues.map((i) => i.check);

test('auditPage : une page propre ne remonte aucun problème', () => {
  const r = auditPage('x.html', clean, { today: new Date('2026-09-25') });
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.jsonLdTypes, ['Article']);
});

test('auditPage : détecte description tronquée, h1 multiples, image sans dimensions, lien cassé, placeholder', () => {
  const html = clean
    .replace('professionnels.', 'professionnels, et plus encore…')
    .replace('<h1>Titre</h1>', '<h1>A</h1><h1>B</h1><p>donnée d\'exemple</p>')
    .replace('width="10" height="10"', '')
    .replace('b2b.html#faq', 'inexistant.html');
  const r = auditPage('x.html', html, { exists: (p) => p === 'b2b.html', today: new Date('2026-09-25') });
  for (const c of ['description', 'h1', 'img-size', 'broken-link', 'placeholder']) assert.ok(checks(r).includes(c), c);
});

test('auditPage : signale un contenu daté de plus de 180 jours et l\'absence de JSON-LD', () => {
  assert.ok(checks(auditPage('x.html', clean, { today: new Date('2027-06-01') })).includes('stale'));
  const noLd = clean.replace(/<script type="application\/ld\+json">.*?<\/script>/, '');
  assert.ok(checks(auditPage('x.html', noLd)).includes('jsonld'));
});

test('sitemapPaths et resolveInternal gèrent la racine et les ancres', () => {
  assert.deepEqual(sitemapPaths('<loc>https://cabinetms.fr/</loc><loc>https://cabinetms.fr/b2b.html</loc>'), ['index.html', 'b2b.html']);
  const exists = (p) => ['index.html', 'blog.html'].includes(p);
  assert.ok(resolveInternal('/', exists));
  assert.ok(resolveInternal('blog.html?x=1#top', exists));
  assert.ok(!resolveInternal('nope.html', exists));
});

test('auditSite : le vrai site n\'a ni lien interne cassé ni placeholder visible', () => {
  const report = auditSite();
  const issues = report.pages.flatMap((p) => p.issues.map((i) => `${p.page}: ${i.msg}`));
  assert.deepEqual(issues.filter((i) => /Lien interne cassé|Texte provisoire|JSON-LD invalide/.test(i)), []);
});

test('auditPage : une page noindex n\'exige ni JSON-LD ni canonical', () => {
  const html = clean
    .replace(/<script type="application\/ld\+json">.*?<\/script>/, '')
    .replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex, follow">');
  const c = checks(auditPage('cgv.html', html));
  assert.ok(!c.includes('jsonld') && !c.includes('canonical'), c.join(','));
});
