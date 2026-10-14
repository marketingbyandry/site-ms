# Règles de rédaction des pages comparatives (tirées des relectures du lot 1)

À appliquer à toute nouvelle page « alternative à X » (lot 2, fournisseurs, etc.). Chaque règle correspond à un défaut réellement trouvé en relecture sur le lot 1 (Selectra, Opéra Énergie, Hellowatt, Kelwatt, Papernest).

## Checklist — lessons from the Selectra review (apply to every competitor page)

Model page: alternative-selectra-professionnel.html + content/alternatives/selectra.md + docs/alternatives/selectra/{faits,serp,note-avocat}.md. Reuse its structure, markup, classes, scripts and JSON-LD shape exactly; only the content changes.

Legal representativeness (Code conso L122-1 s.) — the review rejected these on Selectra:
1. Describe the competitor in ITS OWN words (e.g. « expert », not our paraphrase « conseiller »). Every competitor statement = verbatim line in faits.md with URL.
2. Never reduce the competitor to a « catalogue / offres standardisées » if its pages describe an analysis or personalised advice. Acknowledge what it declares doing, then state the sourced M&S difference.
3. Coverage claims: never oppose « N fournisseurs » to « tous » if the competitor declares a broader aim; quote both.
4. The table MUST include the criteria where the competitor wins (e.g. ancienneté, notoriety-free facts like founding year, channels). Not only M&S wins.
5. note-avocat.md must list EVERY M&S claim on the page that is not in the authorised list (brief Global Constraints), with its internal source (page:line), including: « indépendant de tout fournisseur / consulte tous les fournisseurs », commission intégrée presented as « gratuit », cible TPE/PME/ETI + particuliers, groupements d'achat (b2b.html), « appel d'offres simultané », « analyse la structure des contrats », Lattes/SIREN, and the two pending claims « interlocuteur unique pour l'ensemble du parc » and « suivi jusqu'au prochain renouvellement » marked « À confirmer par Antoine ».
6. Points de doute: the H1 « … ce que change un courtier indépendant » may suggest the competitor is not independent — note it if the competitor declares independence.
7. General claims (« une négociation lancée tôt obtient de meilleurs résultats ») must be non-absolute or sourced.
8. FAQ question comparing the two: « Quelle différence entre <X> et M&S Strategy ? » (not « … et un courtier indépendant »).

Technical (rulings already applied on Selectra):
- Title « Alternative à <X> pour les pros | M&S Strategy » (≤ 60 chars).
- Table: div.tbl-scroll > table.alt-compare, columns Critère | <X> | M&S Strategy, competitor cells with <a href="https://…" rel="nofollow noopener" target="_blank">source</a>.
- FAQ markup from b2b.html; FAQ visible == JSON-LD.
- Captures: Firecrawl full-page screenshots converted to WebP q85 with sharp (split very tall pages into -1..n.webp), plus .md text captures; Wayback links when available.
- Add the slug to ALTERNATIVES in test/alternatives-concurrents.test.mjs (RED first) and to PAGES in scripts/visual-check.mjs.
- audit:visual can't run (no Playwright): do the manual headless-Chrome overflow check at 390/768/1280 like Task 2c did, and report it.
- `npm run build:search` after adding the page; `npm test` fully green before commit.
- For comparators (Hellowatt, Kelwatt, Papernest): check and quote what their pages say about professional customers; if pro coverage is limited or absent, state it only with a verbatim source, otherwise « non communiqué ».

Added after the Opéra Énergie review:
9. An M&S advantage may only be presented as a difference if faits.md shows the competitor does NOT declare the same thing (delay, independence, interlocuteur, published results…). If both declare it, say « les deux annoncent … » and describe only the real process difference — or drop it.
10. Never claim the competitor lacks something on pages you did not read (« faute de source publique » → « sur les pages que nous avons consultées »); read the pages that could contradict the claim (cas pratiques, rémunération) before asserting.
11. Don't attribute generic courtage FAQ text to the competitor as its own statement; say « la page de présentation du courtage de <X> indique … ».

Added after the Hellowatt review:
12. Attribute each quote to the exact page it comes from (« sa page comparateur indique … »), not to a family of pages.
13. Quotes are verbatim incl. casing: use brackets for any change ([C]onseiller); no gloss right after a quote (or mark it as our reading).
14. Every source that carries a key fairness point (e.g. the only page saying the competitor serves pros) needs an image capture + Wayback check, not a text extract only.
15. Never place a competitor's terms-of-use clause about the consumer flow against an M&S service claim if it would imply the competitor offers nothing similar.
16. When the competitor declares a broad scope (« tous les fournisseurs »), quote it next to any narrower figure.
