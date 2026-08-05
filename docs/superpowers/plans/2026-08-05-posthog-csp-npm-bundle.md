# PostHog : correctif CSP + migration npm — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remettre PostHog en état de marche en production (aujourd'hui bloqué par le CSP), puis remplacer le snippet CDN inline par `posthog-js` bundlé localement avec esbuild.

**Architecture:** Le site est du HTML statique déployé tel quel par Vercel, sans étape de build. La source de la couche analytics passe donc en `src/`, esbuild produit un bundle IIFE écrit dans `assets/analytics.js` — le chemin déjà référencé par les 9 pages HTML, qui ne sont pas modifiées — et cette sortie est commitée. Un test compare le bundle commité à un build frais pour empêcher la dérive.

**Tech Stack:** Node 24 / npm 12, `posthog-js`, `esbuild` (devDependency), `node --test` + `node:assert/strict` (déjà le harnais du dépôt, cf. `test/entsoe.test.mjs`).

**Spec :** `docs/superpowers/specs/2026-08-04-posthog-npm-bundle-design.md`

## Global Constraints

- **Branche de travail : `worktree-posthog-csp-npm`, créée depuis `origin/main`.** La branche courante `worktree-vercel-analytics` a 28 commits de retard sur `main` et porte un chantier distinct (activation de Vercel Web Analytics) ; son `package.json` a divergé de celui de `main` (`@vercel/analytics` d'un côté, `fast-xml-parser` de l'autre). Y greffer cette migration garantirait un conflit sur `package.json`.
- **Ne jamais nommer un script npm `build`.** Vercel exécuterait alors une étape de build sur un preset « Other », ce qui change la résolution du répertoire de sortie et casserait un déploiement statique qui fonctionne. Le script s'appelle `build:analytics`.
- **`assets/analytics.js` est un artefact généré.** Toute modification de comportement se fait dans `src/`, suivie de `npm run build:analytics` et du commit de la sortie.
- **Le contrat avec `assets/cookie-consent.js` est figé** : `window.msInitAnalytics` doit rester une fonction globale appelable, et rien ne doit s'initialiser tant que le cookie `ms_consent` ne vaut pas `accepted`. `cookie-consent.js` n'est modifié par aucune tâche.
- **Clé de projet PostHog** (publique par nature, déjà dans le dépôt) : `phc_uHyRKSZT97w56hxk2ZaF2q8ahPyLPY9uznkY7v5hnnBM`. **API host** : `https://eu.i.posthog.com`.
- **Le chargement de scripts externes par PostHog reste actif** (décision de cadrage). Ne pas ajouter `disable_external_dependency_loading`.
- Aucune page HTML n'est modifiée par ce plan.

---

### Task 1 : Correctif CSP (phase A)

Débloque le tracking en production. Livrable déployable en soi, indépendant de la migration npm.

**Files:**
- Create: `test/csp.test.mjs`
- Modify: `vercel.json` (directive `script-src` du header `Content-Security-Policy`)

**Interfaces:**
- Consumes: rien.
- Produces: rien de programmatique. Le test `test/csp.test.mjs` devient le garde-fou de régression du CSP pour les tâches suivantes.

- [ ] **Step 1 : Créer la branche de travail depuis `origin/main`**

```bash
cd "/Users/antoinegaussin/SITE MS/.claude/worktrees/vercel-analytics"
git fetch origin
git checkout -b worktree-posthog-csp-npm origin/main
git checkout worktree-vercel-analytics -- docs/superpowers/specs/2026-08-04-posthog-npm-bundle-design.md docs/superpowers/plans/2026-08-05-posthog-csp-npm-bundle.md
git add docs/superpowers
git commit -m "docs: spec + plan correctif CSP PostHog et migration npm"
```

Attendu : `git status` propre, `git log --oneline -1` montre le commit de doc, et `git rev-list --count origin/main..HEAD` vaut `1`.

- [ ] **Step 2 : Écrire le test qui échoue**

Créer `test/csp.test.mjs` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Parse le header CSP de vercel.json en { directive: [valeurs] }.
function cspDirectives() {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const header = config.headers
    .flatMap((rule) => rule.headers)
    .find((h) => h.key === 'Content-Security-Policy');
  assert.ok(header, 'aucun header Content-Security-Policy dans vercel.json');

  return Object.fromEntries(
    header.value
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...values] = part.split(/\s+/);
        return [name, values];
      })
  );
}

