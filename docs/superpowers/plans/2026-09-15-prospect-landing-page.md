# Landing page personnalisée de prospection — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer `prospect.html`, une landing page de démarchage dont le H1, un bloc argumentaire sectoriel et une accroche personnalisée se remplissent depuis les paramètres d'URL, utilisable pour n'importe quel prospect quel que soit son secteur.

**Architecture:** Page statique autonome calquée sur `b2b.html`. Trois paramètres d'URL (`nom`, `secteur`, `accroche`) sont lus côté client et injectés exclusivement via `textContent`. Le secteur est matché par mots-clés contre une bibliothèque extensible de blocs (`assets/sector-blocks.js`, fonctions pures testables en Node via `vm`), avec repli générique si aucun mot-clé ne correspond. L'attribution `ref`/`camp` réutilise le middleware edge existant sans nouvelle whitelist.

**Tech Stack:** HTML/CSS/JS vanilla (pas de framework, pas de build pour le HTML), Vercel Edge Middleware (`middleware.js`), tests `node --test` (`node:test` + `node:assert/strict` + `node:vm`), scripts Node ESM (`.mjs`).

**Spec:** `docs/superpowers/specs/2026-09-08-prospect-landing-page-design.md`

> ⚠️ **Plan exécuté, conservé comme trace.** Les argumentaires cimenterie et
> data center qu'il contient affirmaient une éligibilité électro-intensive sans
> condition : corrigé en relecture (commit `a646eb2`). Ne pas recopier les
> textes d'ici — la version qui fait foi est `assets/sector-blocks.js`, et la
> règle de rédaction est dans la spec.

## Global Constraints

- Site statique : aucune étape de build pour le HTML ni pour `assets/sector-blocks.js` — le fichier est écrit à la main et commité tel quel (seul `assets/analytics.js` est généré).
- Aucune valeur issue de l'URL ne passe par `innerHTML` ni par une template string HTML : `textContent` exclusivement.
- CSP inchangée (`vercel.json`) : aucun domaine externe nouveau, `assets/sector-blocks.js` est same-origin.
- `npm test` (soit `node --test test/*.test.mjs`) doit passer à la fin de chaque tâche.
- Les fichiers CSV de prospects restent hors du dépôt (données de prospection avec numéros de téléphone) — jamais de `git add` sur un CSV de leads.
- Messages de commit en français, style du dépôt, avec le trailer `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Textes de la page en français, ton du site existant (`b2b.html`).

---

### Task 1: Bibliothèque de blocs sectoriels

**Files:**
- Create: `assets/sector-blocks.js`
- Test: `test/sector-blocks.test.mjs`

**Interfaces:**
- Consumes: rien (première tâche).
- Produces: global navigateur `window.MSSectorBlocks` avec deux fonctions pures :
  - `match(secteurRaw: string) => { titre: string, texte: string } | null` — `null` si `secteurRaw` est vide/absent ou si aucun mot-clé ne correspond.
  - `fallback(secteurRaw: string) => { titre: string, texte: string } | null` — `null` si `secteurRaw` est vide, sinon bloc générique interpolant le texte brut.
  - Les deux renvoient du **texte brut** (jamais du HTML) : la page injecte `titre` et `texte` via `textContent`.

- [ ] **Step 1: Write the failing test**

Créer `test/sector-blocks.test.mjs` :

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync('assets/sector-blocks.js', 'utf8');

// Execute assets/sector-blocks.js dans un contexte minimal (window seul : le
// fichier ne doit toucher au DOM d_aucune facon, c_est ce qui le rend
// testable ici et reutilisable ailleurs).
function load() {
  const context = {};
  context.window = context;
  vm.createContext(context);
  vm.runInContext(SOURCE, context);
  return context.MSSectorBlocks;
}

test('chaque secteur connu trouve son bloc', () => {
  const { match } = load();
  assert.equal(match('Cimenterie').titre, 'Cimenterie');
  assert.equal(match('Blanchisserie industrielle').titre, 'Blanchisserie industrielle');
  assert.equal(match('Data center / HPC').titre, 'Data center');
  assert.equal(match('Logistique frigorifique').titre, 'Logistique frigorifique');
  assert.equal(match('Papeterie/pâte à papier').titre, 'Papeterie');
  assert.equal(match('Verrerie/flaconnage').titre, 'Verrerie industrielle');
});

test('le matching ignore la casse et les accents', () => {
  const { match } = load();
  assert.equal(match('PÂTE À PAPIER').titre, 'Papeterie');
  assert.equal(match('pate a papier').titre, 'Papeterie');
  assert.equal(match('DATACENTER').titre, 'Data center');
});

test('chaque bloc porte un argumentaire non vide', () => {
  const { match } = load();
  for (const secteur of ['Cimenterie', 'Blanchisserie', 'Data center', 'Frigorifique', 'Papeterie', 'Verrerie']) {
    const bloc = match(secteur);
    assert.ok(bloc && bloc.texte.length > 40, `bloc vide ou trop court pour ${secteur}`);
  }
});

test('un secteur inconnu ne produit aucune correspondance', () => {
  const { match } = load();
  assert.equal(match('Agriculture'), null);
  assert.equal(match('Restauration'), null);
});

test('un secteur absent ou vide ne produit aucune correspondance', () => {
  const { match } = load();
  assert.equal(match(''), null);
  assert.equal(match('   '), null);
  assert.equal(match(null), null);
  assert.equal(match(undefined), null);
});

test('le repli generique reprend le texte brut du secteur', () => {
  const { fallback } = load();
  const bloc = fallback('Hôtellerie de plein air');
  assert.ok(bloc.texte.includes('Hôtellerie de plein air'), 'le repli doit citer le secteur tel quel');
  assert.ok(bloc.titre.length > 0);
});

test('le repli ne se declenche pas sur un secteur vide', () => {
  const { fallback } = load();
  assert.equal(fallback(''), null);
  assert.equal(fallback(null), null);
});

test('le repli ne renvoie jamais de HTML a interpreter', () => {
  const { fallback } = load();
  const bloc = fallback('<img src=x onerror=alert(1)>');
  // La page injecte via textContent : le contenu reste du texte, la
  // bibliotheque ne doit surtout pas le pre-echapper ni le baliser.
  assert.ok(bloc.texte.includes('<img src=x onerror=alert(1)>'));
  assert.ok(!bloc.texte.includes('&lt;'), 'aucun echappement ici : c_est le role de textContent');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/sector-blocks.test.mjs`
