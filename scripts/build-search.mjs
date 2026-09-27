// Génère l'index de recherche du site :
//   - pagefind/                  index Pagefind (chargé à la demande par assets/site-search.js)
//   - assets/search-lexicon.json vocabulaire du site, utilisé pour corriger les fautes de frappe
//
// Usage : npm run build:search
// À relancer après tout ajout ou modification de contenu, puis committer
// pagefind/ et assets/search-lexicon.json (Vercel ne fait pas de build).
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as pagefind from 'pagefind';
import { normalize, STOPWORDS } from '../assets/search-core.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Pages hors index : la page de recherche elle-même, la landing publicitaire
// (volontairement non liée) et la page de remerciement après envoi de facture.
export const EXCLUDED_PAGES = ['recherche.html', 'ms-strategy-landing-2.html', 'merci-facture.html'];

// Blocs répétés sur toutes les pages : ils brouilleraient les résultats.
export const EXCLUDE_SELECTORS = [
  'nav', 'footer', '.fbot', '.article-meta', '.ticker', '#ms-cookie-banner', '#floating-cta',
  '.cstrip', '.qband', '#cta', '[google-add-preferred-source-btn]', 'noscript',
];

export async function indexablePages() {
  const files = await readdir(ROOT);
  return files.filter((f) => f.endsWith('.html') && !EXCLUDED_PAGES.includes(f)).sort();
}

// Texte visible approximatif d'une page, pour le lexique.
function visibleText(html) {
  return html
    .replace(/<(script|style|noscript|nav|footer)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#?\w+;/g, ' ');
}

// Titre affiché dans les résultats : la balise <title> (sans « | M&S Strategy »)
// plutôt que le premier <h1>, souvent une accroche hors contexte
// (« Comprendre le marché pour mieux négocier. » sur blog.html).
// Ajouté uniquement au contenu passé à Pagefind, pas aux fichiers.
export function withTitleMeta(html) {
  const m = /<title>([^<]*)<\/title>/i.exec(html);
  if (!m) return html;
  const title = m[1].replace(/\s*[|–-]\s*M&(amp;)?S Strategy\s*$/, '').trim();
  return html.replace(/<body([^>]*)>/i, `<body$1><span data-pagefind-meta="title" hidden>${title}</span>`);
}

async function main() {
  const pages = await indexablePages();
  const { index } = await pagefind.createIndex({ forceLanguage: 'fr', excludeSelectors: EXCLUDE_SELECTORS });
  const words = {};

  for (const page of pages) {
    const html = await readFile(join(ROOT, page), 'utf8');
    const { errors } = await index.addHTMLFile({ url: `/${page}`, content: withTitleMeta(html) });
    if (errors.length) throw new Error(`${page} : ${errors.join(', ')}`);
    for (const w of normalize(visibleText(html)).split(' ')) {
      if (w.length < 3 || /^\d+$/.test(w) || STOPWORDS.has(w)) continue;
      words[w] = (words[w] || 0) + 1;
    }
  }

  await rm(join(ROOT, 'pagefind'), { recursive: true, force: true });
  const { errors } = await index.writeFiles({ outputPath: join(ROOT, 'pagefind') });
  if (errors.length) throw new Error(errors.join(', '));
  await pagefind.close();
  // Interfaces prêtes à l'emploi de Pagefind : non utilisées (assets/site-search.js a la sienne).
  for (const f of await readdir(join(ROOT, 'pagefind'))) {
    if (/^pagefind-(ui|modular-ui|component-ui|highlight)\./.test(f)) await rm(join(ROOT, 'pagefind', f));
  }

  const sorted = Object.fromEntries(Object.entries(words).sort(([a], [b]) => a.localeCompare(b)));
  const lexicon = { pages, words: sorted };
  await writeFile(join(ROOT, 'assets/search-lexicon.json'), JSON.stringify(lexicon) + '\n');
  console.log(`Index de recherche : ${pages.length} pages, ${Object.keys(sorted).length} mots.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
