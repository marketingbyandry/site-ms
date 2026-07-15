# Handoff — Site M&S Strategy

Dernière mise à jour : session du 2026-07-13 → 2026-07-15.

## A/B test homepage (variant B sobre N&B + tracking PostHog)

Branche `worktree-ms-strategy-ab-test`, PR draft #1
(https://github.com/marketingbyandry/site-ms/pull/1). Spec et plan dans
`docs/superpowers/specs/2026-07-15-ms-strategy-ab-test-design.md` et
`docs/superpowers/plans/2026-07-15-ms-strategy-ab-test.md`.

- **Middleware Vercel Edge** (`middleware.js` + `package.json`) : split 50/50
  sur `/` uniquement, cookie `ms_variant` sticky 30 jours, bots toujours
  variante A (jamais de cookie, jamais réécrits) pour ne pas casser le SEO.
- **`index-b.html`** : copie de `index.html`, mêmes sections/contenu, tokens
  `:root` basculés en clair (`--dark`/`--cream`/`--muted*`), glows retirés,
  hover teal/vert sur nav et CTA, flèche qui pivote à 45° au survol, rond
  flouté qui suit le curseur (desktop only, respecte
  `prefers-reduced-motion`). **Point trouvé pendant la vérification** :
  plusieurs sections (hero, `.def-box`, `.how-band`, `.timing-visual`,
  `.vals`, `.qband`, `.akpi`, `.careers-cta-band`) utilisaient des overlays
  `::before`/`background` en `rgba(13,79,92,*)`/`rgba(7,19,26,*)` codés en
  dur plutôt que les tokens — corrigé par un bloc d'override supplémentaire
  (commit `cced9c6`). Le footer (`.sfooter`) reste volontairement sombre
  (`#050e13`, non touché) — lu comme un bookend noir cohérent avec l'esprit
  "sobre N&B", pas un bug ; à reconsidérer si l'utilisateur préfère un footer
  clair aussi.
- **`assets/analytics.js`** : PostHog (clé `phc_uHyR...hnnBM`, région EU déjà
  branchée), variante taguée sur chaque évènement, `cta_click` délégué sur
  `a.cta-btn, a.pcta, a.ncta`. Guide de lecture des résultats :
  `docs/posthog-setup.md`.
- **Vérifié en réel** sur la preview Vercel (protégée par Vercel
  Authentication — bypass token utilisé pour les tests, ne pas le committer)
  via `curl` (cookie, rewrite A/B, exclusion bots même avec cookie forcé,
  assets/robots.txt) et Chrome headless piloté par CDP (screenshots desktop
  multi-sections, orb réactif à la souris, mobile sans orb, 0 erreur JS,
  PostHog chargé).
- **Reste à faire avant de sortir du mode draft** : confirmer que le projet
  PostHog du client est bien sur le cloud EU (sinon changer `api_host` dans
  `assets/analytics.js`), vérifier dans PostHog → Activity qu'un clic CTA
  réel remonte bien un évènement une fois le site en prod, décider si le
  footer doit lui aussi passer en clair.

## But général

Site vitrine statique pour M&S Strategy (courtier en énergie indépendant depuis 2012,
B2B + B2C), déployé sur `www.byandry.com`. Le travail de fond consiste à faire passer
le site d'un état "généré rapidement" à un état professionnel et cohérent :
architecture/maillage interne propre, direction artistique unifiée (typographie, logo),
outils de conversion crédibles (calculateur de perte, CTA, capture de leads sécurisée).

Aucune roadmap figée au-delà de ça — le travail avance requête par requête. Le point
resté ouvert le plus longtemps est l'intégration des posts LinkedIn au blog (voir
"Échecs / points bloqués" ci-dessous).

## État actuel du code

- **Site statique pur** : 10 pages `.html`, pas de build, CSS dans des `<style>` par
  page, JS vanilla inline. Pas de composants partagés — toute modification commune à
  plusieurs pages (nav, footer, fonts...) doit être répétée fichier par fichier.
- **Dépôt** : `git@github.com:marketingbyandry/site-ms.git`, branche `main`.
  Working dir local : `/Users/antoinegaussin/SITE MS`. Déploiement Vercel automatique
  à chaque push sur `main`. Domaine `www.byandry.com` (canonique, HTTPS), `byandry.com`
  redirige en 308.
