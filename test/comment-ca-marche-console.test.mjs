// test/comment-ca-marche-console.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = () => readFileSync('comment-ca-marche.html', 'utf8');

test('comment-ca-marche.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('comment-ca-marche.html insère le widget console entre les étapes et "Comparer davantage"', () => {
  const source = html();
  const stepsCloseIdx = source.indexOf('</section>', source.indexOf('<section class="steps">'));
  const consoleIdx = source.indexOf('<section class="console-standalone');
  const seoIdx = source.indexOf('<section class="seo-intro">');
  assert.ok(consoleIdx > stepsCloseIdx, 'le widget doit venir après les étapes');
  assert.ok(seoIdx > consoleIdx, '"Comparer davantage" doit venir après le widget');
});

test('le widget console affiche les 4 lignes du gabarit sans étiquette de fraîcheur (décision utilisateur)', () => {
  const source = html();
  // valeur alignée sur le prix de gros élec. le plus récent (data/barometre-electricite.json,
  // même source que le bandeau ticker.js) pour rester raccord avec le reste du site
  assert.match(source, /0,1039 €\/kWh/);
  assert.match(source, /−4,2%/);
  assert.match(source, /favorable/);
  assert.match(source, />8\s?216</);
});

test('le widget "marché en un coup d\'œil" a une photo de fond en webp, assombrie pour la lisibilité du texte', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.console-standalone\{background-image:[^}]*url\("assets\/marche-widget-bg\.webp"\)[^}]*\}/);
  assert.match(inlineStyle, /\.console-standalone\{background-image:linear-gradient\(160deg,rgba\(7,19,26,/, 'un dégradé sombre doit précéder la photo pour garder le texte lisible');
  assert.ok(existsSync('assets/marche-widget-bg.webp'), "l'asset marche-widget-bg.webp doit exister");
});