Expected: FAIL — `ENOENT: no such file or directory, open 'assets/sector-blocks.js'`

- [ ] **Step 3: Write the implementation**

Créer `assets/sector-blocks.js` :

```javascript
/* ════════════════════════════════════════
   BLOCS ARGUMENTAIRES PAR SECTEUR — prospect.html

   Chaque entree associe des mots-cles a un argumentaire court, affiche sous
   le hero de la landing de prospection quand l_URL porte ?secteur=<texte>.

   Bibliotheque volontairement ouverte : un nouveau secteur demarche = une
   entree de plus ici, sans toucher a prospect.html. Un secteur pas encore
   couvert n_est jamais une page cassee — MSSectorBlocks.fallback() produit
   un bloc generique a partir du texte brut du parametre.

   Les mots-cles sont ecrits DEJA normalises (minuscules, sans accents) :
   c_est sous cette forme que le texte entrant leur est compare.

   Ces fonctions sont pures et ne touchent pas au DOM — c_est ce qui permet
   de les tester dans un contexte Node (test/sector-blocks.test.mjs) et a
   prospect.html d_injecter leur sortie via textContent.
   ════════════════════════════════════════ */
(function () {
  var BLOCKS = [
    {
      keywords: ['ciment'],
      titre: 'Cimenterie',
      texte: "Les cimenteries sont éligibles aux tarifs réduits électro-intensifs (NAF 23.51Z) : nous vérifions votre éligibilité et la faisons valoir dans la négociation, en plus de la mise en concurrence des fournisseurs."
    },
    {
      keywords: ['blanchisserie', 'pressing'],
      titre: 'Blanchisserie industrielle',
      texte: "Séchage, repassage, eau chaude : les blanchisseries industrielles comptent parmi les activités les plus consommatrices d’énergie du secteur des services. Un poste sur lequel la mise en concurrence pèse lourd."
    },
    {
      keywords: ['data center', 'datacenter', 'cloud', 'hpc'],
      titre: 'Data center',
      texte: "Les data centers sont éligibles au tarif réduit électro-intensif dédié (NAF 63.11Z) : nous nous assurons qu’il est bien appliqué, en plus de la mise en concurrence de l’ensemble des fournisseurs du marché."
    },
    {
      keywords: ['frigorifique', 'froid'],
      titre: 'Logistique frigorifique',
      texte: "Le froid industriel tourne 24h/24 : la facture d’électricité est un poste fixe et lourd, sur lequel une renégociation bien menée produit un effet immédiat et durable."
    },
    {
      keywords: ['papeterie', 'pate a papier', 'papetier'],
      titre: 'Papeterie',
      texte: "Séchage du papier, production de pâte : la papeterie est l’un des secteurs industriels les plus intensifs en énergie, potentiellement éligible aux tarifs réduits électro-intensifs."
    },
    {
      keywords: ['verrerie', 'flaconnage', 'verrier'],
      titre: 'Verrerie industrielle',
      texte: "Fours à haute température, fusion continue : la verrerie industrielle a un profil de consommation qui justifie une étude tarifaire dédiée, au-delà de la simple mise en concurrence."
    }
  ];

  var FALLBACK_TITRE = 'Votre secteur';

  // Minuscules + suppression des accents, pour que « Pâte à papier »,
  // « PATE A PAPIER » et « pate a papier » tombent tous sur la meme entree.
  // \u0300-\u036f = diacritiques combinants isoles par la decomposition NFD.
  function normalize(value) {
    if (typeof value !== 'string') return '';
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function match(secteurRaw) {
    var needle = normalize(secteurRaw);
    if (!needle) return null;
    for (var i = 0; i < BLOCKS.length; i++) {
      var block = BLOCKS[i];
      for (var j = 0; j < block.keywords.length; j++) {
        if (needle.indexOf(block.keywords[j]) !== -1) {
          return { titre: block.titre, texte: block.texte };
        }
      }
    }
    return null;
  }

  // Repli pour tout secteur pas encore couvert par BLOCKS : on cite le texte
  // brut du parametre (injecte ensuite via textContent, donc jamais
  // interprete comme du HTML).
  function fallback(secteurRaw) {
    if (typeof secteurRaw !== 'string' || !secteurRaw.trim()) return null;
    var secteur = secteurRaw.trim();
    return {
      titre: FALLBACK_TITRE,
      texte: 'Votre activite (' + secteur + ') implique une consommation d_energie qui pese sur vos charges. Nous la mettons en concurrence entre tous les fournisseurs du marche pour la reduire, gratuitement et sans engagement.'
    };
  }

  window.MSSectorBlocks = { match: match, fallback: fallback };
})();
```

