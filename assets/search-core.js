// Logique pure de la recherche du site (sans DOM), partagée par
// assets/site-search.js (navigateur) et test/site-search.test.mjs (Node).
//
// Pagefind gère les accents et les variantes d'un mot (pluriels, racines),
// mais pas les fautes de frappe. Ce module ajoute :
//   1. la correction des fautes, par rapprochement avec le vocabulaire
//      réel du site (lexique généré par scripts/build-search.mjs) ;
//   2. les mots-clés contextuels (data/search-synonyms.json) ;
//   3. le regroupement des pages locales déclinées par ville.

export const CITIES = ['paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'lille', 'nantes', 'strasbourg', 'montpellier', 'rennes'];

const CITY_LABELS = { paris: 'Paris', lyon: 'Lyon', marseille: 'Marseille', toulouse: 'Toulouse', bordeaux: 'Bordeaux', lille: 'Lille', nantes: 'Nantes', strasbourg: 'Strasbourg', montpellier: 'Montpellier', rennes: 'Rennes' };

export const STOPWORDS = new Set(('a au aux avec ce ces cet cette comment dans de des du elle en est et il je la le les leur ma mes mon ne nos notre nous on ou par pas pour qu que quel quelle qui quoi sa se ses son sont sur ta tes ton tres trop tu un une vos votre vous y').split(' '));

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(text) {
  const norm = normalize(text);
  return norm ? norm.split(' ') : [];
}

// Distance de Damerau-Levenshtein restreinte : insertion, suppression,
// substitution et inversion de deux lettres voisines (« trupe » → « turpe »)
// comptent chacune pour 1. S'arrête dès que la distance dépasse `max`.
export function editDistance(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows = [];
  for (let i = 0; i <= a.length; i++) {
    rows[i] = [i];
    for (let j = 1; j <= b.length; j++) rows[i][j] = i === 0 ? j : 0;
  }
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, rows[i - 2][j - 2] + 1);
      rows[i][j] = d;
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > max) return max + 1;
  }
  return rows[a.length][b.length];
}

// Distance tolérée selon la longueur du mot : 1 faute jusqu'à 6 lettres,
// 2 au-delà. En dessous de 4 lettres, on ne corrige pas (trop d'ambiguïté).
function maxDistanceFor(word) {
  if (word.length < 4) return 0;
  return word.length <= 6 ? 1 : 2;
}

// lexicon : { words: { mot: fréquence } } (mots normalisés, sans accents).
// `typing` : vrai si le dernier mot est peut-être encore en cours de frappe ;
// il n'est alors pas corrigé tant qu'il est le début d'un mot connu.
export function correctToken(token, lexicon, { typing = false } = {}) {
  const words = lexicon.words;
  const max = maxDistanceFor(token);
  if (!max || /^\d+$/.test(token) || STOPWORDS.has(token) || words[token]) return token;
  const known = lexicon.keys || (lexicon.keys = Object.keys(words));
  if (typing && known.some((w) => w.startsWith(token))) return token;
  let best = null;
  let bestDist = max + 1;
  let bestFreq = -1;
  for (const w of known) {
    if (Math.abs(w.length - token.length) > max) continue;
    const d = editDistance(token, w, max);
    if (d < bestDist || (d === bestDist && words[w] > bestFreq)) {
      best = w;
      bestDist = d;
      bestFreq = words[w];
    }
  }
  return bestDist <= max ? best : token;
}

// Renvoie la requête corrigée et la liste des corrections faites,
// pour pouvoir afficher « Recherche corrigée : trupe → turpe ».
export function correctQuery(query, lexicon, { typing = false } = {}) {
  const tokens = tokenize(query);
  const corrections = [];
  const out = tokens.map((tok, i) => {
    const fixed = correctToken(tok, lexicon, { typing: typing && i === tokens.length - 1 });
    if (fixed !== tok) corrections.push({ from: tok, to: fixed });
    return fixed;
  });
  return { query: out.join(' '), corrections };
}

// Mots utiles pour Pagefind : on retire les mots vides (« trop », « de »…),
// sauf si la requête n'est faite que de ça.
export function searchTerms(query) {
  const tokens = tokenize(query);
  const useful = tokens.filter((t) => !STOPWORDS.has(t));
  return (useful.length ? useful : tokens).join(' ');
}

// Mots-clés contextuels : renvoie les rubriques dont un déclencheur figure
// dans la requête (mots entiers, sans accents).
export function matchSynonyms(query, entries) {
  const padded = ` ${normalize(query)} `;
  return entries.filter((entry) => entry.triggers.some((t) => padded.includes(` ${normalize(t)} `)));
}

// Vrai si la requête contient une expression d'intention de plusieurs mots
// (« facture trop chère », « voiture électrique ») : les réponses du
// dictionnaire métier passent alors avant les résultats mot à mot.
export function hasIntentPhrase(query, entries) {
  const padded = ` ${normalize(query)} `;
  return entries.some((entry) => entry.triggers.some((t) => t.includes(' ') && padded.includes(` ${normalize(t)} `)));
}

// Clé de regroupement d'une page locale : « tarif-electricite-professionnel-lyon.html »
// → { key: « tarif-electricite-professionnel », city: « lyon » }.
export function cityVariant(url) {
  const m = /([a-z0-9-]+)-([a-z]+)\.html$/.exec(url);
  if (!m || !CITIES.includes(m[2])) return null;
  return { key: m[1], city: m[2], label: CITY_LABELS[m[2]] };
}

// Les 50 pages locales existent en 10 versions presque identiques. Sauf si
// le visiteur a tapé une ville, on n'en garde qu'une par sujet et on liste
// les autres villes en lien direct.
export function groupCityResults(results, query) {
  const tokens = new Set(tokenize(query));
  if (CITIES.some((c) => tokens.has(c))) return results;
  const out = [];
  const byKey = new Map();
  for (const r of results) {
    const v = cityVariant(r.url);
    if (!v) { out.push(r); continue; }
    if (byKey.has(v.key)) {
      byKey.get(v.key).cities.push({ label: v.label, url: r.url });
      continue;
    }
    const grouped = { ...r, cities: [{ label: v.label, url: r.url }] };
    byKey.set(v.key, grouped);
    out.push(grouped);
  }
  return out;
}

// Fusionne plusieurs listes de résultats en gardant le premier rang de chaque URL.
export function mergeResults(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const r of list) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      out.push(r);
    }
  }
  return out;
}
