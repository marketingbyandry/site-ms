# Pages « alternative à X » — publicité comparative SEO (lot 1)

Date : 2026-10-10

## Contexte et objectif

Positionner M&S Strategy, sur Google, comme la meilleure alternative à chacun
de ses principaux concurrents **pour un profil de client précis**, avec une
page dédiée par concurrent nommé. Objectif principal : SEO, requêtes de type
« alternative à X », « X avis », « X professionnel ». Ces pages sont longues,
indexées et maillées.

Origine : étude « Pas de -50% » du 2026-10-09
(https://claude.ai/artifact/YEFbMk3frt9jpedhVMT7XS). Elle montre que, face
aux leaders, la démarcation de M&S ne passe pas par le niveau d'économies
promis. Elle passe par le chiffre réel calculé sur la facture du client et par
l'interlocuteur qui suit le dossier.

Cette décision revient sur la règle « aucune marque nommée » de l'axe
parasitage social (PR #103), **pour ces pages uniquement**. L'axe social
garde sa règle.

## Décisions de cadrage (validées par Antoine)

| Sujet | Décision |
|---|---|
| Objectif | SEO « alternative à X » (pas d'outil de closing en noindex) |
| Lot 1 | Plateformes de courtage : Selectra, Opéra Énergie. Comparateurs : Hellowatt, Kelwatt, Papernest. Soit 5 pages + 1 hub |
| Cible | Professionnels uniquement (TPE, PME, ETI), CTA vers `b2b.html` |
| Chiffres M&S | Conservés tels quels (19 % d'économies moyennes, 70M, −21/−17/−19 %), déclarés vérifiés en interne par Antoine |
| Approche | A : pages rédigées une par une, pas de génération par gabarit + JSON |
| Hors périmètre | Fournisseurs (partenaires ou non), pages particuliers, annonces payantes sur les marques concurrentes |

Les fournisseurs partenaires (MetEnergie, OHM Énergie, Alterna ex-Vattenfall,
Engie, GazelEnergie) sont exclus volontairement. Une page « alternative à
Engie » contredirait la section « Nos fournisseurs partenaires » de
`barometre-energie.html` et exposerait la relation commerciale.

## Cadre juridique appliqué

Publicité comparative, Code de la consommation, art. L122-1 et suivants :

1. Pas de comparaison trompeuse.
2. Des services qui répondent au même besoin.
3. Des caractéristiques essentielles, pertinentes, vérifiables et
   représentatives. On ne retient pas seulement les critères où M&S gagne.
4. Ni dénigrement, ni confusion, ni profit tiré de la notoriété du
   concurrent (L122-2).
5. Pouvoir prouver rapidement l'exactitude de chaque affirmation (L122-5).

S'y ajoutent les pratiques commerciales trompeuses (L121-2) et le
dénigrement ou parasitisme économique (art. 1240 du Code civil).

Règles qui en découlent :

- **Pas de comparaison de prix.** Les courtiers et comparateurs ne publient
  pas de grille tarifaire comparable, et un prix d'énergie dépend du profil.
  On compare le service.
- **« Meilleure alternative » toujours qualifiée** par un profil et des
  critères (« pour une PME multi-sites dont le contrat court encore »). Elle
  n'apparaît jamais en absolu, ni dans le `<title>`, ni dans la meta
  description.
- **Mots interdits** (repris de l'axe parasitage) : « le meilleur » en
  absolu, « le moins cher », « imbattable », « garanti » (sauf « aucune
  coupure »), « arnaque », tout qualificatif péjoratif sur l'entreprise
  concurrente. On critique un modèle, jamais une entreprise.
- **Aucun logo, capture, couleur signature ni slogan concurrent** sur la
  page. Le nom figure en texte uniquement.
- **Aucun balisage `Review` ni `AggregateRating`** portant sur le concurrent.
- **Chiffres M&S** : la pièce interne qui les justifie (période, nombre de
  dossiers, méthode de calcul) doit pouvoir être produite rapidement en cas
  de contestation (L122-5). Elle est conservée hors repo par Antoine. La page
  garde la mention existante « moyennes constatées, le résultat dépend de
  votre profil ».

## Anatomie d'une page concurrent

**URL** : `alternative-<concurrent>-professionnel.html`

- `alternative-selectra-professionnel.html`
- `alternative-opera-energie-professionnel.html`
- `alternative-hellowatt-professionnel.html`
- `alternative-kelwatt-professionnel.html`
- `alternative-papernest-professionnel.html`

**Balises** (modèle) :

- `<title>` de 60 caractères maximum : « Alternative à Selectra pour les pros :
  comparatif | M&S Strategy »
- H1 : « Alternative à Selectra pour votre entreprise : ce que change un
  courtier indépendant »
- Meta description de 155 caractères maximum, avec le nom du concurrent,
  « professionnels » et la promesse d'étude gratuite.
- Canonical `https://cabinetms.fr/<slug>.html`.

**Sections, dans cet ordre** :

1. **Réponse directe** (40 à 60 mots, juste sous le H1). Pour quel profil
   M&S est la meilleure alternative à X, et pourquoi en une phrase. Écrite
   pour être reprise par les extraits Google et les réponses IA.
2. **X en bref.** Modèle économique, cible, ce que X fait bien. Section
   neutre et sourcée.
3. **Tableau comparatif** sur 6 à 8 critères. Liste de départ, ajustable
   selon ce que chaque concurrent publie :
   - statut (courtier, comparateur, plateforme) et indépendance déclarée ;
   - modèle de rémunération déclaré ;
   - cible principale (particuliers, TPE, PME, grands comptes) ;
   - interlocuteur (dédié, plateau, en ligne) ;
   - délai d'étude ou de premier retour ;
   - suivi après signature ;
   - nombre de fournisseurs consultés, tel que déclaré ;
   - ancienneté.
   Chaque cellule concurrente renvoie à sa source (URL + date de
   vérification). Une cellule sans source publique est notée « non
   communiqué », jamais devinée.
4. **« Pourquoi M&S est la meilleure alternative pour [profil] ».** 3 ou 4
   arguments, chacun avec sa preuve : indépendant depuis 2012
   (SIREN 752 139 477), premier retour sous 24 h après réception de la
   facture, baromètre public avec méthodologie, chiffres M&S, intervention
   possible sur un contrat en cours.
5. **« Quand X peut mieux vous convenir ».** 2 ou 3 cas concrets. Cette
   section est obligatoire : elle rend la comparaison représentative.
6. **Passer de X à M&S.** Contrat en cours, aucune coupure (seul le contrat
   commercial change), étapes, fenêtre idéale de 12 à 24 mois avant
   l'échéance.
7. **FAQ** de 5 ou 6 questions, balisée en `FAQPage`. Exemples : « X est-il
   gratuit pour les professionnels ? », « Peut-on quitter X en cours de
   contrat ? », « Quelle différence entre X et un courtier indépendant ? ».
8. **CTA final** vers `https://cabinetms.fr/b2b.html#upload`, plus un CTA
   intercalé après la section 4.

Pied de contenu : « Informations sur [X] vérifiées le JJ/MM/AAAA à partir de
ses pages publiques. Une erreur ? Écrivez-nous » (adresse en texte
sélectionnable).

**Longueur** : pour chaque page, on relève au moment de la collecte les
5 premiers résultats Google de la requête principale (« alternative à X » ou
« X professionnel »). La cible est la médiane de leur nombre de mots, à plus
ou moins 20 %, avec un plancher de 1 200 mots. Le relevé est consigné dans
`docs/alternatives/<concurrent>/serp.md`. Fourchette attendue : 1 500 à
2 500 mots.

**Schema JSON-LD** : `Article` (auteur M&S Strategy, `dateModified` = date de
vérification), `FAQPage`, `BreadcrumbList` (Accueil > Alternatives > X).

**Gabarit visuel** : gabarit éditorial v2 (PR #100, modèle
`comparatif-fournisseurs-electricite-pro.html`) : sommaire collant, notes de
marge, tableau, CTA intercalés. Nav, footer, GTM, consentement, favicons et
scripts de fin sont repris à l'identique des pages existantes.

## Page hub

`alternatives-courtier-energie.html`, avec pour H1 « Alternatives aux
plateformes de courtage et aux comparateurs d'énergie pour les pros ».

- Courte introduction sur les trois modèles : plateforme de courtage,
  comparateur, courtier indépendant.
- Tableau de synthèse par catégorie, sans marque, réutilisant la grille des
  5 catégories de `content/parasitage-social/README.md`.
- Une carte par concurrent vers sa page.
- CTA vers `b2b.html#upload`.

Longueur cible : 800 à 1 200 mots. Elle ne cannibalise pas les pages
concurrents.

## Preuves et fraîcheur

Pour chaque concurrent, dans `docs/alternatives/<concurrent>/` :

- `faits.md` : une ligne par affirmation publiée, avec l'URL source, la date
  de collecte et la citation exacte.
- `captures/` : capture de chaque page source à la date de collecte
  (screenshot Firecrawl ou PDF), plus le lien Wayback Machine quand il existe.
- `serp.md` : relevé des 5 premiers résultats et de leur longueur.
- `note-avocat.md` : une page, avec les affirmations sur le concurrent, leur
  preuve et les points de doute.

Revue des faits tous les 6 mois, ou dès qu'un concurrent change son offre.
La date « vérifiées le » est mise à jour à chaque revue.

## Maillage

- La page hub relie les 5 pages, et chaque page renvoie au hub et aux
  4 autres (bloc « Comparer avec d'autres acteurs »).
- Liens entrants : `b2b.html` (section FAQ ou réassurance), les pages
  `courtier-electricite-professionnel.html` et
  `courtier-gaz-professionnel.html` (PR #101), et
  `comparatif-fournisseurs-electricite-pro.html`.
- Ajouts : `sitemap.xml`, `plan-du-site.html`, `llms.txt`, index de
  recherche du site (`npm run build:search`).

## Dépendances

- PR #100 (gabarit v2) et PR #101 (pages courtier pro) ne sont pas encore
  mergées sur `main`. L'implémentation part d'une branche qui intègre les
  deux, puis se rebase sur `main` une fois qu'elles le sont. Si l'une est
  abandonnée, le gabarit est repris de
  `comparatif-fournisseurs-electricite-pro.html` et les liens entrants
  correspondants sont retirés du plan.

## Tests

Sur le modèle des tests de page existants (`test/*.test.mjs`) :

- chaque page : `<title>` de 60 caractères maximum contenant le nom du
  concurrent, meta description de 155 caractères maximum, canonical unique,
  H1 unique ;
- JSON-LD valide avec `Article`, `FAQPage` et `BreadcrumbList`, sans
  `Review` ni `AggregateRating` ;
- présence des sections obligatoires « Quand X peut mieux vous convenir » et
  de la mention « vérifiées le » ;
- aucune image ni `<img>` dont le nom ou l'`alt` contient le nom d'un
  concurrent ;
- liste de mots interdits absente du texte visible ;
- « meilleure alternative » absent du `<title>` et de la meta description ;
- liens hub ↔ pages et liens entrants présents, entrées du sitemap
  présentes ;
- nombre de mots du contenu principal ≥ 1 200.

## Pipeline d'exécution

1. Collecte des faits et relevé SERP par concurrent (Firecrawl), dossier
   `docs/alternatives/`.
2. Rédaction par `content-builder`, une page à la fois, à partir de
   `faits.md`.
3. Intégration HTML, schema, maillage et tests.
4. Relecture par `quality-reviewer` (contenu, juridique, SEO).
5. PR en brouillon, notes pour l'avocat jointes, relecture par l'avocat
   **avant tout merge**. Mise en ligne seulement après son feu vert.

## Critères de succès

- 6 pages en ligne après le feu vert de l'avocat, tests verts.
- Search Console, à 8 puis 12 semaines : impressions sur les requêtes
  « alternative à X » et « X avis / professionnel » pour chaque concurrent,
  et une position moyenne qui progresse.
- Dépôts de facture issus de ces pages, attribués par la page d'origine dans
  PostHog.
- Aucune mise en demeure. Toute réclamation d'un concurrent reçoit une
  réponse documentée sous 48 h grâce aux dossiers de preuves.