Note : les `keywords` s'écrivent **sans accents et en minuscules** (ils sont comparés au texte déjà normalisé), tandis que `titre` et `texte` portent la typographie française complète — ce sont des textes lus par les prospects.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/sector-blocks.test.mjs`
Expected: PASS (8 tests)

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS, aucune régression

- [ ] **Step 6: Commit**

```bash
git add assets/sector-blocks.js test/sector-blocks.test.mjs
git commit -m "Bibliotheque de blocs argumentaires par secteur"
```

---

### Task 2: Page `prospect.html`

**Files:**
- Create: `prospect.html` (copie adaptée de `b2b.html`)
- Modify: `robots.txt`
- Test: `test/prospect-personalisation.test.mjs`

**Interfaces:**
- Consumes: `window.MSSectorBlocks.match()` / `.fallback()` (Task 1), `window.msRef` / `window.msCamp` (`assets/ref.js`, existant).
- Produces: `window.msProspectNom: string | null` — nom d'entreprise nettoyé, lu par `openTallyForm()` pour le champ caché `entreprise`.

- [ ] **Step 1: Write the failing test**

Créer `test/prospect-personalisation.test.mjs` :

```javascript
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
  assert.match(HTML, /params\.get\('nom'\)/);
  assert.match(HTML, /params\.get\('secteur'\)/);
  assert.match(HTML, /params\.get\('accroche'\)/);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/prospect-personalisation.test.mjs`
Expected: FAIL — `ENOENT: no such file or directory, open 'prospect.html'`

- [ ] **Step 3: Créer la page à partir de `b2b.html`**

```bash
cp b2b.html prospect.html
```

- [ ] **Step 4: Adapter le `<head>`**

Dans `prospect.html`, remplacer la ligne `<link rel="canonical" href="https://cabinetms.fr/b2b.html">` par le bloc suivant, et supprimer les balises `og:url`, `og:title`, `og:description`, `twitter:*` qui décrivent la page B2B publique :

```html
<meta name="robots" content="noindex, follow">
```

Remplacer aussi le `<title>` et la `<meta name="description">` par :

