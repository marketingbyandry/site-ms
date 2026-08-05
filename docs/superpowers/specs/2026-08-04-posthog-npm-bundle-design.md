# PostHog : débloquer le CSP et migrer vers le package npm

Date : 2026-08-04
Branche : `worktree-posthog-csp-npm`

## Problème

PostHog ne se charge jamais en production.

Le CSP servi par `vercel.json` (vérifié en live sur `https://www.byandry.com/`)
déclare :

```
script-src 'self' 'unsafe-inline' https://tally.so
connect-src 'self' https://eu.i.posthog.com https://tally.so
```

Or le snippet inline de `assets/analytics.js` injecte un `<script>` dont la
source est `https://eu-assets.i.posthog.com/static/array.js` (la ligne 35
dérive ce host depuis `api_host` par un `.replace('.i.posthog.com',
'-assets.i.posthog.com')`). Ce host n'est pas dans `script-src` : le
navigateur bloque le script.

Conséquence : `window.posthog` reste le stub du snippet, qui empile les appels
`capture` dans un tableau que personne ne vient jamais vider. Aucun event
n'est envoyé. `connect-src` autorise bien `eu.i.posthog.com`, mais cela ne
couvre que l'envoi des events — pas le chargement de la librairie qui les
envoie.

## État des lieux

- Site HTML statique, 21 pages, aucun bundler ni étape de build.
- `package.json` existe déjà, avec `@vercel/edge` (utilisé par
  `middleware.js`) et `@vercel/analytics` (jamais importé — Vercel Insights
  est chargé par le tag `/_vercel/insights/script.js`, servi en `'self'`).
- `assets/analytics.js` est chargé par 10 pages sur 21. Il lit le cookie
  `ms_variant` posé par `middleware.js`, initialise PostHog derrière le
  consentement `ms_consent`, enregistre la propriété `variant` et capture
  `cta_click` par délégation d'événement.
- `assets/cookie-consent.js` gère le bandeau CNIL et appelle
  `window.msInitAnalytics()` à l'acceptation.
- Usage réel de PostHog (cf. `docs/posthog-setup.md`) : `$pageview`,
  `$pageleave`, `cta_click`, avec breakdown sur `variant`. Le test A/B ne
  dépend pas des feature flags PostHog — la variante vient du cookie posé par
  l'edge middleware.

## Décisions

**Le chargement de scripts externes par PostHog est conservé.** posthog-js
injecte lui-même des scripts depuis `eu-assets.i.posthog.com` : d'abord la
remote config (`/array/{token}/config.js`), puis à la demande surveys,
session replay, toolbar et exception autocapture. Tout cela est gouverné par
le flag `disable_external_dependency_loading`. Le mettre à `true` permettrait
un `script-src 'self'` strict, au prix des heatmaps Toolbar, du replay, des
surveys et des flags. Arbitrage retenu : garder l'optionnalité d'activer ces
features plus tard depuis l'interface PostHog sans retoucher au code.
`https://eu-assets.i.posthog.com` reste donc dans `script-src` de façon
permanente.

**Le fichier buildé est commité.** Le site n'a pas d'étape de build et Vercel
le déploie en statique. Déclarer un `buildCommand` sur un preset « Other »
change la résolution du répertoire de sortie et risque de casser un
déploiement qui fonctionne. On commite donc la sortie du bundle, avec un
en-tête « généré, ne pas éditer ». Contrepartie assumée : le fichier généré
peut dériver de sa source si le build n'est pas rejoué.

**Le chemin de sortie ne change pas.** La source passe en
`src/analytics.js`, le bundle est écrit dans `assets/analytics.js` — le
chemin déjà référencé par les 10 pages HTML. Aucune page n'est modifiée.

## Architecture cible

```
src/analytics.js          source ESM, importe posthog-js  ← à éditer
        │  npm run build:analytics  (esbuild)
        ▼
assets/analytics.js       bundle IIFE commité             ← généré
        │  <script src="assets/analytics.js">
        ▼
10 pages HTML (inchangées)
```

Frontières inchangées : `assets/cookie-consent.js` ne connaît d'analytics
que le contrat `window.msInitAnalytics()`, et ce contrat est préservé à
l'identique. Le gating consentement (`ms_consent === 'accepted'`) et la
lecture du cookie `ms_variant` restent dans le module analytics.

## Phase A — débloquer le tracking

Ajouter `https://eu-assets.i.posthog.com` à la directive `script-src` de
`vercel.json`. Les autres directives sont inchangées.

Vérification : après déploiement, ouvrir `https://www.byandry.com/` en
navigation privée, accepter les cookies, confirmer l'absence de violation CSP
en console et l'arrivée des `$pageview` dans PostHog → Activity.

## Phase B — migration npm

1. `npm i posthog-js`, `npm i -D esbuild`.
2. Créer `src/analytics.js` : même logique que l'actuel `assets/analytics.js`
   (lecture cookie, gate consentement, `register({ variant })`, capture
   `cta_click`), mais `import posthog from 'posthog-js'` à la place du
   snippet inline de 20 lignes. Le commentaire RGPD en tête de fichier est
   conservé.
3. Ajouter le script npm `build:analytics` : esbuild en `--bundle
   --format=iife --minify`, entrée `src/analytics.js`, sortie
   `assets/analytics.js`, avec une bannière indiquant que le fichier est
   généré.
4. Lancer le build, commiter la sortie.

Points à vérifier à l'implémentation plutôt qu'à supposer :

- Les noms exacts des options de `posthog.init()` contre les types de la
  version de posthog-js réellement installée.
- Que le bundle IIFE minifié expose bien `window.msInitAnalytics` (esbuild ne
  doit pas le tree-shaker : c'est une affectation sur `window`, mais à
  confirmer sur la sortie réelle).
- Que `capture_pageleave: true` et la clé de projet `phc_uHyRKSZT97w...`
  (publique par nature) sont bien reportés.

Vérification : mêmes contrôles qu'en phase A, plus la confirmation que
`cta_click` remonte avec `label`, `href` et `variant` au clic sur un CTA.

## Hors périmètre

Relevé au passage, à traiter séparément :

- `@vercel/analytics` est une dépendance morte (installée, jamais importée).
- `ms-blog-article-1.html`, `ms-blog-article-2.html`,
  `ms-strategy-calculateur.html`, `ms-strategy-landing-2.html`,
  `ms-blog-barometre-2022.html`, `ms-blog-barometre-2023.html`,
  `ms-blog-barometre-2024.html`, `ms-blog-barometre-2025.html`,
  `ms-blog-barometre-2026-t1.html`, `ms-blog-barometre-2026-t2.html` et
  `ms-blog-barometre-2026-t3.html` ne chargent ni `analytics.js` ni
  `cookie-consent.js` : ni bandeau cookies, ni tracking sur ces pages.
- Poids du bundle : l'entrypoint par défaut de posthog-js est le bundle
  complet. Un entrypoint slim (`posthog-js/dist/module.slim.js` + bundles
  d'extensions) permettrait de l'alléger. Non traité ici, le poids n'étant
  pas la priorité de cette itération.
