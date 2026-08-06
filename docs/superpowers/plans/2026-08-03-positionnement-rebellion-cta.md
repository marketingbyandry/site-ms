# Positionnement "cabinet d'expertise énergie" + CTA/maillage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the "cabinet d'expertise énergie" positioning (manifesto + second-avis framing), three sector declinations (agriculture, industrie, logistique), and a denser CTA/maillage layer to `b2b.html`, `index.html`, `comment-ca-marche.html`, `ms-blog-article-1.html` and `ms-blog-article-2.html`.

**Architecture:** Pure content/markup additions to five existing static HTML pages — no new pages, no new CSS files, no JS changes. Every insertion reuses CSS classes already defined in that page's own `<style>` block (verified in the File Structure section below). This is `docs/superpowers/specs/2026-08-03-positionnement-rebellion-cta-design.md` translated into exact diffs.

**Tech Stack:** Static HTML/CSS, no build step, no test framework for prose content (matches this repo's precedent set by `docs/superpowers/plans/2026-07-27-barometre-energie.md` Tasks 4-7, which shipped copy/markup changes verified by grep + manual read, not unit tests).

## Global Constraints

- Vocabulaire "cabinet" en avant, "courtier/courtage" en retrait mais jamais supprimé, sur toutes les pages concernées.
- Aucun fournisseur ni courtier concurrent nommé, à aucun endroit.
- Aucun lien article-à-article chronologique entre les 7 rétrospectives Baromètre (hors scope de ce plan de toute façon — on ne touche pas aux fichiers `ms-blog-barometre-*.html`).
- Tous les CTA d'action pointent vers `b2b.html#upload`, sauf ancres internes à `b2b.html` (qui pointent vers `#upload`).
- **Ne jamais écrire que M&S Strategy est payée par le client plutôt que par le fournisseur.** C'est faux : `index.html` (sections "Notre position", "Bien choisir son courtier", FAQ), `b2b.html` (FAQ), et `comment-ca-marche.html` (section SEO, FAQ) affirment tous, publiquement, que M&S Strategy est rémunérée par les fournisseurs via une commission standardisée — c'est déjà l'argument de neutralité du site. Ne pas le contredire.
- Convention d'ancre : toujours descriptive et contextuelle (jamais "cliquez ici" / "en savoir plus"), intégrée naturellement à la phrase.
- Ne pas retirer ou modifier le CTA mailto existant dans `ms-blog-article-1.html` / `ms-blog-article-2.html` (`#cta` section) — c'est un canal de conversion déjà en place et sanctionné (b2b.html mentionne explicitement l'email comme canal alternatif). Ce plan ajoute des liens, il ne change pas les canaux existants.
- Les pages villes (`courtier-energie-{ville}.html`) n'existent pas encore : ne pas y faire référence, ne pas créer de lien vers elles.

---

## File Structure

Aucun nouveau fichier créé. Cinq fichiers modifiés :

- `b2b.html` — nouvelle section positionnement (manifeste + second avis + CTA), 2 cartes secteur ajoutées, 1 carte secteur réécrite, 2 taglines corrigées.
- `index.html` — 6 taglines/métadonnées corrigées (title, og:title, JSON-LD `alternateName`, brand strip, quote band, fbot), 1 paragraphe manifeste ajouté dans la section "Notre position".
- `comment-ca-marche.html` — 2 taglines corrigées, 1 bloc CTA ajouté après le parcours en 5 étapes.
- `ms-blog-article-1.html` — 1 lien hypertexte mi-article, 1 lien ajouté dans le bloc "Lire aussi".
- `ms-blog-article-2.html` — 1 lien hypertexte mi-article, 1 lien ajouté dans le bloc "Lire aussi".

