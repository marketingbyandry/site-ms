# Landing page personnalisée de prospection (`prospect.html`) — spec

## Contexte

La liste de 37 prospects énergo-intensifs constituée le 2026-09-08
(`~/Documents/leads_energo_intensifs.csv`) doit être démarchée avec un lien
personnalisé plutôt qu'un renvoi générique vers `b2b.html`. Le besoin dépasse
cette liste : toute campagne de démarchage à venir, quel que soit le secteur
(agriculture, restauration, tourisme/hôtellerie, métallurgie, etc.), doit
pouvoir réutiliser le même mécanisme sans modification de code à chaque
nouveau secteur ciblé.

Le site est statique (Vercel, pas de backend) et personnalise déjà l'URL côté
edge pour l'attribution commerciale (`ref`) et le suivi de campagne (`camp`,
cf. `docs/superpowers/specs/2026-08-12-camp-tracking-design.md`). Le même
principe — paramètres d'URL lus côté client, aucun stockage serveur — s'étend
ici à l'affichage du nom du prospect et de son secteur.

## Mécanisme

### Page `prospect.html`

Nouvelle page autonome (HTML/CSS/JS inline, comme `b2b.html`), construite sur
le même gabarit visuel (palette, structure hero, offre, FAQ, formulaire
Tally). Pas d'include partagé — cohérent avec le fonctionnement actuel du
site où chaque page HTML est indépendante.

Trois paramètres d'URL, tous facultatifs, tous injectés via `textContent`
(jamais `innerHTML` avec concaténation de chaîne) :

- `nom` — nom de l'entreprise. Affiché dans le H1 : sans `nom`, « Économisez
  votre énergie, nous négocions votre contrat. » ; avec `nom`, « {nom},
  économisez sur votre énergie — nous négocions votre contrat. »
- `secteur` — texte libre (ex. `Cimenterie`, `Agriculture`), voir
  bibliothèque de blocs ci-dessous.
- `accroche` — texte libre court, optionnel, affiché dans un encart dédié
  sous le H1 (voir plus bas).

### Bibliothèque de blocs sectoriels — `assets/sector-blocks.js`

Fichier séparé de la page, chargé par `prospect.html`, exposant des
fonctions pures (testables sans DOM) :

```js
window.MSSectorBlocks = {
  match(secteurRaw) { /* normalise (minuscule, sans accents) et cherche
                          une entrée dont un des mots-clés est inclus dans
                          le texte normalisé ; retourne le HTML du bloc ou
                          null si aucune correspondance */ },
  fallback(secteurRaw) { /* bloc générique, construit à partir du texte
                             brut du paramètre */ }
};
```

Entrées initiales (reprises des 6 secteurs déjà identifiés dans
`leads_energo_intensifs.csv`) :

| Secteur | Mots-clés | Argumentaire |
|---|---|---|
| Cimenterie | `ciment` | « Les cimenteries sont éligibles aux tarifs réduits électro-intensifs (NAF 23.51Z) : on vérifie votre éligibilité et on la fait valoir dans la négociation. » |
| Blanchisserie | `blanchisserie`, `pressing` | « Séchage, repassage, eau chaude : les blanchisseries industrielles comptent parmi les activités les plus consommatrices d'énergie du secteur des services. » |
| Data center | `data center`, `datacenter`, `cloud`, `hpc` | « Les data centers sont éligibles au tarif réduit électro-intensif dédié (NAF 63.11Z) : on s'assure qu'il est bien appliqué, en plus de la mise en concurrence des fournisseurs. » |
| Frigorifique | `frigorifique`, `froid` | « Le froid industriel tourne 24h/24 : la facture d'électricité est un poste fixe et lourd, sur lequel une renégociation bien menée a un effet immédiat. » |
| Papeterie | `papeterie`, `pâte à papier`, `papetier` | « Séchage du papier, production de pâte : la papeterie est l'un des secteurs industriels les plus intensifs en énergie. » |
| Verrerie | `verrerie`, `flaconnage`, `verrier` | « Fours à haute température, fusion continue : la verrerie industrielle a un profil de consommation qui justifie une étude tarifaire dédiée. » |

