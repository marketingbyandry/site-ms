# Campagne « Pas de -50 % » : commerçants, Q4 2026

Campagne sociale quotidienne du **15 octobre au 31 décembre 2026**.
Elle couvre 78 jours × 4 plateformes (LinkedIn, Facebook, Instagram, X),
soit **312 posts**. Elle prolonge le levier social B2B
([`docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md`](../../docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md))
et remplace, pour la période, le calendrier du
[brief cycle 1](../social-b2b-launch/brief-cycle-1.md). Les angles du cycle 1
sont repris dans la phase 1, adaptés aux commerçants.

- `manifest.json` : les 78 jours avec la phase, l'étape du funnel, la
  matrice, la destination, le marqueur de candidat pub et le statut.
- `posts/AAAA-MM-JJ.md` : les 4 posts natifs du jour, prêts pour la revue
  humaine par lot puis la programmation (Typefully pour LinkedIn et X,
  Buffer pour Facebook et Instagram).

## Cadrage validé

| | |
|---|---|
| **Audience** | Commerçants en priorité : boutiques, restaurateurs, boulangers, hôteliers, réseaux de points de vente et franchises |
| **Ton** | Malin, franc, à contre-courant |
| **Interdits** | Fausses promos et urgence fabriquée · ton « vendeur de Black Friday » (majuscules criardes, 🔥, « DERNIÈRE CHANCE ») · visuels génériques de stock · humour sur la précarité énergétique |
| **Ampleur** | 1 post par jour et par plateforme, du 15/10 au 31/12 |

## La grande idée

> **Pas de -50 %. Juste le bon prix, pour toute la durée du contrat.**

En novembre, les commerçants baissent leurs prix pour vendre : la remise
mange leur marge, vente après vente. Pendant ce temps, leur contrat
d'énergie, souvent reconduit sans être comparé, pèse sur la marge **tous les
mois**, pendant 1 à 3 ans. La campagne prend le contre-pied du Black Friday.
Pas de remise, pas de compte à rebours : on montre la charge que personne ne
leur négocie.

**Pourquoi ça tient :** l'offre de M&S n'a réellement **pas** de date
limite. L'étude est gratuite toute l'année, et un contrat en cours peut être
préparé à l'avance. Refuser l'urgence fabriquée n'est donc pas une posture,
c'est la vérité du produit. C'est ce qui rend le ton crédible.

## Les 4 phases (Hero / Hub / Hygiene × content funnel)

| Phase | Dates | Rôle | Étape dominante | Destination dominante |
|---|---|---|---|---|
| **1 · Avant la vitrine** | 15/10 → 01/11 (18 j) | *Hygiene* : poser les bases (échéance, facture, puissance, prix fixe/indexé) | TOFU, puis MOFU | Articles du site |
| **2 · Le contre-Black Friday** | 02/11 → 30/11 (29 j) | **Hero** : le temps fort, où le budget payant se concentre | MOFU → BOFU | Calculateur, landing, `b2b.html` |
| **3 · L'Avent des charges** | 01/12 → 24/12 (24 j) | *Hub* : une série numérotée « Case n/24 », un levier par jour | TOFU/MOFU, BOFU les derniers jours | Articles, puis `b2b.html` |
| **4 · L'inventaire** | 25/12 → 31/12 (7 j) | *Care* : bilan, fidélisation, rendez-vous 2027 | CARE + BOFU final | Baromètre, calculateur, `b2b.html` |

La phase 2 est découpée en 4 semaines : « La remise que personne ne vous
fait » → « Les étiquettes cachées » (la facture lue comme 5 étiquettes de
prix) → « Le vrai prix » → « Black Week à l'envers » (Black Friday le 27/11,
Cyber Monday le 30/11).

## Rôle de chaque plateforme

| Plateforme | Code `camp` | Cible dans la cible | Format | Rôle |
|---|---|---|---|---|
| LinkedIn | `soc-li` | Dirigeants de réseaux, franchises, multi-sites | Post texte *answer-first*, 120 à 200 mots | Conversion |
| Facebook | `soc-fb` | Commerçants indépendants, ancrage local (Montpellier en priorité) | Post court et simple, image | Conversion |
| Instagram | `soc-ig` | Commerçants, notoriété | Visuel (brief) + légende, lien en bio | Notoriété et preuve |
| X | `soc-x` | Presse, LLM, curieux | 1 tweet ou thread court, chiffre ou prise de position | Citation et GEO |

## Le parcours : chaque post renvoie à son étape

L'erreur du brief cycle 1 était d'envoyer tous les posts vers `b2b.html`
(dépôt de facture), y compris auprès d'une audience froide. Ici, chaque jour
a une **destination qui correspond à son étape** (colonne `destination` du
manifeste) :

| Étape | Ce qu'on demande | Destination |
|---|---|---|
| TOFU | Lire, comprendre | L'article du site qui source le post |
| MOFU | Estimer, comparer | `ms-strategy-calculateur.html`, `barometre-energie.html`, `comment-ca-marche.html` |
| BOFU | Envoyer sa facture | `b2b.html` ou `ms-strategy-landing-2.html` |
| CARE | Rester en contact | Baromètre, rendez-vous 2027 |

Tous les liens portent `?camp=<code plateforme>`.

### ⚠️ Deux prérequis techniques avant le 15/10

