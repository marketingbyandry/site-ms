# On-page enrichment — 10 city pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the boilerplate, word-for-word-identical second sentence in each of the 10 `courtier-energie-{ville}.html` pages, and activate the existing-but-unused `.faq-section` with 6 city-specific FAQ items and `FAQPage` JSON-LD, to remove the doorway-pages risk flagged in PR #10's review.

**Architecture:** Static HTML site, no build step, no framework. Each of the 10 city pages is a self-contained, byte-identical-in-structure 312-line HTML file. This plan only edits existing files — no new files, no CSS changes (the `.faq-section`/`.faq-item`/`.faq-q`/`.faq-a` CSS and the `faq(el)` JS toggle function already exist in every city page, at lines 127-134 (CSS) and 303-307 (JS) — verified identical across all 10 files — but are currently unused since no `.faq-item` markup exists yet).

**Tech Stack:** Plain HTML, inline CSS (already present), inline JS (already present), JSON-LD (`schema.org`). No test framework in this repo (`package.json` has no `scripts`/test runner) — verification uses `grep` for content/duplication checks and `python3 -m json` for JSON-LD syntax validation.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-24-on-page-enrichment-villes-design.md` — all page copy in this plan is transcribed verbatim from that spec's "Contenu exact" sections. Do not paraphrase or improve the wording — use it exactly as written here.
- No new statistics, client counts, or testimonials attributed to a city (repo-wide anti-fabrication rule, carried from PR #10 and PR #9).
- Only file type touched: the 10 `courtier-energie-{ville}.html` files. Do not touch the footer, `plan-du-site.html`, `sitemap.xml`, or any other page — out of scope per the spec.
- Every city page has this exact identical structure (confirmed by reading `courtier-energie-bordeaux.html` and `courtier-energie-strasbourg.html` in full):
  - Line 9-25: first `<script type="application/ld+json">...</script>` block (`Service` schema) — do not modify, only insert a second JSON-LD script after it.
  - Line 26: `<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif...">` — the new JSON-LD script goes immediately before this line.
  - Line 211: the generic second `<p>` inside `.sbody` (`"Que vous soyez une entreprise, une collectivité ou un particulier à {Ville}, M&S Strategy négocie..."`) — replace this exact line.
  - Line 226: `</section>` closing `.seo-intro`.
  - Line 227: blank line.
  - Line 228: `<!-- CONTACT STRIP -->` comment — the new FAQ section goes between lines 226 and 228 (i.e., right after the blank line 227, before line 228).
  - Line 303-307: existing `function faq(el) {...}` — already correct, do not modify.

---

## Task 1: On-page enrichment — Bordeaux, Lille, Lyon, Marseille

**Files:**
- Modify: `courtier-energie-bordeaux.html:25,211,226-227`
- Modify: `courtier-energie-lille.html:25,211,226-227`
- Modify: `courtier-energie-lyon.html:25,211,226-227`
- Modify: `courtier-energie-marseille.html:25,211,226-227`

**Interfaces:**
- Consumes: existing `.faq-section`/`.faq-item`/`.faq-q`/`.faq-arr`/`.faq-a` CSS and `faq(el)` JS function, already present and unmodified in each file (lines 127-134, 303-307).
- Produces: nothing consumed by later tasks — each city page is independent. Task 4 (verification) reads the files this task writes.

- [ ] **Step 1: Edit `courtier-energie-bordeaux.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Bordeaux, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Un domaine viticole aux besoins saisonniers, un site aéronautique à forte puissance souscrite et un cabinet de services aux charges fixes stables n'ont rien à gagner à souscrire la même offre : M&S Strategy étudie chaque profil bordelais individuellement pour identifier le contrat réellement adapté.</p>
```

