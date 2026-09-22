# SITE MS — Instructions projet

## Testing
Après toute modification HTML/CSS/JS sur ce repo, lancer la suite de tests complète (`npm test`) et confirmer que tous les tests passent avant de committer (baseline actuelle : 173 tests). Si un changement modifie du texte ou du markup testé, mettre à jour l'assertion concernée dans le même commit.

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

## Creative/Visual Work
Avant de produire un rendu visuel (mockup, campagne, direction artistique), faire confirmer par l'utilisateur : l'audience, le ton (3 adjectifs), ce que le rendu ne doit PAS être, et une image de référence si disponible. Ne générer qu'après confirmation — évite les premiers jets rejetés.
