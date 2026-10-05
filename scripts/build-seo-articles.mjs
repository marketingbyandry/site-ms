// scripts/build-seo-articles.mjs
//
// Génère une page HTML par article SEO à partir des fichiers markdown du
// corpus "Energie-Blog-Articles" (52 articles, rédigés hors dépôt) et du
// gabarit templates/blog-article-template.html.
//
// Usage : node scripts/build-seo-articles.mjs [dossier-source-markdown]
// Par défaut, le dossier source est ~/Documents/Energie-Blog-Articles/articles

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { loadPartials, applyPartials, loadSite } from './build-partials.mjs';

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

export const HAND_CRAFTED_MARKER = '<!-- layout:v2';

export function isHandCrafted(file) {
  return existsSync(file) && readFileSync(file, 'utf8').includes(HAND_CRAFTED_MARKER);
}

// ── Gabarit v2 (sommaire collant, modules, CTA intercalés) ──────────────
// Les articles listés dans data/articles-v2.json sont rendus avec
// templates/blog-article-v2-template.html. Le fichier JSON porte aussi la
// couche éditoriale (sommaire court, « L'essentiel », notes de marge) : elle
// reformule ou cite l'article, sans jamais ajouter de fait ni de chiffre.

export const TEMPLATE_V2_PATH = new URL('../templates/blog-article-v2-template.html', import.meta.url);
export const V2_DATA_PATH = new URL('../data/articles-v2.json', import.meta.url);

export function loadV2Data() {
  return existsSync(V2_DATA_PATH) ? JSON.parse(readFileSync(V2_DATA_PATH, 'utf8')) : {};
}

const STRONG_CTA = {
  eyebrow: 'Et sur votre facture&nbsp;?',
  title: 'Combien pourriez-vous économiser&nbsp;?',
  button: 'Calculer mon écart réel →',
};

// CTA secondaire (après le premier tiers), formulé selon la catégorie de l'article.
export const SOFT_CTA_BY_CATEGORY = {
  'Fournisseurs & contrats': { eyebrow: 'Appliquez-le à votre contrat', title: 'Votre contrat actuel est-il vraiment adapté&nbsp;?', text: 'Envoyez votre dernière facture : nous vérifions votre offre, votre engagement et vos frais.', button: 'Faire vérifier mon contrat →' },
  'Marché & prix': { eyebrow: 'Et pour votre entreprise&nbsp;?', title: 'Votre prix est-il cohérent avec le marché actuel&nbsp;?', text: 'Envoyez votre dernière facture : nous la confrontons aux offres réellement disponibles aujourd\'hui.', button: 'Comparer mon prix au marché →' },
  'Réglementation & fiscalité': { eyebrow: 'Vérifiez votre facture', title: 'Ces lignes sont-elles justes sur votre facture&nbsp;?', text: 'Envoyez votre dernière facture : nous vérifions taxes, acheminement et options tarifaires.', button: 'Faire vérifier ma facture →' },
  'Verticaux sectoriels': { eyebrow: 'Pour votre activité', title: 'Votre établissement paie-t-il le bon prix&nbsp;?', text: 'Envoyez votre dernière facture : nous la comparons aux offres disponibles pour votre activité.', button: 'Faire analyser ma facture →' },
};
const DEFAULT_SOFT_CTA = SOFT_CTA_BY_CATEGORY['Fournisseurs & contrats'];

export const FINAL_CTA_TITLE = 'Votre facture, analysée gratuitement';

/** Identifiant d'ancre lisible à partir d'un titre de section. */
export function slugifyHeading(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\*\*|\[|\]\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50).replace(/-$/, '');
}

/** « **Titre** : suite » → { lead, rest } ; null si l'item ne commence pas par du gras. */
export function splitLead(item) {
  const m = item.match(/^\*\*([^*]+)\*\*\s*[:,.–—-]?\s*(.*)$/);
  if (!m) return null;
  const lead = m[1].trim().replace(/[:.]$/, '');
  const rest = m[2].trim();
  return { lead, rest: rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : '' };
}

/** Positions des deux CTA intercalés parmi n sections de corps (hors section finale). */
export function inlineCtaSlots(n) {
  if (n < 2) return { soft: n - 1, strong: -1 };
  const soft = Math.floor((n - 1) / 3);
  const strong = Math.max(soft + 1, Math.floor((2 * (n - 1)) / 3));
  return { soft, strong: strong < n ? strong : -1 };
}

const IND = '        ';

