# Chantier SEO « courtier » — vague 1 pro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire de `b2b.html` la page centrale « courtier en énergie pro », créer les pages `courtier-electricite-professionnel.html` et `courtier-gaz-professionnel.html`, publier 4 articles de soutien, câbler le maillage interne et livrer la checklist hors site.

**Architecture:** Site statique HTML (aucun framework, aucun build Vercel). Les nouvelles pages de service clonent le squelette de `courtier-energie-toulouse.html`. Les articles passent par le pipeline existant `scripts/build-seo-articles.mjs` (markdown → `templates/blog-article-template.html`). Un test unique, `test/seo-courtier-pro.test.mjs`, verrouille titles, H1, JSON-LD, maillage et anti-cannibalisation ; chaque tâche y ajoute ses assertions.

**Tech Stack:** HTML/CSS statiques, Node 20+ (`node --test`), Pagefind (`npm run build:search`), Playwright MCP pour le contrôle visuel.

**Spec:** `docs/superpowers/specs/2026-10-06-seo-courtier-pro-design.md`

## Global Constraints

- Worktree : `/Users/antoinegaussin/SITE MS/.claude/worktrees/seo-courtier-pro`, branche `worktree-seo-courtier-pro`, PR #101 (brouillon). Toutes les commandes partent de ce dossier.
- Baseline tests sur `main` : **220/220**. `npm test` doit être vert à la fin de chaque tâche ; si un texte testé change, mettre à jour l'assertion dans le même commit (règle CLAUDE.md).
- Une intention = une page. Mots-clés principaux réservés (comparaison après minuscules et suppression des accents) : `b2b.html` → `courtier en energie pro` ; `courtier-electricite-professionnel.html` → `courtier electricite professionnel` ; `courtier-gaz-professionnel.html` → `courtier gaz professionnel`. Aucune autre page ne doit les avoir dans son `<title>`.
- Phrase d'entité, identique partout : « M&S Strategy, courtier en énergie indépendant depuis 2012, rémunéré par les fournisseurs ».
- Ancres de liens descriptives (jamais « cliquez ici » ni « en savoir plus » seul).
- **Aucun cas client ni chiffre inventé.** Chiffres tirés du site (baromètre, `prix-kwh-professionnel-2026.html`, articles existants) ou de sources officielles (CRE, Légifrance, impots.gouv) citées ; exemples marqués « exemple illustratif ».
- Ne pas modifier : `index.html`, `b2c.html`, le design system, les formulaires, le tracking (PostHog, CAPI) ni les classes CTA existantes.
- Ne pas utiliser taste-skill sur ce repo. Pas de texte « exemple/gabarit » ni de placeholder base64 dans le HTML commité.
- Toute nouvelle page indexable inclut `<script type="module" src="assets/site-search.js"></script>` avant `</head>` ; relancer `npm run build:search` et commiter `pagefind/` + `assets/search-lexicon.json` après tout ajout ou modification de contenu.
- Langue du contenu : français, vouvoiement du lecteur, ton du site (sobre, expert, pas de superlatifs creux).
- **Conflit possible avec la PR #100** (gabarit v2 des articles, non mergée) : si #100 est mergée avant la fin, faire `git rebase origin/main` avant la tâche 4 et générer les articles avec le gabarit présent sur `main`.

---

## File Structure

| Fichier | Rôle | Tâche |
|---|---|---|
| `test/seo-courtier-pro.test.mjs` (créé) | Toutes les assertions du chantier (helpers + un bloc par tâche) | 1→6 |
| `b2b.html` (modifié) | Page centrale pro | 1, 5 |
| `courtier-electricite-professionnel.html` (créé) | Page de service électricité | 2 |
| `courtier-gaz-professionnel.html` (créé) | Page de service gaz | 3 |
| `~/Documents/Energie-Blog-Articles/articles/<slug>.md` (4 créés) | Source des articles (hors repo) | 4 |
| `content/seo-courtier/<slug>.md` (4 créés) | Copie versionnée des sources | 4 |
| `scripts/build-seo-articles.mjs` (modifié) | 4 slugs ajoutés à `CATEGORY_BY_SLUG` | 4 |
| `<slug>.html` × 4 (générés) | Articles | 4 |
| `test/seo-articles-pages.test.mjs` (modifié) | 52 → 56 slugs | 4 |
| `blog.html` (modifié) | 4 entrées `res-mini` dans « Fournisseurs & contrats » | 4 |
| 30 pages villes + 7 articles existants + `courtier-en-energie-role.html` (modifiés) | Maillage | 5 |
| `sitemap.xml`, `plan-du-site.html`, `llms.txt`, `pagefind/`, `assets/search-lexicon.json` | Indexation | 6 |
| `docs/strategie-geo-seo/2026-10-checklist-hors-site-courtier.md` (créé) | Checklist hors site | 7 |

---

### Task 1: Test harness + page centrale `b2b.html`

**Files:**
- Create: `test/seo-courtier-pro.test.mjs`
- Modify: `b2b.html` (head l.~20-40 title/meta, JSON-LD `FAQPage` l.~301, hero l.403-430, sections H2, FAQ l.598-620)
- Possibly modify: `test/b2b-compare.test.mjs`, `test/b2b-cases-grid.test.mjs`, `test/b2b-sectors-hover.test.mjs` (only if a renamed H2 is asserted)

**Interfaces:**
- Produces (dans `test/seo-courtier-pro.test.mjs`, réutilisés par les tâches 2-6) : `read(file)`, `norm(str)`, `titleOf(html)`, `metaOf(html)`, `h1Of(html)`, `ldNodes(html)`, `ldTypes(html)`, `faqVisible(html)`, `faqLd(html)`, `hasLink(html, href)`, constante `TARGETS`.

- [ ] **Step 1: Écrire le test (helpers + bloc b2b)**

Créer `test/seo-courtier-pro.test.mjs` :

```js
// test/seo-courtier-pro.test.mjs
// Chantier SEO « courtier » vague 1 — spec docs/superpowers/specs/2026-10-06-seo-courtier-pro-design.md
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

export const read = (f) => readFileSync(f, 'utf8');
export const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|’/g, "'").replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&nbsp;/g, ' ');
export const titleOf = (h) => decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
export const metaOf = (h) => decode((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
export const h1Of = (h) => decode(((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, ' '));
export const ldNodes = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((m) => JSON.parse(m[1])).flatMap((o) => o['@graph'] || [o]);
export const ldTypes = (h) => ldNodes(h).map((o) => o['@type']).flat();
export const faqVisible = (h) => [...h.matchAll(/<div class="faq-q">([\s\S]*?)<span class="faq-arr">/g)]
  .map((m) => norm(m[1].replace(/<[^>]+>/g, '')));
export const faqLd = (h) => {
  const f = ldNodes(h).find((o) => o['@type'] === 'FAQPage');
  return f ? f.mainEntity.map((q) => norm(q.name)) : [];
};
export const hasLink = (h, href) => new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(#[^"]*)?"`).test(h);

