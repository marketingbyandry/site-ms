# Chantier SEO « courtier en énergie » — Vague 1 (pro) — Design

**Date** : 2026-10-06
**Projet** : SITE MS (cabinetms.fr) — M&S Strategy
**Statut** : design validé, en attente du plan d'implémentation
**Document parent** : `docs/strategie-geo-seo/2026-07-22-strategie-geo-seo-ms-strategy.md` (cette vague réalise les piliers 1 et 5 et une partie des clusters prévus en Phase 1–2)

---

## 1. Objectif

Positionner cabinetms.fr sur la famille de requêtes « courtier énergie / électricité / gaz » en commençant par les intentions **professionnelles**, via des pages de service (qui sont ce que Google classe sur ces requêtes commerciales) soutenues par des articles de blog et un maillage interne serré, plus un travail hors site exécuté par Antoine.

### Décisions de cadrage

| Question | Décision |
|---|---|
| Priorité | **Pro d'abord.** Vague 1 = pro / entreprise / électricité / gaz. Vague 2 = tête « courtier en énergie » + particuliers. |
| Périmètre | **Site + hors site.** Le code et le contenu sont livrés dans le repo ; le hors site prend la forme d'une checklist exécutée par Antoine. |
| Architecture | **A — page centrale + 2 pages de service + articles.** Une intention = une page. |
| Concurrent « dune energie » | **Non ciblé** (requête de marque d'un tiers, faible chance de gain, image agressive). |

## 2. Point de départ (Search Console, 3 derniers mois au 2026-10-06)

- 28 clics au total, quasi exclusivement sur des requêtes de marque (« ms strategy », « m&s strategy »).
- **Zéro impression** sur « courtier en énergie », « courtier energie », « courtier énergie » : le domaine manque d'autorité ; la page d'accueil cible déjà ces termes.
- Requêtes pro déjà visibles en page 2–3 :

| Requête | Position moyenne |
|---|---|
| courtier electricite pro | 22,5 |
| courtier électricité professionnel / electricite professionnel | 17,3 – 25 |
| courtier gaz entreprise | 26,7 |
| courtage en energie tpe | 29,7 |
| courtier en electricite | 43,5 |
| courtier en energie entreprise / professionnel | ~70 |

- Pages villes « courtier énergie [ville] » : positions 11–18 (Toulouse, Montpellier, Marseille, Lyon) — meilleurs actifs actuels.
- `b2b.html` : position moyenne 29, 21 impressions. H1 « Économisez votre énergie », aucun H2 contenant « courtier ».

## 3. Mapping mots-clés → pages (vague 1)

Règle : **une intention = une seule page cible.** Les autres pages renvoient vers elle mais ne portent jamais son mot-clé exact dans leur `<title>`.

| Page cible | Mots-clés | Vol./mois (cumul) |
|---|---|---|
| `b2b.html` (page centrale pro) | courtier energie pro, courtier en energie pro, courtier énergie pro, courtier energie entreprise, courtage energie entreprise, courtier en énergie pour (les) professionnels, courtier en énergie pour professionnel, courtier énergie pme | ~580 |
| `courtier-electricite-professionnel.html` (nouvelle) | courtier en électricité, courtier electricité, courtier electricite pro, courtier electricite professionnel, courtier électricité professionnel, courtier electricite entreprise, courtier electricité entreprise | ~820 |
| `courtier-gaz-professionnel.html` (nouvelle) | courtier gaz, courtier gaz entreprise | ~110+ |
| `courtier-energie-gratuit-remuneration.html` (article) | soutien de la page centrale (requêtes de défiance) | — |
| `courtier-ou-comparateur-energie-pro.html` (article) | soutien de la page centrale + « comparateur énergie professionnel » (déjà en position 9–13) | — |
| `choisir-courtier-energie-criteres-pieges.html` (article) | soutien de la page centrale | — |
| `courtage-energie-tpe-pme.html` (article) | courtage energie entreprise, courtier énergie pme, courtage en energie tpe (soutien) | — |

**Hors vague 1** : courtier en énergie, courtier energie, courtier énergie, courtage energie (portées par `index.html`, vague 2) ; courtier énergie particulier, courtier en énergie pour particulier (`b2c.html`, vague 2) ; dune energie (non ciblé).

## 4. Changements par page

### 4.1 `b2b.html` — page centrale pro (retouche, mise en page conservée)

- `<title>` : « Courtier en énergie pro : électricité & gaz pour TPE, PME, ETI | M&S Strategy ».
- Meta description réécrite : elle contient « courtier en énergie pro » et ses bénéfices (étude gratuite, réponse sous 24h).
- H1 : l'accroche visuelle actuelle est conservée ; on ajoute un sur-titre **visible** « Courtier en énergie pour professionnels » à l'intérieur du H1 (pas de texte en `sr-only`).
- H2 reformulés en requêtes, sans changer le design. Au minimum :
  - « De l'analyse à la signature » → « Comment travaille un courtier en énergie pour entreprise »
  - « Sans courtier, contre avec M&S Strategy » → « Courtier énergie pro, comparateur ou achat en direct ? »
  - « Questions fréquentes pour les professionnels » → « Questions fréquentes sur le courtage en énergie pro »
- Nouveau bloc « réponse d'abord » d'environ 300 mots sous le hero : définition canonique (« Un courtier en énergie pro est… »), mode de rémunération (par les fournisseurs, gratuit pour le client), cibles TPE / PME / ETI, liens vers les pages électricité et gaz.
- FAQ portée de 4 à 8 questions alignées sur les requêtes (gratuité, seuil de consommation PME, contrat en cours, multi-sites, électricité vs gaz, durée, indépendance, délai). Le JSON-LD `FAQPage` est mis à jour à l'identique du texte visible.
- Bloc « Pour aller plus loin » qui renvoie vers les 4 articles de la vague 1.

### 4.2 `courtier-electricite-professionnel.html` (nouvelle)

- Gabarit : structure de `courtier-energie-toulouse.html` (hero + formulaire, preuves, sections, FAQ, partials `contact-reponse` / `cta-reassure` / `floating-cta`, JSON-LD `Service` + `FAQPage` + `Organization` + `BreadcrumbList`). Même direction artistique, aucun nouveau design.
- `<title>` : « Courtier électricité professionnel : TPE, PME, entreprises | M&S Strategy ». H1 contenant « courtier en électricité ».
- Contenu spécifique (~1 500 mots) : segments C5 / C4 / C2 et puissance souscrite, prix fixe ou indexé, composantes TURPE / accise, fin de l'ARENH et VNU 2026, méthode M&S appliquée à l'électricité, FAQ de 8 questions.
- Liens sortants : page centrale, page gaz, articles existants (`turpe-2026-professionnels`, `prix-fixe-vs-indexe-electricite-pro`, `puissance-souscrite-entreprise-kva`, `vnu-2026-versement-nucleaire-universel`, `comparatif-fournisseurs-electricite-pro`), pages `tarif-electricite-professionnel-[ville]`.

### 4.3 `courtier-gaz-professionnel.html` (nouvelle)

- Même gabarit que 4.2.
- `<title>` : « Courtier gaz professionnel : contrats gaz entreprise | M&S Strategy ». H1 contenant « courtier gaz ».
- Contenu spécifique (~1 500 mots) : profils T1 à T4 / TP, indexation PEG / TTF, fiscalité (accise sur le gaz naturel, CTA), échéances et fenêtre de renégociation, méthode M&S appliquée au gaz, FAQ de 8 questions.
- Liens sortants : page centrale, page électricité, `accise-electricite-gaz-2026`, pages `gaz-professionnel-[ville]`.

### 4.4 `courtier-en-energie-role.html` (retouche)

- `<title>` recentré sur la définition : « Qu'est-ce qu'un courtier en énergie ? Rôle, rémunération, intérêt | M&S Strategy » (pour qu'il ne concurrence plus `b2b.html` sur « courtier en énergie pour entreprise »).
- Ajout d'un lien contextuel vers `b2b.html`.

### 4.5 Ce qui n'est pas modifié

`index.html`, `b2c.html`, le design system, les formulaires, le tracking (PostHog, CAPI) et les classes CTA existantes.

## 5. Articles de blog (4)

**Circuit de production existant** : le markdown est écrit dans `~/Documents/Energie-Blog-Articles/articles/`, le slug est ajouté à `CATEGORY_BY_SLUG` dans `scripts/build-seo-articles.mjs` (catégorie « Fournisseurs & contrats »), puis le HTML est généré par le script avec `templates/blog-article-template.html`, avec la vignette et la bannière selon les règles photo du blog.

**Sauvegarde** : le corpus source n'étant pas versionné, les 4 markdown sont **aussi copiés** dans `content/seo-courtier/`.

| Slug | Angle « réponse d'abord » | Liens principaux |
|---|---|---|
| `courtier-energie-gratuit-remuneration` | Oui, c'est gratuit pour le client : le courtier est rémunéré par le fournisseur. Comment, combien, ce que ça change ; transparence sur le modèle M&S. | `b2b.html` |
| `courtier-ou-comparateur-energie-pro` | Tableau courtier / comparateur / achat en direct (prix, accompagnement, multi-sites, suivi) ; quel canal pour quelle entreprise. | `b2b.html` |
| `choisir-courtier-energie-criteres-pieges` | 7 critères (indépendance, nombre de fournisseurs, transparence de la commission, suivi…) et pièges (démarchage agressif, engagement caché, mandat exclusif). | `b2b.html`, page électricité |
| `courtage-energie-tpe-pme` | Ce que le courtage apporte selon la taille (TPE en C5, PME en C4 / gaz T2–T3), seuils de rentabilité, exemples chiffrés. | `b2b.html`, pages électricité et gaz |

Règles communes : 1 200 à 1 800 mots, H2 formulés en questions, définition canonique en tête, FAQ avec JSON-LD, 2 CTA vers l'étude gratuite. Chiffres uniquement tirés du site (baromètre, prix kWh 2026, articles existants) ou de sources officielles citées (CRE, Légifrance). **Aucun cas client inventé** : les exemples sont présentés comme illustratifs, et un cas réel n'est ajouté que s'il est fourni par Antoine.

## 6. Maillage interne

Ancres descriptives uniquement (jamais « cliquez ici » ni « en savoir plus » seul).

- **Triangle des pages de service** : `b2b.html` ↔ `courtier-electricite-professionnel.html` ↔ `courtier-gaz-professionnel.html`.
- **Articles → page centrale** : les 4 articles pointent vers `b2b.html`, et vers les pages électricité / gaz quand le sujet s'y prête. La page centrale pointe vers les 4 articles.
- **Pages villes** :
  - 10 × `courtier-energie-[ville]` → 1 lien vers `b2b.html` + 1 lien vers la page électricité ;
  - 10 × `gaz-professionnel-[ville]` → 1 lien vers `courtier-gaz-professionnel.html` ;
  - 10 × `tarif-electricite-professionnel-[ville]` → 1 lien vers la page électricité.
- **Articles existants proches** → 1 lien contextuel chacun vers la page de service adaptée : `comparatif-fournisseurs-electricite-pro`, `prix-fixe-vs-indexe-electricite-pro`, `resilier-contrat-electricite-entreprise`, `decrypter-facture-electricite-pro`, `turpe-2026-professionnels`, `achat-groupe-energie-pme-franchises`, `courtier-en-energie-role`.
- **Navigation et indexation** : les nouvelles pages sont ajoutées à `plan-du-site.html`, `sitemap.xml` (avec `lastmod`), `llms.txt`, et au pied de page s'il liste les services. Les nouvelles pages incluent `assets/site-search.js`, et l'index Pagefind est reconstruit.

## 7. Checklist hors site (exécutée par Antoine)

**Livrable** : `docs/strategie-geo-seo/2026-10-checklist-hors-site-courtier.md`, avec des cases à cocher et des textes prêts à copier-coller. Phrase d'entité identique partout : *« M&S Strategy, courtier en énergie indépendant depuis 2012, rémunéré par les fournisseurs. »*

1. **Google Business Profile** : la catégorie principale la plus proche de « courtier en énergie » est **vérifiée dans la liste réelle de Google** pendant l'exécution, avec des catégories secondaires pertinentes ; services électricité pro, gaz pro et étude gratuite, avec un lien vers chaque page ; 4 posts rédigés (un par article) ; un message type de demande d'avis, avec le lien direct. Objectif : 10 avis.
2. **Cohérence NAP** : Societe.com, PagesJaunes, LinkedIn entreprise, Bing Places, Apple Business Connect (même nom, adresse, téléphone et description).
3. **10 à 15 cibles de liens** **recherchées et vérifiées** pendant l'exécution : annuaires et comparatifs de courtiers, articles « meilleurs courtiers énergie », médias PME/TPE et CCI régionales (Montpellier en priorité, angle Baromètre), fédérations professionnelles des verticaux couverts par le blog. Pour chacune : URL, pertinence, type de lien, message d'approche rédigé.

Exclus : achat de liens, fermes de liens, échanges de liens en masse.

## 8. Tests et vérification

- `npm test` entièrement vert (baseline : 225 tests), avec les assertions existantes mises à jour dans le même commit si un texte testé change (ex. tests `b2b-*`).
- Nouveau `test/seo-courtier-pro.test.mjs` :
  - title, H1 et meta description de chaque page cible contiennent son mot-clé principal ;
  - garde-fou anti-cannibalisation : aucune autre page HTML n'a le mot-clé principal exact d'une page cible dans son `<title>` (hors pages villes, qui ajoutent le nom de la ville) ;
  - JSON-LD parsable et types attendus (`Service`, `FAQPage`, `Article`, `BreadcrumbList`) ; questions FAQ du JSON-LD identiques au texte visible ;
  - liens de maillage présents (triangle des pages de service, articles → `b2b.html`, pages villes → pages de service) ;
  - nouvelles pages présentes dans `sitemap.xml`, `plan-du-site.html` et `llms.txt`, et incluant `assets/site-search.js`.
- `npm run build:search` relancé, et les fichiers générés sont commités.
- Contrôle visuel Playwright (desktop 1440 px et mobile 390 px, console sans erreur) sur `b2b.html`, `courtier-electricite-professionnel.html`, `courtier-gaz-professionnel.html` et un article.

## 9. Mesure du succès

- **Baseline** (2026-10-06) : voir §2.
- Après la mise en ligne : demande d'indexation dans Search Console pour les pages nouvelles et modifiées.
- Nouvel export Search Console à **J+30 et J+60**, avec le même filtre « courtier ».
- **Objectifs J+60** : requêtes électricité pro en page 1 (position ≤ 10) ; `b2b.html` sous la position 15 en moyenne ; premières impressions sur « courtier gaz ».
- **Déclencheur de la vague 2** : vague 1 en page 1, **ou** premiers liens externes obtenus via la checklist.

## 10. Risques

| Risque | Parade |
|---|---|
| Contenu trop proche entre `b2b.html` et les pages électricité / gaz (duplication) | Angles techniques distincts (segments, indexation, fiscalité propre à chaque énergie) ; test anti-cannibalisation sur les titles. |
| Le plafond d'autorité limite les gains malgré le contenu | Checklist hors site menée en parallèle ; attentes calibrées (page 1 sur la longue traîne pro, pas sur la tête). |
| Corpus d'articles hors repo perdu | Copie des markdown dans `content/seo-courtier/`. |
| Les retouches de `b2b.html` cassent des tests existants | Mise à jour des assertions dans le même commit ; Playwright sur la page. |
