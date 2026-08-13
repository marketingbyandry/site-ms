# Suivi par campagne (`camp`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un paramètre `camp` indépendant de `ref` sur les liens du site, pour mesurer la performance par segment/email de la séquence de démarchage à froid sans toucher à l'attribution commerciale existante.

**Architecture:** Même mécanisme que `ms_ref` (cookie posé côté edge dans `middleware.js`, lu côté client par `assets/ref.js` et `src/analytics.js`), mais avec sa propre whitelist, son propre cookie (`ms_camp`), et une sémantique dernier-touch au lieu de premier-touch. Les deux paramètres cohabitent sur le même lien et sont retirés de l'URL par la même redirection 302.

**Tech Stack:** Vercel Edge Middleware (`@vercel/edge`), JS vanilla côté client, `posthog-js`, Node `--test` pour les tests, `esbuild` pour le bundle analytics (`scripts/build-analytics.mjs`).

## Global Constraints

- Whitelist stricte des codes de campagne : `chr-e1`, `chr-e2`, `chr-e3`, `ind-e1`, `ind-e2`, `ind-e3`, `tert-e1`, `tert-e2`, `tert-e3` — un `?camp=` hors liste est ignoré, jamais stocké.
- `ms_camp` : cookie `Path=/; Max-Age=7776000` (90 jours) ; `SameSite=Lax`.
- Dernier-touch : un `?camp=` valide écrase toujours la valeur précédente (contrairement à `ms_ref`, premier-touch).
- Aucun cookie `ms_camp` pour les bots (même filtre `BOT_UA` que `ms_ref`).
- `camp` ne transite jamais par `/c/<slug>` (réservé aux commerciaux) — uniquement via `?camp=` en query string.
- `camp` n'est enregistré côté PostHog que dans le bloc déjà gaté au consentement (`initPostHog()`) — aucun changement au comportement du bandeau cookies.
- Après toute modification de `src/analytics.js`, reconstruire `assets/analytics.js` avec `npm run build:analytics` et committer les deux fichiers ensemble — `test/analytics-build.test.mjs` échoue sinon.

---

### Task 1: Middleware — whitelist, cookie `ms_camp`, cohabitation avec `ref`

**Files:**
- Modify: `middleware.js` (fichier entier, ~118 lignes)
- Test: `test/middleware-attribution.test.mjs`

**Interfaces:**
- Consumes: rien de nouveau — étend l'export existant `SLUGS`.
- Produces: `export const CAMPAIGNS` (array de 9 strings), cookie `ms_camp` posé par `attributionRedirect()`. Les tasks 2 et 3 lisent le cookie `ms_camp` par son nom directement (pas d'import JS, c'est un cookie HTTP) — seul le nom `ms_camp` doit rester stable.

- [ ] **Step 1: Écrire les tests qui échouent pour le nouveau comportement**

Remplacer le contenu de `test/middleware-attribution.test.mjs` par :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import middleware, { SLUGS, CAMPAIGNS } from '../middleware.js';

const [SLUG, OTHER_SLUG] = SLUGS;
const [CAMP, OTHER_CAMP] = CAMPAIGNS;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function call(url, { cookie, userAgent = UA } = {}) {
  const headers = { 'user-agent': userAgent };
  if (cookie) headers.cookie = cookie;
  return middleware(new Request(url, { headers }));
}

function setCookies(response) {
  return response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);
}

// Recupere le cookie ms_ref pose par la reponse, ou null.
function refCookie(response) {
  const found = setCookies(response).find((c) => c.startsWith('ms_ref='));
  return found ? found.split(';')[0].slice('ms_ref='.length) : null;
}

// Recupere le cookie ms_camp pose par la reponse, ou null.
function campCookie(response) {
  const found = setCookies(response).find((c) => c.startsWith('ms_camp='));
  return found ? found.split(';')[0].slice('ms_camp='.length) : null;
}

test('un slug connu dans ?ref est pose en cookie ms_ref', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`);
  assert.equal(refCookie(response), SLUG);
});

test('le slug disparait de l_URL apres attribution', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`);
  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get('location'),
    'https://www.byandry.com/b2b.html',
    "tant que le slug reste dans l_URL, il peut etre indexe ou repartage"
  );
});

