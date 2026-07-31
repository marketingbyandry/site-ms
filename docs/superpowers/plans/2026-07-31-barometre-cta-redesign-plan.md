# Baromètre — CTA hierarchy + dynamic reading redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the barometre articles' CTA (calculateur d'inaction = primary, étude gratuite = secondary), and turn the flat single-column text wall into a dynamic read: sectioned content, a sticky side rail (trend sparkline + quick nav) above 1280px, and per-page differentiation driven by real electricity-price trend data — across all 7 retrospective articles plus the shared template.

**Architecture:** Every page is a standalone HTML file with fully duplicated inline `<style>`/`<script>` (no shared includes, no build step, no test framework — this is a static marketing site). The redesign activates CSS/JS that already exists in every file but was never wired to any HTML (`.stat-row`, `.checklist`, `.pull-quote`, `animateCount`, `.article-layout` grid) and adds a small amount of genuinely new CSS/JS (`.side-rail`, `.rail-nav`, sparkline draw-in, active-section highlighting). Because the 8 files are near-identical copies, the same set of edits is applied to each file independently, with only per-page data (accent color, price, delta, checklist facts, quote) varying.

**Tech Stack:** Plain HTML/CSS/JS, no framework, no bundler. Editing is done with exact-string `Edit` operations (not line numbers) because indentation/line offsets are not guaranteed identical across the 8 files even though their structure is.

Spec: `docs/superpowers/specs/2026-07-30-barometre-cta-redesign-design.md`

## Global Constraints

