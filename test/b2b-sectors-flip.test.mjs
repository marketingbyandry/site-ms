import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2b.html', 'utf8');

test('b2b.html transforme les 3 cartes secteurs en cartes flip (photo devant, texte au dos)', () => {
  const source = html();
  const valsIdx = source.indexOf('<section class="vals">');
  const compareIdx = source.indexOf('<!-- COMPARATIF');
  assert.ok(valsIdx > -1, 'la section secteurs doit exister');
  const section = source.slice(valsIdx, compareIdx > -1 ? compareIdx : undefined);

  const cardCount = (section.match(/class="flip-card vcard-flip/g) || []).length;
  assert.equal(cardCount, 3, 'les 3 secteurs doivent être des cartes flip');
  assert.match(section, /<div class="flip-card-inner">/);
  assert.match(section, /<div class="flip-card-front">/);
  assert.match(section, /<div class="flip-card-back">/);
});

test('b2b.html garde l\'intitulé du secteur hors overlay (pas de .tag sur la photo)', () => {
  const source = html();
  const valsIdx = source.indexOf('<section class="vals">');
  const compareIdx = source.indexOf('<!-- COMPARATIF');
  const section = source.slice(valsIdx, compareIdx);

  // L'intitulé (.vhead > .vt) doit être en flux normal dans la face avant,
  // pas dans .photo-ph comme le .tag des cartes Équipe/Terrain de l'accueil.
  assert.match(section, /<div class="vhead"><span class="vn">01<\/span><span class="vt">Industrie & production<\/span><\/div>/);
  assert.doesNotMatch(section, /<div class="photo-ph"><span class="tag">/, 'aucune .tag ne doit être overlayée sur les photos secteurs');

  // Les 3 photos front ne contiennent que le motif de points, rien d'autre.
  const photoPhBlocks = section.match(/<div class="photo-ph">[^]*?<\/div>/g) || [];
  assert.equal(photoPhBlocks.length, 3);
  photoPhBlocks.forEach(block => {
    assert.match(block, /^<div class="photo-ph"><span class="dot-grid"><\/span><\/div>$/);
  });
});

test('b2b.html met le texte explicatif de chaque secteur au dos de la carte', () => {
  const source = html();
  assert.match(source, /<p class="flip-back-title">Industrie & production<\/p>\s*<p class="flip-back-text">Sites à forte consommation/);
  assert.match(source, /<p class="flip-back-title">Commerce & multi-sites<\/p>\s*<p class="flip-back-text">Réseaux de boutiques/);
  assert.match(source, /<p class="flip-back-title">Tertiaire & collectivités<\/p>\s*<p class="flip-back-text">Bureaux, copropriétés/);
});

test('b2b.html cable le gestionnaire JS de bascule des cartes flip et observe .photo-ph', () => {
  const source = html();
  assert.match(source, /document\.querySelectorAll\('\.flip-card'\)\.forEach/);
  assert.match(source, /card\.setAttribute\('aria-pressed'/);
  assert.match(source, /document\.querySelectorAll\('\.photo-ph'\)\.forEach\(el => photoObs\.observe\(el\)\);/);
});

test('b2b.html définit les styles .vcard-flip réutilisant les tokens de surface partagés', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.match(inlineStyle, /\.vcard-flip \.flip-card-front\{[^}]*background:var\(--surface\)/);
  assert.match(inlineStyle, /\.vcard-flip \.photo-ph\{[^}]*position:relative/);
});