test('les parametres utm survivent au nettoyage du slug', () => {
  const response = call(
    `https://www.byandry.com/b2b.html?utm_source=commercial&ref=${SLUG}&utm_campaign=${SLUG}`
  );
  const location = new URL(response.headers.get('location'));
  assert.equal(location.searchParams.get('ref'), null);
  assert.equal(location.searchParams.get('utm_source'), 'commercial');
  assert.equal(location.searchParams.get('utm_campaign'), SLUG);
});

test('la redirection d_attribution n_est jamais mise en cache', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`);
  assert.match(
    response.headers.get('cache-control'),
    /no-store/,
    'un CDN resservirait le Set-Cookie a d_autres visiteurs'
  );
});

test('un slug inconnu est ignore plutot que stocke', () => {
  const response = call('https://www.byandry.com/b2b.html?ref=slug-invente');
  assert.equal(
    refCookie(response),
    null,
    'sans whitelist, n_importe quel visiteur peut s_attribuer un dossier'
  );
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
});

test('first-touch : un ms_ref existant n_est pas ecrase', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${OTHER_SLUG}`, {
    cookie: `ms_ref=${SLUG}`
  });
  assert.equal(
    refCookie(response),
    null,
    'le commercial qui a cree la demande doit garder le dossier'
  );
});

test('un bot suit la redirection mais ne recoit aucune attribution', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`, {
    userAgent: BOT_UA
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), null);
});

test('le lien court /c/<slug> attribue et renvoie vers la landing propre', () => {
  const response = call(`https://www.byandry.com/c/${SLUG}`);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), SLUG);
});

test('un lien court inconnu redirige sans attribuer', () => {
  const response = call('https://www.byandry.com/c/slug-invente');
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), null);
});

test('la page reste servie quand aucun ref n_est present', () => {
  const response = call('https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), null);
  assert.ok(response.headers.get('set-cookie').includes('ms_variant='));
});

test('un code de campagne connu dans ?camp est pose en cookie ms_camp', () => {
  const response = call(`https://www.byandry.com/b2b.html?camp=${CAMP}`);
  assert.equal(campCookie(response), CAMP);
});

test('camp disparait de l_URL apres attribution', () => {
  const response = call(`https://www.byandry.com/b2b.html?camp=${CAMP}`);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
});

test('un code de campagne inconnu est ignore plutot que stocke', () => {
  const response = call('https://www.byandry.com/b2b.html?camp=campagne-inventee');
  assert.equal(campCookie(response), null);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
});

test('dernier-touch : un nouveau camp ecrase un ms_camp existant', () => {
  const response = call(`https://www.byandry.com/b2b.html?camp=${OTHER_CAMP}`, {
    cookie: `ms_camp=${CAMP}`
  });
  assert.equal(
    campCookie(response),
    OTHER_CAMP,
    'contrairement a ref, camp doit refleter le dernier email qui a ramene le prospect'
  );
});

test('ref et camp cohabitent sur le meme lien', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}&camp=${CAMP}`);
  assert.equal(refCookie(response), SLUG);
  assert.equal(campCookie(response), CAMP);
  const location = new URL(response.headers.get('location'));
  assert.equal(location.searchParams.get('ref'), null);
  assert.equal(location.searchParams.get('camp'), null);
});

test('un bot ne recoit aucun cookie camp', () => {
  const response = call(`https://www.byandry.com/b2b.html?camp=${CAMP}`, {
    userAgent: BOT_UA
  });
  assert.equal(campCookie(response), null);
});

test('camp n_est jamais pose via le lien court /c/<slug>', () => {
  const response = call(`https://www.byandry.com/c/${SLUG}`);
  assert.equal(campCookie(response), null);
});
```

- [ ] **Step 2: Lancer les tests et verifier qu_ils echouent**

Run: `npm test`
Expected: FAIL — `CAMPAIGNS` n'existe pas encore dans `middleware.js` (erreur d'import), ou les nouveaux tests `camp` echouent.

- [ ] **Step 3: Reecrire `middleware.js`**

Remplacer tout le fichier par :

```js
import { next } from '@vercel/edge';

export const config = {
  matcher: [
    '/',
    '/b2b.html',
    '/b2c.html',
    '/blog.html',
    '/comment-ca-marche.html',
    '/resultats.html',
    '/ms-strategy-landing-2.html',
    '/ms-strategy-calculateur.html',
    '/c/:slug*'
  ]
};

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

