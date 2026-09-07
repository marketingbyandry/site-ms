# PostHog Funnels + Experiments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner assez d'événements PostHog pour construire un Funnel de conversion (arrivée → ouverture du formulaire → dépôt de facture) et rattacher le test A/B thème clair/sombre existant (`ms_variant`) à un Experiment PostHog, sans réactiver `advanced_disable_feature_flags` ni toucher au session replay.

**Architecture:** `src/analytics.js` expose `window.posthog` (même pattern que `window.fbq` déjà utilisé pour le Pixel Meta) et enregistre une super-property `$feature/site-theme-mode` sur tous les événements. `b2b.html`/`b2c.html` (inline `<script>`) capturent `tally_form_opened` à l'ouverture du formulaire Tally et `lead_submitted` au dépôt réel — gatés par l'existence de `window.posthog` (donc par le consentement analytics), indépendamment du gate marketing existant pour le Pixel Meta.

**Tech Stack:** `posthog-js` 1.411.0 (déjà en dépendance), esbuild pour le rebuild du bundle.

## Global Constraints

- Ne pas toucher `disable_session_recording`, `disable_surveys`, `disable_web_experiments`, `advanced_disable_feature_flags` dans `src/analytics.js:34-37` — le replay est un besoin déclaré par l'utilisateur, la ré-activation des feature flags PostHog réintroduirait l'appel réseau `/flags` volontairement supprimé (commentaire `src/analytics.js:30-33`).
- Utiliser la méthode PostHog "Experiments without feature flags" (property `$feature/<experiment-key>` posée à la main, cf. https://posthog.com/docs/experiments/running-experiments-without-feature-flags) — pas `posthog.featureFlags`/`getFeatureFlag`, qui dépendent du système désactivé ci-dessus.
- Toute capture PostHog est gatée par `if (window.posthog)`, jamais par `msMarketingConsent()` (qui gate le Pixel Meta sous consentement marketing — PostHog tourne sous consentement analytics, un visiteur peut avoir l'un sans l'autre).
- Après modification de `src/analytics.js`, régénérer `assets/analytics.js` via `npm run build:analytics` et commiter le résultat (requis par `test/analytics-build.test.mjs`).

---

### Task 1: Exposer window.posthog et la super-property d'expérimentation

**Files:**
- Modify: `src/analytics.js:26-62`

**Interfaces:**
- Produces: `window.posthog` (instance PostHog globale, disponible après tout appel à `initPostHog()`, donc après consentement analytics) — consommé par Task 2 et Task 3.
- Produces: super-property `$feature/site-theme-mode` avec pour valeur `'light'` (variante B, `ms_variant=B`) ou `'dark'` (variante A ou cookie absent) — appliquée automatiquement à tout événement capturé après `posthog.register()`.

- [ ] **Step 1: Éditer `src/analytics.js`**

Remplacer (lignes 26-41) :
```js
function initPostHog() {
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_API_HOST,
    capture_pageleave: true,
    // Seuls init/register/unregister/capture sont utilises ici (voir
    // handoff.md) : on coupe explicitement les autres sous-systemes pour
    // eviter le travail (et l'appel reseau /flags) qu'ils declenchent au
    // chargement alors que rien ne les exploite cote produit.
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    advanced_disable_feature_flags: true
  });

  // Variante du test A/B, tiree au sort et posee en cookie par middleware.js.
  const properties = { variant: readCookie(document.cookie, 'ms_variant') || 'A' };
```

par :
```js
function initPostHog() {
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_API_HOST,
    capture_pageleave: true,
    // Seuls init/register/unregister/capture sont utilises ici (voir
    // handoff.md) : on coupe explicitement les autres sous-systemes pour
    // eviter le travail (et l'appel reseau /flags) qu'ils declenchent au
    // chargement alors que rien ne les exploite cote produit.
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    advanced_disable_feature_flags: true
  });

  // Expose l'instance pour les scripts inline (b2b.html/b2c.html), meme
  // pattern que window.fbq pour le Pixel Meta : son existence signale que
  // le consentement analytics a ete donne, sert de garde pour les captures
  // hors de ce fichier (voir onTallySubmit/openTallyForm).
  window.posthog = posthog;

  // Variante du test A/B, tiree au sort et posee en cookie par middleware.js.
  const variant = readCookie(document.cookie, 'ms_variant') || 'A';
  const properties = {
    variant: variant,
    // Property au format attendu par PostHog Experiments quand la variante
    // est assignee par notre propre systeme plutot que par les feature
    // flags PostHog (voir Global Constraints) : $feature/<experiment-key>.
    // Cle "site-theme-mode" a creer cote PostHog (Experiments > New) pour
    // que le funnel/l'analyse de significativite se rattache a cette
    // property.
    '$feature/site-theme-mode': variant === 'B' ? 'light' : 'dark'
  };
```

- [ ] **Step 2: Regenerer le bundle**

Run: `npm run build:analytics`
Expected: `assets/analytics.js` regenere sans erreur (le script est silencieux en cas de succes, `logLevel: 'silent'`).

- [ ] **Step 3: Verifier que window.posthog et la property sont bien dans le bundle genere**

Run:
```bash
grep -c "window.posthog=" assets/analytics.js
grep -c "site-theme-mode" assets/analytics.js
```
Expected: les deux commandes retournent `1` ou plus (le nom de variable peut etre minifie, mais la chaine `"site-theme-mode"` reste litterale car c'est une valeur de string, pas un identifiant).

- [ ] **Step 4: Verifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101` (inclut `test/analytics-build.test.mjs` qui verifie que `assets/analytics.js` correspond a `src/analytics.js`).

- [ ] **Step 5: Commit**

```bash
git add src/analytics.js assets/analytics.js
git commit -m "PostHog: expose window.posthog et la property \$feature/site-theme-mode"
```

---

### Task 2: Capturer l'ouverture du formulaire (tally_form_opened) — b2b.html

**Files:**
- Modify: `b2b.html:586-611`

**Interfaces:**
- Consumes: `window.posthog` (Task 1).
- Produces: variable de module `lastTallySource` — consommee par Task 4 (onTallySubmit de ce meme fichier).

- [ ] **Step 1: Éditer `b2b.html`**

Remplacer (lignes 586-594) :
```html
function openTallyForm(source) {
  // Signal d'intention pour le retargeting Meta : distingue les visiteurs qui
  // ont ouvert le formulaire de ceux qui n'ont fait que consulter la page.
  // RGPD : meme regle que le reste (voir onTallySubmit ci-dessous).
  if (msMarketingConsent() && window.fbq) {
    window.fbq('track', 'InitiateCheckout');
  }

  const hiddenFields = { source };
```

par :
```html
var lastTallySource = null;

function openTallyForm(source) {
  // Signal d'intention pour le retargeting Meta : distingue les visiteurs qui
  // ont ouvert le formulaire de ceux qui n'ont fait que consulter la page.
  // RGPD : meme regle que le reste (voir onTallySubmit ci-dessous).
  if (msMarketingConsent() && window.fbq) {
    window.fbq('track', 'InitiateCheckout');
  }
  // Funnel PostHog : ouverture du formulaire, avant le depot reel de la
  // facture (voir onTallySubmit). Gate sur l'existence de window.posthog
  // (consentement analytics), independant du gate marketing ci-dessus.
  lastTallySource = source;
  if (window.posthog) window.posthog.capture('tally_form_opened', { source: source });

  const hiddenFields = { source };
```

- [ ] **Step 2: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 3: Commit**

```bash
git add b2b.html
git commit -m "PostHog: capture tally_form_opened sur b2b.html"
```

---

### Task 3: Capturer l'ouverture du formulaire (tally_form_opened) — b2c.html

**Files:**
- Modify: `b2c.html:531-539`

**Interfaces:**
- Consumes: `window.posthog` (Task 1).
- Produces: variable de module `lastTallySource` — consommee par Task 5 (onTallySubmit de ce meme fichier). Meme nom que Task 2 mais fichier different, pas de partage entre b2b.html et b2c.html (pages statiques independantes).

- [ ] **Step 1: Éditer `b2c.html`**

Remplacer (lignes 531-539) :
```html
function openTallyForm(source) {
  const hiddenFields = { source };
  // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
  // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
  if (window.msRef) hiddenFields.ref = window.msRef;
  // Code de campagne email (voir assets/ref.js et middleware.js). Nécessite
  // le champ caché « camp » côté éditeur Tally, sinon ignoré silencieusement.
  if (window.msCamp) hiddenFields.camp = window.msCamp;
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields, onSubmit: onTallySubmit });
}
```

par :
```html
var lastTallySource = null;

function openTallyForm(source) {
  // Funnel PostHog : ouverture du formulaire, avant le depot reel de la
  // facture (voir onTallySubmit). Gate sur l'existence de window.posthog
  // (consentement analytics).
  lastTallySource = source;
  if (window.posthog) window.posthog.capture('tally_form_opened', { source: source });

  const hiddenFields = { source };
  // Commercial référent (voir assets/ref.js et middleware.js). Le champ caché
  // « ref » doit exister dans le formulaire Tally, sinon la valeur est ignorée.
  if (window.msRef) hiddenFields.ref = window.msRef;
  // Code de campagne email (voir assets/ref.js et middleware.js). Nécessite
  // le champ caché « camp » côté éditeur Tally, sinon ignoré silencieusement.
  if (window.msCamp) hiddenFields.camp = window.msCamp;
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields, onSubmit: onTallySubmit });
}
```

- [ ] **Step 2: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 3: Commit**

```bash
git add b2c.html
git commit -m "PostHog: capture tally_form_opened sur b2c.html"
```

---

### Task 4: Capturer le dépôt de facture (lead_submitted) — b2b.html

**Files:**
- Modify: `b2b.html:622-624`

**Interfaces:**
- Consumes: `window.posthog` (Task 1), `lastTallySource` (Task 2, même fichier).

- [ ] **Step 1: Éditer `b2b.html`**

Remplacer (lignes 622-624) :
```html
function onTallySubmit(payload) {
  if (!msMarketingConsent()) return;
```

par :
```html
function onTallySubmit(payload) {
  // Funnel PostHog : depot reel de la facture. Gate independant du
  // consentement marketing ci-dessous (Pixel Meta) : window.posthog
  // n'existe que sous consentement analytics.
  if (window.posthog) window.posthog.capture('lead_submitted', { source: lastTallySource });

  if (!msMarketingConsent()) return;
```

- [ ] **Step 2: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 3: Commit**

```bash
git add b2b.html
git commit -m "PostHog: capture lead_submitted sur b2b.html"
```

---

### Task 5: Capturer le dépôt de facture (lead_submitted) — b2c.html

**Files:**
- Modify: `b2c.html:564-566` (numéros de ligne à recalculer après Task 3 — chercher `function onTallySubmit(payload) {` suivi de `if (!msMarketingConsent()) return;`)

**Interfaces:**
- Consumes: `window.posthog` (Task 1), `lastTallySource` (Task 3, même fichier).

- [ ] **Step 1: Éditer `b2c.html`**

Remplacer :
```html
function onTallySubmit(payload) {
  if (!msMarketingConsent()) return;
```

par :
```html
function onTallySubmit(payload) {
  // Funnel PostHog : depot reel de la facture. Gate independant du
  // consentement marketing ci-dessous (Pixel Meta) : window.posthog
  // n'existe que sous consentement analytics.
  if (window.posthog) window.posthog.capture('lead_submitted', { source: lastTallySource });

  if (!msMarketingConsent()) return;
```

- [ ] **Step 2: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 3: Commit**

```bash
git add b2c.html
git commit -m "PostHog: capture lead_submitted sur b2c.html"
```

---

## Après implémentation (à faire manuellement dans PostHog, hors code)

- Créer l'Experiment "site-theme-mode" dans PostHog (Experiments > New > "Start with an existing property" ou équivalent selon l'UI courante), rattaché à la property `$feature/site-theme-mode`, variantes `dark`/`light`.
- Créer le Funnel "Conversion facture" : `$pageview` → `tally_form_opened` → `lead_submitted`, filtrable par `source` (b2b/b2c) et par `$feature/site-theme-mode`.
- Vérifier dans PostHog (Activity/Live events) qu'un test manuel (ouvrir le formulaire b2b avec consentement analytics accepté) produit bien `tally_form_opened` avec la bonne `source` et `$feature/site-theme-mode`.

## Self-Review

**Spec coverage** : Funnels (Tasks 2-5, événements exploitables en funnel) et Experiments (Task 1, property `$feature/site-theme-mode`) — tous deux couverts sans toucher au replay ni réactiver les feature flags PostHog (contrainte respectée dans toutes les tasks).

**Placeholder scan** : aucun.

**Type consistency** : `lastTallySource` déclarée et utilisée de façon identique dans b2b.html (Tasks 2/4) et b2c.html (Tasks 3/5) — deux variables de module distinctes, un fichier HTML statique chacun, pas de partage attendu.
