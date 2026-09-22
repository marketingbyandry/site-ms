// scripts/build-seo-articles.mjs
//
// Génère une page HTML par article SEO à partir des fichiers markdown du
// corpus "Energie-Blog-Articles" (52 articles, rédigés hors dépôt) et du
// gabarit templates/blog-article-template.html.
//
// Usage : node scripts/build-seo-articles.mjs [dossier-source-markdown]
// Par défaut, le dossier source est ~/Documents/Energie-Blog-Articles/articles

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const TEMPLATE_PATH = new URL('../templates/blog-article-template.html', import.meta.url);

const WORDS_PER_MINUTE = 200;

// Catégorie assignée à chaque slug, choisie parmi les 9 catégories du
// design system de blog.html. Déduite du sujet de l'article.
export const CATEGORY_BY_SLUG = {
  'accise-electricite-gaz-2026': 'Réglementation & fiscalité',
  'achat-groupe-energie-pme-franchises': 'Verticaux sectoriels',
  'agrivoltaisme-terrain-agricole': 'Renouvelable & solaire',
  'arenh-entreprise-fin-dispositif': 'Marché & prix',
  'audit-energetique-obligatoire-entreprise': 'Efficacité énergétique',
  'autoconsommation-collective-entreprise': 'Renouvelable & solaire',
  'bornes-recharge-entreprise-loi-lom': 'Mobilité & bâtiment',
  'capn-contrat-nucleaire-long-terme': 'Marché & prix',
  'cee-entreprise-2026': 'Aides & financement',
  'colonnes-montantes-enedis-loi-elan': 'Copropriété',
  'comparatif-fournisseurs-electricite-pro': 'Fournisseurs & contrats',
  'compteur-c4-tarif-hta-entreprise': 'Fournisseurs & contrats',
  'consommation-energie-datacenter': 'Verticaux sectoriels',
  'consommation-energie-restaurant': 'Verticaux sectoriels',
  'contrat-maintenance-p1-p2-p3-cpe': 'Mobilité & bâtiment',
  'corporate-ppa-electricite': 'Renouvelable & solaire',
  'courtier-en-energie-role': 'Fournisseurs & contrats',
  'decret-bacs-obligations': 'Mobilité & bâtiment',
  'decret-tertiaire-obligations': 'Réglementation & fiscalité',
  'decrypter-facture-electricite-pro': 'Fournisseurs & contrats',
  'dpe-collectif-copropriete': 'Copropriété',
  'droit-a-la-prise-copropriete': 'Copropriété',
  'economies-energie-boulangerie': 'Verticaux sectoriels',
  'economies-energie-hotellerie': 'Verticaux sectoriels',
  'effacement-electrique-nebef-entreprise': 'Marché & prix',
  'electricite-clinique-hopital-ehpad': 'Verticaux sectoriels',
  'electricite-exploitation-agricole-hors-solaire': 'Verticaux sectoriels',
  'electricite-parties-communes-copropriete': 'Copropriété',
  'energie-camping-hotellerie-plein-air': 'Verticaux sectoriels',
  'energie-collectivites-marches-publics': 'Verticaux sectoriels',
  'energie-reseau-franchise-multisites': 'Verticaux sectoriels',
  'fonds-chaleur-ademe': 'Aides & financement',
  'garanties-origine-electricite-verte-entreprise': 'Renouvelable & solaire',
  'gtb-gestion-technique-batiment': 'Mobilité & bâtiment',
  'hangar-photovoltaique-agricole': 'Renouvelable & solaire',
  'iso-50001-entreprise': 'Efficacité énergétique',
  'mecanisme-capacite-electricite-entreprise': 'Marché & prix',
  'mentions-obligatoires-facture-electricite-pro': 'Fournisseurs & contrats',
  'ombrieres-photovoltaiques-parking': 'Renouvelable & solaire',
  'pppt-copropriete-plan-pluriannuel-travaux': 'Copropriété',
  'prime-advenir-borne-recharge': 'Aides & financement',
  'prix-fixe-vs-indexe-electricite-pro': 'Fournisseurs & contrats',
  'prix-kwh-professionnel-2026': 'Marché & prix',
  'prix-marche-gros-electricite': 'Marché & prix',
  'puissance-souscrite-entreprise-kva': 'Fournisseurs & contrats',
  're2020-bbio-explication': 'Mobilité & bâtiment',
  'resilier-contrat-electricite-entreprise': 'Fournisseurs & contrats',
  'statut-electro-intensif-turpe-industrie': 'Réglementation & fiscalité',
  'tarifs-horosaisonniers-electricite-pro': 'Fournisseurs & contrats',
  'turpe-2026-professionnels': 'Réglementation & fiscalité',
  'tva-electricite-professionnelle': 'Réglementation & fiscalité',
  'vnu-2026-versement-nucleaire-universel': 'Marché & prix',
};

export const CATEGORY_ORDER = [
  'Marché & prix',
  'Fournisseurs & contrats',
  'Réglementation & fiscalité',
  'Efficacité énergétique',
  'Renouvelable & solaire',
  'Aides & financement',
  'Verticaux sectoriels',
  'Mobilité & bâtiment',
  'Copropriété',
];

