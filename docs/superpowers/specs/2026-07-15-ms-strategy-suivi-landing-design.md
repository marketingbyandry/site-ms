# Pages de suivi personnalisées (prospection) — design

Date : 2026-07-15, mise à jour 2026-07-16 (ajout du split A/B).
Périmètre : deux paires de fichiers statiques (variantes A et C, pour B2B et
B2C), leurs deux URLs publiques stables, l'extension de `middleware.js` pour
le split, et un outil interne de génération de lien
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

Ces pages font l'objet de leur **propre test A/B** (deux angles éditoriaux,
voir section 2) — un mécanisme indépendant du test A/B déjà en prod sur la
home.

**Hors périmètre explicite** : cette initiative ne touche pas au test A/B de
la home (cookie `ms_variant`, `index.html`/`index-b.html`) ni à la question,
restée ouverte, d'un "V2 sous-domaine" évoquée dans `handoff.md` — ce sont
des sujets distincts, même si le mécanisme technique (cookie + rewrite Edge)
s'en inspire directement. Ces pages ne sont liées depuis aucune navigation
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
avoir besoin de nommer qui que ce soit. Ceci s'applique aux deux variantes
testées (A et C, voir section 2).

## 2. Angle éditorial — deux variantes testées

Trois approches explorées avec l'utilisateur :

- **A — Anti-comparateur frontal** *(retenu, variante test)* : le contraste
  avec les comparateurs porte l'ouverture de la page. Percutant, direct.
- **B — La facture en vedette** *(écarté)* : ton premium centré sur la
  précision de l'analyse, comparateur jamais mentionné explicitement. Écart
  avec C jugé trop subtil pour un test à deux variantes utile.
- **C — Continuité relationnelle** *(retenu, variante test)* : la page
  prolonge l'échange humain déjà eu, ne s'ouvre pas comme une page marketing
  froide ; l'angle anti-comparateur y apparaît comme preuve rationnelle au
  milieu de page plutôt qu'en ouverture.

**Décision** : on teste **A contre C** — l'écart le plus net entre les trois
approches, donc l'hypothèse la plus informative (percutant/direct vs
rassurant/relationnel, pour un même lecteur déjà en contact). B est
abandonné.

**Squelette de page partagé entre A et C** (voir section 4) : même 7 blocs,
même longueur approximative — seul l'ordre d'apparition du message
différenciant et le ton du hero changent. Ce choix isole la variable testée
(quel message ouvre la page) plutôt que de faire varier la structure
entière, pour un signal plus propre.

- **Variante C** : hero = continuité relationnelle (prénom, conseiller) ;
  bloc "Preuve n°1" = première apparition de l'angle anti-comparateur, en
  révélation ("voici pourquoi on ne vous a pas envoyé un simulateur").
