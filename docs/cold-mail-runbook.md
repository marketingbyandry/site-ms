# Runbook — mailing froid B2B (cycle quotidien)

Procédure suivie par la session planifiée (`/schedule`) pour un cycle. Cf.
`docs/superpowers/specs/2026-09-09-mailing-froid-b2b-design.md` pour le
design complet ; ce document décrit uniquement le déroulé opérationnel.

Google Sheet de suivi : `10vsPDhWLJfvUGK_MeZcPkbkhbhuix5Ton5KwMhnj6Fg`
(créé via l'étape 1 de
`docs/superpowers/plans/2026-09-09-mailing-froid-b2b.md`, Task 6).

## 1. Sourcing (un des 5 segments, en rotation)

Segments et sections NAF associées :

| Segment | Libellé | Section(s) NAF |
|---|---|---|
| `chr` | Hôtellerie-restauration | I |
| `ind` | Industrie / production | C |
| `tert` | Tertiaire (écoles, associations, santé/EHPAD) | P, Q, S |
| `agri` | Agriculture | A |
| `log` | Logistique | H |

Appel (exemple pour `ind`, PME/ETI 10 à 999 salariés) :

```bash
curl -s "https://recherche-entreprises.api.gouv.fr/search?section_activite_principale=C&tranche_effectif_salarie=11,12,21,22,31,32,41&per_page=25&page=1"
```

Pas de clé API requise (service public gratuit, confirmé en session le
2026-09-09). Tourner sur les pages suivantes (`page=2`, etc.) et les 5
segments au fil des cycles plutôt que de tout épuiser en un jour.

Pour chaque résultat, retenir : `nom_complet`, `siren`, le premier élément
de `dirigeants` (`nom`, `prenoms`, `qualite`) si présent, l'adresse du
`siege`.

## 2. Enrichissement (site + cascade email)

Pour chaque entreprise retenue à l'étape 1 :

1. Chercher son site officiel (recherche web — nom + ville + "site officiel").
   Aucun candidat fiable → passer à l'entreprise suivante (pas d'email
   générique deviné sans site confirmé).
2. Lire la page contact / mentions légales / équipe du site trouvé.
3. **Cascade** (jamais de pure supposition) :
   - Un email nominatif est **visible** sur la page (ex. une signature,
     un annuaire équipe) et son format est clair → si le nom du dirigeant
     Pappers/gouv.fr correspond à quelqu'un de l'entreprise, appliquer le
     même format à son nom → `type: "nominatif"`, `destinataire` = nom
     complet du dirigeant.
   - Sinon, une adresse de rôle est visible (`contact@`, `direction@`,
     `commercial@`) → `type: "generique"`, pas de `destinataire`.
   - Ni l'un ni l'autre → exclure l'entreprise de ce cycle.
4. **Choix du template sectoriel précis** : à ce stade, affiner le
   `segment` en un `secteur` de template si l'activité de l'entreprise
   correspond clairement à l'un des 7 templates dédiés de
   `content/cold-mail-b2b/` (`restaurant`, `bar`, `discotheque`,
   `boulangerie`, `boucherie`, `industrie`, `agriculture` — cf.
   `scripts/send-cold-batch.mjs`, `TEMPLATE_PATHS`). Sinon, laisser le
   `segment` de la table NAF (`chr`/`ind`/`tert`/`agri`/`log`) : le script
   retombe alors sur `content/cold-mail-b2b/template.html` (générique).

## 3. Dédoublonnage

Avant d'ajouter une ligne, lire les lignes existantes du Sheet :

```bash
composio execute "GOOGLESHEETS_VALUES_GET" -d '{"spreadsheet_id":"10vsPDhWLJfvUGK_MeZcPkbkhbhuix5Ton5KwMhnj6Fg","range":"D:D"}'
```

et exclure tout email déjà présent, quel que soit son statut.

## 4. Écriture du lot du jour

Ajouter les nouvelles lignes avec `statut: "à valider"` et `date_envoi`
vide :

```bash
composio execute "GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND" -d '{
  "spreadsheet_id": "10vsPDhWLJfvUGK_MeZcPkbkhbhuix5Ton5KwMhnj6Fg",
  "range": "A:H",
  "value_input_option": "RAW",
  "values": [["Exemple SARL","123456789","ind","contact@exemple.fr","generique","haute","à valider",""]]
}'
```

Objectif : 30 à 50 lignes prêtes à valider par cycle (le plafond d'envoi
réel de 50/jour est de toute façon appliqué par `scripts/send-cold-batch.mjs`,
donc un lot légèrement plus grand n'est pas un problème — le surplus attend
le lendemain).

## 5. Validation manuelle

Le lot du jour est présenté à l'utilisateur (lien vers le Sheet, ou liste
des lignes `à valider` dans le message de fin de cycle). Aucun envoi tant
que l'utilisateur n'a pas répondu. Sur validation :

1. Relire le Sheet, filtrer les lignes `statut = "validé"`.
2. Construire `batch.json` à partir de ces lignes exactement dans le format
   attendu par `runColdBatch()` :

```json
[
  {"email": "contact@exemple.fr", "entreprise": "Exemple SARL", "type": "generique", "segment": "ind"}
]
```

(`destinataire` ajouté seulement si `type` = `"nominatif"`. `segment` peut
être l'un des 7 secteurs de template précis, ou l'un des 5 segments NAF —
cf. étape 2.4.)

## 6. Envoi

```bash
node scripts/send-cold-batch.mjs batch.json <alreadySentToday>
```

`<alreadySentToday>` = nombre de lignes du Sheet dont `date_envoi` = date du
jour, avant cet appel (0 en début de journée).

Le script imprime un JSON `{sent, skippedBlocked, skippedCap, aborted,
reason?}`. Si `aborted: true` (`reason: "bounce_rate"`), **ne pas relancer
dans la journée** — signaler à l'utilisateur et attendre une revue manuelle
avant le cycle suivant (garde-fou du design).

## 7. Mise à jour du Sheet

Pour chaque email dans `sent`, mettre à jour sa ligne : `statut = "envoyé"`,
`date_envoi` = date du jour. Pour chaque email dans `skippedBlocked`,
`statut = "supprimé (Brevo)"`. Pour chaque email dans `skippedCap`,
`statut` reste `"validé"` (repris au cycle suivant).

## 8. Suivi des réponses STOP

À vérifier à chaque cycle (boîte `contact@mail.cabinetms.fr`) : toute
réponse contenant "STOP" (texte ou objet, cf. le lien `mailto:` du
template) → ajouter l'adresse à la liste de suppression Brevo
(`composio execute "BREVO_DELETE_CONTACT" -d '{"identifier":"<email>"}'`)
et marquer la ligne correspondante du Sheet `statut = "désinscrit"`.

## Avant le premier cycle réel

- Essai à blanc sur un petit échantillon (5-10 entreprises réelles, lot
  validé manuellement, envoi réel) avant d'ouvrir le rythme 30-50/jour en
  continu (spec).
- Vérifier la réception effective des réponses "STOP" sur
  `contact@mail.cabinetms.fr` et le bon déroulé de l'étape 8 ci-dessus.