Insert immediately after line 25 (`</script>` closing the `Service` JSON-LD), before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Bordeaux M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Bordeaux intra-muros, nous accompagnons aussi les entreprises et particuliers de Mérignac, Pessac et Talence." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur viticole et tertiaire à Bordeaux ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page Courtier en énergie pour professionnels." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Bordeaux peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Bordeaux comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Bordeaux, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Bordeaux ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Bordeaux ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Bordeaux ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 (`</section>`) and line 228 (`<!-- CONTACT STRIP -->`), i.e. right after the blank line 227:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Bordeaux</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Bordeaux M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Bordeaux intra-muros, nous accompagnons aussi les entreprises et particuliers de Mérignac, Pessac et Talence.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur viticole et tertiaire à Bordeaux ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page <a href="b2b.html">Courtier en énergie pour professionnels</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Bordeaux peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Bordeaux comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Bordeaux, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Bordeaux ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Bordeaux ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Bordeaux ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 2: Edit `courtier-energie-lille.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Lille, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Entrepôts, plateformes logistiques et sites de vente à distance consomment différemment d'un bureau tertiaire lillois : M&S Strategy calibre son étude sur la puissance souscrite réelle de chaque site plutôt que sur une offre standard.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Lille M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Lille intra-muros, nous accompagnons aussi les entreprises et particuliers de Roubaix, Tourcoing et Villeneuve-d'Ascq." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur logistique à Lille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article Énergie industrielle : pourquoi votre site paie trop." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Lille peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Lille comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Lille. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Lille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Lille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Lille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Lille</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Lille M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Lille intra-muros, nous accompagnons aussi les entreprises et particuliers de Roubaix, Tourcoing et Villeneuve-d'Ascq.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur logistique à Lille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article <a href="ms-blog-article-1.html">Énergie industrielle : pourquoi votre site paie trop</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Lille peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Lille comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Lille. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Lille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Lille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Lille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 3: Edit `courtier-energie-lyon.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Lyon, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Un site chimique à consommation continue et forte puissance n'a pas le même profil qu'un cabinet de services lyonnais : M&S Strategy adapte la négociation à cette réalité industrielle plutôt que de proposer une offre uniforme.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Lyon M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Lyon intra-muros, nous accompagnons aussi les entreprises et particuliers de Villeurbanne, Vénissieux et Bron." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur chimique à Lyon ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article Énergie industrielle : pourquoi votre site paie trop." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Lyon peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Lyon comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Lyon. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Lyon ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Lyon ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Lyon ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Lyon</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Lyon M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Lyon intra-muros, nous accompagnons aussi les entreprises et particuliers de Villeurbanne, Vénissieux et Bron.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur chimique à Lyon ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article <a href="ms-blog-article-1.html">Énergie industrielle : pourquoi votre site paie trop</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Lyon peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Lyon comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Lyon. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Lyon ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Lyon ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Lyon ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 4: Edit `courtier-energie-marseille.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Marseille, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Un entrepôt du port autonome et un établissement du secteur tertiaire marseillais n'ont pas la même courbe de consommation : M&S Strategy étudie chaque site selon son usage réel avant de mettre les fournisseurs en concurrence.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Marseille M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Marseille intra-muros, nous accompagnons aussi les entreprises et particuliers d'Aix-en-Provence, Vitrolles et Aubagne." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur logistique portuaire à Marseille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article Énergie industrielle : pourquoi votre site paie trop." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Marseille peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Marseille comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Marseille. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Marseille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Marseille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Marseille ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Marseille</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Marseille M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Marseille intra-muros, nous accompagnons aussi les entreprises et particuliers d'Aix-en-Provence, Vitrolles et Aubagne.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur logistique portuaire à Marseille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article <a href="ms-blog-article-1.html">Énergie industrielle : pourquoi votre site paie trop</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Marseille peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Marseille comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Marseille. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Marseille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Marseille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Marseille ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 5: Verify these 4 files**

Run:

```bash
grep -c "Que vous soyez une entreprise, une collectivité ou un particulier" courtier-energie-bordeaux.html courtier-energie-lille.html courtier-energie-lyon.html courtier-energie-marseille.html
```

Expected: `0` for all 4 (generic sentence fully removed).

Run:

```bash
for f in courtier-energie-bordeaux.html courtier-energie-lille.html courtier-energie-lyon.html courtier-energie-marseille.html; do
  python3 -c "
