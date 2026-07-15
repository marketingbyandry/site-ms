# M&S Strategy — site-ms

Site vitrine statique de M&S Strategy, courtier en énergie indépendant depuis
2012 (B2B + B2C), basé à Lattes (34). Objectif de fond : faire passer le site
d'un état "généré rapidement" à un état professionnel — architecture propre,
direction artistique unifiée, outils de conversion crédibles. Pas de roadmap
figée : le travail avance requête par requête.

Pour l'état détaillé de la dernière session et l'historique des échecs/pièges,
lire **`handoff.md`** (tenu à jour à chaque session). Pour la méthode de
travail (pipeline, skills, agents), lire **`skills.md`**.

## Déploiement et infrastructure

- **Repo** : `git@github.com:marketingbyandry/site-ms.git` — **public**.
  Ne jamais commiter de secret, token de bypass Vercel ou credential ;
  les secrets vont dans Vercel → Project Settings → Environment Variables.
- **Hébergement** : Vercel, projet `site-ms`, team `marketingbyms`.
  Déploiement automatique à chaque push sur `main`.
- **Domaine** : `www.byandry.com` (canonique, HTTPS) ; `byandry.com`
  redirige en 308.
- **Routing** : pas de `vercel.json`, pas de réécriture d'URL. Chaque page
  est servie à son nom de fichier littéral **avec l'extension `.html`**
  (`/b2b` → 404, `/b2b.html` → 200).
- **Middleware** (`middleware.js`, Vercel Edge, dépendance `@vercel/edge`) :
  split A/B 50/50 sur `/` uniquement, cookie `ms_variant` sticky 30 jours,
  bots (regex User-Agent) toujours en variante A sans cookie — protège le SEO.

## Architecture du code

Site statique pur : pages `.html` autonomes, **pas de build**, CSS dans un
`<style>` par page, JS vanilla inline. **Aucun composant partagé** — toute
modification commune (nav, footer, fonts…) doit être répétée fichier par
fichier.

| Page | Rôle |
|---|---|
| `index.html` | Home, variante A (thème sombre) |
| `index-b.html` | Home, variante B (thème clair sobre N&B) servie par le middleware |
| `b2b.html`, `b2c.html` | Pages cibles pro / particulier, upload de facture |
| `comment-ca-marche.html`, `resultats.html`, `blog.html` | Gabarit partagé avec la home |
| `ms-blog-article-1/2.html` | Articles liés depuis `blog.html` |
| `ms-strategy-calculateur.html` | Calculateur de perte (effet "taximètre") |
| `ms-strategy-landing-2.html` | Landing publicitaire autonome, **volontairement hors nav** |

## Direction artistique

- **Typographie** : Instrument Serif (titres) + Satoshi (corps, graisses
  300–900). Satoshi vient de **Fontshare**, pas de Google Fonts.
  JetBrains Mono conservé pour l'affichage chiffré du calculateur.
- **Tokens CSS** : variables `--teal`/`--green`/`--dark`/`--cream`/`--muted`
  partagées entre pages. `index-b.html` bascule les tokens en clair + un bloc
  d'override pour les overlays codés en dur. Le footer (`.sfooter`) reste
  volontairement sombre (bookend) — décision à reconfirmer avec l'utilisateur.
- **Logo** : `assets/ms-strategy-logo.png` = version inversée en clair du
  logo original (`~/Downloads/MS Strategy logo.png`, noir, hors repo, à
  garder pour les usages sur fond clair type plaquette).

## Conversion et analytics

- **Leads** : formulaire Tally.so `kd15W1` en popup modal, script
  `https://tally.so/widgets/embed.js` (**"widgets" au pluriel** — le
  singulier renvoie une 404). Chaque déclenchement passe un champ caché
  `source` (`b2b` / `b2c` / `landing-2`…). `b2b.html` pré-remplit le message
  depuis `localStorage` `msLeadContext` (TTL 30 min, consommé une fois),
  alimenté par le calculateur.
