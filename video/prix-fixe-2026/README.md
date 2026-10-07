# Film MS : « Les avantages du prix fixe » (33 s)

Vidéo motion design tirée de l'article `prix-fixe-vs-indexe-electricite-pro.html`. Consigne : ne parler **que des avantages du prix fixe**. Chaque affirmation vient de l'article :
- kWh figé pour 1 à 3 ans ;
- coût connu précisément, quelle que soit l'évolution du marché de gros ;
- visibilité budgétaire sur plusieurs exercices ;
- sécurité quand la marge est serrée ;
- analyse gratuite de la facture, réponse sous 24h.

## Direction artistique : « Précision cinétique »
Croisement de la télémétrie de F1 et du défilé de mode (campagnes Nike), sur le thème clair du site (`#faf8f5`, encre `#0c2635`, teal `#1a7a8a`, vert `#4cde80`). Aucune citation littérale d'un univers (pas de carte, pas de stade) : on emprunte l'énergie, pas les objets.
- **Typo à deux régimes :** Barlow Condensed 900 **droite** = la maîtrise (prix fixe) ; **italique** rouge avec traînée = la vitesse subie (le marché). JetBrains Mono pour les relevés, Instrument Serif italique pour les légendes de défilé (« Look 01/05 », « précisément. »).
- **Géométrie :** angles droits uniquement, filets fins, papier millimétré, repères d'impression en équerre, crochets « [ ] ».
- **Mouvement :** révélations par le bas derrière une ligne (défilé), impacts nets sans flou, échos qui convergent et se verrouillent (« Figé. »), traînées de vitesse horizontales entre les scènes, coupes « flash » de deux images.
- **HUD télémétrie :** chrono au millième, secteurs qui passent au vert, relevé permanent « Δ prix 0,000 % » : la stabilité est la donnée affichée.
- **Scène signature :** deux murs rouges serrent la marge, des crochets « prix fixe » s'ouvrent et tiennent l'écart.

## Rendus
- `renders/ms-prix-fixe-avantages-16x9.mp4` (1920×1080)
- `renders/ms-prix-fixe-avantages-9x16.mp4` (1080×1920)
- `renders/poster-*.jpg` : « Meilleure défense » entre les crochets (20,2 s)

## Structure (calée sur la voix)
| Temps | Scène | Ce qu'on voit |
|---|---|---|
| 0–4,5 s | Hook | Tracé de marché rouge, relevé €/MWh qui s'affole, « s'emballe ? » en italique avec traînée. À « Vous » : flash, verrou, tout se fige, ligne teal « Δ 0,000 % » |
| 4,5–9,2 s | 01 Prix figé | « Prix fixe », panneau €/kWh verrouillé, échos de « Figé. » qui convergent, « Pour 1 à 3 ans » |
| 9,2–13,6 s | 02 Coût connu | Deux tracés de télémétrie superposés : le marché de gros flambe en haut, votre coût reste plat en bas, viseur « précisément. » |
| 13,6–16,5 s | 03 Budget tenu | Exercices N, N+1, N+2 au même niveau, ligne verte et coche |
| 16,5–20,6 s | 04 Défense | Coupe flash, deux murs rouges serrent la marge, les crochets « prix fixe » repoussent et tiennent l'écart |
| 20,6–27,9 s | 05 Votre étude | Logo, « Analyse votre facture gratuitement », « Un prix fixe plus compétitif vous attend », « Réponse en 24h » (compteur) |
| 27,9–33 s | Signature | « Prix fixe. Budget tenu. », site et téléphone |

## Audio
- **Voix :** Geneviève, en **ElevenLabs eleven_v4**.
  - Balises d'intention `[excited]`, `[confident]`, `[warmly]`.
  - Prononciation imposée par l'IPA : `/ɛm ɛs/ Stratégie`. Les 3 prises sont justes (vérifié par transcription Scribe), prise 2 retenue.
  - Respirations allongées entre les idées : +2,25 s au total.
  - Niveau −18,3 LUFS.
- **Musique :** ElevenLabs Music, générée pour ce film.
  - Techno minimale de défilé, 126 BPM, hi-hats « mouvement d'horlogerie ».
  - Baissée presque à zéro pendant le gel (2,7–3,3 s) pour faire entendre le silence.
  - Instrumentale vérifiée : la transcription est vide.
  - Démarre dès la 1re image.
- **Bruitages ElevenLabs :**
  - `pass.mp3`, passage d'air à grande vitesse sur chaque traînée ;
  - `lock.mp3`, verrou mécanique sur le gel, « Figé » et les crochets ;
  - `shutter.mp3`, déclencheur photo sur les coupes flash ;
  - plus les impacts et clics de la série.
- **Mastering :** le rendu baisse tout le mix pour respecter −1 dBTP. On repasse donc le son des MP4 dans un limiteur puis un `loudnorm`, sans réencoder l'image.

## Reconstruire
```bash
node build.mjs
cd landscape && npx hyperframes render -o ../renders/ms-prix-fixe-avantages-16x9.mp4
cd ../vertical && npx hyperframes render -o ../renders/ms-prix-fixe-avantages-9x16.mp4
# mastering (pour chaque fichier, rendu renommé en .raw.mp4) :
ffmpeg -i X.raw.mp4 -c:v copy -af "volume=9dB,alimiter=limit=0.8:attack=2:release=60:level=disabled,loudnorm=I=-16.5:TP=-1.2:LRA=11,aresample=48000" -c:a aac -b:a 192k -movflags +faststart X.mp4
```
