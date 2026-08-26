# Section "Nos fournisseurs partenaires"

Date : 2026-08-13

## Contexte

Le site ne mentionne aujourd'hui aucun fournisseur d'énergie par son nom. Le
positionnement affiché partout ailleurs (`comment-ca-marche.html`, `b2b.html`,
`b2c.html`) est : "nous consultons l'ensemble du marché, aucun favoritisme,
rémunération standardisée quel que soit le fournisseur retenu".

Objectif : ajouter une section qui recense 5 fournisseurs, dans un ordre
imposé, avec des cartes déployantes montrant pourquoi chacun peut être
pertinent selon le profil client, et le nombre de contrats signés par M&S
Strategy avec chacun (donnée provisoire pour l'instant).

**Contrainte de cohérence** : cette section est cadrée comme *preuve sociale*
("voici les fournisseurs avec qui nous concluons le plus de contrats"), pas
comme un *classement de compétitivité*. Le texte de chaque carte décrit le
positionnement/segment du fournisseur, jamais "pourquoi c'est le meilleur" —
pour ne pas contredire le message d'indépendance affiché ailleurs sur le
site.

**Hors périmètre** : la refonte visuelle "Wall Street" évoquée pour
`barometre-energie.html` est un projet séparé, traité plus tard. Cette
section s'insère dans le design actuel de la page, inchangé par ailleurs.

## Fournisseurs et ordre (imposé)

1. MetEnergie
2. OHM Energie
3. Alterna (ex-Vattenfall)
4. Engie
5. GazelEnergie

Le nom affiché pour le n°3 est "Alterna (ex-Vattenfall)" — c'est le nom
commercial actuel de l'activité française de Vattenfall, rebrandée Alterna.

## Emplacement

Section dupliquée sur 3 pages (le site n'a pas de moteur de templating côté
HTML ; le pattern FAQ/`function faq()` est déjà dupliqué de la même façon
entre pages) :

- **`index.html`** : nouvelle section entre `market-section` (id implicite,
  ligne ~618-671) et `<section class="cta-band" id="cta-calculateur">`
  (ligne ~672).
- **`b2b.html`** : nouvelle section entre `<section class="vals">`
  (ligne ~343) et `<section class="upload-section" id="upload">`
  (ligne ~371) — juste avant l'upload de facture, comme dernier argument de
  confiance avant la conversion.
- **`barometre-energie.html`** : nouvelle section entre la section
  Méthodologie (`<section class="faq-section">`, ligne ~209) et la section
  Historique (`<section class="steps">`, ligne ~219).

## Structure du composant

### Markup (identique sur les 3 pages, adapter uniquement le `<h2>` si besoin
de variation contextuelle mineure)

```html
<!-- FOURNISSEURS PARTENAIRES -->
<!-- TODO: remplacer les chiffres de contrats (données de preview) par les vrais totaux M&S avant publication -->
<section class="sup-section">
  <div class="sup-header reveal">
    <span class="stag">Preuve sociale</span>
    <h2 class="sh2">Nos fournisseurs <em>partenaires.</em></h2>
    <p>Parmi l'ensemble du marché consulté à chaque étude, voici les
    fournisseurs avec lesquels nous concluons le plus de contrats pour nos
    clients.</p>
  </div>
  <div class="sup-list">
    <div class="sup-item reveal" onclick="this.classList.toggle('open')">
      <div class="sup-q">
        <div class="sup-name"><span class="sup-num">01</span> MetEnergie</div>
        <div class="sup-stat">124 contrats signés <span class="sup-preview">· aperçu</span></div>
        <span class="sup-arr">↓</span>
      </div>
      <div class="sup-a">
        <p>[texte de positionnement, premier jet]</p>
      </div>
    </div>
    <!-- répété pour OHM Energie (02), Alterna ex-Vattenfall (03), Engie (04), GazelEnergie (05) -->
  </div>
</section>
```

### Comportement

- Chaque carte s'ouvre/se ferme **indépendamment** des autres (pas
  d'accordéon exclusif comme la FAQ) : `onclick="this.classList.toggle('open')"`
  suffit, pas besoin de fonction JS dédiée.
- Classes CSS propres (`sup-*`), distinctes de `.faq-item`/`.faq-q`/`.faq-a`
  pour ne pas interférer avec la vraie FAQ présente sur `index.html` et
  `b2b.html` (qui utilise `document.querySelectorAll('.faq-item')` en
  exclusif — un nom de classe partagé casserait ce comportement).