Classes CSS réutilisées, toutes déjà définies dans le fichier concerné (aucune nouvelle règle CSS nécessaire) : `.stag`, `.sh2`, `.sbody`, `.def-box`/`.def-title`/`.def-body`, `.pcta`/`.ca`, `.reveal`/`.d1`/`.d2`/`.d3`, `.vcard`/`.vgrid`/`.vn`/`.vt`/`.vb` (b2b.html) ; `.callout`/`.callout-title`, `.cta-btn` propre à chaque article de blog (article-1 et article-2 ont chacun leur propre déclaration, ne pas les confondre avec `.cta-btn` d'index.html qui a un rendu différent).

---

### Task 1: b2b.html — Section positionnement + taglines

**Files:**
- Modify: `b2b.html:307-309` (insertion de la nouvelle section entre SEO INTRO et PROCESS)
- Modify: `b2b.html:420` (tagline quote band)
- Modify: `b2b.html:473` (tagline fbot)

**Interfaces:**
- Consumes: classes CSS `.seo-intro`, `.stag`, `.sh2`, `.sbody`, `.def-box`, `.def-title`, `.def-body`, `.pcta`, `.ca`, `.reveal`, `.d1`-`.d3` (toutes définies dans `b2b.html:11-190`). Ancre `#upload` déjà présente sur `b2b.html:371`.
- Produces: rien de consommé par une autre tâche — section autonome.

- [ ] **Step 1: Insérer la section positionnement**

Dans `b2b.html`, entre la fin de la section SEO INTRO (ligne 307, `</section>`) et le commentaire `<!-- PROCESS -->` (ligne 309), insérer :

```html

<!-- POSITIONNEMENT -->
<section class="seo-intro">
  <div>
    <span class="stag reveal">Notre positionnement</span>
    <h2 class="sh2 reveal d1">Pourquoi <em>un cabinet</em>, pas un courtier de plus.</h2>
    <div class="sbody reveal d2">
      <p>Les fournisseurs d'énergie ont un objectif : leur rentabilité. Le vôtre n'entre pas dans l'équation — sauf comme ligne de marge à optimiser. Grilles tarifaires opaques, reconductions tacites, contrats pensés pour décourager la comparaison : ce n'est pas un hasard, c'est un modèle. Et la plupart des entreprises françaises paient ce prix sans jamais savoir qu'un autre était possible.</p>
      <p>Nous pensons que ce rapport de force ne devrait pas exister. Une PME n'a ni le temps ni les moyens de décortiquer un marché de gros pensé pour des traders, mais elle a le droit de payer un prix juste. C'est tout l'objet du Baromètre : rendre visible ce qui reste sciemment illisible, et vous donner, gratuitement, l'information que votre fournisseur espère que vous n'irez jamais chercher.</p>
      <p><strong>Nous ne sommes pas neutres. Nous sommes du côté de l'entreprise qui paie la facture, pas de celui qui l'envoie.</strong></p>
    </div>
    <a href="#upload" class="pcta reveal d3">Vérifiez votre contrat — gratuit, en 2 minutes <span class="ca">→</span></a>
  </div>
  <div class="reveal d2">
    <div class="def-box">
      <p class="def-title">Vous avez déjà un courtier ?</p>
      <p class="def-body">C'est une bonne chose : gérer seul un contrat d'énergie pro est un métier à part entière. Mais un courtier reste un intermédiaire commercial — et comme toute relation commerciale, elle mérite d'être vérifiée de temps en temps, pas par méfiance, mais par bon sens de gestion.</p>
      <p class="def-body" style="margin-top:1rem"><strong>M&S Strategy n'est pas un courtier de plus.</strong> Nous sommes un cabinet d'expertise énergie : notre rôle n'est pas de vous vendre un contrat, mais de vous dire, chiffres du marché de gros à l'appui, si celui que vous avez déjà est le bon. Le Baromètre est le premier niveau de cette expertise, gratuit et sans engagement.</p>
      <p class="def-body" style="margin-top:.8rem;font-size:.85rem">Retrouvez l'historique complet des prix sur <a href="blog.html" style="color:var(--teal-light)">notre blog</a>.</p>
    </div>
    <a href="barometre-energie.html" style="color:var(--teal-light);font-size:.9rem">Consulter le Baromètre des prix de l'énergie →</a>
  </div>
</section>
```

- [ ] **Step 2: Vérifier l'insertion**

Run: `grep -c 'Pourquoi <em>un cabinet</em>' b2b.html && grep -c 'Vous avez déjà un courtier' b2b.html`
Expected: `1` puis `1`.

Run: `grep -c '<section class="seo-intro">' b2b.html`
Expected: `2` (la section SEO INTRO d'origine + la nouvelle — confirme que la nouvelle section réutilise bien la classe existante sans dupliquer une règle CSS).

Run: `grep -c 'href="blog.html"' b2b.html`
Expected: `3` (2 occurrences déjà existantes — nav ligne 262, footer ligne 458 — plus le nouveau lien contextuel ajouté dans la section preuve, requis par le spec pour le maillage b2b.html → blog.html).

- [ ] **Step 3: Corriger la tagline du bandeau de citation**

Dans `b2b.html:420`, remplacer :

```html
  <span class="qs">M&S Strategy · Courtier en énergie indépendant depuis 2012</span>
```

par :

```html
  <span class="qs">M&S Strategy · Cabinet d'expertise énergie indépendant depuis 2012</span>
```

- [ ] **Step 4: Corriger la tagline du pied de page**

Dans `b2b.html:473`, remplacer :

```html
  <span>Courtier en énergie indépendant depuis 2012 · Gaz · Électricité · France</span>
```

par :

```html
  <span>Cabinet d'expertise énergie indépendant depuis 2012 · Gaz · Électricité · France</span>
```

- [ ] **Step 5: Vérifier les taglines**

Run: `grep -c "Cabinet d'expertise énergie indépendant depuis 2012" b2b.html`
Expected: `2`.

- [ ] **Step 6: Commit**

```bash
git add b2b.html
git commit -m "content: add positioning section (cabinet framing, second avis) to b2b.html"
```

---

### Task 2: b2b.html — Déclinaisons sectorielles (agriculture, industrie, logistique)

**Files:**
- Modify: `b2b.html:350-366` (section `.vals` / `.vgrid`, bloc SECTORS)

**Interfaces:**
- Consumes: classes CSS `.vgrid`, `.vcard`, `.vn`, `.vt`, `.vb`, `.reveal`/`.d1`/`.d2`/`.d3` (définies dans `b2b.html:127-133`).
- Produces: rien.

- [ ] **Step 1: Réécrire la carte Industrie et ajouter Agriculture + Logistique**

Dans `b2b.html`, remplacer le bloc (lignes 350-366) :

```html
    <div class="vgrid">
      <div class="vcard reveal">
        <div class="vn">01</div>
        <div class="vt">Industrie & production</div>
        <p class="vb">Sites à forte consommation, puissance souscrite élevée, besoins de continuité : nous négocions des conditions adaptées à vos contraintes de production.</p>
      </div>
      <div class="vcard reveal d1">
        <div class="vn">02</div>
        <div class="vt">Commerce & multi-sites</div>
        <p class="vb">Réseaux de boutiques, franchises, agences réparties sur le territoire. Nous consolidons vos volumes pour un pouvoir de négociation renforcé.</p>
      </div>
      <div class="vcard reveal d2">
        <div class="vn">03</div>
        <div class="vt">Tertiaire & collectivités</div>
        <p class="vb">Bureaux, copropriétés professionnelles, structures publiques et parapubliques bénéficient d'un accompagnement rigoureux, adapté aux procédures propres à chaque structure.</p>
      </div>
    </div>
```

par :

```html
    <div class="vgrid">
      <div class="vcard reveal">
        <div class="vn">01</div>
        <div class="vt">Industrie & production</div>
        <p class="vb">Un contrat non renégocié depuis 3 ans coûte presque toujours plus cher que le marché. Four, compresseurs, process thermique : vos plus gros postes de consommation méritent une vérification systématique, pas une reconduction silencieuse.</p>
      </div>
      <div class="vcard reveal d1">
        <div class="vn">02</div>
        <div class="vt">Commerce & multi-sites</div>
        <p class="vb">Réseaux de boutiques, franchises, agences réparties sur le territoire. Nous consolidons vos volumes pour un pouvoir de négociation renforcé.</p>
      </div>
      <div class="vcard reveal d2">
        <div class="vn">03</div>
        <div class="vt">Tertiaire & collectivités</div>
        <p class="vb">Bureaux, copropriétés professionnelles, structures publiques et parapubliques bénéficient d'un accompagnement rigoureux, adapté aux procédures propres à chaque structure.</p>
      </div>
      <div class="vcard reveal d3">
        <div class="vn">04</div>
        <div class="vt">Agriculture</div>
        <p class="vb">Irrigation, séchage du grain, chambres froides, serres chauffées : vos postes énergétiques pèsent lourd, et votre fournisseur le sait. Nous vous donnons le même niveau de comparaison qu'un service achats dédié.</p>
      </div>
      <div class="vcard reveal">
        <div class="vn">05</div>
        <div class="vt">Plateformes logistiques</div>
        <p class="vb">Froid, éclairage, quais, manutention électrique : sur une exploitation multi-sites, chaque contrat a ses propres conditions, presque impossibles à comparer seul. Nous vous donnons un point de repère unique pour tous vos sites.</p>
      </div>
    </div>
```

- [ ] **Step 2: Vérifier**

Run: `grep -c 'class="vcard' b2b.html`
Expected: `5`.

Run: `grep -c 'Plateformes logistiques\|>Agriculture<' b2b.html`
Expected: `2`.

- [ ] **Step 3: Commit**

```bash
git add b2b.html
git commit -m "content: add agriculture/logistique sector cards, firm up industrie copy"
```

---

### Task 3: index.html — Taglines "cabinet" + manifeste dans "Notre position"

**Files:**
- Modify: `index.html:6, 340, 351, 551, 836, 903` (6 occurrences ponctuelles)
- Modify: `index.html:687-691` (section `.vals-header`)

**Interfaces:**
- Consumes: classe CSS `.vals-header` (définie dans `index.html:236-237`). Page existante `barometre-energie.html`.
- Produces: rien.

- [ ] **Step 1: Corriger le title**

Dans `index.html:6`, remplacer :

```html
<title>M&S Strategy, courtier en énergie indépendant · Gaz · Électricité depuis 2012</title>
```

par :

```html
<title>M&S Strategy, cabinet d'expertise énergie indépendant · Gaz · Électricité depuis 2012</title>
```

- [ ] **Step 2: Corriger og:title**

Dans `index.html:340`, remplacer :

```html
<meta property="og:title" content="M&S Strategy, courtier en énergie indépendant · Gaz · Électricité depuis 2012">
```

par :

```html
<meta property="og:title" content="M&S Strategy, cabinet d'expertise énergie indépendant · Gaz · Électricité depuis 2012">
```

- [ ] **Step 3: Corriger le JSON-LD alternateName**

Dans `index.html:351`, remplacer :

```json
  "alternateName": "M&S Strategy — Courtier en énergie indépendant",
```

par :

```json
  "alternateName": "M&S Strategy — Cabinet d'expertise énergie indépendant",
```

- [ ] **Step 4: Corriger la brand strip**

Dans `index.html:551`, remplacer :

```html
  <p class="bey reveal">Courtier en énergie indépendant · Depuis 2012 · Gaz · Électricité · France entière</p>
```

par :

```html
  <p class="bey reveal">Cabinet d'expertise énergie indépendant · Depuis 2012 · Gaz · Électricité · France entière</p>
```

- [ ] **Step 5: Corriger le bandeau de citation**

Dans `index.html:836`, remplacer :

```html
  <span class="qs">M&S Strategy · Courtier en énergie indépendant depuis 2012 · Gaz · Électricité</span>
```

par :

```html
  <span class="qs">M&S Strategy · Cabinet d'expertise énergie indépendant depuis 2012 · Gaz · Électricité</span>
```

- [ ] **Step 6: Corriger le pied de page**

Dans `index.html:903`, remplacer :

```html
  <span>Courtier en énergie indépendant depuis 2012 · Gaz · Électricité · France</span>
```

par :

```html
  <span>Cabinet d'expertise énergie indépendant depuis 2012 · Gaz · Électricité · France</span>
```

- [ ] **Step 7: Vérifier les 6 corrections**

Run: `grep -ic "cabinet d'expertise énergie" index.html`
Expected: `6`.

Run: `grep -ic "courtier en énergie indépendant" index.html`
Expected: `0` (toutes les occurrences en auto-description directe ont été corrigées ; le mot "courtier" reste présent ailleurs dans la page — sections "Comprendre le courtage", FAQ, etc. — volontairement, seule l'auto-description "M&S Strategy [est un] courtier" recule).

- [ ] **Step 8: Enrichir la section "Notre position" avec le manifeste**

Dans `index.html`, remplacer le bloc (lignes 687-691) :

```html
    <div class="vals-header reveal">
      <span class="stag">Notre position</span>
      <h2 class="sh2">L'indépendance n'a pas de prix.</h2>
      <p>Notre cabinet est rémunéré directement par les fournisseurs. Ce modèle exclut structurellement tout favoritisme. Seuls les chiffres comptent.</p>
    </div>
```

par :

```html
    <div class="vals-header reveal">
      <span class="stag">Notre position</span>
      <h2 class="sh2">L'indépendance n'a pas de prix.</h2>
      <p>Notre cabinet est rémunéré directement par les fournisseurs. Ce modèle exclut structurellement tout favoritisme. Seuls les chiffres comptent.</p>
      <p style="margin-top:.8rem">Nous ne sommes pas neutres pour autant : nous sommes du côté de l'entreprise qui paie la facture, pas de celui qui l'envoie. C'est pour ça que nous existons — <a href="barometre-energie.html" style="color:var(--teal-light)">et pour ça que le Baromètre est gratuit</a>.</p>
    </div>
```

- [ ] **Step 9: Vérifier**

Run: `grep -c "pas de celui qui l'envoie" index.html`
Expected: `1`.

- [ ] **Step 10: Commit**

```bash
git add index.html
git commit -m "content: lead with cabinet framing in taglines, add manifesto to Notre position"
```

---

### Task 4: comment-ca-marche.html — Taglines + CTA post-étapes

**Files:**
- Modify: `comment-ca-marche.html:278` (tagline quote band)
- Modify: `comment-ca-marche.html:331` (tagline fbot)
- Modify: `comment-ca-marche.html:224-226` (insertion d'un bloc CTA entre la section `.steps` et la section SEO INTRO)

**Interfaces:**
- Consumes: classes CSS `.sh2`, `.pcta`, `.ca`, `.reveal` (définies dans `comment-ca-marche.html:70-149`). Ancre `b2b.html#upload` déjà utilisée ailleurs dans ce fichier (lignes 174, 183).
- Produces: rien.

**Note de cadrage** : le spec envisageait "un bouton par étape" (3-4 boutons) dans `.steps`. Cette page a 5 étapes dans une timeline visuelle continue (`.step` blocks) ; ajouter un bouton par étape casserait cette continuité visuelle pour un gain de conversion marginal. Choix délibéré et plus conforme à "ajouts ciblés" : un seul bloc CTA après la timeline complète, pas un bouton par étape.

- [ ] **Step 1: Corriger la tagline du bandeau de citation**

Dans `comment-ca-marche.html:278`, remplacer :

```html
  <span class="qs">M&S Strategy · Courtier en énergie indépendant depuis 2012</span>
```

par :

```html
  <span class="qs">M&S Strategy · Cabinet d'expertise énergie indépendant depuis 2012</span>
```

- [ ] **Step 2: Corriger la tagline du pied de page**

Dans `comment-ca-marche.html:331`, remplacer :

```html
  <span>Courtier en énergie indépendant depuis 2012 · Gaz · Électricité · France</span>
```

par :

```html
  <span>Cabinet d'expertise énergie indépendant depuis 2012 · Gaz · Électricité · France</span>
```

- [ ] **Step 3: Ajouter le bloc CTA après les étapes**

Dans `comment-ca-marche.html`, entre la fin de la section `.steps` (ligne 224, `</section>`) et le commentaire `<!-- SEO INTRO -->` (ligne 226), insérer :

```html

<!-- CTA POST-ÉTAPES -->
<div style="max-width:900px;margin:0 auto;padding:0 5vw 4rem;text-align:center" class="reveal">
  <p class="sh2" style="font-size:1.3rem;margin-bottom:1.2rem">Vous connaissez le processus. <em>Reste à savoir où vous en êtes.</em></p>
  <a href="b2b.html#upload" class="pcta">Vérifiez votre contrat — gratuit, en 2 minutes <span class="ca">→</span></a>
</div>
```

- [ ] **Step 4: Vérifier**

Run: `grep -c "Cabinet d'expertise énergie indépendant depuis 2012" comment-ca-marche.html`
Expected: `2`.

Run: `grep -c "Reste à savoir où vous en êtes" comment-ca-marche.html`
Expected: `1`.

- [ ] **Step 5: Commit**

```bash
git add comment-ca-marche.html
git commit -m "content: add cabinet taglines and post-steps CTA to comment-ca-marche.html"
```

---

### Task 5: ms-blog-article-1.html — Maillage interne vers b2b.html

**Files:**
- Modify: `ms-blog-article-1.html:400` (lien hypertexte mi-article)
- Modify: `ms-blog-article-1.html:509-513` (bloc "Lire aussi")

**Interfaces:**
- Consumes: aucune classe nouvelle — le lien réutilise le style inline `style="color:var(--teal-light)"` déjà utilisé pour tous les liens du bloc "Lire aussi" existant (ligne 511-512), pour rester visuellement cohérent avec le pattern de liens déjà en place dans ce fichier.
- Produces: rien.

- [ ] **Step 1: Ajouter le lien hypertexte mi-article**

Dans `ms-blog-article-1.html:400`, remplacer :

```html
    <p>Un responsable qui négocie seul consulte rarement plus de deux ou trois fournisseurs. Un courtier indépendant en consulte simultanément une vingtaine, via un appel d'offres structuré. La différence de résultat est mécanique.</p>
```

par :

```html
    <p>Un responsable qui négocie seul consulte rarement plus de deux ou trois fournisseurs. Un courtier indépendant en consulte simultanément une vingtaine, via un appel d'offres structuré. La différence de résultat est mécanique — <a href="b2b.html" style="color:var(--teal-light)">comme détaillé sur notre page dédiée aux entreprises</a>.</p>
```

- [ ] **Step 2: Ajouter un lien vers b2b.html dans le bloc "Lire aussi"**

Dans `ms-blog-article-1.html:509-513`, remplacer :

```html
    <div class="callout reveal">
      <p class="callout-title">Lire aussi</p>
      <p><a href="ms-blog-article-2.html" style="color:var(--teal-light)">Renouvellement contrat énergie industrie : le guide du bon moment →</a><br>
      <a href="blog.html" style="color:var(--teal-light)">Voir toutes nos analyses énergie →</a></p>
    </div>
```

par :

```html
    <div class="callout reveal">
      <p class="callout-title">Lire aussi</p>
      <p><a href="ms-blog-article-2.html" style="color:var(--teal-light)">Renouvellement contrat énergie industrie : le guide du bon moment →</a><br>
      <a href="b2b.html" style="color:var(--teal-light)">Découvrir notre accompagnement pour les entreprises →</a><br>
      <a href="blog.html" style="color:var(--teal-light)">Voir toutes nos analyses énergie →</a></p>
    </div>
```

- [ ] **Step 3: Vérifier**

Run: `grep -c 'href="b2b.html"' ms-blog-article-1.html`
Expected: `2`.

- [ ] **Step 4: Commit**

```bash
git add ms-blog-article-1.html
git commit -m "content: add contextual links to b2b.html in ms-blog-article-1.html"
```

---

### Task 6: ms-blog-article-2.html — Maillage interne vers b2b.html

**Files:**
- Modify: `ms-blog-article-2.html:307` (lien hypertexte mi-article)
- Modify: `ms-blog-article-2.html:361-365` (bloc "Lire aussi")

**Interfaces:**
- Consumes: même pattern que Task 5 — style inline `color:var(--teal-light)` déjà utilisé dans ce fichier.
- Produces: rien.

- [ ] **Step 1: Ajouter le lien hypertexte mi-article**

Dans `ms-blog-article-2.html:307`, remplacer :

```html
    <p>Nous avons régulièrement obtenu pour des clients des <strong>baisses tarifaires de 8 à 15 % auprès de leur fournisseur actuel</strong> : uniquement en leur présentant des offres alternatives. La mise en concurrence est le seul levier qui fonctionne systématiquement.</p>
```

par :

```html
    <p>Nous avons régulièrement obtenu pour des clients des <strong>baisses tarifaires de 8 à 15 % auprès de leur fournisseur actuel</strong> : uniquement en leur présentant des offres alternatives. La mise en concurrence est le seul levier qui fonctionne systématiquement — <a href="b2b.html" style="color:var(--teal-light)">comme détaillé sur notre page dédiée aux entreprises</a>.</p>
```

- [ ] **Step 2: Ajouter un lien vers b2b.html dans le bloc "Lire aussi"**

Dans `ms-blog-article-2.html:361-365`, remplacer :

```html
    <div class="callout reveal">
      <p class="callout-title">Lire aussi</p>
      <p><a href="ms-blog-article-1.html" style="color:var(--teal-light)">Énergie industrielle : pourquoi votre site paie trop →</a><br>
      <a href="blog.html" style="color:var(--teal-light)">Voir toutes nos analyses énergie →</a></p>
    </div>
```

par :

```html
    <div class="callout reveal">
      <p class="callout-title">Lire aussi</p>
      <p><a href="ms-blog-article-1.html" style="color:var(--teal-light)">Énergie industrielle : pourquoi votre site paie trop →</a><br>
      <a href="b2b.html" style="color:var(--teal-light)">Découvrir notre accompagnement pour les entreprises →</a><br>
      <a href="blog.html" style="color:var(--teal-light)">Voir toutes nos analyses énergie →</a></p>
    </div>
```

- [ ] **Step 3: Vérifier**

Run: `grep -c 'href="b2b.html"' ms-blog-article-2.html`
Expected: `2`.

- [ ] **Step 4: Commit**

```bash
git add ms-blog-article-2.html
git commit -m "content: add contextual links to b2b.html in ms-blog-article-2.html"
```

---

## Final check (whole-branch, run after all 6 tasks)

- [ ] Run `grep -rc "nous sommes payés par vous\|payé par le client" b2b.html index.html comment-ca-marche.html ms-blog-article-1.html ms-blog-article-2.html` — expect `0` everywhere (the false remuneration claim must never appear).
- [ ] Run `grep -l 'courtier-energie-' b2b.html index.html comment-ca-marche.html ms-blog-article-1.html ms-blog-article-2.html` — expect no output (no dangling references to the not-yet-created city pages).
- [ ] Open each of the 5 modified pages in a browser (or `python3 -m http.server` from the repo root) and visually confirm: the new sections render without layout breakage, the `.pcta`/`.cta-btn` buttons are visually consistent with existing buttons on the same page, and no text overflows its container on mobile width (~375px).

