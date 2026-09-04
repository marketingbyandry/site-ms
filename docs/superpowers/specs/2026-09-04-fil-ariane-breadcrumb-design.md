# Fil d'Ariane dynamique — design

## Contexte

Le site a déjà un `BreadcrumbList` en JSON-LD écrit à la main sur ~15 pages
(articles de blog, baromètres, b2b, b2c, comment-ça-marche, calculateur),
mais :

- il n'existe **aucun composant visuel** équivalent — la `<nav>` ne contient
  que le logo et un CTA ;
- le JSON-LD est **tapé à la main indépendamment** de toute UI, donc rien ne
  garantit qu'il reste synchronisé avec la structure réelle du site si une
  page est renommée ou déplacée.

Le site est 100% statique (fichiers `.html` autonomes, pas de moteur de
templating serveur, pas de générateur qui produit le HTML final à partir
d'un template — `scripts/build-analytics.mjs` ne fait que bundler le JS
analytics). Toute solution doit donc produire du HTML final statique, pas
dépendre d'un serveur de rendu à la requête.

## Objectif

1. Afficher un fil d'Ariane visuel, sur charte, sur les pages profondes.
2. Fournir à Google (et tout autre robot) le `BreadcrumbList` structuré
   correspondant, de façon fiable — pas seulement "supportée" par Googlebot,
   mais au plafond de fiabilité possible pour ce type de site (HTML statique
   dès la réponse, aucune dépendance à l'exécution JS pour être indexé).
3. Une seule source de vérité par page, pour que le fil visible et le schema
   ne puissent plus diverger.

## Pourquoi pas de l'injection JS au chargement

Une première option envisagée était un script client (`assets/breadcrumb.js`,
même pattern que `nav-mobile.js`/`ticker.js` déjà en place) qui lit une
donnée déclarée en haut de page et injecte à la fois le fil visuel et le
JSON-LD au chargement. Rejetée pour la partie SEO :

- Googlebot indexe en deux passes : le HTML brut d'abord, le JS ensuite dans
  une file de rendu séparée (délai variable, parfois plusieurs jours) — un
  JSON-LD statique est lu dès la première passe, un JSON-LD injecté par JS
  dépend du succès de la seconde.
- Les bots déjà détectés dans `middleware.js` (`BOT_UA` : facebookexternalhit,
  linkedinbot, etc.) n'exécutent pas de JS.
- Les outils d'audit SEO usuels (Screaming Frog, Ahrefs) ne rendent pas le JS
  par défaut — un audit verrait le schema comme absent alors qu'il existe.

Le JS reste utile pour de l'amélioration progressive (troncature mobile),
jamais comme seul mécanisme de production du schema.

## Approche retenue : génération statique à partir d'une déclaration par page

**1. Déclaration, une fois par page**, dans le `<head>`, juste avant la
fermeture — un simple tableau, lisible et éditable à la main :

```html
<script type="application/json" id="breadcrumb-data">
[
  {"name":"Accueil","url":"/"},
  {"name":"Ressources & analyses","url":"/blog.html"},
  {"name":"Énergie industrielle : pourquoi votre site paie trop"}
]
</script>
```
(dernier élément = page courante, sans `url`)

**2. Script de génération** `scripts/build-breadcrumb.mjs` (même famille que
`build-analytics.mjs`), exécuté à la main lors de l'édition d'une page (pas
un build automatique à chaque requête — un outil d'authoring) :

- lit le tableau `#breadcrumb-data` de chaque page listée,
- écrit/remplace dans le `<head>` le bloc statique
  `<script type="application/ld+json">` avec le `BreadcrumbList` complet
  (`@context`, `itemListElement`, `position`, `name`, `item` en URL absolue
  `https://cabinetms.fr/...`),
- écrit/remplace dans le `<body>`, juste après `<nav>`, le markup HTML
  statique du fil d'Ariane visuel.

Résultat livré au navigateur et aux robots : HTML 100% statique, comme
aujourd'hui, mais généré à partir d'une seule déclaration au lieu d'être
retapé à la main à deux endroits différents (JSON-LD + éventuel HTML visuel).

**3. Sur les pages d'articles**, le lien existant `← Tous les articles` en
tête de l'`<article>` est remplacé par le fil d'Ariane (même fonction,
un seul composant).

## Design visuel

- Barre fine sous la `<nav>`, au-dessus du hero.
- Texte 13px, Satoshi (police courante du corps de texte).
- Liens intermédiaires : `--dark` à ~60% d'opacité, hover `--dark` plein.
- Séparateur : `›` en `--teal`.
- Page courante : `--dark` plein, semi-bold, `aria-current="page"`, non
  cliquable.
- `<nav aria-label="Fil d'Ariane">` pour l'accessibilité.
- Mobile (< 480px) : troncature à *Accueil › … › [page courante]* pour éviter
  le retour à la ligne.

## Périmètre — pages migrées

Pages profondes uniquement (pas la home, racine du site) :
`blog.html`, `ms-blog-article-1.html`, `ms-blog-article-2.html`,
`ms-blog-barometre-2022.html` à `2026-t3.html` (6 pages), `resultats.html`,
`b2b.html`, `b2c.html`, `comment-ca-marche.html`, `barometre-energie.html`,
`ms-strategy-calculateur.html`, `mentions-legales.html`, `cgv.html`.

Soit ~17 pages, chacune migrée par remplacement du bloc JSON-LD actuel par
la déclaration `#breadcrumb-data`, puis passage du script de génération.

`templates/barometre-article-template.html` (template source des pages
baromètre) reçoit aussi la déclaration, pour que les futures pages générées
à partir de lui l'aient déjà.

## Tests

- `test/build-breadcrumb.test.mjs` (nouveau, même style que les tests
  existants dans `test/`) : le script de génération produit un JSON-LD et un
  markup HTML corrects à partir d'une déclaration donnée.
- Vérification manuelle avec l'outil *Google Rich Results Test* sur 2-3
  pages migrées (un article de blog, une page baromètre, `b2b.html`).
- Vérification visuelle (desktop + mobile) sur les mêmes pages.

## Hors périmètre

- Pas de registre central des URLs du site (pattern actuel = pages
  autonomes, conservé).
- Pas de pré-rendu spécifique aux bots dans `middleware.js` — le HTML étant
  déjà statique, ça n'apporte rien ici (à reconsidérer seulement si Search
  Console signale un jour un problème d'indexation de ce schema précis).
