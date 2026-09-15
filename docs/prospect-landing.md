# Landing page de prospection personnalisée

`prospect.html` affiche le nom du prospect, un argumentaire adapté à son
secteur et, si elle est fournie, une accroche rédigée sur mesure. Tout vient
de l'URL : rien n'est stocké côté serveur.

## Format du lien

    https://cabinetms.fr/prospect.html?nom=<entreprise>&secteur=<secteur>&camp=<code>

| Paramètre | Obligatoire | Effet |
|---|---|---|
| `nom` | non | Nom dans le H1 + champ caché `entreprise` du formulaire Tally |
| `secteur` | non | Sélectionne le bloc argumentaire (texte libre, voir ci-dessous) |
| `accroche` | non | Phrase personnalisée sous le H1 (240 caractères max) |
| `camp` | non | Code de campagne existant (`middleware.js`), posé en cookie puis retiré de l'URL |
| `ref` | non | Commercial référent, même mécanisme que sur `b2b.html` |

Sans aucun paramètre, la page est la version générique B2B. Elle est en
`noindex` et exclue dans `robots.txt` : elle ne doit jamais être indexée ni
partagée publiquement.

## Blocs sectoriels

`assets/sector-blocks.js` associe des mots-clés à un argumentaire. Le texte
du paramètre `secteur` est normalisé (minuscules, sans accents) puis comparé
à ces mots-clés — « Papeterie/pâte à papier » comme « PATE A PAPIER »
tombent sur l'entrée papeterie.

Secteurs couverts : cimenterie, blanchisserie, data center, logistique
frigorifique, papeterie, verrerie.

Un secteur non couvert affiche un bloc générique citant le libellé tel quel.
**Pour ajouter un secteur**, ajouter une entrée `{ keywords, titre, texte }`
dans `BLOCKS` (mots-clés sans accents, en minuscules) et une assertion dans
`test/sector-blocks.test.mjs`.

## Générer les liens d'une liste

    npm run prospect:links -- <fichier.csv> --camp=ind-e1 --out="$HOME/liens.csv"

Colonnes lues par défaut : `Entreprise` et `Secteur/Activité`
(surchargeables par `--nom-col=` / `--secteur-col=`). Le CSV d'entrée reste
**hors du dépôt** : les listes de prospects contiennent des coordonnées qui
n'ont rien à faire dans l'historique git.

## Accroche personnalisée

L'accroche ne se génère pas en masse : elle se rédige prospect par prospect
à partir du site de l'entreprise (activité précise, signal de consommation,
actualité), puis s'ajoute au lien en `&accroche=<texte encodé>`.

## Étape manuelle côté Tally

Pour que le nom de l'entreprise remonte dans les réponses, le champ caché
`entreprise` doit exister dans le formulaire Tally (éditeur Tally, comme
`ref` et `camp`). Sans ce champ, la valeur est ignorée silencieusement.