```html
<title>Étude énergie pour votre entreprise | M&S Strategy</title>
<meta name="description" content="Étude gratuite de vos contrats gaz et électricité : mise en concurrence de tous les fournisseurs du marché, résultat sous 24h.">
```

Supprimer la ligne `<meta name="keywords" ...>` (inutile sur une page non indexée).

- [ ] **Step 5: Ajouter la règle CSS de masquage**

Dans le bloc `<style>` de `prospect.html`, juste après la fermeture du bloc `:root{...}`, ajouter :

```css
.p-hidden{display:none}
.p-accroche{max-width:700px;margin:1.2rem 0 0;font-size:1.05rem;line-height:1.6;color:var(--cream);opacity:.92;border-left:2px solid var(--teal-light);padding-left:1rem}
.p-secteur{padding:0 5vw 2rem;max-width:1100px;margin:0 auto}
.p-secteur-in{max-width:700px}
```

- [ ] **Step 6: Adapter le markup du hero**

Dans `prospect.html`, remplacer la ligne du H1 :

```html
    <h1 class="ph1 reveal d1">Économisez votre énergie, <em>nous négocions votre contrat.</em></h1>
```

par :

```html
    <h1 class="ph1 reveal d1"><span id="p-h1-nom"></span><span id="p-h1-base">Économisez votre énergie, </span><em>nous négocions votre contrat.</em></h1>
    <p id="p-accroche" class="p-accroche p-hidden"></p>
```

- [ ] **Step 7: Ajouter la section du bloc sectoriel**

Juste après la fermeture de `</section>` du hero (`<!-- HERO -->`), avant `<!-- SEO INTRO -->`, insérer :

```html
<!-- BLOC SECTORIEL (rempli depuis ?secteur=, voir assets/sector-blocks.js) -->
<section id="p-secteur" class="p-secteur p-hidden">
  <div class="p-secteur-in">
    <span class="stag" id="p-secteur-titre"></span>
    <p class="sbody" id="p-secteur-texte"></p>
  </div>
</section>
```

- [ ] **Step 8: Charger la bibliothèque et brancher la personnalisation**

Dans `prospect.html`, juste après `<script src="assets/ref.js"></script>`, insérer :

```html
<script src="assets/sector-blocks.js"></script>
<script>
/* ════════════════════════════════════════
   PERSONNALISATION DEPUIS L_URL

   ?nom=      nom de l_entreprise demarchee (H1 + champ cache Tally)
   ?secteur=  secteur d_activite, texte libre, matche par mots-cles contre
              assets/sector-blocks.js (repli generique si inconnu)
   ?accroche= phrase courte personnalisee, redigee au cas par cas

   Les trois valeurs viennent de l_URL, donc d_une source non fiable : elles
   ne sont ecrites que via textContent, jamais via innerHTML. Les longueurs
   sont plafonnees pour qu_une URL fabriquee ne disloque pas la mise en page.

   Sans parametre, le markup reste dans son etat par defaut : la page est la
   version generique B2B, sans nom ni bloc sectoriel.
   ════════════════════════════════════════ */
(function () {
  var params = new URLSearchParams(window.location.search);

  function read(name, maxLength) {
    var value = (params.get(name) || '').replace(/\s+/g, ' ').trim();
    return value ? value.slice(0, maxLength) : '';
  }

  var nom = read('nom', 80);
  var secteur = read('secteur', 80);
  var accroche = read('accroche', 240);

  // Lu par openTallyForm() plus bas : le commercial retrouve le prospect
  // dans Tally sans avoir a recouper l_horodatage.
  window.msProspectNom = nom || null;

  if (nom) {
    document.getElementById('p-h1-nom').textContent = nom + ', ';
    document.getElementById('p-h1-base').textContent = 'économisez sur votre énergie — ';
  }

  if (accroche) {
    var accrocheEl = document.getElementById('p-accroche');
    accrocheEl.textContent = accroche;
    accrocheEl.classList.remove('p-hidden');
  }

  var bloc = window.MSSectorBlocks
    ? (window.MSSectorBlocks.match(secteur) || window.MSSectorBlocks.fallback(secteur))
    : null;

  if (bloc) {
    document.getElementById('p-secteur-titre').textContent = bloc.titre;
    document.getElementById('p-secteur-texte').textContent = bloc.texte;
    document.getElementById('p-secteur').classList.remove('p-hidden');
  }
})();
</script>
```

