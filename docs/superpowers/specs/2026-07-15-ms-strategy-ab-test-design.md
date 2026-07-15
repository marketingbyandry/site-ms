# A/B test de la home — design

Date : 2026-07-15
Périmètre : `index.html` uniquement. Aucun autre fichier du site n'est concerné.

## But

Comparer deux directions artistiques de la page d'accueil (variante A = design
actuel, sombre/coloré ; variante B = design sobre noir/blanc avec accents
bleu/vert) et mesurer laquelle convertit mieux, via un suivi précis des clics,
du temps passé et des actions clés (calculateur, formulaire Tally).

## 1. Répartition A/B — Vercel Edge Middleware

- Nouveau fichier `middleware.js` à la racine du repo (convention Vercel Edge
  Middleware, fonctionne sur un site statique, pas besoin de Next.js).
- `matcher: '/'` — n'intercepte que la home, aucune autre page n'est affectée.
- Logique :
  1. Lit le cookie `ms_variant` sur la requête entrante.
  2. S'il existe (`A` ou `B`), sert la version correspondante (stabilité :
     un même visiteur revoit toujours sa variante).
  3. S'il n'existe pas, tire A ou B à 50/50 (`Math.random() < 0.5`).
  4. Si `B` : réécrit (rewrite serveur, pas de redirect HTTP) vers
     `/index-b.html` — l'URL affichée reste `www.byandry.com/` dans les deux
     cas, aucun flash de contenu.
  5. Si `A` : laisse passer vers `/index.html` normalement.
  6. Pose/rafraîchit le cookie `ms_variant` (`Path=/; Max-Age=2592000;
     SameSite=Lax`, 30 jours).
- Implémentation avec les primitives `@vercel/edge` (`next()`, `rewrite()`),
  pas de dépendance à un framework.

### Points d'attention identifiés

- Le rewrite serveur ne doit pas casser les chemins relatifs des assets
  (`assets/ms-strategy-logo.png`, fonts, etc.) référencés dans `index-b.html`
  — à vérifier en test réel après implémentation, pas seulement en lecture de
  code.
- Le matcher `'/'` ne doit pas intercepter `/index.html` directement si
  quelqu'un tape cette URL à la main — comportement accepté tel quel (edge
  case rare, non traité spécifiquement).

## 2. Variante B — `index-b.html`

- Copie de `index.html` : **même contenu, même structure, mêmes sections,
  mêmes textes**. Seul l'habillage visuel change — c'est un test de direction
  artistique à message égal, pas un test de copywriting.
