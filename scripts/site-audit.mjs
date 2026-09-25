// Audit qualité + SEO du site statique, sans dépendance.
// Usage : node scripts/site-audit.mjs [--json chemin.json]
// Sortie : rapport Markdown sur stdout (et JSON complet si --json).
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_MAX_BYTES = 300 * 1024;
const STALE_DAYS = 180;
// Pages volontairement hors sitemap (robots.txt Disallow, remerciements, variantes A/B).
// Les pages en meta robots noindex sont aussi exclues.
const SITEMAP_EXCLUDE = /^(index-b|merci-.*)\.html$/;

const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'is'))?.[2];

function metaContent(html, key, value) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (attr(tag, key)?.toLowerCase() === value) return attr(tag, 'content');
  }
  return undefined;
}

function jsonLdBlocks(html) {
  const blocks = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      blocks.push(...(Array.isArray(data) ? data : data['@graph'] ?? [data]));
    } catch {
      blocks.push({ '@type': '__invalid__' });
    }
  }
  return blocks;
}

function isInternal(href) {
  return href && !/^(https?:|mailto:|tel:|javascript:|data:|#|\/\/)/i.test(href) && !href.includes('{');
}

export function resolveInternal(href, exists) {
  let path = href.split(/[?#]/)[0].replace(/^\.?\//, '');
  if (path === '') path = 'index.html';
  if (path.endsWith('/')) path += 'index.html';
  return exists(path) || exists(`${path}.html`);
}

// Analyse d'une page HTML. `exists(path)` dit si un fichier du site existe.
export function auditPage(name, html, { exists = () => true, today = new Date() } = {}) {
  const issues = [];
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = metaContent(html, 'name', 'description') ?? '';
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  const ld = jsonLdBlocks(html);
  const ldTypes = [...new Set(ld.flatMap((b) => [].concat(b['@type'] ?? [])))];
  const canonical = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) ?? [])[0];

  if (!title) issues.push({ check: 'title', msg: 'Balise <title> absente' });
  else if (title.length > 70) issues.push({ check: 'title', msg: `Title trop long (${title.length} car.)` });
  if (!description) issues.push({ check: 'description', msg: 'Meta description absente' });
  else {
    if (description.length > 160) issues.push({ check: 'description', msg: `Meta description trop longue (${description.length} car.)` });
    if (/(…|\.\.\.)$/.test(description.trim())) issues.push({ check: 'description', msg: 'Meta description tronquée (finit par « … »)' });
  }
  if (h1Count !== 1) issues.push({ check: 'h1', msg: `${h1Count} balise(s) <h1> au lieu d'une` });
  const noindex = /noindex/i.test(metaContent(html, 'name', 'robots') ?? '');
  // Une page noindex (légal, remerciement, landing pub) n'a besoin ni de JSON-LD ni de canonical.
  if (ld.length === 0 && !noindex) issues.push({ check: 'jsonld', msg: 'Aucune donnée structurée JSON-LD' });
  if (ldTypes.includes('__invalid__')) issues.push({ check: 'jsonld', msg: 'Bloc JSON-LD invalide (JSON illisible)' });
  if (!canonical && !noindex) issues.push({ check: 'canonical', msg: 'Pas de <link rel="canonical">' });

  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = attr(tag, 'src') ?? '';
    if (!attr(tag, 'width') || !attr(tag, 'height')) issues.push({ check: 'img-size', msg: `Image sans width/height : ${src.slice(0, 60)}` });
    if (src.startsWith('data:image') && src.length > 200) issues.push({ check: 'img-base64', msg: 'Image en base64 inline (placeholder ?)' });
  }

  const text = strip(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ''));
  const placeholder = text.match(/gabarit|donnée d'exemple|lorem ipsum|\bTODO\b|\bxxx\b/i);
  if (placeholder) issues.push({ check: 'placeholder', msg: `Texte provisoire visible : « ${placeholder[0]} »` });

  const broken = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\shref\s*=\s*(["'])(.*?)\1/gi)) {
    const href = m[2];
    if (isInternal(href) && !resolveInternal(href, exists)) broken.add(href);
  }
  for (const href of broken) issues.push({ check: 'broken-link', msg: `Lien interne cassé : ${href}` });

  const dates = ld.map((b) => b.dateModified ?? b.datePublished).filter(Boolean).map((d) => new Date(d)).filter((d) => !isNaN(d));
  const lastDate = dates.length ? new Date(Math.max(...dates)) : null;
  const ageDays = lastDate ? Math.floor((today - lastDate) / 86_400_000) : null;
  if (ageDays !== null && ageDays > STALE_DAYS) issues.push({ check: 'stale', msg: `Contenu daté de ${ageDays} jours (dateModified/datePublished)` });

  return { page: name, title, descriptionLength: description.length, h1Count, jsonLdTypes: ldTypes, lastDate: lastDate?.toISOString().slice(0, 10) ?? null, issues };
}

export function sitemapPaths(xml) {
  return [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map((m) => {
    const path = new URL(m[1]).pathname.replace(/^\//, '');
    return path === '' ? 'index.html' : path;
  });
}

export function auditSite(root = ROOT, { today = new Date() } = {}) {
  const exists = (p) => existsSync(join(root, p));
  const pages = readdirSync(root).filter((f) => f.endsWith('.html')).sort();
  const pageResults = pages.map((p) => auditPage(p, readFileSync(join(root, p), 'utf8'), { exists, today }));
  const site = [];

  if (exists('sitemap.xml')) {
    const listed = sitemapPaths(readFileSync(join(root, 'sitemap.xml'), 'utf8'));
    for (const p of listed) if (!resolveInternal(p, exists)) site.push({ check: 'sitemap', msg: `URL du sitemap sans fichier : ${p}` });
    const listedSet = new Set(listed.map((p) => (p.endsWith('.html') ? p : `${p}.html`)));
    const noindex = (p) => /noindex/i.test(metaContent(readFileSync(join(root, p), 'utf8'), 'name', 'robots') ?? '');
    for (const p of pages) if (!listedSet.has(p) && !SITEMAP_EXCLUDE.test(p) && !noindex(p)) site.push({ check: 'sitemap', msg: `Page absente du sitemap : ${p}` });
  } else site.push({ check: 'sitemap', msg: 'sitemap.xml absent' });

  if (!exists('llms.txt')) site.push({ check: 'llms', msg: 'llms.txt absent' });
  if (!exists('robots.txt') || !/^Sitemap:/m.test(readFileSync(join(root, 'robots.txt'), 'utf8'))) site.push({ check: 'robots', msg: 'robots.txt absent ou sans ligne Sitemap' });

  const hosts = new Set();
  for (const p of pages) {
    const html = readFileSync(join(root, p), 'utf8');
    for (const m of html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["'](https?:\/\/[^/"']+)/gi)) hosts.add(new URL(m[1]).host);
    for (const m of html.matchAll(/property=["']og:url["'][^>]*content=["'](https?:\/\/[^/"']+)/gi)) hosts.add(new URL(m[1]).host);
  }
  if (exists('sitemap.xml')) for (const m of readFileSync(join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>\s*(https?:\/\/[^/<]+)/g)) hosts.add(new URL(m[1]).host);
  if (hosts.size > 1) site.push({ check: 'domain', msg: `Plusieurs domaines déclarés : ${[...hosts].join(', ')}` });

  const heavyAssets = [];
  if (exists('assets')) {
    for (const f of readdirSync(join(root, 'assets'))) {
      if (!/\.(webp|jpe?g|png|gif|avif)$/i.test(f)) continue;
      const size = statSync(join(root, 'assets', f)).size;
      if (size > ASSET_MAX_BYTES) heavyAssets.push({ file: f, kb: Math.round(size / 1024) });
    }
  }
  for (const a of heavyAssets) site.push({ check: 'asset-weight', msg: `Image > 300 Ko : ${a.file} (${a.kb} Ko)` });

  const pageIssueCount = pageResults.reduce((n, r) => n + r.issues.length, 0);
  const byCheck = {};
  for (const i of [...site, ...pageResults.flatMap((r) => r.issues)]) byCheck[i.check] = (byCheck[i.check] ?? 0) + 1;

  return {
    date: today.toISOString().slice(0, 10),
    summary: { pages: pages.length, pagesWithIssues: pageResults.filter((r) => r.issues.length).length, pageIssues: pageIssueCount, siteIssues: site.length, byCheck },
    site,
    pages: pageResults,
  };
}

export function toMarkdown(report) {
  const { summary } = report;
  const lines = [
    `# Audit site MS — ${report.date}`,
    '',
    `- Pages analysées : **${summary.pages}**`,
    `- Pages avec au moins un problème : **${summary.pagesWithIssues}**`,
    `- Problèmes page : **${summary.pageIssues}** · problèmes site : **${summary.siteIssues}**`,
    '',
    '## Par type de problème',
    '',
    '| Contrôle | Nombre |',
    '|---|---|',
    ...Object.entries(summary.byCheck).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`),
    '',
    '## Niveau site',
    '',
    ...(report.site.length ? report.site.map((i) => `- ${i.msg}`) : ['- Rien à signaler']),
    '',
    '## Par page',
    '',
  ];
  for (const r of report.pages.filter((p) => p.issues.length)) {
    lines.push(`### ${r.page}`, ...r.issues.map((i) => `- ${i.msg}`), '');
  }
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = auditSite();
  const jsonIdx = process.argv.indexOf('--json');
  if (jsonIdx !== -1) writeFileSync(process.argv[jsonIdx + 1], JSON.stringify(report, null, 2));
  console.log(toMarkdown(report));
}
