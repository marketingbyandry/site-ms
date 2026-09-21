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

test('index.html affiche la vraie photo équipe (carte flip Section 6 + bandeau Section 2), garde le filtre .photo-ph', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.photo-ph-team-banner\{background:url\("assets\/team-photo\.webp"\)/);
  assert.match(inlineStyle, /\.photo-ph-team-card\{background:url\("assets\/team-photo\.webp"\)/);
  assert.match(source, /<div class="visual"><div class="photo-ph photo-ph-team-banner"><span class="tag">équipe<\/span><\/div><\/div>/);
  assert.match(source, /<div class="photo-ph photo-ph-team-card">\s*<span class="tag">Équipe<\/span>/);
});

test('index.html affiche la vraie photo terrain (bandeau Section 2, reprend le visuel industrie & production de b2b) et la carte flip terrain, garde le filtre .photo-ph', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.photo-ph-terrain-banner\{background:url\("assets\/industrie-production-photo\.webp"\)/);
  assert.match(inlineStyle, /\.photo-ph-terrain-card\{background:url\("assets\/terrain-photo\.webp"\)/);
  assert.match(source, /<div class="visual"><div class="photo-ph photo-ph-terrain-banner"><span class="tag">terrain<\/span><\/div><\/div>/);
  assert.match(source, /<div class="photo-ph photo-ph-terrain-card">\s*<span class="tag">Terrain<\/span>/);
});

test('index.html affiche la vraie photo bureaux (carte flip Section 6), garde le filtre .photo-ph', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.photo-ph-bureaux-card\{background:url\("assets\/bureaux-photo\.webp"\)/);
  assert.match(source, /<div class="photo-ph photo-ph-bureaux-card">\s*<span class="tag">Bureaux<\/span>/);
});

test('index.html affiche la vraie photo site client (dernière carte flip Section 6, reprend le visuel industrie & production), garde le filtre .photo-ph', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.photo-ph-siteclient-card\{background:url\("assets\/industrie-production-photo\.webp"\)/);
  assert.match(source, /<div class="photo-ph photo-ph-siteclient-card">\s*<span class="tag">Site client<\/span>/);
  assert.doesNotMatch(source, /<div class="photo-ph">\s*<span class="dot-grid"><\/span>\s*<span class="tag">Site client<\/span>/, 'le dot-grid décoratif doit être retiré sur une vraie photo');
});