// Mot-clé principal réservé (title + meta) et forme attendue dans le H1, par page cible.
export const TARGETS = {
  'b2b.html': { key: 'courtier en energie pro', h1: 'courtier en energie pour professionnels' },
  'courtier-electricite-professionnel.html': { key: 'courtier electricite professionnel', h1: 'courtier en electricite' },
  'courtier-gaz-professionnel.html': { key: 'courtier gaz professionnel', h1: 'courtier gaz' },
};

// ---------- Tâche 1 : b2b.html ----------
test('b2b.html : title, meta et H1 portent le mot-clé pro', () => {
  const h = read('b2b.html');
  assert.ok(norm(titleOf(h)).includes(TARGETS['b2b.html'].key), `title = ${titleOf(h)}`);
  assert.ok(norm(metaOf(h)).includes('courtier en energie pro'), `meta = ${metaOf(h)}`);
  assert.ok(norm(h1Of(h)).includes(TARGETS['b2b.html'].h1), `h1 = ${h1Of(h)}`);
  assert.doesNotMatch(h, /<h1 class="sr-only"/, 'le H1 doit être visible');
});

test('b2b.html : H2 formulés comme des requêtes', () => {
  const h2s = [...read('b2b.html').matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => norm(m[1].replace(/<[^>]+>/g, '')));
  assert.ok(h2s.some((t) => t.includes('comment travaille un courtier en energie pour entreprise')), h2s.join(' | '));
  assert.ok(h2s.some((t) => t.includes('courtier energie pro, comparateur ou achat en direct')), h2s.join(' | '));
  assert.ok(h2s.some((t) => t.includes('questions frequentes sur le courtage en energie pro')), h2s.join(' | '));
});

test('b2b.html : bloc réponse d\'abord avec définition et liens électricité/gaz', () => {
  const h = read('b2b.html');
  const m = h.match(/<section class="answer-first"[\s\S]*?<\/section>/);
  assert.ok(m, 'section.answer-first manquante');
  const block = m[0];
  assert.match(norm(block), /un courtier en energie pro est/);
  assert.match(norm(block), /remunere par les fournisseurs/);
  assert.ok(hasLink(block, 'courtier-electricite-professionnel.html'));
  assert.ok(hasLink(block, 'courtier-gaz-professionnel.html'));
  const words = block.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 220 && words <= 400, `~300 mots attendus, trouvé ${words}`);
});

test('b2b.html : FAQ de 8 questions identique au JSON-LD', () => {
  const h = read('b2b.html');
  const visible = faqVisible(h);
  assert.equal(visible.length, 8, `8 questions visibles attendues, trouvé ${visible.length}`);
  assert.deepEqual(faqLd(h), visible);
});
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `node --test test/seo-courtier-pro.test.mjs`
Expected: 4 FAIL (title sans « pro », H2 absents, `section.answer-first` manquante, 4 questions au lieu de 8).

- [ ] **Step 3: Modifier `b2b.html`**

1. `<title>` → `Courtier en énergie pro : électricité & gaz pour TPE, PME, ETI | M&S Strategy` (en HTML : `&amp;` si le fichier échappe déjà les `&` dans les titles ; sinon garder le style du fichier). Mettre à jour `og:title` / `twitter:title` s'ils existent.
2. `<meta name="description">` → `Courtier en énergie pro indépendant depuis 2012 : mise en concurrence de tous les fournisseurs d'électricité et de gaz pour TPE, PME et ETI. Étude gratuite, résultat sous 24h.` (idem `og:description`).
3. H1 (l.407), garder l'accroche et ajouter un sur-titre visible dans le H1 :
```html
<h1 class="ph1 reveal d1"><span class="ph1-kicker">Courtier en énergie pour professionnels</span>Économisez votre énergie, <em>nous négocions votre contrat.</em></h1>
```
CSS à ajouter à côté de `.ph1` (l.~114) :
```css
.ph1-kicker{display:block;font-family:'Satoshi',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--teal-glow);margin-bottom:1rem}
```
4. Nouveau bloc juste après `</section>` du hero `.phero` :
```html
<!-- REPONSE D'ABORD -->
<section class="answer-first">
  <div class="af-in">
    <h2 class="sh2 reveal">Qu'est-ce qu'un courtier en énergie pro&nbsp;?</h2>
    <div class="sbody reveal d1">
      <!-- 220 à 400 mots, 4 paragraphes : -->
      <!-- P1 définition canonique, commence par « Un courtier en énergie pro est un intermédiaire indépendant qui… » -->
      <!-- P2 rémunération : « M&S Strategy, courtier en énergie indépendant depuis 2012, rémunéré par les fournisseurs » → gratuit pour l'entreprise, aucun frais quel que soit le résultat -->
      <!-- P3 pour qui : TPE, PME, ETI, mono ou multi-sites, contrats en cours (fenêtre 12 à 24 mois) -->
      <!-- P4 électricité et gaz : liens <a href="courtier-electricite-professionnel.html">courtier en électricité pour professionnels</a> et <a href="courtier-gaz-professionnel.html">courtier gaz pour entreprises</a> -->
    </div>
  </div>
</section>
```
Les commentaires ci-dessus décrivent le contenu à rédiger : les remplacer par les vrais paragraphes `<p>` (aucun commentaire guide ne reste dans le fichier commité). CSS :
```css
.answer-first{max-width:860px;margin:0 auto;padding:4rem 5vw 2rem}
.answer-first .sbody p{margin-bottom:1rem}
.answer-first a{color:var(--teal-light);text-decoration:underline;text-underline-offset:3px}
```
5. H2 : remplacer le texte de « De l'analyse à la signature… » par `Comment travaille un courtier en énergie pour entreprise` (garder `<em>` si l'ancien en avait un, sur la fin de phrase), « Sans courtier, contre avec M&S Strategy » par `Courtier énergie pro, comparateur ou achat en direct ?`, « Questions fréquentes pour les professionnels » par `Questions fréquentes sur le courtage en énergie pro`.
6. FAQ : garder les 4 questions existantes et ajouter 4 `.faq-item`, avec le même markup :
   - `Un courtier en énergie pro est-il vraiment gratuit ?`
   - `À partir de quelle consommation un courtier est-il utile pour une PME ?`
   - `Le courtier négocie-t-il l'électricité et le gaz ?` (réponse avec les liens vers les 2 pages de service)
   - `M&S Strategy est-il indépendant des fournisseurs ?`
   Ajouter les 4 `Question`/`Answer` dans le JSON-LD `FAQPage` (l.~301) avec **exactement** le même texte de question, et une réponse en texte brut identique à la réponse visible.

- [ ] **Step 4: Lancer les tests**

Run: `node --test test/seo-courtier-pro.test.mjs && npm test`
Expected: bloc b2b PASS ; suite complète verte (≥ 224). Si un test `b2b-*` casse sur un H2 renommé, mettre à jour son assertion avec le nouveau texte.

- [ ] **Step 5: Commit**

```bash
git add test/seo-courtier-pro.test.mjs b2b.html test/b2b-*.test.mjs
git commit -m "feat(seo): b2b.html devient la page centrale « courtier en énergie pro »"
```

---

### Task 2: Page `courtier-electricite-professionnel.html`

