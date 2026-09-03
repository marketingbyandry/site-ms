# Maillage interne stratégique + correction H1 index.html

## Contexte

Le site cabinetms.fr (M&S Strategy) suit un pattern cohérent : chaque page a un
unique `<h1 class="ph1 reveal d1">` en haut de sa section hero (confirmé sur
b2b.html, b2c.html, comment-ca-marche.html, resultats.html, blog.html,
barometre-energie.html). `index.html` fait exception : son hero est scindé en
deux panneaux (Pro / Particulier), chacun avec son propre `<h2 class="ptitle">`,
sans H1 de page.

Par ailleurs, le maillage interne du site est aujourd'hui presque exclusivement
porté par la navigation et les CTA (boutons, footer) — il n'existe aucun lien
contextuel inséré dans le corps du texte. Les articles longs
(`ms-blog-article-1.html`, `ms-blog-article-2.html`) n'ont que 3 liens internes
distincts chacun.

## Objectif

1. Corriger l'absence de H1 sur `index.html`.
2. Introduire un maillage interne contextuel modéré (3-5 liens/page) dans les
   pages de contenu principal, en réutilisant des paragraphes existants —
   sans ajout de contenu nouveau, sans sur-optimisation d'ancre.

## 1. H1 sur index.html

Ajouter juste avant la `<section class="hero" id="hero">` (donc avant les deux
panneaux Pro/Particulier) :

```html
<h1 class="sr-only">Cabinet d'expertise en négociation d'énergie — Courtier en énergie indépendant depuis 2012 — Professionnels et particuliers</h1>
```

Créer la classe utilitaire `.sr-only` (n'existe pas encore sur le site) dans
`assets/nav-mobile.css` (déjà chargé par toutes les pages) :

```css
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
```

Les deux `<h2 class="ptitle">` des panneaux restent inchangés visuellement.
Aucun autre H1 n'existe déjà sur `index.html` (vérifié : `grep -n "<h1" index.html`
ne retourne rien).

## 2. Style des liens contextuels

Aucune classe existante pour les liens en texte courant (seul exemple actuel :
un `mailto:` en style inline sur index.html ligne 923). Créer une classe
partagée `.ilink` dans `assets/nav-mobile.css` :

```css
.ilink{color:var(--teal-light);text-decoration:underline;text-underline-offset:2px}
.ilink:hover{color:var(--green)}
```

(Les variables `--teal-light` et `--green` sont déjà définies dans le `:root`
de chaque page — cohérent avec la palette existante.)

## 3. Maillage interne — pages et principes

**Pages dans le périmètre** (confirmé avec l'utilisateur) :
`index.html`, `b2b.html`, `b2c.html`, `comment-ca-marche.html`,
`resultats.html`, `barometre-energie.html`, `blog.html`,
`ms-blog-article-1.html`, `ms-blog-article-2.html`,
`ms-blog-barometre-2022.html` → `ms-blog-barometre-2026-t3.html` (6 éditions).

**Hors périmètre** : `cgv.html`, `mentions-legales.html`,
`politique-confidentialite.html`, `ms-strategy-calculateur.html`,
`ms-strategy-landing-2.html` (pages utilitaires/outil, peu de valeur SEO pour
du maillage contextuel).

**Principes** :
- 3 à 5 liens par page, insérés dans des paragraphes de texte **existants**
  (pas de nouvelles phrases ajoutées uniquement pour caser un lien).
- Ancre textuelle naturelle, jamais l'exact-match répété du mot-clé cible
  (éviter le sur-maillage pénalisant côté SEO).
- Tous les liens en texte courant utilisent la classe `.ilink`.
- Un lien par cible maximum par page (pas de répétition du même lien).

**Carte de maillage indicative** (le choix exact des phrases/ancres se fait à
l'exécution, dans le respect de ces principes) :

| Page source | Cibles pertinentes | Logique |
|---|---|---|
| `index.html` | `b2b.html`, `comment-ca-marche.html`, `resultats.html` | fournisseurs partenaires → b2b ; déroulé de l'accompagnement → comment-ca-marche ; économies moyennes → resultats |
| `b2b.html` | `b2c.html`, `barometre-energie.html`, `resultats.html` | segment complémentaire particulier ; mentions de prix de marché → baromètre ; preuve sociale → résultats |
| `b2c.html` | `b2b.html`, `comment-ca-marche.html` | segment complémentaire pro ; déroulé → comment-ca-marche |
| `comment-ca-marche.html` | `b2b.html`, `b2c.html`, `resultats.html` | retour vers les pages segment + preuve sociale |
| `resultats.html` | `b2b.html`, `b2c.html`, `comment-ca-marche.html` | retour vers conversion |
| `barometre-energie.html` | `b2b.html`, `blog.html`, éditions baromètre récentes | mise en contexte marché → étude gratuite ; ressources |
| `blog.html` | articles et baromètres listés, `b2b.html` | hub de contenu → détail articles |
| `ms-blog-article-1.html` / `-2.html` | `b2b.html`, `barometre-energie.html`, autre article | approfondissement + conversion |
| `ms-blog-barometre-2022..2026-t3.html` | édition précédente/suivante, `b2b.html` | continuité éditoriale + conversion |

## Hors scope

- Pas de refonte visuelle du hero d'index.html.
- Pas de nouveau contenu éditorial (paragraphes existants uniquement).
- Pas de modification des pages utilitaires listées ci-dessus.
- Pas de changement de la nav ou des CTA existants.

## Tests / validation

- Suite de tests existante du projet (mentionnée à 69-79 tests) doit continuer
  à passer.
- Vérification visuelle : le H1 masqué ne doit rien changer visuellement sur
  index.html ; les liens `.ilink` doivent être visuellement cohérents avec la
  palette (teal-light → green au hover), lisibles en thème clair et sombre.
- `grep -c "<h1" index.html` doit retourner 1 après le fix.