function listToHtmlV2(block) {
  const leads = block.items.map(splitLead);
  if (leads.every(Boolean)) {
    if (block.type === 'ol') {
      const items = leads.map((l, i) => `${IND}  <li style="--dot: var(--green)">\n${IND}    <div>\n${IND}      <span class="when">Étape ${i + 1}</span>\n${IND}      <h3>${inlineMarkdownToHtml(l.lead)}</h3>\n${l.rest ? `${IND}      <p>${inlineMarkdownToHtml(l.rest)}</p>\n` : ''}${IND}    </div>\n${IND}  </li>`).join('\n');
      return `${IND}<ol class="timeline">\n${items}\n${IND}</ol>`;
    }
    const items = leads.map((l, i) => `${IND}  <li>\n${IND}    <div class="head"><span class="n">${String(i + 1).padStart(2, '0')}</span></div>\n${IND}    <h3>${inlineMarkdownToHtml(l.lead)}</h3>\n${l.rest ? `${IND}    <p>${inlineMarkdownToHtml(l.rest)}</p>\n` : ''}${IND}  </li>`).join('\n');
    return `${IND}<ul class="criteria wide">\n${items}\n${IND}</ul>`;
  }
  const tag = block.type === 'ul' ? 'ul' : 'ol';
  const items = block.items.map((item) => `${IND}  <li>${inlineMarkdownToHtml(item)}</li>`).join('\n');
  return `${IND}<${tag} class="checklist">\n${items}\n${IND}</${tag}>`;
}

function noteHtml(note) {
  const cls = note.quote ? 'note quote' : 'note';
  const label = note.quote ? '' : `\n${IND}  <span class="note-k">${note.label || 'À retenir'}</span>`;
  const text = note.quote ? `«&nbsp;${note.text}&nbsp;»` : note.text;
  return `${IND}<aside class="${cls}">${label}\n${IND}  <p>${inlineMarkdownToHtml(text)}</p>\n${IND}</aside>`;
}

function softCtaHtml(category) {
  const c = SOFT_CTA_BY_CATEGORY[category] || DEFAULT_SOFT_CTA;
  return `${IND}<aside class="cta-inline wide" aria-label="${c.button.replace(' →', '')}">
${IND}  <div>
${IND}    <p class="eyebrow">${c.eyebrow}</p>
${IND}    <p class="t">${c.title}</p>
${IND}    <p class="s">${c.text}</p>
${IND}  </div>
${IND}  <div class="actions">
${IND}    <a href="b2b.html#upload" class="cta-btn cta-btn--ghost">${c.button}</a>
${IND}    <span class="micro">Gratuit · Sans engagement · Réponse sous 24h</span>
${IND}  </div>
${IND}</aside>`;
}

function strongCtaHtml() {
  return `${IND}<aside class="cta-inline wide" aria-label="Calculer votre écart réel">
${IND}  <div>
${IND}    <p class="eyebrow">${STRONG_CTA.eyebrow}</p>
${IND}    <p class="t">${STRONG_CTA.title}</p>
${IND}    <ol class="steps">
${IND}      <li>Vous envoyez votre dernière facture d'électricité</li>
${IND}      <li>Nous la confrontons aux offres réellement disponibles</li>
${IND}      <li>Vous savez si un changement est pertinent</li>
${IND}    </ol>
${IND}  </div>
${IND}  <div class="actions">
${IND}    <a href="b2b.html#upload" class="cta-btn cta-btn--inline">${STRONG_CTA.button}</a>
${IND}    <a href="ms-strategy-calculateur.html" class="alt hit">ou faire une première estimation en ligne →</a>
${IND}    <span class="micro">Gratuit · Données confidentielles · Réponse sous 24h</span>
${IND}  </div>
${IND}</aside>`;
}

/** Rend les blocs d'une section ; la note éventuelle se place après le premier paragraphe. */
function sectionBodyV2(blocks, notes) {
  const out = [];
  let noteDone = notes.length === 0;
  for (const block of blocks) {
    out.push(block.type === 'p' ? `${IND}<p>${inlineMarkdownToHtml(block.text)}</p>` : listToHtmlV2(block));
    if (!noteDone && block.type === 'p') { out.push(...notes.map(noteHtml)); noteDone = true; }
  }
  if (!noteDone) out.push(...notes.map(noteHtml));
  return out.join('\n\n');
}