- [ ] **Step 9: Transmettre le nom à Tally**

Dans `openTallyForm()` de `prospect.html`, après la ligne `if (window.msCamp) hiddenFields.camp = window.msCamp;`, ajouter :

```javascript
  // Nom de l'entreprise démarchée (voir le bloc de personnalisation plus
  // bas). Nécessite le champ caché « entreprise » côté éditeur Tally, sinon
  // la valeur est ignorée silencieusement — même limite que « ref »/« camp ».
  if (window.msProspectNom) hiddenFields.entreprise = window.msProspectNom;
```

- [ ] **Step 10: Exclure la page du crawl**

Dans `robots.txt`, après `Disallow: /merci-facture.html`, ajouter :

```
Disallow: /prospect.html
```

- [ ] **Step 11: Vérifier qu'aucun `innerHTML` ne subsiste**

Run: `grep -n "innerHTML" prospect.html`
Expected: aucune sortie (code de retour 1). Si `b2b.html` en contenait, remplacer l'occurrence par une écriture `textContent` équivalente avant de continuer.

- [ ] **Step 12: Run tests to verify they pass**

Run: `node --test test/prospect-personalisation.test.mjs`
Expected: PASS (9 tests)

- [ ] **Step 13: Vérification manuelle dans un navigateur**

```bash
npx --yes serve -l 4173 . >/dev/null 2>&1 &
```

Ouvrir successivement :
- `http://localhost:4173/prospect.html` → H1 générique, aucun bloc sectoriel, aucune accroche
- `http://localhost:4173/prospect.html?nom=Lavandys&secteur=Blanchisserie%20industrielle` → « Lavandys, économisez sur votre énergie — nous négocions votre contrat. » + bloc blanchisserie
- `http://localhost:4173/prospect.html?nom=Ferme%20des%20Prés&secteur=Agriculture&accroche=Vos%20quatre%20sites%20de%20séchage%20tournent%20en%20continu.` → bloc générique citant « Agriculture » + accroche affichée
- `http://localhost:4173/prospect.html?nom=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E` → le texte s'affiche littéralement, aucune alerte

Puis arrêter le serveur (`kill %1`).

- [ ] **Step 14: Run the full suite**

Run: `npm test`
Expected: PASS, aucune régression

- [ ] **Step 15: Commit**

```bash
git add prospect.html robots.txt test/prospect-personalisation.test.mjs
git commit -m "Landing page de prospection personnalisee (nom, secteur, accroche)"
```

---

### Task 3: Attribution `ref`/`camp` sur la nouvelle page

**Files:**
- Modify: `middleware.js` (tableau `config.matcher`)
- Test: `test/middleware-attribution.test.mjs`

**Interfaces:**
- Consumes: `middleware` (export par défaut) et `config` exportés par `middleware.js` — existants.
- Produces: rien de nouveau pour les autres tâches.

- [ ] **Step 1: Write the failing test**

D'abord, remplacer la ligne d'import existante en tête de `test/middleware-attribution.test.mjs` :

```javascript
import middleware, { SLUGS, CAMPAIGNS, config } from '../middleware.js';
```

Puis ajouter ces trois tests à la fin du fichier :

```javascript
test('la landing de prospection est couverte par le middleware', () => {
  assert.ok(
    config.matcher.includes('/prospect.html'),
    'sans entree dans le matcher, ?ref= et ?camp= ne seraient jamais lus sur prospect.html'
  );
});

test('la personnalisation survit au nettoyage de ref et camp', () => {
  // ?nom=/?secteur=/?accroche= alimentent l_affichage de la page : ils
  // doivent rester dans l_URL apres la redirection d_attribution, la ou ref
  // et camp en disparaissent.
  const response = call(
    `https://cabinetms.fr/prospect.html?nom=Lavandys&secteur=Blanchisserie&accroche=Test&ref=${SLUG}&camp=${CAMP}`
  );
  assert.equal(response.status, 302);
  const location = new URL(response.headers.get('location'));
  assert.equal(location.searchParams.get('ref'), null);
  assert.equal(location.searchParams.get('camp'), null);
  assert.equal(location.searchParams.get('nom'), 'Lavandys');
  assert.equal(location.searchParams.get('secteur'), 'Blanchisserie');
  assert.equal(location.searchParams.get('accroche'), 'Test');
});