- Scope: `ms-blog-barometre-2022.html`, `-2023.html`, `-2024.html`, `-2025.html`, `-2026-t1.html`, `-2026-t2.html`, `-2026-t3.html`, `templates/barometre-article-template.html`. **Out of scope:** `barometre-energie.html`.
- No relative-color CSS syntax (`rgba(from …)`) — browser support unverified. Use a hardcoded `--accent-glow` custom property per page instead (decided during planning, see per-task values).
- No new decorative effects beyond what's specified: sparkline stroke-dasharray draw-in (~700ms, ease-out, no bounce), `animateCount` reused as-is for the hero stat, immediate (non-transitioned) color change for the active rail-nav link. No particles, glow-pulse, or parallax.
- CTA hierarchy copy is fixed exactly as written below — do not paraphrase.
- Section ids are fixed and identical across all 8 files: `periode`, `electricite`, `gaz`, `contexte`.
- Checklist/pull-quote content must be facts/quotes already published in that page's own prose — no invented data (verified against the spec, which sourced them from the live articles).
- `templates/barometre-article-template.html` gets the same structure with neutral placeholders (`--accent: var(--teal-light)`, bracket-style text placeholders matching the template's existing `[PLACEHOLDER]` convention) — not real content.
- No automated test suite exists in this repo for HTML pages. "Testing" per task = `grep`-based structural sanity checks (tag balance, id/class counts) plus a manual visual check by opening the file in a browser.

### Shared per-page reference table (from spec §3, §5, §6)

| Page | Price €/MWh | `data-target` (rounded) | Delta / sparkline-delta text | Trend | `--accent` | `--accent-glow` | Sparkline index |
|---|---|---|---|---|---|---|---|
| 2022 | 274,77 | 275 | `Pic de la crise 2022` | Choc | `#e05555` | `rgba(224,85,85,.18)` | 0 |
| 2023 | 96,84 | 97 | `−64,7 % vs 2022` | Baisse | `var(--green)` | `rgba(76,222,128,.18)` | 1 |
| 2024 | 58,62 | 59 | `−39,5 % vs 2023` | Baisse | `var(--green)` | `rgba(76,222,128,.18)` | 2 |
| 2025 | 62,26 | 62 | `+6,2 % vs 2024` | Volatil | `#e0a955` | `rgba(224,169,85,.18)` | 3 |
| T1 2026 | 74,00 | 74 | `+18,9 % vs moyenne 2025` | Hausse | `#e0a955` | `rgba(224,169,85,.18)` | 4 |
| T2 2026 | 57,34 | 57 | `−22,5 % vs T1 2026` | Baisse | `var(--green)` | `rgba(76,222,128,.18)` | 5 |
| T3 2026 | 101,37 | 101 | `+76,8 % vs T2 2026 (partiel)` | Hausse forte | `#e05555` | `rgba(224,85,85,.18)` | 6 |
| Template | — | 0 | `[DELTA_VS_PERIODE_PRECEDENTE]` | — | `var(--teal-light)` | `rgba(94,207,220,.18)` | 6 |

Sparkline dataset (identical SVG on every page, `viewBox="0 0 240 70"`), 7 fixed points:

```
idx 0 (2022): cx=10    cy=10
idx 1 (2023): cx=46.7  cy=50.9
idx 2 (2024): cx=83.3  cy=59.7
idx 3 (2025): cx=120   cy=58.9
idx 4 (T1):   cx=156.7 cy=56.2
idx 5 (T2):   cx=193.3 cy=60
idx 6 (T3):   cx=230   cy=49.9
```

Path: `M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9`

Circle rendering rule (applies on every page, including template):
- Index 6 (T3) is **always** hollow/dashed (`fill="none" stroke-dasharray="2 2"`) — it's genuinely partial data, regardless of which page is being viewed.
- The current page's own index is enlarged (`r="4"`) and colored `var(--accent)` / `stroke="var(--accent)"` if it's also index 6.
- All other indices: `r="2.5" fill="var(--muted)"`.

### Shared CSS block (identical text, inserted into every one of the 8 files)

Insert immediately after the existing `.article-body { ... }` rule and before the existing `h2 { ... }` rule:

```css
.side-rail {
  grid-column: 3;
  align-self: start;
  position: sticky;
  top: 6rem;
  display: none;
}
@media (min-width: 1280px) {
  .side-rail { display: block; }
}
.sparkline-labels {
  display: flex;
  justify-content: space-between;
  font-size: .6rem;
  color: var(--muted);
  margin-top: .3rem;
  font-family: 'Satoshi', sans-serif;
}
.sparkline-labels .active { color: var(--accent); font-weight: 700; }
.spark-line { transition: stroke-dashoffset .7s ease-out; }
.sparkline-delta {
  font-size: .78rem;
  color: var(--accent);
  margin-top: .6rem;
  font-family: 'Satoshi', sans-serif;
  font-weight: 700;
}
.rail-nav {
  display: flex;
  flex-direction: column;
  gap: .9rem;
  border-top: 1px solid rgba(43,181,200,.15);
  padding-top: 1.2rem;
  margin-top: 2rem;
}
.rail-nav a {
  font-size: .78rem;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: .02em;
}
.rail-nav a.active { color: var(--accent); }
.cta-secondary { font-size: .85rem; color: var(--muted); margin-top: 1rem; }
.cta-secondary a { color: var(--teal-light); }
```

### Shared JS block (identical text, appended into every one of the 8 files)

Append immediately after the existing `if (bigCounter) { ... }` block, before the closing `</script>`:

```js

// ── Sparkline draw-in
const sparkPath = document.querySelector('.spark-line');
if (sparkPath) {
  const sparkObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.strokeDashoffset = '0'; sparkObs.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  sparkObs.observe(sparkPath);
}

// ── Rail nav active section
const railLinks = document.querySelectorAll('.rail-nav a');
const railSections = ['periode', 'electricite', 'gaz', 'contexte']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const railObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      railLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });
railSections.forEach(s => railObs.observe(s));
```

### Shared HTML edits (identical old/new text in every one of the 8 files)

**Nav CTA** — old:
```html
  <a href="#cta" class="nav-cta">Étude gratuite →</a>
```
new:
```html
  <a href="ms-strategy-calculateur.html" class="nav-cta">Calculateur d'inaction →</a>
```

**Floating CTA** — old:
```html
<div class="floating-cta" id="floating-cta">
  <a href="#cta">Étude gratuite · 48h →</a>
</div>
```
new:
```html
<div class="floating-cta" id="floating-cta">
  <a href="ms-strategy-calculateur.html">Calculer mon inaction →</a>
</div>
```

**CTA section** — old:
```html
    <div id="cta">
      <div class="cta-section reveal">
        <p class="cta-title">Votre entreprise paie-t-elle le juste prix ?</p>
        <p class="cta-sub">Transmettez votre dernière facture énergie. Nous vous indiquons sous 48h si une opportunité existe, gratuitement et sans engagement.</p>
        <a href="b2b.html#upload" class="cta-btn">Obtenir mon étude gratuite →</a>
        <p class="cta-reassure">100% gratuit · Sans engagement · Données confidentielles · Réponse sous 48h</p>
      </div>
    </div>
```
new:
```html
    <div id="cta">
      <div class="cta-section reveal">
        <p class="cta-title">Chaque mois sans négocier a un coût réel.</p>
        <p class="cta-sub">Renseignez votre consommation et votre échéance : le calculateur affiche en temps réel ce que l'inaction vous coûte, et ce qu'une négociation pourrait vous rapporter.</p>
        <a href="ms-strategy-calculateur.html" class="cta-btn">Calculez ce que l'inaction vous coûte, en temps réel →</a>
        <p class="cta-secondary"><a href="b2b.html#upload">Ou transmettez votre facture pour une étude gratuite en 48h →</a></p>
      </div>
    </div>
```

**Hero gradient** — old:
```css
  background: radial-gradient(circle, rgba(26,122,138,.2) 0%, transparent 70%);
```
new:
```css
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
```

**Section-4 close anchor (used in every task)** — insert `</section>` immediately before this existing, byte-identical line (present in all 8 files):
```html
    <div id="cta">
```
→
```html
    </section>
    <div id="cta">
```

**Hero stat-row anchor (used in every task)** — old (works regardless of the hero-intro's own prose, which differs per page):
```
    </p>
  </header>
```
new (with per-page `data-target`, label, delta filled in — see each task):
```
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="DATA_TARGET"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — LABEL</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">DELTA</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

**`.article-layout`/`.article-body` grid wrap + side-rail insert (used in every task):**

Opening — old:
```html
  <div class="article-body">
```
new:
```html
  <div class="article-layout">
  <div class="article-body">
```

Closing — old (the "Lire aussi" callout is confirmed the last element of `.article-body` in every one of the 8 files):
```html
    <div class="callout reveal">
      <p class="callout-title">Lire aussi</p>
      <p><a href="barometre-energie.html" style="color:var(--teal-light)">Voir le Baromètre M&S Strategy des prix de l'énergie →</a><br>
      <a href="blog.html" style="color:var(--teal-light)">Voir toutes nos analyses énergie →</a></p>
    </div>
  </div>
```
new (with per-page sparkline circles/labels/delta + rail-nav labels — see each task):
```html
    <div class="callout reveal">
      <p class="callout-title">Lire aussi</p>
      <p><a href="barometre-energie.html" style="color:var(--teal-light)">Voir le Baromètre M&S Strategy des prix de l'énergie →</a><br>
      <a href="blog.html" style="color:var(--teal-light)">Voir toutes nos analyses énergie →</a></p>
    </div>
  </div>
  <aside class="side-rail">
    SPARKLINE_SVG
    RAIL_NAV
  </aside>
  </div>
```

---

## Task 1: `ms-blog-barometre-2026-t2.html` (reference implementation)

**Files:**
- Modify: `ms-blog-barometre-2026-t2.html`

**Interfaces:**
- Consumes: nothing (first file).
- Produces: the pattern every later task repeats — section ids `periode`/`electricite`/`gaz`/`contexte`, classes `.side-rail`, `.rail-nav`, `.cta-secondary`, `.sparkline-labels`, `.sparkline-delta`, JS globals `sparkObs`, `railLinks`, `railSections`, `railObs`.

T2 2026 values: accent `var(--green)`, glow `rgba(76,222,128,.18)`, `data-target="57"`, stat label `T2 2026`, delta `−22,5 % vs T1 2026`, sparkline index 5.

- [ ] **Step 1: Confirm anchors before editing**

Run: `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max' "ms-blog-barometre-2026-t2.html"`
Expected: one match each, confirming the anchors used below exist verbatim in this file.

- [ ] **Step 2: Add `--accent`/`--accent-glow` to `:root`**

Old:
```css
  --body-max: 720px;
}
```
New:
```css
  --body-max: 720px;
  --accent: var(--green);
  --accent-glow: rgba(76,222,128,.18);
}
```

- [ ] **Step 3: Point the hero gradient at `--accent-glow`**

Apply the shared "Hero gradient" edit from Global Constraints verbatim.

- [ ] **Step 4: Insert the shared side-rail/cta-secondary CSS block**

Apply the shared CSS block from Global Constraints verbatim, after `.article-body { ... }` and before `h2 { ... }`.

- [ ] **Step 5: Nav CTA, floating CTA, CTA section**

Apply the three shared "Nav CTA", "Floating CTA", "CTA section" edits from Global Constraints verbatim.

- [ ] **Step 6: Insert the hero stat-row**

Apply the shared "Hero stat-row anchor" edit, filling in:
```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="57"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — T2 2026</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">−22,5 % vs T1 2026</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap the 4 sections**

Old:
```html
    <h2>Période analysée</h2>
```
New:
```html
    <section id="periode">
    <h2>Période analysée</h2>
```

Old:
```html
    <h2>Prix moyen électricité</h2>
```
New:
```html
    </section>
    <section id="electricite">
    <h2>Prix moyen électricité</h2>
```

Old:
```html
    <h2>Prix moyen gaz</h2>
```
New:
```html
    </section>
    <section id="gaz">
    <h2>Prix moyen gaz</h2>
```

Old:
```html
    <h2>Contexte du marché</h2>
```
New:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>57,34 €/MWh, soit −22,5 % vs T1 2026.</li>
      <li>La variation T1→T2 aurait été lissée dans un format annuel.</li>
      <li>Le volet gaz reste en attente d'une source fiable.</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« La variation observée entre T1 et T2 2026 sur l'électricité aurait été largement lissée, voire invisible, dans un format annuel. »</p>
      <cite>Baromètre M&S Strategy — T2 2026</cite>
    </div>
```

Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: Wrap `.article-body` in `.article-layout` and add the side rail**

Apply the shared opening edit verbatim.

Apply the shared closing edit, filling in:
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--muted)"/>
        <circle cx="46.7" cy="50.9" r="2.5" fill="var(--muted)"/>
        <circle cx="83.3" cy="59.7" r="2.5" fill="var(--muted)"/>
        <circle cx="120" cy="58.9" r="2.5" fill="var(--muted)"/>
        <circle cx="156.7" cy="56.2" r="4" fill="var(--accent)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="2.5" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span>2022</span><span>2023</span><span>2024</span><span>2025</span><span class="active">T1</span><span>T2</span><span>T3</span>
      </div>
      <p class="sparkline-delta">−22,5 % vs T1 2026</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité</a>
      <a href="#gaz">Prix moyen gaz</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

**IMPORTANT — fix the index mismatch:** the active sparkline dot/label above must mark **index 5 (T2)**, not index 4. Re-check Step 8's SVG before running it: circle 5 (`cx="193.3" cy="60"`) must be `r="4" fill="var(--accent)"`, and circle 4 (`cx="156.7" cy="56.2"`) must be `r="2.5" fill="var(--muted)"`; the label row's `class="active"` must be on the `T2` span, not `T1`. (This note exists because it is easy to off-by-one the index — every later task must double-check its own index the same way before finalizing the SVG block.)

- [ ] **Step 9: Append the shared JS block**

Apply the shared JS block from Global Constraints verbatim.

- [ ] **Step 10: Structural sanity checks**

Run:
```bash
grep -c '<section' ms-blog-barometre-2026-t2.html
grep -c '</section>' ms-blog-barometre-2026-t2.html
grep -c 'class="side-rail"' ms-blog-barometre-2026-t2.html
grep -c 'class="rail-nav"' ms-blog-barometre-2026-t2.html
grep -c 'data-target=' ms-blog-barometre-2026-t2.html
grep -c 'ms-strategy-calculateur.html' ms-blog-barometre-2026-t2.html
```
Expected: `4`, `4`, `1`, `1`, `1`, `3` (nav + floating + cta-btn).

- [ ] **Step 11: Manual visual check**

Run: `open ms-blog-barometre-2026-t2.html`
Verify in the browser: page renders with no visual break under 1280px width; widen the window past 1280px and confirm the side rail appears on the right with the sparkline and quick-nav; scroll and confirm the sparkline draws in, the hero stat counts up to 57, the rail-nav link highlights as you pass each section; click the primary CTA button and confirm it points at `ms-strategy-calculateur.html`; confirm the secondary text link still points at `b2b.html#upload`.

- [ ] **Step 12: Commit**

```bash
git add ms-blog-barometre-2026-t2.html
git commit -m "feat: redesign T2 2026 barometre article — CTA hierarchy, side rail, dynamic reading"
```

---

## Task 2: `ms-blog-barometre-2022.html`

**Files:**
- Modify: `ms-blog-barometre-2022.html`

**Interfaces:**
- Consumes: same shared blocks/anchors as Task 1.
- Produces: same as Task 1, applied to the 2022 article.

2022 values: accent `#e05555`, glow `rgba(224,85,85,.18)`, `data-target="275"`, stat label `2022`, delta `Pic de la crise 2022` (no percentage — first point in the series), sparkline index 0.

- [ ] **Step 1: Confirm anchors before editing**

Run: `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max' "ms-blog-barometre-2022.html"`
Expected: one match each.

- [ ] **Step 2: Add `--accent`/`--accent-glow` to `:root`**

Old:
```css
  --body-max: 720px;
}
```
New:
```css
  --body-max: 720px;
  --accent: #e05555;
  --accent-glow: rgba(224,85,85,.18);
}
```

- [ ] **Step 3: Hero gradient** — apply the shared edit verbatim.

- [ ] **Step 4: Shared side-rail/cta-secondary CSS block** — apply verbatim.

- [ ] **Step 5: Nav CTA, floating CTA, CTA section** — apply the three shared edits verbatim.

- [ ] **Step 6: Insert the hero stat-row**

```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="275"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — 2022</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">Pic de la crise 2022</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap the 4 sections**

Same `periode`/`electricite`/`gaz` open edits as Task 1 Step 7 (headings are identical: `<h2>Période analysée</h2>`, `<h2>Prix moyen électricité</h2>`, `<h2>Prix moyen gaz</h2>`).

Contexte open + checklist + quote:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>Pic à 274,77 €/MWh, environ 3× le niveau de 2023.</li>
      <li>Gaz +111 % sur un an, pic à 227,5 €/MWh le 29/08.</li>
      <li>L'ARENH a limité sans l'annuler la répercussion sur les factures.</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« Face à cette envolée, le mécanisme ARENH a joué un rôle d'amortisseur pour les entreprises françaises. »</p>
      <cite>Baromètre M&S Strategy — 2022</cite>
    </div>
```

Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: Wrap `.article-body` in `.article-layout` and add the side rail**

Apply the shared opening edit verbatim. Closing edit, filling in (index 0 active, dashed at index 6):
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="4" fill="var(--accent)"/>
        <circle cx="46.7" cy="50.9" r="2.5" fill="var(--muted)"/>
        <circle cx="83.3" cy="59.7" r="2.5" fill="var(--muted)"/>
        <circle cx="120" cy="58.9" r="2.5" fill="var(--muted)"/>
        <circle cx="156.7" cy="56.2" r="2.5" fill="var(--muted)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="2.5" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span class="active">2022</span><span>2023</span><span>2024</span><span>2025</span><span>T1</span><span>T2</span><span>T3</span>
      </div>
      <p class="sparkline-delta">Pic de la crise 2022</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité</a>
      <a href="#gaz">Prix moyen gaz</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

- [ ] **Step 9: Append the shared JS block** — apply verbatim.

- [ ] **Step 10: Structural sanity checks** — same commands as Task 1 Step 10, run against `ms-blog-barometre-2022.html`. Same expected counts.

- [ ] **Step 11: Manual visual check** — same as Task 1 Step 11, run against `ms-blog-barometre-2022.html`; hero stat should count up to 275, active rail-nav/sparkline point should be at "2022".

- [ ] **Step 12: Commit**

```bash
git add ms-blog-barometre-2022.html
git commit -m "feat: redesign 2022 barometre article — CTA hierarchy, side rail, dynamic reading"
```

---

## Task 3: `ms-blog-barometre-2023.html`

**Files:**
- Modify: `ms-blog-barometre-2023.html`

2023 values: accent `var(--green)`, glow `rgba(76,222,128,.18)`, `data-target="97"`, stat label `2023`, delta `−64,7 % vs 2022`, sparkline index 1.

- [ ] **Step 1: Confirm anchors** — `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max' "ms-blog-barometre-2023.html"`, expect one match each.

- [ ] **Step 2: `:root` addition**
```css
  --body-max: 720px;
  --accent: var(--green);
  --accent-glow: rgba(76,222,128,.18);
}
```

- [ ] **Step 3: Hero gradient** — shared edit verbatim.

- [ ] **Step 4: Shared side-rail/cta-secondary CSS block** — verbatim.

- [ ] **Step 5: Nav CTA, floating CTA, CTA section** — shared edits verbatim.

- [ ] **Step 6: Hero stat-row**
```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="97"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — 2023</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">−64,7 % vs 2022</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap the 4 sections** — same `periode`/`electricite`/`gaz` open edits as Task 1 Step 7. Contexte open + checklist + quote:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>96,84 €/MWh en moyenne, soit −64,7 % vs 2022.</li>
      <li>Gaz à environ 40 €/MWh, deux fois moins qu'en 2022.</li>
      <li>La reconstitution des stocks gaziers européens a été le moteur principal de la décrue.</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« 2023 n'aura pas été un retour brutal à la normale, mais une normalisation progressive, construite mois après mois. »</p>
      <cite>Baromètre M&S Strategy — 2023</cite>
    </div>
```
Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: `.article-layout` wrap + side rail** — shared opening edit verbatim; closing edit with index 1 active:
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--muted)"/>
        <circle cx="46.7" cy="50.9" r="4" fill="var(--accent)"/>
        <circle cx="83.3" cy="59.7" r="2.5" fill="var(--muted)"/>
        <circle cx="120" cy="58.9" r="2.5" fill="var(--muted)"/>
        <circle cx="156.7" cy="56.2" r="2.5" fill="var(--muted)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="2.5" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span>2022</span><span class="active">2023</span><span>2024</span><span>2025</span><span>T1</span><span>T2</span><span>T3</span>
      </div>
      <p class="sparkline-delta">−64,7 % vs 2022</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité</a>
      <a href="#gaz">Prix moyen gaz</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

