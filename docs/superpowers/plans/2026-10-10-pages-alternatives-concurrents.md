# Pages « alternative à X » (lot 1) — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** publier 5 pages de publicité comparative SEO « alternative à X pour les pros » (Selectra, Opéra Énergie, Hellowatt, Kelwatt, Papernest) et une page hub, avec leur dossier de preuves, en vue d'une relecture par un avocat avant le merge.

**Architecture :** pages HTML statiques rédigées une par une sur le gabarit éditorial v2 (`comparatif-fournisseurs-electricite-pro.html`). Un fichier de test unique, `test/alternatives-concurrents.test.mjs`, est piloté par une table `ALTERNATIVES` : ajouter une page à la table rend ses tests rouges, puis la page les fait passer. Les faits sur chaque concurrent vivent dans `docs/alternatives/<concurrent>/`, et le texte de la page ne cite que ce qui s'y trouve.

**Tech Stack :** HTML statique, `node --test`, Firecrawl (collecte et captures), Vercel.

**Spec :** `docs/superpowers/specs/2026-10-10-pages-alternatives-concurrents-design.md`

## Global Constraints

- Cible : professionnels uniquement ; tous les CTA pointent vers `b2b.html#upload`.
- `<title>` ≤ 60 caractères, contient le nom du concurrent, ne contient pas « meilleure » ; meta description ≤ 155 caractères, contient le nom du concurrent et « professionnel », sans « meilleure alternative ».
- « Meilleure alternative » toujours suivi d'un profil (« … pour une PME multi-sites … »), jamais en absolu.
- Mots interdits dans le texte visible : « le meilleur » (en absolu), « le moins cher », « imbattable », « arnaque » ; « garanti » uniquement dans une phrase sur l'absence de coupure.
- Aucune comparaison de prix ; aucun logo, aucune capture ni image du concurrent sur la page ; aucun JSON-LD `Review` ou `AggregateRating`.
- Chaque fait concurrent cité figure dans `docs/alternatives/<concurrent>/faits.md` (URL source, date de collecte, citation exacte) ; une donnée sans source publique est écrite « non communiqué ».
- Chiffres M&S repris tels quels de `resultats.html` (19 % d'économies moyennes, 70M, −21/−17/−19 %), avec la mention « moyennes constatées, le résultat dépend de votre profil ».
- Faits M&S autorisés : indépendant depuis 2012, SIREN 752 139 477, premier retour sous 24 h après réception de la facture, baromètre public (ENTSO-E, CRE PEG), intervention sur contrat en cours, fenêtre idéale 12 à 24 mois avant l'échéance, aucune coupure.
- Longueur : contenu principal ≥ max(1 200 mots, 0,8 × médiane des 5 premiers résultats SERP consignée dans `serp.md`).
- Nav, footer, GTM + noscript, consentement, favicons, `analytics-loader.js`, `nav-mobile.css/js`, `speed-insights.js`, `cookie-consent.js` repris à l'identique de `comparatif-fournisseurs-electricite-pro.html`.
- Aucun merge sur `main` : PR en brouillon, merge seulement après le feu vert écrit de l'avocat.

## Review Focus

- Un « meilleure alternative » non qualifié glissé dans un paragraphe ou un H2 lors de la rédaction : le test exige « pour » dans les 80 caractères qui suivent chaque occurrence (Tâche 2).
- Date « vérifiées le » visible et `dateModified` du JSON-LD qui divergent après une mise à jour, ou date dans le futur : test d'égalité et de non-futur (Tâche 2).
- Tableau comparatif qui déborde sur mobile (390 px) : le test exige l'enveloppe `.tbl-scroll` (`overflow-x:auto`), et `npm run audit:visual` est lancé sur chaque page (Tâches 2 à 6).
- FAQ visible modifiée sans le JSON-LD, ou l'inverse : test d'égalité (Tâche 2).
- Nom accentué (« Opéra Énergie ») mal reconnu dans le title, le H1 ou le texte : tous les contrôles passent par `norm()` (Tâche 2).

---

### Task 1 : base d'intégration (PR #100 + PR #101)

**Files :**
- Modify : branche `worktree-pages-alternatives-concurrents` (merge de `origin/worktree-article-comparatif-v2`, puis de `origin/worktree-seo-courtier-pro`)

**Interfaces :**
- Produces : arbre contenant le gabarit v2, `courtier-electricite-professionnel.html`, `courtier-gaz-professionnel.html`, `courtier-ou-comparateur-energie-pro.html` et `test/seo-courtier-pro.test.mjs` (exports `read`, `norm`, `titleOf`, `metaOf`, `h1Of`, `ldNodes`, `ldTypes`, `faqVisible`, `faqLd`, `hasLink`, `TARGETS`).

- [ ] **Step 1 : merger PR #100**

Run : `git merge --no-ff origin/worktree-article-comparatif-v2`
Expected : merge sans conflit (la branche part de `main`).

- [ ] **Step 2 : merger PR #101**

Run : `git merge --no-ff origin/worktree-seo-courtier-pro`
Expected : conflits sur `achat-groupe-energie-pme-franchises.html`, `assets/search-lexicon.json`, `comparatif-fournisseurs-electricite-pro.html`, `courtier-en-energie-role.html`, `decrypter-facture-electricite-pro.html`, `pagefind/pagefind-entry.json`, `prix-fixe-vs-indexe-electricite-pro.html`.

- [ ] **Step 3 : résoudre les conflits**

Règle : pour les articles HTML, garder la version de #100 (gabarit v2), puis y réappliquer les liens de maillage ajoutés par #101 (`git diff origin/main origin/worktree-seo-courtier-pro -- <fichier>` montre les ancres à remettre). Pour `courtier-en-energie-role.html`, garder le title et le recentrage de #101 dans le gabarit de #100. Pour `assets/search-lexicon.json` et `pagefind/`, garder une version puis régénérer avec `npm run build:search`.

- [ ] **Step 4 : vérifier**

Run : `npm test`
Expected : tous les tests verts, `seo-courtier-pro.test.mjs` et `seo-articles-pages.test.mjs` compris.

- [ ] **Step 5 : commit**

```bash
git commit -m "chore: base d'intégration PR #100 + PR #101 pour les pages alternatives"
```

### Task 2 : harnais de test + page Selectra

**Files :**
- Create : `test/alternatives-concurrents.test.mjs`
- Create : `docs/alternatives/selectra/faits.md`, `serp.md`, `note-avocat.md`, `captures/`
- Create : `alternative-selectra-professionnel.html`
- Modify : `scripts/visual-check.mjs:16` (tableau `PAGES`)

**Interfaces :**
- Consumes : exports de `test/seo-courtier-pro.test.mjs` (Tâche 1).
- Produces : `export const ALTERNATIVES = { '<slug>.html': { name: string, dir: string, minWords: number } }` ; `export const visibleText = (h: string) => string` (retire `<script>`, `<style>`, balises, puis `norm`) ; `export const mainWords = (h: string) => number` (mots dans `<article>…</article>`). Classes HTML partagées par les 5 pages : `section.answer-first`, `div.tbl-scroll > table.alt-compare`, `p.alt-verified`, bloc `nav.alt-others`, FAQ `div.faq-q … span.faq-arr`.

- [ ] **Step 1 : collecte des faits Selectra**

Avec Firecrawl : pages publiques pro de Selectra (offre courtage, rémunération, « qui sommes-nous », contact). Une ligne par fait dans `faits.md` : `| critère | citation exacte | URL | date |`. Une capture par URL dans `captures/` (`firecrawl_scrape`, format screenshot, page entière) + lien Wayback si disponible. Critères à couvrir : statut, rémunération déclarée, cible, interlocuteur, délai, suivi après signature, fournisseurs consultés, ancienneté ; un critère introuvable est écrit « non communiqué ».

- [ ] **Step 2 : relevé SERP**

`firecrawl_search` sur « alternative à Selectra », « Selectra professionnel » et « Selectra avis entreprise » : 5 premiers résultats organiques, nombre de mots de chacun, médiane. Consigner dans `serp.md` avec la date. `minWords = max(1200, round(0.8 × médiane))`.

- [ ] **Step 3 : écrire les tests (rouges)**

`ALTERNATIVES` contient la seule entrée `'alternative-selectra-professionnel.html': { name: 'Selectra', dir: 'selectra', minWords: <valeur de serp.md> }`. Tests, chacun en boucle sur `ALTERNATIVES` :

```js
test('title : ≤ 60 car., nom du concurrent, sans « meilleure »', …
  assert.ok(titleOf(h).length <= 60); assert.ok(norm(titleOf(h)).includes(norm(name)));
  assert.doesNotMatch(norm(titleOf(h)), /meilleure/);
test('meta : ≤ 155 car., nom + « professionnel », sans « meilleure alternative »', …
test('H1 unique contenant « alternative a <nom> »', …
  assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
  assert.ok(norm(h1Of(h)).includes(`alternative a ${norm(name)}`));
test('canonical exact', … `<link rel="canonical" href="https://cabinetms.fr/${slug}">`
test('JSON-LD : Article, FAQPage, BreadcrumbList ; ni Review ni AggregateRating', …
test('réponse directe : section.answer-first de 40 à 60 mots', …
test('H2 « quand <nom> peut mieux vous convenir » présent', …
test('tableau : .tbl-scroll > table.alt-compare, ≥ 6 lignes, cellule concurrent sourcée', …
  // 2e <td> de chaque ligne de <tbody> : /href="https?:\/\//.test(td) || norm(td).includes('non communique')
test('mention « informations sur <nom> vérifiées le JJ/MM/AAAA » = dateModified, pas dans le futur', …
test('FAQ : 5 ou 6 questions, visibles = JSON-LD', … assert.deepEqual(faqLd(h), faqVisible(h))
test('au moins 2 CTA vers b2b.html#upload', …
test('mots interdits absents du texte visible', …
  // /le meilleur|le moins cher|imbattable|arnaque/ absent ; chaque « garanti » a « coupure » à ≤ 60 car.
test('chaque « meilleure alternative » est suivi de « pour » dans les 80 caractères', …
test('aucune <img> dont src ou alt contient le nom du concurrent', …
test('contenu principal ≥ minWords', … assert.ok(mainWords(h) >= minWords)
test('dossier de preuves : faits.md, serp.md, note-avocat.md et au moins une capture', …
test('anti-cannibalisation : aucun mot-clé de TARGETS dans le title', …
  for (const { key } of Object.values(TARGETS)) assert.ok(!norm(titleOf(h)).includes(key));
```

- [ ] **Step 4 : vérifier qu'ils échouent**

Run : `node --test test/alternatives-concurrents.test.mjs`
Expected : FAIL, « ENOENT … alternative-selectra-professionnel.html ».

- [ ] **Step 5 : rédiger le contenu (content-builder)**

Brief : spec §« Anatomie d'une page », `faits.md` comme seule source sur Selectra, contraintes globales ci-dessus. Profil cible de la réponse directe et du H2 « Pourquoi M&S Strategy est la meilleure alternative à Selectra pour … » : à choisir parmi les faits (ex. PME multi-sites avec contrat en cours qui veut un interlocuteur suivi). « Quand Selectra peut mieux vous convenir » : 2 à 3 cas tirés de ce que Selectra fait bien selon `faits.md`.

- [ ] **Step 6 : intégrer la page**

Copier la structure de `comparatif-fournisseurs-electricite-pro.html` (head, nav, footer, scripts, sommaire collant, notes de marge), y verser le contenu avec les classes de l'Interfaces block. Title : « Alternative à Selectra pour les pros : comparatif | M&S Strategy ». JSON-LD : `Article` (`dateModified` = date de collecte), `FAQPage`, `BreadcrumbList` Accueil > Alternatives (`alternatives-courtier-energie.html`) > Selectra. Pied de contenu : `<p class="alt-verified">Informations sur Selectra vérifiées le JJ/MM/AAAA à partir de ses pages publiques. Une erreur ? Écrivez-nous : msstrategy@yahoo.com</p>` (adresse affichée en texte, identique au footer).

- [ ] **Step 7 : écrire `note-avocat.md`**

Une page : chaque affirmation sur Selectra → ligne de `faits.md` + capture ; puis les formulations où « meilleure alternative » apparaît ; puis les points de doute.

- [ ] **Step 8 : vérifier**

Ajouter `'alternative-selectra-professionnel.html'` au tableau `PAGES` de `scripts/visual-check.mjs` (l. 16), puis Run : `npm test` et `npm run audit:visual`
Expected : tous verts ; pas de débordement horizontal à 390 px.

- [ ] **Step 9 : commit**

```bash
git add test/alternatives-concurrents.test.mjs docs/alternatives/selectra alternative-selectra-professionnel.html
git commit -m "feat(seo): page alternative à Selectra pour les pros + harnais de test"
```

### Tasks 3 à 6 : Opéra Énergie, Hellowatt, Kelwatt, Papernest

Une tâche par concurrent, dans cet ordre, chacune identique à la Tâche 2, étapes 1, 2 et 5 à 9, avec :

| Tâche | Slug | `name` | `dir` | Requêtes SERP |
|---|---|---|---|---|
| 3 | `alternative-opera-energie-professionnel.html` | `Opéra Énergie` | `opera-energie` | « alternative à Opéra Énergie », « Opéra Énergie avis entreprise » |
| 4 | `alternative-hellowatt-professionnel.html` | `Hellowatt` | `hellowatt` | « Hellowatt professionnel », « alternative à Hellowatt » |
| 5 | `alternative-kelwatt-professionnel.html` | `Kelwatt` | `kelwatt` | « Kelwatt professionnel », « alternative à Kelwatt » |
| 6 | `alternative-papernest-professionnel.html` | `Papernest` | `papernest` | « Papernest professionnel », « alternative à Papernest » |

**Interfaces :**
- Consumes : `ALTERNATIVES`, `visibleText`, `mainWords` et les classes HTML de la Tâche 2.
- Produces : une entrée de plus dans `ALTERNATIVES` par tâche.

Étape test propre à chaque tâche : ajouter l'entrée à `ALTERNATIVES`, lancer `node --test test/alternatives-concurrents.test.mjs` → FAIL (ENOENT), puis faire passer. Pour les comparateurs (Tâches 4 à 6), l'angle est « offre catalogue contre situation réelle », et la page pose explicitement la question de la couverture pro du comparateur en s'appuyant sur `faits.md`. Chaque tâche ajoute aussi son slug au tableau `PAGES` de `scripts/visual-check.mjs`. Commit : `feat(seo): page alternative à <nom> pour les pros`.

### Task 7 : page hub, maillage, indexation

**Files :**
- Create : `alternatives-courtier-energie.html`
- Modify : les 5 pages (bloc `nav.alt-others`), `b2b.html`, `courtier-electricite-professionnel.html`, `courtier-gaz-professionnel.html`, `comparatif-fournisseurs-electricite-pro.html`, `sitemap.xml`, `plan-du-site.html`, `llms.txt`, index de recherche
- Test : `test/alternatives-concurrents.test.mjs`

**Interfaces :**
- Consumes : `ALTERNATIVES`, `mainWords`, `hasLink`, `titleOf`, `TARGETS`.

- [ ] **Step 1 : tests (rouges)**

```js
test('hub : existe, 800 à 1 200 mots, title sans nom de concurrent ni mot-clé TARGETS', …
test('hub : lie chaque page ALTERNATIVES et courtier-ou-comparateur-energie-pro.html', …
test('chaque page : lie le hub et les 4 autres pages dans nav.alt-others', …
test('liens entrants vers le hub depuis b2b, courtier-électricité, courtier-gaz, comparatif fournisseurs', …
test('hub + 5 pages présents dans sitemap.xml, plan-du-site.html et llms.txt', …
```

- [ ] **Step 2 : vérifier qu'ils échouent**

Run : `node --test test/alternatives-concurrents.test.mjs` — Expected : FAIL sur les 5 nouveaux tests.

- [ ] **Step 3 : rédiger et intégrer le hub**

H1 « Alternatives aux plateformes de courtage et aux comparateurs d'énergie pour les pros ». Contenu : les trois modèles, le tableau par catégorie sans marque (grille de `content/parasitage-social/README.md`, telle que sur la branche PR #103), une carte par concurrent, CTA `b2b.html#upload`. Schema `Article` + `BreadcrumbList`.

- [ ] **Step 4 : maillage et indexation**

Bloc `nav.alt-others` (« Comparer avec d'autres acteurs ») sur les 5 pages. Liens entrants à ancre descriptive (pas de « cliquez ici », cf. test #101) dans les 4 pages listées. Entrées `sitemap.xml`, sections `plan-du-site.html` et `llms.txt`, puis `npm run build:search`.

- [ ] **Step 5 : vérifier**

Ajouter `'alternatives-courtier-energie.html'` à `PAGES` de `scripts/visual-check.mjs`, puis Run : `npm test` et `npm run audit:visual` — Expected : tous verts, pas de débordement à 390 px, `seo-courtier-pro.test.mjs` compris (anti-cannibalisation, ancres).

- [ ] **Step 6 : commit**

```bash
git commit -m "feat(seo): hub alternatives + maillage et indexation des pages comparatives"
```

### Task 8 : relecture et dossier avocat

**Files :**
- Create : `docs/alternatives/README.md` (index des 5 dossiers, procédure de revue tous les 6 mois)

- [ ] **Step 1 : relecture `quality-reviewer`** (contenu, juridique, SEO) sur la branche ; corriger les bloquants, puis `npm test` vert.
- [ ] **Step 2 : écrire `docs/alternatives/README.md`** : liste des dossiers, date de collecte de chacun, prochaine revue = date + 6 mois, procédure (recollecte, mise à jour de `faits.md`, de la date visible et de `dateModified`).
- [ ] **Step 3 : commit, push, PR en brouillon** : description = liste des 6 pages, lien vers chaque `note-avocat.md`, mention « ne pas merger avant le feu vert écrit de l'avocat », dépendance aux PR #100 et #101.
