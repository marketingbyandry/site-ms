# Déploiement du Chantier MS (sections + photos sur le site) — design

Date : 2026-09-14

## Contexte

L'Artifact "Chantier MS" (📸, suite de "Motion MS",
https://claude.ai/code/artifact/6d344bec-a46b-4e6d-9730-e7080b932e7c) propose
un gabarit de 7 sections inspirées de refero.design (andercore.com,
t1energy.com, nextdoor.com/business, resend.com, hyperliquid.xyz,
useorigin.com, metaview.ai), assemblées comme une page démo — aucune page
réelle du site n'est modifiée par l'artefact lui-même. Seule la Section 6
(règle de traitement photo) a été implémentée à ce jour, sur `index.html`
uniquement, entre "L'entreprise" et "Rejoindre M&S Strategy" (branche
`photo-system-section`, PR #76 ouverte, non mergée).

Une recherche `refero-design` complémentaire (2026-09-14, styles Andercore,
T1 Energy, Pipe, Whereby en plus des styles déjà cités par l'artefact)
confirme que la règle de traitement photo de la Section 6 (teintée au repos,
couleur retrouvée au scroll/survol) est cohérente avec ses propres
références — ce document ne rouvre donc pas la direction visuelle, il cadre
uniquement *quelles sections vont où* et *avec quelles données*.

**Hors périmètre** : le chantier séparé issu de l'audit `design-is` du
12/09 (verdict REDESIGN 8/30, PR #77) — consolidation des classes CSS
dupliquées (`.hcard`/`.vcard`/`.cpillar`/`.akpi`, `.pcta`/`.cta-btn`/`.ncta`),
tokens `--space-*`/`--font-size-*`, accessibilité clavier/focus, passe
honnêteté sur les statistiques *existantes* du bandeau marque et de la
section "L'entreprise" (`100.000 clients accompagnés` vs `8.177`). Ce
document n'y touche pas et ne doit pas le contredire.

Le site n'a aujourd'hui aucune photo réelle : tous les emplacements photo
sont des placeholders (fond teinté + grille de points, classe `.photo-ph`).
L'utilisateur aura des photos réelles prochainement.

## Objectif

Déployer une partie du gabarit "Chantier MS" sur les pages réelles du site,
avec des placeholders photo, pour produire un aperçu que l'utilisateur
pourra parcourir et utiliser pour décider quelle photo réelle va à quel
emplacement — l'intégration des photos réelles elles-mêmes est un lot
séparé, ultérieur, une fois les photos reçues.

## Périmètre décidé lors du cadrage

- **Heros non touchés.** Aucune page ne voit son hero remplacé — la
  Section 1 ("Hero centré", module recherche+CTA) du gabarit est exclue du
  périmètre. Toutes les autres sections restent des insertions dans le
  corps de page existant, jamais un remplacement du hero.
- **Bouton "aurora" (Section 7) appliqué globalement**, comme effet de
  survol sur les boutons CTA existants (`.pcta`, `.cta-btn`, `.ncta`,
  `.ccb-btn`) sur toutes les pages du site. Explicitement **pas** une
  fusion de ces 3 classes en une seule — cette consolidation appartient au
  chantier audit design-is, hors périmètre ici.
- **Chiffres du gabarit repris tels quels** (décision explicite de
  l'utilisateur) pour la Section 2 (8 216 professionnels accompagnés — déjà
  étiquetée "donnée réelle" dans le gabarit ; 94 % de renouvellement —
  étiquetée "gabarit — donnée d'exemple") et la Section 3 (3 cas sectoriels
  d'exemple : Restauration −21 %, Industrie agroalimentaire −17 %, Commerce
  de détail −19 %). Le badge "gabarit — données d'exemple" déjà présent
  dans l'artefact est conservé dans l'implémentation — c'est ce badge qui
  rend ces exemples honnêtes (contrairement aux statistiques *existantes*
  du site que l'audit design-is a sanctionnées, qui n'avaient aucune
  mention de ce type).
- **Widget console (Section 5) repris tel quel**, y compris ses valeurs
  statiques de marché (prix, évolution 30 jours) présentées sans mention de
  fraîcheur — décision explicite de l'utilisateur après qu'un risque de
  ressemblance avec le mécanisme de statistiques fabriquées sanctionné par
  l'audit design-is (`sup-stats.js`) a été signalé. Assumé, pas un oubli.
- **Photos en placeholder pour cette livraison.** Le remplacement par les
  vraies photos de l'utilisateur est un lot ultérieur, une fois les photos
  reçues et l'aperçu de cette livraison examiné.

## Mapping section × page

Points d'insertion vérifiés dans le code réel (`origin/main`, commit
`9e791a3`).

| Page | Section du gabarit | Emplacement exact |
|---|---|---|
| `index.html` | Section 6 (cartes flip équipe/terrain/site client/bureaux) | déjà en place, entre `.about-section` ("L'entreprise") et `.careers` ("Rejoindre M&S Strategy") — branche `photo-system-section`, PR #76. Pas retouché par ce plan, sauf déplacement de son CSS inline vers le fichier partagé (voir Architecture). |
| `index.html` | Section 2 (bandeau chiffres en miroir) | après `.brand` (bandeau marque, stats 2012/100.000/80+/24h), avant `.seo-intro` ("Qu'est-ce qu'un courtier en énergie") |
| `b2b.html` | Section 3 (grille de résultats par secteur) | après `.how-band` ("4 étapes"), avant `.vals` ("Un accompagnement sur-mesure") |
| `b2b.html` | Section 4 (comparatif "sans courtier / avec M&S") | après `.vals`, avant `.upload-section#upload` (formulaire d'étude) |
| `b2c.html` | Section 4 (comparatif, copie adaptée particuliers) | après `.vals` ("Votre logement, vos besoins"), avant `.upload-section#upload` |
| `comment-ca-marche.html` | Section 5 (widget console, en section autonome — pas dans un hero) | après `.steps` (étapes du processus), avant `.seo-intro` ("Comparer davantage") |
| `resultats.html` | Section 3 (grille de résultats par secteur) | après `.seo-intro` ("Une méthode structurée"), avant `.vals` ("Des économies adaptées à chaque profil") |
| Toutes les pages ci-dessus + blog | Section 7 (effet "aurora" au survol) | ajouté aux styles des boutons CTA existants |

### Adaptation de copie — Section 4 sur `b2c.html`

Le comparatif du gabarit est écrit pour un lecteur B2B ("Suivi des marchés
de gros", "Coût du service : temps interne"). Sur `b2c.html`, la copie est
adaptée au foyer :

| Critère | Seul face au fournisseur | Avec M&S Strategy |
|---|---|---|
| Mise en concurrence des offres | ✕ | ✓ |
| Suivi des évolutions tarifaires | ✕ | ✓ |
| Conseiller dédié | ✕ | ✓ |
| Alerte avant échéance de contrat | ✕ | ✓ |
| Coût du service | Temps passé à comparer | Sur économies réalisées |

## Photos concernées et traitement

**Sections avec placeholder photo** (grille de points teintée, classe
`.photo-ph`, à remplacer par de vraies photos dans un lot ultérieur) :

- Section 2 (`index.html`) : 2 blocs photo (un par ligne miroir).
- Section 6 (`index.html`) : 4 cartes flip déjà en place (équipe, terrain,
  site client, bureaux) — déjà des placeholders, non retouchées.
- Blog : **9 pages articles** (`ms-blog-article-1.html`,
  `ms-blog-article-2.html`, `ms-blog-barometre-2022.html` à
  `ms-blog-barometre-2026-t3.html`) + leurs 9 cartes sur `blog.html`.
  Chaque article reçoit une photo en vignette (carte sur `blog.html`) *et*
  en en-tête (haut de la page article elle-même), avec la **même règle de
  traitement que la Section 6** (filtre `grayscale + sepia + hue-rotate`
  vers le teal au repos, retiré progressivement à l'entrée dans le
  viewport ou au survol) — "une seule règle, appliquée partout", comme déjà
  formulé dans l'artefact.

**Sections sans photo** : Section 3 (grille de résultats, logos-placeholder
texte type "RX"/"IA"/"CD" déjà dans le gabarit), Section 4 (comparatif,
aucune image), Section 5 (widget console, aucune image), Section 7
(traitement de bouton, aucune image).

## Architecture

Le site est un ensemble de pages HTML statiques, chacune avec son propre
bloc `<style>` inline dans le `<head>` (pas de moteur de template, pas de
CSS partagé aujourd'hui — c'est d'ailleurs une partie de ce que l'audit
design-is séparé reproche à `index.html`). Ce plan introduit **un seul
fichier CSS partagé, `assets/chantier-sections.css`**, chargé via
`<link rel="stylesheet">` sur les 15 pages concernées (`index.html`,
`b2b.html`, `b2c.html`, `comment-ca-marche.html`, `resultats.html`,
`blog.html`, les 9 pages articles), plutôt que de dupliquer les styles des
nouveaux composants (`.flip-card`, `.mirror-row`, `.cases-grid-3`,
`.compare`, `.console-panel`, `.btn-aurora`, `.blog-photo`) sur chaque page
— pour ne pas reproduire le problème de duplication CSS que l'audit
design-is a par ailleurs sanctionné sur le reste du site.

Conséquence pour `index.html` : le CSS de la Section 6, actuellement
inline dans cette page (PR #76), est déplacé dans `assets/chantier-sections.css`
au moment où ce plan touche `index.html` pour la Section 2 — sans changer
le rendu ni le comportement de la Section 6, seulement son emplacement dans
le code.

Le JS des nouveaux composants (compteurs animés de la Section 2, bascule
des cartes flip déjà existante, `IntersectionObserver` de reveal) réutilise
le pattern déjà en place sur chaque page (`reveal`/`IntersectionObserver`
défini dans le `<script>` de fin de fichier de chaque page) plutôt qu'un
nouveau système — chaque page garde son script inline, `assets/chantier-sections.css`
ne contient que du CSS.

## Périmètre agent d'exécution

Projet logiciel (HTML/CSS/JS statique) → `dev-builder`, worktree git
isolé, comme le reste des chantiers de code sur ce dépôt. Relecture
`quality-reviewer` avant PR, comme d'usage.