- [ ] **Step 9: Append shared JS block** — verbatim.

- [ ] **Step 10: Structural sanity checks** — same commands as Task 1 Step 10 against `ms-blog-barometre-2023.html`, same expected counts.

- [ ] **Step 11: Manual visual check** — same as Task 1 Step 11 against `ms-blog-barometre-2023.html`; stat counts to 97, active point at "2023".

- [ ] **Step 12: Commit**
```bash
git add ms-blog-barometre-2023.html
git commit -m "feat: redesign 2023 barometre article — CTA hierarchy, side rail, dynamic reading"
```

---

## Task 4: `ms-blog-barometre-2024.html`

**Files:**
- Modify: `ms-blog-barometre-2024.html`

2024 values: accent `var(--green)`, glow `rgba(76,222,128,.18)`, `data-target="59"`, stat label `2024`, delta `−39,5 % vs 2023`, sparkline index 2.

- [ ] **Step 1: Confirm anchors** — `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max' "ms-blog-barometre-2024.html"`, expect one match each.

- [ ] **Step 2: `:root` addition**
```css
  --body-max: 720px;
  --accent: var(--green);
  --accent-glow: rgba(76,222,128,.18);
}
```

- [ ] **Step 3: Hero gradient** — shared edit verbatim.

- [ ] **Step 4: Shared CSS block** — verbatim.

