// Genere les liens de prospection personnalises a partir d_un CSV de leads.
//
//   node scripts/build-prospect-links.mjs <fichier.csv> [options]
//
//   --camp=<code>        code de campagne ajoute a chaque lien (ex. ind-e1)
//   --nom-col=<colonne>  defaut : Entreprise
//   --secteur-col=<col>  defaut : Secteur/Activité
//   --base=<url>         defaut : https://cabinetms.fr/prospect.html
//   --out=<fichier.csv>  defaut : sortie sur stdout
//
// Le CSV d_entree n_est jamais lu depuis le depot : les listes de prospects
// (noms, telephones) vivent hors du repo et ne doivent pas etre commitees.
// Aucun mapping de secteur n_est fait ici — prospect.html matche le texte
// brut contre assets/sector-blocks.js au moment du rendu, donc le libelle du
// CSV part tel quel dans l_URL.

import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';

const DEFAULTS = {
  base: 'https://cabinetms.fr/prospect.html',
  nomCol: 'Entreprise',
  secteurCol: 'Secteur/Activité',
  camp: null
};

// Parseur CSV minimal : en-tetes en premiere ligne, champs entre guillemets
// pouvant contenir virgules, sauts de ligne et guillemets doubles ("").
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += char;
      continue;
    }

    if (char === '"') { quoted = true; continue; }
    if (char === ',') { row.push(field); field = ''; continue; }
    if (char === '\r') continue;
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += char;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  const [headers, ...body] = rows;
  if (!headers) return [];

  return body
    .filter((cells) => cells.some((cell) => cell.trim() !== ''))
    .map((cells) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header.trim()] = (cells[index] || '').trim();
      });
      return record;
    });
}

export function buildLinks(rows, options = {}) {
  const { base, nomCol, secteurCol, camp } = { ...DEFAULTS, ...options };

  return rows
    .map((row) => ({ nom: row[nomCol] || '', secteur: row[secteurCol] || '' }))
    .filter((entry) => entry.nom !== '')
    .map((entry) => {
      const url = new URL(base);
      url.searchParams.set('nom', entry.nom);
      if (entry.secteur) url.searchParams.set('secteur', entry.secteur);
      if (camp) url.searchParams.set('camp', camp);
      return { ...entry, url: url.toString() };
    });
}

function csvEscape(value) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function parseArgs(argv) {
  const options = {};
  let input = null;
  let out = null;

  for (const arg of argv) {
    if (arg.startsWith('--camp=')) options.camp = arg.slice('--camp='.length);
    else if (arg.startsWith('--nom-col=')) options.nomCol = arg.slice('--nom-col='.length);
    else if (arg.startsWith('--secteur-col=')) options.secteurCol = arg.slice('--secteur-col='.length);
    else if (arg.startsWith('--base=')) options.base = arg.slice('--base='.length);
    else if (arg.startsWith('--out=')) out = arg.slice('--out='.length);
    else if (!input) input = arg;
  }
  return { input, out, options };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { input, out, options } = parseArgs(process.argv.slice(2));

  if (!input) {
    console.error('Usage : node scripts/build-prospect-links.mjs <fichier.csv> [--camp=code] [--nom-col=…] [--secteur-col=…] [--base=…] [--out=…]');
    process.exit(1);
  }

  const links = buildLinks(parseCsv(readFileSync(input, 'utf8')), options);
  const csv = ['Entreprise,Secteur,URL']
    .concat(links.map((l) => [l.nom, l.secteur, l.url].map(csvEscape).join(',')))
    .join('\n') + '\n';

  if (out) {
    writeFileSync(out, csv);
    console.error(`${links.length} liens ecrits dans ${out}`);
  } else {
    process.stdout.write(csv);
  }
}