test('ref et camp sont poses en cookie depuis un lien de prospection', () => {
  const response = call(
    `https://cabinetms.fr/prospect.html?nom=Lavandys&ref=${SLUG}&camp=${CAMP}`
  );
  assert.equal(refCookie(response), SLUG);
  assert.equal(campCookie(response), CAMP);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/middleware-attribution.test.mjs`
Expected: FAIL — `la landing de prospection est couverte par le middleware` échoue (`/prospect.html` absent du matcher)

- [ ] **Step 3: Ajouter la route au matcher**

Dans `middleware.js`, dans `config.matcher`, après `'/ms-strategy-calculateur.html'`, ajouter :

```javascript
    '/prospect.html',
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/middleware-attribution.test.mjs`
Expected: PASS

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add middleware.js test/middleware-attribution.test.mjs
git commit -m "Attribution ref/camp active sur prospect.html"
```

---

### Task 4: Génération de liens en masse

**Files:**
- Create: `scripts/build-prospect-links.mjs`
- Test: `test/build-prospect-links.test.mjs`

**Interfaces:**
- Consumes: rien des tâches précédentes (le mapping secteur→bloc se fait au rendu, pas ici).
- Produces: deux fonctions exportées, utilisables en test :
  - `parseCsv(text: string) => Array<Record<string, string>>` — première ligne = en-têtes, gère les champs entre guillemets contenant virgules et guillemets doublés.
  - `buildLinks(rows, { base, nomCol, secteurCol, camp }) => Array<{ nom: string, secteur: string, url: string }>` — `camp` optionnel.

- [ ] **Step 1: Write the failing test**

Créer `test/build-prospect-links.test.mjs` :

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, buildLinks } from '../scripts/build-prospect-links.mjs';

const OPTIONS = {
  base: 'https://cabinetms.fr/prospect.html',
  nomCol: 'Entreprise',
  secteurCol: 'Secteur/Activité'
};

test('les champs entre guillemets contenant une virgule restent entiers', () => {
  const rows = parseCsv('Entreprise,Adresse\nLavandys,"50 Avenue Louis Luc, 94600 Choisy-le-Roi"\n');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Adresse, '50 Avenue Louis Luc, 94600 Choisy-le-Roi');
});

test('les guillemets doubles sont restitues', () => {
  const rows = parseCsv('Entreprise\n"Societe ""Le Pre"""\n');
  assert.equal(rows[0].Entreprise, 'Societe "Le Pre"');
});

test('les lignes vides sont ignorees', () => {
  const rows = parseCsv('Entreprise\nLavandys\n\n');
  assert.equal(rows.length, 1);
});

test('chaque ligne produit une URL avec nom et secteur encodes', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nLavandys,Blanchisserie industrielle\n');
  const [link] = buildLinks(rows, OPTIONS);
  const url = new URL(link.url);
  assert.equal(url.pathname, '/prospect.html');
  assert.equal(url.searchParams.get('nom'), 'Lavandys');
  assert.equal(url.searchParams.get('secteur'), 'Blanchisserie industrielle');
  assert.equal(url.searchParams.get('camp'), null);
});

test('les accents et esperluettes sont encodes sans casser le lien', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nPapèterie Léger & Fils,Papeterie/pâte à papier\n');
  const [link] = buildLinks(rows, OPTIONS);
  assert.ok(!link.url.includes(' '), 'aucune espace brute dans une URL destinee a un email');
  const url = new URL(link.url);
  assert.equal(url.searchParams.get('nom'), 'Papèterie Léger & Fils');
  assert.equal(url.searchParams.get('secteur'), 'Papeterie/pâte à papier');
});

test('le code de campagne est ajoute quand il est fourni', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nLavandys,Blanchisserie\n');
  const [link] = buildLinks(rows, { ...OPTIONS, camp: 'ind-e1' });
  assert.equal(new URL(link.url).searchParams.get('camp'), 'ind-e1');
});

test('une ligne sans nom d_entreprise est ignoree', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\n,Blanchisserie\nLavandys,Blanchisserie\n');
  assert.equal(buildLinks(rows, OPTIONS).length, 1);
});

