# A/B test étendu à tout le site — design

Date : 2026-07-20

## Contexte

Deux chantiers existants sont à l'origine de celui-ci :

- `2026-07-15-ms-strategy-ab-test-design.md` : A/B test A (sombre actuel) vs
  B (sobre clair) limité à `index.html`/`index-b.html`, avec tracking
  PostHog (`variant`, `cta_click`, `$pageleave`).
- `2026-07-16-blog-day-night-mode-design.md` : pilote d'un toggle jour/nuit
  manuel sur `blog.html` seul (localStorage, sans lien avec l'A/B serveur).

Ce chantier **étend le test A/B serveur à 7 pages** et **retire le toggle
manuel** de `blog.html` : l'assignation de variante devient la seule source
de vérité sur tout le périmètre, mesurée de façon homogène.

## Périmètre

**Inclus** (convention CSS commune `--teal/--teal-dark/--teal-mid/--teal-light/
--teal-glow/--green/--green-glow/--dark/--dark2/--cream/--muted/--muted2`) :
`index.html`, `b2b.html`, `b2c.html`, `blog.html`, `comment-ca-marche.html`,
`resultats.html`. `index-b.html` disparaît comme fichier séparé, son contenu
(palette + langage d'interaction sobre) est replié dans `index.html`.

**Exclu** (conventions CSS différentes, hors scope pour limiter le risque) :
`ms-blog-article-1.html`, `ms-blog-article-2.html`,
`ms-strategy-calculateur.html` (page la plus complexe, logique métier),
`ms-strategy-landing-2.html` (absente du sitemap et de la nav interne —
landing page de campagne isolée, pas de maillage classique).

## 1. Répartition A/B — `middleware.js`

- `matcher` étendu de `'/'` aux 6 autres pages en scope (liste explicite des
  chemins, pas de wildcard, pour ne jamais capturer les pages hors scope).
- Logique de cookie/assignation 50/50 et détection bot **inchangée** — elle
  s'applique désormais uniformément sur toutes les pages du matcher étendu
  (les bots reçoivent toujours variant A, quelle que soit la première page
  visitée).
- **Suppression du rewrite serveur** vers `index-b.html` : il n'y a plus de
  fichier séparé à réécrire vers. Le middleware se contente de poser/lire le
  cookie `ms_variant` (`Path=/; Max-Age=2592000; SameSite=Lax`) sur chaque
  page du périmètre ; le rendu de la variante se fait côté client (section 2).

## 2. Rendu de la variante — pattern par page (pas de fichier dupliqué)

Généralisation du pattern déjà validé sur `blog.html` :

- Chaque page ajoute un bloc `:root[data-theme="light"]{...}` juste après son
  `:root{...}` existant, avec la palette ci-dessous.
- Script anti-flash en tête de `<body>` (avant tout contenu visible) : lit le
  cookie `ms_variant` (accessible en JS, pas de flag `HttpOnly`) et pose
  `data-theme="light"` sur `<html>` si la valeur est `B`. Remplace la lecture
  `localStorage` utilisée aujourd'hui sur `blog.html` — le cookie serveur
  devient la seule source de vérité, plus de choix utilisateur superposé.
- `blog.html` : suppression du bouton flottant, de son CSS, de son markup SVG
  et de son handler de clic (tout le travail des rounds 1-3 du pilote local).
  Le thème de `blog.html` suit désormais exclusivement l'assignation A/B.

### Palette (mode clair), inspirée de grand-hotel-dieu.com

```css
:root[data-theme="light"]{
  --dark:#faf8f5;      /* fond blanc chaud */
  --dark2:#EBEBEB;     /* gris clair chaud */
  --cream:#0c2635;     /* texte : bleu-nuit profond, pas de noir pur */
  --muted:#6b6058;     /* gris-taupe chaud */
  --muted2:#4a4a4a;    /* gris foncé neutre */
}
```

`--teal` et `--green` ne changent pas (identité de marque conservée, déjà
utilisés sur fond clair dans l'actuel `index-b.html` sans souci de contraste).

### Bandeaux toujours sombres (`.nav`, `.qband`, `.sfooter`, `.fbot`, `.cstrip`)

Ces classes sont **identiques (byte-for-byte)** sur les 7 pages — un seul
bloc d'override suffit, à dupliquer tel quel dans chaque fichier :

```css
:root[data-theme="light"] .nav,
:root[data-theme="light"] .qband,
:root[data-theme="light"] .cstrip,
:root[data-theme="light"] .sfooter,
:root[data-theme="light"] .fbot{
  background:#0c2635;
  --cream:#fff;
  --muted:rgba(255,255,255,.75);
  --muted2:rgba(255,255,255,.6);
  --teal-glow:#fff;
  --teal-light:#fff;
}
:root[data-theme="light"] .fbot{color:#fff}
```

(bleu-nuit plutôt que le vert utilisé sur le pilote `blog.html` — cohérence
avec le minimalisme haut de gamme de la référence, le vert reste réservé aux
accents CTA ponctuels.)

### Langage d'interaction sobre (généralisé depuis `index-b.html` existant)

- Pas de `box-shadow`/glow coloré sur les CTA (`.pcta`, `.cta-btn`).
- `.cta-glow` (halo décoratif flouté derrière les CTA hero) : masqué en mode
  clair (`display:none`) — présent uniquement sur `index.html`, aucune autre
  page en scope ne porte cet élément.
- `#orb` (rond flouté qui suit le curseur, `mousemove` + lerp, seulement si
  `matchMedia('(pointer:fine)')`) : **reste spécifique à `index.html`, non
  répliqué sur les 6 autres pages** — c'est un ajout de markup/JS dédié à la
  home dans le chantier du 2026-07-15, pas une simple bascule CSS de palette,
  et n'a pas été demandé pour les autres pages ici.
- Images en niveaux de gris (`filter:grayscale(1);opacity:.55`, comme
  `.bgw` dans `index-b.html`, si la page en question a des images/visuels
  concernés), pas de désaturation au survol.
- **CTA (`.pcta`, `.cta-btn`, `.ncta`, `.usubmit`) : effet de survol changé
  par rapport à `index-b.html` actuel.** Au lieu de faire pivoter l'icône
  flèche à 45°, le bouton grossit légèrement dans son ensemble
  (`transform:scale(1.05)`, transition `.2s ease`) — effet "prêt à être
  cliqué" plutôt que rotation d'icône. S'applique uniformément aux 7 pages.
- CTA : fond en dégradé `--teal` → `--green` au survol (au lieu d'un glow de
  couleur pleine), cohérent avec l'existant `index-b.html`.

## 3. Analytics — extension à 7 pages

- `assets/analytics.js` (déjà fonctionnel : lit le cookie `ms_variant`, tague
  `posthog.register({variant})`, capture `cta_click` sur
  `a.cta-btn, a.pcta, a.ncta`, `capture_pageleave:true`) est chargé sur les 6
  pages qui ne l'ont pas encore (`b2b.html`, `b2c.html`, `blog.html`,
  `comment-ca-marche.html`, `resultats.html`) — déjà présent sur `index.html`.
  Aucune modification du fichier lui-même.
- Effet attendu : mesure du temps passé et des clics CTA sur l'ensemble du
  parcours, pas seulement sur la home — permet de comparer A vs B sur des
  métriques de conversion réelles (calculateur, formulaire Tally) plutôt que
  sur un seul point d'entrée.

## 4. Gestion d'erreurs

- Cookie bloqué (navigation privée stricte, réglage navigateur) : chaque
  requête retombe sur un tirage 50/50 côté middleware sans jamais planter la
  page ; simplement pas de persistance de variante entre visites — même
  profil de risque que le test actuel sur la home.
- Entrée directe sur une page autre que `/` (lien partagé, pub) : comme le
  matcher couvre désormais les 7 pages, la première page visitée déclenche
  l'assignation — plus de risque de visiteur jamais assigné.
- Bots : détection `BOT_UA` inchangée, s'applique à toutes les pages du
  matcher étendu → toujours variant A, jamais de cookie posé, cohérence
  SEO/crawl préservée sur tout le périmètre (et plus seulement la home).

## 5. Vérification

Pas de suite de tests automatisés (site statique, cohérent avec l'existant).
Vérification manuelle par page, avec cookie `ms_variant` forcé en A et en B
(devtools ou `curl -H "Cookie: ms_variant=B"`) :

- Bascule visuelle correcte (palette, bandeaux bleu-nuit, images en niveaux
  de gris, CTA qui grossit au survol) sur les 7 pages.
- Pas de flash sombre→clair au chargement.
- Cookie `ms_variant` persistant en naviguant d'une page en scope à une autre
  (même variante partout dans la session).
- Contraste correct en mode clair (texte bleu-nuit sur fond blanc chaud,
  bandeaux blanc sur bleu-nuit) — contrôle visuel rapide, pas d'audit
  formalisé WCAG.
- Évènements PostHog visibles (activité live) sur les 7 pages avec la bonne
  propriété `variant`, y compris `cta_click` en dehors de la home.
- Confirmation que les bots (test avec une UA de la regex `BOT_UA`) reçoivent
  toujours variant A sur n'importe laquelle des 7 pages.

## Hors périmètre (explicitement exclu)

- `ms-blog-article-1.html`, `ms-blog-article-2.html`,
  `ms-strategy-calculateur.html`, `ms-strategy-landing-2.html`.
- Bandeau de consentement cookie RGPD (déjà hors périmètre du chantier du
  2026-07-15, non reconsidéré ici).
- Dashboard custom hors PostHog.
- Toute nouvelle métrique/évènement PostHog au-delà de ceux déjà définis dans
  `assets/analytics.js`.
