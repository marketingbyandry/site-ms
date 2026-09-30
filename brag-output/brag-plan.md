# Brag Plan: M&S Strategy (cabinetms.fr)

## What is this app?
M&S Strategy est un cabinet de courtage en énergie indépendant, actif depuis 2012 : il met l'ensemble des fournisseurs de gaz et d'électricité en concurrence pour le compte de ses clients pros et particuliers, rémunéré par commission fournisseur (jamais par le client) — 100 000 clients accompagnés, 80+ collaborateurs, 8 agences en France.

## The angle
Une carte de visite de marque, format vertical, qui traite l'énergie comme un produit tech premium plutôt que comme un secteur poussiéreux. Pas de discours commercial appuyé, pas de promesse criée : une démonstration silencieuse de maîtrise — la marque se pose, les preuves apparaissent une à une avec la précision d'un keynote produit, et se retire. Le contraste est le propos : un métier perçu comme austère (courtage énergie B2B), filmé avec la retenue et la texture d'un lancement de produit soigné.

## Hook (first 2-3 seconds)
Noir presque total. Un halo teal→vert dérive lentement dans l'obscurité (extension directe du `hero-glow.js` déjà en prod sur le site — pas un effet inventé). Grain fin. Aucun texte. La voix off démarre sur le premier mot pile au moment où le halo se stabilise — le silence visuel avant la marque est le hook.

## Key moments (the middle)
- Le lockup logo M&S Strategy (fichier réel `ms-strategy-logo.png`) se résout depuis le halo — pas d'agrandissement du blason lion en illustration dominante, juste le lockup à son échelle normale.
- Un trait de lumière fin (light-streak teal-glow) balaie une fois sous le wordmark au moment où il se fige — accent unique, pas répété.
- Trois preuves chiffrées réelles du site apparaissent en gros plan cinématique, une par une, jamais toutes à l'écran en même temps : **19% d'économies moyennes**, **94% de taux de renouvellement**, **100 000 clients accompagnés**. Traitement macro/glow sur le chiffre seul (pas de dashboard chargé).
- Trois secteurs cibles apparaissent en tags séquentiels sous forme de petites capsules glow (boulangerie, hôtellerie-restauration, sites industriels énergivores) — présentés comme exemples illustratifs du type de profil accompagné, pas comme capture d'écran du site.
- Le lockup logo reste présent en petite marque discrète en coin bas tout du long des scènes 3 et 4 (présence maximale sans surcharge — cf. contrainte utilisateur).

## Outro / punchline
Retour plein cadre du lockup logo, centré, à pleine présence. Une ligne signature : *« Votre énergie, négociée. »* — puis `cabinetms.fr`. Fondu doux vers le noir, pas de CTA criard, la marque se referme comme elle s'est ouverte.