- [ ] **Step 5: Nav/floating/CTA edits** — shared, verbatim.

- [ ] **Step 6: Hero stat-row**
```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="59"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — 2024</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">−39,5 % vs 2023</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap 4 sections** — same `periode`/`electricite`/`gaz` open edits. Contexte open + checklist + quote:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>58,62 €/MWh en moyenne, soit −39,5 % vs 2023.</li>
      <li>Gaz à environ 34 €/MWh, −15 % sur un an.</li>
      <li>Des niveaux encore environ 2× la moyenne pré-crise 2014-2019.</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« 2024 marque moins un retour à l'avant-crise qu'une forme de nouvelle normalité, à un palier de prix plus élevé qu'avant 2021. »</p>
      <cite>Baromètre M&S Strategy — 2024</cite>
    </div>
```
Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: `.article-layout` wrap + side rail** — shared opening edit; closing edit with index 2 active:
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--muted)"/>
        <circle cx="46.7" cy="50.9" r="2.5" fill="var(--muted)"/>
        <circle cx="83.3" cy="59.7" r="4" fill="var(--accent)"/>
        <circle cx="120" cy="58.9" r="2.5" fill="var(--muted)"/>
        <circle cx="156.7" cy="56.2" r="2.5" fill="var(--muted)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="2.5" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span>2022</span><span>2023</span><span class="active">2024</span><span>2025</span><span>T1</span><span>T2</span><span>T3</span>
      </div>
      <p class="sparkline-delta">−39,5 % vs 2023</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité</a>
      <a href="#gaz">Prix moyen gaz</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

