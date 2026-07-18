# Scorecard — byandry.com homepage

1. Good design is innovative — Score: 1/3
   Evidence: hero B2B/B2C split, stat-pair rows, card grids, FAQ accordion (01-evidence.md A.3) are standard lead-gen page patterns; canvas particles + SVG glint (D.4) are decorative flourish, not a functional pattern advance.
   Justification: imitates common lead-gen page conventions with a decorative variation, not a clear improvement to an existing pattern.

2. Good design makes a product useful — Score: 1/3
   Evidence: zero `<form>` on the page (B.5) — every CTA routes to a downstream page (b2b.html, calculateur); FAQ, the page's one native interaction, is keyboard-unreachable (E.3).
   Justification: primary task (start a quote) always requires an extra detour off this page, and the one on-page interaction excludes keyboard users.

3. Good design is aesthetic — Score: 0/3
   Evidence: 46 distinct spacing values and 31 distinct fixed font-sizes with no consistent step ratio (01-evidence.md B.1-B.2).
   Justification: density/near-continuity of both scales is direct evidence of no systematized visual grid, not a handful of minor inconsistencies.

4. Good design makes a product understandable — Score: 1/3
   Evidence: 6 unglossed jargon terms in body copy (C.4: "TPE·PME·ETI", "clauses d'indexation", "puissance souscrite", "heures creuses/pleines", mixed kWh/MWh/GWh, "groupements d'achat"); no `<main>` landmark (E.4).
   Justification: primary nav/CTA labels are clear, but jargon is present at more than a token level and structural cues for a first-time reader are incomplete.

5. Good design is unobtrusive — Score: 1/3
   Evidence: 6 auto-running decorative animation mechanisms (3 CSS keyframes + 3 JS rAF loops, D.4) plus a 288px decorative quote-glyph and a 96-240px decorative background word (B.2).
   Justification: continuous motion and oversized decorative type compete for attention throughout the scroll rather than receding behind content.

6. Good design is honest — Score: 1/3
   Evidence: 9 unsourced statistics/superlatives (C.2 — "19% Économies moyennes", "70M kWh négociés", "80% des dirigeants...", "les meilleures offres", "exclut structurellement tout favoritisme").
   Justification: well past the "2+ inflations" threshold, but no confirmed deceptive flow (no countdown/hidden cost/pre-checked box found), so not a 0.

7. Good design is long-lasting — Score: 1/3
   Evidence: dark-mode-only surface with neon-teal glow gradients, particle-canvas background, and SVG glint/line-reveal hover effects (B.3, D.4) — markers of the 2021-2023 "SaaS dark-glow" trend.
   Justification: 3+ dated stylistic markers stack together, more than the single-marker threshold for a 2.

8. Good design is thorough down to the last detail — Score: 0/3
   Evidence: zero `:focus`/`:focus-visible` rules anywhere in the stylesheet (B.5, E.2); FAQ accordion has no `aria-expanded`/keyboard handling (E.3); disabled state N/A but never addressed.
   Justification: focus is left to browser default with no custom handling at all, and the page's own custom interactive control (FAQ) omits standard expand/collapse semantics — well past a single rough state.

9. Good design is environmentally friendly — Score: 1/3
   Evidence: initial JS lands under 500KB (≈230KiB, D.1) once PostHog's unconditionally-injected `array.js` is included, but all 6 idle animations run with no `prefers-reduced-motion` gate found anywhere (D.4).
   Justification: scoring the worst instance — weight fits the "2" tier but motion is unconditionally always-on, which is explicitly the "1" tier condition.

10. Good design is as little design as possible — Score: 0/3
    Evidence: 9 numbered cards, 11 stat-pairs, 8 eyebrow tags, and 7 CTA-style links pointing toward broadly the same "start a quote" action, plus 2 confirmed-dead CSS tokens (A.3, A.4).
    Justification: the surface is dominated by duplicated affordances (multiple near-identical CTAs and repeated stat/card patterns) rather than each element earning a unique place.

**Total: 7/30**
