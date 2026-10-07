// test/seo-articles-v2.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORY_BY_SLUG, loadV2Data, splitLead, inlineCtaSlots, slugifyHeading } from '../scripts/build-seo-articles.mjs';

const V2 = loadV2Data();
const SLUGS = Object.keys(V2);
const page = (slug) => readFileSync(`${slug}.html`, 'utf8');
const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');

test('le gabarit v2 couvre 25 articles du corpus, tous rédigés', () => {
  assert.equal(SLUGS.length, 25);
  for (const slug of SLUGS) {
    assert.ok(CATEGORY_BY_SLUG[slug], `${slug} doit être un article du corpus`);
    assert.equal(V2[slug].status, 'done', `${slug} : couche éditoriale à rédiger`);
  }
});

test('splitLead isole le titre en gras d’un item de liste', () => {
  assert.deepEqual(splitLead('**Le type d’offre** : prix fixe ou indexé'), { lead: 'Le type d’offre', rest: 'Prix fixe ou indexé' });
  assert.deepEqual(splitLead('**Vérifier la date** exigée par le contrat'), { lead: 'Vérifier la date', rest: 'Exigée par le contrat' });
  assert.equal(splitLead('pas de gras ici'), null);
});

test('inlineCtaSlots place deux CTA distincts, jamais au-delà des sections', () => {
  assert.deepEqual(inlineCtaSlots(4), { soft: 1, strong: 2 });
  assert.deepEqual(inlineCtaSlots(3), { soft: 0, strong: 1 });
  assert.deepEqual(inlineCtaSlots(6), { soft: 1, strong: 3 });
  assert.equal(slugifyHeading('Les étapes **concrètes** pour résilier'), 'les-etapes-concretes-pour-resilier');
});

test('chaque page v2 : gabarit v2, sans photo ni bouton flottant, 2 CTA intercalés + CTA final', () => {
  for (const slug of SLUGS) {
    const html = page(slug);
    assert.match(html, /<!-- gabarit:v2/, slug);
    assert.doesNotMatch(html, /article-banner|floating-cta/, slug);
    assert.equal((html.match(/<aside class="cta-inline wide"/g) || []).length, 2, `${slug} : 2 CTA intercalés`);
    assert.match(html, /<a href="b2b\.html#upload" class="cta-btn">/, slug);
  }
});

test('chaque page v2 : les liens du sommaire pointent vers des ancres existantes', () => {
  for (const slug of SLUGS) {
    const html = page(slug);
    const toc = html.slice(html.indexOf('<details class="toc"'), html.indexOf('</details>'));
    const ids = [...toc.matchAll(/href="#([a-z0-9-]+)"/g)].map((m) => m[1]);
    assert.ok(ids.length >= 4, `${slug} : sommaire trop court`);
    for (const id of ids) assert.match(html, new RegExp(`id="${id}"`), `${slug} : #${id}`);
  }
});

test('couche éditoriale : 3 points « L’essentiel », citations reprises mot pour mot de l’article', () => {
  for (const slug of SLUGS) {
    const { tldr = [], notes = [] } = V2[slug];
    assert.equal(tldr.length, 3, `${slug} : 3 points « L’essentiel »`);
    const html = page(slug);
    const article = strip(html.slice(html.indexOf('<main'), html.indexOf('</main>')));
    for (const note of notes.filter((n) => n.quote)) {
      const occurrences = article.split(strip(note.text)).length - 1;
      assert.ok(occurrences >= 2, `${slug} : citation absente du corps de l’article « ${note.text.slice(0, 40)}… »`);
    }
  }
});
