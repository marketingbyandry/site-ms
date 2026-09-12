# Scorecard — Design Is audit, 2026-09-12
Surface: `index.html` on `main` (HEAD `9e791a3`). All anchors reference `01-evidence.md`.

1. Good design is innovative — **Score: 1/3**
   Evidence: dual B2B/B2C hero segmentation, "fenêtre de négociation" timeline, ticker, accordions, particle-canvas hero (Structural §3, Visual §throughout).
   Justification: the negotiation-timeline visualization is a genuine domain-specific touch, but hover-segmented hero, marquee ticker, and accordion cards are standard marketing-site patterns — this refreshes existing patterns with minor originality, it doesn't advance the form.

2. Good design is useful — **Score: 1/3**
   Evidence: Accessibility §3 — 14 of ~30 primary-content-revealing controls (8 supplier accordions + 6 FAQ items) are plain `onclick` divs, unreachable by keyboard with **zero** keydown handler; Copy §5 — the global-nav "Étude gratuite" CTA (line 571) always routes to `b2b.html#upload` regardless of whether the visitor is in the B2C-styled panel.
   Justification: the primary task (self-select + reach a CTA) is directly reachable via separate `<a>` links, but a meaningful chunk of trust-building content (supplier proof, FAQ answers) requires unnecessary detours or is flatly unreachable for keyboard/assistive-tech users — not a full block, but a real detour, not the fewest-steps ideal.

3. Good design is aesthetic — **Score: 1/3**
   Evidence: Visual §1-2 — 52 spacing values (only ~11 on a clean 8px grid) and 44 font-size declarations, neither backed by a token; Visual §3 — a dead color token plus 5 numerically-distinct "near-black" literals with no single source of truth.
   Justification: the palette *reads* coherent at a glance (values differ by fractions of a pixel), but there is no enforced quantitative system underneath — this is well past "2 minor inconsistencies," it's systemic absence of a spacing/type scale.

4. Good design is understandable — **Score: 1/3**
   Evidence: Copy §4 — "Ressources", "Rejoindre", "Perte en temps réel", "aperçu", and "kWh négociés" all flagged as unclear/jargon to a first-time visitor; Accessibility §4 — zero `<main>`, zero `aria-label` on any of ~11 `<section>`s.
   Justification: more than the "1 control needs a tooltip" threshold for a 2 — 4-5 labels are genuinely ambiguous or jargon, landing squarely in the "2-3 controls unclear, jargon present" band (and beyond it).

5. Good design is unobtrusive — **Score: 1/3**
   Evidence: Weight & Friction §4 — a `requestAnimationFrame` particle loop and an infinite CSS ticker marquee run forever from page load, neither gated on `prefers-reduced-motion` (only the favicon pulse checks it); Structural §3 — 4 different card-pattern implementations and 3 different CTA-button classes for the same two visual patterns.
   Justification: persistent, ungated ambient motion plus a proliferation of near-identical decorative components means chrome doesn't fully recede — it's present and competing, not just "visible but quiet."

6. Good design is honest — **Score: 0/3**
   Evidence: Copy §2 — the "100.000 clients accompagnés" headline claim (lines 627, 916, 929-930) is **internally contradicted by the codebase's own TODO comment**, which sums the 8 supplier cards' "propositions réalisées" to 8,177; and `assets/sup-stats.js` generates the supplier "aperçu" counters via a **deterministic pseudo-random daily jitter on hardcoded numbers**, presented to visitors as real, unlabelled data. Five more unsourced statistics (19%, 70M kWh, 80+ collaborateurs, +5-7%/an, "80% des dirigeants") stack on top.
   Justification: this isn't "one minor inflation" — it's a headline trust-building number contradicted by the site's own other numbers, plus fabricated data presented as real. That is a false claim shipped to production, which is exactly what principle #6 rules out. Load-bearing zero.

7. Good design is long-lasting — **Score: 2/3**
   Evidence: Structural §3 Pattern D — a skew light-sweep hover gradient on CTA buttons, duplicated near-identically across two separate CSS rules (`.pcta::before` line 184, `.cta-btn::before` line 360); particle-canvas hero background.
   Justification: one recognizable of-the-moment micro-interaction trend (button light-sweep), chased rather than restrained, but the overall visual language (teal/cream, serif+sans pairing) isn't tied to a specific year's aesthetic beyond that.

8. Good design is thorough down to the last detail — **Score: 0/3**
   Evidence: Visual §5 — **all six checklist states (empty, loading, error, success, focus, disabled) are absent**; explicitly confirmed **zero `:focus`/`:focus-visible` rules anywhere in the codebase** despite every interactive element having a `:hover` rule.
   Justification: 4+ states missing is the 0 anchor by definition — this audit found 6 of 6 missing, including focus-visible, which is not an edge case but a baseline requirement for any interactive element.

9. Good design is environmentally friendly — **Score: 1/3**
   Evidence: Weight & Friction §1 — local JS is a lean ~27KB (good), but §4 — two idle-screen animations (particle rAF loop, ticker marquee) run forever and are **not gated by `prefers-reduced-motion`** (only the favicon pulse is); §2 — ~30 requests, ~310KB of non-lazy images.
   Justification: JS weight alone would support a 2-3, but "motion gated" is an explicit condition at every tier above 1, and two of three idle animations run unconditionally regardless of the visitor's reduced-motion preference — that caps the score at 1 ("motion always on").

10. Good design is as little design as possible — **Score: 0/3**
    Evidence: Structural §3 — seven distinct duplicated-pattern groups (4 card classes for 1 pattern, 3 CTA-button classes for 1 pattern, 2 parallel accordion implementations, 4 separate CSS rules for one two-column grid shape, literal un-templated contact info repeated 3-5×); Structural §4 — a dead token, a dead CSS variant, an empty ruleset, 2 dead IDs, and 6 orphaned unused JS files on disk.
    Justification: this is well past "3-5 removable elements" — it's systemic duplication of the *same* affordance under different names across the whole stylesheet, the textbook definition of the 0 anchor ("dominated by duplicated affordances"), even though the rendered page itself doesn't look visually cluttered.

**Total: 8/30**
