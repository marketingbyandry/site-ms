# Baromètre énergie — colonne gauche : cartes résumé par section

Date : 2026-08-13
Périmètre : les 8 fichiers du chantier CTA (`ms-blog-barometre-2022.html` … `-2026-t3.html`, `templates/barometre-article-template.html`), y compris rework des 3 déjà livrés (2026-t2, 2022, 2023 — Tasks 1-3, approuvées).
Complète : `docs/superpowers/plans/2026-07-31-barometre-cta-redesign-plan.md` et son design `2026-07-30-barometre-cta-redesign-design.md`. Ne remplace rien de ce document — le rail droit (`.side-rail` : sparkline + `.rail-nav`) reste inchangé.

## Contexte / diagnostic

`.article-layout` définit une grille `1fr / min(720px,100%) / 1fr` (ms-blog-barometre-2023.html:125-132). La colonne 1 (gauche) n'est ciblée par aucune règle — seul `.side-rail` occupe explicitement `grid-column: 3` (ligne 141) ; tout le reste retombe sur `grid-column: 2` par défaut (ligne 130). Au-dessus de 1280px, la colonne gauche est donc un vide de 1fr, visuellement déséquilibré par rapport au rail droit sticky.

Demande initiale : une nav cliquable "par paragraphe" à gauche. Après clarification, la granularité retenue est **par section** (comme le rail droit), sous forme de **cartes résumé** (titre + accroche) plutôt qu'une simple liste de liens, pour ne pas dupliquer `.rail-nav`.

## Décisions actées (brainstorming)