- [ ] **Step 9: Append shared JS block** — verbatim.

- [ ] **Step 10: Structural sanity checks** — same commands against `ms-blog-barometre-2024.html`, same expected counts.

- [ ] **Step 11: Manual visual check** — stat counts to 59, active point at "2024".

- [ ] **Step 12: Commit**
```bash
git add ms-blog-barometre-2024.html
git commit -m "feat: redesign 2024 barometre article — CTA hierarchy, side rail, dynamic reading"
```

---

## Task 5: `ms-blog-barometre-2025.html`

**Files:**
- Modify: `ms-blog-barometre-2025.html`

2025 values: accent `#e0a955`, glow `rgba(224,169,85,.18)`, `data-target="62"`, stat label `2025`, delta `+6,2 % vs 2024`, sparkline index 3.

- [ ] **Step 1: Confirm anchors** — `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max' "ms-blog-barometre-2025.html"`, expect one match each.

- [ ] **Step 2: `:root` addition**
```css
  --body-max: 720px;
  --accent: #e0a955;
  --accent-glow: rgba(224,169,85,.18);
}
```

- [ ] **Step 3: Hero gradient** — shared edit verbatim.

- [ ] **Step 4: Shared CSS block** — verbatim.

- [ ] **Step 5: Nav/floating/CTA edits** — shared, verbatim.

