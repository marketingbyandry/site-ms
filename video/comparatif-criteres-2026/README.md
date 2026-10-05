# Film MS : « Comparer un fournisseur d'électricité pro » (42 s)

Vidéo motion design tirée de l'article `comparatif-fournisseurs-electricite-pro.html`, dans sa version v2 (branche `worktree-article-comparatif-v2`, ancre `#criteres`). Tous les chiffres et intitulés viennent de l'article.

## Rendus
- `renders/ms-comparatif-5-criteres-16x9.mp4` (1920×1080, site et LinkedIn)
- `renders/ms-comparatif-5-criteres-9x16.mp4` (1080×1920, Reels, Stories et Shorts)

## Structure (calée sur la voix)
| Temps | Chapitre | Ce qu'on voit |
|---|---|---|
| 0–1,9 s | Hook | Le prix dégringole à 0,155 €/kWh, tampon « ✓ Le moins cher », puis la caméra recule : ce n'est que la pointe d'un iceberg. Le tampon devient « Vraiment ? » |
| 1,9–10,9 s | 01 Le piège | « La partie visible », puis plongée sous l'eau : abonnement, frais de gestion, pénalités… « Le vrai coût est en dessous. » |
| 10,9–22,6 s | 02 La méthode | « 5 critères », puis la grille : chaque critère s'allume quand la voix le nomme |
| 22,6–28,9 s | 03 La preuve | Offre A contre offre B (80 000 kWh/an) : 13 520 € contre 13 660 €, tampon « +140 € par an » |
| 28,9–34,4 s | 04 Le bon moment | « Et surtout, anticipez. » : la jauge de marge fond jusqu'à la dernière semaine |
| 34,4–42 s | Signature | Logo, « Votre contrat, passé au crible. », gratuit et réponse en 24h |

## Audio
- Voix : Geneviève (ElevenLabs eleven_v3, prise 3). La phrase « Et comparez TÔT » était prononcée « comparez toutes » sur les 3 prises. Elle a été remplacée par « Et surtout… anticipez » (vérifiée par transcription), greffée à 27,17 s. Niveau −18,5 LUFS.
- Musique : ElevenLabs Music, générée pour ce film (42 s, 112 BPM, instrumentale vérifiée). Elle démarre au moment du reveal (1,9 s) : le hook vit sur ses effets sonores seuls.
- Effets : tics de compteur, impacts sur le reveal, sur les « 5 critères », sur le tampon +140 € et sur le logo.

## Reconstruire
```bash
node build.mjs                      # génère landscape/ et vertical/
cd landscape && npx hyperframes render -o ../renders/ms-comparatif-5-criteres-16x9.mp4
cd ../vertical && npx hyperframes render -o ../renders/ms-comparatif-5-criteres-9x16.mp4
```
