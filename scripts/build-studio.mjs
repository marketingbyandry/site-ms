#!/usr/bin/env node
/* ════════════════════════════════════════
   STUDIO J1–J20 : une source, deux affichages

   Source (à modifier) :
     content/campagne-q4-2026-commercants/studio/studio.json   jours + visuels
     content/campagne-q4-2026-commercants/studio/posts/*.md    textes des posts
     approbation-media/                                         photos et vidéos
     assets/studio/studio.css, assets/studio/studio.js          rendu partagé

   Sorties :
     npm run build:studio
       → approbation.html (bloc STUDIO:BEGIN/END) et lib/approbation-posts.mjs
         (identifiants des posts que l'API accepte)
     node scripts/build-studio.mjs --artifact <artefact.html> <sortie.html>
       → même bloc dans l'artefact, et mêmes textes dans son calendrier ;
         republier ensuite l'artefact (fichiers photos/ et videos/ compris)

   Un test échoue si approbation.html ou lib/approbation-posts.mjs ne
   correspondent plus à la source.
   ════════════════════════════════════════ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'content/campagne-q4-2026-commercants/studio');
const BEGIN = '<!-- STUDIO:BEGIN (généré par scripts/build-studio.mjs, ne pas modifier ici) -->';
const END = '<!-- STUDIO:END -->';
const PLAT_CODES = ['LI', 'FB', 'IG', 'X'];

const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

export function loadStudio() {
  const studio = JSON.parse(readFileSync(path.join(SRC, 'studio.json'), 'utf8'));
  studio.jours = studio.jours.map((j) => ({ ...j, post: readFileSync(path.join(SRC, 'posts', `${j.date}.md`), 'utf8') }));
  return studio;
}

export function postIds(studio) {
  return studio.jours.flatMap((j) => PLAT_CODES.map((c) => `J${j.jour}-${c}`));
}

// JSON sûr dans un <script> : aucun « </ » ne peut fermer la balise.
const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export function studioBlock(studio) {
  return [
    BEGIN,
    `<style>\n${read('assets/studio/studio.css')}</style>`,
    `<script id="studio-data" type="application/json">${scriptJson(studio)}</script>`,
    `<script>\n${read('assets/studio/studio.js')}</script>`,
    END
  ].join('\n');
}

export function injectBlock(html, block) {
  const a = html.indexOf(BEGIN.slice(0, 18));
  const b = html.indexOf(END);
  if (a === -1 || b === -1) throw new Error('marqueurs STUDIO:BEGIN / STUDIO:END introuvables');
  return html.slice(0, a) + block + html.slice(b + END.length);
}

export function postsModule(studio) {
  return `// Généré par scripts/build-studio.mjs à partir de
// content/campagne-q4-2026-commercants/studio/ : ne pas modifier à la main.
export const CAMPAIGN = ${JSON.stringify(studio.campagne)};
export const POST_IDS = ${JSON.stringify(postIds(studio))};
`;
}

// L'artefact garde ses textes de calendrier dans <script id="data"> :
// on y remplace aussi les jours du Studio pour qu'ils restent identiques.
export function patchArtifact(html, studio) {
  const re = /(<script id="data" type="application\/json">)([\s\S]*?)(<\/script>)/;
  const m = html.match(re);
  if (!m) throw new Error('bloc <script id="data"> introuvable dans l’artefact');
  const data = JSON.parse(m[2]);
  for (const j of studio.jours) data.posts[j.date] = j.post;
  const withData = html.replace(re, () => m[1] + scriptJson(data) + m[3]);
  return injectBlock(withData, studioBlock(studio));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const studio = loadStudio();
  const args = process.argv.slice(2);
  if (args[0] === '--artifact') {
    const [, input, output] = args;
    if (!input || !output) throw new Error('usage : --artifact <artefact.html> <sortie.html>');
    writeFileSync(output, patchArtifact(readFileSync(input, 'utf8'), studio));
    console.log(`Artefact mis à jour : ${output} (${studio.jours.length} jours)`);
  } else {
    const file = path.join(ROOT, 'approbation.html');
    writeFileSync(file, injectBlock(readFileSync(file, 'utf8'), studioBlock(studio)));
    writeFileSync(path.join(ROOT, 'lib/approbation-posts.mjs'), postsModule(studio));
    console.log(`approbation.html et lib/approbation-posts.mjs régénérés (${postIds(studio).length} posts)`);
  }
}
