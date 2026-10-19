# Guide de publication : Facebook, Instagram, X

Mode d'emploi commun à **toutes les campagnes sociales** de M&S Strategy,
à commencer par « Pas de -50 % » (Q4 2026). Il couvre uniquement
**Facebook, Instagram et X**, publiés via Buffer.

**LinkedIn est hors périmètre** : il est géré à part, avec son propre
outil et ses propres règles. Ce guide remplace, pour X, la mention
« Typefully pour LinkedIn et X » du README de la campagne
`campagne-q4-2026-commercants` : X passe désormais par Buffer.

Ce que le guide ne redéfinit pas, et qu'il faut lire dans la campagne
concernée : la grande idée, les phases, le calendrier, le manifeste.

---

## 1. La chaîne de publication

| # | Étape | Outil | Qui | Sortie |
|---|---|---|---|---|
| 1 | Stratégie | Étude + README de campagne | Antoine + Claude | Grande idée, phases, calendrier |
| 2 | Rédaction | `posts/AAAA-MM-JJ.md` | `content-builder` | 1 texte natif par plateforme et par jour |
| 3 | Visuels / vidéo | ElevenLabs (voix off), ffmpeg, Studio | `content-builder` | Fichiers aux formats du §3 |
| 4 | Contrôle | Checklist §5 + `ig-caption` / `ig-human` | `quality-reviewer` puis Antoine | Lot validé |
| 5 | Programmation | **Buffer** (orga « MS Strategy ») | Claude, **sur feu vert** | Posts en file d'attente |
| 6 | Interaction | Natif (appli IG/FB, X) + `ig-reply` / `ig-dm` | Antoine | Réponses, DM |
| 7 | Mesure | PostHog (`camp`), Tally, CRM, stats natives | Claude | Revue datée (§8) |

**Règle absolue : rien n'est programmé ni publié sans validation humaine
du lot.** Claude peut préparer des brouillons dans Buffer, pas les
envoyer dans la file sans « go ».

---

## 2. Buffer : configuration

| | Facebook | Instagram | X |
|---|---|---|---|
| Canal | Page « M&S Strategy » | `cabinet.ms` (compte pro) | `@cabinet_ms` (compte gratuit) |
| ID Buffer | `6aa020cfcd8b9c702c2d33c7` | `6ad631bd778b240e2f59bc13` | `6ad632aa778b240e2f59cb60` |
| Code `camp` | `soc-fb` | `soc-ig` | `soc-x` |
| Code `camp` payant | `soc-fb-ads` | `soc-ig-ads` | (pas de payant) |

Organisation : **MS Strategy** (`6a9ec9a1eca5adec6dd948da`), fuseau
`Europe/Paris`.

### Limites de l'offre gratuite

- **3 canaux maximum** : ils sont tous pris (FB, IG, X). C'est l'une des
  raisons pour lesquelles LinkedIn est géré ailleurs.
- **10 posts programmés à la fois, tous canaux confondus.** À 1 post par
  jour sur 3 canaux, la file couvre **3 jours**. Conséquence : recharger
  la file **tous les 3 jours** (lundi, jeudi, dimanche), ou passer à une
  offre payante si la recharge devient une corvée.
- **100 idées** : utiliser les *Idées* Buffer comme zone d'attente du lot
  de la semaine (textes validés), puis les convertir en posts au fil des
  recharges.

### Créneaux

Les créneaux actuels sont ceux générés par Buffer à la création des
canaux (ex. Instagram à 22h59 le dimanche, Facebook 2 fois par jour).
**À remplacer** par 1 créneau par jour et par canal, point de départ
calé sur les audiences de la charte des voix, à réviser à chaque revue
(§8) :

| Canal | Lun → Ven | Sam → Dim | Pourquoi |
|---|---|---|---|
| Facebook | 07:30 | 09:30 | Commerçants de quartier, avant l'ouverture |
| Instagram | 12:30 | 18:30 | Pause de midi en semaine, fin de journée le week-end |
| X | 09:00 | 10:00 | Journalistes, analystes : début de matinée |

