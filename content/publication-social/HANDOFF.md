# Handoff : réseaux sociaux M&S (état au 24/11/2026, 23h55)

Branche `social/lot-j37-j43`, worktree `~/SITE MS/.claude/worktrees/lot-j37-j43`, dossier `content/publication-social/`.

## Fait
- **9 posts publiés le 24/11** (J30, J32, J34 × FB/IG/X), tous « sent » dans Buffer : `lot-j30-j34.json`.
- **158 médias fixes créés (40 jours), 0 crédit ElevenLabs** : `lot-statiques.json` (statut `a_valider`, rien n'est programmé).
  Formats de carrousel : panorama (15 jours), objet (9), ticket (13), plus des images uniques.
- Code : `visuels/statiques/` (`moteur.py` formats, `scenes.py` dessins, `build.py` contenu par jour).
  Refaire un jour : `uv run --with pillow python build.py J45`. Planche de contrôle : `planche.py <sortie.jpg> <images…>`.

## À faire, dans l'ordre
1. Antoine valide les visuels et le programme (J45 = samedi 28/11, J47 = lundi 30/11).
2. Programmer J42, J43 et J44 (26 et 27/11 compris), puis J45, J47. Buffer gratuit : 10 posts programmés au maximum.
   J40 (23/11) et J41 (24/11) n'ont pas été publiés : à rattraper ou à sauter.
3. Corriger les textes (branche `claude/content-funnel-principle-5q3kof`) :
   - J29 et J75 : « 30,62 €/MWh depuis le 1er février 2026 (CRE) » → 1er août 2026 (février = 30,85). Sources secondaires concordantes, page officielle non lue.
   - J56 : mécanisme de capacité changé au 01/11/2026, la phrase X « noyé, sans ligne dédiée » est à revoir (idem page du site).
   - J31 : ne pas renvoyer à une série « étiquette n°X/5 » jamais publiée ; les visuels ne sont pas numérotés.
4. Corriger la page `tva-electricite-professionnelle.html`, qui annonce encore 5,5 % en production.
5. Rafraîchir J36 et le baromètre : août 2026 absent, dernière valeur septembre 2026.

## Limites
- Les photos réelles et les clips demandés par les briefs sont remplacés par des illustrations.
- Repères « J-36 … J-1 » : ce sont des mois (notation du brief, légendée), J15.
- Contrôle visuel fait sur planches réduites, pas image par image en pleine taille. Pas de relecture indépendante.
- `visuels/statiques/ech.py` et `__pycache__` : temporaires non suivis (suppression refusée).
- LinkedIn : jamais activé, les PDF sont prêts. Lien en bio Instagram à poser à la main.
