# Baromètre énergie — hiérarchie CTA, lecture dynamique, différenciation par tendance

Date : 2026-07-30
Périmètre : `ms-blog-barometre-2022.html`, `-2023.html`, `-2024.html`, `-2025.html`, `-2026-t1.html`, `-2026-t2.html`, `-2026-t3.html`, et `templates/barometre-article-template.html`.
Hors périmètre : `barometre-energie.html` (page hub, structure différente, CTA non touché).

## Contexte / diagnostic

Les 7 pages sont des copies quasi identiques d'un même template (même CSS inline dupliqué ~290 lignes, mêmes classes). Vérification par comptage : chaque page a exactement 4 `<h2>`, 12-13 `<p>`, 4 `.callout`, 1 `.data-table-wrap`, 1 `.counter-box`, 3 `.checklist`, 0 `.pull-quote`, 0 `.stat-row` — **mais aucune de ces 5 dernières classes n'est en réalité instanciée dans le HTML de la moindre page** (confirmé par grep sur `ms-blog-barometre-2026-t2.html` et `-2022.html` et `-2026-t3.html`). Le CSS et même le JS associé (`animateCount`, `statObs` sur `[data-target]`, l'observer sur `.counter-anim`) sont écrits mais orphelins : aucun élément à observer n'existe. Résultat concret : chaque article est en réalité hero → (h2, p, p, lien) ×3 → 4 paragraphes de contexte → callout sources → CTA → callout "lire aussi". Rien ne casse le mur de texte à part les 4 callout boxes.

Cette base "morte" est réutilisée plutôt que remplacée : `.stat-row`, `.checklist`, `.pull-quote` sont activés avec du vrai contenu ; `.counter-box` et `.data-table-wrap`/`<table>` restent hors scope (pas de donnée tabulaire réelle disponible, cf. Notes). `.article-layout` (grille 1fr/720px/1fr, elle aussi jamais appliquée) devient le support du rail latéral.

## 1. Hiérarchie CTA

**Bloc CTA de fin d'article** (`#cta .cta-section`) — remplace :
```html
<p class="cta-title">Votre entreprise paie-t-elle le juste prix ?</p>
<p class="cta-sub">Transmettez votre dernière facture énergie...</p>
<a href="b2b.html#upload" class="cta-btn">Obtenir mon étude gratuite →</a>
<p class="cta-reassure">100% gratuit · Sans engagement · Données confidentielles · Réponse sous 48h</p>
```
par :
```html
<p class="cta-title">Chaque mois sans négocier a un coût réel.</p>
<p class="cta-sub">Renseignez votre consommation et votre échéance : le calculateur affiche en temps réel ce que l'inaction vous coûte, et ce qu'une négociation pourrait vous rapporter.</p>
<a href="ms-strategy-calculateur.html" class="cta-btn">Calculez ce que l'inaction vous coûte, en temps réel →</a>
<p class="cta-secondary"><a href="b2b.html#upload">Ou transmettez votre facture pour une étude gratuite en 48h →</a></p>
```
Nouvelle classe `.cta-secondary` : `font-size:.85rem; color:var(--muted); margin-top:1rem;` (lien `color:var(--teal-light)`, pas de style bouton) — remplace `.cta-reassure` qui disparaît (son texte de réassurance "100% gratuit..." est repris tel quel dans le hero du calculateur, pas dupliqué ici).

**Nav bar CTA** (`.nav-cta`) : `href="#cta"` → `href="ms-strategy-calculateur.html"`, texte `Étude gratuite →` → `Calculateur d'inaction →`.

**Floating CTA** (`#floating-cta`) : devient un lien direct de destination plutôt qu'une ancre de scroll — `href="#cta"` → `href="ms-strategy-calculateur.html"`, texte `Étude gratuite · 48h →` → `Calculer mon inaction →`.

Les liens inline "Consulter les données actualisées du Baromètre M&S Strategy →" (vers `barometre-energie.html`) et le callout "Lire aussi" ne changent pas.

## 2. Structure de section + rail latéral sticky

Le contenu de `.article-body` est actuellement une suite plate de `<h2>`/`<p>`. Chaque section est enveloppée :
```html
<section id="periode">…</section>
<section id="electricite">…</section>
<section id="gaz">…</section>
<section id="contexte">…</section>
```
(ids stables, mêmes 4 sur les 7 pages — seul le libellé visible du h2 varie déjà d'une page à l'autre, ex. "Prix moyen électricité (partiel)" sur T3).

`.article-body` est remplacé par le wrapper `.article-layout` déjà défini en CSS (grid `1fr / min(720px,100%) / 1fr`) mais jamais appliqué : le contenu actuel va dans la colonne centrale (`grid-column:2`, comportement inchangé visuellement en dessous de 1280px). Au-dessus de 1280px, une nouvelle colonne `.side-rail` occupe la 3ᵉ piste de la grille (`grid-column:3`), `position:sticky; top:6rem`, contenant :
1. Le sparkline (section 4) avec le point de la période courante mis en évidence.
2. Une nav rapide (`<nav class="rail-nav">`) : 4 liens vers les ids de section + un 5ᵉ vers `#cta`, libellés = texte exact des h2 existants ("Période analysée", "Prix moyen électricité", "Prix moyen gaz", "Contexte du marché", "Passer à l'action").
3. Le lien actif est surligné (`color:var(--accent)`) via un `IntersectionObserver` sur les 4 `<section>`, pas de transition flashy — juste un changement de couleur immédiat, cohérent avec le principe "pas de slop".

Sous 1280px : `.side-rail { display:none }`, rien n'est perdu (les ancres restent accessibles via les h2 eux-mêmes).

## 3. Accent par tendance + sparkline historique

Chaque page ajoute une variable CSS `--accent` dans son `:root` existant, dérivée de la tendance réelle du prix électricité (day-ahead, seule série disponible sur les 7 périodes) :

| Page | Prix élec (€/MWh) | Delta vs période précédente | Tendance | `--accent` |
|---|---|---|---|---|
| 2022 | 274,77 | (référence — pic de la série) | Choc | `#e05555` (rouge, déjà utilisé sur `ms-strategy-calculateur.html`) |
| 2023 | 96,84 | −64,7 % vs 2022 | Baisse | `var(--green)` (`#4cde80`, inchangé) |
| 2024 | 58,62 | −39,5 % vs 2023 | Baisse | `var(--green)` |
| 2025 | 62,26 | +6,2 % vs 2024 (mais année marquée par la volatilité intra-annuelle, cf. texte) | Volatil | `#e0a955` (ambre, nouveau token) |
| T1 2026 | 74,00 | +18,9 % vs moyenne 2025 | Hausse | `#e0a955` |
| T2 2026 | 57,34 | −22,5 % vs T1 2026 | Baisse | `var(--green)` |
| T3 2026 (partiel) | 101,37 | +76,8 % vs T2 2026 | Hausse forte (partiel) | `#e05555` |

Le sparkline est un petit SVG inline (même 7 points sur toutes les pages : 274.77, 96.84, 58.62, 62.26, 74.00, 57.34, 101.37 — libellés 2022/2023/2024/2025/T1/T2/T3), tracé une seule fois en JS partagé (voir section 5). Le point correspondant à la page courante est plus gros, coloré en `--accent`, avec le delta affiché à côté (ex. "+76,8% vs T2 2026"). Pour 2022 (pas de delta calculable dans la série), le label est contextuel : "Pic de la crise 2022" au lieu d'un pourcentage. Pour T3 2026, le point est rendu avec un contour en pointillés (`stroke-dasharray`) au lieu d'un disque plein, pour signaler visuellement la donnée partielle — cohérent avec le bandeau "Bilan intermédiaire" déjà présent en tête de cette page.

Le radial gradient existant du hero (`.hero::before`) change de teinte : `rgba(26,122,138,.2)` → `rgba(from var(--accent) r g b / .18)` (ou variante Sass-like en dur par page si le navigateur cible ne supporte pas `rgba(from …)` — à trancher en implémentation selon le support navigateur visé).

## 4. Stat-row dans le hero (composant existant, jamais utilisé)

Sous `.hero-intro`, activation de `.stat-row` (CSS déjà présent) avec 2 `.stat-item` :
- Stat 1 : prix moyen de la période, compteur animé (réutilise `animateCount`/`data-target` déjà écrits mais orphelins) — `data-target` = valeur arrondie à l'entier, suffixe "€/MWh".
- Stat 2 : delta vs période précédente (texte, pas d'animation numérique — ex. "−22,5 % vs T1 2026"), couleur `--accent`.

## 5. Checklist "Ce qu'il faut retenir" (composant existant, jamais utilisé)

Dans la section `#contexte`, avant ou après le premier paragraphe, un `<h3>Ce qu'il faut retenir</h3>` (le style h3 existe déjà en CSS, jamais utilisé) suivi d'un `<ul class="checklist">` à 3 items, contenu **repris de faits déjà publiés dans la page** (pas de nouvelle donnée inventée) :

- **2022** : pic à 274,77 €/MWh (≈3× le niveau 2023) · gaz +111% sur un an, pic à 227,5 €/MWh le 29/08 · l'ARENH a limité sans l'annuler la répercussion sur les factures.
- **2023** : 96,84 €/MWh, −64,7% vs 2022 · gaz ≈40 €/MWh, deux fois moins qu'en 2022 · reconstitution des stocks gaziers européens = moteur principal de la décrue.
- **2024** : 58,62 €/MWh, −39,5% vs 2023 · gaz ≈34 €/MWh, −15% sur un an · niveaux encore ≈2× la moyenne pré-crise 2014-2019.
- **2025** : 62,26 €/MWh en moyenne annuelle, proche de 2024 malgré un hiver tendu · gaz ≈35 €/MWh, quasi stable mais pic hivernal suivi d'un repli sous 30 €/MWh dès décembre · dernière rétrospective annuelle avant le passage au rythme trimestriel.
- **T1 2026** : 74,00 €/MWh, +18,9% vs moyenne 2025 · premier numéro au rythme trimestriel · volet gaz en attente d'une source de moyenne trimestrielle fiable.
- **T2 2026** : 57,34 €/MWh, −22,5% vs T1 2026 · la variation T1→T2 aurait été lissée dans un format annuel · volet gaz toujours en attente.
- **T3 2026 (partiel)** : 101,37 €/MWh sur les 27 premiers jours de juillet, +76,8% vs T2 2026 (chiffre encore partiel) · gaz : clôture PEG Month-Ahead à 63,90 €/MWh le 24/07, valeur ponctuelle et non une moyenne · bilan T3 définitif à venir une fois septembre clos.

## 6. Pull-quote (composant existant, jamais utilisé)

Une citation par page dans `#contexte`, phrase reprise **verbatim ou légèrement recadrée** du texte déjà publié (pas de nouvelle copy) :

- 2022 : « Face à cette envolée, le mécanisme ARENH a joué un rôle d'amortisseur pour les entreprises françaises. »
- 2023 : « 2023 n'aura pas été un retour brutal à la normale, mais une normalisation progressive, construite mois après mois. »
- 2024 : « 2024 marque moins un retour à l'avant-crise qu'une forme de nouvelle normalité, à un palier de prix plus élevé qu'avant 2021. »
- 2025 : « Ce n'est plus le niveau moyen des prix qui caractérise l'année, mais leur volatilité. »
- T1 2026 : « Un rythme annuel lissait ce type d'à-coups ; un rythme trimestriel permet de les documenter au fur et à mesure qu'ils se produisent. »
- T2 2026 : « La variation observée entre T1 et T2 2026 sur l'électricité aurait été largement lissée, voire invisible, dans un format annuel. »
- T3 2026 : « La distinction entre cotation instantanée et moyenne réalisée reste un point de vigilance méthodologique que nous tenons à préserver. »

## 7. Animations

- Sparkline : tracé au scroll via `stroke-dasharray`/`stroke-dashoffset` (dessin progressif), déclenché par le même `IntersectionObserver` pattern que `.reveal` déjà en place — pas de rebond, easing linéaire ou `ease-out` court (~700ms).
- Stat-row : réutilise `animateCount` existant tel quel.
- Rail nav : changement de couleur immédiat sur la section active, pas de transition superflue.
- Aucun nouvel effet de particules, glow pulsé, ou parallax décoratif. Les `.reveal` existants sont conservés tels quels sur les callouts.

## 8. Notes de portée

- `.counter-box` et `.data-table-wrap`/`<table>` restent du CSS mort, non activés dans ce chantier — il n'existe pas de série de données tabulaire réelle à afficher (le JSON `data/barometre-electricite.json` ne contient qu'un seul point mensuel glissant, pas d'historique). Une activation future nécessiterait d'abord une vraie source de données mensuelles/quotidiennes.
- Le sparkline utilise exclusivement la série électricité (seule complète sur les 7 périodes) ; le gaz n'a pas de série comparable (données manquantes ou partielles sur T1/T2/T3) et n'entre pas dans le graphique.
- `rgba(from var(--accent) …)` (relative color syntax) : à vérifier en implémentation sur le support navigateur cible de byandry.com ; à défaut, définir 3 variantes de gradient en dur par accent (rouge/ambre/vert) plutôt que la syntaxe relative.
- `templates/barometre-article-template.html` reçoit la même structure avec des placeholders neutres (accent `var(--teal-light)` par défaut, sparkline avec le point courant en dernière position sans delta pré-rempli) pour que le prochain trimestre (T4 2026) parte du bon squelette.
