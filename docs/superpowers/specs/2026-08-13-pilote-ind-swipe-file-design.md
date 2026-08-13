# Pilote IND — élargissement du scope de la campagne cold outreach

## Contexte

La campagne de démarchage à froid (leads Waalaxy) existe déjà pour 3 segments
(`chr`, `ind`, `tert`), chacun avec une séquence de 3 emails MJML
(`content/cold-outreach-waalaxy/`, branche `worktree-cold-outreach-waalaxy`).

Une lecture de 8 newsletters de copywriters (Yass Fox, Julien Musy, God of
Prompt, Exploding Topics, Ryan White, Justin Chia, Nick Di Fabio, Pascio) plus
les fondamentaux connus de Justin Welsh, Ramit Sethi, Copyblogger et Alex
Hormozi a produit un swipe file de 10 frameworks actionnables (artifact
Claude, non versionné dans ce repo).

Ce document cadre un pilote qui applique 3 de ces frameworks au segment
**IND (industrie/production)**, choisi comme segment pilote parce que :

- il dispose déjà du hook le plus fort (donnée Baromètre ENTSOE réelle,
  73,66 → 103,9 €/MWh, juin→juillet 2026) ;
- son audience (décideurs achats/direction usine) est active sur LinkedIn,
  contrairement à CHR (peu présent) ou TERT (cycle d'achat public, peu
  compatible avec un CTA informel).

## Périmètre

1. Un 4ᵉ email inséré dans la séquence IND, construit sur le framework
   « histoire → leçon ».
2. Un test de CTA-mot-clé (« répondez AUDIT ») sur deux emails de la
   séquence, à la place du bouton-lien habituel.
3. Deux posts LinkedIn (profil personnel d'Antoine) qui déclinent les
   mêmes angles que la séquence email (framework « flywheel »).

**Hors périmètre** (inchangé du README existant) : choix de l'outil
d'envoi email, implémentation du paramètre `camp` dans `middleware.js`,
dashboard de visualisation. Pas de cas client réel utilisé — voir
contrainte de véracité ci-dessous.

## Contrainte transversale : pas d'IA slop

Toute copie produite pour ce pilote (email E3, posts LinkedIn) est relue
contre cette liste avant validation. Référence positive : le ton déjà
établi dans `content/social-organique-b2b/semaine-01.md` — direct, un
mécanisme concret expliqué (TURPE, groupement d'achat), vouvoiement, aucun
mot magique, une vraie donnée à chaque fois.

**Interdits :**

- Ouvertures génériques (« Dans un monde où... », « Imaginez un instant... »,
  « Avez-vous déjà pensé à... »)
- Triades rhétoriques creuses (« plus rapide, plus simple, plus efficace »)
- Superlatifs vides (« révolutionnaire », « unique en son genre »,
  « transforme votre business »)
- Construction « Ce n'est pas X, c'est Y » utilisée en série
- Questions rhétoriques utilisées comme simple transition
- Clôture inspirationnelle abstraite (« Le choix vous appartient »)
- Rythme haché systématique (phrases de 3-4 mots enchaînées comme un tic de
  style plutôt que pour un effet ponctuel)
- Emoji hors du format « Script vidéo » déjà utilisé dans le calendrier
  organique existant

**Exigé :** un mécanisme ou un chiffre réel et vérifiable à chaque
affirmation forte (comme le reste de la campagne IND le fait déjà avec la
donnée ENTSOE) ; vouvoiement systématique.

## 1. Renumérotation de la séquence IND

| Avant | Après | Contenu | Statut |
|---|---|---|---|
| `ind-e1` | `ind-e1` | Accroche + offre | Inchangé |
| `ind-e2` | `ind-e2` | Relance chiffrée (Baromètre) | Inchangé |
| — | `ind-e3` | **Nouveau** — histoire → leçon | À créer |
| `ind-e3` | `ind-e4` | Dernier message (« je referme le dossier ») | Renommé, timing décalé J+10 → J+14 |

Fichiers concernés : `mjml/ind-e1.mjml` (CTA), `mjml/ind-e3.mjml` (nouveau),
`mjml/ind-e3.mjml` existant → renommé `mjml/ind-e4.mjml` (timing + tracking
`camp=ind-e4`), et équivalents `html/`. Le `README.md` de la campagne est mis
à jour (tableau de séquence, section CTA-mot-clé, section LinkedIn).

## 2. Nouveau `ind-e3` — histoire → leçon

Récit sectoriel générique, **sans client nommé ni cas attribué** (voir
contrainte de véracité) : une entreprise industrielle type qui découvre son
exposition au prix de marché au moment du renouvellement de contrat, bâtie
sur la vraie donnée Baromètre déjà utilisée en `ind-e2`. La leçon qui en
découle mène vers l'audit gratuit. Même habillage visuel que les 3 autres
emails de la séquence (dark theme, callout chiffré vert, structure en blocs
guidés v4 du README).

CTA : mot-clé (voir section 3), pas de bouton-lien.

## 3. CTA-mot-clé sur `ind-e1` et le nouveau `ind-e3`

Le bouton-lien habituel est remplacé, sur ces deux emails seulement, par un
encart texte (même style que le badge de réassurance déjà utilisé en
`ind-e4`) :

> Répondez à cet email avec le mot **AUDIT**, je vous transmets le lien
> directement.

`ind-e2` et `ind-e4` gardent le bouton-lien classique
(`https://www.byandry.com/b2b.html?ref=ag&camp=ind-e2` /
`camp=ind-e4`) — ce sous-groupe sert de témoin pour comparer taux de
réponse (mot-clé) et taux de clic (lien) sur la même séquence.

## 4. Volet LinkedIn — 2 posts

Format identique à celui déjà établi dans
`content/social-organique-b2b/semaine-XX.md` (vouvoiement, style « Post 1 —
Officiel », lien tracké). Publiés depuis le profil personnel d'Antoine.

- **Post 1** — décline l'angle donnée ENTSOE de `ind-e2` (marché, pas
  d'offre commerciale explicite).
- **Post 2** — décline le récit sectoriel du nouveau `ind-e3`.

Lien tracké : `https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=pilote-ind&utm_content=post-1` (et `post-2`) — convention UTM du
calendrier organique existant, distincte du couple `ref/camp` utilisé côté
email.

Fichier : `content/cold-outreach-waalaxy/linkedin.md` (autonome de la
branche `worktree-social-organique-b2b-calendrier` — à réconcilier avec le
calendrier au moment du merge si besoin, pas dans ce périmètre).

## Mesure de succès

Pas de nouvelle infra de tracking :

- **E1/E3 (mot-clé)** : réponses « AUDIT » comptées manuellement dans la
  boîte mail.
- **E2/E4 (lien)** : clics `camp=ind-e2`/`camp=ind-e4` — déjà loggés côté
  serveur même si le paramètre `camp` n'est pas encore exploité par le
  middleware (cf. hors périmètre).
- **LinkedIn** : engagement natif (vues, réactions) + clics UTM des 2 posts.

Comparaison mot-clé vs lien sur la même séquence, et email vs LinkedIn sur
les mêmes deux angles de contenu, avant décision d'étendre à CHR/TERT.
