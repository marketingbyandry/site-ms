// test/build-seo-articles.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBlocks,
  inlineMarkdownToHtml,
  parseArticleMarkdown,
  buildArticleData,
  truncateForMeta,
  renderArticleHtml,
  CATEGORY_BY_SLUG,
  CATEGORY_ORDER,
} from '../scripts/build-seo-articles.mjs';
import { readFileSync } from 'node:fs';

test('inlineMarkdownToHtml convertit le gras markdown en <strong>', () => {
  assert.equal(inlineMarkdownToHtml('un **mot important** ici'), 'un <strong>mot important</strong> ici');
});

test('inlineMarkdownToHtml convertit un lien interne markdown en <a class="ilink">', () => {
  assert.equal(
    inlineMarkdownToHtml('voir [ce guide](autre-slug.md) pour plus'),
    'voir <a href="autre-slug.html" class="ilink">ce guide</a> pour plus',
  );
});

test('parseBlocks regroupe les lignes en paragraphes et listes à puces', () => {
  const blocks = parseBlocks(['Un paragraphe.', '', '- item un', '- item deux', '', 'Un autre paragraphe.']);
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Un paragraphe.' },
    { type: 'ul', items: ['item un', 'item deux'] },
    { type: 'p', text: 'Un autre paragraphe.' },
  ]);
});

test('parseBlocks reconnaît les listes numérotées', () => {
  const blocks = parseBlocks(['1. premier', '2. second']);
  assert.deepEqual(blocks, [{ type: 'ol', items: ['premier', 'second'] }]);
});

test('truncateForMeta ne coupe pas au milieu d\'un mot', () => {
  const long = 'a'.repeat(50) + ' ' + 'b'.repeat(50) + ' ' + 'c'.repeat(50) + ' ' + 'd'.repeat(50);
  const truncated = truncateForMeta(long, 100);
  assert.ok(truncated.length <= 101, 'la troncature doit rester proche de la limite');
  assert.ok(truncated.endsWith('…'));
  assert.ok(!truncated.slice(0, -1).includes(' '.repeat(2)), 'pas de coupe au milieu d\'un bloc de mots');
});

test('parseArticleMarkdown extrait le H1 et les sections H2', () => {
  const md = '# Mon titre\n\nIntro.\n\n## Section un\n\nTexte un.\n\n## Section deux\n\nTexte deux.\n';
  const { title, sections } = parseArticleMarkdown(md);
  assert.equal(title, 'Mon titre');
  assert.equal(sections.length, 3);
  assert.equal(sections[0].heading, null);
  assert.equal(sections[1].heading, 'Section un');
  assert.equal(sections[2].heading, 'Section deux');
});

test('CATEGORY_BY_SLUG couvre exactement les catégories autorisées', () => {
  const allowed = new Set(CATEGORY_ORDER);
  for (const [slug, category] of Object.entries(CATEGORY_BY_SLUG)) {
    assert.ok(allowed.has(category), `${slug} a une catégorie inconnue: ${category}`);
  }
});

test('buildArticleData isole le dernier paragraphe comme CTA et ne le duplique pas dans le corps', () => {
  const md = [
    '# Titre de test',
    '',
    'Intro du sujet.',
    '',
    '## Première section',
    '',
    'Un paragraphe de contenu.',
    '',
    '## Vérifier votre situation',
    '',
    'Contactez-nous pour vérifier.',
  ].join('\n');
  const data = buildArticleData('turpe-2026-professionnels', md);
  assert.equal(data.ctaTitle, 'Vérifier votre situation');
  assert.match(data.ctaSub, /Contactez-nous pour vérifier\./);
  assert.ok(!data.sectionsHtml.includes('Contactez-nous pour vérifier.'), 'le paragraphe CTA ne doit pas apparaître deux fois');
  assert.match(data.sectionsHtml, /Un paragraphe de contenu\./);
});

test('renderArticleHtml ne laisse aucun placeholder [MAJUSCULE] non remplacé', () => {
  const template = readFileSync(new URL('../templates/blog-article-template.html', import.meta.url), 'utf8');
  const md = [
    '# Titre complet',
    '',
    'Une intro suffisamment longue pour servir de méta description de test.',
    '',
    '## Section',
    '',
    'Corps du texte.',
    '',
    '## Dernière section',
    '',
    'Dernier paragraphe CTA.',
  ].join('\n');
  const data = buildArticleData('prix-kwh-professionnel-2026', md);
  const html = renderArticleHtml(template, data);
  assert.doesNotMatch(html, /\[[A-Z_]+\]/, 'tous les placeholders doivent être remplacés');
});