import re, json, sys
content = open('$f', encoding='utf-8').read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', content, re.S)
assert len(blocks) == 2, f'$f: expected 2 JSON-LD blocks, found {len(blocks)}'
for b in blocks:
    json.loads(b)
print('$f: OK,', len(blocks), 'valid JSON-LD blocks')
"
done
```

Expected: `OK, 2 valid JSON-LD blocks` for each of the 4 files.

- [ ] **Step 6: Commit**

```bash
git add courtier-energie-bordeaux.html courtier-energie-lille.html courtier-energie-lyon.html courtier-energie-marseille.html
git commit -m "Enrich Bordeaux/Lille/Lyon/Marseille city pages: sector copy + FAQ"
```

---

## Task 2: On-page enrichment — Montpellier, Nantes, Paris

**Files:**
- Modify: `courtier-energie-montpellier.html:25,211,226-227`
- Modify: `courtier-energie-nantes.html:25,211,226-227`
- Modify: `courtier-energie-paris.html:25,211,226-227`

**Interfaces:**
- Consumes: same as Task 1 (existing CSS/JS, unmodified).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Edit `courtier-energie-montpellier.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Montpellier, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Un établissement de santé et une start-up numérique montpelliéraine partagent un même impératif : ne jamais subir de coupure ni de hausse tarifaire imprévue. M&S Strategy sécurise ces contrats en priorité sur ce critère de continuité.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Montpellier M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Montpellier intra-muros, nous accompagnons aussi les entreprises et particuliers de Castelnau-le-Lez, Lattes et Pérols." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur santé et numérique à Montpellier ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page Courtier en énergie pour professionnels." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Montpellier peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Montpellier comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Montpellier, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Montpellier ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Montpellier ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Montpellier ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Montpellier</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Montpellier M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Montpellier intra-muros, nous accompagnons aussi les entreprises et particuliers de Castelnau-le-Lez, Lattes et Pérols.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur santé et numérique à Montpellier ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page <a href="b2b.html">Courtier en énergie pour professionnels</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Montpellier peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Montpellier comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Montpellier, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Montpellier ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Montpellier ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Montpellier ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 2: Edit `courtier-energie-nantes.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Nantes, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Les sites de production navale et aéronautique nantais, à consommation élevée et continue, ont tout intérêt à mettre leurs fournisseurs en concurrence plutôt que de subir une reconduction automatique : c'est exactement ce que fait M&S Strategy, sans frais et sans engagement.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Nantes M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Nantes intra-muros, nous accompagnons aussi les entreprises et particuliers de Saint-Herblain, Rezé et Orvault." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur naval et aéronautique à Nantes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article Énergie industrielle : pourquoi votre site paie trop." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Nantes peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Nantes comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Nantes. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Nantes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Nantes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Nantes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Nantes</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Nantes M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Nantes intra-muros, nous accompagnons aussi les entreprises et particuliers de Saint-Herblain, Rezé et Orvault.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur naval et aéronautique à Nantes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article <a href="ms-blog-article-1.html">Énergie industrielle : pourquoi votre site paie trop</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Nantes peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Nantes comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Nantes. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Nantes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Nantes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Nantes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 3: Edit `courtier-energie-paris.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Paris, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Les entreprises parisiennes multi-sites dispersent souvent leurs contrats d'énergie entre plusieurs fournisseurs et échéances : M&S Strategy centralise l'étude de l'ensemble de vos implantations pour renégocier des conditions cohérentes.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Paris M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Paris intra-muros, nous accompagnons aussi les entreprises et particuliers de Boulogne-Billancourt, Saint-Denis et Créteil." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur tertiaire et financier à Paris ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page Courtier en énergie pour professionnels." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Paris peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Paris comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Paris, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Paris ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Paris ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Paris ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Paris</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Paris M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Paris intra-muros, nous accompagnons aussi les entreprises et particuliers de Boulogne-Billancourt, Saint-Denis et Créteil.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur tertiaire et financier à Paris ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page <a href="b2b.html">Courtier en énergie pour professionnels</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Paris peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Paris comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Paris, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Paris ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Paris ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Paris ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 4: Verify these 3 files**