export function buildArticleDataV2(slug, markdown, editorial = {}) {
  const base = buildArticleData(slug, markdown);
  const { sections } = parseArticleMarkdown(markdown);
  const bodySections = sections.slice(1);
  const finalSection = bodySections[bodySections.length - 1];
  const middle = bodySections.slice(0, -1);
  const { soft, strong } = { ...inlineCtaSlots(middle.length), ...(editorial.ctaSlots || {}) };
  const notes = editorial.notes || [];
  const tocLabels = editorial.toc || [];

  const used = new Set();
  const ids = middle.map((s) => {
    let id = slugifyHeading(s.heading) || 'section';
    while (used.has(id)) id += '-2';
    used.add(id);
    return id;
  });

  const sectionsHtml = middle.map((section, i) => {
    const blocks = parseBlocks(section.lines);
    const body = sectionBodyV2(blocks, notes.filter((n) => n.section === i));
    const ctas = [i === soft ? softCtaHtml(base.category) : '', i === strong ? strongCtaHtml() : ''].filter(Boolean);
    return [`      <section class="v2-section" id="${ids[i]}">`, `${IND}<h2>${inlineMarkdownToHtml(section.heading)}</h2>`, body, ...ctas, '      </section>']
      .filter(Boolean).join('\n\n');
  }).join('\n\n');

  const plain = (t) => t.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const tocHtml = [
    ...middle.map((s, i) => `        <li><a href="#${ids[i]}">${escapeAttr(tocLabels[i] || plain(s.heading))}</a></li>`),
    `        <li><a href="#votre-etude">${escapeAttr(tocLabels[middle.length] || 'Votre étude gratuite')}</a></li>`,
  ].join('\n');

  const tldrHtml = editorial.tldr && editorial.tldr.length
    ? `\n    <div class="tldr" role="list" aria-label="L'essentiel en 30 secondes">\n${editorial.tldr.map((t) => `      <div class="tldr-item" role="listitem"><span class="tldr-k">${t.k}</span><p>${inlineMarkdownToHtml(t.text)}</p></div>`).join('\n')}\n    </div>`
    : '';

  // Section finale : son dernier paragraphe devient le texte du CTA, le reste reste en corps.
  const finalBlocks = parseBlocks(finalSection.lines);
  const lastP = finalBlocks.map((b) => b.type).lastIndexOf('p');
  const finalBody = sectionBodyV2(finalBlocks.filter((_, i) => i !== lastP), notes.filter((n) => n.section === middle.length));

  return {
    ...base,
    sectionsHtml,
    tocHtml,
    tldrHtml,
    ctaHeading: inlineMarkdownToHtml(finalSection.heading),
    ctaSectionBody: finalBody,
    ctaTitle: editorial.ctaTitle || FINAL_CTA_TITLE,
  };
}

/** Espaces insécables avant %, €, unités et ponctuation double, dans le contenu de <main> seulement. */
export function frenchSpacing(html) {
  const start = html.indexOf('<main');
  const end = html.indexOf('</main>');
  if (start < 0 || end < 0) return html;
  const body = html.slice(start, end).replace(/>([^<]+)</g, (_m, text) => `>${text
    .replace(/(\d) (%|€|kVA|kWh|MWh|ans?\b)/g, '$1&nbsp;$2')
    .replace(/ ([:;?!»])/g, '&nbsp;$1')
    .replace(/« /g, '«&nbsp;')}<`);
  return html.slice(0, start) + body + html.slice(end);
}

export function renderArticleHtmlV2(template, data) {
  let html = renderArticleHtml(template, data);
  const more = {
    '[TLDR_HTML]': data.tldrHtml,
    '[TOC_HTML]': data.tocHtml,
    '[CTA_HEADING]': data.ctaHeading,
    '[CTA_SECTION_BODY]': data.ctaSectionBody,
  };
  for (const [placeholder, value] of Object.entries(more)) html = html.split(placeholder).join(value);
  return frenchSpacing(html);
}

/** Les sources markdown peuvent annoncer un délai périmé : data/site.json fait foi. */
export function alignDelays(html, delai) {
  return html.replace(/((?:sous|en moins de)\s)(\d+)( ?(?:h|heures)\b)/gi, (_m, a, _n, b) => `${a}${delai}${b}`);
}

export function buildAllArticles(sourceDir, outputDir, v2Data = loadV2Data()) {
  // Les blocs partagés (bouton flottant, réassurance…) sont rendus depuis
  // partials/ + data/site.json, pour ne jamais figer une valeur périmée.
  const partials = loadPartials();
  const template = applyPartials(readFileSync(TEMPLATE_PATH, 'utf8'), partials);
  const templateV2 = applyPartials(readFileSync(TEMPLATE_V2_PATH, 'utf8'), partials);
  const delai = Number.parseInt(loadSite().delai, 10);
  const files = readdirSync(sourceDir).filter((f) => f.endsWith('.md')).sort();
  const results = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const markdown = readFileSync(path.join(sourceDir, file), 'utf8');
    const isV2 = Object.hasOwn(v2Data, slug);
    const data = isV2 ? buildArticleDataV2(slug, markdown, v2Data[slug]) : buildArticleData(slug, markdown);
    const html = alignDelays(isV2 ? renderArticleHtmlV2(templateV2, data) : renderArticleHtml(template, data), delai);
    const target = path.join(outputDir, `${slug}.html`);
    // Une page passée en mise en page v2 est retouchée à la main : on ne l'écrase pas.
    if (isHandCrafted(target)) { results.push(data); continue; }
    writeFileSync(target, html);
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