test('script-src autorise le CDN qui sert la librairie PostHog', () => {
  assert.ok(
    cspDirectives()['script-src'].includes('https://eu-assets.i.posthog.com'),
    "sans ce host, array.js est bloque par le CSP et posthog ne s'initialise jamais"
  );
});

test("connect-src autorise l'ingestion des events PostHog", () => {
  assert.ok(
    cspDirectives()['connect-src'].includes('https://eu.i.posthog.com'),
    'sans ce host, les events captures ne peuvent pas etre envoyes'
  );
});
```

- [ ] **Step 3 : Lancer le test et vérifier qu'il échoue**

Run: `node --test test/csp.test.mjs`

Attendu : ÉCHEC sur le premier test, avec le message `sans ce host, array.js est bloque par le CSP et posthog ne s'initialise jamais`. Le second test (`connect-src`) doit passer dès maintenant : `https://eu.i.posthog.com` est déjà autorisé, c'est précisément ce qui rendait la panne difficile à voir.

- [ ] **Step 4 : Corriger le CSP**

Dans `vercel.json`, dans la valeur du header `Content-Security-Policy`, remplacer :

```
script-src 'self' 'unsafe-inline' https://tally.so;
```

par :

```
script-src 'self' 'unsafe-inline' https://tally.so https://eu-assets.i.posthog.com;
```

Aucune autre directive n'est touchée.

- [ ] **Step 5 : Lancer le test et vérifier qu'il passe**

Run: `node --test test/csp.test.mjs`

Attendu : `# pass 2`, `# fail 0`.

- [ ] **Step 6 : Commit**

```bash
git add test/csp.test.mjs vercel.json
git commit -m "fix(csp): autorise eu-assets.i.posthog.com dans script-src

Le CSP bloquait le chargement de array.js depuis le CDN PostHog : le stub
du snippet empilait les capture() dans un tableau jamais vide, aucun event
n'etait envoye depuis la mise en place du CSP. Test de regression ajoute."
```

---

### Task 2 : Extraire les helpers purs de la couche analytics

Sépare la logique testable (parsing de cookie, libellé de CTA) du câblage DOM/PostHog qui, lui, ne se vérifie qu'en navigateur. Rien ne consomme encore ce module à la fin de la tâche — c'est la Task 3 qui le branche.

**Files:**
- Create: `src/analytics-helpers.mjs`
- Test: `test/analytics-helpers.test.mjs`

**Interfaces:**
- Consumes: rien.
- Produces: deux fonctions pures importées par `src/analytics.js` en Task 3 :
  - `readCookie(cookieString: string, name: string) => string | null`
  - `ctaLabel(text: string) => string`

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `test/analytics-helpers.test.mjs` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readCookie, ctaLabel } from '../src/analytics-helpers.mjs';

test('readCookie lit un cookie en debut de chaine', () => {
  assert.equal(readCookie('ms_variant=B; ms_consent=accepted', 'ms_variant'), 'B');
});

test('readCookie lit un cookie en milieu de chaine', () => {
  assert.equal(readCookie('foo=1; ms_consent=accepted; bar=2', 'ms_consent'), 'accepted');
});

test('readCookie renvoie null quand le cookie est absent', () => {
  assert.equal(readCookie('foo=1; bar=2', 'ms_consent'), null);
});

test('readCookie ne confond pas un cookie avec un autre dont il est le suffixe', () => {
  assert.equal(readCookie('autre_ms_consent=refused', 'ms_consent'), null);
});

test('readCookie tolere une chaine vide', () => {
  assert.equal(readCookie('', 'ms_consent'), null);
});

test('readCookie decode la valeur', () => {
  assert.equal(readCookie('ms_consent=a%20b', 'ms_consent'), 'a b');
});

test('ctaLabel retire la fleche et les espaces autour', () => {
  assert.equal(ctaLabel('Combien ca me coute reellement →'), 'Combien ca me coute reellement');
});

test('ctaLabel laisse intact un libelle sans fleche', () => {
  assert.equal(ctaLabel('  Transmettre ma facture  '), 'Transmettre ma facture');
});