/** Échappe les caractères utilisés par les attributs HTML si jamais un titre en contenait. */
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/** Convertit le markdown inline (gras, liens internes) d'une portion de texte en HTML. */
export function inlineMarkdownToHtml(text) {
  let html = text;
  html = html.replace(/\[([^\]]+)\]\(([a-z0-9-]+)\.md\)/g, (_m, label, slug) => `<a href="${slug}.html" class="ilink">${label}</a>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return html;
}

/** Regroupe une suite de lignes brutes en blocs paragraphe / liste. */
export function parseBlocks(lines) {
  const blocks = [];
  let currentList = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') {
      if (currentList) { blocks.push(currentList); currentList = null; }
      continue;
    }
    const ulMatch = line.match(/^-\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
    } else if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
    } else {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'p', text: line });
    }
  }
  if (currentList) blocks.push(currentList);
  return blocks;
}

/** Découpe le markdown d'un article en titre H1 + sections H2. */
export function parseArticleMarkdown(markdown) {
  const lines = markdown.split('\n');
  let idx = 0;
  while (idx < lines.length && !lines[idx].startsWith('# ')) idx++;
  if (idx >= lines.length) throw new Error('Aucun H1 trouvé dans le markdown');
  const title = lines[idx].replace(/^#\s+/, '').trim();

  const sections = [];
  let current = { heading: null, lines: [] };
  for (const line of lines.slice(idx + 1)) {
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      sections.push(current);
      current = { heading: h2[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;

  return { title, sections, wordCount };
}

function blocksToHtml(blocks) {
  return blocks.map((block) => {
    if (block.type === 'p') return `    <p>${inlineMarkdownToHtml(block.text)}</p>`;
    const tag = block.type === 'ul' ? 'ul' : 'ol';
    const items = block.items.map((item) => `      <li>${inlineMarkdownToHtml(item)}</li>`).join('\n');
    return `    <${tag} class="checklist">\n${items}\n    </${tag}>`;
  }).join('\n\n');
}

/** Tronque un texte à ~155 caractères sur une frontière de mot, pour la meta description. */
export function truncateForMeta(text, maxLength = 155) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

/**
 * Construit toutes les données nécessaires au rendu HTML d'un article
 * à partir de son contenu markdown brut et de son slug.
 */
export function buildArticleData(slug, markdown) {
  const { title, sections, wordCount } = parseArticleMarkdown(markdown);
  const category = CATEGORY_BY_SLUG[slug];
  if (!category) throw new Error(`Aucune catégorie définie pour le slug "${slug}"`);

  const introSection = sections[0];
  const introBlocks = parseBlocks(introSection.lines);
  const firstParagraph = introBlocks.find((b) => b.type === 'p');
  const heroIntroRaw = firstParagraph ? firstParagraph.text : '';
  const plainIntro = heroIntroRaw.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const metaDescription = truncateForMeta(plainIntro);
  const blogExcerpt = truncateForMeta(plainIntro, 110);

  const bodySections = sections.slice(1);
  const lastSection = bodySections[bodySections.length - 1];
  const lastSectionBlocks = parseBlocks(lastSection.lines);
  const lastParagraphIdx = [...lastSectionBlocks].map((b) => b.type).lastIndexOf('p');
  const ctaParagraph = lastSectionBlocks[lastParagraphIdx];
  const ctaTitle = lastSection.heading;
  const ctaSub = inlineMarkdownToHtml(ctaParagraph.text);

  const sectionsHtml = bodySections.map((section, sectionIdx) => {
    const isLastSection = sectionIdx === bodySections.length - 1;
    let blocks = parseBlocks(section.lines);
    if (isLastSection) {
      // Le dernier paragraphe de la dernière section devient le CTA, pas un paragraphe du corps.
      blocks = blocks.filter((_, i) => i !== lastParagraphIdx);
    }
    const heading = `    <h2>${inlineMarkdownToHtml(section.heading)}</h2>`;
    const body = blocksToHtml(blocks);
    return body ? `${heading}\n\n${body}` : heading;
  }).join('\n\n');

  const readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

  return {
    slug,
    title,
    category,
    metaDescription,
    blogExcerpt,
    heroIntro: inlineMarkdownToHtml(heroIntroRaw),
    sectionsHtml,
    ctaTitle,
    ctaSub,
    readingTime,
    wordCount,
  };
}

/** Remplace tous les placeholders du gabarit par les données de l'article. */
export function renderArticleHtml(template, data) {
  const replacements = {
    '[TITRE_ARTICLE]': escapeAttr(data.title),
    '[META_DESCRIPTION]': escapeAttr(data.metaDescription),
    '[SLUG]': data.slug,
    '[CATEGORIE]': escapeAttr(data.category),
    '[READING_TIME]': String(data.readingTime),
    '[HERO_INTRO]': data.heroIntro,
    '[SECTIONS_HTML]': data.sectionsHtml,
    '[CTA_TITLE]': escapeAttr(data.ctaTitle),
    '[CTA_SUB]': data.ctaSub,
  };
  let html = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.split(placeholder).join(value);
  }
  return html;
}

export function defaultSourceDir() {
  return path.join(homedir(), 'Documents', 'Energie-Blog-Articles', 'articles');
}

export function buildAllArticles(sourceDir, outputDir) {
  const template = readFileSync(TEMPLATE_PATH, 'utf8');
  const files = readdirSync(sourceDir).filter((f) => f.endsWith('.md')).sort();
  const results = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const markdown = readFileSync(path.join(sourceDir, file), 'utf8');
    const data = buildArticleData(slug, markdown);
    const html = renderArticleHtml(template, data);
    writeFileSync(path.join(outputDir, `${slug}.html`), html);
    results.push(data);
  }
  return results;
}

async function main() {
  const sourceDir = process.argv[2] || defaultSourceDir();
  const outputDir = fileURLToPath(new URL('..', import.meta.url));
  const results = buildAllArticles(sourceDir, outputDir);
  console.log(`Généré ${results.length} pages articles depuis ${sourceDir}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