Sauf date réelle (Black Friday, Noël…), on utilise la **file
d'attente** (`addToQueue`), pas des heures fixées à la main.

---

## 3. Formats par plateforme

| | Facebook | Instagram | X |
|---|---|---|---|
| **Pour qui** | Commerçants indépendants, 40-60 ans, de quartier | Commerçants 25-45 ans, créateurs de boutique | Journalistes, analystes, curieux, IA |
| **Voix** | Chaleureux, concret, de quartier | Visuel, rythmé, en « vous » | Tranchant (tweet), pédagogue (thread) |
| **Longueur** | 40 à 90 mots | Légende de 20 à 60 mots | ≤ 280 caractères, ou thread de 4 à 6 tweets |
| **Ce qu'on fait** | Un bon tuyau, une question pour les commentaires, des références locales | L'image d'abord, accroche en 1re ligne, coulisses | Un chiffre sourcé et une position, ou un thread qui explique |
| **Ce qu'on ne fait pas** | Jargon non expliqué (TURPE, accise), longs pavés | Pavés de texte, tutoiement | « Bonjour », émojis, points d'exclamation |
| **Vidéo** | Reel 9:16 (reprise IG) | Reel 9:16, 1080×1920 | Clip ≤ 30 s, 16:9 ou 1:1 |
| **Image** | 1:1 (1080×1080) ou 4:5 | 4:5 (1080×1350) | 16:9 (1600×900) |
| **Carrousel** | Rare | 4:5, 10 slides max | Non |
| **Lien** | Dans le texte | **Lien en bio** + « lien en bio » dans la légende | Dans le tweet (dernier tweet si thread) |
| **Zone visible** | ~3 premières lignes | **125 premiers caractères** avant « … plus » | Tout le tweet |

Notes :

- Le compte X est **gratuit** : pas de tweet long, pas de vidéo longue.
  Tenir sous 280 caractères.
- La vidéo Facebook reprend le montage 9:16 d'Instagram, mais **avec
  son propre texte** (voix Facebook, pas un copier-coller de la légende).
- Sous-titres incrustés obligatoires sur toute vidéo (lecture sans son).

---

## 4. Liens et attribution

Format de lien : `https://cabinetms.fr/<page>?camp=<code>`.

- Le code dépend de la **plateforme**, jamais du post. Organique et
  payant ont des codes séparés (`soc-ig` / `soc-ig-ads`).
- La **page** dépend de l'étape du funnel du post (TOFU : article ;
  MOFU : calculateur, baromètre, comment-ça-marche ; BOFU : `b2b.html`
  ou landing ; CARE : baromètre). Le manifeste de la campagne la donne.
- Instagram : le lien en bio pointe vers la destination **du jour**.
  Le changer à chaque recharge Buffer si la destination change.
- Le raccourcissement de liens Buffer est **désactivé** : le garder
  ainsi, sinon `camp` peut être masqué ou perdu.
- Avant chaque campagne, vérifier que le cookie `camp` est bien posé sur
  toutes les pages de destination (`matcher` de `middleware.js`).

---

## 5. Checklist avant programmation (par post)

1. **Chiffres** : chaque chiffre est soit un fait externe public cité
   (CRE, BOFiP, Médiateur, fédérations), soit un chiffre d'une page du
   site. Aucune statistique de la home non sourcée (19 %, 70M kWh,
   80 %).
2. **Promesses** : aucune économie chiffrée promise. On dit « vérifier »,
   « comparer », « estimer ». Pas de fausse urgence ni de compte à
   rebours.
3. **Texte natif** : la voix, la longueur et le tutoiement/vouvoiement
   respectent le §3 pour cette plateforme.
4. **Accroche** : l'idée tient dans la zone visible (125 caractères sur
   Instagram, 3 lignes sur Facebook).
5. **Nettoyage** : pas de tiret cadratin (—), pas de caractères
   invisibles, pas de 🔥, pas de majuscules criardes.
