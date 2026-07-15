# Pages de suivi personnalisées (prospection) — design

Date : 2026-07-15
Périmètre : deux nouveaux fichiers statiques (`ms-strategy-suivi-b2b.html`,
`ms-strategy-suivi-b2c.html`) + un outil interne de génération de lien
(`generateur-suivi.html`). Aucune page existante n'est modifiée.

## But

M&S Strategy contacte individuellement des prospects (appel, email,
LinkedIn). Après ce premier contact humain, le commercial envoie un lien vers
une page dédiée dont le seul objectif est de transformer la conversation en
action concrète : **l'envoi de la facture d'énergie du prospect**, point de
départ de l'étude gratuite.

Ce n'est pas une page d'acquisition froide (voir `ms-strategy-landing-2.html`
pour ce cas d'usage) : le lecteur a déjà un humain en face de lui. La page
sert à consolider la confiance déjà établie, pas à convaincre depuis zéro.

**Hors périmètre explicite** : cette initiative ne touche pas au test A/B de
la home (`middleware.js`, `index.html`/`index-b.html`) ni à la question,
restée ouverte, d'un "V2 sous-domaine" évoquée dans `handoff.md` — ce sont
deux sujets distincts. Ces pages ne sont liées depuis aucune navigation
publique du site.

## 1. Recherche concurrentielle (angle différenciant)

Recherche menée le 2026-07-15 sur le fonctionnement réel de trois acteurs
cités par l'utilisateur ou identifiés comme équivalents grand public :

- **Opéra Énergie** (B2B, fondé 2014, 200+ salariés, 15 000+ clients) — CTA
  principal *"Comparer les offres d'énergie"*, renvoie vers un comparateur
  en ligne automatisé (`comparaison.opera-energie.com`) qui fait déclarer un
  profil de consommation.
- **Mon Courtier Énergie** (B2B, fondé 2017, 30+ agences, coté en bourse
  depuis 2023) — CTA principal *"Je veux comparer les offres !"*, même
  logique de comparateur automatisé (`pro-comparateur.moncourtierenergie.com`).
- **Selectra** (B2C, comparateur généraliste le plus connu en France) — CTA
  principal *"Comparer"*, formulaire interactif multi-étapes (profil de
  consommation, puissance de compteur, commune) avant d'accéder aux résultats.

**Constat commun aux trois** : le mécanisme de conversion repose sur un
profil **déclaré/estimé** par l'internaute dans un formulaire générique, en
libre-service, sans intervention humaine avant la mise en relation.

**Différence réelle et vérifiable côté M&S Strategy** : le mécanisme déjà en
place sur `b2b.html`/`b2c.html` (section `#upload`) demande la **facture
réelle**, analysée par une personne, avec un retour engagé sous 48h. Ce n'est
pas un positionnement marketing à inventer — c'est déjà la façon dont le
site fonctionne ; ces nouvelles pages rendent cette différence explicite et
la démontrent avec preuve à l'appui, pour un public déjà en contact.

**Décision** : les concurrents ne sont **pas nommés** dans la copy publique
(risque de publicité comparative — la comparaison doit rester objective,
vérifiable et non dénigrante pour être sûre juridiquement). La catégorie est
décrite ("les comparateurs en ligne classiques") sans marque citée. Le
contraste factuel (profil déclaré vs facture réelle) porte le message sans
avoir besoin de nommer qui que ce soit.

## 2. Angle éditorial retenu

Trois approches explorées avec l'utilisateur :

- **A — Anti-comparateur frontal** : le contraste avec les comparateurs en
  ouverture de page. Percutant mais risque de sonner défensif avant d'avoir
  établi la confiance.
- **B — La facture en vedette** : ton premium centré sur la précision de
  l'analyse, comparateur jamais mentionné explicitement.
- **C — Continuité relationnelle** *(retenu)* : la page prolonge l'échange
  humain déjà eu, ne s'ouvre pas comme une page marketing froide.

**Approche retenue : C, avec B comme moteur de la section preuve.** Le hook
d'ouverture est la continuité de la relation (prénom du prospect,
éventuellement nom du conseiller) ; l'angle anti-comparateur (approche A/B)
devient une preuve rationnelle au milieu de page plutôt que le message
d'ouverture — cohérent avec un lecteur déjà en contact, qui n'a pas besoin
d'être reconquis depuis zéro.

## 3. Architecture technique

### Fichiers

- `ms-strategy-suivi-b2b.html`
- `ms-strategy-suivi-b2c.html`
- `generateur-suivi.html` — outil interne, non lié depuis la nav publique,
  `<meta name="robots" content="noindex">`.

Même famille technique que `ms-strategy-landing-2.html` : page statique
autonome, nav minimale (logo + téléphone), pas de nav complète, CTA sticky
mobile, `<script>` inline vanilla JS (pas de build, cohérent avec le reste
du site).

### Personnalisation par paramètres d'URL

