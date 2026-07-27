# Mise à jour trimestrielle — Baromètre gaz

Chaque trimestre, avant de publier la synthèse éditoriale (voir
`docs/superpowers/specs/2026-07-27-barometre-energie-design.md`) :

1. Aller sur le site de Powernext (prix spot gaz TRF, moyenne du
   trimestre écoulé) ou l'Observatoire des marchés de la CRE
   (cre.fr) si Powernext ne publie pas de moyenne trimestrielle
   directement exploitable.
2. Noter le prix moyen en EUR/MWh, l'URL exacte consultée, et la
   date du jour de consultation.
3. Ajouter une entrée dans `data/barometre-gaz.json` (voir le
   schéma dans ce fichier) — ne jamais écraser une entrée
   existante, seulement en ajouter une nouvelle par trimestre.
4. Faire relire la nouvelle entrée par `quality-reviewer` avant de
   merger (même logique de revue que pour les mises à jour
   électricité automatiques).