test('un secteur absent ne met pas de parametre vide dans l_URL', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nLavandys,\n');
  const [link] = buildLinks(rows, OPTIONS);
  assert.equal(new URL(link.url).searchParams.has('secteur'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/build-prospect-links.test.mjs`
Expected: FAIL — `Cannot find module .../scripts/build-prospect-links.mjs`

- [ ] **Step 3: Write the implementation**

Créer `scripts/build-prospect-links.mjs` :

```javascript
// Genere les liens de prospection personnalises a partir d_un CSV de leads.
//
//   node scripts/build-prospect-links.mjs <fichier.csv> [options]
//
//   --camp=<code>        code de campagne ajoute a chaque lien (ex. ind-e1)
//   --nom-col=<colonne>  defaut : Entreprise
//   --secteur-col=<col>  defaut : Secteur/Activité
//   --base=<url>         defaut : https://cabinetms.fr/prospect.html
//   --out=<fichier.csv>  defaut : sortie sur stdout
//
// Le CSV d_entree n_est jamais lu depuis le depot : les listes de prospects
// (noms, telephones) vivent hors du repo et ne doivent pas etre commitees.
// Aucun mapping de secteur n_est fait ici — prospect.html matche le texte
// brut contre assets/sector-blocks.js au moment du rendu, donc le libelle du
// CSV part tel quel dans l_URL.

import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';

const DEFAULTS = {
  base: 'https://cabinetms.fr/prospect.html',
  nomCol: 'Entreprise',
  secteurCol: 'Secteur/Activité',
  camp: null
};

// Parseur CSV minimal : en-tetes en premiere ligne, champs entre guillemets
// pouvant contenir virgules, sauts de ligne et guillemets doubles ("").
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += char;
      continue;
    }

    if (char === '"') { quoted = true; continue; }
    if (char === ',') { row.push(field); field = ''; continue; }
    if (char === '\r') continue;
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += char;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  const [headers, ...body] = rows;
  if (!headers) return [];

  return body
    .filter((cells) => cells.some((cell) => cell.trim() !== ''))
    .map((cells) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header.trim()] = (cells[index] || '').trim();
      });
      return record;
    });
}

export function buildLinks(rows, options = {}) {
  const { base, nomCol, secteurCol, camp } = { ...DEFAULTS, ...options };

  return rows
    .map((row) => ({ nom: row[nomCol] || '', secteur: row[secteurCol] || '' }))
    .filter((entry) => entry.nom !== '')
    .map((entry) => {
      const url = new URL(base);
      url.searchParams.set('nom', entry.nom);
      if (entry.secteur) url.searchParams.set('secteur', entry.secteur);
      if (camp) url.searchParams.set('camp', camp);
      return { ...entry, url: url.toString() };
    });
}