Run:

```bash
grep -c "Que vous soyez une entreprise, une collectivité ou un particulier" courtier-energie-montpellier.html courtier-energie-nantes.html courtier-energie-paris.html
```

Expected: `0` for all 3.

Run:

```bash
for f in courtier-energie-montpellier.html courtier-energie-nantes.html courtier-energie-paris.html; do
  python3 -c "
import re, json
content = open('$f', encoding='utf-8').read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', content, re.S)
assert len(blocks) == 2, f'$f: expected 2 JSON-LD blocks, found {len(blocks)}'
for b in blocks:
    json.loads(b)
print('$f: OK,', len(blocks), 'valid JSON-LD blocks')
"
done
```

Expected: `OK, 2 valid JSON-LD blocks` for each of the 3 files.

- [ ] **Step 5: Commit**

```bash
git add courtier-energie-montpellier.html courtier-energie-nantes.html courtier-energie-paris.html
git commit -m "Enrich Montpellier/Nantes/Paris city pages: sector copy + FAQ"
```

---

## Task 3: On-page enrichment — Rennes, Strasbourg, Toulouse

**Files:**
- Modify: `courtier-energie-rennes.html:25,211,226-227`
- Modify: `courtier-energie-strasbourg.html:25,211,226-227`
- Modify: `courtier-energie-toulouse.html:25,211,226-227`

**Interfaces:**
- Consumes: same as Task 1 (existing CSS/JS, unmodified).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Edit `courtier-energie-rennes.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Rennes, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Une PME technologique rennaise et un site agroalimentaire n'ont pas la même sensibilité aux variations de prix : M&S Strategy adapte son étude à cette réalité plutôt que de proposer un contrat type.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Rennes M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Rennes intra-muros, nous accompagnons aussi les entreprises et particuliers de Saint-Grégoire, Cesson-Sévigné et Bruz." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur numérique à Rennes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page Courtier en énergie pour professionnels." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Rennes peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Rennes comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Rennes, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Rennes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Rennes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Rennes ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Rennes</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Rennes M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Rennes intra-muros, nous accompagnons aussi les entreprises et particuliers de Saint-Grégoire, Cesson-Sévigné et Bruz.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur numérique à Rennes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page <a href="b2b.html">Courtier en énergie pour professionnels</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Rennes peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Rennes comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Rennes, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Rennes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Rennes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Rennes ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 2: Edit `courtier-energie-strasbourg.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Strasbourg, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Un bâtiment institutionnel à consommation stable et un site industriel strasbourgeois à forte puissance souscrite ne relèvent pas de la même négociation : M&S Strategy adapte son étude à chacun de ces profils.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Strasbourg M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Strasbourg intra-muros, nous accompagnons aussi les entreprises et particuliers d'Illkirch-Graffenstaden, Schiltigheim et Ostwald." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur institutionnel à Strasbourg ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page Courtier en énergie pour professionnels." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Strasbourg peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Strasbourg comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Strasbourg, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Strasbourg ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Strasbourg ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Strasbourg ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Strasbourg</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Strasbourg M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Strasbourg intra-muros, nous accompagnons aussi les entreprises et particuliers d'Illkirch-Graffenstaden, Schiltigheim et Ostwald.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur institutionnel à Strasbourg ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Ces structures ont généralement des charges fixes stables mais peu de marge de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente notre étude vers la sécurisation autant que vers le prix. Découvrez notre accompagnement dédié sur la page <a href="b2b.html">Courtier en énergie pour professionnels</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Strasbourg peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Strasbourg comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que respectent encore une partie des petites structures tertiaires de Strasbourg, mais que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de comparer les offres du marché libre.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Strasbourg ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Strasbourg ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Strasbourg ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 3: Edit `courtier-energie-toulouse.html`**

