# Footer villes & pages SEO locales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 city landing pages targeting SEO for M&S Strategy's energy brokerage
business (inspired by prestigeassurance.fr's city-page architecture), wire them into
the site's shared footer via a new "Villes" column, add a `plan-du-site.html` page,
and register everything in `sitemap.xml`.

**Architecture:** The site is static HTML with no build step and no templating — each
page is a self-contained `.html` file with its own inline `<style>` block, deployed
as-is to Vercel. New pages are created by copying `comment-ca-marche.html` (the
simplest existing secondary page) and editing it with exact string replacements. The
footer (`<footer class="sfooter">`, a 3-column CSS grid) is duplicated verbatim across
9 existing files; it becomes a 4-column grid with a new "Villes" column. The 10 city
pages reuse this same footer, so they must be generated *after* the footer patch so
they inherit it automatically.

**Tech Stack:** Static HTML/CSS/vanilla JS (no framework, no build step — matches the
rest of `~/SITE MS`). Python 3 is used once, ad hoc, to generate the 10 near-identical
city pages from a data table — the script itself is not committed to the repo.

## Global Constraints

- Domain used everywhere (canonical URLs, JSON-LD, sitemap): `https://www.byandry.com/`
  (matches existing `sitemap.xml` entries).
- No fabricated statistics, client counts, or reviews for any city. Local
  differentiation uses only broadly known, uncontroversial economic facts (e.g.
  "Toulouse, aéronautique et spatial"). No customer-reviews block is added (no Google
  Business Profile exists yet — explicit scope-out from the design).
- No opening-hours block (explicit scope-out from the design).
- `middleware.js` / the A/B cookie logic is not touched by this work.
- `robots.txt` is not touched (its `Disallow: /index-b.html` line is a pre-existing
  loose end unrelated to this work — out of scope).
- Every new/modified page keeps the exact same `<head>` boilerplate (fonts, CSS custom
  properties, nav, cookie-consent script tags) as `comment-ca-marche.html` — this is
  the established per-page pattern in this codebase (see
  `docs/superpowers/plans/2026-07-15-ms-strategy-ab-test.md` Task 2 for precedent:
  `cp` an existing page, then apply exact edits).
- CSS rules for sections removed from the city/sitemap pages (`.steps`, `.step-*`,
  `.faq-section`, `.faq-*`, `.qband`, `.qt`, `.qs`) are deliberately **left in the
  copied `<style>` block**, unused. Trimming a large shared inline stylesheet is not
  worth the risk for this task — this mirrors how the existing A/B-test plan handled
  `index-b.html` (copy + targeted edits, no wholesale rewrite).
- This project has no automated test suite. "Testing" in this plan means real
  verification: a Python link-checker script, XML validation of `sitemap.xml`, and a
  manual browser check of the footer (desktop + mobile) — consistent with how the rest
  of the site has been verified so far.

---

### Task 1: Footer — add "Villes" column across the 9 existing pages

**Files:**
- Modify: `index.html`, `b2b.html`, `b2c.html`, `resultats.html`, `blog.html`,
  `comment-ca-marche.html` (footer variant with a "Contact" 3rd column)
- Modify: `mentions-legales.html`, `cgv.html`, `politique-confidentialite.html`
  (footer variant with an "Informations" 3rd column)

**Interfaces:**
- Produces: a 4-column `.sfooter` grid (`grid-template-columns:1fr 1fr 1fr 1fr`) and a
  "Villes" `.fc` block containing links to the 10 city pages (created in Task 3) and to
  `plan-du-site.html` (created in Task 2). These links will 404 until Tasks 2–3 run —
  expected and fine within this branch.

- [ ] **Step 1: Update the footer grid CSS to 4 columns in all 9 files**

  In each of the 9 files listed above, find this exact line (it is identical in every
  file):

  ```css
  .sfooter{padding:3.5rem 5vw 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:2rem;background:#050e13;border-top:1px solid rgba(26,122,138,.1)}
  ```

  Replace it with:

  ```css
  .sfooter{padding:3.5rem 5vw 0;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:2rem;background:#050e13;border-top:1px solid rgba(26,122,138,.1)}
  ```

- [ ] **Step 2: Insert the "Villes" column in the 6 "Contact" pages**

  In `index.html`, `b2b.html`, `b2c.html`, `resultats.html`, `blog.html`, and
  `comment-ca-marche.html`, find this exact snippet (identical in all 6 files):

  ```html
    </div>
    <div class="fc">
      <p class="fct">Contact</p>
  ```

  Replace it with:

  ```html
    </div>
    <div class="fc">
      <p class="fct">Villes</p>
      <a href="courtier-energie-paris.html">Paris</a>
      <a href="courtier-energie-lyon.html">Lyon</a>
      <a href="courtier-energie-marseille.html">Marseille</a>
      <a href="courtier-energie-toulouse.html">Toulouse</a>
      <a href="courtier-energie-bordeaux.html">Bordeaux</a>
      <a href="courtier-energie-lille.html">Lille</a>
      <a href="courtier-energie-nantes.html">Nantes</a>
      <a href="courtier-energie-montpellier.html">Montpellier</a>
      <a href="courtier-energie-strasbourg.html">Strasbourg</a>
      <a href="courtier-energie-rennes.html">Rennes</a>
      <a href="plan-du-site.html">Plan du site</a>
    </div>
    <div class="fc">
      <p class="fct">Contact</p>
  ```

  > Note: the indentation in the live files is 2 spaces per level (`  <div class="fc">`,
  > `    <p class="fct">Contact</p>`) — match whatever indentation the target file
  > actually uses; the content/order is what matters.

- [ ] **Step 3: Insert the "Villes" column in the 3 "Informations" (legal) pages**

  In `mentions-legales.html`, `cgv.html`, and `politique-confidentialite.html`, find
  this exact snippet (identical in all 3 files):

  ```html
    </div>
    <div class="fc">
      <p class="fct">Informations</p>
  ```

  Replace it with:

  ```html
    </div>
    <div class="fc">
      <p class="fct">Villes</p>
      <a href="courtier-energie-paris.html">Paris</a>
      <a href="courtier-energie-lyon.html">Lyon</a>
      <a href="courtier-energie-marseille.html">Marseille</a>
      <a href="courtier-energie-toulouse.html">Toulouse</a>
      <a href="courtier-energie-bordeaux.html">Bordeaux</a>
      <a href="courtier-energie-lille.html">Lille</a>
      <a href="courtier-energie-nantes.html">Nantes</a>
      <a href="courtier-energie-montpellier.html">Montpellier</a>
      <a href="courtier-energie-strasbourg.html">Strasbourg</a>
      <a href="courtier-energie-rennes.html">Rennes</a>
      <a href="plan-du-site.html">Plan du site</a>
    </div>
    <div class="fc">
      <p class="fct">Informations</p>
  ```

- [ ] **Step 4: Visually verify one page**

  Open `index.html` directly in a browser (or `python3 -m http.server` from the repo
  root and visit `http://localhost:8000/index.html`). Scroll to the footer. Confirm:
  4 columns render side by side on desktop, collapse to 1 column on a narrow window
  (resize below ~640px), and the "Villes" column lists all 10 cities plus "Plan du
  site". Links will 404 for now — that's expected until Tasks 2–3.

- [ ] **Step 5: Commit**

  ```bash
  git add index.html b2b.html b2c.html resultats.html blog.html comment-ca-marche.html mentions-legales.html cgv.html politique-confidentialite.html
  git commit -m "Add Villes column and Plan du site link to footer across all pages"
  ```

---

### Task 2: `plan-du-site.html`

**Files:**
- Create: `plan-du-site.html` (copy of `comment-ca-marche.html`, post Task 1)

**Interfaces:**
- Consumes: the 4-column footer produced by Task 1 (inherited via `cp`).
- Produces: `plan-du-site.html`, linked from every footer's "Villes" column (Task 1)
  and listed in `sitemap.xml` (Task 4).

- [ ] **Step 1: Copy the base file**

  ```bash
  cp comment-ca-marche.html plan-du-site.html
  ```

- [ ] **Step 2: Replace the `<head>` title/description/keywords**

  Find:

  ```html
  <title>Comment ça marche : notre méthode de courtage | M&S Strategy</title>
  <meta name="description" content="Découvrez comment M&S Strategy négocie vos contrats gaz et électricité : analyse gratuite, appel d'offres auprès de tous les fournisseurs, comparatif clair, suivi dans la durée.">
  <meta name="keywords" content="comment fonctionne un courtier énergie, processus courtage énergie, étapes négociation contrat gaz électricité">
  ```

  Replace with:

  ```html
  <title>Plan du site | M&S Strategy</title>
  <meta name="description" content="Plan du site M&S Strategy : toutes les pages du site, courtage énergie pour professionnels et particuliers, pages villes, ressources et informations légales.">
  <meta name="keywords" content="plan du site M&S Strategy">
  ```

- [ ] **Step 3: Add the sitemap grid CSS**

  Find (unique in the file):

  ```css
  /* ─── FOOTER ─────────────────────────── */
  ```

  Replace with:

  ```css
  /* ─── SITEMAP GRID ────────────────────── */
  .sitemap-sec{padding:8rem 5vw 6rem;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:2.5rem}
  @media(max-width:768px){.sitemap-sec{grid-template-columns:1fr 1fr}}
  @media(max-width:480px){.sitemap-sec{grid-template-columns:1fr}}

  /* ─── FOOTER ─────────────────────────── */
  ```

- [ ] **Step 4: Remove the "active" nav class**

  Find:

  ```html
  <li><a href="comment-ca-marche.html" class="active">Comment ça marche</a></li>
  ```

  Replace with:

  ```html
  <li><a href="comment-ca-marche.html">Comment ça marche</a></li>
  ```

- [ ] **Step 5: Replace the hero section**

  Find:

  ```html
  <!-- HERO -->
  <section class="phero">
    <div class="phero-in">
      <span class="stag reveal">Notre méthode</span>
      <h1 class="ph1 reveal d1">Comment ça marche, <em>concrètement.</em></h1>
      <p class="psub2 reveal d2">De l'analyse de votre facture à la signature du nouveau contrat, voici comment M&S Strategy négocie pour vous, étape par étape et sans jargon.</p>
      <a href="b2b.html#upload" class="pcta reveal d3">Démarrer mon étude gratuite <span class="ca">→</span></a>
    </div>
  </section>
  ```

  Replace with:

  ```html
  <!-- HERO -->
  <section class="phero">
    <div class="phero-in">
      <span class="stag reveal">Plan du site</span>
      <h1 class="ph1 reveal d1">Toutes les pages du <em>site</em></h1>
      <p class="psub2 reveal d2">Un aperçu complet de M&S Strategy : nos offres pour les professionnels et les particuliers, nos pages villes, nos ressources et nos informations légales.</p>
    </div>
  </section>
  ```

- [ ] **Step 6: Delete the Timeline Steps section**

  Find and delete entirely (replace with nothing — also delete the blank line that
  follows it, so there's exactly one blank line between the hero's `</section>` and
  the next section):

  ```html
  <!-- TIMELINE STEPS -->
  <section class="steps">
    <div class="step reveal">
      <div class="step-n">01</div>
      <div>
        <div class="step-t">Vous nous envoyez votre facture</div>
        <p class="step-b">Un simple envoi par email ou via notre formulaire en ligne suffit. Nous analysons votre <strong>consommation réelle</strong>, la <strong>structure de votre contrat actuel</strong> et sa <strong>date d'échéance</strong>. Cette étape est gratuite et sans engagement.</p>
      </div>
    </div>
    <div class="step reveal d1">
      <div class="step-n">02</div>
      <div>
        <div class="step-t">Nous lançons l'appel d'offres</div>
        <p class="step-b">Nous consultons simultanément <strong>l'ensemble des fournisseurs actifs</strong> sur votre segment (historiques et alternatifs) au lieu de comparer seulement 3 ou 4 acteurs comme le font la plupart des comparateurs en ligne.</p>
      </div>
    </div>
    <div class="step reveal d2">
      <div class="step-n">03</div>
      <div>
        <div class="step-t">Vous recevez un comparatif clair</div>
        <p class="step-b">Un tableau simple et chiffré : prix, conditions contractuelles, clauses d'indexation. Aucune pression commerciale : <strong>vous gardez la décision finale</strong> et pouvez toujours choisir de ne pas changer de fournisseur.</p>
      </div>
    </div>
    <div class="step reveal d3">
      <div class="step-n">04</div>
      <div>
        <div class="step-t">Nous finalisons le changement</div>
        <p class="step-b">Si vous validez une offre, nous nous occupons des démarches administratives auprès du nouveau fournisseur. <strong>Aucune coupure de service</strong>. Le changement se fait de façon transparente pour vous.</p>
      </div>
    </div>
    <div class="step reveal">
      <div class="step-n g">05</div>
      <div>
        <div class="step-t">Nous suivons votre dossier dans la durée</div>
        <p class="step-b">Notre accompagnement ne s'arrête pas à la signature. Nous anticipons votre <strong>prochaine échéance de renouvellement</strong> et vous alertons 12 à 24 mois avant, pour ne jamais rater la meilleure fenêtre de négociation.</p>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 7: Replace the SEO INTRO section with the sitemap listing**

  Find:

  ```html
  <!-- SEO INTRO -->
  <section class="seo-intro">
    <div>
      <span class="stag reveal">Pourquoi ce process fonctionne</span>
      <h2 class="sh2 reveal d1">La mise en concurrence <em>large</em> fait la différence.</h2>
      <div class="sbody reveal d2">
        <p>La plupart des comparateurs en ligne ne consultent qu'une poignée de fournisseurs partenaires. Notre approche est différente : nous interrogeons l'ensemble du marché disponible pour votre profil, ce qui nous permet d'accéder à des conditions que vous ne trouveriez jamais seul.</p>
        <p>Notre rémunération provient exclusivement des fournisseurs, via une commission standardisée identique quel que soit le contrat retenu. Ce modèle exclut structurellement tout favoritisme. Nous n'avons aucun intérêt à vous orienter vers une offre plutôt qu'une autre.</p>
      </div>
    </div>
    <div class="reveal d2">
      <div class="def-box">
        <p class="def-title">Un engagement de transparence</p>
        <p class="def-body">Chaque comparatif que nous produisons présente les offres <strong>telles qu'elles sont</strong>, sans mise en avant artificielle. Notre seul objectif est que vous obteniez le meilleur résultat possible pour votre situation.</p>
      </div>
      <ul class="chklist">
        <li>Aucun frais facturé au client, quel que soit le résultat</li>
        <li>Aucun engagement à signer une offre</li>
        <li>Délai de réponse garanti sous 48h</li>
        <li>Suivi actif jusqu'à votre prochain renouvellement</li>
      </ul>
    </div>
  </section>
  ```

  Replace with:

  ```html
  <!-- SITEMAP -->
  <section class="sitemap-sec">
    <div class="fc">
      <p class="fct">Navigation</p>
      <a href="index.html">Accueil</a>
      <a href="b2b.html">Professionnels (B2B)</a>
      <a href="b2c.html">Particuliers (B2C)</a>
      <a href="comment-ca-marche.html">Comment ça marche</a>
      <a href="resultats.html">Résultats & économies</a>
      <a href="blog.html">Ressources & analyses</a>
      <a href="ms-strategy-calculateur.html">Calculateur d'économies</a>
    </div>
    <div class="fc">
      <p class="fct">Villes</p>
      <a href="courtier-energie-paris.html">Paris</a>
      <a href="courtier-energie-lyon.html">Lyon</a>
      <a href="courtier-energie-marseille.html">Marseille</a>
      <a href="courtier-energie-toulouse.html">Toulouse</a>
      <a href="courtier-energie-bordeaux.html">Bordeaux</a>
      <a href="courtier-energie-lille.html">Lille</a>
      <a href="courtier-energie-nantes.html">Nantes</a>
      <a href="courtier-energie-montpellier.html">Montpellier</a>
      <a href="courtier-energie-strasbourg.html">Strasbourg</a>
      <a href="courtier-energie-rennes.html">Rennes</a>
    </div>
    <div class="fc">
      <p class="fct">Blog</p>
      <a href="blog.html">Toutes les ressources</a>
      <a href="ms-blog-article-1.html">Énergie industrielle : pourquoi votre site paie trop</a>
      <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a>
    </div>
    <div class="fc">
      <p class="fct">Informations légales</p>
      <a href="mentions-legales.html">Mentions légales</a>
      <a href="cgv.html">CGV</a>
      <a href="politique-confidentialite.html">Politique de confidentialité</a>
    </div>
  </section>
  ```

- [ ] **Step 8: Delete the FAQ SEO section**

  Find and delete entirely (also delete the blank line that follows):

  ```html
  <!-- FAQ SEO -->
  <section class="faq-section">
    <h2 class="reveal">Questions fréquentes sur notre processus</h2>

    <div class="faq-item reveal" onclick="faq(this)">
      <div class="faq-q">Combien de temps dure le processus complet ? <span class="faq-arr">↓</span></div>
      <div class="faq-a">Vous recevez un premier retour sous 48h après réception de votre facture. Le délai jusqu'à la signature et l'activation du nouveau contrat varie selon votre profil : généralement entre 2 et 4 semaines pour un particulier, 1 à 3 semaines pour une entreprise.</div>
    </div>

    <div class="faq-item reveal" onclick="faq(this)">
      <div class="faq-q">Suis-je obligé de signer une offre après l'étude ? <span class="faq-arr">↓</span></div>
      <div class="faq-a">Non, jamais. Notre étude est gratuite et sans engagement. Vous pouvez consulter le comparatif et décider de ne rien changer si aucune offre ne vous convient.</div>
    </div>

    <div class="faq-item reveal" onclick="faq(this)">
      <div class="faq-q">Que se passe-t-il si mon contrat actuel est encore en cours ? <span class="faq-arr">↓</span></div>
      <div class="faq-a">Nous pouvons analyser votre situation dès maintenant et préparer votre dossier en amont, pour être prêts à négocier dès que votre fenêtre de renouvellement s'ouvre, ou immédiatement si votre contrat n'a pas de durée d'engagement.</div>
    </div>

    <div class="faq-item reveal" onclick="faq(this)">
      <div class="faq-q">Comment suis-je rassuré sur l'indépendance de vos recommandations ? <span class="faq-arr">↓</span></div>
      <div class="faq-a">Notre commission est standardisée et identique quel que soit le fournisseur retenu. Nous n'avons donc aucun intérêt financier à privilégier une offre plutôt qu'une autre. Seul le résultat pour vous compte.</div>
    </div>
  </section>
  ```

- [ ] **Step 9: Delete the Quote Band block**

  Find and delete entirely (also delete the blank line that follows):

  ```html
  <!-- QUOTE BAND -->
  <div class="qband reveal">
    <p class="qt">Un processus <em>simple</em>, pensé pour que vous n'ayez rien à gérer.</p>
    <span class="qs">M&S Strategy · Courtier en énergie indépendant depuis 2012</span>
  </div>
  ```

- [ ] **Step 10: Verify and commit**

  Open `plan-du-site.html` in a browser (or via `python3 -m http.server`). Confirm the
  hero renders, the 4-column sitemap grid lists all links, and the footer has the
  "Villes" column. Some links (city pages) will still 404 until Task 3 — expected.

  ```bash
  git add plan-du-site.html
  git commit -m "Add plan-du-site.html"
  ```

---

### Task 3: 10 city landing pages

**Files:**
- Create: `courtier-energie-paris.html`, `courtier-energie-lyon.html`,
  `courtier-energie-marseille.html`, `courtier-energie-toulouse.html`,
  `courtier-energie-bordeaux.html`, `courtier-energie-lille.html`,
  `courtier-energie-nantes.html`, `courtier-energie-montpellier.html`,
  `courtier-energie-strasbourg.html`, `courtier-energie-rennes.html`
  (all copies of `comment-ca-marche.html`, post Task 1, generated by the script below)

**Interfaces:**
- Consumes: the 4-column footer produced by Task 1 (inherited via `cp`, before the
  script runs).
- Produces: the 10 URLs linked from every footer's "Villes" column (Task 1), from
  `plan-du-site.html` (Task 2), and registered in `sitemap.xml` (Task 4).

- [ ] **Step 1: Create and run the one-off generation script**

  This script is **not committed** — it's a one-time generation step, consistent with
  this repo having no build tooling. Run it from the repo root:

  ```bash
  python3 - <<'PY'
OLD_TITLE = '<title>Comment ça marche : notre méthode de courtage | M&S Strategy</title>'
OLD_DESC = '<meta name="description" content="Découvrez comment M&S Strategy négocie vos contrats gaz et électricité : analyse gratuite, appel d\'offres auprès de tous les fournisseurs, comparatif clair, suivi dans la durée.">'
OLD_KEYWORDS = '<meta name="keywords" content="comment fonctionne un courtier énergie, processus courtage énergie, étapes négociation contrat gaz électricité">'
OLD_NAV_ACTIVE = '<a href="comment-ca-marche.html" class="active">Comment ça marche</a>'
NEW_NAV = '<a href="comment-ca-marche.html">Comment ça marche</a>'

OLD_HERO = '''<!-- HERO -->
<section class="phero">
  <div class="phero-in">
    <span class="stag reveal">Notre méthode</span>
    <h1 class="ph1 reveal d1">Comment ça marche, <em>concrètement.</em></h1>
    <p class="psub2 reveal d2">De l'analyse de votre facture à la signature du nouveau contrat, voici comment M&S Strategy négocie pour vous, étape par étape et sans jargon.</p>
    <a href="b2b.html#upload" class="pcta reveal d3">Démarrer mon étude gratuite <span class="ca">→</span></a>
  </div>
</section>'''

OLD_STEPS = '''<!-- TIMELINE STEPS -->
<section class="steps">
  <div class="step reveal">
    <div class="step-n">01</div>
    <div>
      <div class="step-t">Vous nous envoyez votre facture</div>
      <p class="step-b">Un simple envoi par email ou via notre formulaire en ligne suffit. Nous analysons votre <strong>consommation réelle</strong>, la <strong>structure de votre contrat actuel</strong> et sa <strong>date d'échéance</strong>. Cette étape est gratuite et sans engagement.</p>
    </div>
  </div>
  <div class="step reveal d1">
    <div class="step-n">02</div>
    <div>
      <div class="step-t">Nous lançons l'appel d'offres</div>
      <p class="step-b">Nous consultons simultanément <strong>l'ensemble des fournisseurs actifs</strong> sur votre segment (historiques et alternatifs) au lieu de comparer seulement 3 ou 4 acteurs comme le font la plupart des comparateurs en ligne.</p>
    </div>
  </div>
  <div class="step reveal d2">
    <div class="step-n">03</div>
    <div>
      <div class="step-t">Vous recevez un comparatif clair</div>
      <p class="step-b">Un tableau simple et chiffré : prix, conditions contractuelles, clauses d'indexation. Aucune pression commerciale : <strong>vous gardez la décision finale</strong> et pouvez toujours choisir de ne pas changer de fournisseur.</p>
    </div>
  </div>
  <div class="step reveal d3">
    <div class="step-n">04</div>
    <div>
      <div class="step-t">Nous finalisons le changement</div>
      <p class="step-b">Si vous validez une offre, nous nous occupons des démarches administratives auprès du nouveau fournisseur. <strong>Aucune coupure de service</strong>. Le changement se fait de façon transparente pour vous.</p>
    </div>
  </div>
  <div class="step reveal">
    <div class="step-n g">05</div>
    <div>
      <div class="step-t">Nous suivons votre dossier dans la durée</div>
      <p class="step-b">Notre accompagnement ne s'arrête pas à la signature. Nous anticipons votre <strong>prochaine échéance de renouvellement</strong> et vous alertons 12 à 24 mois avant, pour ne jamais rater la meilleure fenêtre de négociation.</p>
    </div>
  </div>
</section>'''

OLD_SEO_INTRO = '''<!-- SEO INTRO -->
<section class="seo-intro">
  <div>
    <span class="stag reveal">Pourquoi ce process fonctionne</span>
    <h2 class="sh2 reveal d1">La mise en concurrence <em>large</em> fait la différence.</h2>
    <div class="sbody reveal d2">
      <p>La plupart des comparateurs en ligne ne consultent qu'une poignée de fournisseurs partenaires. Notre approche est différente : nous interrogeons l'ensemble du marché disponible pour votre profil, ce qui nous permet d'accéder à des conditions que vous ne trouveriez jamais seul.</p>
      <p>Notre rémunération provient exclusivement des fournisseurs, via une commission standardisée identique quel que soit le contrat retenu. Ce modèle exclut structurellement tout favoritisme. Nous n'avons aucun intérêt à vous orienter vers une offre plutôt qu'une autre.</p>
    </div>
  </div>
  <div class="reveal d2">
    <div class="def-box">
      <p class="def-title">Un engagement de transparence</p>
      <p class="def-body">Chaque comparatif que nous produisons présente les offres <strong>telles qu'elles sont</strong>, sans mise en avant artificielle. Notre seul objectif est que vous obteniez le meilleur résultat possible pour votre situation.</p>
    </div>
    <ul class="chklist">
      <li>Aucun frais facturé au client, quel que soit le résultat</li>
      <li>Aucun engagement à signer une offre</li>
      <li>Délai de réponse garanti sous 48h</li>
      <li>Suivi actif jusqu'à votre prochain renouvellement</li>
    </ul>
  </div>
</section>'''

OLD_FAQ = '''<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur notre processus</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps dure le processus complet ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Vous recevez un premier retour sous 48h après réception de votre facture. Le délai jusqu'à la signature et l'activation du nouveau contrat varie selon votre profil : généralement entre 2 et 4 semaines pour un particulier, 1 à 3 semaines pour une entreprise.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Suis-je obligé de signer une offre après l'étude ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Non, jamais. Notre étude est gratuite et sans engagement. Vous pouvez consulter le comparatif et décider de ne rien changer si aucune offre ne vous convient.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Que se passe-t-il si mon contrat actuel est encore en cours ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Nous pouvons analyser votre situation dès maintenant et préparer votre dossier en amont, pour être prêts à négocier dès que votre fenêtre de renouvellement s'ouvre, ou immédiatement si votre contrat n'a pas de durée d'engagement.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Comment suis-je rassuré sur l'indépendance de vos recommandations ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Notre commission est standardisée et identique quel que soit le fournisseur retenu. Nous n'avons donc aucun intérêt financier à privilégier une offre plutôt qu'une autre. Seul le résultat pour vous compte.</div>
  </div>
</section>'''

OLD_QBAND = '''<!-- QUOTE BAND -->
<div class="qband reveal">
  <p class="qt">Un processus <em>simple</em>, pensé pour que vous n'ayez rien à gérer.</p>
  <span class="qs">M&S Strategy · Courtier en énergie indépendant depuis 2012</span>
</div>'''

CITIES = [
    dict(slug="paris", ville="Paris",
         eco="Paris et l'Île-de-France concentrent une part majeure des sièges sociaux, des activités financières et tertiaires du pays, avec une consommation énergétique professionnelle parmi les plus élevées de France.",
         neighbors=["Boulogne-Billancourt", "Saint-Denis", "Créteil"]),
    dict(slug="lyon", ville="Lyon",
         eco="Deuxième pôle économique français, Lyon s'appuie sur des filières fortes en santé, chimie, biotechnologies et services aux entreprises, autant de secteurs où la maîtrise du poste énergie pèse directement sur la compétitivité.",
         neighbors=["Villeurbanne", "Vénissieux", "Bron"]),
    dict(slug="marseille", ville="Marseille",
         eco="Marseille, premier port de France, structure son économie autour de la logistique portuaire, de l'industrie et d'un tissu tertiaire dense, avec des besoins énergétiques très variés d'un secteur à l'autre.",
         neighbors=["Aix-en-Provence", "Vitrolles", "Aubagne"]),
    dict(slug="toulouse", ville="Toulouse",
         eco="Capitale européenne de l'aéronautique et du spatial, Toulouse héberge une industrie de pointe aux côtés d'un tissu de PME et de services, tous concernés par la volatilité des prix de l'énergie.",
         neighbors=["Blagnac", "Colomiers", "Balma"]),
    dict(slug="bordeaux", ville="Bordeaux",
         eco="Entre viticulture, aéronautique et tertiaire, Bordeaux dispose d'un tissu économique diversifié où chaque filière a des profils de consommation énergétique très différents.",
         neighbors=["Mérignac", "Pessac", "Talence"]),
    dict(slug="lille", ville="Lille",
         eco="Carrefour logistique de l'Europe du Nord-Ouest, Lille conserve un héritage industriel textile fort aux côtés d'un secteur tertiaire et de la vente à distance en plein essor.",
         neighbors=["Roubaix", "Tourcoing", "Villeneuve-d'Ascq"]),
    dict(slug="nantes", ville="Nantes",
         eco="Nantes s'appuie sur une industrie navale et aéronautique historique, complétée par l'agroalimentaire et un secteur tertiaire dynamique, avec des besoins énergétiques industriels significatifs.",
         neighbors=["Saint-Herblain", "Rezé", "Orvault"]),
    dict(slug="montpellier", ville="Montpellier",
         eco="Montpellier concentre un pôle santé et numérique en forte croissance, porté par une densité d'entreprises et d'établissements d'enseignement supérieur exigeants sur la maîtrise de leurs coûts fixes.",
         neighbors=["Castelnau-le-Lez", "Lattes", "Pérols"]),
    dict(slug="strasbourg", ville="Strasbourg",
         eco="Siège d'institutions européennes et ville industrielle transfrontalière, Strasbourg combine tertiaire institutionnel et industrie, deux profils de consommation énergétique très distincts.",
         neighbors=["Illkirch-Graffenstaden", "Schiltigheim", "Ostwald"]),
    dict(slug="rennes", ville="Rennes",
         eco="Rennes s'est imposée comme un pôle numérique et agroalimentaire majeur dans l'Ouest, avec un tissu de PME technologiques particulièrement sensibles à la variation des coûts d'exploitation.",
         neighbors=["Saint-Grégoire", "Cesson-Sévigné", "Bruz"]),
]

with open("comment-ca-marche.html", encoding="utf-8") as f:
    base = f.read()

for c in CITIES:
    slug, ville, eco, n = c["slug"], c["ville"], c["eco"], c["neighbors"]
    out = base

    assert OLD_TITLE in out, slug
    out = out.replace(OLD_TITLE, f'<title>Courtier en énergie à {ville} : gaz & électricité pro et particuliers | M&S Strategy</title>')

    assert OLD_DESC in out, slug
    out = out.replace(OLD_DESC, f'<meta name="description" content="M&S Strategy négocie vos contrats gaz et électricité à {ville} et dans les communes voisines ({n[0]}, {n[1]}, {n[2]}), pour les professionnels et les particuliers. Étude gratuite, sans engagement, résultat sous 48h.">')

    jsonld = '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Service",\n  "serviceType": "Courtage en énergie (gaz et électricité)",\n  "provider": {\n    "@type": "Organization",\n    "name": "M&S Strategy",\n    "url": "https://www.byandry.com/"\n  },\n  "areaServed": {\n    "@type": "City",\n    "name": "' + ville + '"\n  },\n  "url": "https://www.byandry.com/courtier-energie-' + slug + '.html"\n}\n</script>'

    assert OLD_KEYWORDS in out, slug
    out = out.replace(OLD_KEYWORDS, f'<meta name="keywords" content="courtier énergie {ville.lower()}, courtage énergie {ville.lower()}, comparer offres gaz électricité {ville.lower()}, négocier contrat énergie {ville.lower()}">\n' + jsonld)

    assert OLD_NAV_ACTIVE in out, slug
    out = out.replace(OLD_NAV_ACTIVE, NEW_NAV)

    new_hero = f'''<!-- HERO -->
<section class="phero">
  <div class="phero-in">
    <span class="stag reveal">Courtier en énergie</span>
    <h1 class="ph1 reveal d1">Votre courtier en énergie à <em>{ville}</em></h1>
    <p class="psub2 reveal d2">M&S Strategy négocie vos contrats gaz et électricité à {ville} et dans les communes voisines, pour les professionnels comme pour les particuliers. Étude gratuite, résultat sous 48h.</p>
    <a href="b2b.html#upload" class="pcta reveal d3">Démarrer mon étude gratuite <span class="ca">→</span></a>
  </div>
</section>'''
    assert OLD_HERO in out, slug
    out = out.replace(OLD_HERO, new_hero)

    assert OLD_STEPS + "\n\n" in out, slug
    out = out.replace(OLD_STEPS + "\n\n", "")

    new_seo_intro = f'''<!-- SEO INTRO -->
<section class="seo-intro">
  <div>
    <span class="stag reveal">Courtage énergie {ville}</span>
    <h2 class="sh2 reveal d1"><em>{ville}</em> : un tissu économique qui mérite un courtier indépendant.</h2>
    <div class="sbody reveal d2">
      <p>{eco}</p>
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à {ville}, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
    </div>
  </div>
  <div class="reveal d2">
    <div class="def-box">
      <p class="def-title">Zones couvertes autour de {ville}</p>
      <p class="def-body">Nous accompagnons aussi les professionnels et particuliers des communes voisines : <strong>{n[0]}</strong>, <strong>{n[1]}</strong> et <strong>{n[2]}</strong>.</p>
    </div>
    <ul class="chklist">
      <li>Aucun frais facturé au client, quel que soit le résultat</li>
      <li>Aucun engagement à signer une offre</li>
      <li>Délai de réponse garanti sous 48h</li>
      <li>Suivi actif jusqu'à votre prochain renouvellement</li>
    </ul>
  </div>
</section>'''
    assert OLD_SEO_INTRO in out, slug
    out = out.replace(OLD_SEO_INTRO, new_seo_intro)

    assert OLD_FAQ + "\n\n" in out, slug
    out = out.replace(OLD_FAQ + "\n\n", "")

    assert OLD_QBAND + "\n\n" in out, slug
    out = out.replace(OLD_QBAND + "\n\n", "")

    fname = f"courtier-energie-{slug}.html"
    with open(fname, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"wrote {fname}")
PY
  ```

  Expected output: 10 lines, `wrote courtier-energie-paris.html` through
  `wrote courtier-energie-rennes.html`, no `AssertionError`.

- [ ] **Step 2: Spot-check one generated file**

  ```bash
  grep -c 'class="fct">Villes' courtier-energie-lyon.html
  grep -o '<title>[^<]*</title>' courtier-energie-lyon.html
  grep -A2 'application/ld+json' courtier-energie-lyon.html
  ```

  Expected: `1` for the count, the Lyon-specific title, and the JSON-LD block with
  `"name": "Lyon"`.

- [ ] **Step 3: Visually verify one page in a browser**

  ```bash
  python3 -m http.server 8000
  ```

  Visit `http://localhost:8000/courtier-energie-lyon.html`. Confirm: hero shows
  "Votre courtier en énergie à Lyon", the local economic paragraph and the 3
  neighboring towns render, no leftover "Comment ça marche" content, footer has the
  4-column layout with "Villes" and links back to `b2b.html`/`b2c.html` work.

- [ ] **Step 4: Commit**

  ```bash
  git add courtier-energie-*.html
  git commit -m "Add 10 city landing pages for local SEO"
  ```

---

### Task 4: `sitemap.xml`

**Files:**
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: the 10 city page filenames (Task 3) and `plan-du-site.html` (Task 2).

- [ ] **Step 1: Add the 11 new URLs**

  Find (the closing tag):

  ```xml
</urlset>
  ```

  Replace with:

  ```xml
  <url>
    <loc>https://www.byandry.com/courtier-energie-paris.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-lyon.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-marseille.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-toulouse.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-bordeaux.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-lille.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-nantes.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-montpellier.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-strasbourg.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/courtier-energie-rennes.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.byandry.com/plan-du-site.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
  ```

- [ ] **Step 2: Validate the XML**

  ```bash
  python3 -c "import xml.dom.minidom as m; m.parse('sitemap.xml'); print('sitemap.xml is well-formed')"
  ```

  Expected: `sitemap.xml is well-formed`, no traceback.

- [ ] **Step 3: Commit**

  ```bash
  git add sitemap.xml
  git commit -m "Register city pages and plan-du-site.html in sitemap.xml"
  ```

---

### Task 5: Full-site verification

**Files:**
- None modified — this task only verifies the work from Tasks 1–4.

- [ ] **Step 1: Check every local link on every page resolves to a real file**

  ```bash
  python3 - <<'PY'
import re, pathlib

root = pathlib.Path(".")
html_files = sorted(root.glob("*.html"))
existing = {p.name for p in html_files}
broken = []

for page in html_files:
    text = page.read_text(encoding="utf-8")
    for href in re.findall(r'href="([^"]+\.html)(?:#[^"]*)?"', text):
        target = href.split("#")[0]
        if target not in existing:
            broken.append((page.name, target))

if broken:
    print("BROKEN LINKS:")
    for src, tgt in broken:
        print(f"  {src} -> {tgt}")
else:
    print(f"All local links across {len(html_files)} pages resolve correctly.")
PY
  ```

  Expected: `All local links across N pages resolve correctly.` — if any broken links
  are reported, fix the offending file before continuing (most likely cause: a typo
  in a `courtier-energie-*.html` filename introduced in Task 1's manual edit).

- [ ] **Step 2: Confirm every page with a footer has exactly one "Villes" column**

  ```bash
  for f in *.html; do
    grep -q 'class="sfooter"' "$f" || continue
    n=$(grep -c 'class="fct">Villes' "$f")
    if [ "$n" != "1" ]; then echo "MISMATCH in $f: $n"; fi
  done
  echo "done"
  ```

  Expected: only `done` printed (no `MISMATCH` lines). This should cover 20 files:
  the 9 patched in Task 1, the 10 city pages from Task 3, and `plan-du-site.html`
  from Task 2.

- [ ] **Step 3: Manual browser check (desktop + mobile width)**

  With `python3 -m http.server 8000` running, check in a browser:
  - `index.html` — footer 4 columns, Villes links go to the right city pages.
  - Resize to <640px — footer collapses to a single column, no overflow.
  - `courtier-energie-montpellier.html` — since M&S Strategy is based in Lattes
    (a Montpellier suburb), double-check this page in particular reads naturally.
  - `plan-du-site.html` — 4-column grid, collapses to 2 then 1 column as the
    window narrows.

- [ ] **Step 4: Final review note**

  No commit in this task (verification only). If Steps 1–2 required fixes, those
  fixes were committed as part of whichever task's files they touched — amend that
  task's commit only if it hasn't been reviewed yet, otherwise make a small follow-up
  commit, e.g.:

  ```bash
  git add -A
  git commit -m "Fix broken link found during verification"
  ```
