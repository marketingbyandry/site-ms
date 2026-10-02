# SITE MS — Instructions projet

## Testing
Après toute modification HTML/CSS/JS sur ce repo, lancer la suite de tests complète (`npm test`) et confirmer que tous les tests passent avant de committer (baseline actuelle : 218 tests). Si un changement modifie du texte ou du markup testé, mettre à jour l'assertion concernée dans le même commit.

## Image & Asset Pipeline
Pour les visuels sourcés (ex. via Savee) : télécharger l'original, convertir en WebP (ou JPEG optimisé si WebP non supporté), viser <300KB, stocker sous `assets/`, référencer avec largeur/hauteur explicites. Ne jamais laisser de placeholder base64 ou de texte "exemple/gabarit" dans du HTML committé.

## Git / PR Workflow
Flux par défaut : travailler sur une branche de fonctionnalité (worktree), committer avec un message concis, ouvrir une PR (`gh pr create`), attendre les checks, merger (`gh pr merge --squash`). Rapporter le numéro de PR et le SHA du merge dans le message final.

## Environment Preflight
Avant d'installer des toolchains (Homebrew, ffmpeg, yt-dlp) ou de télécharger des médias volumineux, vérifier l'espace disque libre (`df -h /`) et interrompre avec un avertissement si < 10GB. Préférer les binaires précompilés aux compilations source.

## Batch Generation (contenu volumineux)
Pour toute génération en lot (articles, pages, migrations multi-fichiers) : créer d'abord un manifeste (`*/manifest.json` ou équivalent) listant chaque item avec un statut (pending/done), écrire chaque item sur disque immédiatement après génération, et mettre à jour le manifeste au fur et à mesure. Une interruption (limite d'usage, compaction) doit pouvoir reprendre depuis le premier item "pending" sans perte.

## Recon Before Edit
Avant de modifier une zone du code peu familière (templates, middleware, système de couleurs), utiliser un sub-agent (outil Agent) en lecture seule pour cartographier les fichiers concernés et les tests qui les couvrent, avant d'éditer quoi que ce soit.

## Recherche du site (Pagefind)
- Index statique généré par `npm run build:search` : `pagefind/` + `assets/search-lexicon.json` (vocabulaire pour la correction des fautes). Vercel ne fait pas de build : **relancer `npm run build:search` après tout ajout ou modification de contenu, et committer les fichiers générés.** `test/site-search.test.mjs` échoue si une page est ajoutée ou supprimée sans reconstruire l'index.
- Nouvelle page : ajouter `<script type="module" src="assets/site-search.js"></script>` avant `</head>` (sauf pages de conversion : landing-2, calculateur).
- Mots-clés contextuels : `data/search-synonyms.json` (déclencheurs → termes cherchés). Les termes doivent exister sur le site (vérifié par les tests).
- Logique (correction, synonymes, regroupement des pages villes) : `assets/search-core.js`, testée en Node. Interface : `assets/site-search.js` + `.css`, page `recherche.html` (noindex).

## Outillage Claude
- **Playwright MCP** (`.mcp.json`) : après une modification visuelle, vérifier le rendu réel de la page (desktop + mobile, console sans erreur) en plus de `npm test`. En session cloud, lancer le serveur avec `--browser chromium --executable-path /opt/pw-browsers/chromium`.
- **taste-skill : ne pas l'utiliser sur ce repo.** Ses règles par défaut contredisent la DA existante (il bannit Instrument Serif, suppose React/Tailwind, propose des photos placeholder picsum). Il est réservé aux nouveaux sites clients.

## Creative/Visual Work
Avant de produire un rendu visuel (mockup, campagne, direction artistique), faire confirmer par l'utilisateur : l'audience, le ton (3 adjectifs), ce que le rendu ne doit PAS être, et une image de référence si disponible. Ne générer qu'après confirmation — évite les premiers jets rejetés.

## Blocs partagés (partials)
Les blocs répétés sur toutes les pages (bouton flottant, réassurance CTA, bandeau contact) ne s'éditent jamais page par page : modifier `partials/*.html` ou les variables de `data/site.json` (ex. `delai`), puis lancer `npm run build:partials`. Un test échoue si une page est désynchronisée ou si un délai de réponse annoncé dans le texte diffère de `data/site.json`.