- [ ] **Step 6: Hero stat-row**
```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="62"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — 2025</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">+6,2 % vs 2024</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap 4 sections** — same `periode`/`electricite`/`gaz` open edits. Contexte open + checklist + quote:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>62,26 €/MWh en moyenne annuelle, proche de 2024 malgré un hiver tendu.</li>
      <li>Gaz à environ 35 €/MWh, quasi stable mais pic hivernal suivi d'un repli sous 30 €/MWh dès décembre.</li>
      <li>Dernière rétrospective annuelle avant le passage au rythme trimestriel.</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« Ce n'est plus le niveau moyen des prix qui caractérise l'année, mais leur volatilité. »</p>
      <cite>Baromètre M&S Strategy — 2025</cite>
    </div>
```
Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: `.article-layout` wrap + side rail** — shared opening edit; closing edit with index 3 active:
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--muted)"/>
        <circle cx="46.7" cy="50.9" r="2.5" fill="var(--muted)"/>
        <circle cx="83.3" cy="59.7" r="2.5" fill="var(--muted)"/>
        <circle cx="120" cy="58.9" r="4" fill="var(--accent)"/>
        <circle cx="156.7" cy="56.2" r="2.5" fill="var(--muted)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="2.5" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span>2022</span><span>2023</span><span>2024</span><span class="active">2025</span><span>T1</span><span>T2</span><span>T3</span>
      </div>
      <p class="sparkline-delta">+6,2 % vs 2024</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité</a>
      <a href="#gaz">Prix moyen gaz</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

- [ ] **Step 9: Append shared JS block** — verbatim.

- [ ] **Step 10: Structural sanity checks** — same commands against `ms-blog-barometre-2025.html`, same expected counts.

- [ ] **Step 11: Manual visual check** — stat counts to 62, active point at "2025".

- [ ] **Step 12: Commit**
```bash
git add ms-blog-barometre-2025.html
git commit -m "feat: redesign 2025 barometre article — CTA hierarchy, side rail, dynamic reading"
```

---

## Task 6: `ms-blog-barometre-2026-t1.html`

**Files:**
- Modify: `ms-blog-barometre-2026-t1.html`

T1 2026 values: accent `#e0a955`, glow `rgba(224,169,85,.18)`, `data-target="74"`, stat label `T1 2026`, delta `+18,9 % vs moyenne 2025`, sparkline index 4.

- [ ] **Step 1: Confirm anchors** — `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max' "ms-blog-barometre-2026-t1.html"`, expect one match each.

- [ ] **Step 2: `:root` addition**
```css
  --body-max: 720px;
  --accent: #e0a955;
  --accent-glow: rgba(224,169,85,.18);
}
```

- [ ] **Step 3: Hero gradient** — shared edit verbatim.

- [ ] **Step 4: Shared CSS block** — verbatim.

- [ ] **Step 5: Nav/floating/CTA edits** — shared, verbatim.

- [ ] **Step 6: Hero stat-row**
```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="74"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — T1 2026</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">+18,9 % vs moyenne 2025</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap 4 sections** — same `periode`/`electricite`/`gaz` open edits. Contexte open + checklist + quote:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>74,00 €/MWh, soit +18,9 % vs la moyenne 2025.</li>
      <li>Premier numéro publié au rythme trimestriel.</li>
      <li>Volet gaz en attente d'une source de moyenne trimestrielle fiable.</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« Un rythme annuel lissait ce type d'à-coups ; un rythme trimestriel permet de les documenter au fur et à mesure qu'ils se produisent. »</p>
      <cite>Baromètre M&S Strategy — T1 2026</cite>
    </div>
```
Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: `.article-layout` wrap + side rail** — shared opening edit; closing edit with index 4 active:
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--muted)"/>
        <circle cx="46.7" cy="50.9" r="2.5" fill="var(--muted)"/>
        <circle cx="83.3" cy="59.7" r="2.5" fill="var(--muted)"/>
        <circle cx="120" cy="58.9" r="2.5" fill="var(--muted)"/>
        <circle cx="156.7" cy="56.2" r="4" fill="var(--accent)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="2.5" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span>2022</span><span>2023</span><span>2024</span><span>2025</span><span class="active">T1</span><span>T2</span><span>T3</span>
      </div>
      <p class="sparkline-delta">+18,9 % vs moyenne 2025</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité</a>
      <a href="#gaz">Prix moyen gaz</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

- [ ] **Step 9: Append shared JS block** — verbatim.

- [ ] **Step 10: Structural sanity checks** — same commands against `ms-blog-barometre-2026-t1.html`, same expected counts.

- [ ] **Step 11: Manual visual check** — stat counts to 74, active point at "T1".

- [ ] **Step 12: Commit**
```bash
git add ms-blog-barometre-2026-t1.html
git commit -m "feat: redesign T1 2026 barometre article — CTA hierarchy, side rail, dynamic reading"
```

---

## Task 7: `ms-blog-barometre-2026-t3.html`

**Files:**
- Modify: `ms-blog-barometre-2026-t3.html`

T3 2026 values: accent `#e05555`, glow `rgba(224,85,85,.18)`, `data-target="101"`, stat label `T3 2026 (partiel)`, delta `+76,8 % vs T2 2026 (partiel)`, sparkline index 6 (both "current" and the always-dashed T3 index — combine both treatments).

**Note:** this file's electricité/gaz headings differ from every other file — `<h2>Prix moyen électricité (partiel)</h2>` and `<h2>Prix gaz (dernière valeur observée)</h2>` — use these exact strings as anchors, not the standard ones. It also has an existing `.partial-notice reveal` banner as the first child of `.article-body`, before `<h2>Période analysée</h2>` — leave it untouched; none of this task's edits anchor on it.

- [ ] **Step 1: Confirm anchors** — `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max\|Prix moyen électricité (partiel)\|Prix gaz (dernière' "ms-blog-barometre-2026-t3.html"`, expect one match each.

