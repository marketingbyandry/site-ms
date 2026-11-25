# Handoff : réseaux sociaux M&S (état au 25/11/2026, 2h15)

Branche `social/lot-j37-j43`, worktree `~/SITE MS/.claude/worktrees/lot-j37-j43`, dossier `content/publication-social/`.

## Fait
- **9 posts publiés le 24/11** (J30, J32, J34 × FB/IG/X), tous « sent » dans Buffer : `lot-j30-j34.json`.
- **158 médias fixes créés (40 jours), 0 crédit ElevenLabs** : `lot-statiques.json` (statut `a_valider`, rien n'est programmé).
  Formats de carrousel : panorama (15 jours), objet (9), ticket (13), plus des images uniques.
- Code : `visuels/statiques/` (`moteur.py` formats, `scenes.py` dessins, `build.py` contenu par jour).
  Refaire un jour : `uv run --with pillow python build.py J45`. Planche de contrôle : `planche.py <sortie.jpg> <images…>`.

## À faire, dans l'ordre
0. Buffer relu le 25/11 à 1h56 : 0 post programmé, 4 brouillons périmés J19 (05/11) à supprimer ou garder. J44 n'a ni vidéo ni visuel.
1. Antoine valide les visuels et le programme (J45 = samedi 28/11, J47 = lundi 30/11).
2. Programmer J42, J43 et J44 (26 et 27/11 compris), puis J45, J47. Buffer gratuit : 10 posts programmés au maximum.
   J40 (23/11) et J41 (24/11) n'ont pas été publiés : à rattraper ou à sauter.
3. Textes corrigés (J6, J29, J31, J56, J75), PR brouillon `social/corrections-textes-q4`. Accise confirmée par la CRE (délibération 2026-147).
   Reste : validation du texte dirigeant J56.
4. Pages TVA et capacité corrigées, PR brouillon `fix/tva-20-capacite-2026` (323 tests passent). Reste : contrôle visuel, fusion.
5. Baromètre : NE PAS fusionner le PR #116 en l'état. Toutes les moyennes dépassent celles d'Energy-Charts (juin 73,66 / 66,07 ;
   juillet 103,90 / 95,23 ; septembre 149,75 / 143,30 ; octobre 170,26 / 165,83 ; août manquant / 122,80).
   Piste non prouvée : `lib/entsoe.mjs` ignore les points répétés que l'ENTSO-E omet. Corriger, recalculer, puis refaire J36.
   Le job GitHub du 1er septembre a échoué, d'où le trou d'août.

## Limites
- Les photos réelles et les clips demandés par les briefs sont remplacés par des illustrations.
- Repères « J-36 … J-1 » : ce sont des mois (notation du brief, légendée), J15.
- Contrôle visuel fait sur planches réduites, pas image par image en pleine taille. Pas de relecture indépendante.
- `visuels/statiques/ech.py` et `__pycache__` : temporaires non suivis (suppression refusée).
- LinkedIn : jamais activé, les PDF sont prêts. Lien en bio Instagram à poser à la main.