/* ════════════════════════════════════════
   ATTRIBUTION COMMERCIALE

   Un slug = un commercial. Chacun diffuse ses liens :
     https://www.byandry.com/b2b.html?ref=<slug>   (mail, signature, LinkedIn)
     https://www.byandry.com/c/<slug>              (carte de visite, QR code)

   Le slug entrant n'est retenu que s'il figure dans SLUGS : un ?ref= inventé
   ou recopié de travers est ignoré plutôt que stocké.

   Le cookie est posé ici, côté serveur, et non en JavaScript : Safari
   plafonne à 7 jours les cookies écrits par document.cookie, alors qu'un
   Set-Cookie first-party tient les 90 jours demandés.

   Règle d'attribution : premier commercial touché (first-touch). Le cookie
   n'est jamais écrasé tant qu'il est vivant, donc celui qui a créé la
   demande garde le dossier même si le prospect revient plus tard par un
   autre canal.
   ════════════════════════════════════════ */

// Un slug par commercial. `ag` (Antoine) y figure pour qu'il dispose lui aussi
// de liens tracables, mais c'est aussi la valeur de repli appliquee dans
// assets/ref.js : un dossier depose sans lien commercial lui revient.
export const SLUGS = ['ag', 'lg', 'mv', 'pm', 'zb', 'lf'];

/* ════════════════════════════════════════
   SUIVI DE CAMPAGNE (camp)

   Un code par email de la sequence de demarchage a froid (segment + numero),
   ex. chr-e1. Independant de `ref` : ne credite aucune commission, sert
   uniquement a mesurer quel email ramene le plus de trafic par segment
   (PostHog, cf. src/analytics.js).

   Contrairement a `ref` (premier-touch, protege la commission du commercial
   qui a cree la demande), `camp` est dernier-touch : un nouveau `?camp=`
   valide ecrase toujours la valeur precedente, pour refleter le dernier
   email qui a fait revenir le prospect plutot que le tout premier.

   `camp` ne transite jamais par le lien court /c/<slug> : ce format est
   reserve aux commerciaux (carte de visite, QR code), pas aux campagnes
   email.
   ════════════════════════════════════════ */
export const CAMPAIGNS = [
  'chr-e1', 'chr-e2', 'chr-e3',
  'ind-e1', 'ind-e2', 'ind-e3',
  'tert-e1', 'tert-e2', 'tert-e3'
];

// Page d'atterrissage des liens courts /c/<slug>.
const SHORT_LINK_TARGET = '/b2b.html';

const REF_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours
const CAMP_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours

/* Attribue slug et/ou camp puis renvoie vers une URL propre, sans trace de
   l'un ou l'autre dans l'URL affichee.

   L'attribution vit dans les cookies, jamais dans l'URL affichee. Consequences
   voulues :
   - un lien de commercial ou de campagne partage publiquement (post LinkedIn,
     annuaire) ne produit aucune page indexable : le crawler suit la
     redirection et ne voit que l'URL canonique, deja indexee ;
   - un prospect qui recopie l'URL de sa barre d'adresse pour l'envoyer a un
     collegue ne transmet ni le slug de son commercial ni le code de campagne ;
   - les parametres utm_* sont conserves, seuls `ref` et `camp` sont retires.

   Les bots ne recoivent jamais de cookie d'attribution : ils sont redirigés
   comme tout le monde, mais sans Set-Cookie. */
function attributionRedirect(target, { slug, camp, isBot, hasRef }) {
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      // Une redirection porteuse de Set-Cookie ne doit jamais etre mise en
      // cache : un CDN la resservirait a d'autres visiteurs, qui heriteraient
      // du commercial ou de la campagne d'un inconnu.
      'Cache-Control': 'private, no-store'
    }
  });

  if (isBot) {
    return response;
  }

  if (!hasRef && slug && SLUGS.includes(slug)) {
    response.headers.append(
      'Set-Cookie',
      `ms_ref=${slug}; Path=/; Max-Age=${REF_MAX_AGE}; SameSite=Lax`
    );
  }

  if (camp && CAMPAIGNS.includes(camp)) {
    response.headers.append(
      'Set-Cookie',
      `ms_camp=${camp}; Path=/; Max-Age=${CAMP_MAX_AGE}; SameSite=Lax`
    );
  }

  return response;
}