- **Pages** :
  - `index.html`, `b2b.html`, `b2c.html`, `comment-ca-marche.html`, `resultats.html`,
    `blog.html` — gabarit partagé (nav `.nl`, mêmes variables CSS `--teal`/`--green`/
    `--dark`/`--cream`/`--muted`).
  - `ms-blog-article-1.html`, `ms-blog-article-2.html` — articles de blog, liés depuis
    `blog.html`.
  - `ms-strategy-calculateur.html` — outil de calcul de perte, lié depuis `blog.html`,
    `resultats.html` et une nouvelle CTA band sur `index.html`.
  - `ms-strategy-landing-2.html` — landing page publicitaire, volontairement **non
    liée** à la nav principale (page de campagne autonome).
- **Typographie** : Instrument Serif (titres/sous-titres) + Satoshi (corps de texte,
  toutes graisses 300–900). JetBrains Mono conservé volontairement pour l'affichage
  chiffré du calculateur (effet "taximètre").
- **Logo** : `assets/ms-strategy-logo.png` — version **inversée en clair** du logo
  fourni par l'utilisateur (`~/Downloads/MS Strategy logo.png`, noir/anthracite quasi
  pur, invisible sur le fond sombre du site). L'original n'est pas dans le repo ; à
  garder pour un usage futur sur fond clair (papier à en-tête, etc.).
- **Calculateur** (`ms-strategy-calculateur.html`) :
  - Prix de référence par tranche de puissance : ≤36 kVA → 85 €/MWh fixe ; >36 kVA →
    interpolation 100–120 €/MWh selon le prix saisi par le prospect.
  - Compteur "perte en temps réel" calculé sur `daysElapsed` (depuis la date de dernier
    renouvellement) + `daysRemaining` si le contrat est engagé.
  - État par défaut = démo (perte moyenne TPE/PME, cumul depuis le 1er janvier) avec
    transition animée de 3.5s vers le calcul réel dès que le prospect saisit ses données.
  - Handoff `localStorage` (`msLeadContext`, TTL 30 min, consommé une seule fois) du
    calculateur vers le formulaire Tally sur `b2b.html`.
- **Capture de leads** : formulaire **Tally.so** (form ID réel `kd15W1`) ouvert en
  popup modal (`Tally.openPopup(...)`, script `https://tally.so/widgets/embed.js` —
  attention au **pluriel** "widgets", voir échecs ci-dessous) sur `b2b.html`, `b2c.html`
  et `ms-strategy-landing-2.html`. Remplace les anciens formulaires cassés (mailto sans
  champ fichier, faux drag-and-drop client-only). Chaque déclenchement passe un champ
  caché `source` (`b2b` / `b2c` / `landing-2`) pour tracer l'origine.
- **CTA** : bandes ajoutées sur `index.html` (lien vers le calculateur + CTA de clôture
  double bouton pro/particulier) et `ms-strategy-landing-2.html` (bande "groupement
  d'achat" + carte "Et vous ?" rendue cliquable).

Tout ce qui précède est **commité et poussé sur `main`**, aucun travail local non
sauvegardé. Dernier commit : `271eb70`.

## Fichiers à éditer en priorité (si on reprend le travail)

1. **Aucun bug de code connu en attente** — tout ce qui a été livré a été vérifié
   visuellement (desktop + mobile pour les sections modifiées).
2. **Hors code, côté Tally.so (dashboard, pas un fichier du repo)** : le formulaire
   `kd15W1` affiche encore un texte d'intro placeholder ("Texte d'intro à définir") —
   à corriger par l'utilisateur directement sur tally.so.
3. **Si on reprend LinkedIn** : point d'entrée logique = `blog.html` (hub actuel des
   contenus). Bloqué faute d'URLs ou de contenu fournis par l'utilisateur — voir
   ci-dessous.
4. **Mobile QA partielle** : vérifié sur `index.html` (nav + CTA calculateur),
   `b2b.html` (bloc upload/Tally), `ms-strategy-landing-2.html` (bloc formulaire).
   **Pas encore vérifié sur mobile** : `b2c.html`, `comment-ca-marche.html`,
   `resultats.html`, `blog.html`, les deux articles, et le calculateur lui-même.

