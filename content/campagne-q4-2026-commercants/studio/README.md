# Studio J1–J20 (campagne « Pas de -50 % »)

Source unique de l'onglet « Studio · J1–J20 ». Elle alimente deux affichages
identiques :

- **la page de validation de l'équipe com** : `approbation.html`, protégée
  par mot de passe (cabinetms.fr/approbation.html), avec un vote par réseau ;
- **l'artefact « Campagne Pas de -50 % »** (onglet Studio, et les mêmes jours
  dans son calendrier).

## Ce qu'on modifie

| Fichier | Contenu |
|---|---|
| `posts/<date>.md` | le post du jour : une section `##` par réseau (texte à publier) |
| `studio.json` | les jours (angle, étape, alertes) et les visuels de chaque réseau |
| `approbation-media/` (racine du dépôt) | photos et vidéos référencées par `studio.json` |
| `assets/studio/studio.css`, `assets/studio/studio.js` | le rendu partagé (vignettes, plein écran) |

## Après une modification

1. `npm run build:studio` : régénère `approbation.html` et
   `lib/approbation-posts.mjs` (identifiants acceptés par l'API de vote).
2. `npm test` : échoue si la page n'a pas été régénérée, si un réseau manque
   dans un post ou si un média est absent.
3. Pour l'artefact : `node scripts/build-studio.mjs --artifact <artefact.html> <sortie.html>`,
   puis republier la sortie avec les dossiers `photos/` et `videos/`.

Les identifiants de vote sont `J<jour>-<réseau>` (LI, FB, IG, X) : ajouter
J11 à J20 dans `studio.json` les ajoute automatiquement à la page et à l'API.
