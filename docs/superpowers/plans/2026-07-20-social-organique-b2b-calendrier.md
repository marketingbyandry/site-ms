# Calendrier éditorial social organique B2B — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire les 16 posts (copy finale + scripts avatar) du calendrier éditorial social organique B2B sur 8 semaines, prêts à publier sur la page LinkedIn MS Strategy (croisés légèrement sur Facebook), tel que cadré dans `docs/superpowers/specs/2026-07-20-social-organique-b2b-calendrier-design.md`.

**Architecture:** Contenu pur (pas de code) — un fichier markdown de conventions partagées, puis un fichier markdown par semaine contenant les deux posts (officiel + UGC-avatar) prêts à copier-coller, avec leur script vidéo pour la production Higgsfield le cas échéant.

**Tech Stack:** Markdown. Aucune dépendance logicielle.

## Global Constraints

- Cible : B2B uniquement — dirigeants de TPE/PME/ETI.
- Plateforme : LinkedIn en priorité, republication croisée sur la page Facebook MS Strategy en soutien léger.
- Compte de publication : page entreprise MS Strategy uniquement (jamais un profil personnel, jamais un compte tiers).
- Chaque post UGC-avatar doit porter la mention de disclosure exacte : `🎬 Témoignage illustratif — MS Strategy` en première ligne. Jamais présenté comme un avis spontané non sollicité venant d'un tiers indépendant.
- Aucun chiffre non sourcé (pourcentage d'économie, statistique de marché) dans aucun post.
- Tous les liens CTA pointent vers `https://byandry.com/b2b.html` avec un paramètre UTM au format exact : `?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s{N}-{off|ugc}` où `{N}` est le numéro de semaine (01-08) et `{off|ugc}` le type de post.
- Semaines 1 (rappel léger, sans lien UTM obligatoire), 7 et 8 (lien UTM fort obligatoire) portent l'angle créatif carburant/énergie : *"Vous auriez aimé payer votre carburant au prix d'il y a 3 ans ; c'est la même chose avec l'énergie, sauf que vous pouvez changer votre donne."*
- Aucune modification du canal payant (Meta Ads) ni du budget du spec de campagne (PR #4) — périmètre strictement organique et gratuit.

---

### Task 1: Conventions partagées (README)

**Files:**
- Create: `content/social-organique-b2b/README.md`

**Interfaces:**
- Produces: le gabarit UTM exact et le texte de disclosure exact, réutilisés tels quels par les tâches 2 à 9.

- [ ] **Step 1: Créer le dossier et le fichier de conventions**

Contenu exact de `content/social-organique-b2b/README.md` :

```markdown
# Calendrier éditorial social organique B2B — conventions

Référence : `docs/superpowers/specs/2026-07-20-social-organique-b2b-calendrier-design.md`

## Plateforme et compte
- LinkedIn (priorité), croisé légèrement sur Facebook.
- Toujours publié depuis la page entreprise MS Strategy.

## Gabarit UTM (posts avec CTA)
`https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s{N}-{off|ugc}`

Exemple semaine 7, post officiel :
`https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s07-off`

## Disclosure obligatoire (posts UGC-avatar)
Première ligne de chaque post UGC-avatar, sans exception :
`🎬 Témoignage illustratif — MS Strategy`

## Règle chiffres
Aucune statistique ou pourcentage d'économie non vérifié. Cf. audit design homepage (même règle déjà appliquée sur byandry.com).

## Fichiers
- `semaine-01.md` à `semaine-08.md` : les deux posts de la semaine (officiel + UGC-avatar), texte final + script vidéo pour les posts UGC.
```

- [ ] **Step 2: Vérifier le fichier**

Relire le fichier et confirmer que le gabarit UTM et la mention de disclosure sont recopiés à l'identique dans les Global Constraints ci-dessus (aucune divergence de formulation).

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/README.md
git commit -m "Add shared conventions for social organique B2B content calendar"
```

---

### Task 2: Semaine 1 — Ouverture (angle carburant/énergie + FAQ)

**Files:**
- Create: `content/social-organique-b2b/semaine-01.md`

**Interfaces:**
- Consumes: gabarit UTM et disclosure définis dans `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 1.

- [ ] **Step 1: Écrire le fichier**

Contenu exact de `content/social-organique-b2b/semaine-01.md` :

```markdown
# Semaine 1

## Post 1 — Officiel (pédagogie marché + ouverture de l'angle créatif)

Vous n'auriez jamais accepté, sans rien dire, de payer votre carburant au prix d'il y a 3 ans.

Pourtant, c'est exactement ce qui se passe avec votre facture d'énergie professionnelle — sauf que là, contrairement au carburant, vous avez la main.

Pourquoi les prix de l'énergie fluctuent-ils autant ? Trois éléments composent votre facture : le prix de gros (qui varie selon l'offre et la demande européenne), le TURPE (le coût d'acheminement jusqu'à vos locaux), et les taxes. Sur certains de ces éléments, une négociation reste possible.

On vous montre comment, dans les semaines qui viennent.

En savoir plus : https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s01-off

## Post 2 — UGC-avatar (FAQ express)

🎬 Témoignage illustratif — MS Strategy

"Le regroupement d'achat, c'est quoi exactement ?" On me pose la question à chaque rendez-vous.

En clair : plusieurs entreprises se regroupent pour acheter leur énergie ensemble, et obtiennent des conditions qu'elles n'auraient pas pu négocier seules. Ni fusion, ni engagement de groupe — chacun garde son contrat, son fournisseur, sa facture. Juste un pouvoir de négociation collectif.

### Script vidéo (Higgsfield)
Persona : conseiller énergie, ton posé et direct, cadrage buste, arrière-plan bureau neutre.
Texte parlé :
"On me pose souvent cette question : le regroupement d'achat, c'est quoi exactement ? En clair, plusieurs entreprises se regroupent pour acheter leur énergie ensemble, et obtiennent des conditions qu'elles n'auraient jamais pu négocier seules. Pas de fusion, pas d'engagement de groupe — chacun garde son contrat, son fournisseur, sa facture. Juste un pouvoir de négociation collectif."
```

- [ ] **Step 2: Vérifier contre la checklist**

Confirmer chacun des points suivants avant de passer à la tâche suivante :
- [ ] Le post UGC commence par `🎬 Témoignage illustratif — MS Strategy`
- [ ] Aucun chiffre non sourcé dans les deux posts
- [ ] Le lien du post officiel utilise exactement le gabarit UTM avec `utm_content=s01-off`
- [ ] Le post UGC-avatar ne comporte pas de lien CTA (rappel léger de la semaine 1, pas de CTA fort — cf. Global Constraints)

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-01.md
git commit -m "Add week 1 posts: fuel/energy angle opening + UGC FAQ"
```

---

### Task 3: Semaine 2 — Décomposition de facture + FAQ changement fournisseur

**Files:**
- Create: `content/social-organique-b2b/semaine-02.md`

**Interfaces:**
- Consumes: conventions de `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 2.

- [ ] **Step 1: Écrire le fichier**

```markdown
# Semaine 2

## Post 1 — Officiel (pédagogie : décomposition de la facture)

Une facture d'électricité professionnelle, ce n'est pas qu'un chiffre en bas de page. Elle se décompose en trois grandes parties : la fourniture (le prix de l'énergie elle-même, la seule partie réellement négociable), l'acheminement (TURPE, fixe), et les taxes (fixes également).

Beaucoup d'entreprises négocient sans savoir qu'elles ne discutent qu'une seule de ces trois parties. Résultat : des marges de manœuvre laissées de côté.

On décortique votre facture actuelle avec vous, gratuitement.

## Post 2 — UGC-avatar (FAQ : changement de fournisseur)

🎬 Témoignage illustratif — MS Strategy

"Si je passe par vous, je change de fournisseur ?" Pas nécessairement.

Le rôle d'un courtier, c'est de comparer et négocier pour vous — le changement de fournisseur n'est qu'une option parmi d'autres, jamais une obligation. Vous gardez la main sur la décision finale, à chaque étape.

### Script vidéo (Higgsfield)
Persona : même conseiller que semaine 1 (continuité visuelle), ton rassurant.
Texte parlé :
"Question fréquente : si je passe par vous, est-ce que je change de fournisseur ? Pas nécessairement. Notre rôle, c'est de comparer et de négocier pour vous — changer de fournisseur n'est qu'une option parmi d'autres, jamais une obligation. C'est vous qui décidez, à chaque étape."
```

- [ ] **Step 2: Vérifier contre la checklist**

- [ ] Disclosure présente en première ligne du post UGC
- [ ] Aucun chiffre non sourcé
- [ ] Pas de lien CTA requis cette semaine (hors semaines 1, 7, 8 — cf. Global Constraints, aucun ajout non prévu)

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-02.md
git commit -m "Add week 2 posts: invoice breakdown + UGC FAQ on supplier switch"
```

---

### Task 4: Semaine 3 — FAQ délai d'analyse + premier témoignage

**Files:**
- Create: `content/social-organique-b2b/semaine-03.md`

**Interfaces:**
- Consumes: conventions de `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 3.

- [ ] **Step 1: Écrire le fichier**

```markdown
# Semaine 3

## Post 1 — Officiel (FAQ : délai d'analyse)

"Combien de temps prend l'analyse de ma facture ?" C'est la question qu'on nous pose le plus souvent après le premier contact.

Chez MS Strategy : sous 48h, vous savez déjà si des leviers existent sur votre contrat actuel. Pas de silence radio, pas de mois d'attente — juste une réponse claire, rapide, sur ce qui est possible ou non pour votre entreprise.

## Post 2 — UGC-avatar (témoignage illustratif 1)

🎬 Témoignage illustratif — MS Strategy

Avant : une facture qui grimpait chaque trimestre, sans qu'on comprenne vraiment pourquoi.

Après : un contrat renégocié, un interlocuteur dédié, et surtout — une facture enfin lisible.

Ce que beaucoup de dirigeants de PME découvrent en passant par MS Strategy : ce n'est pas la fatalité qu'on croit.

### Script vidéo (Higgsfield)
Persona : dirigeant(e) de PME (avatar distinct du conseiller), ton direct, cadre bureau ou atelier selon disponibilité d'assets, 30-45 ans.
Texte parlé :
"Avant, ma facture d'énergie grimpait chaque trimestre, et honnêtement je ne comprenais pas bien pourquoi. Après être passé par MS Strategy : un contrat renégocié, un interlocuteur dédié, et une facture enfin lisible. Ce que j'ai découvert, c'est que ce n'est pas la fatalité qu'on croit."
```

- [ ] **Step 2: Vérifier contre la checklist**

- [ ] Disclosure présente en première ligne du post UGC
- [ ] Aucun chiffre non sourcé (le "48h" est un engagement de service, pas une statistique — autorisé)
- [ ] Persona de l'avatar témoignage bien distincte du conseiller des semaines 1-2 (évite la confusion d'identité)

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-03.md
git commit -m "Add week 3 posts: FAQ on analysis delay + first UGC testimonial"
```

---

### Task 5: Semaine 4 — Pièges au changement de fournisseur + coulisses méthode

**Files:**
- Create: `content/social-organique-b2b/semaine-04.md`

**Interfaces:**
- Consumes: conventions de `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 4.

- [ ] **Step 1: Écrire le fichier**

```markdown
# Semaine 4

## Post 1 — Officiel (pédagogie : pièges à éviter)

Changer de fournisseur d'énergie professionnel, ce n'est pas sans risque si c'est mal préparé. Les pièges les plus fréquents : signer un nouveau contrat sans avoir vérifié la clause de préavis de l'ancien, comparer des offres sur le seul prix affiché sans regarder la durée d'engagement, ou négliger le type d'indexation (fixe vs indexée sur le marché).

Un courtier ne sert pas qu'à trouver un prix bas — il sert à éviter ces pièges-là.

## Post 2 — UGC-avatar (coulisses méthode)

🎬 Témoignage illustratif — MS Strategy

Ce qui se passe concrètement quand vous nous transmettez votre facture : on identifie d'abord la structure du contrat actuel (durée, indexation, clauses), on compare avec les offres disponibles au moment de l'analyse, puis on vous transmet un comparatif clair — sans jargon, sans page illisible.

### Script vidéo (Higgsfield)
Persona : conseiller (même avatar que semaines 1-2), plan rapproché, ton pédagogique.
Texte parlé :
"Concrètement, voici ce qui se passe quand vous nous transmettez votre facture. D'abord, on identifie la structure de votre contrat actuel : durée, indexation, clauses. Ensuite, on compare avec les offres disponibles au moment de l'analyse. Et on vous transmet un comparatif clair, sans jargon, sans page illisible."
```

- [ ] **Step 2: Vérifier contre la checklist**

- [ ] Disclosure présente en première ligne du post UGC
- [ ] Aucun chiffre non sourcé
- [ ] Cohérence de persona : conseiller = même avatar que semaines 1, 2 (continuité de personnage vérifiée)

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-04.md
git commit -m "Add week 4 posts: supplier-switch pitfalls + behind-the-scenes UGC"
```

---

### Task 6: Semaine 5 — FAQ contrat en cours + témoignage secteur logistique

**Files:**
- Create: `content/social-organique-b2b/semaine-05.md`

**Interfaces:**
- Consumes: conventions de `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 5.

- [ ] **Step 1: Écrire le fichier**

```markdown
# Semaine 5

## Post 1 — Officiel (FAQ : contrat encore engagé)

"Je suis encore engagé sur mon contrat actuel, ça sert à quelque chose de vous contacter maintenant ?" Oui — et c'est même le bon moment.

Anticiper avant l'échéance du contrat permet de préparer la suite sans subir un renouvellement automatique à des conditions qu'on n'a pas choisies. L'analyse peut démarrer dès maintenant, même si rien ne change tout de suite.

## Post 2 — UGC-avatar (témoignage illustratif 2 — secteur logistique)

🎬 Témoignage illustratif — MS Strategy

Secteur logistique, plusieurs entrepôts, une facture énergie qui pesait lourd sur les charges fixes. Le regroupement d'achat a permis de renégocier sans changer d'organisation ni de fournisseur imposé.

Chaque secteur a ses contraintes — l'analyse s'adapte, pas l'inverse.

### Script vidéo (Higgsfield)
Persona : dirigeant(e) secteur logistique (nouvel avatar, distinct du témoignage semaine 3), cadrage type entrepôt ou bureau logistique.
Texte parlé :
"On a plusieurs entrepôts, et notre facture d'énergie pesait vraiment lourd dans nos charges fixes. Le regroupement d'achat nous a permis de renégocier sans rien changer à notre organisation, ni imposer un nouveau fournisseur. Chaque secteur a ses contraintes — c'est l'analyse qui s'adapte, pas l'inverse."
```

- [ ] **Step 2: Vérifier contre la checklist**

- [ ] Disclosure présente en première ligne du post UGC
- [ ] Aucun chiffre non sourcé
- [ ] Nouvel avatar distinct de celui de la semaine 3 (diversité sectorielle respectée)

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-05.md
git commit -m "Add week 5 posts: FAQ on ongoing contracts + logistics-sector UGC testimonial"
```

---

### Task 7: Semaine 6 — Coulisses rigueur méthode + témoignage TPE

**Files:**
- Create: `content/social-organique-b2b/semaine-06.md`

**Interfaces:**
- Consumes: conventions de `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 6.

- [ ] **Step 1: Écrire le fichier**

```markdown
# Semaine 6

## Post 1 — Officiel (coulisses : rigueur, pas de chiffre en l'air)

On ne vous donnera jamais un pourcentage d'économie avant d'avoir réellement analysé votre facture. Pourquoi ? Parce que ce chiffre dépend entièrement de votre contrat actuel, de votre consommation, de votre secteur — un chiffre générique ne veut rien dire.

C'est plus long à dire dans un post, mais c'est la seule façon de vous donner une réponse qui tienne la route.

## Post 2 — UGC-avatar (témoignage illustratif 3 — TPE)

🎬 Témoignage illustratif — MS Strategy

Dirigeant d'une TPE de 8 salariés : "Je pensais que le regroupement d'achat, c'était réservé aux grandes structures. Erreur — c'est justement là que ça fait la différence, parce qu'on n'a ni le temps ni le poids pour négocier seuls."

### Script vidéo (Higgsfield)
Persona : dirigeant(e) TPE (nouvel avatar, distinct des témoignages semaines 3 et 5), ton spontané, cadrage bureau petite structure.
Texte parlé :
"Je pensais que le regroupement d'achat, c'était réservé aux grandes structures. En fait, c'est une erreur — c'est justement pour une TPE comme la mienne que ça fait la différence, parce qu'on n'a ni le temps ni le poids pour négocier seuls face à un fournisseur."
```

- [ ] **Step 2: Vérifier contre la checklist**

- [ ] Disclosure présente en première ligne du post UGC
- [ ] Le post officiel n'introduit aucun chiffre malgré le sujet ("on ne donne pas de chiffre" reste vrai dans le post lui-même)
- [ ] Troisième avatar distinct des semaines 3 et 5

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-06.md
git commit -m "Add week 6 posts: no-unverified-numbers stance + TPE UGC testimonial"
```

---

### Task 8: Semaine 7 — Rappel angle carburant/énergie + CTA fort, reprise témoignage

**Files:**
- Create: `content/social-organique-b2b/semaine-07.md`

**Interfaces:**
- Consumes: conventions de `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 7.

- [ ] **Step 1: Écrire le fichier**

```markdown
# Semaine 7

## Post 1 — Officiel (rappel angle créatif + CTA fort)

Le prix de votre carburant, vous ne pouvez rien y faire. Le prix de votre énergie professionnelle, si.

Deux minutes suffisent pour savoir si votre facture actuelle a une marge de négociation — sans engagement, sans changement forcé de fournisseur.

Transmettez votre facture en toute sécurité : https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s07-off

## Post 2 — UGC-avatar (reprise de témoignage + incitation, CTA fort)

🎬 Témoignage illustratif — MS Strategy

"Le seul regret, c'est de ne pas l'avoir fait plus tôt." Ce qu'on entend le plus souvent après une première analyse de facture.

Vous aussi, vous pouvez savoir en 2 minutes ce qu'il en est de la vôtre.

https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s07-ugc

### Script vidéo (Higgsfield)
Persona : avatar de la semaine 3 (dirigeant PME) par défaut, ton conclusif. Ce choix peut être remplacé par l'avatar semaine 5 ou 6 si les données d'engagement collectées d'ici la semaine 7 montrent qu'un autre avatar performe mieux — décision à prendre avec des données réelles, pas à l'avance.
Texte parlé :
"Le seul regret que j'ai, c'est de ne pas l'avoir fait plus tôt. Si vous êtes dans la même situation que moi il y a quelques mois : vous aussi, vous pouvez savoir en deux minutes ce qu'il en est de votre facture."
```

- [ ] **Step 2: Vérifier contre la checklist**

- [ ] Disclosure présente en première ligne du post UGC
- [ ] Les deux posts portent un lien avec `utm_content=s07-off` et `utm_content=s07-ugc` respectivement (CTA fort obligatoire cette semaine, cf. Global Constraints)
- [ ] L'angle carburant/énergie est repris explicitement dans le post officiel, en écho au post d'ouverture de la semaine 1
- [ ] Aucun chiffre non sourcé

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-07.md
git commit -m "Add week 7 posts: fuel/energy angle callback + strong CTA on both posts"
```

---

### Task 9: Semaine 8 — Récapitulatif + clôture, dernier témoignage

**Files:**
- Create: `content/social-organique-b2b/semaine-08.md`

**Interfaces:**
- Consumes: conventions de `content/social-organique-b2b/README.md` (Task 1).
- Produces: copy finale des deux posts de la semaine 8, dernière tâche du calendrier.

- [ ] **Step 1: Écrire le fichier**

```markdown
# Semaine 8

## Post 1 — Officiel (récapitulatif + CTA de clôture)

Ce qu'on a vu ces 8 dernières semaines : comment se décompose une facture d'énergie pro, les pièges à éviter en changeant de fournisseur, comment fonctionne le regroupement d'achat, et pourquoi le prix que vous payez n'est pas une fatalité.

Si une question reste sans réponse, ou si vous voulez simplement savoir où en est votre contrat actuel : transmettez votre facture, on s'occupe du reste.

https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s08-off

## Post 2 — UGC-avatar (dernier témoignage + CTA de clôture)

🎬 Témoignage illustratif — MS Strategy

De la première facture transmise au contrat renégocié : le parcours n'a rien de compliqué, juste besoin d'un premier pas.

Vous aussi ?

https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=calendrier-s1-8&utm_content=s08-ugc

### Script vidéo (Higgsfield)
Persona : avatar de la semaine 5 (dirigeant secteur logistique) par défaut — distinct de l'avatar semaine 3 utilisé en semaine 7, pour varier les visages sur les deux derniers posts. Même règle qu'en semaine 7 : remplaçable par un autre avatar si les données d'engagement l'indiquent.
Texte parlé :
"De la première facture transmise au contrat renégocié, le parcours n'a rien de compliqué — j'avais juste besoin de faire le premier pas. Vous aussi, vous pouvez le faire."
```

- [ ] **Step 2: Vérifier contre la checklist**

- [ ] Disclosure présente en première ligne du post UGC
- [ ] Les deux posts portent un lien avec `utm_content=s08-off` et `utm_content=s08-ugc` respectivement
- [ ] Aucun chiffre non sourcé
- [ ] Le post officiel référence bien les 4 piliers vus dans les semaines précédentes (pédagogie facture, pièges fournisseur, regroupement d'achat, angle carburant/énergie) sans en inventer un nouveau

- [ ] **Step 3: Commit**

```bash
git add content/social-organique-b2b/semaine-08.md
git commit -m "Add week 8 posts: recap and campaign-test closing CTA"
```

---

## Post-plan note

Ce plan livre le contenu texte + script vidéo des 16 posts. La production
effective des vidéos avatar (génération Higgsfield à partir des scripts
ci-dessus) et la planification des dates de publication exactes restent hors
périmètre — à traiter lors de l'exécution opérationnelle (hors agent), une
fois l'accès à Higgsfield et au calendrier de publication LinkedIn en place.