6. **Lien** : bonne page, bon code `camp`, lien en bio à jour sur IG.
7. **Média** : bon ratio, sous-titres sur la vidéo, poids raisonnable,
   pas de visuel générique de banque d'images.
8. **Aperçu Buffer** vérifié (recadrage, couverture du Reel, première
   ligne).

### Skills `ig-*` (repo `Jakeschincariol/instagram-agent-skill`)

N'installer que ceux qui servent, et en connaissant leur limite : ils
sont **écrits pour l'anglais**.

| Skill | Usage ici | Fiable en français ? |
|---|---|---|
| `ig-caption` | Point 4 : longueur de la zone visible | Oui (compte de caractères) |
| `ig-human` | Point 5 : tirets cadratins, caractères invisibles | Partiellement : sa liste de « mots d'IA » est anglaise, l'ignorer |
| `ig-reply` | §6 : tri et réponses aux commentaires | À relire : rédige en anglais par défaut |
| `ig-dm` | §6 : DM sur mot-clé | À relire |
| `ig-audit` | §8 : bilan des posts publiés | Oui (calcul de multiples) |

Les autres (`ig-plan`, `ig-reel`, `ig-carousel`…) font doublon avec le
calendrier et la production de la campagne : ne pas les utiliser.

---

## 6. Après publication

| Quand | Quoi | Où |
|---|---|---|
| Dans les 2 h | Répondre aux premiers commentaires (ça pousse la portée) | Natif |
| Chaque jour | Commentaires et DM : réponse sous 24 h | Natif + `ig-reply` |
| Mot-clé en DM / commentaire | Envoyer la ressource promise + 1 relance max | Natif + `ig-dm` |
| Commentaire hostile | Répondre une fois, factuellement, sans chiffre non sourcé ; ne pas supprimer sauf insulte ou spam | Natif |
| Lead chaud (facture évoquée, contrat cité) | Basculer vers `b2b.html?camp=<code>` ou un appel | Natif → CRM |

Buffer ne gère ni les commentaires ni les DM dans l'offre gratuite : tout
se fait dans les applis natives.

---

## 7. Lancer une nouvelle campagne

1. Créer `content/<campagne-AAAA-slug>/` avec, sur le modèle de
   `campagne-q4-2026-commercants` :
   - `README.md` : grande idée, phases, calendrier, destinations ;
   - `manifest.json` : un item par jour (phase, étape, destination,
     `candidat_pub`, `statut`) ;
   - `posts/AAAA-MM-JJ.md` : les textes du jour, une section par
     plateforme.
2. Reprendre telles quelles les §3 à §6 de ce guide ; ne documenter dans
   le README que les écarts (ex. une voix spécifique à la campagne).
3. Vérifier les créneaux Buffer (§2) et les destinations (§4).
4. Planifier les recharges de la file (3 par semaine en offre gratuite).
5. Fixer les dates de revue (§8) avant la première publication.

---

## 8. Mesure et revues

| Étape | Indicateur | Source |
|---|---|---|
| Acquisition | Visites par code `camp` (organique et `-ads` séparés) | PostHog |
| Activation | Calculateur complété, Baromètre consulté | PostHog |
| Revenue | Factures déposées (Tally `kd15W1`), puis contrats signés | Tally + CRM |
| Engagement | Sauvegardes, partages, commentaires utiles (pas les likes) | Stats natives + `ig-audit` |

- **Revue hebdomadaire** (lundi, 15 min) : les 3 meilleurs et les 3
  pires posts de la semaine par plateforme, mesurés par rapport à la
  médiane du compte, pas en valeur brute.
- **Revues de campagne** : fixées dans le README de chaque campagne
  (pour « Pas de -50 % » : 05/11, 07/12, bilan le 05/01/2027).
- On réalloue vers ce qui produit des **factures déposées**, pas des
  likes.

---

## Campagnes qui suivent ce guide

| Campagne | Dossier | Période |
|---|---|---|
| Pas de -50 % | `content/campagne-q4-2026-commercants/` (branche `claude/content-funnel-principle-5q3kof`) | 15/10 → 31/12/2026 |
