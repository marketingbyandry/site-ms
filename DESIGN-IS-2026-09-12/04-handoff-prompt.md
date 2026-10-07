/make-plan Redesign the M&S Strategy homepage (`index.html`, SITE MS repo, `main` branch). Current design failed audit at 8/30 with critical gaps in principles #6 (honest, scored 0), #8 (thorough, scored 0), and #10 (as little design as possible, scored 0).

Verdict paragraph (quoted from 03-verdict.md):
> The homepage's honesty (#6) scores 0 — a headline trust claim is contradicted by the site's own other numbers, and one of its "live" proof mechanisms (supplier deal counters) is fabricated data presented as real — and thoroughness (#8) also scores 0, with zero keyboard-focus styling anywhere and every one of the six baseline states (empty/loading/error/success/focus/disabled) absent. Both are load-bearing failures on their own; the 8/30 total confirms this isn't a borderline call. This is not a verdict that the brand, the content strategy, or the page's information architecture are wrong — the section-by-section structure and copy are mostly sound. What's failing is underneath: an un-tokenized, hand-tuned spacing/type/color system duplicated across 7 distinct component patterns, an accessibility layer that never got built, and a handful of statistics that were either never sourced or are actively synthetic.

Why redesign and not refine: principle #6 (honest) scored 0 on a load-bearing dimension — fabricated data presented as real, plus an internally self-contradicted headline claim — and principle #8 (thorough) also scored 0 with all six baseline interaction states absent. Total (8/30) is far below the ≥20 refine threshold.

Preserve from current design:
- Brand tokens: the teal/cream/dark palette (`index.html:30-42`, `--teal`, `--teal-light`, `--green`, `--dark`, `--cream`) and the Instrument Serif + Satoshi type pairing (`index.html:27-28`).
- The dual B2B/B2C content segmentation strategy and the "fenêtre de négociation" negotiation-timeline concept (`index.html:689-740`) — a genuinely useful, domain-specific piece of content, not a generic pattern.
- The underlying section content and copy (nav labels minus ~5 flagged terms, hero copy, FAQ questions, about/careers text) — mostly clear, well-organized, and free of label→destination mismatches across all 12 checked CTAs.

Discard (structural patterns causing the failures):
- The un-tokenized, hand-tuned spacing/type/color system: 52 distinct spacing values (only ~11 on a clean 8px grid) and 44 distinct font-size declarations, with no `--space-*`/`--font-size-*` tokens anywhere, plus a dead `--teal-mid` token and 5 numerically-distinct "near-black" literals with no single source of truth. Evidence: `01-evidence.md` Visual §1-3. Caused failure on #3 (aesthetic) and #10 (as little design as possible).
- The duplicated component architecture: 4 separate CSS classes (`.hcard`/`.vcard`/`.cpillar`/`.akpi`) implementing one "ghost-numbered card" pattern, 3 separate classes (`.pcta`/`.cta-btn`/`.ncta`) implementing one CTA-button pattern, and 2 parallel implementations (`.sup-item`/`.faq-item`) of the same accordion pattern. Evidence: Structural §3. Caused failure on #10.
- The non-semantic, keyboard-dead accordion pattern: plain `<div onclick>` with no `tabindex`, no `role`, no keydown handler, used for all 14 supplier/FAQ disclosure widgets (`index.html:752-843`, `1004-1029`). Evidence: Accessibility §2-3. Caused failure on #2 (useful) and contributed to #8 (thorough).
- The zero-focus-state interaction layer: every interactive element defines `:hover` but none define `:focus`/`:focus-visible` (confirmed absent file-wide). Evidence: Visual §5. Caused failure on #8.
- The unsourced/fabricated statistics layer: `assets/sup-stats.js`'s deterministic pseudo-random daily jitter on hardcoded supplier numbers presented as real "aperçu" data, plus six unsourced claims (19% économies, 100.000 clients — contradicted by the supplier cards' own 8,177 total per the codebase's own TODO at lines 743-745 — 70M kWh, 80+ collaborateurs, "+5 à +7% par an", "80% des dirigeants"). Evidence: Copy & Honesty §2. Caused failure on #6 (honest).

Top 5 moves from the audit (verbatim):
1. #6 Honest: Replace the fabricated supplier-stat jitter (`assets/sup-stats.js`) with real data or drop the specific-looking figures; reconcile "100.000 clients accompagnés" (lines 627, 916, 929-930) against the supplier cards' own total of 8,177; source or remove the other unsourced statistics (19% économies, 70M kWh, 80+ collaborateurs, "+5 à +7% par an", "80% des dirigeants"). Evidence: Copy & Honesty §2.
2. #8 Thorough / #2 Useful: Add real `:focus-visible` styling to every interactive element (currently zero exist), and rebuild the 14 accordion items (8 `.sup-item` + 6 `.faq-item`) as real `<button>`s or `div[role=button][tabindex]` with keydown handling. Evidence: Visual §5, Accessibility §2-3.
3. #10 As little design / #3 Aesthetic: Establish real `--space-*` and `--font-size-*` token scales, and consolidate the 4 duplicate card classes, 3 duplicate CTA-button classes, and 2 duplicate accordion implementations into one component each. Evidence: Structural §3, Visual §1-2.
4. #2 Useful: Add a `<main>` landmark and a skip link (neither exists), and make the global-nav "Étude gratuite" CTA (line 571) segment-aware instead of hardcoding every visitor into the B2B `#upload` flow. Evidence: Accessibility §4.
5. #9 Environmentally friendly: Gate the hero's `requestAnimationFrame` particle loop (lines 1179-1190) and the ticker's infinite CSS marquee (line 99) behind `prefers-reduced-motion`, following the pattern already used correctly for the favicon pulse (`assets/favicon-animate.js:50`). Evidence: Weight & Friction §4.

Redesign principles in priority order:
1. #6 Honest — every number on the page must be either real, sourced, or removed; no simulated data presented as live.
2. #8 Thorough — every interactive element gets a focus-visible state; every disclosure widget is a real, keyboard-operable control.
3. #10 As little design as possible — one component implementation per visual pattern, backed by real spacing/type tokens, no duplicate CSS for the same shape.

Deliverables for the plan:
- New/updated design token set (`--space-*`, `--font-size-*` scales; audit and either use or delete `--teal-mid`; collapse the 5 near-duplicate near-blacks to one or two intentional tokens) layered onto the existing, preserved brand palette.
- Consolidated component set: one card component (replacing `.hcard`/`.vcard`/`.cpillar`/`.akpi`), one CTA-button component (replacing `.pcta`/`.cta-btn`/`.ncta`), one accessible accordion component (replacing `.sup-item`/`.faq-item`) with real keyboard support and `:focus-visible`.
- Honesty pass on every statistic on the page: source it, footnote it, or cut it — starting with the 100.000/8.177 contradiction and the `sup-stats.js` jitter mechanism.
- States checklist per interactive component: focus (mandatory for all), plus empty/loading/error/success only where a control's behavior can actually produce that state.
- `<main>` landmark + skip link + `aria-label`s on the ~11 unlabeled `<section>` elements.
- `prefers-reduced-motion` gating for the particle loop and ticker marquee.
- Migration path: this is a single static homepage file with no user accounts or saved state — cutover is a normal PR merge to `main`, no phased rollout needed.
- Cutover criteria: new component set passes its own quality-reviewer pass, all 14 accordions are keyboard-testable, and every retained statistic has a visible source or is removed.

Non-goals (do not touch in this pass):
- b2b.html, b2c.html, blog.html, and other secondary pages — homepage only.
- The unmerged PR #76 "Notre terrain" photo-system section — separate review thread, out of scope here.
- The underlying negotiation-timeline / dual B2B-C2B content strategy — preserve as-is, this redesign is about the component/token/accessibility/honesty layer, not the information architecture.

Anti-patterns to guard against (specific to REDESIGN):
- Porting the old `.hcard`/`.vcard`/`.cpillar`/`.akpi` structure under new class names instead of actually consolidating to one component.
- Keeping the `sup-stats.js` jitter mechanism "for now" behind a flag — the audit's #6 finding requires removing or truthfully labeling it, not hiding it better.
- Redesigning the visual language itself (the brand tokens are preserved, not broken) — this pass fixes structure, accessibility, and honesty, not the aesthetic direction.
- Treating the Preserve list as optional.