- [ ] **Step 2: `:root` addition**
```css
  --body-max: 720px;
  --accent: #e05555;
  --accent-glow: rgba(224,85,85,.18);
}
```

- [ ] **Step 3: Hero gradient** — shared edit verbatim.

- [ ] **Step 4: Shared CSS block** — verbatim (insert after `.article-body { ... }`, before `h2 { ... }` — same as other files; the file's extra `.partial-notice` rule sits elsewhere in the stylesheet and is unaffected).

- [ ] **Step 5: Nav/floating/CTA edits** — shared, verbatim.

- [ ] **Step 6: Hero stat-row**
```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="101"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — T3 2026 (partiel)</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">+76,8 % vs T2 2026 (partiel)</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap 4 sections**

Old:
```html
    <h2>Période analysée</h2>
```
New:
```html
    <section id="periode">
    <h2>Période analysée</h2>
```

Old:
```html
    <h2>Prix moyen électricité (partiel)</h2>
```
New:
```html
    </section>
    <section id="electricite">
    <h2>Prix moyen électricité (partiel)</h2>
```

Old:
```html
    <h2>Prix gaz (dernière valeur observée)</h2>
```
New:
```html
    </section>
    <section id="gaz">
    <h2>Prix gaz (dernière valeur observée)</h2>
```

Contexte open + checklist + quote:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>101,37 €/MWh sur les 27 premiers jours de juillet, +76,8 % vs T2 2026 — chiffre encore partiel.</li>
      <li>Gaz : clôture PEG Month-Ahead à 63,90 €/MWh le 24/07, valeur ponctuelle et non une moyenne.</li>
      <li>Bilan T3 définitif à venir une fois septembre clos.</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« La distinction entre cotation instantanée et moyenne réalisée reste un point de vigilance méthodologique que nous tenons à préserver. »</p>
      <cite>Baromètre M&S Strategy — T3 2026</cite>
    </div>
```
Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: `.article-layout` wrap + side rail** — shared opening edit; closing edit with index 6 active (dashed AND enlarged/accent-colored):
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--muted)"/>
        <circle cx="46.7" cy="50.9" r="2.5" fill="var(--muted)"/>
        <circle cx="83.3" cy="59.7" r="2.5" fill="var(--muted)"/>
        <circle cx="120" cy="58.9" r="2.5" fill="var(--muted)"/>
        <circle cx="156.7" cy="56.2" r="2.5" fill="var(--muted)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="4" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>T1</span><span>T2</span><span class="active">T3</span>
      </div>
      <p class="sparkline-delta">+76,8 % vs T2 2026 (partiel)</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité (partiel)</a>
      <a href="#gaz">Prix gaz (dernière valeur observée)</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

- [ ] **Step 9: Append shared JS block** — verbatim.

- [ ] **Step 10: Structural sanity checks**

Run the same commands as Task 1 Step 10 against `ms-blog-barometre-2026-t3.html`, plus:
```bash
grep -c 'class="partial-notice reveal"' ms-blog-barometre-2026-t3.html
```
Expected: same counts as Task 1 (`4`,`4`,`1`,`1`,`1`,`3`), and `1` for `.partial-notice` (confirms it survived untouched).

- [ ] **Step 11: Manual visual check** — stat counts to 101, active point at "T3" and rendered hollow/dashed at the enlarged size; confirm the "Bilan intermédiaire" banner still renders above "Période analysée" exactly as before.

- [ ] **Step 12: Commit**
```bash
git add ms-blog-barometre-2026-t3.html
git commit -m "feat: redesign T3 2026 barometre article — CTA hierarchy, side rail, dynamic reading"
```

---

## Task 8: `templates/barometre-article-template.html`

**Files:**
- Modify: `templates/barometre-article-template.html`

Template values: accent `var(--teal-light)`, glow `rgba(94,207,220,.18)`, `data-target="0"`, stat label `[PÉRIODE]`, delta `[DELTA_VS_PERIODE_PRECEDENTE]`, sparkline index 6 (same slot/treatment as T3 — dashed, enlarged, colored `--accent`). This file has no Sources callout (only "Lire aussi") — the closing-edit anchor is unaffected since it's keyed on the "Lire aussi" callout, which this file does have.

- [ ] **Step 1: Confirm anchors** — `grep -n 'class="article-body"\|</header>\|id="cta"\|Lire aussi\|--body-max' "templates/barometre-article-template.html"`, expect one match each.

- [ ] **Step 2: `:root` addition**
```css
  --body-max: 720px;
  --accent: var(--teal-light);
  --accent-glow: rgba(94,207,220,.18);
}
```

- [ ] **Step 3: Hero gradient** — shared edit verbatim.

- [ ] **Step 4: Shared CSS block** — verbatim.

- [ ] **Step 5: Nav/floating/CTA edits** — shared, verbatim.