**Files:**
- Create: `courtier-electricite-professionnel.html` (copie de `courtier-energie-toulouse.html`)
- Modify: `test/seo-courtier-pro.test.mjs` (ajout d'un bloc)

**Interfaces:**
- Consumes : helpers et `TARGETS` de la tâche 1.
- Produces : la page `courtier-electricite-professionnel.html`, avec `section.service-rel` qui contient les liens sortants (réutilisée par le test de maillage de la tâche 5).

- [ ] **Step 1: Ajouter le test**

Ajouter à la fin de `test/seo-courtier-pro.test.mjs` :

```js
// ---------- Tâches 2 et 3 : pages de service ----------
const SERVICE_PAGES = {
  'courtier-electricite-professionnel.html': {
    mustLink: ['b2b.html', 'courtier-gaz-professionnel.html', 'turpe-2026-professionnels.html',
      'prix-fixe-vs-indexe-electricite-pro.html', 'puissance-souscrite-entreprise-kva.html',
      'vnu-2026-versement-nucleaire-universel.html', 'comparatif-fournisseurs-electricite-pro.html',
      'tarif-electricite-professionnel-paris.html'],
    terms: ['c5', 'c4', 'puissance souscrite', 'turpe', 'accise', 'arenh', 'prix fixe', 'indexe'],
  },
  'courtier-gaz-professionnel.html': {
    mustLink: ['b2b.html', 'courtier-electricite-professionnel.html', 'accise-electricite-gaz-2026.html',
      'gaz-professionnel-paris.html'],
    terms: ['t1', 't4', 'peg', 'ttf', 'accise', 'cta', 'echeance'],
  },
};

for (const [file, spec] of Object.entries(SERVICE_PAGES)) {
  test(`${file} : existe, title/meta/H1 ciblés`, { skip: !existsSync(file) && 'page pas encore créée' }, () => {
    const h = read(file);
    assert.ok(norm(titleOf(h)).includes(TARGETS[file].key), `title = ${titleOf(h)}`);
    assert.ok(norm(metaOf(h)).includes(TARGETS[file].key.replace(' professionnel', '')), `meta = ${metaOf(h)}`);
    assert.ok(norm(h1Of(h)).includes(TARGETS[file].h1), `h1 = ${h1Of(h)}`);
  });

  test(`${file} : JSON-LD Service + FAQPage (8 Q identiques) + BreadcrumbList`, { skip: !existsSync(file) && 'page pas encore créée' }, () => {
    const h = read(file);
    const types = ldTypes(h);
    for (const t of ['Service', 'FAQPage', 'BreadcrumbList', 'Organization']) assert.ok(types.includes(t), `${t} manquant`);
    assert.equal(faqVisible(h).length, 8);
    assert.deepEqual(faqLd(h), faqVisible(h));
    assert.match(h, /<link rel="canonical" href="https:\/\/cabinetms\.fr\/[a-z-]+\.html">/);
    assert.match(h, /<script type="module" src="assets\/site-search\.js"><\/script>/);
  });

  test(`${file} : contenu spécifique (≥ 1 200 mots, termes techniques) et liens sortants`, { skip: !existsSync(file) && 'page pas encore créée' }, () => {
    const h = read(file);
    const main = h.slice(h.indexOf('<section class="phero">'), h.lastIndexOf('</main>') > 0 ? h.lastIndexOf('</main>') : h.indexOf('<footer'));
    const text = norm(main.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' '));
    const words = text.split(' ').filter(Boolean).length;
    assert.ok(words >= 1200, `≥ 1 200 mots attendus, trouvé ${words}`);
    for (const t of spec.terms) assert.ok(text.includes(t), `terme « ${t} » absent`);
    for (const href of spec.mustLink) assert.ok(hasLink(h, href), `lien vers ${href} manquant`);
    assert.doesNotMatch(text, /toulouse|blagnac|colomiers/, 'reste du gabarit ville');
  });
}
```

- [ ] **Step 2: Lancer le test**

Run: `node --test test/seo-courtier-pro.test.mjs`
Expected: les tests des pages de service sont SKIPPED (fichiers absents) ; les tests b2b restent PASS.

- [ ] **Step 3: Créer la page**

```bash
cp courtier-energie-toulouse.html courtier-electricite-professionnel.html
```
Puis réécrire le contenu en gardant **tout le CSS, la nav, le footer, les partials** (`<!-- partial:… -->`), les scripts et les classes :
1. Head : title `Courtier électricité professionnel : TPE, PME, entreprises | M&S Strategy` ; meta description (≤ 160 car.) contenant « courtier électricité » ; canonical, `og:url`, `og:title`, `og:description` sur `https://cabinetms.fr/courtier-electricite-professionnel.html`. Vérifier que `<script type="module" src="assets/site-search.js"></script>` est présent avant `</head>`.
2. JSON-LD : remplacer l'objet `City` par `"areaServed": {"@type": "Country", "name": "France"}` ; `Service` avec `"name": "Courtier en électricité pour professionnels"` et `"serviceType": "Courtage en électricité"` ; garder `Organization` à l'identique ; ajouter :
```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
 {"@type":"ListItem","position":1,"name":"Accueil","item":"https://cabinetms.fr/"},
 {"@type":"ListItem","position":2,"name":"Professionnels","item":"https://cabinetms.fr/b2b.html"},
 {"@type":"ListItem","position":3,"name":"Courtier électricité professionnel","item":"https://cabinetms.fr/courtier-electricite-professionnel.html"}]}
```
3. Hero : `<span class="stag">Courtier électricité</span>`, H1 `Votre courtier en électricité <em>pour professionnels</em>`, sous-titre de 1 à 2 phrases, CTA `b2b.html#upload` inchangé.
4. `section.seo-intro` : H2 `Pourquoi passer par un courtier en électricité professionnel ?` + 2-3 paragraphes (définition + rémunération avec la phrase d'entité + lien vers `b2b.html`, ancre « courtier en énergie pro »). Remplacer la `def-box` « Zones couvertes » par `Segments accompagnés : C5 (≤ 36 kVA), C4 (> 36 kVA en basse tension), C2/C3 (HTA)`, en gardant la `chklist`.
5. Ajouter, après `seo-intro`, 3 sections au markup `.seo-intro` (H2 `sh2` + `sbody`), ~250-350 mots chacune :
   - `Prix fixe ou indexé : quel contrat d'électricité pour votre entreprise ?` → lien `prix-fixe-vs-indexe-electricite-pro.html`
   - `TURPE, accise, capacité : ce que le courtier peut (et ne peut pas) négocier` → liens `turpe-2026-professionnels.html`, `puissance-souscrite-entreprise-kva.html` (la part acheminement et taxes n'est pas négociable : le dire clairement)
   - `Fin de l'ARENH, VNU 2026 : ce qui change pour votre contrat` → liens `vnu-2026-versement-nucleaire-universel.html`, `comparatif-fournisseurs-electricite-pro.html`
   Chiffres et dates : reprendre **uniquement** ceux des articles liés (les relire avant de rédiger).
6. Remplacer `section.city-rel` par :
```html
<section class="city-rel service-rel">
  <p class="city-rel-title reveal">Pour aller plus loin</p>
  <ul class="city-rel-list reveal">
    <li><a href="b2b.html">Courtier en énergie pro : notre offre entreprises</a></li>
    <li><a href="courtier-gaz-professionnel.html">Courtier gaz professionnel</a></li>
    <li><a href="tarif-electricite-professionnel-paris.html">Tarif électricité professionnel à Paris</a></li>
    <li><a href="tarif-electricite-professionnel-lyon.html">Tarif électricité professionnel à Lyon</a></li>
    <li><a href="tarif-electricite-professionnel-toulouse.html">Tarif électricité professionnel à Toulouse</a></li>
    <li><a href="tarif-electricite-professionnel-montpellier.html">Tarif électricité professionnel à Montpellier</a></li>
  </ul>
</section>
```
7. FAQ : H2 `Questions fréquentes sur le courtage en électricité professionnelle`, retirer les `faq-theme` liés à la ville, exactement 8 `.faq-item` : gratuité ; différence courtier / fournisseur ; C5 vs C4 ; changer de fournisseur sans coupure ; contrat en cours / préavis ; prix fixe ou indexé ; ce qui n'est pas négociable (TURPE/taxes) ; délai de l'étude (24h). JSON-LD `FAQPage` : mêmes 8 questions mot pour mot.
8. `grep -n -i "toulouse\|blagnac\|colomiers\|balma" courtier-electricite-professionnel.html` → aucun résultat hors liens `tarif-electricite-professionnel-toulouse.html`.

- [ ] **Step 4: Lancer les tests**

Run: `node --test test/seo-courtier-pro.test.mjs && npm test`
Expected: les 3 tests électricité PASS (le lien vers `courtier-gaz-professionnel.html` est vérifié dans le HTML, il passe même si la cible n'existe pas encore) ; les 3 tests gaz restent SKIPPED. Le test `site-search` existant échoue tant que l'index n'est pas reconstruit → lancer `npm run build:search` puis `npm test`.

- [ ] **Step 5: Commit**

```bash
npm run build:search
git add courtier-electricite-professionnel.html test/seo-courtier-pro.test.mjs pagefind assets/search-lexicon.json
git commit -m "feat(seo): page courtier électricité professionnel"
```

---

### Task 3: Page `courtier-gaz-professionnel.html`

**Files:**
- Create: `courtier-gaz-professionnel.html` (copie de `courtier-electricite-professionnel.html`, déjà nettoyée de la ville)
- Test: les blocs de la tâche 2 couvrent déjà ce fichier

**Interfaces:**
- Consumes : `SERVICE_PAGES['courtier-gaz-professionnel.html']` (tâche 2).

- [ ] **Step 1: Vérifier que le test est prêt**

Run: `node --test test/seo-courtier-pro.test.mjs`
Expected: les 3 tests `courtier-gaz-professionnel.html` sont SKIPPED.

- [ ] **Step 2: Créer la page**

```bash
cp courtier-electricite-professionnel.html courtier-gaz-professionnel.html
```
Réécrire :
1. Head : title `Courtier gaz professionnel : contrats gaz entreprise | M&S Strategy` ; meta contenant « courtier gaz » ; canonical/og sur `https://cabinetms.fr/courtier-gaz-professionnel.html`.
2. JSON-LD : `Service.name` = `Courtier gaz pour professionnels`, `serviceType` = `Courtage en gaz naturel` ; BreadcrumbList position 3 = `Courtier gaz professionnel` + URL de la page.
3. Hero : stag `Courtier gaz`, H1 `Votre courtier gaz <em>pour entreprises</em>`.
4. `seo-intro` : H2 `Pourquoi passer par un courtier gaz pour votre entreprise ?` ; `def-box` `Profils accompagnés : T1 et T2 (petits sites, commerces), T3 et T4 (PME, industrie), TP (très gros consommateurs)`.
5. 3 sections (~250-350 mots chacune) :
   - `Prix fixe ou indexé PEG / TTF : comment est fixé le prix du gaz professionnel` (PEG = point d'échange de gaz France, TTF = référence européenne)
   - `Accise sur le gaz naturel, CTA, acheminement : la part non négociable` → lien `accise-electricite-gaz-2026.html`
   - `Échéance de contrat : quand renégocier son gaz` (fenêtre 12 à 24 mois, préavis, reconduction tacite)
6. `service-rel` : liens `b2b.html` (ancre « Courtier en énergie pro : notre offre entreprises »), `courtier-electricite-professionnel.html` (« Courtier électricité professionnel »), `gaz-professionnel-paris.html`, `gaz-professionnel-lyon.html`, `gaz-professionnel-toulouse.html`, `gaz-professionnel-montpellier.html` (« Gaz professionnel à [Ville] »).
7. FAQ : H2 `Questions fréquentes sur le courtage en gaz professionnel`, 8 questions : gratuité ; T1-T4 / TP ; PEG vs TTF ; changer de fournisseur de gaz sans coupure ; contrat en cours ; prix fixe ou indexé ; ce qui n'est pas négociable ; délai (24h). JSON-LD mot pour mot.
8. Supprimer tout reste de l'électricité qui ne concerne pas le gaz (`grep -n -i "turpe\|arenh\|kva" courtier-gaz-professionnel.html` → aucun résultat, sauf dans le lien vers la page électricité).

- [ ] **Step 3: Lancer les tests**

Run: `npm run build:search && node --test test/seo-courtier-pro.test.mjs && npm test`
Expected: tous les tests électricité et gaz PASS ; suite complète verte.

- [ ] **Step 4: Commit**

```bash
git add courtier-gaz-professionnel.html pagefind assets/search-lexicon.json
git commit -m "feat(seo): page courtier gaz professionnel"
```

---

### Task 4: Les 4 articles de soutien

**Files:**
- Create: `~/Documents/Energie-Blog-Articles/articles/{courtier-energie-gratuit-remuneration,courtier-ou-comparateur-energie-pro,choisir-courtier-energie-criteres-pieges,courtage-energie-tpe-pme}.md`
- Create: `content/seo-courtier/` (copie identique des 4 `.md`)
- Modify: `scripts/build-seo-articles.mjs` (`CATEGORY_BY_SLUG`)
- Create (généré): les 4 `<slug>.html` à la racine
- Modify: `test/seo-articles-pages.test.mjs:9-10` (52 → 56)
- Modify: `blog.html` (bloc « Fournisseurs & contrats », l.~359)
- Modify: `test/seo-courtier-pro.test.mjs`

**Interfaces:**
- Consumes : `buildArticleData(slug, markdown)`, `renderArticleHtml(template, data)`, `TEMPLATE_PATH` (exportés par `scripts/build-seo-articles.mjs`) ; `loadPartials()`, `applyPartials()` (exportés par `scripts/build-partials.mjs`).
- Produces : constante `ARTICLES` (liste des 4 slugs) dans le test, réutilisée par la tâche 5.

Format markdown attendu par le parseur (voir `~/Documents/Energie-Blog-Articles/articles/courtier-en-energie-role.md`) : `# Titre` ; paragraphe(s) d'intro (le 1er devient meta description et chapô) ; sections `## …` ; listes `- ` ; gras `**…**` ; liens internes **uniquement** au format `[ancre](slug.md)` (convertis en `slug.html`) ; **la dernière section `##` doit se terminer par un paragraphe CTA** (il devient le bloc CTA de fin). Pas de tableau markdown (le parseur ne les gère pas) : faire les comparaisons en listes.

- [ ] **Step 1: Ajouter le test**

```js
// ---------- Tâche 4 : articles ----------
export const ARTICLES = ['courtier-energie-gratuit-remuneration', 'courtier-ou-comparateur-energie-pro',
  'choisir-courtier-energie-criteres-pieges', 'courtage-energie-tpe-pme'];

for (const slug of ARTICLES) {
  test(`article ${slug} : généré, lié à b2b, source versionnée, listé dans blog.html`, () => {
    assert.ok(existsSync(`${slug}.html`), `${slug}.html absent`);
    assert.ok(existsSync(`content/seo-courtier/${slug}.md`), 'copie markdown versionnée absente');
    const h = read(`${slug}.html`);
    assert.ok(hasLink(h, 'b2b.html'), 'lien vers b2b.html manquant');
    const words = h.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 1200, `≥ 1 200 mots attendus, trouvé ${words}`);
    for (const t of Object.values(TARGETS)) assert.ok(!norm(titleOf(h)).includes(t.key), `title cannibalise « ${t.key} »`);
    assert.ok(hasLink(read('blog.html'), `${slug}.html`), 'absent de blog.html');
  });
}
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `node --test test/seo-courtier-pro.test.mjs`
Expected: 4 FAIL (`.html absent`).

- [ ] **Step 3: Rédiger les 4 markdown**

Pour chacun : 1 200 à 1 800 mots, chapô qui répond directement à la question, H2 formulés comme des questions, au moins 2 liens `[…](b2b.md)` avec des ancres variées (« courtier en énergie pro », « notre accompagnement des entreprises »), et la dernière section terminée par un paragraphe CTA vers l'étude gratuite.

| Fichier | Titre `#` | H2 minimum | Liens internes obligatoires |
|---|---|---|---|
| `courtier-energie-gratuit-remuneration.md` | Un courtier en énergie est-il gratuit ? Comment il est rémunéré | Qui paie le courtier ? / Combien touche un courtier sur un contrat ? (ordre de grandeur sans chiffre inventé : commission intégrée au prix du kWh, en €/MWh, versée par le fournisseur) / Est-ce que ça renchérit mon contrat ? / Comment vérifier la transparence d'un courtier ? / Demander une étude gratuite | `b2b.md`, `courtier-en-energie-role.md`, `choisir-courtier-energie-criteres-pieges.md` |
| `courtier-ou-comparateur-energie-pro.md` | Courtier ou comparateur d'énergie pro : lequel choisir pour votre entreprise ? | Qu'est-ce qu'un comparateur d'énergie professionnel ? / Qu'apporte un courtier en plus ? / Courtier, comparateur ou achat en direct : le comparatif (liste critère par critère : prix obtenu, accompagnement, multi-sites, suivi des échéances, temps passé) / Quel canal pour quelle entreprise ? / Passer à l'action | `b2b.md`, `comparatif-fournisseurs-electricite-pro.md`, `courtier-electricite-professionnel` (lien HTML direct `[…](courtier-electricite-professionnel.md)` : le parseur le convertit en `.html`) |
| `choisir-courtier-energie-criteres-pieges.md` | Comment choisir son courtier en énergie : 7 critères et les pièges à éviter | Les 7 critères (indépendance, nombre de fournisseurs consultés, transparence de la rémunération, ancienneté, suivi après signature, couverture électricité + gaz, avis vérifiables) / Les pièges (démarchage agressif, signature sous pression, mandat exclusif, engagement caché, « tarif réglementé » fantôme) / Les questions à poser avant de signer / Faire le bon choix | `b2b.md`, `courtier-energie-gratuit-remuneration.md`, `courtier-electricite-professionnel.md` |
| `courtage-energie-tpe-pme.md` | Courtage en énergie pour TPE et PME : ce que ça change vraiment | Le courtage en énergie, c'est pour les petites entreprises aussi ? / TPE : contrats C5 et gaz T1-T2 / PME : contrats C4 et gaz T2-T3 / À partir de quand le courtage est-il rentable ? (exemple illustratif, marqué comme tel, basé sur les prix de `prix-kwh-professionnel-2026`) / Multi-sites et franchises / Lancer son étude | `b2b.md`, `courtier-electricite-professionnel.md`, `courtier-gaz-professionnel.md`, `achat-groupe-energie-pme-franchises.md` |

Écrire chaque fichier dans `~/Documents/Energie-Blog-Articles/articles/`, puis :
```bash
mkdir -p content/seo-courtier
cp ~/Documents/Energie-Blog-Articles/articles/{courtier-energie-gratuit-remuneration,courtier-ou-comparateur-energie-pro,choisir-courtier-energie-criteres-pieges,courtage-energie-tpe-pme}.md content/seo-courtier/
```

- [ ] **Step 4: Enregistrer les slugs et générer uniquement ces 4 articles**

Dans `scripts/build-seo-articles.mjs`, ajouter à `CATEGORY_BY_SLUG` (ordre alphabétique, comme le reste de l'objet) :
```js
  'choisir-courtier-energie-criteres-pieges': 'Fournisseurs & contrats',
  'courtage-energie-tpe-pme': 'Fournisseurs & contrats',
  'courtier-energie-gratuit-remuneration': 'Fournisseurs & contrats',
  'courtier-ou-comparateur-energie-pro': 'Fournisseurs & contrats',
```
Générer **seulement** les 4 nouveaux (ne pas lancer le build complet : il réécrirait les 52 articles existants, dont certains sont retouchés à la main) :
```bash
node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
import { TEMPLATE_PATH, buildArticleData, renderArticleHtml } from './scripts/build-seo-articles.mjs';
import { loadPartials, applyPartials } from './scripts/build-partials.mjs';
const tpl = applyPartials(readFileSync(TEMPLATE_PATH, 'utf8'), loadPartials());
for (const slug of ['courtier-energie-gratuit-remuneration','courtier-ou-comparateur-energie-pro','choisir-courtier-energie-criteres-pieges','courtage-energie-tpe-pme']) {
  const md = readFileSync('content/seo-courtier/' + slug + '.md', 'utf8');
  writeFileSync(slug + '.html', renderArticleHtml(tpl, buildArticleData(slug, md)));
  console.log('ok', slug);
}"
```
Expected: 4 lignes `ok <slug>`.

- [ ] **Step 5: Mettre à jour le compteur et `blog.html`**

`test/seo-articles-pages.test.mjs` l.9-10 :
```js
test('les 56 slugs du corpus SEO sont bien référencés', () => {
  assert.equal(SLUGS.length, 56);
```
`blog.html`, sous `<p class="res-label …">Fournisseurs &amp; contrats</p>`, en tête de la liste, 4 blocs au format existant (titre = le `#` du markdown, accroche = début du chapô tronqué à ~105 caractères + `…`, temps de lecture = `readingTime` affiché dans l'article généré) :
```html
    <a href="courtier-energie-gratuit-remuneration.html" class="res-mini reveal">
      <span class="res-mini-text">
        <span class="res-mini-title">Un courtier en énergie est-il gratuit ? Comment il est rémunéré</span>
        <span class="res-mini-hook">[105 premiers caractères du chapô]…</span>
      </span>
      <span class="res-mini-read">[N] min</span>
    </a>
```
(les crochets sont remplis avec les vraies valeurs de chaque article, rien entre crochets ne reste dans le fichier).

- [ ] **Step 6: Lancer les tests**

Run: `npm run build:search && node --test test/seo-courtier-pro.test.mjs && npm test`
Expected: les 4 tests articles PASS ; `seo-articles-pages` PASS avec 56 ; suite complète verte.

- [ ] **Step 7: Commit**

```bash
git add content/seo-courtier scripts/build-seo-articles.mjs courtier-energie-gratuit-remuneration.html courtier-ou-comparateur-energie-pro.html choisir-courtier-energie-criteres-pieges.html courtage-energie-tpe-pme.html test/seo-articles-pages.test.mjs test/seo-courtier-pro.test.mjs blog.html pagefind assets/search-lexicon.json
git commit -m "feat(seo): 4 articles de soutien courtier (gratuité, comparateur, choix, TPE/PME)"
```

---

### Task 5: Maillage interne

**Files:**
- Modify: `b2b.html` (bloc « Pour aller plus loin »)
- Modify: `courtier-energie-{paris,lille,strasbourg,lyon,rennes,nantes,bordeaux,toulouse,montpellier,marseille}.html` (`ul.city-rel-list`)
- Modify: `gaz-professionnel-<ville>.html` × 10 et `tarif-electricite-professionnel-<ville>.html` × 10 (`ul.rel-list`)
- Modify: `courtier-en-energie-role.html` (title + lien) et 6 articles existants : `comparatif-fournisseurs-electricite-pro.html`, `prix-fixe-vs-indexe-electricite-pro.html`, `resilier-contrat-electricite-entreprise.html`, `decrypter-facture-electricite-pro.html`, `turpe-2026-professionnels.html`, `achat-groupe-energie-pme-franchises.html`, **et** leurs `.md` sources dans `~/Documents/Energie-Blog-Articles/articles/` (même phrase, pour qu'une future régénération ne perde pas le lien)
- Modify: `test/seo-courtier-pro.test.mjs`

**Interfaces:**
- Consumes : `ARTICLES`, `hasLink`, `TARGETS`.

- [ ] **Step 1: Ajouter le test**

```js
// ---------- Tâche 5 : maillage ----------
const CITIES = ['paris', 'lille', 'strasbourg', 'lyon', 'rennes', 'nantes', 'bordeaux', 'toulouse', 'montpellier', 'marseille'];

test('triangle des pages de service', () => {
  const b2b = read('b2b.html');
  assert.ok(hasLink(b2b, 'courtier-electricite-professionnel.html'));
  assert.ok(hasLink(b2b, 'courtier-gaz-professionnel.html'));
  for (const slug of ARTICLES) assert.ok(hasLink(b2b, `${slug}.html`), `b2b.html → ${slug}`);
});

test('pages villes → pages de service', () => {
  for (const c of CITIES) {
    const courtier = read(`courtier-energie-${c}.html`);
    assert.ok(hasLink(courtier, 'b2b.html'), `courtier-energie-${c} → b2b`);
    assert.ok(hasLink(courtier, 'courtier-electricite-professionnel.html'), `courtier-energie-${c} → électricité`);
    assert.ok(hasLink(read(`gaz-professionnel-${c}.html`), 'courtier-gaz-professionnel.html'), `gaz-professionnel-${c} → gaz`);
    assert.ok(hasLink(read(`tarif-electricite-professionnel-${c}.html`), 'courtier-electricite-professionnel.html'), `tarif-${c} → électricité`);
  }
});

test('articles existants proches → page de service', () => {
  const map = {
    'courtier-en-energie-role.html': 'b2b.html',
    'comparatif-fournisseurs-electricite-pro.html': 'courtier-electricite-professionnel.html',
    'prix-fixe-vs-indexe-electricite-pro.html': 'courtier-electricite-professionnel.html',
    'resilier-contrat-electricite-entreprise.html': 'courtier-electricite-professionnel.html',
    'decrypter-facture-electricite-pro.html': 'courtier-electricite-professionnel.html',
    'turpe-2026-professionnels.html': 'courtier-electricite-professionnel.html',
    'achat-groupe-energie-pme-franchises.html': 'b2b.html',
  };
  for (const [file, href] of Object.entries(map)) assert.ok(hasLink(read(file), href), `${file} → ${href}`);
});

test('courtier-en-energie-role.html recentré sur la définition', () => {
  assert.match(norm(titleOf(read('courtier-en-energie-role.html'))), /^qu'est-ce qu'un courtier en energie/);
});

test('aucune ancre « cliquez ici » sur les liens du chantier', () => {
  for (const f of ['b2b.html', 'courtier-electricite-professionnel.html', 'courtier-gaz-professionnel.html', ...ARTICLES.map((s) => `${s}.html`)]) {
    assert.doesNotMatch(norm(read(f)), />\s*(cliquez ici|en savoir plus)\s*</, f);
  }
});
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `node --test test/seo-courtier-pro.test.mjs`
Expected: FAIL sur « triangle » (articles non liés depuis b2b), « pages villes », « articles existants », « role ».

- [ ] **Step 3: `b2b.html` : bloc « Pour aller plus loin »**

Juste avant `<section class="faq-section">` :
```html
<section class="city-rel">
  <p class="city-rel-title reveal">Pour aller plus loin</p>
  <ul class="city-rel-list reveal">
    <li><a href="courtier-electricite-professionnel.html">Courtier électricité professionnel</a></li>
    <li><a href="courtier-gaz-professionnel.html">Courtier gaz professionnel</a></li>
    <li><a href="courtier-energie-gratuit-remuneration.html">Un courtier en énergie est-il gratuit ?</a></li>
    <li><a href="courtier-ou-comparateur-energie-pro.html">Courtier ou comparateur d'énergie pro</a></li>
    <li><a href="choisir-courtier-energie-criteres-pieges.html">Choisir son courtier en énergie</a></li>
    <li><a href="courtage-energie-tpe-pme.html">Courtage en énergie pour TPE et PME</a></li>
  </ul>
</section>
```
Si `b2b.html` n'a pas encore les styles `.city-rel*`, copier les 4 règles `.city-rel`, `.city-rel-title`, `.city-rel-list`, `.city-rel-list a` (+ `:hover`, `::before`) depuis `courtier-energie-toulouse.html`.

- [ ] **Step 4: Pages villes (script, idempotent)**

```bash
node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
const CITIES = ['paris','lille','strasbourg','lyon','rennes','nantes','bordeaux','toulouse','montpellier','marseille'];
const add = (file, anchorRe, li) => {
  let h = readFileSync(file, 'utf8');
  if (h.includes(li.match(/href=\"([^\"]+)\"/)[1] + '\"')) return console.log('déjà', file);
  const m = h.match(anchorRe); if (!m) throw new Error('liste introuvable: ' + file);
  h = h.replace(anchorRe, m[0] + '\n' + li); writeFileSync(file, h); console.log('ok', file);
};
for (const c of CITIES) {
  add('courtier-energie-' + c + '.html', /<ul class=\"city-rel-list reveal\">/, '    <li><a href=\"b2b.html\">Courtier en énergie pro pour entreprises</a></li>\n    <li><a href=\"courtier-electricite-professionnel.html\">Courtier électricité professionnel</a></li>');
  add('gaz-professionnel-' + c + '.html', /<ul class=\"rel-list\">/, '        <li><a href=\"courtier-gaz-professionnel.html\">Courtier gaz professionnel</a></li>');
  add('tarif-electricite-professionnel-' + c + '.html', /<ul class=\"rel-list\">/, '        <li><a href=\"courtier-electricite-professionnel.html\">Courtier électricité professionnel</a></li>');
}"
```
Expected: 30 lignes `ok …`. Note : la garde `déjà` sur `courtier-energie-*` ne teste que le premier lien (`b2b.html`), qui y figure peut-être déjà ailleurs dans la page. Si un fichier affiche `déjà`, vérifier avec `grep -c courtier-electricite-professionnel courtier-energie-<ville>.html` et ajouter le `<li>` électricité à la main si le compte est 0.

- [ ] **Step 5: Articles existants (HTML + markdown source)**

Pour chacun des 6 articles, insérer une phrase dans le paragraphe le plus pertinent du corps (pas dans le CTA). Dans le `.html`, le lien est au format `<a href="…" class="ilink">ancre</a>` ; dans le `.md` source, la même phrase au format `[ancre](slug.md)` :

| Article | Phrase à insérer (ancre en gras) |
|---|---|
| `comparatif-fournisseurs-electricite-pro` | « Pour éviter de comparer seul des offres hétérogènes, un **courtier électricité professionnel** met tous les fournisseurs en concurrence sur une base identique. » |
| `prix-fixe-vs-indexe-electricite-pro` | « C'est précisément l'arbitrage sur lequel un **courtier en électricité pour professionnels** vous accompagne, selon votre profil de risque. » |
| `resilier-contrat-electricite-entreprise` | « Avant de résilier, un **courtier électricité professionnel** peut vérifier vos dates de préavis et préparer l'offre de remplacement. » |
| `decrypter-facture-electricite-pro` | « Cette lecture ligne par ligne est la première étape du travail d'un **courtier électricité professionnel**. » |
| `turpe-2026-professionnels` | « Le TURPE n'est pas négociable, mais la part fourniture l'est : c'est le rôle d'un **courtier électricité professionnel**. » |
| `achat-groupe-energie-pme-franchises` | « Un **courtier en énergie pro** peut consolider ces volumes multi-sites pour peser face aux fournisseurs. » → `b2b.html` |

Lien des 5 premières lignes → `courtier-electricite-professionnel.html` ; la 6ᵉ → `b2b.html`.

`courtier-en-energie-role.html` : `<title>` → `Qu'est-ce qu'un courtier en énergie ? Rôle, rémunération, intérêt | M&S Strategy` (et `og:title`) ; ajouter dans la section « Pourquoi passer par un courtier plutôt que négocier seul » : « Découvrez comment nous accompagnons les entreprises en tant que <a href="b2b.html" class="ilink">courtier en énergie pro</a>. » ; même modification dans `~/Documents/Energie-Blog-Articles/articles/courtier-en-energie-role.md` (le titre `#` reste celui du H1 : ne changer que le `<title>` HTML, pour garder le H1 actuel).

- [ ] **Step 6: Lancer les tests**

Run: `npm run build:search && npm test`
Expected: tous les tests de maillage PASS ; suite complète verte.

- [ ] **Step 7: Commit**

```bash
git add b2b.html test/seo-courtier-pro.test.mjs
git add courtier-energie-*.html gaz-professionnel-*.html tarif-electricite-professionnel-*.html courtier-en-energie-role.html comparatif-fournisseurs-electricite-pro.html prix-fixe-vs-indexe-electricite-pro.html resilier-contrat-electricite-entreprise.html decrypter-facture-electricite-pro.html turpe-2026-professionnels.html achat-groupe-energie-pme-franchises.html pagefind assets/search-lexicon.json
git commit -m "feat(seo): maillage interne vers les 3 pages de service courtier"
```
(Vérifier avec `git status` qu'aucun fichier hors liste n'est indexé avant de commiter.)

---

### Task 6: Indexation (sitemap, plan du site, llms.txt) + garde-fou anti-cannibalisation

**Files:**
- Modify: `sitemap.xml`, `plan-du-site.html`, `llms.txt`
- Modify: `test/seo-courtier-pro.test.mjs`

- [ ] **Step 1: Ajouter le test**

```js
// ---------- Tâche 6 : indexation + anti-cannibalisation ----------
const NEW_PAGES = ['courtier-electricite-professionnel.html', 'courtier-gaz-professionnel.html', ...ARTICLES.map((s) => `${s}.html`)];

test('nouvelles pages dans sitemap.xml, plan-du-site.html et llms.txt', () => {
  const sitemap = read('sitemap.xml'), plan = read('plan-du-site.html'), llms = read('llms.txt');
  for (const p of NEW_PAGES) {
    assert.ok(sitemap.includes(`<loc>https://cabinetms.fr/${p}</loc>`), `sitemap : ${p}`);
    assert.ok(hasLink(plan, p), `plan-du-site : ${p}`);
  }
  for (const p of ['courtier-electricite-professionnel.html', 'courtier-gaz-professionnel.html']) {
    assert.ok(llms.includes(`https://cabinetms.fr/${p}`), `llms.txt : ${p}`);
  }
});

test('anti-cannibalisation : chaque mot-clé principal n\'est dans le title que de sa page', () => {
  const files = readdirSync('.').filter((f) => f.endsWith('.html'));
  for (const [target, { key }] of Object.entries(TARGETS)) {
    const offenders = files.filter((f) => f !== target && norm(titleOf(read(f))).includes(key));
    assert.deepEqual(offenders, [], `« ${key} » réservé à ${target}`);
  }
});
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `node --test test/seo-courtier-pro.test.mjs`
Expected: FAIL « sitemap : courtier-electricite-professionnel.html ». L'anti-cannibalisation passe déjà (vérifié le 2026-10-06 : aucune collision).

- [ ] **Step 3: Implémenter**

`sitemap.xml` : 6 blocs au format existant, juste après le bloc `b2b.html` :
```xml
  <url>
    <loc>https://cabinetms.fr/courtier-electricite-professionnel.html</loc>
    <lastmod>2026-10-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```
(idem `courtier-gaz-professionnel.html` en `0.8` ; les 4 articles en `0.6`). Passer aussi le `<lastmod>` de `b2b.html` et de `courtier-en-energie-role.html` à `2026-10-06`. Utiliser la date du jour réel de l'exécution si elle diffère.

`plan-du-site.html`, colonne « Nos offres & votre accompagnement » (l.~221), après `Professionnels (B2B)` :
```html
    <a href="courtier-electricite-professionnel.html">Courtier électricité professionnel</a>
    <a href="courtier-gaz-professionnel.html">Courtier gaz professionnel</a>
```
Ajouter les 4 articles dans la colonne qui liste déjà les articles « Fournisseurs & contrats » (repérer `courtier-en-energie-role.html` dans `plan-du-site.html` et les placer à côté, avec le même markup).

`llms.txt`, juste après la ligne `- [Professionnels (TPE, PME, ETI)](https://cabinetms.fr/b2b.html)…` :
```
- [Courtier électricité professionnel](https://cabinetms.fr/courtier-electricite-professionnel.html) : courtage en électricité pour TPE, PME et entreprises (C5, C4, HTA), prix fixe ou indexé, TURPE et fin de l'ARENH.
- [Courtier gaz professionnel](https://cabinetms.fr/courtier-gaz-professionnel.html) : courtage en gaz naturel pour entreprises (profils T1 à T4, TP), indexation PEG/TTF, échéances de contrat.
```
Si `llms.txt` liste des articles, y ajouter les 4 articles au même format.

- [ ] **Step 4: Lancer les tests**

Run: `npm run build:search && npm test`
Expected: suite complète verte. Noter le total (attendu ≈ 220 + 4 (b2b) + 6 (service) + 4 (articles) + 5 (maillage) + 2 = 241).

- [ ] **Step 5: Commit**

```bash
git add sitemap.xml plan-du-site.html llms.txt test/seo-courtier-pro.test.mjs pagefind assets/search-lexicon.json
git commit -m "feat(seo): indexation des pages courtier + garde-fou anti-cannibalisation"
```

---

### Task 7: Checklist hors site

**Files:**
- Create: `docs/strategie-geo-seo/2026-10-checklist-hors-site-courtier.md`

Pas de test automatisé (document). Contrôle : relecture + vérification de chaque URL citée.

- [ ] **Step 1: Recherches (WebSearch / firecrawl)**

1. Catégories Google Business Profile disponibles en français proches de « courtier en énergie » : chercher la liste officielle ou une liste à jour des catégories GBP et retenir la catégorie principale qui existe réellement, plus 1 ou 2 secondaires. Ne jamais citer une catégorie non vérifiée.
2. 10 à 15 cibles de liens, chacune vérifiée par une visite de l'URL : annuaires ou comparatifs de courtiers en énergie, articles « meilleurs courtiers en énergie », CCI Hérault / Occitanie, médias PME/TPE (rubrique énergie), fédérations des verticaux couverts par le blog (boulangerie, hôtellerie-restauration, hôtellerie de plein air). Exclure tout site qui vend des liens.

- [ ] **Step 2: Rédiger le document**

Structure exacte :
```markdown
# Checklist hors site — chantier SEO « courtier » (vague 1)

Phrase d'entité à utiliser partout : « M&S Strategy, courtier en énergie indépendant depuis 2012, rémunéré par les fournisseurs. »

## 1. Google Business Profile
- [ ] Catégorie principale : <catégorie vérifiée> ; secondaires : <…>
- [ ] Description (≤ 750 caractères) : <texte prêt à coller>
- [ ] Services : Courtier électricité professionnel (→ URL), Courtier gaz professionnel (→ URL), Étude gratuite sous 24h (→ b2b.html#upload)
- [ ] 4 posts (un par article) : <titre + 2-3 phrases + lien>, ×4
- [ ] Demande d'avis : <message SMS/e-mail prêt à envoyer + où trouver le lien d'avis dans GBP>. Objectif : 10 avis.

## 2. Cohérence NAP
| Plateforme | URL | Action | Fait |
(Societe.com, PagesJaunes, LinkedIn entreprise, Bing Places, Apple Business Connect) — nom, adresse, téléphone et description identiques ; noter ici les valeurs officielles à recopier.

## 3. Cibles de liens (10-15)
| # | Site | URL | Pourquoi pertinent | Type de lien | Message d'approche |
(un message d'approche rédigé et personnalisé par cible, 80-120 mots)

## 4. Suivi
- [ ] J+30 : export Search Console, filtre « courtier » → comparer à la baseline du spec §2
- [ ] J+60 : idem + décision vague 2
```
Les `<…>` ci-dessus sont à remplir avec le vrai contenu : aucun chevron ne reste dans le fichier final. Adresse et téléphone : les reprendre du footer / `mentions-legales.html` du site, sans les inventer.

- [ ] **Step 3: Vérification**

Run: `grep -n "<[a-zéè ]*>" docs/strategie-geo-seo/2026-10-checklist-hors-site-courtier.md`
Expected: aucun résultat (plus aucun champ à remplir).

- [ ] **Step 4: Commit**

```bash
git add docs/strategie-geo-seo/2026-10-checklist-hors-site-courtier.md
git commit -m "docs(seo): checklist hors site du chantier courtier"
```

---

### Task 8: Vérification visuelle et finalisation de la PR

**Files:** aucun nouveau (corrections éventuelles uniquement)

- [ ] **Step 1: Contrôle visuel Playwright**

Servir le site : `npx --yes serve -l 4173 .` (en arrière-plan). Avec le Playwright MCP, pour `b2b.html`, `courtier-electricite-professionnel.html`, `courtier-gaz-professionnel.html` et `courtier-energie-gratuit-remuneration.html` : capture desktop 1440×900 et mobile 390×844, console sans erreur, pas de scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`), sur-titre du H1 lisible, FAQ qui s'ouvre au clic.
Expected: aucun défaut ; sinon corriger, relancer `npm test`, commiter `fix(seo): …`.

- [ ] **Step 2: Suite complète**

Run: `npm test`
Expected: 0 fail ; reporter le total exact.

- [ ] **Step 3: Pousser et mettre à jour la PR #101**

```bash
git push
gh pr edit 101 --title "Chantier SEO « courtier en énergie » — vague 1 pro" --body-file - <<'EOF'
Vague 1 du chantier SEO « courtier » (spec : docs/superpowers/specs/2026-10-06-seo-courtier-pro-design.md).

- b2b.html → page centrale « courtier en énergie pro » (title, H1 visible, H2 requêtes, bloc réponse d'abord, FAQ 8 Q)
- Nouvelles pages : courtier-electricite-professionnel.html, courtier-gaz-professionnel.html
- 4 articles : gratuité, courtier vs comparateur, choisir son courtier, courtage TPE/PME
- Maillage : 30 pages villes + 7 articles existants → pages de service
- sitemap / plan du site / llms.txt / index Pagefind
- Checklist hors site : docs/strategie-geo-seo/2026-10-checklist-hors-site-courtier.md
- Tests : test/seo-courtier-pro.test.mjs (anti-cannibalisation incluse)

À valider sur la preview Vercel avant merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr checks 101 --watch
```
Expected: checks verts. Laisser la PR en brouillon : le merge se fait après la validation d'Antoine sur la preview, et après la relecture `quality-reviewer`.
