import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2c.html', 'utf8');

function sectionSlice(source) {
  const start = source.indexOf('<section class="vals">');
  const end = source.indexOf('<!-- COMPARATIF');
  return source.slice(start, end);
}

test('b2c.html présente les 3 cas en une seule face texte + photo (même système que b2b)', () => {
  const source = html();
  const section = sectionSlice(source);
  const cardCount = (section.match(/class="sector-card/g) || []).length;
  assert.equal(cardCount, 3, 'les 3 cas doivent être des sector-card');
  assert.doesNotMatch(section, /flip-card/, 'pas de système de rotation 3D ici');
  assert.match(section, /<div class="sc-text">/);
  assert.match(section, /<div class="sc-photo">/);
});

test('b2c.html garde le texte de chaque cas visible sans interaction (h3 + p en flux normal)', () => {
  const source = html();
  const section = sectionSlice(source);
  assert.match(section, /<h3 class="vt">Appartement & maison<\/h3>\s*<p class="vb">Chauffage individuel/);
  assert.match(section, /<h3 class="vt">Résidence principale ou secondaire<\/h3>\s*<p class="vb">Nous vous accompagnons/);
  assert.match(section, /<h3 class="vt">Déménagement & emménagement<\/h3>\s*<p class="vb">Ouverture de compteur/);
});

test('b2c.html définit la même emphase au survol réciproque que b2b (légère, pas de quasi-disparition)', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);

  assert.match(inlineStyle, /\.sector-card:has\(\.sc-text:hover\) \.sc-text\{[^}]*flex-grow:1\.35/);
  assert.match(inlineStyle, /\.sector-card:has\(\.sc-text:hover\) \.sc-photo\{[^}]*flex-grow:\.75/);
  assert.match(inlineStyle, /\.sector-card:has\(\.sc-photo:hover\) \.sc-photo\{[^}]*flex-grow:1\.35/);
  assert.match(inlineStyle, /\.sector-card:has\(\.sc-photo:hover\) \.sc-text\{[^}]*flex-grow:\.75/);
});

test('b2c.html donne un format quasi carré/portrait aux cartes par défaut', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.sector-card\{[^}]*aspect-ratio:4\/5/);
});

test('b2c.html neutralise la bascule au survol sur mobile (pas de hover tactile fiable)', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  const mobileBlock = inlineStyle.match(/@media\(max-width:560px\)\{[^]*?\n\}/);
  assert.ok(mobileBlock, 'un correctif mobile pour .sector-card doit exister');
  assert.match(mobileBlock[0], /flex-grow:1;opacity:1/);
  assert.match(mobileBlock[0], /\.sc-text \.vb\{max-height:none\}/);
});

test('b2c.html affiche la vraie photo "Appartement & maison", garde le filtre .photo-ph', () => {
  const source = html();
  const section = sectionSlice(source);
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.photo-ph-appartement\{background:url\("assets\/appartement-maison-photo\.webp"\)/);
  assert.match(section, /<div class="photo-ph photo-ph-appartement"><\/div>/);
});

test('b2c.html affiche la vraie photo "Résidence principale ou secondaire", garde le filtre .photo-ph', () => {
  const source = html();
  const section = sectionSlice(source);
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.photo-ph-residence\{background:url\("assets\/residence-principale-photo\.webp"\)/);
  assert.match(section, /<div class="photo-ph photo-ph-residence"><\/div>/);
});

test('b2c.html affiche la vraie photo "Déménagement & emménagement", garde le filtre .photo-ph', () => {
  const source = html();
  const section = sectionSlice(source);
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.photo-ph-demenagement\{background:url\("assets\/demenagement-photo\.webp"\)/);
  assert.match(section, /<div class="photo-ph photo-ph-demenagement"><\/div>/);
});

test('b2c.html ne réapplique pas de filtre de couleur sur les 3 photos secteurs (couleurs naturelles)', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.doesNotMatch(
    inlineStyle,
    /\.photo-ph-appartement,\.photo-ph-residence,\.photo-ph-demenagement\{filter:/
  );
});