- [ ] **Step 6: Hero stat-row**
```html
    </p>
    <div class="stat-row reveal">
      <div class="stat-item">
        <span class="stat-num" data-target="0"><span class="counter-val">0</span><span class="unit"> €/MWh</span></span>
        <span class="stat-label">Prix moyen électricité — [PÉRIODE]</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" style="color:var(--accent)">[DELTA_VS_PERIODE_PRECEDENTE]</span>
        <span class="stat-label">Évolution vs période précédente</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 7: Wrap 4 sections** — same `periode`/`electricite`/`gaz` open edits as Task 1 Step 7 (template headings are the plain, non-partial versions: `<h2>Période analysée</h2>`, `<h2>Prix moyen électricité</h2>`, `<h2>Prix moyen gaz</h2>`). Contexte open + placeholder checklist + placeholder quote:
```html
    </section>
    <section id="contexte">
    <h2>Contexte du marché</h2>
    <h3>Ce qu'il faut retenir</h3>
    <ul class="checklist reveal">
      <li>[FAIT_CLÉ_1]</li>
      <li>[FAIT_CLÉ_2]</li>
      <li>[FAIT_CLÉ_3]</li>
    </ul>
    <div class="pull-quote reveal">
      <p>« [CITATION_CLÉ_DE_LA_PÉRIODE] »</p>
      <cite>Baromètre M&S Strategy — [PÉRIODE]</cite>
    </div>
```
Apply the shared "Section-4 close anchor" edit verbatim.

- [ ] **Step 8: `.article-layout` wrap + side rail** — shared opening edit; closing edit with index 6 active (dashed, enlarged, `--accent` = teal-light by default):
```html
  <aside class="side-rail">
    <div class="sparkline-wrap">
      <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden="true">
        <path class="spark-line" d="M10,10 L46.7,50.9 L83.3,59.7 L120,58.9 L156.7,56.2 L193.3,60 L230,49.9" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="500" stroke-dashoffset="500"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--muted)"/>
        <circle cx="46.7" cy="50.9" r="2.5" fill="var(--muted)"/>
        <circle cx="83.3" cy="59.7" r="2.5" fill="var(--muted)"/>
        <circle cx="120" cy="58.9" r="2.5" fill="var(--muted)"/>
        <circle cx="156.7" cy="56.2" r="2.5" fill="var(--muted)"/>
        <circle cx="193.3" cy="60" r="2.5" fill="var(--muted)"/>
        <circle cx="230" cy="49.9" r="4" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="2 2"/>
      </svg>
      <div class="sparkline-labels">
        <span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>T1</span><span>T2</span><span class="active">T3</span>
      </div>
      <p class="sparkline-delta">[DELTA_VS_PERIODE_PRECEDENTE]</p>
    </div>
    <nav class="rail-nav">
      <a href="#periode">Période analysée</a>
      <a href="#electricite">Prix moyen électricité</a>
      <a href="#gaz">Prix moyen gaz</a>
      <a href="#contexte">Contexte du marché</a>
      <a href="#cta">Passer à l'action</a>
    </nav>
  </aside>
  </div>
```

- [ ] **Step 9: Append shared JS block** — verbatim.

- [ ] **Step 10: Structural sanity checks**

Run:
```bash
grep -c '<section' templates/barometre-article-template.html
grep -c '</section>' templates/barometre-article-template.html
grep -c 'class="side-rail"' templates/barometre-article-template.html
grep -c 'class="rail-nav"' templates/barometre-article-template.html
grep -c 'data-target=' templates/barometre-article-template.html
```
Expected: `4`, `4`, `1`, `1`, `1`.

- [ ] **Step 11: Manual visual check**

Run: `open templates/barometre-article-template.html`
Verify the same visual behavior as Task 1, with the understanding that most text still shows `[PLACEHOLDER]` tokens by design — confirm no broken HTML (unclosed tags, missing `</section>`), the side rail still renders at ≥1280px, and the sparkline/rail-nav still animate correctly despite the placeholder content.

- [ ] **Step 12: Commit**
```bash
git add templates/barometre-article-template.html
git commit -m "feat: apply barometre redesign to the shared article template"
```

---

## Self-Review Notes

- **Spec coverage:** §1 (CTA hierarchy) → shared Nav/Floating/CTA edits, applied in every task. §2 (sections + side rail) → shared section-wrap + `.article-layout`/`.side-rail` edits, every task. §3 (accent + sparkline) → per-task `:root`/gradient/SVG values, every task. §4 (stat-row) → shared hero stat-row edit, every task. §5 (checklist) → per-task checklist content, every task. §6 (pull-quote) → per-task quote, every task. §7 (animations) → shared JS block (sparkline draw-in, rail-nav highlight) + reused `animateCount`, every task; no new decorative effects added anywhere. §8 (scope notes) → `.counter-box`/`.data-table-wrap` untouched (never referenced in any task), gas series excluded from the sparkline (only electricity used), relative-color syntax avoided in favor of hardcoded `--accent-glow`, template gets placeholder treatment (Task 8).
- **Placeholder scan:** the only bracket-style placeholders in this plan (`[PÉRIODE]`, `[FAIT_CLÉ_1]`, etc.) are confined to Task 8 and match the template file's own pre-existing placeholder convention (`[TITRE_ARTICLE]`, `[SLUG_PERIODE]`, …) — they are real content for that file, not deferred plan work.
- **Type/name consistency:** class names (`.side-rail`, `.rail-nav`, `.sparkline-labels`, `.sparkline-delta`, `.cta-secondary`), ids (`periode`, `electricite`, `gaz`, `contexte`), and JS identifiers (`sparkPath`, `sparkObs`, `railLinks`, `railSections`, `railObs`) are identical across all 8 tasks — verified by re-reading each task's blocks side by side.
- **Corrected during review:** original diagnosis assumed 4 `.callout` divs per page; actual count (confirmed via the reference-file read) is 2 (Sources + Lire aussi), with the template having only 1 (no Sources). This doesn't change any task's edits — the section-close anchor was deliberately chosen to be `<div id="cta">` (present in all 8 files) rather than the Sources callout (absent from the template), so no task depends on the incorrect count.
