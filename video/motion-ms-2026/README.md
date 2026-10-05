# Film motion design M&S Strategy (2026)

Film de marque de 23 s, en deux formats : 16:9 (site, LinkedIn) et 9:16 (Reels, Stories, Shorts).
Cible : dirigeants de PME et ETI. Ton : percutant, premium, confiant.

## Contenu
- `brag-plan.md` : angle, storyboard, voix off, choix audio (le « pourquoi »).
- `src/template.html` : la composition unique (HTML + GSAP), source de vérité des deux formats.
- `src/assets/` : polices (Instrument Serif, Manrope), logo, voix off et musique ElevenLabs, bruitages (Kenney, CC0).
- `build.mjs` : génère `landscape/` et `vertical/` à partir du template.
- `renders/` : les MP4 finaux.

## Refaire le rendu
```bash
node build.mjs
cd landscape && npx hyperframes check && npx hyperframes render -f 30 -o ../renders/ms-strategy-motion-16x9.mp4
cd ../vertical && npx hyperframes check && npx hyperframes render -f 30 -o ../renders/ms-strategy-motion-9x16.mp4
```

## Audio
- Voix off : ElevenLabs, voix « Hugo from Paris », modèle eleven_multilingual_v2. Les scènes sont calées au mot près sur sa transcription (Scribe), avec un décalage de +0,4 s.
- Musique : ElevenLabs Music v2.5 (instrumentale, transcription vide), lue à partir de 8 s pour que son arrêt net tombe à 22 s sur la signature. Volume baissé sous la voix (0,3), puis remonté à 0,75 sur le logo.
- Projet ElevenLabs : flow « M&S Strategy — Motion design 2026 ».

## Chiffres affichés (tous repris de index.html)
19 % d'économies moyennes · 70M kWh négociés en 2025 · 94 % de renouvellement · 80 % des dirigeants arrivent à J−6 · depuis 2012 · réponse en 24h (data/site.json).
Les cartes « Offre 01…08 » sont volontairement anonymes : aucun nom de fournisseur, aucun prix.