export default function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOT_UA.test(userAgent);
  const cookieHeader = request.headers.get('cookie') || '';
  const hasRef = /(?:^|;\s*)ms_ref=/.test(cookieHeader);

  // Lien court /c/<slug> → landing, sans passer par une URL intermediaire
  // portant le slug. Redirection et non rewrite : les pages referencent leurs
  // assets en relatif (assets/analytics.js), qui casseraient sous /c/. Traite
  // avant le filtre bots pour que les apercus de lien (LinkedIn, WhatsApp)
  // aboutissent sur une vraie page.
  const shortLink = url.pathname.match(/^\/c\/([^/]+)\/?$/);
  if (shortLink) {
    const target = new URL(SHORT_LINK_TARGET, url);
    return attributionRedirect(target, {
      slug: shortLink[1].toLowerCase(),
      camp: null,
      isBot,
      hasRef
    });
  }

  // ?ref=<slug> et/ou ?camp=<code> → on attribue, puis on nettoie l'URL.
  if (url.searchParams.has('ref') || url.searchParams.has('camp')) {
    const slug = url.searchParams.has('ref')
      ? (url.searchParams.get('ref') || '').toLowerCase()
      : null;
    const camp = url.searchParams.has('camp')
      ? (url.searchParams.get('camp') || '').toLowerCase()
      : null;
    const target = new URL(url);
    target.searchParams.delete('ref');
    target.searchParams.delete('camp');
    return attributionRedirect(target, { slug, camp, isBot, hasRef });
  }

  // Bots always get variant A, never get the cookie — keeps SEO/crawling
  // consistent and avoids duplicate content across the whole site, not just
  // the home.
  if (isBot) {
    return next();
  }

  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_variant=(A|B)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'B');

  const response = next();

  response.headers.append(
    'Set-Cookie',
    `ms_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return response;
}
```

- [ ] **Step 4: Lancer les tests et verifier qu_ils passent**

Run: `npm test`
Expected: PASS — tous les tests de `test/middleware-attribution.test.mjs` verts (anciens et nouveaux).

- [ ] **Step 5: Commit**

```bash
git add middleware.js test/middleware-attribution.test.mjs
git commit -m "feat(middleware): ajoute le suivi de campagne camp (dernier-touch, cohabite avec ref)"
```

---

### Task 2: PostHog — super-property `camp`

**Files:**
- Modify: `src/analytics.js:30-38`
- Modify (généré): `assets/analytics.js` via `npm run build:analytics`
- Test: `test/analytics-build.test.mjs`

**Interfaces:**
- Consumes: cookie `ms_camp` posé par la Task 1 (lu par nom, pas d'import).
- Produces: propriété PostHog `camp` enregistrée via `posthog.register()`, au même endroit que `ref`.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à la fin de `test/analytics-build.test.mjs` :

```js
test('le bundle lit le cookie ms_camp pour la super-property camp', async () => {
  const bundle = await readFile('assets/analytics.js', 'utf8');
  assert.match(
    bundle,
    /ms_camp/,
    'la mesure de campagne par segment/email a disparu du bundle'
  );
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `npm test`
Expected: FAIL — `ms_camp` absent de `assets/analytics.js`.

- [ ] **Step 3: Modifier `src/analytics.js`**

Trouver ce bloc (lignes 30-38) :

```js
  // Commercial referent, quand le visiteur vient d'un lien d'affiliation.
  // Permet de segmenter le tunnel visite -> clic CTA -> depot de facture par
  // commercial. Le cookie est pose cote edge (middleware.js), jamais ici.
  const ref = readCookie(document.cookie, 'ms_ref');
  if (ref) properties.ref = ref;

  posthog.register(properties);
```

Le remplacer par :

```js
  // Commercial referent, quand le visiteur vient d'un lien d'affiliation.
  // Permet de segmenter le tunnel visite -> clic CTA -> depot de facture par
  // commercial. Le cookie est pose cote edge (middleware.js), jamais ici.
  const ref = readCookie(document.cookie, 'ms_ref');
  if (ref) properties.ref = ref;

  // Code de campagne email (segment + numero), pose cote edge comme ms_ref
  // mais en dernier-touch : sert a comparer les segments/emails entre eux,
  // jamais a la commission.
  const camp = readCookie(document.cookie, 'ms_camp');
  if (camp) properties.camp = camp;

  posthog.register(properties);
```

- [ ] **Step 4: Reconstruire le bundle**

Run: `npm run build:analytics`
Expected: `assets/analytics.js` réécrit sans erreur.

- [ ] **Step 5: Lancer les tests et vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — y compris `assets/analytics.js correspond au build de src/analytics.js` et le nouveau test `ms_camp`.

- [ ] **Step 6: Commit**

```bash
git add src/analytics.js assets/analytics.js test/analytics-build.test.mjs
git commit -m "feat(analytics): enregistre camp comme super-property PostHog"
```

---

### Task 3: `assets/ref.js` — expose `window.msCamp`

**Files:**
- Modify: `assets/ref.js` (fichier entier)
- Test: `test/ref-default.test.mjs`

**Interfaces:**
- Consumes: cookie `ms_camp` (nom stable depuis Task 1).
- Produces: `window.msCamp` — string du code de campagne, ou `null` si absent. Pas de valeur de repli (contrairement à `window.msRef`). La Task 4 lit `window.msCamp`.

- [ ] **Step 1: Écrire les tests qui échouent**

Ajouter à la fin de `test/ref-default.test.mjs` :

```js
function msCampFor(cookie) {
  const context = { document: { cookie } };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(SOURCE, context);
  return context.msCamp;
}

test('sans cookie, aucune campagne n_est exposee', () => {
  assert.equal(msCampFor(''), null);
});

test('le code de campagne du cookie est expose', () => {
  assert.equal(msCampFor('ms_camp=chr-e1'), 'chr-e1');
});

test('ms_camp est lu correctement au milieu d_autres cookies', () => {
  assert.equal(msCampFor('ms_ref=ag; ms_camp=ind-e2; ms_consent=accepted'), 'ind-e2');
});
```

- [ ] **Step 2: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test`
Expected: FAIL — `context.msCamp` est `undefined`, pas `null`/`'chr-e1'`/`'ind-e2'`.

- [ ] **Step 3: Réécrire `assets/ref.js`**

Remplacer tout le fichier par :

```js
/* ════════════════════════════════════════
   ATTRIBUTION COMMERCIALE ET CAMPAGNE — lecture seule
   Expose window.msRef et window.msCamp pour que openTallyForm() transmette
   le commercial référent et le code de campagne dans les champs cachés du
   formulaire.

   Ce fichier n'écrit jamais les cookies : Safari plafonne à 7 jours tout
   cookie posé en JavaScript, ce qui perdrait les dossiers déposés plus de
   deux semaines après le mail du commercial. L'écriture se fait côté edge,
   dans middleware.js, où le Set-Cookie n'est pas plafonné.
   ════════════════════════════════════════ */
(function () {
  // Repli : un dossier déposé sans avoir suivi le lien d'un commercial
  // revient à Antoine. La colonne « ref » de Tally n'est donc jamais vide,
  // et aucune facture ne reste orpheline. Doit rester un slug listé dans
  // SLUGS (middleware.js).
  var DEFAULT_REF = 'ag';

  var refMatch = document.cookie.match(/(?:^|;\s*)ms_ref=([A-Za-z0-9_-]{1,32})/);
  window.msRef = refMatch ? refMatch[1] : DEFAULT_REF;

  // Code de campagne (segment + email) : optionnel, pas de repli — sert
  // uniquement à l'analyse de performance, jamais à l'attribution
  // commerciale ni à la commission.
  var campMatch = document.cookie.match(/(?:^|;\s*)ms_camp=([A-Za-z0-9_-]{1,32})/);
  window.msCamp = campMatch ? campMatch[1] : null;
})();
```

- [ ] **Step 4: Lancer les tests et vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — tous les tests de `test/ref-default.test.mjs` verts (anciens et nouveaux).

- [ ] **Step 5: Commit**

```bash
git add assets/ref.js test/ref-default.test.mjs
git commit -m "feat(ref): expose window.msCamp en lecture seule depuis le cookie ms_camp"
```

---

### Task 4: Formulaire Tally — champ caché `camp`

**Files:**
- Modify: `b2b.html:496-500`
- Modify: `b2c.html:491-495`
- Modify: `ms-strategy-landing-2.html:870-874`

**Interfaces:**
- Consumes: `window.msCamp` produit par la Task 3.
- Produces: champ `hiddenFields.camp` transmis à `Tally.openPopup()`. Aucune autre task n'en dépend.

- [ ] **Step 1: Modifier `b2b.html`**

Trouver (autour de la ligne 496) :

```js
function openTallyForm(source) {
  const hiddenFields = { source };
  // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
  // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
  if (window.msRef) hiddenFields.ref = window.msRef;
```

Remplacer par :

```js
function openTallyForm(source) {
  const hiddenFields = { source };
  // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
  // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
  if (window.msRef) hiddenFields.ref = window.msRef;
  // Code de campagne email (voir assets/ref.js et middleware.js). Nécessite
  // le champ caché « camp » côté éditeur Tally, sinon ignoré silencieusement.
  if (window.msCamp) hiddenFields.camp = window.msCamp;
```

- [ ] **Step 2: Modifier `b2c.html`**

Trouver (autour de la ligne 491) :

```js
function openTallyForm(source) {
  const hiddenFields = { source };
  // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
  // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
  if (window.msRef) hiddenFields.ref = window.msRef;
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields });
}
```

Remplacer par :

```js
function openTallyForm(source) {
  const hiddenFields = { source };
  // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
  // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
  if (window.msRef) hiddenFields.ref = window.msRef;
  // Code de campagne email (voir assets/ref.js et middleware.js). Nécessite
  // le champ caché « camp » côté éditeur Tally, sinon ignoré silencieusement.
  if (window.msCamp) hiddenFields.camp = window.msCamp;
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields });
}
```

- [ ] **Step 3: Modifier `ms-strategy-landing-2.html`**

Trouver (autour de la ligne 870, indentation à 2 espaces supplémentaires) :

```js
  function openTallyForm(source) {
    const hiddenFields = { source };
    // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
    // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
    if (window.msRef) hiddenFields.ref = window.msRef;
    Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields });
  }
```

Remplacer par :

```js
  function openTallyForm(source) {
    const hiddenFields = { source };
    // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
    // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
    if (window.msRef) hiddenFields.ref = window.msRef;
    // Code de campagne email (voir assets/ref.js et middleware.js). Nécessite
    // le champ caché « camp » côté éditeur Tally, sinon ignoré silencieusement.
    if (window.msCamp) hiddenFields.camp = window.msCamp;
    Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields });
  }
```

- [ ] **Step 4: Vérifier les trois fichiers**

Run: `grep -n "hiddenFields.camp = window.msCamp" b2b.html b2c.html ms-strategy-landing-2.html`
Expected: exactement une ligne de sortie par fichier (3 au total).

- [ ] **Step 5: Commit**

```bash
git add b2b.html b2c.html ms-strategy-landing-2.html
git commit -m "feat(tally): transmet le code de campagne camp en champ caché"
```

---

### Task 5: Conformité — politique de confidentialité et documentation

**Files:**
- Modify: `politique-confidentialite.html:131`
- Modify: `docs/attribution-commerciaux.md` (ajout de section)

**Interfaces:**
- Consumes: rien.
- Produces: documentation uniquement, aucune autre task n'en dépend.

- [ ] **Step 1: Ajouter `ms_camp` au tableau des cookies**

Dans `politique-confidentialite.html`, trouver la ligne 131 :

```html
      <tr><td><code>ms_ref</code></td><td>Mémorise l'identifiant du conseiller M&amp;S Strategy dont vous avez suivi le lien, afin de rattacher votre demande d'étude à votre interlocuteur ; contient uniquement un code interne à deux ou trois lettres, aucune donnée personnelle, et n'est ni partagé avec des tiers ni utilisé à des fins publicitaires ou de suivi cross-site</td><td>90 jours</td><td>Cookie déposé uniquement si vous arrivez par le lien d'un conseiller</td></tr>
```

Ajouter juste après :

```html
      <tr><td><code>ms_camp</code></td><td>Mémorise le code de l'email de notre séquence de prospection dont vous avez suivi le lien (segment d'activité et numéro d'email), afin de mesurer la performance de chaque email ; contient uniquement un code interne court, aucune donnée personnelle, et n'est ni partagé avec des tiers ni utilisé à des fins publicitaires ou de suivi cross-site</td><td>90 jours</td><td>Cookie déposé uniquement si vous arrivez par le lien d'un email de prospection</td></tr>
```

- [ ] **Step 2: Documenter le mécanisme dans `docs/attribution-commerciaux.md`**

Trouver la fin de la section « ## Limites connues » (juste avant « ## Suite éventuelle ») et insérer avant « ## Suite éventuelle » :

```markdown
## Suivi de campagne (camp)

Indépendant du mécanisme d'attribution commerciale ci-dessus : `?camp=<code>`
(ex. `chr-e1` pour le premier email du segment hôtellerie-restauration) est
posé en cookie `ms_camp` par `middleware.js`, sur le même modèle que `ms_ref`
— sauf sur trois points :

- **Whitelist séparée** (`CAMPAIGNS` dans `middleware.js`, un code par
  segment/email de la séquence de démarchage à froid,
  `content/cold-outreach-waalaxy/`).
- **Dernier-touch, pas premier-touch** : un nouveau `?camp=` valide écrase
  toujours la valeur précédente. Il n'y a pas de commission à protéger ici —
  au contraire, on veut savoir quel email précis a fait revenir le prospect
  la dernière fois, pour comparer les segments et les emails entre eux.
- **Base légale distincte** : intérêt légitime (RGPD art. 6.1.f), finalité
  strictement commerciale (prioriser les relances, mesurer la performance
  des campagnes), jamais transmis à un tiers publicitaire. L'opt-out déjà
  présent en pied de chaque email de la séquence (« répondez STOP ») couvre
  l'opposition.

`ref` et `camp` cohabitent sur le même lien
(`?ref=ag&camp=chr-e1`) et sont retirés ensemble de l'URL affichée par la
même redirection 302 — les protections déjà en place pour `ref` (pas de
cookie pour les bots, `Cache-Control: private, no-store`, aucune page
indexable sous le paramètre) s'appliquent identiquement à `camp`.

`camp` alimente une super-property PostHog (`src/analytics.js`) et, une fois
le champ caché correspondant créé dans l'éditeur Tally, la colonne `camp`
des soumissions — pour relier un dépôt de facture à l'email précis qui l'a
déclenché.

**Hors périmètre, quel que soit ce montage** : importer la liste de
prospects dans un outil publicitaire (Meta/LinkedIn/TikTok Custom/Matched
Audiences). Ça nécessite un consentement donné au moment de la collecte,
qu'un prospect jamais contacté n'a par définition pas donné — aucun mécanisme
côté site ne peut le fournir a posteriori.
```

- [ ] **Step 3: Commit**

```bash
git add politique-confidentialite.html docs/attribution-commerciaux.md
git commit -m "docs: documente ms_camp dans la politique de confidentialité et attribution-commerciaux.md"
```

---

### Task 6: Vérification finale

**Files:** aucun fichier modifié — vérification uniquement.

**Interfaces:** aucune.

- [ ] **Step 1: Suite de tests complète**

Run: `npm test`
Expected: PASS — tous les fichiers `test/*.test.mjs`, y compris ceux non touchés par ce plan (barometre, CSP, entsoe).

- [ ] **Step 2: Vérifier qu'aucun fichier généré n'est périmé**

Run: `npm run build:analytics && git status --short`
Expected: aucune sortie (si `assets/analytics.js` diffère, c'est que la Task 2 a été committée avant un dernier changement de `src/analytics.js` — recommitter).

- [ ] **Step 3: Relecture manuelle du diff complet**

Run: `git diff origin/main --stat`
Expected: uniquement les fichiers listés dans les tasks 1 à 5, plus les deux fichiers de spec/plan.

---

## Action utilisateur restante (hors code)

Comme pour `ref` en son temps : créer le champ caché **`camp`** dans
l'éditeur Tally du formulaire `kd15W1` (Content → Champs cachés). Sans lui,
la valeur envoyée par `openTallyForm()` est ignorée silencieusement par
Tally — même limite déjà documentée pour `source`/`message`.
