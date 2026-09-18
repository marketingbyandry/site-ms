import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('index.html', 'utf8');

test('index.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('index.html contient la Section 6 (photo system) entre L\'entreprise et Rejoindre', () => {
  const source = html();
  const aboutIdx = source.indexOf('<section class="about-section">');
  const photoIdx = source.indexOf('<section class="photo-section">');
  const careersIdx = source.indexOf('<section class="careers" id="careers">');
  assert.ok(aboutIdx > -1, 'about-section doit exister');
  assert.ok(photoIdx > aboutIdx, 'photo-section doit venir après about-section');
  assert.ok(careersIdx > photoIdx, 'careers doit venir après photo-section');
});

test('index.html ne duplique plus en inline le CSS déjà présent dans chantier-sections.css', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.doesNotMatch(inlineStyle, /\.flip-card-inner\{/, 'CSS des cartes flip doit être dans assets/chantier-sections.css');
  assert.doesNotMatch(inlineStyle, /\.photo-system-grid\{/, 'CSS de la grille photo doit être dans assets/chantier-sections.css');
});

test('index.html conserve le gestionnaire JS de bascule des cartes flip', () => {
  const source = html();
  assert.match(source, /document\.querySelectorAll\('\.flip-card'\)\.forEach/);
  assert.match(source, /card\.setAttribute\('aria-pressed'/);
});

test('index.html observe toujours .photo-ph dans le reveal scroll', () => {
  assert.match(html(), /document\.querySelectorAll\('\.reveal,\s*\.photo-ph'\)\.forEach\(el => obs\.observe\(el\)\);/);
});