test('ctaLabel tolere une valeur vide', () => {
  assert.equal(ctaLabel(''), '');
});
```

- [ ] **Step 2 : Lancer les tests et vérifier qu'ils échouent**

Run: `node --test test/analytics-helpers.test.mjs`

Attendu : ÉCHEC — `Cannot find module .../src/analytics-helpers.mjs`.

- [ ] **Step 3 : Écrire l'implémentation minimale**

Créer `src/analytics-helpers.mjs` :

```js
// Helpers purs de la couche analytics : ni DOM, ni PostHog, pour rester
// testables sous `node --test`. Le cablage vit dans src/analytics.js.

// Echappe les caracteres speciaux d'une regex — le nom de cookie est du code
// appelant, pas de la saisie utilisateur, mais autant ne pas construire une
// regex fragile.
function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Lit la valeur d'un cookie dans une chaine au format `document.cookie`.
 * Renvoie null si le cookie est absent.
 */
export function readCookie(cookieString, name) {
  const match = (cookieString || '').match(
    new RegExp('(?:^|; )' + escapeForRegExp(name) + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Libelle lisible d'un CTA : le texte du lien, debarrasse de ses fleches.
 */
export function ctaLabel(text) {
  return (text || '').replace(/[→➔]/g, '').trim();
}
```

Note : la classe de caractères d'origine (`assets/analytics.js` sur `main`) était `[→➔→]`, avec `→` répété deux fois. Le doublon est retiré, le comportement est identique.

- [ ] **Step 4 : Lancer les tests et vérifier qu'ils passent**

Run: `node --test test/analytics-helpers.test.mjs`

Attendu : `# pass 9`, `# fail 0`.

- [ ] **Step 5 : Commit**

```bash
git add src/analytics-helpers.mjs test/analytics-helpers.test.mjs
git commit -m "refactor(analytics): extrait readCookie et ctaLabel en module testable"
```

---

### Task 3 : Migration vers `posthog-js` bundlé (phase B)

Remplace le snippet CDN inline par un import npm, et met en place la chaîne de build.

**Files:**
- Create: `src/analytics.js`
- Create: `scripts/build-analytics.mjs`
- Create: `test/analytics-build.test.mjs`
- Modify: `package.json` (dépendances + scripts)
- Modify: `assets/analytics.js` (devient la sortie générée, remplace le snippet inline)

**Interfaces:**
- Consumes: `readCookie` et `ctaLabel` depuis `src/analytics-helpers.mjs` (Task 2).
- Produces:
  - `buildAnalytics(outfile: string) => Promise<void>` exporté par `scripts/build-analytics.mjs` — utilisé à la fois par le script npm et par le test de fraîcheur, pour que les options d'esbuild ne soient déclarées qu'à un seul endroit.
  - `window.msInitAnalytics` dans le bundle, contrat inchangé pour `assets/cookie-consent.js`.

- [ ] **Step 1 : Installer les dépendances**

```bash
npm install posthog-js
npm install --save-dev esbuild
```

Attendu : `package.json` gagne `posthog-js` en `dependencies` et `esbuild` en `devDependencies`, `package-lock.json` est mis à jour.

- [ ] **Step 2 : Vérifier les options de `posthog.init()` contre la version réellement installée**

Le spec impose de vérifier plutôt que de supposer. Lancer :

```bash
node -e "console.log(require('posthog-js/package.json').version)"
grep -n "capture_pageleave\|api_host" node_modules/posthog-js/dist/module.d.ts | head
```

Attendu : `capture_pageleave` et `api_host` apparaissent bien dans les types de configuration. Si l'une des deux options a été renommée dans la version installée, utiliser le nom réel et le signaler dans le rapport de tâche — ne pas conserver un nom d'option obsolète.

- [ ] **Step 3 : Écrire la source `src/analytics.js`**

```js
import posthog from 'posthog-js';
import { readCookie, ctaLabel } from './analytics-helpers.mjs';

// RGPD/CNIL: PostHog capture des donnees de navigation (pages vues, clics,
// identifiant persistant) — ce n'est pas une "mesure d'audience strictement
// necessaire" au sens CNIL, donc rien n'est charge ni aucun cookie pose tant
// que l'utilisateur n'a pas donne son consentement via le bandeau cookies
// (voir assets/cookie-consent.js). Ne pas appeler initPostHog() ailleurs
// sans passer par ce mecanisme de consentement.

// Cle de projet PostHog : publique par nature, ce n'est pas un secret.
const POSTHOG_TOKEN = 'phc_uHyRKSZT97w56hxk2ZaF2q8ahPyLPY9uznkY7v5hnnBM';
const POSTHOG_API_HOST = 'https://eu.i.posthog.com';

// Selecteur des CTA suivis, aligne sur les classes utilisees dans les pages.
const CTA_SELECTOR = 'a.cta-btn, a.pcta, a.ncta';

let initialised = false;

function initPostHog() {
  if (initialised) return;
  initialised = true;

  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_API_HOST,
    capture_pageleave: true
  });

  // Variante du test A/B, tiree au sort et posee en cookie par middleware.js.
  posthog.register({ variant: readCookie(document.cookie, 'ms_variant') || 'A' });

  document.addEventListener('click', function (event) {
    const el = event.target.closest(CTA_SELECTOR);
    if (!el) return;
    posthog.capture('cta_click', {
      label: ctaLabel(el.textContent),
      href: el.getAttribute('href')
    });
  });
}

// Contrat avec assets/cookie-consent.js : appele a l'acceptation du bandeau.
window.msInitAnalytics = initPostHog;

if (readCookie(document.cookie, 'ms_consent') === 'accepted') {
  initPostHog();
}
```

- [ ] **Step 4 : Écrire le script de build**

Créer `scripts/build-analytics.mjs` :

```js
// Construit assets/analytics.js a partir de src/analytics.js.
//
// La sortie est commitee : le site est deployé en statique par Vercel, sans
// etape de build. Apres toute modification de src/, relancer
// `npm run build:analytics` et commiter le resultat — test/analytics-build.
// test.mjs echoue si les deux divergent.

import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const BANNER = '/* GENERE par `npm run build:analytics` — ne pas editer. Source : src/analytics.js */';

export async function buildAnalytics(outfile) {
  await esbuild.build({
    entryPoints: ['src/analytics.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2017'],
    banner: { js: BANNER },
    outfile,
    logLevel: 'silent'
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildAnalytics('assets/analytics.js');
}
```

- [ ] **Step 5 : Déclarer les scripts npm**

Dans `package.json`, ajouter un bloc `scripts` (le fichier n'en a pas encore). Le script de build **ne doit pas** s'appeler `build` — ce nom déclencherait une étape de build côté Vercel :

```json
  "scripts": {
    "build:analytics": "node scripts/build-analytics.mjs",
    "test": "node --test test/*.test.mjs"
  },
```

Note : `node --test test/` (répertoire passé tel quel, sans glob) échoue
réellement sur la version de Node installée sur cette machine (v24.18.0) :
`node` tente de résoudre `test/` comme un module unique (`Error: Cannot find
module '.../test'`) plutôt que d'y découvrir les fichiers de test. La forme
livrée, `node --test test/*.test.mjs`, cible explicitement les fichiers de
test via le glob du shell et est celle à conserver ; ne pas « corriger » ce
script vers `test/` seul.

- [ ] **Step 6 : Écrire le test de fraîcheur du bundle, et vérifier qu'il échoue**

Créer `test/analytics-build.test.mjs` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildAnalytics } from '../scripts/build-analytics.mjs';

test('assets/analytics.js correspond au build de src/analytics.js', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ms-analytics-'));
  const outfile = join(dir, 'analytics.js');
  await buildAnalytics(outfile);

  const [fresh, committed] = await Promise.all([
    readFile(outfile, 'utf8'),
    readFile('assets/analytics.js', 'utf8')
  ]);

  assert.equal(
    fresh,
    committed,
    'assets/analytics.js est perime — lancer `npm run build:analytics` et commiter la sortie'
  );
});

test('le bundle expose window.msInitAnalytics pour cookie-consent.js', async () => {
  const bundle = await readFile('assets/analytics.js', 'utf8');
  assert.match(
    bundle,
    /msInitAnalytics/,
    'le contrat avec assets/cookie-consent.js a disparu du bundle'
  );
});
```

Run: `node --test test/analytics-build.test.mjs`

Attendu : ÉCHEC du premier test — `assets/analytics.js` contient encore le snippet inline, pas le bundle.

- [ ] **Step 7 : Générer le bundle et vérifier que les tests passent**

```bash
npm run build:analytics
node --test test/analytics-build.test.mjs
```

Attendu : `# pass 2`, `# fail 0`. Vérifier aussi que le fichier commence par la bannière `/* GENERE par ... */` :

```bash
head -c 120 assets/analytics.js
```

- [ ] **Step 8 : Lancer toute la suite de tests**

Run: `npm test`

Attendu : `# fail 0`. Cela couvre les tests du Baromètre déjà présents sur `main` (`test/entsoe.test.mjs`, `test/update-barometre-electricite.test.mjs`) ainsi que les trois fichiers ajoutés par ce plan. Si un test préexistant échoue, ne pas le corriger dans cette tâche — le signaler.

- [ ] **Step 9 : Vérifier que `node_modules` n'est pas commité**

```bash
git status --short
```

Attendu : `node_modules/` n'apparaît pas (il est dans `.gitignore`), mais `package.json`, `package-lock.json`, `assets/analytics.js`, `src/` et `scripts/` sont bien listés.

- [ ] **Step 10 : Commit**

```bash
git add package.json package-lock.json src/analytics.js scripts/build-analytics.mjs test/analytics-build.test.mjs assets/analytics.js
git commit -m "feat(analytics): remplace le snippet CDN par posthog-js bundle

La source passe en src/analytics.js, esbuild produit assets/analytics.js —
chemin inchange, donc aucune page HTML modifiee. La sortie est commitee car
le site est deployé en statique ; un test compare le bundle commite a un
build frais pour empecher la derive."
```

---

### Task 4 : Vérification en conditions réelles et ouverture de la PR

Aucun test automatisé ne prouve que PostHog reçoit des events : ça se vérifie en navigateur, sur un déploiement réel.

**Files:** aucune modification de code.

**Interfaces:**
- Consumes: la branche `worktree-posthog-csp-npm` telle que livrée par les Tasks 1 à 3.
- Produces: une PR prête pour relecture utilisateur.

- [ ] **Step 1 : Pousser la branche et ouvrir la PR en brouillon**

```bash
git push -u origin worktree-posthog-csp-npm
gh pr create --draft --title "PostHog : correctif CSP + migration vers posthog-js bundle" --body "Voir docs/superpowers/specs/2026-08-04-posthog-npm-bundle-design.md"
```

Attendu : l'URL de la PR. Si `gh` n'est pas authentifié sur cette machine, s'arrêter là et remonter l'URL de comparaison GitHub à l'utilisateur plutôt que de tenter un contournement.

- [ ] **Step 2 : Vérifier le CSP servi par la preview Vercel**

Récupérer l'URL de preview du déploiement de la branche, puis :

```bash
curl -sSI <url-preview> | grep -i content-security-policy
```

Attendu : la directive `script-src` contient `https://eu-assets.i.posthog.com`.

- [ ] **Step 3 : Vérifier le tracking en navigateur**

Ouvrir l'URL de preview en navigation privée, console ouverte :

1. Accepter le bandeau cookies.
2. Attendu : **aucune** violation CSP en console (avant le correctif, on voyait `Refused to load the script 'https://eu-assets.i.posthog.com/static/array.js'`).
3. Cliquer sur un CTA (bouton `.cta-btn` de la home).
4. Dans PostHog → Activity : un `$pageview` puis un `cta_click` doivent apparaître en quelques secondes, avec les propriétés `label`, `href` et `variant`.

Attendu : les deux events présents. C'est la seule preuve que la chaîne complète fonctionne — ne pas déclarer la tâche terminée sur la seule foi des tests automatisés.

- [ ] **Step 4 : Rapporter**

Remonter à l'utilisateur : l'URL de la PR, le résultat du `curl`, et la confirmation (ou non) des events dans PostHog. Si les events n'arrivent pas, ne pas improviser de correctif — décrire précisément ce que montre la console.

---

## Hors périmètre

Relevés en cadrage, à traiter séparément (cf. section correspondante du spec) : la dépendance morte `@vercel/analytics` sur la branche `worktree-vercel-analytics`, les 4 pages sans bandeau cookies ni tracking (`ms-blog-article-1.html`, `ms-blog-article-2.html`, `ms-strategy-calculateur.html`, `ms-strategy-landing-2.html`), et l'allègement du bundle via l'entrypoint slim de posthog-js.
