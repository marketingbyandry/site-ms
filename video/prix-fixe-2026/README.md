# Film MS : « Les avantages du prix fixe » (33 s)

Vidéo motion design tirée de l'article `prix-fixe-vs-indexe-electricite-pro.html`. Consigne : ne parler **que des avantages du prix fixe**. Chaque affirmation vient de l'article :
- kWh figé pour 1 à 3 ans ;
- coût connu précisément, quelle que soit l'évolution du marché de gros ;
- visibilité budgétaire sur plusieurs exercices ;
- sécurité quand la marge est serrée ;
- analyse gratuite de la facture, réponse sous 24h.

## Direction artistique
- Thème clair du site (`data-theme="light"`) : fond `#faf8f5`, encre `#0c2635`, teal `#1a7a8a`, vert `#4cde80`.
- Univers « diffusion sportive / jeu de foot » :
  - typo Barlow Condensed 900 italique ;
  - formes biaisées et chanfreinées, sans aucun bord arrondi ;
  - balayages diagonaux entre les scènes ;
  - bandeau de score avec chrono ;
  - carte joueur « Prix fixe 99 DEF ».

## Rendus
- `renders/ms-prix-fixe-avantages-16x9.mp4` (1920×1080)
- `renders/ms-prix-fixe-avantages-9x16.mp4` (1080×1920)
- `renders/poster-*.jpg` : image de la carte joueur (19,9 s)

## Structure (calée sur la voix)
| Temps | Scène | Ce qu'on voit |
|---|---|---|
| 0–4,5 s | Hook | Courbe de marché rouge qui s'emballe, écran qui tremble. À « Vous », tout se fige et une ligne teal plate « Prix fixe » traverse l'écran |
| 4,5–9,2 s | 01 Prix figé | « Prix fixe », la tuile €/kWh se verrouille, tampon « Figé. », puis « Pour 1 à 3 ans » |
| 9,2–13,6 s | 02 Coût connu | Écran coupé en diagonale : le marché de gros flambe à gauche, votre coût reste plat à droite, viseur « Précisément. » |
| 13,6–16,5 s | 03 Budget tenu | Exercices N, N+1, N+2 au même niveau, coche verte |
| 16,5–20,6 s | 04 Défense | Deux murs rouges serrent la marge, puis la carte joueur « Prix fixe » les repousse : « Meilleure défense. » |
| 20,6–27,9 s | 05 Votre étude | Logo, « Analyse votre facture gratuitement », « Un prix fixe plus compétitif vous attend », « Réponse en 24h » |
| 27,9–33 s | Signature | « Prix fixe. Budget tenu. », site et téléphone |

## Audio
- **Voix :** Geneviève, en **ElevenLabs eleven_v4**.
  - Balises d'intention `[excited]`, `[confident]`, `[warmly]`.
  - Prononciation imposée par l'IPA : `/ɛm ɛs/ Stratégie`. Les 3 prises sont justes (vérifié par transcription Scribe), prise 2 retenue.
  - Respirations allongées entre les idées : +2,25 s au total.
  - Niveau −18,3 LUFS.
- **Musique :** ElevenLabs Music, générée pour ce film.
  - Style habillage sportif, 124 BPM.
  - Instrumentale vérifiée : la transcription est vide.
  - Démarre dès la 1re image.
- **Bruitages ElevenLabs :**
  - `whoosh.mp3` sur chaque balayage ;
  - `crowd.mp3`, clameur de stade sur la carte joueur ;
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