### CSS (à ajouter dans le `<style>` de chacune des 3 pages)

```css
.sup-section{padding:6rem 5vw;max-width:900px;margin:0 auto}
.sup-header{max-width:640px;margin-bottom:2.5rem}
.sup-header p{color:var(--muted);font-size:.97rem;line-height:1.72;margin-top:1rem}
.sup-list{display:flex;flex-direction:column;gap:.9rem}
.sup-item{border:1px solid rgba(26,122,138,.14);border-radius:3px;padding:1.3rem 1.6rem;background:var(--dark);cursor:pointer;transition:border-color .25s}
.sup-item:hover{border-color:rgba(94,207,220,.3)}
.sup-q{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}
.sup-name{font-family:'Satoshi',sans-serif;font-weight:700;font-size:.98rem;color:var(--cream);display:flex;align-items:center;gap:.6rem}
.sup-num{font-family:'Satoshi',sans-serif;font-weight:800;font-size:.8rem;color:rgba(26,122,138,.5)}
.sup-stat{font-size:.82rem;color:var(--teal-light);white-space:nowrap}
.sup-preview{color:var(--muted2);font-style:italic}
.sup-arr{font-size:.9rem;color:var(--teal-light);transition:transform .25s;margin-left:auto}
.sup-item.open .sup-arr{transform:rotate(180deg)}
.sup-a{font-size:.89rem;color:var(--muted);line-height:1.7;max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s}
.sup-item.open .sup-a{max-height:260px;padding-top:.9rem}
```

Réutilise les tokens de couleur existants (`--dark`, `--cream`, `--muted`,
`--teal-light`, etc.) et le style visuel des `.hcard`/`.faq-item` déjà
présents, donc pas de nouveau token de design nécessaire. Vérifier le mode
clair (`:root[data-theme="light"]`) : aucun override spécifique ne devrait
être nécessaire vu que `.hcard`/`.faq-item` n'en ont pas non plus, mais à
confirmer visuellement à l'implémentation.

## Contenu des cartes (premier jet, à valider par l'utilisateur)

Chaque texte reste qualitatif (segment cible, type d'offre), sans chiffre ni
affirmation factuelle invérifiable sur l'identité juridique ou la structure
du fournisseur. Chiffres de contrats : valeurs d'exemple, à remplacer.

1. **MetEnergie** — ~124 contrats signés (aperçu). Fournisseur alternatif
   indépendant, souvent compétitif sur les profils TPE/PME multi-énergie
   avec une structure tarifaire simple.
2. **OHM Energie** — ~95 contrats signés (aperçu). Offres digitales
   simplifiées, bon positionnement sur l'électricité pour les petites
   structures cherchant un contrat sans complexité contractuelle.
3. **Alterna (ex-Vattenfall)** — ~80 contrats signés (aperçu). Offres
   orientées énergie renouvelable, pertinentes pour les entreprises qui
   valorisent une part d'électricité verte dans leur contrat.
4. **Engie** — ~210 contrats signés (aperçu). Acteur historique du marché
   français, portefeuille d'offres large, souvent une référence de
   comparaison pour les profils multi-sites ou à forte consommation.
5. **GazelEnergie** — ~60 contrats signés (aperçu). Positionnement marqué
   sur le gaz et les profils industriels, pertinent pour les entreprises à
   consommation gaz significative.

## Non-objectifs

- Pas de classement explicite ("le meilleur fournisseur est...").
- Pas de refonte de `barometre-energie.html` au-delà de l'insertion de cette
  section.
- Pas de vrais chiffres de contrats à ce stade — placeholders assumés et
  signalés (TODO + mention "aperçu").
- Pas de nouvelle page dédiée fournisseurs (rejeté au profit d'une section
  intégrée aux 3 pages existantes).

## Tests / vérification

Le site n'a pas de tests automatisés pour le HTML statique (le `test/`
existant couvre `analytics-helpers.mjs` et le tracking `camp`, pas le
contenu des pages). Vérification par relecture visuelle : ouverture/fermeture
indépendante des 5 cartes sur les 3 pages, absence de régression sur la FAQ
existante d'`index.html`/`b2b.html`, cohérence visuelle en mode clair et
sombre.
