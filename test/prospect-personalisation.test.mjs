import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const HTML = readFileSync('prospect.html', 'utf8');

test('la page de prospection n_est pas indexable', () => {
  // Une page qui affiche le nom d_un prospect ne doit jamais se retrouver
  // dans un index, ni creer de contenu duplique avec b2b.html.
  assert.match(HTML, /<meta name="robots" content="noindex, follow">/);
  const robots = readFileSync('robots.txt', 'utf8');
  assert.match(robots, /^Disallow: \/prospect\.html$/m);
});

test('la page charge la bibliotheque de blocs sectoriels', () => {
  assert.match(HTML, /<script src="assets\/sector-blocks\.js"><\/script>/);
});

test('les trois parametres d_URL sont lus', () => {
  // Les trois passent par le meme helper read(), qui plafonne la longueur et
  // normalise les espaces — d_ou l_assertion sur l_appel plutot que sur un
  // params.get() ecrit trois fois.
  assert.match(HTML, /read\('nom',\s*\d+\)/);
  assert.match(HTML, /read\('secteur',\s*\d+\)/);
  assert.match(HTML, /read\('accroche',\s*\d+\)/);
  assert.match(HTML, /params\.get\(name\)/, 'le helper doit bien lire la query string');
});

test('aucune valeur d_URL n_est injectee via innerHTML', () => {
  // Garde-fou XSS : sur cette page, tout ce qui vient de l_URL passe par
  // textContent. Une seule occurrence d_innerHTML ici doit faire echouer.
  assert.equal(
    /\.innerHTML\s*=/.test(HTML),
    false,
    'prospect.html ne doit contenir aucune affectation innerHTML'
  );
});

test('le nom du prospect est transmis a Tally', () => {
  assert.match(
    HTML,
    /if\s*\(window\.msProspectNom\)\s*hiddenFields\.entreprise\s*=\s*window\.msProspectNom;/,
    'openTallyForm() dans prospect.html ne transmet plus le nom de l_entreprise a Tally'
  );
});

test('le cablage ref/camp de Tally est preserve', () => {
  assert.match(HTML, /if\s*\(window\.msRef\)\s*hiddenFields\.ref\s*=\s*window\.msRef;/);
  assert.match(HTML, /if\s*\(window\.msCamp\)\s*hiddenFields\.camp\s*=\s*window\.msCamp;/);
});

test('les emplacements personnalisables existent dans le markup', () => {
  for (const id of ['p-h1-nom', 'p-h1-base', 'p-accroche', 'p-secteur', 'p-secteur-titre', 'p-secteur-texte']) {
    assert.match(HTML, new RegExp(`id="${id}"`), `emplacement manquant : ${id}`);
  }
});

test('sans parametre, les emplacements personnalises sont masques', () => {
  // L_etat par defaut du markup est la version generique : jamais de
  // « {nom} » litteral ni de bloc vide visible si le JS ne tourne pas.
  assert.match(HTML, /id="p-accroche"[^>]*class="[^"]*p-hidden/);
  assert.match(HTML, /id="p-secteur"[^>]*class="[^"]*p-hidden/);
  assert.match(HTML, /\.p-hidden\s*\{\s*display:\s*none\s*\}/);
});

test('le H1 par defaut reste la promesse generique du site', () => {
  assert.match(HTML, /id="p-h1-base">Économisez votre énergie, <\/span><em>nous négocions votre contrat\.<\/em>/);
});
