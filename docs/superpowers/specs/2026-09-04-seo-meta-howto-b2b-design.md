# SEO : meta descriptions, schema HowTo, boost b2b — design

## Contexte

Suite à un audit SEO général du site (cabinetms.fr, 100% statique), trois
lacunes distinctes restent à traiter. Le H1 manquant sur `index.html` et le
maillage interne ont été trouvés déjà résolus dans une branche non livrée
(`worktree-maillage-interne-h1`, PR #66) — ils sont hors périmètre ici.

## Objectif

1. Meta descriptions optimisées et spécifiques sur les 14 pages indexées.
2. Schema `HowTo` sur `comment-ca-marche.html`.
3. Renforcement SEO de `b2b.html` : schema `Service` + densification du
   contenu sectoriel existant.

## 1. Meta descriptions — 14 pages indexées

**Constat** : `robots content="noindex"` exclut déjà `cgv.html`,
`mentions-legales.html`, `merci-facture.html`, `ms-strategy-landing-2.html`,
`politique-confidentialite.html`. Sur les 14 pages indexées restantes, 10
dépassent ~160 caractères (jusqu'à 250 sur les bilans annuels) — Google
tronque autour de 155-160 sur desktop. Les 4 sous la limite
(`index`, `b2b`, `b2c`, `blog`, `ms-blog-article-1`) restent génériques :
elles vendent le même pitch cabinet plutôt que la spécificité de la page.

**Règle d'écriture** : 150-160 caractères, une proposition de valeur propre
à *cette* page (pas un pitch cabinet recyclé), se terminant par un appel à
l'action ou un chiffre concret quand la page en a un. Le `<title>` de chaque
page porte déjà cette spécificité (ex. bilans annuels/trimestriels) — la
meta description doit s'appuyer sur la même angle, pas le répéter mot pour
mot.

**Exemples travaillés** (les 12 autres suivent le même principe à
l'exécution, angle propre à chaque page) :

- `index.html` (158 car. actuels, générique) →
  *"Cabinet de courtage en énergie indépendant depuis 2012. Nous mettons
  tous les fournisseurs en concurrence pour vos contrats gaz et électricité,
  pro ou particulier. Étude gratuite sous 24h."* (155 car.)
- `ms-blog-barometre-2026-t3.html` (209 car. actuels, formule identique aux
  5 autres bilans) →
  *"T3 2026 : électricité à 101,37 €/MWh, gaz en forte hausse. Analyse des
  tendances du marché de l'énergie et ce qu'elles changent pour votre
  prochaine négociation."* (~155 car., reprend le chiffre du titre plutôt
  que la formule répétée "bilan des prix de l'énergie").

**Périmètre complet** : `index.html`, `b2b.html`, `b2c.html`, `blog.html`,
`comment-ca-marche.html`, `barometre-energie.html`,
`ms-strategy-calculateur.html`, `resultats.html`, `ms-blog-article-1.html`,
`ms-blog-article-2.html`, `ms-blog-barometre-2022.html` à
`ms-blog-barometre-2026-t3.html` (6 éditions).

Chaque page a aussi une balise `og:description` — mise à jour en miroir de
la meta description pour rester cohérente (déjà le pattern existant sur les
pages qui ont l'Open Graph).

## 2. Schema HowTo — comment-ca-marche.html

Les 5 étapes existantes (`.step`, lignes 226-259 : "Vous nous envoyez votre
facture" → "Nous lançons l'appel d'offres" → "Vous recevez un comparatif
clair" → "Nous finalisons le changement" → "Nous suivons votre dossier dans
la durée") deviennent un `HowTo.step[]`. Contenu repris tel quel (pas de
nouvelle rédaction) — correction par rapport à la première lecture de ce
document, qui n'en comptait que 4 :

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Comment fonctionne le courtage en énergie M&S Strategy",
  "step": [
    {"@type": "HowToStep", "position": 1, "name": "Vous nous envoyez votre facture", "text": "Un simple envoi par email ou via notre formulaire en ligne suffit. Nous analysons votre consommation réelle, la structure de votre contrat actuel et sa date d'échéance. Cette étape est gratuite et sans engagement."},
    {"@type": "HowToStep", "position": 2, "name": "Nous lançons l'appel d'offres", "text": "Nous consultons simultanément l'ensemble des fournisseurs actifs sur votre segment (historiques et alternatifs) au lieu de comparer seulement 3 ou 4 acteurs comme le font la plupart des comparateurs en ligne."},
    {"@type": "HowToStep", "position": 3, "name": "Vous recevez un comparatif clair", "text": "Un tableau simple et chiffré : prix, conditions contractuelles, clauses d'indexation. Aucune pression commerciale : vous gardez la décision finale et pouvez toujours choisir de ne pas changer de fournisseur."},
    {"@type": "HowToStep", "position": 4, "name": "Nous finalisons le changement", "text": "Si vous validez une offre, nous nous occupons des démarches administratives auprès du nouveau fournisseur. Aucune coupure de service. Le changement se fait de façon transparente pour vous."},
    {"@type": "HowToStep", "position": 5, "name": "Nous suivons votre dossier dans la durée", "text": "Notre accompagnement ne s'arrête pas à la signature. Nous anticipons votre prochaine échéance de renouvellement et vous alertons 12 à 24 mois avant, pour ne jamais rater la meilleure fenêtre de négociation."}
  ]
}
```

Pas de `totalTime`/`estimatedCost`/`tool`/`supply` : rien dans le contenu
actuel ne les justifie précisément, et un schema qui invente des valeurs
sans base dans le contenu visible est le genre d'écart que Google ignore ou
sanctionne. Ajouté en statique dans le `<head>`, même logique que les autres
JSON-LD déjà sur cette page.

## 3. Boost b2b.html

**Schema `Service`** — b2b.html a déjà `FAQPage` + `BreadcrumbList`, mais
rien qui décrive l'offre elle-même comme entité structurée :

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Courtage en énergie pour professionnels",
  "provider": {"@id": "https://cabinetms.fr/#organization"},
  "areaServed": "FR",
  "audience": {"@type": "BusinessAudience", "audienceType": "TPE, PME, ETI"},
  "description": "Négociation de contrats gaz et électricité pour entreprises, mise en concurrence de l'ensemble des fournisseurs du marché."
}
```

`provider` référence l'`@id` de l'organisation déjà déclaré sur
`index.html` (`https://cabinetms.fr/#organization`) plutôt que de dupliquer
les infos `ProfessionalService`. Pas d'`AggregateRating` : aucun avis client
réel n'existe sur le site, en fabriquer un violerait les règles de données
structurées de Google.

**Densification du contenu sectoriel** — le bloc `Secteurs accompagnés`
(lignes 420-442) a déjà 3 cartes (Industrie & production, Commerce &
multi-sites, Tertiaire & collectivités) avec un texte descriptif par
secteur. On enrichit ces 3 paragraphes existants avec des termes plus
spécifiques (types d'activité concrets, ex. "sites industriels
agroalimentaires ou métallurgiques" plutôt que "sites à forte
consommation") pour capter des requêtes plus longues et précises — sans
ajouter de nouvelle carte ni de nouvelle section.

## Hors périmètre

- H1 caché sur `index.html` et maillage interne général : déjà traités,
  PR #66.
- `assets/analytics.js` / PostHog : conservé tel quel (session replay
  nécessaire à l'utilisateur).
- `AggregateRating` ou tout schema nécessitant des données non disponibles
  sur le site.

## Tests

- Vérification manuelle Google Rich Results Test sur `comment-ca-marche.html`
  (HowTo) et `b2b.html` (Service).
- `npm test` doit continuer à passer (pas de nouveau test dédié attendu :
  changements de contenu texte/JSON-LD statique, pas de logique).
- Relecture des 14 meta descriptions pour longueur (150-165 car.) et absence
  de doublon entre pages.
