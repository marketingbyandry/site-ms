# Mode jour/nuit — pilote sur blog.html

Date : 2026-07-16

## Contexte

Le site M&S Strategy est composé de pages HTML statiques autonomes (pas de CSS/JS partagé) : `index.html`, `index-b.html`, `b2b.html`, `b2c.html`, `blog.html`, `comment-ca-marche.html`, `resultats.html`, `ms-strategy-calculateur.html`, articles de blog, etc. Chaque page définit ses propres variables CSS dans un bloc `:root{...}` et un thème sombre unique.

`index-b.html` existe déjà comme variante claire de `index.html`, mais elle est pilotée côté serveur par `middleware.js` (A/B test via cookie `ms_variant`) — ce n'est pas un toggle utilisateur, et elle ne couvre que la page d'accueil.

Cette spec couvre un **pilote limité à `blog.html`** : ajout d'un vrai toggle jour/nuit contrôlé par l'utilisateur, mémorisé entre les visites. Si validé, le pattern pourra être répliqué sur les autres pages dans une itération ultérieure (hors scope ici).

## Palette

Les couleurs du mode clair sont reprises telles quelles depuis `index-b.html` (déjà validées visuellement en prod via l'A/B test) :

```css
:root[data-theme="light"]{
  --dark:#faf9f6;
  --dark2:#f2f0ea;
  --cream:#141414;
  --muted:#5a5a58;
  --muted2:#3a3a38;
}
```

`--teal*` et `--green*` ne changent pas : ils sont déjà utilisés sur fond clair dans `index-b.html` sans problème de contraste.

## Comportement

- **Défaut** : sombre (comportement actuel inchangé si l'utilisateur n'a jamais touché au toggle).
- **Persistance** : `localStorage['ms_theme']` = `'light'` ou absent (= sombre). Pas de détection `prefers-color-scheme` — choix explicite de l'utilisateur uniquement.
- **Anti-flash** : le script de lecture du localStorage et de pose de l'attribut `data-theme` sur `<html>` s'exécute en tête de `<body>`, avant le premier paint, pour éviter un flash sombre→clair au chargement.
- **Fallback** : si `localStorage` est inaccessible (ex. navigation privée stricte), le toggle fonctionne quand même pour la session en cours via une variable JS en mémoire ; l'accès à `localStorage` est entouré d'un `try/catch` pour ne jamais faire planter la page.

## Composant toggle

- Bouton rond flottant, fixe en bas à droite de l'écran (`position:fixed; bottom:2rem; right:2rem; z-index` élevé, au-dessus du contenu).
- Icône SVG inline soleil/lune, permutée selon le thème actif.
- Habillage visuel cohérent avec `.ncta` existant (bordure `--green`, glow au hover).
- Taille ~48px, cliquable au clavier (élément `<button>`, pas un `<div>`).

## Implémentation

- Aucune dépendance externe. Un seul fichier modifié : `blog.html`.
- Ajout du bloc `:root[data-theme="light"]{...}` juste après le `:root{...}` existant.
- Ajout du CSS du bouton flottant dans le `<style>` existant.
- Ajout du markup du bouton (SVG + `<button>`) juste avant `</body>`.
- Ajout d'un `<script>` :
  - Au chargement (placé tôt dans `<body>`) : lit `localStorage`, pose `data-theme="light"` sur `<html>` si mémorisé.
  - Au clic sur le bouton : inverse l'attribut, réécrit le localStorage (avec fallback try/catch), échange l'icône affichée.

## Test

Vérification manuelle dans le navigateur (pas de suite de tests automatisés sur ce site statique) :
- Bascule visuelle immédiate sur tous les blocs de `blog.html` (nav, hero, cartes d'articles, footer).
- Contraste correct en mode clair (texte, boutons, bordures).
- Persistance après rechargement de la page.
- Pas de flash sombre→clair au chargement quand le mode clair est mémorisé.
- Fonctionnement clavier (focus visible, activable via Entrée/Espace).

## Hors scope

- Réplication sur les autres pages du site (à faire dans une itération suivante si le pilote est validé).
- Détection `prefers-color-scheme`.
- Toute modification de `middleware.js` ou du système d'A/B test existant.
