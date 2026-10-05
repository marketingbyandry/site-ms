# Film motion design M&S Strategy (2026)

Film de marque de 24,3 s, en deux formats : 16:9 (site, LinkedIn) et 9:16 (Reels, Stories, Shorts).
Cible : dirigeants de PME et ETI. Ton : percutant, premium, confiant.

## Contenu
- `brag-plan.md` : angle, storyboard, voix off, choix audio (le « pourquoi »).
- `src/template.html` : la composition unique. Le hook est sur la timeline principale, le récit est un sous-timeline `st` posé à 1,3 s.
- `src/assets/` : polices (Instrument Serif, Manrope), logo, voix off et musique ElevenLabs, bruitages (Kenney, CC0).
- `build.mjs` : génère `landscape/` et `vertical/` à partir du template.
- `renders/` : les MP4 finaux.

## Refaire le rendu
```bash
node build.mjs
cd landscape && npx hyperframes check && npx hyperframes render -f 30 -o ../renders/ms-strategy-motion-16x9.mp4
cd ../vertical && npx hyperframes check && npx hyperframes render -f 30 -o ../renders/ms-strategy-motion-9x16.mp4
```

## Variante voix féminine
- Voix « Clémence - Advertising » (ElevenLabs, eleven_multilingual_v2), même texte, « M&S Stratégie » prononcé à la française.
- Chaque phrase est replacée au début exact de la phrase d'Hugo : l'animation est identique, seule la voix change. Niveau aligné sur Hugo (-19,5 LUFS).
- Variante « Geneviève - News anchor » : même méthode. Sa 1re phrase démarre 0,15 s plus tôt et est accélérée de 16 % (sans changer la hauteur) pour tenir dans le créneau ; « Dix-neuf… moyenne » est accélérée de 4 %.
- Variante « Geneviève expressive » (modèle eleven_v3) : texte balisé (points de suspension, MAJUSCULES d'emphase, [pause], [warmly]) et « MS Stratégie ». Voix plus lente (21 s) : le récit est ralenti de 20 % (`stretch: 1.2` dans build.mjs), film de 27 s, musique et sons recalés automatiquement.
- Rendu : `VOICE=clemence node build.mjs` (ou `VOICE=genevieve`, `VOICE=genevieve-expressive`) puis render dans `landscape-clemence/` et `vertical-clemence/` → `renders/*-voix-femme.mp4` (Clémence) `renders/*-voix-genevieve.mp4` et `renders/*-voix-genevieve-expressive.mp4`.

## Audio
- Voix off : ElevenLabs, voix « Hugo from Paris », modèle eleven_multilingual_v2. Les scènes sont calées au mot près sur sa transcription (Scribe), avec un décalage de +1,7 s (le hook occupe 0 → 1,9 s).
- Musique : ElevenLabs Music v2.5 (instrumentale, transcription vide), lue à partir de 6,7 s pour que son arrêt net tombe à 23,3 s sur la signature. 0,55 pendant le hook, 0,3 sous la voix, 0,75 sur le logo.
- Hook : sound design ElevenLabs (impact grave calé sur J−0 à 1,35 s) + tics Kenney qui ralentissent avec le compteur.
- Projet ElevenLabs : flow « M&S Strategy — Motion design 2026 ».

## Chiffres affichés (tous repris de index.html)
19 % d'économies moyennes · 70M kWh négociés en 2025 · 94 % de renouvellement · 80 % des dirigeants arrivent à J−6 · depuis 2012 · réponse en 24h (data/site.json).
Les cartes « Offre 01…08 » sont volontairement anonymes : aucun nom de fournisseur, aucun prix.
