# Verdict — Design Is audit, 2026-09-12

**Total: 8/30. Verdict: REDESIGN.**

The homepage's honesty (#6) scores 0 — a headline trust claim is contradicted by the site's own other numbers, and one of its "live" proof mechanisms (supplier deal counters) is fabricated data presented as real — and thoroughness (#8) also scores 0, with zero keyboard-focus styling anywhere and every one of the six baseline states (empty/loading/error/success/focus/disabled) absent. Both are load-bearing failures on their own; the 8/30 total confirms this isn't a borderline call.

This is not a verdict that the brand, the content strategy, or the page's information architecture are wrong — the section-by-section structure and copy are mostly sound (Copy & Honesty evidence found zero label→destination mismatches across 12 checked CTAs, and only ~5 unclear labels out of dozens of strings). What's failing is underneath: an un-tokenized, hand-tuned spacing/type/color system duplicated across 7 distinct component patterns, an accessibility layer that never got built (no focus states, no keyboard path into 14 pieces of trust-building content), and a handful of statistics that were either never sourced or are actively synthetic.

## Highest-leverage moves

1. **#6 Honest** — Replace the fabricated supplier-stat jitter (`assets/sup-stats.js`'s deterministic pseudo-random daily perturbation of hardcoded numbers) with real data or drop the specific-looking figures; reconcile "100.000 clients accompagnés" (lines 627, 916, 929-930) against the supplier cards' own total of 8,177 (per the codebase's own TODO at lines 743-745); source or remove the other unsourced statistics (19% économies, 70M kWh, 80+ collaborateurs, "+5 à +7% par an", "80% des dirigeants"). Evidence: `01-evidence.md` Copy & Honesty §2.

2. **#8 Thorough / #2 Useful** — Add real `:focus-visible` styling to every interactive element (currently zero exist anywhere in the codebase), and rebuild the 14 accordion items (8 `.sup-item` + 6 `.faq-item`, lines 752-843 and 1004-1029) as real `<button>`s or `div[role=button][tabindex]` with keydown handling, so their content stops being invisible to keyboard and screen-reader users. Evidence: Visual §5, Accessibility §2-3.

3. **#10 As little design / #3 Aesthetic** — Establish real `--space-*` and `--font-size-*` token scales (currently 52 arbitrary spacing values and 44 arbitrary font-sizes, no tokens backing either), and consolidate the 4 duplicate card-pattern classes (`.hcard`/`.vcard`/`.cpillar`/`.akpi`), 3 duplicate CTA-button classes (`.pcta`/`.cta-btn`/`.ncta`), and 2 duplicate accordion implementations into one component each. Evidence: Structural §3, Visual §1-2.

4. **#2 Useful** — Add a `<main>` landmark and a skip link (currently neither exists), and make the global-nav "Étude gratuite" CTA (line 571) segment-aware instead of hardcoding every visitor into the B2B `#upload` flow regardless of which hero panel they engaged with. Evidence: Accessibility §4.

5. **#9 Environmentally friendly** — Gate the hero's `requestAnimationFrame` particle loop (lines 1179-1190) and the ticker's infinite CSS marquee (line 99, `ms-ticker-scroll`) behind `prefers-reduced-motion`, following the pattern the codebase already uses correctly for the favicon pulse (`assets/favicon-animate.js:50`). Evidence: Weight & Friction §4.
