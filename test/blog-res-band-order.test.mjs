// test/blog-res-band-order.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORY_ORDER } from '../scripts/build-seo-articles.mjs';

const html = () => readFileSync('blog.html', 'utf8');

test('blog.html ordonne le res-band : Outil interactif, puis Baromètre énergie, puis Analyses', () => {
  const source = html();
  const outilIdx = source.indexOf('<p class="res-label reveal">Outil interactif</p>');
  const barometreIdx = source.indexOf('<p class="res-label reveal">Baromètre énergie</p>');
  const analysesIdx = source.indexOf('<p class="res-label reveal">Analyses</p>');

  assert.ok(outilIdx > -1, 'le label Outil interactif doit exister');
  assert.ok(barometreIdx > -1, 'le label Baromètre énergie doit exister');
  assert.ok(analysesIdx > -1, 'le label Analyses doit exister');

  assert.ok(outilIdx < barometreIdx, 'Outil interactif doit précéder Baromètre énergie');
  assert.ok(barometreIdx < analysesIdx, 'Baromètre énergie doit précéder Analyses');
});

test('les 3 sections restent à l\'intérieur du même <section class="res-band">', () => {
  const source = html();
  const bandStart = source.indexOf('<section class="res-band">');
  const bandEnd = source.indexOf('</section>', bandStart);
  const outilIdx = source.indexOf('<p class="res-label reveal">Outil interactif</p>');
  const barometreIdx = source.indexOf('<p class="res-label reveal">Baromètre énergie</p>');
  const analysesIdx = source.indexOf('<p class="res-label reveal">Analyses</p>');

  assert.ok(bandStart > -1 && bandEnd > -1);
  for (const idx of [outilIdx, barometreIdx, analysesIdx]) {
    assert.ok(idx > bandStart && idx < bandEnd, 'chaque section doit rester dans .res-band');
  }
});

test('les 9 groupes de catégories SEO apparaissent après la section Analyses, avant la fin de .res-band', () => {
  const source = html();
  const bandStart = source.indexOf('<section class="res-band">');
  const bandEnd = source.indexOf('</section>', bandStart);
  const analysesIdx = source.indexOf('<p class="res-label reveal">Analyses</p>');
  for (const category of CATEGORY_ORDER) {
    const idx = source.indexOf(`<p class="res-label reveal" style="margin-top:2.4rem">${category.replace('&', '&amp;')}</p>`);
    assert.ok(idx > analysesIdx && idx < bandEnd, `le groupe "${category}" doit apparaître entre Analyses et la fin de .res-band`);
  }
});