- `?prenom=Julien` → injecté dans l'accroche du hero via `textContent`
  (jamais `innerHTML`, pour exclure tout risque d'injection).
- `?conseiller=Marie` → mentionné une fois dans la page.
- **Repli si absents** : la copy est écrite pour fonctionner nativement dans
  les deux cas, pas comme un trou vide comblé après coup.
  - `prenom` absent → *"Bonjour {Prénom},"* devient *"Suite à notre
    échange,"*
  - `conseiller` absent → *"{Conseiller} vous a présenté..."* devient
    *"Notre équipe vous a présenté..."*

### Générateur de lien interne (`generateur-suivi.html`)

Motivation : l'équipe commerciale compte 2 à 10 personnes qui construiraient
sinon ces URLs à la main (risque d'erreur de frappe/encodage).

- Formulaire minimal : choix de la page cible (B2B/B2C), champ **texte
  libre** pour le prénom du prospect, champ **texte libre** pour le prénom
  du conseiller (pas de liste déroulante — zéro maintenance si l'équipe
  change, quitte à perdre un peu de cohérence orthographique).
- Génère l'URL finale (avec `encodeURIComponent` sur les valeurs saisies) et
  affiche un bouton "copier le lien".
- Aucun backend, aucun stockage — concaténation de chaîne côté client
  uniquement.

### Tracking

- Même formulaire Tally (`kd15W1`) que le reste du site, avec un `source`
  distinct : `openTallyForm('suivi-b2b')` / `openTallyForm('suivi-b2c')`,
  pour isoler ces soumissions dans Tally.
- Ajout de `<script src="assets/analytics.js">` sur les deux pages — absent
  de `ms-strategy-landing-2.html` aujourd'hui, ce qui en fait un angle mort
  analytics. Ces nouvelles pages doivent être visibles dans PostHog comme le
  reste du site.

### Point d'attention

- Faire remonter `prenom`/`conseiller` en `hiddenFields` du popup Tally
  (comme `source`) serait utile pour l'équipe commerciale, mais nécessite
  que ces champs existent déjà côté configuration du formulaire Tally — non
  vérifiable depuis le repo. **Non inclus dans ce périmètre** ; à
  envisager séparément si l'utilisateur confirme que ces hidden fields
  existent côté Tally.

## 4. Structure de page (identique B2B/B2C, contenu adapté)

7 blocs, même économie de section que `ms-strategy-landing-2.html` (pas de
FAQ — cohérent avec un lecteur déjà en contact, moins besoin de lever des
objections depuis zéro) :

1. **Header minimal** — logo + téléphone.
2. **Hero** — accroche personnalisée (prénom si dispo, repli générique
   sinon) + promesse concrète + CTA vers `#upload`.
3. **Preuve n°1 — "Pourquoi pas un simulateur"** — le cœur de l'angle
   différenciant (section 1 ci-dessus), catégorie décrite sans marque citée.
4. **Preuve n°2 — Crédibilité** — faits déjà publiés ailleurs sur le site
   uniquement (aucun nouveau chiffre inventé) : depuis 2012, indépendance,
   rémunération exclusivement par commission fournisseur (jamais le
   client), 80 collaborateurs / 8 agences.
5. **Étapes** — "Comment ça marche" en 3-4 étapes.
6. **Section upload / CTA final** — repris à l'identique du pattern
   `#upload` de `b2b.html`/`b2c.html` (liste des documents, alternative
   email/téléphone, message de confidentialité, bouton Tally).
7. **Footer minimal + CTA sticky mobile** — contact, SIREN, pas de plan du
   site complet.

## 5. Messages clés par bloc (stratégie de contenu — le copy final mot à mot
   sera écrit à l'étape d'implémentation, pas figé ici)

**Hero** — Commun : kicker de continuité, CTA "Envoyer ma facture →".
*B2B* : angle charge mentale du dirigeant — l'énergie est un poste de coût
parmi cinquante autres sujets, la promesse est de lui retirer cette charge
avec un seul document à fournir. *B2C* : angle plus personnel — pouvoir
d'achat du foyer, frustration de factures qui montent sans qu'on comprenne
pourquoi.

**Preuve n°1** — Message pivot commun : *"Un comparateur en ligne vous fait
déclarer votre consommation. Nous, on regarde votre vraie facture."*
*B2B* : s'appuie sur la complexité déjà présente dans `b2b.html` (puissance
souscrite, heures pleines/creuses, TURPE, multi-sites) — un formulaire
générique ne capture pas ça. *B2C* : s'appuie sur l'idée que deux foyers en
apparence identiques peuvent payer différemment selon des détails qu'un
simulateur ne demande jamais (déjà en germe dans `b2c.html`).

**Preuve n°2** — Identique dans l'esprit pour les deux audiences, seul le
liant change légèrement de ton.

**Étapes** — *B2B* : reprend le triptyque déjà écrit sur `b2b.html` (facture
→ analyse leviers/fenêtre de négociation → mise en concurrence → signature).
*B2C* : reprend celui de `b2c.html` (facture → leviers en quelques minutes →
meilleure offre adaptée au logement → signature 2-4 semaines).

**Ton** : reprend la voix déjà en place sur le site (direct, confiant,
phrases courtes, emphase en italique, pas de jargon corporate) — pas de
nouvelle voix à inventer.

## 6. Hors périmètre

- Pas de nom de concurrent cité dans la copy publique (section 1).
- Aucun nouveau chiffre/statistique inventé — uniquement des faits déjà
  publiés ailleurs sur le site.
- Aucune modification de la home, du test A/B ou de la question du
  sous-domaine "V2".
- Pas de liste déroulante de conseillers dans le générateur de lien (champ
  texte libre, voir section 3).
- Pas de remontée `prenom`/`conseiller` en hidden fields Tally (voir point
  d'attention section 3).
- Pas de FAQ sur ces pages.
