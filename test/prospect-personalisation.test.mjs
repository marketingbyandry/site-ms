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

test('aucune ecriture HTML dans le chemin de personnalisation', () => {
  // Garde-fou XSS : sur ce chemin, tout ce qui vient de l_URL passe par
  // textContent. On couvre toutes les voies d_ecriture HTML, pas seulement
  // innerHTML, et les deux fichiers concernes — assets/sector-blocks.js
  // fournit les textes affichés, il fait partie du meme contrat.
  const ECRITURES_HTML = /(innerHTML|outerHTML)\s*[+]?=|insertAdjacentHTML|document\.write|\.srcdoc\s*=/;
  const BLOCKS = readFileSync('assets/sector-blocks.js', 'utf8');

  assert.equal(ECRITURES_HTML.test(HTML), false, 'prospect.html ecrit du HTML au lieu de textContent');
  assert.equal(ECRITURES_HTML.test(BLOCKS), false, 'assets/sector-blocks.js ecrit du HTML au lieu de renvoyer du texte');
});

test('les parametres d_URL ne rejoignent jamais un attribut', () => {
  // Une valeur d_URL posee via setAttribute ouvrirait un vecteur (href
  // javascript:, style, srcset) que textContent ne couvre pas.
  const perso = HTML.slice(HTML.indexOf('LECTURE DES PARAMÈTRES'), HTML.indexOf('Google Tag Manager'));
  assert.equal(/setAttribute/.test(perso), false, 'le bloc de lecture ne doit poser aucun attribut');
});

test('les caracteres invisibles et bidirectionnels sont retires', () => {
  // Un U+202E dans ?nom= inverserait l_ordre d_affichage de la fin du H1.
  assert.match(HTML, /INVISIBLES\s*=\s*\/\[/, 'le filtre de caracteres invisibles a disparu');
  assert.match(HTML, /\\u202a-\\u202e/, 'les marques bidirectionnelles ne sont plus filtrees');
});

test('les parametres de personnalisation sont retires de l_URL affichee', () => {
  // Le nom de l_entreprise demarchee ne doit rester ni dans la barre
  // d_adresse, ni dans l_URL vue par GTM/PostHog, ni dans un repartage.
  assert.match(HTML, /history\.replaceState/);
  for (const param of ['nom', 'secteur', 'accroche']) {
    assert.match(HTML, new RegExp(`propre\\.searchParams\\.delete\\('${param}'\\)`), `${param} reste dans l_URL`);
  }
});

test('la lecture des parametres precede le tag GTM', () => {
  // Place apres, le conteneur GTM recevrait l_URL complete avec le nom du
  // prospect, hors de tout gating de consentement.
  assert.ok(
    HTML.indexOf('LECTURE DES PARAMÈTRES') < HTML.indexOf('Google Tag Manager'),
    'le bloc de lecture doit etre place avant le tag GTM'
  );
});

test('la source de conversion Tally est propre a cette page', () => {
  // Convention du site : une source par page (b2b, b2c, landing-2...). Garder
  // « b2b » rangerait les leads de prospection dans le funnel b2b.
  assert.match(HTML, /openTallyForm\('prospect'\)/);
  assert.equal(/openTallyForm\('b2b'\)/.test(HTML), false);
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
