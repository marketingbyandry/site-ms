# Démarchage à froid — leads Waalaxy

9 templates MJML (3 segments × séquence de 3 emails) pour le démarchage à froid
de prospects scrapés via Waalaxy (LinkedIn). CTA vers le formulaire Tally
« Transmettre ma facture » sur `b2b.html`.

## Segments

- `chr-*` — hôtellerie-restauration
- `ind-*` — industrie / production
- `tert-*` — tertiaire (écoles, associations, santé/EHPAD)

## Séquence

- `*-e1` — accroche + offre (audit gratuit, positionnement cabinet d'expertise)
- `*-e2` — relance à J+4/5, angle différent par segment (groupement d'achat,
  ou donnée chiffrée du Baromètre pour `ind-e2`)
- `*-e3` — dernière relance à J+10, ton « je referme le dossier »

## Variables de personnalisation

`{{prénom}}` et `{{entreprise}}` — syntaxe generique à adapter selon l'outil
d'envoi retenu (pas encore choisi au moment de la rédaction).

## Habillage visuel

Dark theme reprenant la DA "version A" du site (`--dark #07131a`, `--cream
#f5f0e8`, `--teal #1a7a8a`, `--teal-glow #5ecfdc`), avec une photo en bandeau
d'en-tête par segment — issue de `~/Documents/ART BY ANDRY/SAVEE`, choisie
pour rester dans la palette teal/vert de la marque :

- `chr` (hôtellerie-restauration) → `Handlight_horizontal.webp`
- `ind` (industrie/production) → `Fogcity_green.webp`
- `tert` (tertiaire) → `Lightoneyes_horizontal.webp`

**Placeholders temporaires, à remplacer avant envoi réel** : les photos sont
recompressées (JPEG, 1000px, qualité 70) puis embarquées en base64 directement
dans le HTML — ça fait grossir chaque email à ~180-240 Ko. Gmail tronque
l'affichage des emails au-delà de 102 Ko ("message clipped"), donc **ces
templates ne doivent pas être envoyés tels quels**. Avant l'envoi réel :
héberger les images définitives (droits vérifiés, pas de simple moodboard
Savee) sur une URL publique et remplacer le `src` base64 par cette URL — ça
fera retomber chaque email à quelques dizaines de Ko (cible Designmodo :
sous 75 Ko).

## Sections guidées (v4)

Chaque email est découpé en blocs visuels distincts séparés par des filets
fins, plutôt qu'un seul bloc de texte qui s'enchaîne :

- **Accroche** courte (le problème)
- **Callout chiffré** (`19%`, ou le vrai mouvement de prix `74 → 104 €/MWh`
  pour `ind-e2`) — grossi, en vert, avec une légende en petites capitales —
  ou **callout citation** pour les emails sans chiffre dur (mécanisme du
  groupement d'achat), en bleu-teal
- **Explication** avec la phrase clé mise en évidence (`jamais par vous` /
  `jamais facturée au client`) en gras vert
- **Badge de réassurance** (`Audit gratuit · Sans engagement`) sur les
  emails de dernière relance (`*-e3`)
- **Ligne d'action** juste avant le bouton

Bouton CTA passé du teal au **vert de la marque** (`#4cde80`, texte foncé —
même logique que le hover des CTA du site).

## UX — inspiré de designmodo.com

Recherche sur designmodo.com/email-design-trends et
designmodo.com/how-to-choose-the-right-email-template-size, appliquée en v3 :

- **Structure** : header logo seul (~64px) → bannière image → **titre BLUF**
  (21px, gras, l'essentiel du message en une ligne) → corps → CTA → footer.
  Avant, le texte enchaînait direct sans titre ; en 2026 le consensus B2B est
  le "cut to the chase" — le lecteur doit saisir l'offre même s'il ne lit que
  la première ligne.
- **Bannière en vraie balise `<img>`** (plus en `background-url` CSS) : un
  alt text réel pour les lecteurs d'écran, et un rendu qui ne dépend plus du
  fallback VML Outlook — bénéfice indirect, le poids du fichier a baissé
  d'environ moitié (plus de duplication base64 pour le VML).
- **Boutons CTA raccourcis** : le "(2 min)" de l'ancien libellé e3 a été
  retiré (guideline Designmodo : 10-15 caractères, verbe d'action).
- **Objets d'email** laissés tels quels : déjà alignés sur le consensus B2B
  2026 ("clair et spécifique plutôt que clever").

## Tracking

Chaque bouton CTA pointe vers :

```
https://www.byandry.com/b2b.html?ref=ag&camp=<segment>-e<n>
```

- `ref=ag` — inchangé, crédite Antoine dans l'attribution commerciale
  existante (`middleware.js`, `SLUGS`).
- `camp=<segment>-e<n>` — **nouveau paramètre, pas encore géré par le
  middleware.** Objectif : mesurer la performance par segment/email sans
  toucher à l'attribution commission. À implémenter séparément (cookie
  dédié + super-property PostHog dédiée), cf. spec à écrire avant
  l'implémentation. Tant que ce n'est pas fait, le paramètre `camp` est
  ignoré par le site (aucune erreur, juste pas encore exploité).

## Build

```
mkdir -p html
for f in mjml/*.mjml; do
  npx mjml "$f" -o "html/$(basename "$f" .mjml).html"
done
```

## Hors périmètre (sessions futures)

- Choix de l'outil d'envoi (Apollo évoqué, non tranché)
- Implémentation du paramètre `camp` dans `middleware.js`
- Dashboard de visualisation des tendances par segment