- Palette :
  - Fond clair (blanc/quasi-blanc), texte noir/anthracite — remplace les
    variables `--dark`, `--cream`, `--muted`, `--muted2` actuelles par leurs
    équivalents clairs.
  - `--teal` (#1a7a8a) et `--green` (#4cde80) sont **conservés tels quels**,
    utilisés exactement aux mêmes endroits fonctionnels qu'aujourd'hui (CTA,
    highlights, chiffres clés) — seules touches de couleur sur fond N&B.
- Suppression des effets qui ne correspondent pas à une esthétique sobre :
  glows colorés (`box-shadow` avec `rgba(...)` de couleur), `.bgw` en
  transparence colorée, gradients de fond. Remplacés par des bordures fines
  noires et des transitions simples (opacité, transform).
- Nouvel effet : rond flouté qui suit le curseur (desktop uniquement)
  - `<div>` fixe, cercle ~300–400px, `filter: blur(60-80px)`, dégradé radial
    bleu → vert à faible opacité.
  - Suivi de la souris en `mousemove` avec un easing léger (lerp) pour un
    mouvement fluide.
  - Activé seulement si `matchMedia('(pointer: fine)')` est vrai (désactivé
    sur mobile/tactile — pas de `mousemove` pertinent, effet non chargé pour
    rien).
  - `pointer-events: none` — ne doit jamais intercepter un clic destiné à un
    élément sous le curseur.
- Vanilla JS/CSS, cohérent avec le reste du site (pas de dépendance externe
  ajoutée pour cet effet).
- Micro-interactions validées sur maquette (`docs/superpowers/specs/assets`
  non applicable — validées via Artifact preview, à reporter sur toutes les
  pages/sections concernées de `index-b.html`) :
  - Liens de nav : hover colore le lien en `--teal` ou `--green` en
    alternance (au lieu du simple assombrissement de la variante A).
  - CTA principal ("Obtenir mon étude gratuite" et CTA équivalents) : le
    fond passe en dégradé `--teal` → `--green` au survol, et la flèche `→`
    pivote à 45° (transition CSS sur un `<span>` dédié autour de la flèche).
- **Parité de contenu confirmée** : `index-b.html` reproduit exactement les
  mêmes sections que `index.html`, dans le même ordre, avec le même texte.
  Une bande image a été testée en maquette (aperçu Artifact) pour juger du
  rendu d'un visuel dans la direction sobre, mais elle **n'est pas retenue**
  pour la version finale — écart avec A jugé contraire à l'objectif de test
  propre à structure égale. Si un visuel photographique est ajouté plus
  tard, ce sera une décision séparée appliquée aux deux variantes.

## 3. Suivi des données — PostHog

### Prérequis (côté utilisateur, hors périmètre de l'implémentation)

Créer un compte PostHog gratuit (hébergement **EU**, cohérent avec la
démarche RGPD existante du site) et récupérer la Project API Key. Cette clé
est publique par nature (clé d'ingestion, pas un secret) — elle sera commitée
en clair dans `assets/analytics.js`.

### Intégration

- Nouveau fichier partagé `assets/analytics.js`, chargé par `index.html` ET
  `index-b.html` (seule la home a le tracking pour l'instant — hors périmètre
  pour les autres pages).
- Initialise PostHog (`posthog.init(...)`) avec :
  - Autocapture activée (clics, pageviews) — comportement par défaut
    PostHog.
  - `capture_pageleave: true` pour mesurer automatiquement le temps passé
    sur la page à la sortie.
  - `posthog.register({variant: <valeur du cookie ms_variant>})` — tague
    tous les évènements de la session avec la variante vue, c'est la clé de
    comparaison A/B côté data.
- Évènements custom ajoutés sur les actions déjà présentes dans le HTML
  existant (pas de nouvelle UI). Correction après relecture du contenu réel
  de `index.html` : la home ne charge pas Tally elle-même (ses CTA renvoient
  vers `b2b.html`/`b2c.html`/le calculateur, qui portent Tally). Un seul
  évènement générique délégué couvre tous les CTA de la home plutôt que des
  évènements nommés un par un :
  - `cta_click` — délégation de clic sur tout `a.cta-btn, a.pcta, a.ncta`
    (hero, bande calculateur, bande de clôture, nav), avec en propriétés
    `{ label: <texte du lien sans la flèche>, href: <cible> }`. Permet de
    filtrer par action dans PostHog sans multiplier les noms d'évènements.
- Pas de bandeau de consentement cookie dans ce chantier (décision explicite
  de l'utilisateur — à reconsidérer plus tard pour rester rigoureux RGPD).

## 4. Lecture des résultats

Pas de dashboard custom à construire — PostHog fournit les Insights
nécessaires nativement. Livré avec un guide pas-à-pas (voir `docs/posthog-setup.md`)
couvrant :

1. Création du compte PostHog (EU) et récupération de la clé.
2. Insight "Trends" — pageviews et visiteurs uniques, segmentés par
   `variant`.
3. Insight "Average" sur `$pageleave` (temps passé), segmenté par `variant`.
4. Insight sur `cta_click` (avec breakdown sur la propriété `label` pour
   distinguer les CTA entre eux), segmenté par `variant` — la métrique la
   plus importante : quelle version convertit mieux, pas seulement laquelle
   est la plus vue.
5. Heatmap des clics (autocapture PostHog) pour une comparaison visuelle A
   vs B.

## 5. Vérification

Pas de suite de tests automatisés (cohérent avec le reste du site, voir
`handoff.md` — site statique sans build). Vérification manuelle :

- `index-b.html` : rendu desktop + mobile en navigateur réel, effet du rond
  flouté testé avec une vraie souris (pas seulement en lecture de code).
- `middleware.js` : test réel que `/` sert A ou B selon le cookie, que le
  cookie persiste sur rechargement, que les assets (logo, fonts) se chargent
  correctement après le rewrite serveur.
- Confirmation que les évènements PostHog remontent (visible dans l'activité
  live PostHog) une fois la clé branchée par l'utilisateur.

## Hors périmètre (explicitement exclu)

- Bandeau de consentement cookie RGPD.
- A/B test sur d'autres pages que la home.
- Changement de contenu/copywriting dans la variante B.
- Dashboard custom hors PostHog.
- Tracking sur les pages autres que `index.html`/`index-b.html`.