## User flow worth showing
none — landing-page only (cabinetms.fr est un site vitrine sans parcours applicatif ; la matière la plus forte est l'identité visuelle du hero + les preuves chiffrées réelles, utilisées comme centre de gravité de la vidéo).

## Tone
- Preset: `polished`
- Creative direction: « Keynote produit sobre — pas seulement Apple : glow tactile façon lancement SaaS premium, un seul élément focal par plan, jamais de surcharge. Inspiré d'un lot de références motion (voir ci-dessous), sans copier aucune d'entre elles. »
- Interpretation: Confiance par la retenue. Peu de scènes, chacune tenue plus longtemps que le minimum lisible. Chaque plan cadre un seul sujet (un chiffre, un tag, le logo) — jamais deux idées en même temps à l'écran. Les transitions sont propres et discrètes, jamais spectaculaires.

## Références de motion (inspiration, non copiées)
Fournies par l'utilisateur (4 TikTok) + moodboard Savee existant. **Mise à jour** : les 4 vidéos ont été téléchargées et décomposées en frames réelles (ffmpeg, ~1 frame/2-3s) pour une analyse motion précise — la première passe (miniatures seules via oEmbed) contenait une erreur d'attribution, corrigée ci-dessous. Utilisées pour calibrer le *comment*, jamais le contenu :

- **Réf. 1 — « Spotify glow ad »** (marque officielle) — logo/wordmark centré sur noir avec halo teal/vert dérivant en bord de cadre → gros plan UI téléphone (widgets, grille d'icônes) → écrans d'app en scroll → transition floue/glitch → texte overlay centré sur fond glow uni → **un point de lumière ponctuel qui traverse l'écran en diagonale, une seule fois** → retour logo qui se fige et se tient à l'arrêt. → calque direct pour l'ouverture/fermeture (halo dérivant + logo qui se fige + un seul passage de lumière), déjà en prod via `hero-glow.js`.

- **Réf. 2 — reel BTS multi-projets** (compilation split-écran Final Result / Motion Design / Sound Design) — pas une direction visuelle unique réutilisable telle quelle, mais confirme deux techniques précises : (a) logo minimal centré (icône + wordmark) sur noir avec glow radial en bas de cadre, tenu à l'arrêt en clôture — même grammaire que notre scène 5 ; (b) un seul trait de lumière vertical fin qui traverse un fond de glow coloré, seul à l'écran. → confirme le niveau de sobriété voulu pour le logo de clôture et l'accent light-streak (palette de la réf. chaude/orange — on garde notre teal/vert, seule la technique est reprise).

- **Réf. 3 — pub SaaS complète « rerun.build »** (correction : ce n'est PAS une vidéo de making-of comme supposé depuis la miniature seule, c'est une pub finie). Structure réelle : accroche tapée à l'écran avec **un trait de lumière qui souligne le texte en le révélant** (le trait glisse sous la ligne PENDANT qu'elle apparaît, pas un flash statique après coup) → pain-points barrés d'une croix rouge, un par un → sol 3D isométrique en grille avec nœuds glow reliés par des lignes de lumière qui se dessinent (révélation séquentielle *connectée*, pas de simples cartes qui fade) → logo + wordmark centrés sur glow radial, CTA qui pulse avec clic de curseur simulé. → **recalibre la scène 2** : le trait de lumière doit accompagner l'écriture du texte, pas juste balayer un texte déjà figé. **Recalibre les scènes 3-4** : envisager de relier chiffres/tags par de fines lignes de lumière plutôt que des capsules isolées — mais en restant 2D/épuré (pas le sol 3D isométrique, trop chargé pour le ton `polished`).

- **Réf. 4 — « dashboard cinématique »** (confirmé) — plans macro sur UN SEUL élément d'UI à la fois, faible profondeur de champ (arrière-plan flouté), **la caméra dérive lentement en diagonale sur le panneau (léger parallaxe, jamais un cadrage totalement figé)**, un trait de lumière bleu balaie le cadre en diagonale, **une barre de progression se remplit avec un glow cyan pendant qu'un pourcentage apparaît** (ex. "42% Guest Checkout Conversion") → clôture sur une icône logo minuscule centrée sur noir pur. → **recalibre la scène 3** : au lieu d'un chiffre statique qui apparaît en glow, une fine jauge qui SE REMPLIT jusqu'au chiffre (19%, 94%) avec le même glow cyan — plus dynamique, plus fidèle à la réf. Introduire un très léger drift de caméra plutôt qu'un cadrage figé.

- **Savee (existant)** — grain/gradient teal-vert (réf. 07-grain-gradient), minéralité épurée façon Cité Radieuse pour la rigueur des aplats — texture et palette, pas de motion.

## Format: vertical — 1080x1920
## Duration: ~24s

## Visual identity (from the project)
- Background: `#07131a` (dark, exact valeur du site)
- Accent teal: `#1a7a8a` → `#5ecfdc` (teal-glow)
- Accent vert: `#4cde80` → `#7aeea4` (green-glow)
- Text: `#f5f0e8` (cream)
- Muted: `#8aacb4`
- Display/quote font: Instrument Serif (italique, comme `.ptitle`/`.bh` sur le site)
- Wordmark/UI font: Satoshi (comme `.nl`/`.sn`)
- Strongest visual element: le halo teal/vert dérivant en hero (`hero-glow.js`), déjà en prod — c'est l'ADN visuel réel de la marque, pas un effet ajouté pour la vidéo.
- Logo: `assets/ms-strategy-logo.png` (573×146, lockup blason+wordmark) — utilisé à l'échelle lockup, jamais agrandi en illustration dominante (contrainte explicite : pas de blason lion trop présent littéralement).

## Share copy (draft)
« Le courtage énergie n'a jamais eu cette allure. M&S Strategy, depuis 2012. »

## Audio direction
- Role: voix off (Kokoro/Hyperframes) + lit très sobre en fond, presque silencieuse
- Music: nappe minimale, instrumentale, ambiance premium/feutrée — pas de morceau à identité forte, elle doit rester sous la voix
- Music treatment: entrée quasi imperceptible sous le halo (scène 1), présence stable et basse sous la voix, léger swell au retour du logo (scène 5), fade-out sur le fondu final
- Music cue guidance: à détecter à la composition (`npx hyperframes beats`) ; 1 cue forte ciblée sur la fixation du wordmark (fin scène 2) et 1 sur le retour du logo (début scène 5) ; fenêtre de grille rythmique pour les reveals séquentiels des scènes 3 et 4
- Audio-reactive treatment: subtil — le halo de fond peut respirer légèrement avec l'énergie de la musique, rien de plus (pas de barres, pas d'effet waveform)
- SFX posture: sparse — un souffle discret sur l'apparition du logo, un tick doux par tag/chiffre séquentiel, rien de plus
- Audio-coupled moments: chaque chiffre et chaque tag secteur est un "arrival" sonore discret et synchronisé à son apparition
- Restraint rule: jamais de sting dramatique, jamais de bass drop, jamais de sfx "whoosh" générique — la sobriété du son doit égaler celle du visuel

