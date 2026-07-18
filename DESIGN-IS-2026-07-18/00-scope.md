# Scope — Design Is audit

- **Target**: https://www.byandry.com/ (production, `main` branch, commit `7d06e1a`) — homepage `index.html` (936 lines)
- **Explicitly excluded from this pass**: in-progress `worktree-v2-redesign` (Swiss Modernism 2.0 rebuild, 5/9 tasks done, unmerged). User chose to audit live production, not the candidate redesign.
- **Primary user**: French SME/professional (TPE/PME/ETI) or individual (B2C) seeking to negotiate gas/electricity contracts; secondary: broker partners.
- **Primary task**: understand the offer (independent energy broker since 2012) and start a free quote/study (B2B or B2C path).
- **Constraints**: French-language site, brand teal/green identity, existing A/B test infrastructure (`index-b.html` variant), live traffic — no code changes as part of this audit (audit-only, ends at `/make-plan` handoff).
- **Reference/comparison**: none supplied by user; competitor benchmark not in scope for this pass.
- **Known context from prior sessions**: a v2 redesign is already underway addressing performance/animation weight and dark-mode-only styling; this audit should independently verify whether those concerns are evidenced on the live site, not assume prior conclusions.