function csvEscape(value) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function parseArgs(argv) {
  const options = {};
  let input = null;
  let out = null;

  for (const arg of argv) {
    if (arg.startsWith('--camp=')) options.camp = arg.slice('--camp='.length);
    else if (arg.startsWith('--nom-col=')) options.nomCol = arg.slice('--nom-col='.length);
    else if (arg.startsWith('--secteur-col=')) options.secteurCol = arg.slice('--secteur-col='.length);
    else if (arg.startsWith('--base=')) options.base = arg.slice('--base='.length);
    else if (arg.startsWith('--out=')) out = arg.slice('--out='.length);
    else if (!input) input = arg;
  }
  return { input, out, options };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { input, out, options } = parseArgs(process.argv.slice(2));

  if (!input) {
    console.error('Usage : node scripts/build-prospect-links.mjs <fichier.csv> [--camp=code] [--nom-col=…] [--secteur-col=…] [--base=…] [--out=…]');
    process.exit(1);
  }

  const links = buildLinks(parseCsv(readFileSync(input, 'utf8')), options);
  const csv = ['Entreprise,Secteur,URL']
    .concat(links.map((l) => [l.nom, l.secteur, l.url].map(csvEscape).join(',')))
    .join('\n') + '\n';

  if (out) {
    writeFileSync(out, csv);
    console.error(`${links.length} liens ecrits dans ${out}`);
  } else {
    process.stdout.write(csv);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/build-prospect-links.test.mjs`
Expected: PASS (8 tests)

- [ ] **Step 5: Vérification sur la liste réelle**

Run: `node scripts/build-prospect-links.mjs ~/Documents/leads_energo_intensifs.csv --camp=ind-e1 | head -4`
Expected: une ligne d'en-tête + 3 lignes avec des URLs `https://cabinetms.fr/prospect.html?nom=...&secteur=...&camp=ind-e1`

⚠️ Ne pas rediriger cette sortie dans le dépôt — l'écrire hors du repo si besoin (`--out="$HOME/Documents/liens-prospection.csv"` ; le `~` n'est pas étendu après un `=`).

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add scripts/build-prospect-links.mjs test/build-prospect-links.test.mjs
git commit -m "Script de generation des liens de prospection personnalises"
```

---

### Task 5: Documentation d'usage

**Files:**
- Create: `docs/prospect-landing.md`
- Modify: `package.json` (ajout du script npm)

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: rien pour d'autres tâches (dernière).

- [ ] **Step 1: Ajouter le raccourci npm**

Dans `package.json`, dans `"scripts"`, après `"build:speed-insights"`, ajouter :

```json
    "prospect:links": "node scripts/build-prospect-links.mjs",
```

- [ ] **Step 2: Vérifier que le raccourci fonctionne**

Run: `npm run prospect:links -- ~/Documents/leads_energo_intensifs.csv --camp=ind-e1 | head -3`
Expected: en-tête + 2 lignes d'URLs

- [ ] **Step 3: Écrire la documentation**

Créer `docs/prospect-landing.md` :

```markdown
# Landing page de prospection personnalisée

`prospect.html` affiche le nom du prospect, un argumentaire adapté à son
secteur et, si elle est fournie, une accroche rédigée sur mesure. Tout vient
de l'URL : rien n'est stocké côté serveur.

## Format du lien

    https://cabinetms.fr/prospect.html?nom=<entreprise>&secteur=<secteur>&camp=<code>

| Paramètre | Obligatoire | Effet |
|---|---|---|
| `nom` | non | Nom dans le H1 + champ caché `entreprise` du formulaire Tally |
| `secteur` | non | Sélectionne le bloc argumentaire (texte libre, voir ci-dessous) |
| `accroche` | non | Phrase personnalisée sous le H1 (240 caractères max) |
| `camp` | non | Code de campagne existant (`middleware.js`), posé en cookie puis retiré de l'URL |
| `ref` | non | Commercial référent, même mécanisme que sur `b2b.html` |

Sans aucun paramètre, la page est la version générique B2B. Elle est en
`noindex` et exclue dans `robots.txt` : elle ne doit jamais être indexée ni
partagée publiquement.

## Blocs sectoriels

`assets/sector-blocks.js` associe des mots-clés à un argumentaire. Le texte
du paramètre `secteur` est normalisé (minuscules, sans accents) puis comparé
à ces mots-clés — « Papeterie/pâte à papier » comme « PATE A PAPIER »
tombent sur l'entrée papeterie.

Secteurs couverts : cimenterie, blanchisserie, data center, logistique
frigorifique, papeterie, verrerie.

Un secteur non couvert affiche un bloc générique citant le libellé tel quel.
**Pour ajouter un secteur**, ajouter une entrée `{ keywords, titre, texte }`
dans `BLOCKS` (mots-clés sans accents, en minuscules) et une assertion dans
`test/sector-blocks.test.mjs`.

## Générer les liens d'une liste

    npm run prospect:links -- <fichier.csv> --camp=ind-e1 --out="$HOME/liens.csv"

Colonnes lues par défaut : `Entreprise` et `Secteur/Activité`
(surchargeables par `--nom-col=` / `--secteur-col=`). Le CSV d'entrée reste
**hors du dépôt** : les listes de prospects contiennent des coordonnées qui
n'ont rien à faire dans l'historique git.

## Accroche personnalisée

L'accroche ne se génère pas en masse : elle se rédige prospect par prospect
à partir du site de l'entreprise (activité précise, signal de consommation,
actualité), puis s'ajoute au lien en `&accroche=<texte encodé>`.

## Étape manuelle côté Tally

Pour que le nom de l'entreprise remonte dans les réponses, le champ caché
`entreprise` doit exister dans le formulaire Tally (éditeur Tally, comme
`ref` et `camp`). Sans ce champ, la valeur est ignorée silencieusement.
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/prospect-landing.md package.json
git commit -m "Documentation d_usage de la landing de prospection"
```

---

## Vérification finale

- [ ] `npm test` — suite complète au vert
- [ ] `grep -rn "leads_energo" --include="*.csv" .` — aucun CSV de prospects dans le dépôt
- [ ] `git log --oneline` — 5 commits, un par tâche
- [ ] Rappeler à l'utilisateur les deux actions manuelles hors code : créer le champ caché `entreprise` dans l'éditeur Tally, et vérifier le rendu de `prospect.html` en préproduction Vercel avec un lien réel