## Narration (voix off — texte complet)
> M&S Strategy. Cabinet de courtage en énergie, indépendant depuis 2012. Nous mettons les fournisseurs en concurrence — pour que vous n'ayez plus à le faire. Dix-neuf pour cent d'économies en moyenne. Quatre-vingt-quatorze pour cent de nos clients renouvellent. De la boulangerie de quartier au site industriel énergivore, nous accompagnons les professionnels partout en France. M&S Strategy — votre énergie, négociée.

(Texte calé sur les 5 scènes ; timing exact des segments dérivé de la durée réelle du TTS généré, pas figé a priori.)

## Storyboard

*Niveau de détail : direction artistique complète (caméra, lumière, typographie, sync son), pas une simple liste de plans — chaque scène est écrite pour qu'un compositeur (Hyperframes) puisse l'exécuter sans deviner une intention.*

### Scene 1 — Hook : le halo dans le noir — 3s
Ouverture sur un noir quasi absolu — `#07131a` poussé vers le noir pur pendant les 4 premiers dixièmes de seconde, aucun mouvement visible, un silence retenu avant même que quoi que ce soit n'existe à l'écran. À 0.4s, un halo radial s'allume hors-centre, dans le tiers inférieur-droit du cadre : cœur teal (`#1a7a8a`), bord qui saigne vers le vert-glow (`#7aeea4`) — extension directe et littérale du `hero-glow.js` déjà en prod, pas un effet réinventé pour la vidéo. Le halo ne pulse pas, ne clignote pas : il **dérive**, grossit d'environ 15% sur toute la durée du plan, dans une seule direction, comme une respiration qu'on relâche lentement. Un grain fin (cohérent avec le traitement grain du site) recouvre l'intégralité du cadre en continu — jamais lissé, c'est la signature tactile qui distingue ce film d'un motion graphics générique. Aucun texte, aucun logo. Caméra : totalement statique — l'immobilité du cadre EST la tension. Son : quasi-silence, la nappe musicale entre sous -30dB, plus ressentie qu'entendue. La voix off pose sa première syllabe ("M&S…") dans les 3 derniers dixièmes de seconde du plan, exactement quand le halo atteint sa taille stabilisée — la coupe vers la Scène 2 tombe sur la syllabe, ni avant ni après.
Sequential/interaction: none
Audio intent: silence qui installe la tension avant la marque ; la voix off démarre pile sur "M&S Strategy" au moment où le halo se stabilise
Audio-coupled idea: none
Music: nappe qui entre de façon quasi imperceptible
Transition mood: soft → Scene 2

