// test/comparatif-fournisseurs-v2.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildAllArticles, isHandCrafted } from '../scripts/build-seo-articles.mjs';

const PAGE = 'comparatif-fournisseurs-electricite-pro.html';
const html = () => readFileSync(PAGE, 'utf8');
const euros = (s) => Number(s.replace(/[^\d]/g, ''));

test('le comparatif est marqué layout:v2 et le générateur ne l’écrase pas', () => {
  assert.ok(isHandCrafted(PAGE));
  const src = mkdtempSync(path.join(tmpdir(), 'seo-src-'));
  const out = mkdtempSync(path.join(tmpdir(), 'seo-out-'));
  writeFileSync(path.join(src, 'comparatif-fournisseurs-electricite-pro.md'), '# Titre\n\nIntro.\n\n## Section\n\nTexte.\n');
  writeFileSync(path.join(src, 'prix-kwh-professionnel-2026.md'), '# Autre\n\nIntro.\n\n## Section\n\nTexte.\n');
  const v2 = '<!-- layout:v2 --> page à la main';
  writeFileSync(path.join(out, 'comparatif-fournisseurs-electricite-pro.html'), v2);
  buildAllArticles(src, out);
  assert.equal(readFileSync(path.join(out, 'comparatif-fournisseurs-electricite-pro.html'), 'utf8'), v2);
  assert.match(readFileSync(path.join(out, 'prix-kwh-professionnel-2026.html'), 'utf8'), /<h1/);
});

test('deux CTA intercalés entre les sections, en plus du CTA final', () => {
  const source = html();
  const inline = source.match(/<aside class="cta-inline wide"[\s\S]*?<\/aside>/g) || [];
  assert.equal(inline.length, 2);
  for (const block of inline) {
    assert.match(block, /<a href="b2b\.html#upload" class="cta-btn cta-btn--/, 'chaque CTA intercalé reste tracé (a.cta-btn)');
  }
  assert.match(source, /<a href="b2b\.html#upload" class="cta-btn">/);
});

test('chaque lien du sommaire pointe vers une ancre existante', () => {
  const source = html();
  const toc = source.slice(source.indexOf('<details class="toc"'), source.indexOf('</details>'));
  const ids = [...toc.matchAll(/href="#([a-z-]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 6);
  for (const id of ids) assert.match(source, new RegExp(`id="${id}"`), `#${id} doit exister`);
});

test('l’exemple chiffré est juste : chaque total égale la somme de ses lignes', () => {
  const offers = html().match(/<div class="offer[^"]*">[\s\S]*?<\/table>/g);
  assert.equal(offers.length, 2);
  const totals = offers.map((offer) => {
    const cells = [...offer.matchAll(/<td>([^<]+)<\/td>/g)].map((m) => euros(m[1]));
    const total = cells.pop();
    assert.equal(cells.reduce((a, b) => a + b, 0), total);
    return total;
  });
  assert.deepEqual(totals, [13520, 13660]);
  assert.match(html(), /\+140&nbsp;€/);
});