## Ce qui a été essayé et a échoué (avec la raison)

- **Screenshot pleine page via `--window-size` géant (ex. 1440×6000)** : casse le rendu
  car le hero utilise `height:100vh` — avec une fenêtre de 6000px, le hero occupe *tout*
  le viewport et masque le reste de la page. → Remplacé par un pilotage réel de Chrome
  headless via le protocole CDP (navigation + `window.scrollTo()` + capture), voir
  script `shot2.py` ci-dessous.
- **`sips --cropOffset`** pour recadrer une capture a posteriori : ordre des paramètres
  incohérent selon les essais, résultats imprévisibles. Abandonné.
- **Scroll par ancre d'URL (`page.html#id`)** pour cadrer une capture : peu fiable, les
  animations `.reveal` (IntersectionObserver) ne se déclenchaient pas de façon
  consistante avant la capture. → Remplacé par un script Python (websocket-client +
  CDP) qui navigue, calcule la position réelle de l'élément via
  `getBoundingClientRect()`, scrolle, attend, puis capture.
- **CDP sans `--remote-allow-origins=*`** : handshake WebSocket rejeté (403 Forbidden)
  par Chrome 148+. Le flag est obligatoire pour piloter Chrome headless en local
  aujourd'hui.
- **`/json/new?url` en GET** pour ouvrir un nouvel onglet CDP : échoue silencieusement
  sur les versions récentes de Chrome. Il faut la méthode **PUT**.
- **URL du script Tally `https://tally.so/widget/embed.js`** (singulier) : retourne une
  404. La bonne URL est **`https://tally.so/widgets/embed.js`** (pluriel). Trouvé en
  testant un vrai clic simulé via CDP et en constatant que `window.Tally` restait
  `undefined` — corrigé dans le commit `271eb70`.
- **Compteur démo du calculateur figé à "0,00 €"** au chargement : l'incrément par
  seconde d'une perte annuelle moyenne est imperceptible sur quelques secondes réelles.
  → Corrigé en pré-remplissant `totalAccumulated` avec le cumul depuis le 1er janvier
  (commit `85e4572`).
- **`python3` (sans chemin complet)** : cassé sur cette machine (erreurs dyld/
  CoreFoundation). Toujours utiliser `/usr/bin/python3` explicitement.
- **`git commit -m "$(cat <<'EOF' ... EOF)"`** : échoue à cause des apostrophes dans le
  message (ex. "business's"). Toujours écrire le message dans un fichier temporaire et
  utiliser `git commit -F <fichier>`.

### Outillage créé pendant la session (non persistant)

Un script `shot2.py` (Python, `websocket-client` + Chrome DevTools Protocol) a été
écrit dans le scratchpad de job (`$CLAUDE_JOB_DIR/tmp/`) pour scroller précisément
jusqu'à un sélecteur CSS et capturer un screenshot propre (desktop ou mobile selon
`width,height` passés en argument). **Ce dossier est nettoyé à la fin du job** — le
script ne survivra pas à cette session. À recréer si besoin (logique : ouvrir un onglet
via `PUT /json/new?url` avec `--remote-allow-origins=*`, `Runtime.evaluate` pour
scroller via `getBoundingClientRect()`, puis `Page.captureScreenshot`).
`websocket-client` a été installé via `pip3 install --quiet websocket-client` — à
réinstaller si absent.

## Prochaine étape

La dernière tâche en cours (interrompue par cette demande de handoff) était la
**vérification du rendu mobile** après l'intégration Tally + logo + CTA bands. Les
captures prises pour `index.html`, `b2b.html` et `ms-strategy-landing-2.html` étaient
propres (pas de débordement, boutons pleine largeur cohérents, nav/logo lisibles).

Reprendre par :
1. Terminer la vérification mobile sur les pages restantes (`b2c.html`,
   `comment-ca-marche.html`, `resultats.html`, `blog.html`, les 2 articles, le
   calculateur).
2. Rappeler à l'utilisateur de finaliser le texte d'intro sur son formulaire Tally.
3. Reprendre le sujet LinkedIn si l'utilisateur relance : lui redemander explicitement
   des URLs de posts existants ou une validation de copy à rédiger, rien n'a été
   obtenu jusqu'ici.