Replace line 211:

```html
      <p>Que vous soyez une entreprise, une collectivité ou un particulier à Toulouse, M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et d'électricité actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux.</p>
```

with:

```html
      <p>Un site aéronautique toulousain à très forte puissance souscrite ne peut pas se permettre une simple reconduction tacite de contrat sans risque de surcoût : M&S Strategy sécurise et négocie ces contrats à enjeux élevés pour la filière et ses sous-traitants.</p>
```

Insert immediately after line 25, before line 26:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Toulouse M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Au-delà de Toulouse intra-muros, nous accompagnons aussi les entreprises et particuliers de Blagnac, Colomiers et Balma." }
    },
    {
      "@type": "Question",
      "name": "M&S Strategy accompagne-t-il les entreprises du secteur aéronautique à Toulouse ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article Énergie industrielle : pourquoi votre site paie trop." }
    },
    {
      "@type": "Question",
      "name": "Les entreprises de Toulouse peuvent-elles encore bénéficier du tarif réglementé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Toulouse comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Toulouse. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts." }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Toulouse ?",
      "acceptedAnswer": { "@type": "Answer", "text": "M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page Comment ça marche." }
    },
    {
      "@type": "Question",
      "name": "Quand renégocier son contrat d'énergie à Toulouse ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide Renouvellement contrat énergie industrie : le guide du bon moment détaille les signaux à surveiller." }
    },
    {
      "@type": "Question",
      "name": "Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Toulouse ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page Résultats & économies." }
    }
  ]
}
</script>
```

Insert between line 226 and line 228:

```html
<!-- FAQ SEO -->
<section class="faq-section">
  <h2 class="reveal">Questions fréquentes sur le courtage en énergie à Toulouse</h2>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quelles communes autour de Toulouse M&S Strategy accompagne-t-il ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Au-delà de Toulouse intra-muros, nous accompagnons aussi les entreprises et particuliers de Blagnac, Colomiers et Balma.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">M&S Strategy accompagne-t-il les entreprises du secteur aéronautique à Toulouse ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Oui. Les sites industriels de ce type ont un profil de consommation — puissance souscrite élevée, fonctionnement continu — très différent d'un site tertiaire classique, ce qui change directement le type de contrat à négocier. Pour aller plus loin sur ces enjeux, consultez notre article <a href="ms-blog-article-1.html">Énergie industrielle : pourquoi votre site paie trop</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Les entreprises de Toulouse peuvent-elles encore bénéficier du tarif réglementé ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis juillet 2023, à Toulouse comme partout en France. Celui de l'électricité reste réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que dépassent la plupart des sites industriels de ce type présents à Toulouse. Pour ces profils, la mise en concurrence des fournisseurs du marché libre est la seule option pour maîtriser ses coûts.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à Toulouse ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">M&S Strategy garantit une première réponse sous 48h après réception de vos factures. Le détail de notre méthode est expliqué sur la page <a href="comment-ca-marche.html">Comment ça marche</a>.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Quand renégocier son contrat d'énergie à Toulouse ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution des prix de marché, pas uniquement de sa date de fin. Notre guide <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le guide du bon moment</a> détaille les signaux à surveiller.</div>
  </div>

  <div class="faq-item reveal" onclick="faq(this)">
    <div class="faq-q">Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à Toulouse ? <span class="faq-arr">↓</span></div>
    <div class="faq-a">Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs actifs sur le marché français, sans se limiter à une poignée de partenaires commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés sur la page <a href="resultats.html">Résultats & économies</a>.</div>
  </div>
</section>
```

- [ ] **Step 4: Verify these 3 files**

Run:

```bash
grep -c "Que vous soyez une entreprise, une collectivité ou un particulier" courtier-energie-rennes.html courtier-energie-strasbourg.html courtier-energie-toulouse.html
```

Expected: `0` for all 3.

Run:

```bash
for f in courtier-energie-rennes.html courtier-energie-strasbourg.html courtier-energie-toulouse.html; do
  python3 -c "