### Scene 2 — Reveal : le wordmark se fige — 4s
Le lockup logo (fichier réel `ms-strategy-logo.png`, ratio 573×146 préservé) se résout depuis le cœur du halo — pas un cut sec : l'opacité monte de 0 à 100% sur 0.5s pendant qu'un très léger scale-in (103%→100%) lui donne du poids, comme s'il se posait plutôt qu'il n'apparaissait. Il se stabilise centré, à environ 38% de la largeur du cadre — échelle lockup, jamais agrandi en illustration dominante. À l'instant où il se fige (~1.2s dans le plan), la tagline commence à s'écrire en dessous, en Instrument Serif italique, crème (`#f5f0e8`) : *"Cabinet de courtage en énergie, indépendant depuis 2012."* — conformément à la réf. 3 corrigée (pub `rerun.build`), **un trait de lumière fin teal-glow (2-3px, cœur dur, bloom doux autour) glisse de gauche à droite exactement SOUS la ligne, EN SYNCHRO avec l'apparition des caractères** — le bord d'attaque du trait est ce qui "écrit" la ligne, comme un curseur fait de lumière, pas un flash qui balaie un texte déjà là. La ligne complète se stabilise vers 3.2s et tient à pleine lisibilité jusqu'à la fin du plan (règle de lisibilité du projet : jamais retirée avant d'être lue). Caméra : cadre statique, tout le mouvement vit dans la typographie et le trait de lumière. Son : un swell chaud et bas commence sous la voix ; le mouvement du trait de lumière est couplé à un tick haute-fréquence quasi inaudible, plus texture qu'événement.
Sequential/interaction: none (un seul mouvement continu de résolution, texte et trait de lumière synchronisés caractère par caractère)
Audio intent: confiance calme, la marque s'affirme sans forcer
Audio-coupled idea: le trait de lumière est synchronisé à un tick sonore discret, couplé à la vitesse d'apparition du texte
Music: cue forte ciblée sur la fixation du wordmark
Transition mood: clean → Scene 3

### Scene 3 — Preuve : les chiffres réels — 6s
Trois beats macro séquentiels, ~1.8-2s chacun, coupe sèche entre eux (pas de crossfade — le ton `polished` demande des transitions "clean", jamais spectaculaires). **Beat 1** : le cadre se remplit d'un chiffre glow "19%" en display bold, remplissage dégradé teal-glow — mais le chiffre n'apparaît pas statique : un arc de jauge fin (trait courbe, cœur teal, bord cyan-glow) se dessine de vide à plein sous/autour du chiffre sur ~0.6s, le remplissage du chiffre s'illuminant au même rythme que la jauge se complète (cf. réf. 4 corrigée — technique de progress-fill, pas un pop-in statique). Légende dessous, discrète (`#8aacb4`), petites capitales : "économies moyennes". **Beat 2** : coupe sèche, même traitement, "94%" — la jauge se remplit plus vite (c'est le chiffre le plus haut, le remplissage doit se sentir plus assuré/complet), légende "taux de renouvellement". **Beat 3** : "100 000" — pas de jauge (c'est un compte, pas un pourcentage) : les chiffres défilent rapidement façon odomètre (~0.4s) de 0 à 100 000, avec un très léger dépassement-puis-stabilisation (100 000 → brièvement 100 04X → se stabilise), légende "clients accompagnés". Sur l'ensemble des 3 beats : un drift de caméra presque imperceptible — le cadre pousse très légèrement en avant (2-3% de scale sur les 6s) et s'incline d'un cheveu hors-axe, le repère parallaxe de la réf. dashboard cinématique, gardé assez subtil pour être ressenti plutôt que vu. Le lockup logo reste petit, coin bas-gauche, opacité légèrement remontée (~8%) par rapport à son repos pour rester lisible sans concurrencer les chiffres. Son : un tick doux à chaque complétion de jauge / chaque chiffre qui se pose, chacun des 3 beats sur un micro-intervalle légèrement montant — donne une sensation d'élan ascendant sans être une gamme musicale littérale.
Sequential/interaction: yes — les 3 chiffres arrivent l'un après l'autre, chacun tenu ~1.5-2s avant de céder la place au suivant
Audio intent: rythme métronomique, presque scientifique — la preuve qui s'égrène
Audio-coupled idea: un tick doux à chaque arrivée de chiffre, couplé à la complétion de la jauge (beats 1-2) ou à l'arrêt du défilement (beat 3)
Music: continue, stable, discrète
Transition mood: clean → Scene 4

### Scene 4 — Preuve : les secteurs accompagnés — 6s
Reprend exactement le rythme de la Scène 3 (même timing de coupe, même drift de caméra) mais change de registre — de l'abstrait (les chiffres) au concret (qui est réellement accompagné). Trois capsules-tags glassmorphiques sombres, bordure 1px teal-glow, arrivent une par une, ~1.8-2s chacune : *Boulangerie* → *Hôtellerie-restauration* → *Site industriel énergivore* (présentées explicitement comme exemples illustratifs du profil client, pas comme captures du site). Chaque capsule entre avec une légère dérive vers le haut (8-10px + fade-in, ~0.3s) plutôt qu'une coupe sèche — pour différencier visuellement "exemple concret" d'"abstrait chiffré" tout en restant dans la même famille visuelle. Typographie : label en Satoshi medium, texte crème sur carte glass sombre. Le lockup logo reste coin bas-gauche, inchangé depuis la Scène 3, pour ancrer la continuité visuelle entre les deux scènes de preuve. Son : même langage de tick qu'en Scène 3 mais une quinte plus bas — marque le passage du chiffre au nom sans rompre l'identité sonore.
Sequential/interaction: yes — 3 tags, arrivée séquentielle, ~1.5-2s de tenue chacun
Audio intent: élargissement — on passe du chiffre abstrait au concret humain (les métiers réels accompagnés)
Audio-coupled idea: même tick discret qu'en scène 3, quinte plus basse pour marquer la transition de nature (chiffre → métier)
Music: continue
Transition mood: soft → Scene 5

### Scene 5 — Outro : le logo revient — 5s
Retour dur au noir plein cadre pendant un instant (0.2s) — une respiration avant la clôture, en miroir de l'ouverture immobile de la Scène 1. Le lockup logo revient, mais cette fois à sa plus grande présence de tout le film (environ 55% de la largeur du cadre, centré) — la récompense d'avoir été tenu petit et discipliné pendant quatre scènes. Il se résout avec le même matérialisation douce qu'en Scène 2 (opacité + léger scale-settle) mais plus lente, plus cérémonielle (~1s). En dessous, la ligne signature se pose en Instrument Serif italique : *"Votre énergie, négociée."* — pas d'animation d'écriture cette fois, elle se résout directement avec le logo, un seul beat unifié plutôt qu'une séquence (cette scène doit se sentir comme une expiration, pas une nouvelle révélation). En dessous, plus petit, discret : `cabinetms.fr`. Tenue à pleine clarté ~1.8s (plancher de lisibilité du projet, respecté). Dernières 1.5s : fondu lent et régulier vers le noir — logo, texte et halo s'estompent ensemble au même rythme, rien ne traîne après la disparition d'un autre élément. Son : la musique gonfle doucement au retour du logo (le seul mouvement dynamique volontaire d'une partition par ailleurs retenue) puis s'éteint au même rythme que l'image, atterrissant sur le silence exactement quand le cadre devient noir — pas de silence après le fondu, pas de son qui dépasse l'image.
Sequential/interaction: none
Audio intent: clôture confiante, sans emphase forcée
Audio-coupled idea: léger swell musical au retour du logo, fade-out synchronisé image/son jusqu'au silence complet
Music: swell puis fade-out sur le noir final
Transition mood: soft → fin

**Music mood for this video:** nappe instrumentale premium/feutrée, jamais dominante, rythme métronomique discret pour les reveals séquentiels
**Audio summary:** silence → voix calme et confiante posée sur une nappe quasi imperceptible → légers ticks synchronisés sur chaque preuve → swell doux et fade-out final sur le retour du logo.
