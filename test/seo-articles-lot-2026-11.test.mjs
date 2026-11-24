import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { parseBlocks, inlineMarkdownToHtml, extractFaq, CATEGORY_BY_SLUG } from '../scripts/build-seo-articles.mjs';

const DIR = 'content/seo-articles';
const { items } = JSON.parse(readFileSync(`${DIR}/manifest.json`, 'utf8'));
const md = (slug) => readFileSync(`${DIR}/${slug}.md`, 'utf8');
const meta = (slug) => JSON.parse(readFileSync(`${DIR}/${slug}.json`, 'utf8'));
const page = (slug) => readFileSync(`${slug}.html`, 'utf8');
const flat = (t) => t.replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/&nbsp;|\s+/g, ' ');

test('le lot compte 50 nouveaux articles et 1 réécriture, tous terminés', () => {
  assert.equal(items.filter((i) => !i.rewrite).length, 50);
  for (const i of items) {
    assert.equal(i.status, 'done', i.slug);
    assert.equal(CATEGORY_BY_SLUG[i.slug], i.category, i.slug);
  }
});

test('markdown : tableaux, sous-titres et liens externes', () => {
  assert.deepEqual(parseBlocks(['| a | b |', '|---|---|', '| 1 | 2 |', '', '### Q ?']), [
    { type: 'table', rows: [['a', 'b'], ['1', '2']] }, { type: 'h3', text: 'Q ?' },
  ]);
  assert.equal(inlineMarkdownToHtml('[CRE](https://www.cre.fr/x)'), '<a href="https://www.cre.fr/x" class="ilink" target="_blank" rel="noopener">CRE</a>');
  assert.deepEqual(extractFaq([{ heading: 'Questions fréquentes', lines: ['### A ?', 'Oui.'] }]), [{ q: 'A ?', a: 'Oui.' }]);
});

for (const { slug } of items) {
  test(`${slug} : chapitres, sommaire, SEO et maillage`, () => {
    const m = meta(slug);
    const src = md(slug);
    const html = page(slug);
    const chapters = src.match(/^## /gm).length;
    assert.ok(chapters >= 7, `${chapters} chapitres`);
    assert.equal(m.toc.length, chapters, 'un libellé de sommaire par chapitre');
    const ids = [...html.slice(html.indexOf('<details class="toc"'), html.indexOf('</details>')).matchAll(/href="#([a-z0-9-]+)"/g)].map((x) => x[1]);
    assert.equal(ids.length, chapters);
    for (const id of ids) assert.equal(html.split(`id="${id}"`).length, 2, `ancre unique #${id}`);
    assert.ok(`${m.seoTitle} | M&S Strategy`.length <= 68, `title trop long : ${m.seoTitle}`);
    assert.ok(m.description.length >= 110 && m.description.length <= 160, `description : ${m.description.length}`);
    assert.ok(!m.description.includes('…'));
    const words = flat(src).split(/\s+/).length;
    assert.ok(words >= 900 && words <= 2100, `${words} mots`);
    assert.match(html, /"@type": "FAQPage"/);
    assert.match(html, /<div class="tbl wide"/);
    for (const [, target] of src.matchAll(/\]\(([a-z0-9-]+)\.md\)/g)) {
      assert.ok(existsSync(`${target}.html`), `lien cassé : ${target}`);
      assert.notEqual(target, slug);
    }
    assert.equal(m.tldr.length, 3);
    for (const n of m.notes) assert.ok(flat(src).includes(flat(n.text)), `citation absente : ${n.text}`);
    for (const r of m.related) assert.ok(r !== slug && existsSync(`${r}.html`), `lié : ${r}`);
    assert.doesNotMatch(html, /\[[A-Z_]+\]|\]\(|\*\*/, 'markdown ou placeholder résiduel');
    for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(block[1]);
  });
}

test('titres et descriptions uniques dans le lot', () => {
  for (const key of ['seoTitle', 'description']) {
    const values = items.map((i) => meta(i.slug)[key]);
    assert.equal(new Set(values).size, values.length, key);
  }
});
