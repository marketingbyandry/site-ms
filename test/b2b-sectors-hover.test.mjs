import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2b.html', 'utf8');

function sectionSlice(source) {
  const start = source.indexOf('<section class="vals">');
  const end = source.indexOf('<!-- COMPARATIF');
  return source.slice(start, end);
}

test('b2b.html présente les 3 secteurs en une seule face texte + photo (pas de flip)', () => {
  const source = html();
  const section = sectionSlice(source);
  const cardCount = (section.match(/class="sector-card/g) || []).length;
  assert.equal(cardCount, 3, 'les 3 secteurs doivent être des sector-card');
  assert.doesNotMatch(section, /flip-card/, 'le système de rotation 3D ne doit plus être utilisé ici');
  assert.match(section, /<div class="sc-text">/);
  assert.match(section, /<div class="sc-photo">/);
});

test('b2b.html garde le texte de chaque secteur visible sans interaction (h3 + p en flux normal)', () => {
  const source = html();
  const section = sectionSlice(source);
  assert.match(section, /<h3 class="vt">Industrie & production<\/h3>\s*<p class="vb">Sites à forte consommation/);
  assert.match(section, /<h3 class="vt">Commerce & multi-sites<\/h3>\s*<p class="vb">Réseaux de boutiques/);
  assert.match(section, /<h3 class="vt">Tertiaire & collectivités<\/h3>\s*<p class="vb">Bureaux, copropriétés/);
});

test('b2b.html définit une emphase au survol réciproque, mais légère (pas de quasi-disparition)', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);

  assert.match(inlineStyle, /\.sector-card:has\(\.sc-text:hover\) \.sc-text\{[^}]*flex-grow:1\.35/);
  assert.match(inlineStyle, /\.sector-card:has\(\.sc-text:hover\) \.sc-photo\{[^}]*flex-grow:\.75/);
  assert.match(inlineStyle, /\.sector-card:has\(\.sc-photo:hover\) \.sc-photo\{[^}]*flex-grow:1\.35/);
  assert.match(inlineStyle, /\.sector-card:has\(\.sc-photo:hover\) \.sc-text\{[^}]*flex-grow:\.75/);
});

test('b2b.html donne un format quasi carré/portrait aux cartes secteurs par défaut', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.sector-card\{[^}]*aspect-ratio:4\/5/);
});

test('b2b.html réduit le texte à un aperçu (~2 lignes) par défaut et le révèle au survol du texte', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.sc-text \.vb\{[^}]*max-height:3\.2em[^}]*overflow:hidden/);
  assert.match(inlineStyle, /\.sector-card:has\(\.sc-text:hover\) \.sc-text \.vb\{[^}]*max-height:14em/);
});

test('b2b.html neutralise la bascule au survol sur mobile (pas de hover tactile fiable)', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  const mobileBlock = inlineStyle.match(/@media\(max-width:560px\)\{[^]*?\n\}/);
  assert.ok(mobileBlock, 'un correctif mobile pour .sector-card doit exister');
  assert.match(mobileBlock[0], /flex-grow:1;opacity:1/);
  assert.match(mobileBlock[0], /\.sc-text \.vb\{max-height:none\}/, 'le texte doit rester complet sur mobile, faute de hover tactile fiable');
});