- **Analytics** : PostHog (`assets/analytics.js`, région **EU**), variante
  A/B taguée sur chaque événement, `cta_click` délégué sur
  `a.cta-btn, a.pcta, a.ncta`. Guide de lecture : `docs/posthog-setup.md`.
- **Positionnement** (vs Opéra Énergie, Mon Courtier Énergie, Selectra, tous
  sur un modèle "comparateur en libre-service à profil déclaré") : M&S
  analyse la **facture réelle** du prospect, par un humain, réponse sous 48h.
  Ne jamais nommer les concurrents dans la copy publique (risque publicité
  comparative) — décrire la catégorie ("les comparateurs en ligne classiques").

## Chantiers en cours et besoins

1. **Validations en attente (utilisateur)** : confirmer la région EU du
   projet PostHog du client ; vérifier dans PostHog → Activity qu'un clic CTA
   réel remonte en prod ; décider si le footer de la variante B passe en clair.
2. **Pages de suivi personnalisées** (spec commitée :
   `docs/superpowers/specs/2026-07-15-ms-strategy-suivi-landing-design.md`,
   branche `worktree-ms-strategy-posthog-wizard`) : `ms-strategy-suivi-b2b.html`
   + `ms-strategy-suivi-b2c.html` (personnalisation `?prenom=&conseiller=`
   injectée via `textContent`, jamais `innerHTML`) + outil interne
   `generateur-suivi.html` protégé par Basic Auth dans le middleware
   (env vars `SUIVI_TOOL_USER`/`SUIVI_TOOL_PASS` **à créer par l'utilisateur
   dans le dashboard Vercel**). Implémentation pas encore faite.
3. **"V2" sur sous-domaine alternatif** (`v2.` ou `beta.byandry.com`) :
   demandé mais **pas cadré** — repasser par `superpowers:brainstorming`
   avant tout code (périmètre, articulation avec le test A/B, DNS, projet
   Vercel).
4. **Plaquette V2 anglaise** (branche `worktree-ms-strategy-plaquette-v2`) :
   version 2 EN de la plaquette marketing, sans toucher au PDF original.
   Fonts préparées pour l'embedding ; travail de design en cours.
5. **Meta Pixel + consentement** (branche `worktree-meta-pixel-consent`) :
   spec/plan dans le worktree, non mergé.
6. **Hors code, côté utilisateur** : texte d'intro placeholder du formulaire
   Tally `kd15W1` à corriger sur tally.so ; sujet LinkedIn/blog bloqué faute
   d'URLs de posts fournies.
7. **QA mobile restante** : `b2c.html`, `comment-ca-marche.html`,
   `resultats.html`, `blog.html`, les 2 articles, le calculateur.

## Pièges connus (ne pas re-découvrir)

- **PostHog + navigateur automatisé** : headless Chrome est filtré
  (`navigator.webdriver=true`) — les événements ne remontent jamais. Tester
  l'analytics via `curl` sur l'API d'ingestion ou un vrai clic en prod,
  jamais en headless.
- **Screenshots** : le hero en `height:100vh` casse les captures à fenêtre
  géante. Piloter Chrome headless via CDP (flag `--remote-allow-origins=*`
  obligatoire, ouvrir un onglet via `PUT /json/new?url`).
- **`python3` nu est cassé sur cette machine** → toujours `/usr/bin/python3`.
- **`git commit -m` avec heredoc** échoue sur les apostrophes → écrire le
  message dans un fichier et utiliser `git commit -F`.
- Preview Vercel protégée par Vercel Authentication : utiliser un bypass
  token pour les tests, **ne jamais le commiter**.

## Conventions de travail

- Travailler dans un **git worktree** (`.claude/worktrees/…`), livrer par
  **PR draft** ; ne jamais pousser directement sur `main`.
- Specs et plans dans `docs/superpowers/specs/` et `docs/superpowers/plans/`
  (format `AAAA-MM-JJ-<sujet>.md`).
- Mettre à jour `handoff.md` en fin de session, et la note Obsidian
  `~/Documents/Obsidian Vault/Agents HQ/Projets/MS Strategy.md`
  (frontmatter `stage`/`agent`/`status`/`updated`) à chaque changement d'étape.