Repli générique (`secteur` fourni mais sans correspondance) : « Votre
activité ({secteur}) implique une consommation d'énergie qui pèse sur vos
charges — on la met en concurrence entre tous les fournisseurs pour la
réduire, gratuitement et sans engagement. »

Sans `secteur` du tout : aucun bloc affiché.

Cette bibliothèque s'enrichit au fil des campagnes (nouvelle entrée = un
objet `{keywords, html}` de plus dans `assets/sector-blocks.js`), sans
jamais casser la page pour un secteur pas encore couvert.

### Paramètre `accroche`

Phrase courte et personnalisée, sourcée manuellement : quand une URL de
prospect est fournie, scraping (firecrawl) + lecture du contenu pour en
extraire un élément pertinent (activité précise, signal énergétique,
actualité), puis construction du lien complet avec `accroche` déjà rempli.
Aucune automatisation de cette étape dans le repo — c'est un geste
assisté, au cas par cas, pas un script.

### CTA — `openTallyForm`

Même formulaire Tally que `b2b.html`. `hiddenFields` reçoit `entreprise:
nom` si `nom` est présent, sur le modèle de `ref`/`camp` existants.

**Action manuelle utilisateur requise, hors périmètre code** : créer le
champ caché `entreprise` dans l'éditeur Tally (sinon ignoré silencieusement,
même limite déjà documentée pour `ref`/`camp`).

### Attribution — `middleware.js`

`/prospect.html` ajouté au `matcher`, pour bénéficier du même traitement
`ref`/`camp`/variante déjà en place sur `b2b.html`. Aucun changement aux
whitelists `SLUGS`/`CAMPAIGNS` — les liens de prospection réutilisent les
codes `camp` existants (`chr-e1`, etc.) ou `soc-*`, selon le canal.

### Génération de liens en masse — `scripts/build-prospect-links.mjs`

Script générique (pattern `scripts/build-analytics.mjs`) :

- Entrée : chemin CSV passé en argument (`node scripts/build-prospect-links.mjs <chemin.csv>`), colonnes `Entreprise` et `Secteur/Activité` par défaut, noms de colonnes surchargeables par flags — le CSV source reste hors du repo (ex. `~/Documents/leads_energo_intensifs.csv`), jamais committé, pour ne pas versionner des données de prospection.
- Sortie : CSV avec une colonne URL supplémentaire (`https://cabinetms.fr/prospect.html?nom=<encodé>&secteur=<encodé>&camp=<code>`), `camp` passé en argument, `accroche` absent (réservée aux prospects traités individuellement via scraping).
- Le mapping mots-clés → bloc se fait au rendu de la page (`assets/sector-blocks.js`), pas à la génération du lien : le texte brut du CSV suffit, aucune étape de codage manuel du secteur en amont.

### Sécurité

`nom`, `secteur`, `accroche` : lecture via `URLSearchParams`, injection via
`textContent`/`el.textContent =`, jamais via template string HTML. Le
matching sectoriel ne fait que sélectionner un bloc HTML **prédéfini** dans
`assets/sector-blocks.js` — le texte du paramètre `secteur` n'est jamais lui
même interprété comme HTML, sauf dans le repli générique où il est inséré
via `textContent` au même titre que `nom`/`accroche`.

## Tests

- `test/sector-blocks.test.mjs` (nouveau) : fonctions pures de
  `assets/sector-blocks.js` — correspondance par mot-clé (insensible à la
  casse et aux accents) pour chacune des 6 entrées, absence de
  correspondance → repli générique, `secteur` vide → pas de bloc.
- `test/middleware-attribution.test.mjs` (extension) : `/prospect.html`
  couvert par le même comportement `ref`/`camp`/redirection que `b2b.html`.

## Hors périmètre

- Automatisation du scraping/génération d'`accroche` dans le repo (reste
  un geste manuel assisté, cas par cas).
- Pages statiques générées par prospect (écarté au profit des paramètres
  d'URL — cf. décision du 2026-09-08).
- Import de la liste de prospects ou de la page vers une plateforme
  publicitaire.
- Dashboard de suivi des conversions par prospect individuel, au-delà de
  l'attribution `camp`/`ref` déjà existante.
