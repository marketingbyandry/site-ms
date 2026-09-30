// scripts/build-partials.mjs
//
// Synchronise les blocs répétés sur toutes les pages (bouton flottant,
// réassurance CTA, bandeau contact…) à partir d'une source unique :
//   - data/site.json   : les variables du site (ex. "delai": "24h")
//   - partials/*.html  : chaque bloc écrit une seule fois, avec des {{variables}}
//
// Dans les pages, un bloc est délimité par deux commentaires :
//   <!-- partial:floating-cta -->…<!-- /partial:floating-cta -->
// Le script remplace tout ce qui se trouve entre les deux par le partial rendu.
//
// Usage :
//   node scripts/build-partials.mjs          réécrit les pages désynchronisées
//   node scripts/build-partials.mjs --check  échoue si une page est désynchronisée

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PAGE_DIRS = ['.', 'templates'];

export function loadSite(root = ROOT) {
  return JSON.parse(readFileSync(path.join(root, 'data', 'site.json'), 'utf8'));
}

/** Remplace les {{variables}} ; une variable absente de site.json est une erreur. */
export function renderPartial(source, vars) {
  return source.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`Variable {{${key}}} absente de data/site.json`);
    return vars[key];
  });
}

export function loadPartials(root = ROOT, vars = loadSite(root)) {
  const dir = path.join(root, 'partials');
  const partials = {};
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    partials[file.replace(/\.html$/, '')] = renderPartial(readFileSync(path.join(dir, file), 'utf8'), vars);
  }
  return partials;
}

/** Applique les partials à une page ; un marqueur inconnu est une erreur. */
export function applyPartials(html, partials) {
  return html.replace(
    /(<!-- partial:([\w-]+) -->)[\s\S]*?(<!-- \/partial:\2 -->)/g,
    (_, open, name, close) => {
      if (!(name in partials)) throw new Error(`Partial inconnu : ${name}`);
      return open + partials[name] + close;
    },
  );
}

export function listPages(root = ROOT) {
  return PAGE_DIRS.flatMap((dir) =>
    readdirSync(path.join(root, dir))
      .filter((f) => f.endsWith('.html'))
      .map((f) => path.join(dir, f)),
  );
}

/** Renvoie la liste des pages désynchronisées (et les réécrit si write=true). */
export function syncPages({ root = ROOT, write = false } = {}) {
  const partials = loadPartials(root);
  const stale = [];
  for (const page of listPages(root)) {
    const file = path.join(root, page);
    const html = readFileSync(file, 'utf8');
    const synced = applyPartials(html, partials);
    if (synced !== html) {
      stale.push(page);
      if (write) writeFileSync(file, synced);
    }
  }
  return stale;
}

function main() {
  const check = process.argv.includes('--check');
  const stale = syncPages({ write: !check });
  if (check && stale.length) {
    console.error(`Pages désynchronisées (lancer npm run build:partials) :\n  ${stale.join('\n  ')}`);
    process.exit(1);
  }
  console.log(check ? 'Partials à jour.' : `${stale.length} page(s) mise(s) à jour.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