1. **Le cookie `camp` n'est posé que sur 8 pages** (`matcher` de
   `middleware.js` : accueil, b2b, b2c, blog, comment-ca-marche, résultats,
   landing-2, calculateur). Les liens vers les articles et vers
   `barometre-energie.html` **perdent l'attribution** tant que le `matcher`
   n'est pas étendu. Sans ce correctif, environ la moitié des posts ne
   remontent pas dans le suivi.
2. **Organique et payant partagent le même code** (`soc-li` pour les
   deux). Le coût par lead calculé dans
   [`ads-checklist.md`](../social-b2b-launch/ads-checklist.md) sera donc
   faussé (dépense pub ÷ leads qui incluent l'organique). Ajouter
   `soc-li-ads`, `soc-fb-ads`, `soc-ig-ads` à `CAMPAIGNS` et les utiliser
   dans les liens des publicités.

Les deux correctifs relèvent d'une PR `dev-builder` (worktree, `npm test`).

## Le payant : l'organique teste, le payant amplifie

- **15/10 → 04/11 : organique seul.** Les jours marqués `candidat_pub: true`
  dans le manifeste (1 à 2 par semaine) sont les premiers à observer.
- **À partir du 05/11 :** on booste les 2 ou 3 posts qui ont le meilleur
  taux de clic et le plus de sauvegardes, pas forcément les candidats.
  Les posts candidats proposent 2 accroches alternatives pour l'A/B test.
- **Répartition 70/20/10 :** 70 % du budget sur les gagnants, 20 % sur
  leurs variantes, 10 % sur des tests.
- **Pic budgétaire : 23/11 → 30/11** (Black Week à l'envers), puis
  reciblage léger des visiteurs du calculateur en décembre.
- Ciblage : se reporter à
  [`ads-checklist.md`](../social-b2b-launch/ads-checklist.md), en
  resserrant les secteurs sur commerce de détail, restauration,
  boulangerie et hôtellerie.

## Mesure (AARRR adapté)

| Étape | Indicateur | Source |
|---|---|---|
| Acquisition | Visites par code `camp` (organique et `-ads` séparés) | PostHog |
| Activation | Calculateur complété, Baromètre consulté | PostHog |
| Revenue | Factures déposées (Tally `kd15W1`), puis contrats signés | Tally + CRM |
| Rétention | Clients avec échéance suivie (alerte 12-24 mois) | CRM |
| Referral | Recommandations, partages et sauvegardes des posts « liste » (27/12) | Plateformes |

Point de décision : **revue le 05/11** (fin du test organique) et **le
07/12** (après le Hero), puis bilan le 05/01/2027. On réalloue vers ce qui
produit des factures, pas vers ce qui produit des likes.

## Règles de rédaction (à respecter pour toute retouche)

- **Aucun chiffre non sourcé.** Les seuls chiffres utilisés viennent des
  pages du site : 36 kVA, 1 000 m², 3 à 5 % par degré de chambre froide,
  40 à 50 % de la consommation en cuisine, contrats fixes de 1 à 3 ans,
  alerte 12 à 24 mois, retour sous 24h, depuis 2012, TURPE révisé au
  1er août. Les statistiques de la home (19 %, 70M kWh, 80 % des
  dirigeants) **ne sont pas reprises** (cf. README de
  `social-b2b-launch`). Pour un chiffre de marché, on renvoie au
  Baromètre au moment de la publication.
- **Aucune promesse d'économie chiffrée.** On dit « vérifier »,
  « comparer », « estimer », jamais « vous économiserez X ».
- **Pas d'urgence inventée.** Une date réelle (Black Friday, Noël,
  échéance au 31/12 d'un contrat) peut être citée, jamais un faux compte
  à rebours.
- **Visuels :** cartes typographiques dans la DA du site (Instrument
  Serif), photos réelles de commerces sourcées via le pipeline Savee
  (`assets/`, WebP < 300 KB). Pas de sapins, d'ampoules, de prises ni de
  pièces d'or.
- **Revue :** chaque lot hebdomadaire passe par `quality-reviewer` puis par
  une relecture humaine avant programmation.

## Points à vérifier avant publication

- **Page TVA à revérifier** : `tva-electricite-professionnelle.html`
  indique un taux réduit de 5,5 % sur l'abonnement ≤ 36 kVA. Ce taux
  réduit a été supprimé par la loi de finances 2025 (abonnement à 20 %
  depuis le 1er août 2025). Le post du 13/11 ne cite volontairement
  aucun taux, mais il renvoie vers cette page : la corriger avant le 13/11.
- **Post du 30/12** : à réécrire avec les vrais enseignements de la
  campagne (cf. note dans le fichier).
- **Visuels « Baromètre »** (01/11, 19/11, 20/12) : utiliser le graphique
  réel de la page au jour de publication. Aucun chiffre ne doit être saisi
  à la main.
- **Calculateur filmé** (04/11, 30/11) : valeurs de démonstration
  explicitement marquées « exemple » à l'écran.
- **Domaine** : les liens utilisent `cabinetms.fr`, comme le brief
  cycle 1. Vérifier que c'est bien le domaine de production au moment de
  la programmation.

## Reprise après interruption

Lire `manifest.json`, reprendre au premier item `"statut": "pending"`,
écrire `posts/<date>.md`, puis passer l'item à `done`.
