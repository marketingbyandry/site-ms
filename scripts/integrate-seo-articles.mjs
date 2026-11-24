// Génère les articles de content/seo-articles puis les référence dans blog.html
// et sitemap.xml. Idempotent : un slug déjà référencé est mis à jour.
// Usage : node scripts/integrate-seo-articles.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { buildAllArticles, defaultSourceDir } from './build-seo-articles.mjs';
import { ROOT } from './build-partials.mjs';

const esc = (t) => t.replace(/&/g, '&amp;');
const file = (name) => `${ROOT.replace(/\/$/, '')}/${name}`;
const manifestPath = file('content/seo-articles/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const results = buildAllArticles(defaultSourceDir(), ROOT);
const bySlug = new Map(results.map((r) => [r.slug, r]));

let blog = readFileSync(file('blog.html'), 'utf8');
let sitemap = readFileSync(file('sitemap.xml'), 'utf8');
for (const r of results) {
  const card = `    <a href="${r.slug}.html" class="res-mini reveal">
      <span class="res-mini-text">
        <span class="res-mini-title">${esc(r.title)}</span>
        <span class="res-mini-hook">${esc(r.blogExcerpt)}</span>
      </span>
      <span class="res-mini-read">${r.readingTime} min</span>
    </a>
`;
  if (blog.includes(`href="${r.slug}.html" class="res-mini`)) {
    blog = blog.replace(new RegExp(`    <a href="${r.slug}\\.html" class="res-mini[\\s\\S]*?</a>\\n`), () => card);
  } else {
    const label = blog.indexOf(`>${esc(r.category)}</p>`);
    if (label < 0) throw new Error(`Catégorie absente de blog.html : ${r.category}`);
    const marker = '<div class="res-mini-grid">\n';
    const at = blog.indexOf(marker, label) + marker.length;
    blog = blog.slice(0, at) + card + blog.slice(at);
  }
  if (!sitemap.includes(`/${r.slug}.html<`)) {
    sitemap = sitemap.replace('</urlset>', () => `  <url>\n    <loc>https://cabinetms.fr/${r.slug}.html</loc>\n    <lastmod>${r.datePublished}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n</urlset>`);
  } else {
    sitemap = sitemap.replace(new RegExp(`(/${r.slug}\\.html</loc>\\s*<lastmod>)[^<]*`), `$1${r.datePublished}`);
  }
}
writeFileSync(file('blog.html'), blog);
writeFileSync(file('sitemap.xml'), sitemap);

for (const item of manifest.items) if (bySlug.has(item.slug)) item.status = 'done';
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`${results.length} articles intégrés`);