import re, json
content = open('$f', encoding='utf-8').read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', content, re.S)
assert len(blocks) == 2, f'$f: expected 2 JSON-LD blocks, found {len(blocks)}'
for b in blocks:
    json.loads(b)
print('$f: OK,', len(blocks), 'valid JSON-LD blocks')
"
done
```

Expected: `OK, 2 valid JSON-LD blocks` for each of the 3 files.

- [ ] **Step 5: Commit**

```bash
git add courtier-energie-rennes.html courtier-energie-strasbourg.html courtier-energie-toulouse.html
git commit -m "Enrich Rennes/Strasbourg/Toulouse city pages: sector copy + FAQ"
```

---

## Task 4: Cross-page verification

**Files:**
- No modifications — read-only verification across all 10 `courtier-energie-*.html` files written by Tasks 1-3.

**Interfaces:**
- Consumes: all 10 files as written by Tasks 1-3.
- Produces: nothing — this is the final gate before the plan is considered done.

- [ ] **Step 1: Confirm the generic sentence is gone from every page**

Run:

```bash
grep -l "Que vous soyez une entreprise, une collectivité ou un particulier" courtier-energie-*.html
```

Expected: no output (empty — `grep -l` prints nothing when no file matches).

- [ ] **Step 2: Confirm every page has exactly one FAQ section with 6 items**

Run:

```bash
for f in courtier-energie-*.html; do
  n=$(grep -c 'class="faq-item reveal"' "$f")
  echo "$f: $n faq-item"
done
```

Expected: every line reads `6 faq-item`.

- [ ] **Step 3: Confirm no FAQ answer text (Q1, Q4, Q5, Q6 template) is byte-identical across two different cities where it should carry the city name**

Run:

```bash
grep -o 'Au-delà de [A-Za-zÀ-ÿ-]* intra-muros' courtier-energie-*.html | sort | uniq -c | sort -rn | head -3
```

Expected: every match count is `1` (each city's Q1 opening is unique because it embeds the city name — confirms no page accidentally copied another city's block).

- [ ] **Step 4: Validate all JSON-LD blocks parse and every page has exactly 2 blocks (Service + FAQPage)**

Run:

```bash
for f in courtier-energie-*.html; do
  python3 -c "
import re, json
content = open('$f', encoding='utf-8').read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', content, re.S)
assert len(blocks) == 2, f'$f: expected 2 JSON-LD blocks, found {len(blocks)}'
types = [json.loads(b)['@type'] for b in blocks]
assert types == ['Service', 'FAQPage'], f'$f: unexpected @type order {types}'
print('$f: OK')
"
done
```

Expected: `OK` for all 10 files.

- [ ] **Step 5: Confirm internal links resolve to files that exist in the repo**

Run:

```bash
grep -oh 'href="[a-z0-9-]*\.html"' courtier-energie-*.html | sort -u | sed 's/href="//;s/"//' | while read f; do
  [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"
done
```

Expected: every line reads `OK: ...` — no `MISSING:` lines. This should list `b2b.html`, `comment-ca-marche.html`, `ms-blog-article-1.html`, `ms-blog-article-2.html`, `resultats.html` (the 5 internal link targets used across the 10 FAQ sections).

- [ ] **Step 6: Visual check on the Vercel preview**

Open `https://site-ms-git-worktree-footer-villes-seo-marketingbyms.vercel.app/courtier-energie-strasbourg.html` (and at least one more city) after pushing Tasks 1-3's commits. Confirm:
- The FAQ section renders below the "zones couvertes" block and above the "Une question ?" contact strip.
- Clicking a question expands its answer (accordion behaviour from the existing `faq(el)` function) and collapses any previously open item.
- No layout overflow or broken styling on mobile width.

- [ ] **Step 7: Push**

```bash
git push origin worktree-footer-villes-seo
```