- **Variante A** : hero = contraste anti-comparateur direct, sans détour
  relationnel (personnalisation prénom/conseiller conservée mais en
  registre secondaire, pas le crochet d'ouverture) ; bloc "Preuve n°1" =
  approfondissement/développement du contraste déjà annoncé en hero, pas une
  révélation.

## 3. Architecture technique

### Fichiers

- `ms-strategy-suivi-b2b.html` / `ms-strategy-suivi-b2c.html` — **URLs
  publiques stables**, ce que le commercial envoie. Jamais de contenu direct
  dedans : uniquement des cibles de rewrite (voir "Répartition A/B"
  ci-dessous). Le lien envoyé à un prospect ne change jamais, quelle que
  soit la variante tirée.
- `ms-strategy-suivi-b2b-a.html` / `ms-strategy-suivi-b2b-c.html` — contenu
  réel des deux variantes B2B.
- `ms-strategy-suivi-b2c-a.html` / `ms-strategy-suivi-b2c-c.html` — contenu
  réel des deux variantes B2C.
- `generateur-suivi.html` — outil interne, non lié depuis la nav publique,
  `<meta name="robots" content="noindex">`, **protégé par Basic Auth** (voir
  ci-dessous). Génère un lien vers l'URL **publique stable**, jamais vers
  une variante `-a`/`-c` directement.

Même famille technique que `ms-strategy-landing-2.html` : page statique
autonome, nav minimale (logo + téléphone), pas de nav complète, CTA sticky
mobile, `<script>` inline vanilla JS (pas de build, cohérent avec le reste
du site).

### Répartition A/B — extension de `middleware.js`

Même mécanisme que le test A/B de la home (`middleware.js` existant), avec
un **cookie et un matcher indépendants** — ne modifie pas la logique
`ms_variant`/`index.html` déjà en place.

- Nouveau cookie `ms_suivi_variant` (`A` ou `C`), sticky 30 jours, même
  format que `ms_variant`.
- `matcher` étendu à `/ms-strategy-suivi-b2b.html` et
  `/ms-strategy-suivi-b2c.html` uniquement — n'affecte aucune autre page.
- Logique identique au test existant : lit le cookie, tire A/C à 50/50 si
  absent, rewrite serveur (pas de redirect HTTP) vers le fichier `-a` ou
  `-c` correspondant, l'URL affichée reste l'URL publique stable dans tous
  les cas.
- **Bots toujours variante C, jamais de cookie** — même règle que la home.
  Justification spécifique à ce cas : les liens de prospection sont souvent
  pré-visités par des scanners de sécurité email (Outlook Safe Links, etc.)
  avant que le prospect ne clique lui-même ; sans cette règle, ces passages
  de bots pollueraient les métriques de conversion PostHog.
- **Point d'attention (hérité du test A/B de la home, à revérifier ici)** :
  le rewrite ne doit pas casser les chemins relatifs des assets, et les
  paramètres `?prenom=&conseiller=` de l'URL publique doivent être préservés
  par le rewrite jusqu'au fichier `-a`/`-c` servi — à vérifier en test réel
  après implémentation, pas seulement en lecture de code.

### URLs publiques

Pas de `vercel.json` ni de réécriture d'URL custom dans ce repo au-delà de
`middleware.js` (vérifié en direct sur la prod) — chaque fichier est servi
tel quel, extension `.html` incluse, sauf sur les deux chemins interceptés
ci-dessus. Une fois mergées sur `main` :

- `https://www.byandry.com/ms-strategy-suivi-b2b.html` (rewrite → `-a` ou `-c`)
- `https://www.byandry.com/ms-strategy-suivi-b2c.html` (rewrite → `-a` ou `-c`)
- `https://www.byandry.com/generateur-suivi.html` (protégé, voir ci-dessous)

Lien type envoyé à un prospect (toujours l'URL publique stable) :
`https://www.byandry.com/ms-strategy-suivi-b2b.html?prenom=Julien&conseiller=Marie`

### Protection de `generateur-suivi.html`

Le `noindex` empêche l'indexation mais pas l'accès direct — insuffisant pour
un outil qu'on veut réservé à l'équipe. Protection retenue : **Basic Auth
via `middleware.js`**, qui existe déjà pour le test A/B de la home.

- Nouveau `matcher` (ou logique conditionnelle sur `request.nextUrl.pathname`)
  ciblant uniquement `/generateur-suivi.html` — n'affecte ni la home ni les
  autres pages.
- Vérifie l'en-tête `Authorization` (Basic Auth standard) ; si absent ou
  incorrect, réponse `401` avec `WWW-Authenticate: Basic` (déclenche la
  popup native du navigateur, pas de formulaire à construire).
- **Identifiants stockés en variables d'environnement Vercel**
  (`SUIVI_TOOL_USER` / `SUIVI_TOOL_PASS`, définies dans Project Settings →
  Environment Variables), **jamais en dur dans le code**. Point non
  négociable : le repo `site-ms` est **public** sur GitHub — un mot de passe
  écrit dans `middleware.js` serait visible par n'importe qui sur la page du
  repo, immédiatement.
- Ces variables devront être créées directement par l'utilisateur dans le
  dashboard Vercel (action hors du repo, pas quelque chose que
  l'implémentation peut faire toute seule) — à faire au moment du plan
  d'implémentation.

### Personnalisation par paramètres d'URL

- `?prenom=Julien` → injecté dans l'accroche du hero via `textContent`
  (jamais `innerHTML`, pour exclure tout risque d'injection).
- `?conseiller=Marie` → mentionné une fois dans la page.
- **Repli si absents** : la copy est écrite pour fonctionner nativement dans
  les deux cas, pas comme un trou vide comblé après coup. Vrai pour les
  variantes A et C, chacune avec son propre libellé de repli cohérent avec
  son ton (voir section 5).
- S'applique identiquement aux deux variantes A/C — la personnalisation est
  orthogonale au test éditorial, pas une variable testée.

### Générateur de lien interne (`generateur-suivi.html`)

Motivation : l'équipe commerciale compte 2 à 10 personnes qui construiraient
sinon ces URLs à la main (risque d'erreur de frappe/encodage).

- Formulaire minimal : choix de la page cible (B2B/B2C), champ **texte
  libre** pour le prénom du prospect, champ **texte libre** pour le prénom
  du conseiller (pas de liste déroulante — zéro maintenance si l'équipe
  change, quitte à perdre un peu de cohérence orthographique).
- Génère l'URL finale — **toujours l'URL publique stable**, jamais une
  variante `-a`/`-c` directement, pour ne pas casser le split côté
  middleware (avec `encodeURIComponent` sur les valeurs saisies) — et
  affiche un bouton "copier le lien".
- Aucun backend, aucun stockage — concaténation de chaîne côté client
  uniquement.

### Tracking

- Même formulaire Tally (`kd15W1`) que le reste du site, avec un `source`
  distinct par variante : `openTallyForm('suivi-b2b-a')` /
  `openTallyForm('suivi-b2b-c')` / `openTallyForm('suivi-b2c-a')` /
  `openTallyForm('suivi-b2c-c')` — pour isoler les soumissions par variante
  dans Tally, pas seulement par audience.
- Ajout de `<script src="assets/analytics.js">` sur les quatre fichiers de
  contenu — absent de `ms-strategy-landing-2.html` aujourd'hui, ce qui en
  fait un angle mort analytics. `posthog.register({ variant: ... })` étiqueté
  avec la variante A/C (même pattern que le cookie `ms_variant`/home),
  distinct de l'étiquette de variante de la home.
- Ces nouvelles pages doivent être visibles dans PostHog comme le reste du
  site, avec la possibilité de comparer le taux de clic CTA entre A et C.

### Point d'attention

- Faire remonter `prenom`/`conseiller` en `hiddenFields` du popup Tally
  (comme `source`) serait utile pour l'équipe commerciale, mais nécessite
  que ces champs existent déjà côté configuration du formulaire Tally — non
  vérifiable depuis le repo. **Non inclus dans ce périmètre** ; à
  envisager séparément si l'utilisateur confirme que ces hidden fields
  existent côté Tally.
- Échantillon attendu plus faible que le test A/B de la home (trafic de
  prospection individuelle, pas de trafic organique large) — le temps
  nécessaire pour obtenir un signal statistiquement lisible sera plus long.
  Pas un blocage pour le build, mais à garder en tête pour l'interprétation
  des résultats.

## 4. Structure de page (squelette partagé A/C, contenu adapté)

7 blocs, même économie de section que `ms-strategy-landing-2.html` (pas de
FAQ — cohérent avec un lecteur déjà en contact, moins besoin de lever des
objections depuis zéro). Le squelette est identique entre les variantes A et
C (voir section 2) — seul le contenu des blocs 2 et 3 change significativement :

1. **Header minimal** — logo + téléphone. Identique A/C.
2. **Hero** — *C* : accroche personnalisée relationnelle (prénom si dispo,
   repli générique sinon). *A* : accroche contraste anti-comparateur direct
   (personnalisation en registre secondaire). CTA vers `#upload` dans les
   deux cas.
3. **Preuve n°1 — "Pourquoi pas un simulateur"** — *C* : première apparition
   de l'angle, en révélation. *A* : développement/approfondissement du
   contraste déjà posé en hero. Catégorie décrite sans marque citée dans les
   deux cas.
4. **Preuve n°2 — Crédibilité** — faits déjà publiés ailleurs sur le site
   uniquement (aucun nouveau chiffre inventé) : depuis 2012, indépendance,
   rémunération exclusivement par commission fournisseur (jamais le
   client), 80 collaborateurs / 8 agences. Identique A/C.
5. **Étapes** — "Comment ça marche" en 3-4 étapes. Identique A/C.
6. **Section upload / CTA final** — repris à l'identique du pattern
   `#upload` de `b2b.html`/`b2c.html` (liste des documents, alternative
   email/téléphone, message de confidentialité, bouton Tally avec `source`
   qui encode à la fois l'audience et la variante). Identique A/C hormis le
   `source`.
7. **Footer minimal + CTA sticky mobile** — contact, SIREN, pas de plan du
   site complet. Identique A/C.

## 5. Messages clés par bloc et par variante (stratégie de contenu — le copy
   final mot à mot sera écrit à l'étape d'implémentation, pas figé ici)

### Variante C — continuité relationnelle

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

### Variante A — anti-comparateur frontal

**Hero** — Commun : le contraste dès le H1, ex. *"Un algorithme ne connaît
pas votre contrat. Une personne, oui."* — personnalisation prénom/conseiller
conservée mais en sous-ligne, pas dans le H1 lui-même. CTA "Envoyer ma
facture →" identique.
*B2B* : le contraste porte sur la complexité pro qu'un formulaire générique
ne capture jamais (puissance souscrite, heures creuses, TURPE, multi-sites).
*B2C* : le contraste porte sur les détails personnels (option tarifaire
actuelle, historique, échéance réelle) qu'un simulateur grand public ne
demande jamais.

**Preuve n°1** — Ne révèle plus l'angle (déjà posé en hero) : l'approfondit
avec des exemples concrets et les preuves de crédibilité qui justifient
pourquoi une analyse humaine est plus fiable qu'un algorithme. *B2B*/*B2C* :
mêmes points d'appui que la variante C (voir ci-dessus), reformulés en
confirmation plutôt qu'en révélation.

### Commun aux deux variantes

**Preuve n°2**, **Étapes** : contenu identique à la version précédente de ce
spec (indépendant du test éditorial) — *B2B* reprend le triptyque de
`b2b.html` (facture → analyse leviers/fenêtre de négociation → mise en
concurrence → signature), *B2C* celui de `b2c.html` (facture → leviers en
quelques minutes → meilleure offre adaptée au logement → signature 2-4
semaines).

**Ton** : reprend la voix déjà en place sur le site (direct, confiant,
phrases courtes, emphase en italique, pas de jargon corporate) — pas de
nouvelle voix à inventer. La variante A est plus directe/affirmative, la
variante C plus posée/relationnelle, mais aucune des deux ne sort du
registre de voix existant du site.

## 6. Hors périmètre

- Pas de nom de concurrent cité dans la copy publique (section 1),
  pour aucune des deux variantes.
- Aucun nouveau chiffre/statistique inventé — uniquement des faits déjà
  publiés ailleurs sur le site.
- Aucune modification du test A/B de la home (`ms_variant`) ou de la
  question du sous-domaine "V2" — mécanisme séparé (`ms_suivi_variant`).
- Approche B ("la facture en vedette") écartée, non construite.
- Pas de liste déroulante de conseillers dans le générateur de lien (champ
  texte libre, voir section 3).
- Pas de remontée `prenom`/`conseiller` en hidden fields Tally (voir point
  d'attention section 3).
- Pas de FAQ sur ces pages.
