# Section "Nos fournisseurs partenaires" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une section "Nos fournisseurs partenaires" (5 cartes déployantes indépendantes : MetEnergie, OHM Energie, Alterna ex-Vattenfall, Engie, GazelEnergie, dans cet ordre) sur `index.html`, `b2b.html` et `barometre-energie.html`, cadrée comme preuve sociale et non comme classement.

**Architecture:** Site statique multi-pages sans moteur de templating. Chaque page a son propre `<style>` inline et son propre `<script>` inline (le pattern FAQ/`function faq()` est déjà dupliqué de cette façon). On duplique donc le même bloc CSS et le même bloc HTML sur les 3 pages, à un point d'insertion différent par page, avec un comportement JS inline (`onclick="this.classList.toggle('open')"`) qui ne touche pas au `function faq()` existant.

**Tech Stack:** HTML/CSS/JS statique, aucune dépendance ajoutée.

## Global Constraints

- Ordre des fournisseurs imposé et identique sur les 3 pages : MetEnergie (01), OHM Energie (02), Alterna ex-Vattenfall (03), Engie (04), GazelEnergie (05).
- Cadrage "preuve sociale", jamais "classement de compétitivité" — aucun texte du type "le meilleur fournisseur".
- Chiffres de contrats = placeholders explicitement marqués "aperçu" + commentaire HTML `TODO`, à ne jamais présenter comme définitifs.
- Classes CSS/JS propres au composant (`sup-*`), ne jamais réutiliser `faq-item`/`faq-q`/`faq-a` (ces classes pilotent l'accordéon FAQ existant via `document.querySelectorAll('.faq-item')`, un nom partagé le casserait).
- Réutiliser les tokens de couleur existants (`--dark`, `--cream`, `--muted`, `--muted2`, `--teal-light`) — aucun nouveau token.
- Pas de refonte de `barometre-energie.html` au-delà de l'insertion de cette section (hors périmètre).
- Pas de tests automatisés sur ce projet pour le contenu HTML statique — vérification par `grep` (ordre/nombre de cartes) + relecture visuelle manuelle.

---

## Composants réutilisés dans chaque tâche

**Bloc CSS (identique sur les 3 pages) :**

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

**Bloc HTML (identique sur les 3 pages) :**

```html
<!-- FOURNISSEURS PARTENAIRES -->
<!-- TODO: remplacer les chiffres de contrats (données de preview) par les vrais totaux M&S avant publication -->
<section class="sup-section">
  <div class="sup-header reveal">
    <span class="stag">Preuve sociale</span>
    <h2 class="sh2">Nos fournisseurs <em>partenaires.</em></h2>
    <p>Parmi l'ensemble du marché consulté à chaque étude, voici les fournisseurs avec lesquels nous concluons le plus de contrats pour nos clients.</p>
  </div>
  <div class="sup-list">
    <div class="sup-item reveal" onclick="this.classList.toggle('open')">
      <div class="sup-q">
        <div class="sup-name"><span class="sup-num">01</span> MetEnergie</div>
        <div class="sup-stat">124 contrats signés <span class="sup-preview">· aperçu</span></div>
        <span class="sup-arr">↓</span>
      </div>
      <div class="sup-a">
        <p>Fournisseur alternatif indépendant, souvent compétitif sur les profils TPE/PME multi-énergie avec une structure tarifaire simple.</p>
      </div>
    </div>
    <div class="sup-item reveal" onclick="this.classList.toggle('open')">
      <div class="sup-q">
        <div class="sup-name"><span class="sup-num">02</span> OHM Energie</div>
        <div class="sup-stat">95 contrats signés <span class="sup-preview">· aperçu</span></div>
        <span class="sup-arr">↓</span>
      </div>
      <div class="sup-a">
        <p>Offres digitales simplifiées, bon positionnement sur l'électricité pour les petites structures cherchant un contrat sans complexité contractuelle.</p>
      </div>
    </div>
    <div class="sup-item reveal" onclick="this.classList.toggle('open')">
      <div class="sup-q">
        <div class="sup-name"><span class="sup-num">03</span> Alterna (ex-Vattenfall)</div>
        <div class="sup-stat">80 contrats signés <span class="sup-preview">· aperçu</span></div>
        <span class="sup-arr">↓</span>
      </div>
      <div class="sup-a">
        <p>Offres orientées énergie renouvelable, pertinentes pour les entreprises qui valorisent une part d'électricité verte dans leur contrat.</p>
      </div>
    </div>
    <div class="sup-item reveal" onclick="this.classList.toggle('open')">
      <div class="sup-q">
        <div class="sup-name"><span class="sup-num">04</span> Engie</div>
        <div class="sup-stat">210 contrats signés <span class="sup-preview">· aperçu</span></div>
        <span class="sup-arr">↓</span>
      </div>
      <div class="sup-a">
        <p>Acteur historique du marché français, portefeuille d'offres large, souvent une référence de comparaison pour les profils multi-sites ou à forte consommation.</p>
      </div>
    </div>
    <div class="sup-item reveal" onclick="this.classList.toggle('open')">
      <div class="sup-q">
        <div class="sup-name"><span class="sup-num">05</span> GazelEnergie</div>
        <div class="sup-stat">60 contrats signés <span class="sup-preview">· aperçu</span></div>
        <span class="sup-arr">↓</span>
      </div>
      <div class="sup-a">
        <p>Positionnement marqué sur le gaz et les profils industriels, pertinent pour les entreprises à consommation gaz significative.</p>
      </div>
    </div>
  </div>
</section>
```

**Commande de vérification d'ordre (identique sur les 3 pages, `<file>` = le fichier modifié) :**

```bash
grep -oE '<span class="sup-num">0[1-5]</span> [^<]+' "<file>"
```

Sortie attendue (dans cet ordre exact) :

```
01 MetEnergie
02 OHM Energie
03 Alterna (ex-Vattenfall)
04 Engie
05 GazelEnergie
```

---

### Task 1: Section fournisseurs sur `index.html`

**Files:**
- Modify: `index.html:335` (fin du bloc `<style>`)
- Modify: `index.html:670-671` (entre la fin de `market-section` et le début de `cta-band`)

**Interfaces:**
- Consumes: tokens CSS existants `--dark`, `--cream`, `--muted`, `--muted2`, `--teal-light` (définis dans `:root`, `index.html:12-25`) ; classes `stag`, `sh2`, `reveal` déjà utilisées ailleurs sur la page ; observer `IntersectionObserver` déjà attaché à `.reveal` (`index.html:981`).
- Produces: classes `.sup-section`, `.sup-header`, `.sup-list`, `.sup-item`, `.sup-q`, `.sup-name`, `.sup-num`, `.sup-stat`, `.sup-preview`, `.sup-arr`, `.sup-a`, réutilisées à l'identique dans Task 2 et Task 3.

- [x] **Step 1: Ajouter le bloc CSS avant la fermeture du `<style>`**

Dans `index.html`, juste avant la ligne `</style>` (ligne 335), ajouter le bloc CSS complet donné ci-dessus dans "Composants réutilisés dans chaque tâche".

- [x] **Step 2: Insérer la section HTML entre `market-section` et `cta-band`**

Dans `index.html`, repérer ce texte exact (fin de `market-section`, juste avant le commentaire `<!-- CTA — CALCULATEUR TEMPS RÉEL -->`) :

```html
      </div>
    </div>
  </div>
</section>

<!-- CTA — CALCULATEUR TEMPS RÉEL -->
<section class="cta-band" id="cta-calculateur">
```

Insérer le bloc HTML complet (donné ci-dessus) juste après la ligne `</section>` (fin de `market-section`) et avant le commentaire `<!-- CTA — CALCULATEUR TEMPS RÉEL -->`, de sorte que le fichier contienne :

```html
      </div>
    </div>
  </div>
</section>

<!-- FOURNISSEURS PARTENAIRES -->
<!-- TODO: remplacer les chiffres de contrats (données de preview) par les vrais totaux M&S avant publication -->
<section class="sup-section">
  ... (bloc complet ci-dessus) ...
</section>

<!-- CTA — CALCULATEUR TEMPS RÉEL -->
<section class="cta-band" id="cta-calculateur">
```

- [x] **Step 3: Vérifier l'ordre et le nombre de cartes**

Run: `grep -oE '<span class="sup-num">0[1-5]</span> [^<]+' index.html`

Expected:
```
01 MetEnergie
02 OHM Energie
03 Alterna (ex-Vattenfall)
04 Engie
05 GazelEnergie
```

- [x] **Step 4: Vérifier qu'aucune classe `faq-item` n'a été touchée**

Run: `grep -c 'class="faq-item' index.html`

Expected: la même valeur qu'avant modification (à relever avec `git show HEAD:index.html | grep -c 'class="faq-item'` avant de commencer Step 1, puis comparer).

- [x] **Step 5: Vérification visuelle**

Ouvrir `index.html` dans un navigateur, faire défiler jusqu'à la nouvelle section entre le bloc marché et le CTA calculateur. Cliquer sur chacune des 5 cartes : chacune doit s'ouvrir/se fermer indépendamment des autres (pas d'accordéon exclusif), sans affecter la FAQ plus bas sur la page.

- [x] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(index): ajoute la section fournisseurs partenaires"
```

---

### Task 2: Section fournisseurs sur `b2b.html`

**Files:**
- Modify: `b2b.html:190` (fin du bloc `<style>`)
- Modify: `b2b.html:367-371` (entre la fin de `vals` et le début de `upload-section`)

**Interfaces:**
- Consumes: mêmes tokens CSS et classes que Task 1 ; classes `.sup-*` définies en Task 1 (même bloc CSS, dupliqué ici car `b2b.html` a son propre `<style>` inline indépendant de `index.html`).
- Produces: rien de nouveau — réutilise exactement les mêmes noms de classes et le même markup que Task 1.

- [x] **Step 1: Ajouter le bloc CSS avant la fermeture du `<style>`**

Dans `b2b.html`, juste avant la ligne `</style>` (ligne 190), ajouter le même bloc CSS complet que Task 1 Step 1.

- [x] **Step 2: Insérer la section HTML entre `vals` et `upload-section`**

Dans `b2b.html`, repérer ce texte exact (fin de `vals`, juste avant le commentaire `<!-- UPLOAD / ÉTUDE GRATUITE -->`) :

```html
        <p class="vb">Bureaux, copropriétés professionnelles, structures publiques et parapubliques bénéficient d'un accompagnement rigoureux, adapté aux procédures propres à chaque structure.</p>
      </div>
    </div>
  </div>
</section>

<!-- UPLOAD / ÉTUDE GRATUITE -->
<section class="upload-section" id="upload">
```

Insérer le même bloc HTML complet que Task 1 (identique, y compris le commentaire `TODO`) juste après `</section>` (fin de `vals`) et avant `<!-- UPLOAD / ÉTUDE GRATUITE -->`.

- [x] **Step 3: Vérifier l'ordre et le nombre de cartes**

Run: `grep -oE '<span class="sup-num">0[1-5]</span> [^<]+' b2b.html`

Expected: la même sortie que Task 1 Step 3.

- [x] **Step 4: Vérifier qu'aucune classe `faq-item` n'a été touchée**

Run: `grep -c 'class="faq-item' b2b.html`

Expected: la même valeur qu'avant modification (relevée avant Step 1 avec `git show HEAD:b2b.html | grep -c 'class="faq-item'`).

- [x] **Step 5: Vérification visuelle**

Ouvrir `b2b.html` dans un navigateur, vérifier que la section apparaît juste avant le bloc d'upload de facture, et que les 5 cartes s'ouvrent/se ferment indépendamment.

- [x] **Step 6: Commit**

```bash
git add b2b.html
git commit -m "feat(b2b): ajoute la section fournisseurs partenaires"
```

---

### Task 3: Section fournisseurs sur `barometre-energie.html`

**Files:**
- Modify: `barometre-energie.html:149` (fin du bloc `<style>`)
- Modify: `barometre-energie.html:216-219` (entre la fin de la section Méthodologie et le début de la section Historique)

**Interfaces:**
- Consumes: mêmes tokens CSS et classes que Task 1/2.
- Produces: rien de nouveau — réutilise exactement les mêmes noms de classes et le même markup que Task 1/2.

- [x] **Step 1: Ajouter le bloc CSS avant la fermeture du `<style>`**

Dans `barometre-energie.html`, juste avant la ligne `</style>` (ligne 149), ajouter le même bloc CSS complet que Task 1 Step 1.

- [x] **Step 2: Insérer la section HTML entre la Méthodologie et l'Historique**

Dans `barometre-energie.html`, repérer ce texte exact :

```html
    <p>Ces indicateurs sont publiés à titre purement informatif et ne constituent ni une offre commerciale ni un engagement de prix de la part de M&S Strategy.</p>
  </div>
</section>

<!-- HISTORIQUE / RETROSPECTIVES -->
<section class="steps" style="padding-top:1rem">
```

Insérer le même bloc HTML complet que Task 1 (identique, y compris le commentaire `TODO`) juste après `</section>` (fin de la Méthodologie) et avant `<!-- HISTORIQUE / RETROSPECTIVES -->`.

- [x] **Step 3: Vérifier l'ordre et le nombre de cartes**

Run: `grep -oE '<span class="sup-num">0[1-5]</span> [^<]+' barometre-energie.html`

Expected: la même sortie que Task 1 Step 3.

- [x] **Step 4: Vérification visuelle**

Ouvrir `barometre-energie.html` dans un navigateur, vérifier que la section apparaît entre la Méthodologie et l'Historique, et que les 5 cartes s'ouvrent/se ferment indépendamment. Vérifier aussi le rendu en mode clair (`data-theme="light"`) pour confirmer qu'aucun override supplémentaire n'est nécessaire.

- [x] **Step 5: Commit**

```bash
git add barometre-energie.html
git commit -m "feat(barometre): ajoute la section fournisseurs partenaires"
```

---

### Task 4: Vérification finale multi-pages

**Files:**
- Aucun fichier modifié — tâche de vérification pure.

**Interfaces:**
- Consumes: résultat des Tasks 1-3.
- Produces: rien — confirmation finale avant livraison.

- [x] **Step 1: Confirmer l'ordre identique sur les 3 pages**

Run:
```bash
for f in index.html b2b.html barometre-energie.html; do
  echo "=== $f ==="
  grep -oE '<span class="sup-num">0[1-5]</span> [^<]+' "$f"
done
```

Expected: pour les 3 fichiers, la même séquence :
```
01 MetEnergie
02 OHM Energie
03 Alterna (ex-Vattenfall)
04 Engie
05 GazelEnergie
```

- [x] **Step 2: Confirmer la présence du TODO de rappel sur les 3 pages**

Run: `grep -c "TODO: remplacer les chiffres de contrats" index.html b2b.html barometre-energie.html`

Expected: `1` pour chacun des 3 fichiers.

- [x] **Step 3: Lancer la suite de tests existante (non liée au HTML mais doit rester verte)**

Run: `npm test`

Expected: tous les tests existants passent toujours (aucun fichier JS/`.mjs` n'a été modifié par ce plan).

- [x] **Step 4: Commit final (si des ajustements ont eu lieu pendant la vérification)**

```bash
git status --short
```

Si des changements restent non commités suite à des corrections faites pendant la vérification, les committer avec un message décrivant la correction. Sinon, ne rien committer (rien à faire).
