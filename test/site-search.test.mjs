import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import {
  correctQuery, editDistance, matchSynonyms, hasIntentPhrase, groupCityResults, searchTerms, tokenize, STOPWORDS,
} from '../assets/search-core.js';
import { indexablePages, EXCLUDED_PAGES, withTitleMeta } from '../scripts/build-search.mjs';

const lexicon = JSON.parse(readFileSync('assets/search-lexicon.json', 'utf8'));
const synonyms = JSON.parse(readFileSync('data/search-synonyms.json', 'utf8')).entries;
const TAG = '<script type="module" src="assets/site-search.js"></script>';
// Pages de conversion : pas de recherche, pour ne pas détourner du formulaire.
const NO_SEARCH_UI = ['ms-strategy-landing-2.html', 'ms-strategy-calculateur.html'];

test('editDistance compte une inversion de lettres voisines comme une seule faute', () => {
  assert.equal(editDistance('trupe', 'turpe'), 1);
  assert.equal(editDistance('acise', 'accise'), 1);
  assert.equal(editDistance('montpelier', 'montpellier'), 1);
  assert.equal(editDistance('abc', 'xyz', 1), 2);
});

test('les fautes de frappe sont corrigées vers le vocabulaire du site', () => {
  for (const [typed, expected] of [
    ['trupe', 'turpe'], ['acise', 'accise'], ['arnh', 'arenh'], ['électricté', 'electricite'],
    ['courtier montpelier', 'courtier montpellier'], ['decret tertiare', 'decret tertiaire'],
  ]) {
    assert.equal(correctQuery(typed, lexicon).query, expected, typed);
  }
  const { corrections } = correctQuery('trupe', lexicon);
  assert.deepEqual(corrections, [{ from: 'trupe', to: 'turpe' }]);
});

test('un mot en cours de frappe, les mots courts et les mots connus ne sont pas corrigés', () => {
  assert.equal(correctQuery('turp', lexicon, { typing: true }).query, 'turp');
  assert.equal(correctQuery('gaz', lexicon).query, 'gaz');
  assert.equal(correctQuery('accise', lexicon).query, 'accise');
  assert.equal(correctQuery('2026', lexicon).query, '2026');
});

test('searchTerms retire les mots vides sauf si la requête n’a que ça', () => {
  assert.equal(searchTerms('facture trop chère'), 'facture chere');
  assert.equal(searchTerms('de la'), 'de la');
});

test('les mots-clés contextuels orientent vers les bonnes rubriques', () => {
  const labels = (q) => matchSynonyms(q, synonyms).map((e) => e.label);
  assert.ok(labels('facture trop chère').includes('Réduire sa facture'));
  assert.ok(labels('taxe électricité').includes('Taxes sur l\'énergie'));
  assert.ok(labels('voiture électrique').includes('Recharge de véhicules électriques'));
  assert.equal(hasIntentPhrase('facture trop chère', synonyms), true);
  assert.equal(hasIntentPhrase('courtier', synonyms), false);
});

test('chaque terme du dictionnaire métier existe dans le vocabulaire du site', () => {
  for (const entry of synonyms) {
    assert.ok(entry.label && entry.triggers.length && entry.terms.length, JSON.stringify(entry));
    for (const term of entry.terms) {
      for (const w of tokenize(term)) {
        if (w.length < 3 || STOPWORDS.has(w)) continue;
        assert.ok(lexicon.words[w], `« ${w} » (terme « ${term} », rubrique « ${entry.label} ») est absent du site`);
      }
    }
  }
});

test('les pages locales sont regroupées par sujet, sauf si une ville est cherchée', () => {
  const results = [
    { url: '/tarif-electricite-professionnel-lyon.html' },
    { url: '/prix-kwh-professionnel-2026.html' },
    { url: '/tarif-electricite-professionnel-paris.html' },
  ];
  const grouped = groupCityResults(results, 'tarif electricite');
  assert.equal(grouped.length, 2);
  assert.deepEqual(grouped[0].cities.map((c) => c.label), ['Lyon', 'Paris']);
  assert.equal(groupCityResults(results, 'tarif paris').length, 3);
});

test('l’index de recherche est à jour avec les pages du site (sinon : npm run build:search)', async () => {
  assert.ok(existsSync('pagefind/pagefind.js'), 'pagefind/ manquant');
  assert.ok(existsSync('pagefind/pagefind-entry.json'), 'pagefind/ incomplet');
  assert.deepEqual(lexicon.pages, await indexablePages());
  for (const page of EXCLUDED_PAGES) assert.ok(!lexicon.pages.includes(page), page);
});

test('le titre des résultats vient de la balise <title>, sans le nom du cabinet', () => {
  const html = '<html><head><title>Plan du site | M&amp;S Strategy</title></head><body class="x"><h1>Accroche</h1></body></html>';
  assert.match(withTitleMeta(html), /<body class="x"><span data-pagefind-meta="title" hidden>Plan du site<\/span>/);
});

test('la recherche est branchée sur toutes les pages sauf les pages de conversion', () => {
  const pages = readdirSync('.').filter((f) => f.endsWith('.html'));
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    if (NO_SEARCH_UI.includes(page)) assert.ok(!html.includes(TAG), `${page} ne doit pas charger la recherche`);
    else assert.ok(html.includes(TAG), `${page} doit charger assets/site-search.js`);
  }
  for (const tpl of ['templates/blog-article-template.html', 'templates/barometre-article-template.html']) {
    assert.ok(readFileSync(tpl, 'utf8').includes(TAG), tpl);
  }
});

test('recherche.html : page de résultats non indexée par Google', () => {
  const html = readFileSync('recherche.html', 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.match(html, /<div id="site-search-page"><\/div>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/cabinetms\.fr\/recherche\.html">/);
  assert.ok(!readFileSync('sitemap.xml', 'utf8').includes('recherche.html'));
});