1. **Intention** : équilibre visuel — combler la colonne gauche vide, pas une nav de lecture supplémentaire.
2. **Le rail droit est conservé tel quel** — sparkline + `.rail-nav` ne bougent pas.
3. **Granularité** : une carte par section de contenu (`#periode`, `#electricite`, `#gaz`, `#contexte`) — **pas** de carte pour `#cta` (ce n'est pas du contenu, et le CTA est déjà représenté ailleurs : nav, bouton flottant, section CTA).
4. **Forme** : cartes résumé (titre + accroche d'une ligne), pas un sommaire minimal ni des notes marginales ancrées.
5. **Source des accroches** : rédigées sur mesure (pas d'extraction automatique de la première phrase) → nécessite une passe `content-builder` avant l'implémentation `dev-builder`.

## 1. Structure HTML

Nouveau bloc `<aside class="left-rail">`, sibling de `.side-rail` dans `.article-layout`, placé avant `.article-body` dans le DOM :

```html
<aside class="left-rail">
  <a class="left-card" href="#periode">
    <span class="left-card-title">Période analysée</span>
    <span class="left-card-teaser">[accroche 1 ligne]</span>
  </a>
  <a class="left-card" href="#electricite">
    <span class="left-card-title">Prix moyen électricité</span>
    <span class="left-card-teaser">[accroche 1 ligne]</span>
  </a>
  <a class="left-card" href="#gaz">
    <span class="left-card-title">Prix moyen gaz</span>
    <span class="left-card-teaser">[accroche 1 ligne]</span>
  </a>
  <a class="left-card" href="#contexte">
    <span class="left-card-title">Contexte du marché</span>
    <span class="left-card-teaser">[accroche 1 ligne]</span>
  </a>
</aside>
```

Titres = texte exact des `<h2>` de chaque section (déjà variables d'une page à l'autre, ex. "Prix moyen électricité (partiel)" sur T3 — repris tel quel, cohérent avec `.rail-nav` qui fait déjà ce choix).

`templates/barometre-article-template.html` reçoit la même structure avec `[accroche 1 ligne]` en placeholder neutre (convention déjà utilisée dans ce fichier pour le contenu à compléter).

## 2. CSS

```css
.left-rail {
  grid-column: 1;
  align-self: start;
  position: sticky;
  top: 6rem;
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding-right: 2rem;
}
@media (min-width: 1280px) {
  .left-rail { display: flex; }
}
.left-card {
  display: block;
  padding: .9rem 1rem;
  border: 1px solid rgba(43,181,200,.15);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color .2s;
}
.left-card:hover,
.left-card.active {
  border-color: var(--accent);
}
.left-card-title {
  display: block;
  font-size: .82rem;
  font-weight: 700;
  color: var(--cream);
  margin-bottom: .35rem;
}
.left-card.active .left-card-title { color: var(--accent); }
.left-card-teaser {
  display: block;
  font-size: .74rem;
  line-height: 1.4;
  color: var(--muted);
}
```

Même point de rupture (1280px), même pattern sticky que `.side-rail` — cohérence visuelle des deux colonnes qui apparaissent/disparaissent ensemble. Sous 1280px, rien n'est perdu (titres de section restent accessibles via les `<h2>` eux-mêmes, comme pour le rail droit).

Style volontairement distinct de `.rail-nav` (liste compacte sans bordure) : les cartes ont un contour et un padding, pour se lire comme un second composant et non un doublon.

## 3. Highlight actif (JS)

Réutilisation de l'observer existant (`railObs`, ms-blog-barometre-2023.html:602-609) plutôt qu'un second `IntersectionObserver` : élargir la sélection des liens à mettre à jour pour inclure les cartes gauche.

```js
const railLinks = document.querySelectorAll('.rail-nav a, .left-card');
// ... reste du code inchangé (railObs, railSections, toggle 'active')
```

Un seul observer, un seul set de sections observées (`periode`/`electricite`/`gaz`/`contexte`), les deux colonnes se surlignent en synchronisation. `.left-card.active` reprend le token `--accent` déjà utilisé par `.rail-nav a.active`.

## 4. Portée du rework

Ce composant n'existait pas au moment des Tasks 1-3 (déjà approuvées) : elles devront être reprises pour ajouter `.left-rail` + CSS + l'extension du sélecteur JS. Les Tasks 4-8 l'intègrent nativement dès leur brief.

Séquence : `content-builder` rédige les 32 accroches (4 par fichier × 8 fichiers, y compris les 3 déjà livrés) → `superpowers:writing-plans` amende le plan existant avec cette étape supplémentaire (nouvelle tâche de rework pour 1-3 + intégration dans le brief de 4-8) → `dev-builder` exécute → `quality-reviewer` relit.

## 5. Notes de portée

- Aucun nouveau composant CSS "mort" n'est réactivé ici (contrairement au design du 2026-07-30) : tout est neuf et utilisé immédiatement.
- Pas de sparkline ni de duplication de données chiffrées côté gauche — uniquement titre + accroche éditoriale, pour rester distinct du rail droit.

## Addendum — 2026-08-18 : habillage visuel « ligne de progression »

Une reprise du brainstorming (nouvelle session, avant tout début d'implémentation des Tasks 9-12) a fait remonter la même demande de nav gauche sous un angle différent (une ligne par paragraphe). Après clarification, la granularité **par section** de ce document reste actée — pas de rework vers le paragraphe — mais l'habillage visuel des cartes est remplacé : la boîte bordée (`border: 1px solid rgba(43,181,200,.15); border-radius: 8px`) cède la place à une **ligne de progression verticale fine + un point par carte** (plein/`--accent` si active, creux/`--muted` sinon), en écho au `#progress-bar` déjà présent en haut de page. Décision : « Fusionner les deux idées » — structure carte (titre + accroche) inchangée, `.left-card` reste un `<a>` avec les mêmes deux `<span>`, aucun changement de markup, aucun changement du mécanisme JS (`railObs` partagé, section §3 inchangée).

CSS remplacée (voir le plan `2026-07-31-barometre-cta-redesign-plan.md`, bloc "Global Constraints" CSS, pour le texte exact appliqué) :
- `.left-card` perd son cadre/`border-radius`, gagne `padding-left` + un `::before` en pastille (7×7px, `border: 1.5px solid var(--muted)`).
- `.left-rail` gagne un `::before` : trait vertical 1px `rgba(43,181,200,.15)` sur toute la hauteur de la liste, aligné avec le centre des pastilles.
- État actif : la pastille se remplit (`background`/`border-color: var(--accent)`) au lieu du contour de carte qui changeait de couleur ; le titre passe en `--accent` comme avant.

Impact sur le reste du plan : nul en dehors de ce fichier CSS et d'une reformulation de la vérification visuelle de la Task 10 (Step 6) — Task 9 (rédaction des accroches), et la structure HTML/JS des Tasks 4-8 et 10-12, restent valables telles quelles.
