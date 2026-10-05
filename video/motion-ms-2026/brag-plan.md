# Brag Plan : M&S Strategy, film motion design 2026

## C'est quoi ?
Cabinet de courtage en énergie indépendant (depuis 2012) : il met tout le marché en concurrence pour négocier les contrats gaz et électricité des entreprises, et c'est le fournisseur qui le rémunère, pas le client.

## L'angle
Le temps joue contre le dirigeant. Le site le dit lui-même : « Votre prochain contrat énergie se joue probablement aujourd'hui » et « 80 % des dirigeants arrivent [à J−6 mois] ». Le film transforme cette urgence en tension visuelle (une frise qui défile vers J−0), puis la relâche avec la réponse M&S : mise en concurrence, chiffres réels, zéro coût.

## Hook (0 à 1,9 s) : le compte à rebours de l'échéance
Pas de texte qui apparaît en gros : une mécanique visuelle.
1. 0,0 s : une courbe de prix de l'énergie se trace à toute vitesse, nerveuse et lumineuse, comme un électrocardiogramme du marché qui grimpe (le site rappelle +5 à +7 %/an).
2. En même temps, un compteur géant « J−730 » défile et ralentit (flou de mouvement qui se dissipe, tics sonores qui s'espacent).
3. 1,35 s : J−0. Tout vire au rouge « Critique » du site : impact grave (sound design ElevenLabs), flash rouge, tremblement de caméra.
4. 1,55 s : « J− » s'éclipse, le « 0 » se recentre et la caméra plonge à travers lui : son trou devient l'écran et révèle « Votre prochain contrat d'énergie se joue *aujourd'hui.* », pendant que la voix démarre.

Pourquoi ça accroche : du mouvement dès la première image, une question implicite (« quelle échéance ? »), une tension qui monte (chiffre qui baisse, courbe qui monte) puis une rupture nette (rouge + impact). Le cerveau veut connaître la suite.

## Moments clés
- La frise « Votre fenêtre de négociation » du site (J−24 → J−0) : un curseur glisse vers la droite, les pastilles passent d'Optimal à Critique, « 80 % » claque sur J−6.
- La mise en concurrence : 8 cartes « offre fournisseur » arrivent une par une, une seule s'allume en vert (la meilleure).
- Les chiffres réels du site, en comptage : 19 % d'économies moyennes · 70M kWh négociés en 2025 · 94 % de renouvellement.

## Outro
« Vous ne nous payez jamais. » en plein cadre, puis le tigre M&S, le wordmark, « Étude gratuite · Réponse en 24h ».

## Parcours utilisateur montré
Site vitrine sans app : on recrée les vrais éléments d'interface (frise de négociation, cartes fournisseurs anonymisées, bloc de stats du hero).

## Ton
- Preset : cinematic × app-store
- Direction : film de marque premium, façon Stripe ou Apple : percutant, premium, confiant
- Interprétation : cuts nets calés sur le beat, typo très grande, aucune fioriture ; l'énergie vient du rythme et de la typo, pas d'effets gadgets.
- À éviter (validé par Andry) : corporate tiède, trop gadget, trop long.

## Formats
- Paysage 1920×1080 (site, LinkedIn)
- Vertical 1080×1920 (Reels, Stories, Shorts)
## Durée : 24,3 s (hook 1,9 s + récit calé sur la voix off)

## Identité visuelle (reprise du site)
- Fond : #07131a (--dark), #0a1f28 (--dark2)
- Accent : #2bb5c8 (--teal-light), #5ecfdc (--teal-glow), #4cde80 (--green)
- Texte : #f5f0e8 (--cream), #8aacb4 (--muted)
- Typo titres : Instrument Serif (police signature du site)
- Typo texte : Manrope (remplace Satoshi : Fontshare est inaccessible depuis l'environnement de rendu)
- Élément fort : la frise J−24 → J−0 et le halo teal du hero

## Voix off (ElevenLabs, « Hugo from Paris », eleven_multilingual_v2)
> Votre prochain contrat d'énergie se joue aujourd'hui. Pourtant, huit dirigeants sur dix s'y prennent trop tard. Nous mettons tout le marché en concurrence, pour vous. Dix-neuf pour cent d'économies en moyenne. Et vous ne nous payez jamais. M&S Strategy. Votre étude gratuite, en vingt-quatre heures.

Tous les chiffres viennent du site (index.html, data/site.json) : aucun chiffre inventé.

## Audio
- Rôle : soutien cinématique et percutant
- Musique : générée par ElevenLabs Music (électro corporate premium ~112 BPM, montée à 15 s, arrêt net), mixée sous la voix (~0,25)
- Cues : détectés au montage (`hyperframes beats`)
- SFX : sobres, calés sur le mouvement (impact au hook, tics sur les cartes, hit sur le logo)
- Retenue : pas de whoosh à chaque cut, la voix reste toujours intelligible

## Storyboard (calé sur la voix)
0. **Hook** : compte à rebours J−730 → J−0, courbe de prix, bascule au rouge, plongée dans le « 0 ».
1. **Accroche** : « Votre prochain contrat d'énergie / se joue aujourd'hui. » révélée à travers le « 0 ».
2. **Urgence** : frise J−24 → J−0, le curseur glisse, « 8 dirigeants sur 10 » arrivent trop tard (J−6, pastille Tardif).
3. **Concurrence** : 8 cartes d'offres arrivent une à une, une seule s'allume en vert, « Tout le marché, en concurrence. »
4. **Preuve** : 19 % compte vers sa valeur en XXL, puis la rangée 70M kWh · 94 % · depuis 2012.
5. **Punch** : « Vous ne nous payez jamais. » (plein cadre, crème sur noir)
6. **Signature** : tigre M&S + wordmark, « Étude gratuite · Réponse en 24h », « Courtier en énergie indépendant depuis 2012 ».

## Texte de partage (brouillon)
Votre prochain contrat d'énergie se joue aujourd'hui. 8 dirigeants sur 10 s'y prennent trop tard. On met tout le marché en concurrence pour vous : étude gratuite, réponse en 24h.
