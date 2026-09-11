# Maillage interne stratégique + H1 index.html Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger l'absence de H1 sur `index.html` et introduire un maillage interne contextuel (liens `.ilink` insérés dans des paragraphes existants) sur 13 pages du site, pour renforcer la structure SEO/UX sans ajouter de nouveau contenu.

**Architecture:** Site statique multi-pages sans moteur de templating, chaque page a son propre `<style>` inline. Deux classes CSS partagées (`.sr-only`, `.ilink`) sont ajoutées une seule fois dans `assets/nav-mobile.css` (déjà chargé par toutes les pages). Les liens sont insérés en enveloppant une portion de texte déjà existante dans chaque paragraphe cible — aucune phrase nouvelle n'est écrite.

**Tech Stack:** HTML/CSS statique, aucune dépendance ajoutée.

## Global Constraints

- 3 à 5 liens `.ilink` par page (exception documentée : `b2c.html` = 2 liens, aucune 3ᵉ opportunité naturelle trouvée en texte narratif ; `blog.html` = 3 liens, les cartes `res-card` empêchent d'ajouter un `<a>` imbriqué).
- Ancre textuelle = portion de texte déjà existante, jamais une phrase ajoutée pour l'occasion.
- Un seul lien par cible maximum par page (pas de doublon vers la même cible).
- Jamais de lien d'une page vers elle-même.
- Jamais de `<a>` inséré à l'intérieur d'un `<h1>`/`<h2>`/`<h3>`, ni imbriqué dans un `<a>` existant (invalide en HTML).
- Tous les liens en texte courant utilisent `class="ilink"`.
- Pas de tests automatisés sur ce projet pour le contenu HTML statique (suite `npm test` = 12 fichiers `test/*.test.mjs`, aucun ne couvre le HTML) — vérification par `grep` (comptage exact des occurrences) + relecture visuelle manuelle.
- Aucune modification des pages hors périmètre : `cgv.html`, `mentions-legales.html`, `politique-confidentialite.html`, `ms-strategy-calculateur.html`, `ms-strategy-landing-2.html`.
- Aucune modification de la nav, des CTA, ou du design visuel existant.

---

## Task 1: H1 masqué + classe `.sr-only` sur index.html

**Files:**
- Modify: `index.html:569`
- Modify: `assets/nav-mobile.css` (fin de fichier, après ligne 47)

**Interfaces:**
- Produces: classe CSS `.sr-only` réutilisable par toute page qui en aurait besoin plus tard (aucune autre page n'en a besoin dans ce plan).

- [ ] **Step 1: Ajouter la classe `.sr-only` à `assets/nav-mobile.css`**

Ajouter à la toute fin du fichier (après la ligne 47, en dehors du bloc `@media(max-width:768px){...}`) :

```css

.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
```

- [ ] **Step 2: Vérifier que la règle est bien hors du media query**

Run: `grep -n "sr-only\|^}" assets/nav-mobile.css | tail -5`
Expected: `.sr-only{...}` apparaît après la dernière accolade fermante du fichier (ligne 47 `}`), donc au niveau racine du CSS.

- [ ] **Step 3: Ajouter le H1 masqué dans index.html**

Dans `index.html`, juste avant la ligne `<section class="hero" id="hero">` (ligne 569), insérer :

```html
<h1 class="sr-only">Cabinet d'expertise en négociation d'énergie — Courtier en énergie indépendant depuis 2012 — Professionnels et particuliers</h1>
<section class="hero" id="hero">
```

- [ ] **Step 4: Vérifier qu'il n'existe qu'un seul H1 sur la page**

Run: `grep -c "<h1" index.html`
Expected: `1`

- [ ] **Step 5: Vérifier visuellement qu'aucun changement n'apparaît**

Ouvrir `index.html` dans un navigateur (ou via le serveur de dev du projet) : le hero à deux panneaux (Pro/Particulier) doit être visuellement identique à avant — le H1 est invisible (`.sr-only`).

- [ ] **Step 6: Commit**

```bash
git add index.html assets/nav-mobile.css
git commit -m "fix: add missing H1 on index.html + sr-only utility class"
```

---

## Task 2: Classe `.ilink` pour les liens contextuels

**Files:**
- Modify: `assets/nav-mobile.css` (fin de fichier, après la règle `.sr-only` ajoutée en Task 1)

**Interfaces:**
- Produces: classe CSS `.ilink`, consommée par toutes les Tasks 3 à 15.

- [ ] **Step 1: Ajouter la classe `.ilink`**

```css

.ilink{color:var(--teal-light);text-decoration:underline;text-underline-offset:2px}
.ilink:hover{color:var(--green)}
```

- [ ] **Step 2: Vérifier la présence de la règle**

Run: `grep -n "\.ilink" assets/nav-mobile.css`
Expected: 2 lignes (`.ilink{...}` et `.ilink:hover{...}`)

- [ ] **Step 3: Commit**

```bash
git add assets/nav-mobile.css
git commit -m "feat: add .ilink utility class for contextual internal links"
```

---

## Task 3: Maillage interne — index.html (4 liens)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: classe `.ilink` (Task 2).

- [ ] **Step 1: Lien vers barometre-energie.html (ligne ~690)**

Edit exact (old → new) :

```
OLD: La première est <strong>le niveau du marché au moment de la signature</strong> : les prix de gros de l'énergie fluctuent chaque jour, sous l'effet des tensions géopolitiques, des capacités de production et des conditions climatiques.
NEW: La première est <strong>le niveau du marché au moment de la signature</strong> : <a href="barometre-energie.html" class="ilink">les prix de gros de l'énergie fluctuent chaque jour</a>, sous l'effet des tensions géopolitiques, des capacités de production et des conditions climatiques.
```

- [ ] **Step 2: Lien vers comment-ca-marche.html (ligne ~649)**

```
OLD: <li>Accompagnement dans votre prise de décision, sans pression</li>
NEW: <li><a href="comment-ca-marche.html" class="ilink">Accompagnement dans votre prise de décision</a>, sans pression</li>
```

- [ ] **Step 3: Lien vers b2b.html (ligne ~744)**

```
OLD: Parmi l'ensemble du marché consulté à chaque étude, voici les fournisseurs avec lesquels nous concluons le plus de contrats pour nos clients.
NEW: Parmi l'ensemble du marché consulté à <a href="b2b.html" class="ilink">chaque étude</a>, voici les fournisseurs avec lesquels nous concluons le plus de contrats pour nos clients.
```

- [ ] **Step 4: Lien vers resultats.html (ligne ~906)**

```
OLD: Grâce à des partenariats solides avec les grands opérateurs énergétiques, nous sécurisons chaque année des contrats à coût réduit pour plus de <strong>100 000 foyers</strong>, et autant d'entreprises.
NEW: Grâce à des partenariats solides avec les grands opérateurs énergétiques, nous sécurisons chaque année <a href="resultats.html" class="ilink">des contrats à coût réduit</a> pour plus de <strong>100 000 foyers</strong>, et autant d'entreprises.
```

- [ ] **Step 5: Vérifier le compte et les cibles**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' index.html | sort | uniq -c`
Expected: 4 lignes, une occurrence chacune pour `barometre-energie.html`, `comment-ca-marche.html`, `b2b.html`, `resultats.html`.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add contextual internal links on index.html"
```

---

## Task 4: Maillage interne — b2b.html (3 liens)

**Files:**
- Modify: `b2b.html`

- [ ] **Step 1: Lien vers b2c.html (ligne ~341)**

```
OLD: Une entreprise ne consomme pas de l'énergie comme un particulier.
NEW: Une entreprise ne consomme pas de l'énergie comme <a href="b2c.html" class="ilink">un particulier</a>.
```

- [ ] **Step 2: Lien vers barometre-energie.html (ligne ~342)**

```
OLD: M&S Strategy analyse la structure complète de vos contrats actuels et lance un appel d'offres simultané auprès de l'ensemble des fournisseurs actifs sur le marché professionnel (historiques et alternatifs) pour identifier la meilleure combinaison prix/conditions pour votre profil de consommation.
NEW: M&S Strategy analyse la structure complète de vos contrats actuels et lance un appel d'offres simultané auprès de l'ensemble des fournisseurs actifs sur le marché professionnel (historiques et alternatifs) pour identifier <a href="barometre-energie.html" class="ilink">la meilleure combinaison prix/conditions</a> pour votre profil de consommation.
```

- [ ] **Step 3: Lien vers resultats.html (ligne ~383)**

```
OLD: <p class="hcb">Vous recevez un tableau comparatif clair : prix, conditions, clauses d'indexation. Vous gardez la décision finale.</p>
NEW: <p class="hcb">Vous recevez un <a href="resultats.html" class="ilink">tableau comparatif clair</a> : prix, conditions, clauses d'indexation. Vous gardez la décision finale.</p>
```

- [ ] **Step 4: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' b2b.html | sort | uniq -c`
Expected: 3 lignes (`b2c.html`, `barometre-energie.html`, `resultats.html`).

- [ ] **Step 5: Commit**

```bash
git add b2b.html
git commit -m "feat: add contextual internal links on b2b.html"
```

---

## Task 5: Maillage interne — b2c.html (2 liens, exception documentée)

**Files:**
- Modify: `b2c.html`

- [ ] **Step 1: Lien vers comment-ca-marche.html (ligne ~349)**

```
OLD: <p>Un processus simple, transparent, et sans démarche complexe de votre côté.</p>
NEW: <p>Un <a href="comment-ca-marche.html" class="ilink">processus simple, transparent</a>, et sans démarche complexe de votre côté.</p>
```

- [ ] **Step 2: Lien vers b2b.html (ligne ~483, footer)**

```
OLD: Cabinet de courtage en énergie indépendant. Gaz et électricité pour professionnels et particuliers depuis 2012.
NEW: Cabinet de courtage en énergie indépendant. Gaz et électricité pour <a href="b2b.html" class="ilink">professionnels</a> et particuliers depuis 2012.
```

- [ ] **Step 3: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' b2c.html | sort | uniq -c`
Expected: 2 lignes (`comment-ca-marche.html`, `b2b.html`). C'est en dessous de la fourchette 3-5 : aucune 3ᵉ mention naturelle n'existe dans le texte narratif de cette page sans forcer une phrase artificielle — accepté comme exception documentée (voir Global Constraints).

- [ ] **Step 4: Commit**

```bash
git add b2c.html
git commit -m "feat: add contextual internal links on b2c.html"
```

---

## Task 6: Maillage interne — comment-ca-marche.html (4 liens)

**Files:**
- Modify: `comment-ca-marche.html`

- [ ] **Step 1: Liens vers b2b.html + b2c.html (ligne ~341, footer)**

```
OLD: Cabinet de courtage en énergie indépendant. Gaz et électricité pour professionnels et particuliers depuis 2012.
NEW: Cabinet de courtage en énergie indépendant. Gaz et électricité pour <a href="b2b.html" class="ilink">professionnels</a> et <a href="b2c.html" class="ilink">particuliers</a> depuis 2012.
```

- [ ] **Step 2: Lien vers resultats.html (ligne ~273)**

```
OLD: <p class="def-body">Chaque comparatif que nous produisons présente les offres <strong>telles qu'elles sont</strong>, sans mise en avant artificielle. Notre seul objectif est que vous obteniez le meilleur résultat possible pour votre situation.</p>
NEW: <p class="def-body">Chaque comparatif que nous produisons présente les offres <strong>telles qu'elles sont</strong>, sans mise en avant artificielle. Notre seul objectif est que vous obteniez <a href="resultats.html" class="ilink">le meilleur résultat possible</a> pour votre situation.</p>
```

- [ ] **Step 3: Lien vers barometre-energie.html (ligne ~255)**

```
OLD: <p class="step-b">Notre accompagnement ne s'arrête pas à la signature. Nous anticipons votre <strong>prochaine échéance de renouvellement</strong> et vous alertons 12 à 24 mois avant, pour ne jamais rater la meilleure fenêtre de négociation.</p>
NEW: <p class="step-b">Notre accompagnement ne s'arrête pas à la signature. Nous anticipons votre <strong>prochaine échéance de renouvellement</strong> et vous alertons 12 à 24 mois avant, pour ne jamais rater <a href="barometre-energie.html" class="ilink">la meilleure fenêtre de négociation</a>.</p>
```

- [ ] **Step 4: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' comment-ca-marche.html | sort | uniq -c`
Expected: 4 lignes (`b2b.html`, `b2c.html`, `resultats.html`, `barometre-energie.html`).

- [ ] **Step 5: Commit**

```bash
git add comment-ca-marche.html
git commit -m "feat: add contextual internal links on comment-ca-marche.html"
```

---

## Task 7: Maillage interne — resultats.html (4 liens)

**Files:**
- Modify: `resultats.html`

- [ ] **Step 1: Liens vers b2c.html + b2b.html (ligne ~232)**

```
OLD: <p class="psub2 reveal d2">Depuis 2012, M&S Strategy négocie des contrats gaz et électricité pour des milliers de foyers et d'entreprises. Voici ce que notre méthode produit concrètement.</p>
NEW: <p class="psub2 reveal d2">Depuis 2012, M&S Strategy négocie des contrats gaz et électricité pour des milliers de <a href="b2c.html" class="ilink">foyers</a> et d'<a href="b2b.html" class="ilink">entreprises</a>. Voici ce que notre méthode produit concrètement.</p>
```

- [ ] **Step 2: Lien vers barometre-energie.html (ligne ~265)**

```
OLD: <p>Nos résultats reposent sur un principe simple : plus le nombre de fournisseurs mis en concurrence est élevé, plus la marge de négociation obtenue est importante. C'est pourquoi nous consultons systématiquement l'ensemble des acteurs actifs sur le marché, plutôt qu'une poignée de partenaires commerciaux.</p>
NEW: <p>Nos résultats reposent sur un principe simple : plus le nombre de fournisseurs mis en concurrence est élevé, plus la marge de négociation obtenue est importante. C'est pourquoi nous consultons systématiquement <a href="barometre-energie.html" class="ilink">l'ensemble des acteurs actifs sur le marché</a>, plutôt qu'une poignée de partenaires commerciaux.</p>
```

- [ ] **Step 3: Lien vers comment-ca-marche.html (ligne ~266)**

```
OLD: <p>Pour nos clients professionnels, le timing joue également un rôle décisif : une négociation lancée 12 à 24 mois avant l'échéance du contrat obtient structurellement de meilleurs résultats qu'une négociation lancée dans l'urgence.</p>
NEW: <p>Pour nos clients professionnels, <a href="comment-ca-marche.html" class="ilink">le timing joue également un rôle décisif</a> : une négociation lancée 12 à 24 mois avant l'échéance du contrat obtient structurellement de meilleurs résultats qu'une négociation lancée dans l'urgence.</p>
```

- [ ] **Step 4: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' resultats.html | sort | uniq -c`
Expected: 4 lignes (`b2c.html`, `b2b.html`, `barometre-energie.html`, `comment-ca-marche.html`).

- [ ] **Step 5: Commit**

```bash
git add resultats.html
git commit -m "feat: add contextual internal links on resultats.html"
```

---

## Task 8: Maillage interne — barometre-energie.html (3 liens)

**Files:**
- Modify: `barometre-energie.html`

- [ ] **Step 1: Lien vers blog.html (ligne ~234)**

```
OLD: <p class="psub2 reveal d2">Le prix de gros de l'électricité (mise à jour mensuelle) et du gaz (mise à jour trimestrielle), suivis en continu à partir de sources publiques officielles, pour comprendre où en est le marché avant de renégocier votre contrat.</p>
NEW: <p class="psub2 reveal d2">Le prix de gros de l'électricité (mise à jour mensuelle) et du gaz (mise à jour trimestrielle), <a href="blog.html" class="ilink">suivis en continu</a> à partir de sources publiques officielles, pour comprendre où en est le marché avant de renégocier votre contrat.</p>
```

- [ ] **Step 2: Lien vers resultats.html (ligne ~276)**

```
OLD: <p>Parmi l'ensemble du marché consulté à chaque étude, voici les fournisseurs avec lesquels nous concluons le plus de contrats pour nos clients.</p>
NEW: <p>Parmi l'ensemble du marché consulté à <a href="resultats.html" class="ilink">chaque étude</a>, voici les fournisseurs avec lesquels nous concluons le plus de contrats pour nos clients.</p>
```

- [ ] **Step 3: Lien vers b2b.html (ligne ~410)**

```
OLD: <p class="qt">Un marché <em>suivi de près</em>, pour négocier au bon moment.</p>
NEW: <p class="qt">Un marché <em>suivi de près</em>, pour <a href="b2b.html" class="ilink">négocier au bon moment</a>.</p>
```

- [ ] **Step 4: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' barometre-energie.html | sort | uniq -c`
Expected: 3 lignes (`blog.html`, `resultats.html`, `b2b.html`).

- [ ] **Step 5: Commit**

```bash
git add barometre-energie.html
git commit -m "feat: add contextual internal links on barometre-energie.html"
```

---

## Task 9: Maillage interne — blog.html (3 liens, exception documentée)

**Files:**
- Modify: `blog.html`

- [ ] **Step 1: Lien vers b2b.html (ligne ~191)**

```
OLD: <p class="psub2 reveal d2">Nos analyses de fond sur le courtage en énergie, et nos outils pour évaluer ce que l'inaction vous coûte réellement.</p>
NEW: <p class="psub2 reveal d2">Nos analyses de fond sur le <a href="b2b.html" class="ilink">courtage en énergie</a>, et nos outils pour évaluer ce que l'inaction vous coûte réellement.</p>
```

- [ ] **Step 2: Lien vers barometre-energie.html (ligne ~272)**

```
OLD: <p class="qt">L'<em>énergie intelligente</em> ne s'achète jamais au prix affiché.</p>
NEW: <p class="qt">L'<em>énergie intelligente</em> ne s'achète jamais au <a href="barometre-energie.html" class="ilink">prix affiché</a>.</p>
```

- [ ] **Step 3: Lien vers b2c.html (ligne ~302, footer)**

```
OLD: <p>Cabinet de courtage en énergie indépendant. Gaz et électricité pour professionnels et particuliers depuis 2012. Basé à Lattes (34), intervention France entière.</p>
NEW: <p>Cabinet de courtage en énergie indépendant. Gaz et électricité pour professionnels et <a href="b2c.html" class="ilink">particuliers</a> depuis 2012. Basé à Lattes (34), intervention France entière.</p>
```

- [ ] **Step 4: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' blog.html | sort | uniq -c`
Expected: 3 lignes (`b2b.html`, `barometre-energie.html`, `b2c.html`). Limité à 3 (au lieu de 3-5) car les paragraphes `res-desc` des cartes articles sont imbriqués dans un `<a class="res-card">` englobant — impossible d'y ajouter un second `<a>` sans ancre imbriquée invalide en HTML (voir Global Constraints).

- [ ] **Step 5: Commit**

```bash
git add blog.html
git commit -m "feat: add contextual internal links on blog.html"
```

---

## Task 10: Maillage interne — ms-blog-article-1.html (3 liens)

**Files:**
- Modify: `ms-blog-article-1.html`

- [ ] **Step 1: Lien vers barometre-energie.html (ligne ~418)**

```
OLD: Le prix de l'électricité et du gaz pour les professionnels n'est pas fixe. Il varie en fonction des marchés de gros, des tensions géopolitiques, des capacités de production disponibles et des anticipations des traders.
NEW: Le prix de l'électricité et du gaz pour les professionnels n'est pas fixe. Il varie en fonction des <a href="barometre-energie.html" class="ilink">marchés de gros</a>, des tensions géopolitiques, des capacités de production disponibles et des anticipations des traders.
```

- [ ] **Step 2: Liens vers b2b.html + comment-ca-marche.html (ligne ~483)**

```
OLD: Un cabinet de courtage en énergie comme M&S Strategy intervient en amont du renouvellement de contrat pour structurer la négociation à votre place. Le processus est standardisé, rapide, et ne requiert qu'un seul document de votre part : votre dernière facture énergie.
NEW: Un <a href="b2b.html" class="ilink">cabinet de courtage en énergie</a> comme M&S Strategy intervient en amont du renouvellement de contrat pour structurer la négociation à votre place. Le <a href="comment-ca-marche.html" class="ilink">processus est standardisé, rapide</a>, et ne requiert qu'un seul document de votre part : votre dernière facture énergie.
```

- [ ] **Step 3: Lien vers resultats.html (ligne ~519)**

```
OLD: L'étude est gratuite. Elle ne vous engage à rien. Et dans la majorité des cas, elle révèle une opportunité que la reconduction automatique vous aurait fait manquer.
NEW: L'étude est gratuite. Elle ne vous engage à rien. Et dans la majorité des cas, elle <a href="resultats.html" class="ilink">révèle une opportunité</a> que la reconduction automatique vous aurait fait manquer.
```

Ne pas toucher au lien existant vers `ms-blog-article-2.html` (ligne ~543) — il reste tel quel.

- [ ] **Step 4: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html"[^>]* class="ilink">' ms-blog-article-1.html | sort | uniq -c`
Expected: 4 lignes (`barometre-energie.html`, `b2b.html`, `comment-ca-marche.html`, `resultats.html`).

- [ ] **Step 5: Commit**

```bash
git add ms-blog-article-1.html
git commit -m "feat: add contextual internal links on ms-blog-article-1.html"
```

---

## Task 11: Maillage interne — ms-blog-article-2.html (4 liens)

**Files:**
- Modify: `ms-blog-article-2.html`

- [ ] **Step 1: Lien vers barometre-energie.html (ligne ~293)**

```
OLD: <p>Le marché de gros de l'électricité et du gaz naturel fonctionne comme un marché financier : les prix fluctuent quotidiennement, sous l'effet des anticipations des traders, des capacités de production disponibles, des conditions météorologiques et des tensions géopolitiques.</p>
NEW: <p><a href="barometre-energie.html" class="ilink">Le marché de gros de l'électricité et du gaz naturel</a> fonctionne comme un marché financier : les prix fluctuent quotidiennement, sous l'effet des anticipations des traders, des capacités de production disponibles, des conditions météorologiques et des tensions géopolitiques.</p>
```

- [ ] **Step 2: Lien vers resultats.html (ligne ~339)**

```
OLD: Nous avons régulièrement obtenu pour des clients des <strong>baisses tarifaires de 8 à 15 % auprès de leur fournisseur actuel</strong> : uniquement en leur présentant des offres alternatives.
NEW: Nous avons régulièrement obtenu pour des clients des <strong><a href="resultats.html" class="ilink">baisses tarifaires de 8 à 15 %</a> auprès de leur fournisseur actuel</strong> : uniquement en leur présentant des offres alternatives.
```

- [ ] **Step 3: Lien vers b2b.html (ligne ~343)**

```
OLD: La valeur ajoutée d'un courtier en énergie industrielle ne réside pas seulement dans sa capacité à obtenir de meilleures offres : elle réside dans sa capacité à <strong>identifier le bon moment pour agir</strong>.
NEW: La valeur ajoutée d'un <a href="b2b.html" class="ilink">courtier en énergie industrielle</a> ne réside pas seulement dans sa capacité à obtenir de meilleures offres : elle réside dans sa capacité à <strong>identifier le bon moment pour agir</strong>.
```

- [ ] **Step 4: Lien vers comment-ca-marche.html (ligne ~385)**

```
OLD: La fenêtre optimale dépend de votre date d'échéance, des conditions actuelles du marché, et du volume de votre consommation. Il n'existe pas de règle universelle : c'est précisément le rôle d'un courtier que de vous positionner par rapport à ces variables. Une facture suffit pour avoir une première réponse sous 48h.
NEW: La fenêtre optimale dépend de votre date d'échéance, des conditions actuelles du marché, et du volume de votre consommation. Il n'existe pas de règle universelle : c'est précisément <a href="comment-ca-marche.html" class="ilink">le rôle d'un courtier</a> que de vous positionner par rapport à ces variables. Une facture suffit pour avoir une première réponse sous 48h.
```

Ne pas toucher au lien existant vers `ms-blog-article-1.html` (ligne ~395) — il reste tel quel.

- [ ] **Step 5: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html"[^>]* class="ilink">' ms-blog-article-2.html | sort | uniq -c`
Expected: 4 lignes (`barometre-energie.html`, `resultats.html`, `b2b.html`, `comment-ca-marche.html`).

- [ ] **Step 6: Commit**

```bash
git add ms-blog-article-2.html
git commit -m "feat: add contextual internal links on ms-blog-article-2.html"
```

---

## Task 12: Maillage interne — ms-blog-barometre-2022.html (3 liens)

**Files:**
- Modify: `ms-blog-barometre-2022.html`

- [ ] **Step 1: Lien vers ms-blog-barometre-2023.html (ligne ~390)**

```
OLD: un chiffre cohérent avec le bilan électrique RTE 2023, qui indique une moyenne annuelle 2022 de 276 €/MWh, soit, selon RTE, une division par trois par rapport à 2023 (97 €/MWh).
NEW: un chiffre cohérent avec le bilan électrique RTE 2023, qui indique une moyenne annuelle 2022 de 276 €/MWh, soit, selon RTE, une division par trois par rapport à <a href="ms-blog-barometre-2023.html" class="ilink">2023 (97 €/MWh)</a>.
```

- [ ] **Step 2: Liens vers b2b.html + resultats.html (ligne ~408)**

```
OLD: L'ARENH a donc limité, sans l'annuler, la répercussion de la crise sur les factures des professionnels : les entreprises françaises ont malgré tout vu leurs coûts énergétiques bondir en 2022, mais dans une proportion moindre que si elles avaient été intégralement exposées aux prix de gros du moment.
NEW: L'ARENH a donc limité, sans l'annuler, la répercussion de la crise sur <a href="b2b.html" class="ilink">les factures des professionnels</a> : les entreprises françaises ont malgré tout vu leurs <a href="resultats.html" class="ilink">coûts énergétiques</a> bondir en 2022, mais dans une proportion moindre que si elles avaient été intégralement exposées aux prix de gros du moment.
```

- [ ] **Step 3: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' ms-blog-barometre-2022.html | sort | uniq -c`
Expected: 3 lignes (`ms-blog-barometre-2023.html`, `b2b.html`, `resultats.html`).

- [ ] **Step 4: Commit**

```bash
git add ms-blog-barometre-2022.html
git commit -m "feat: add contextual internal links on ms-blog-barometre-2022.html"
```

---

## Task 13: Maillage interne — ms-blog-barometre-2023.html (3 liens)

**Files:**
- Modify: `ms-blog-barometre-2023.html`

- [ ] **Step 1: Lien vers ms-blog-barometre-2022.html (ligne ~402)**

```
OLD: Après le choc de 2022, 2023 aura été l'année de la décrue.
NEW: Après <a href="ms-blog-barometre-2022.html" class="ilink">le choc de 2022</a>, 2023 aura été l'année de la décrue.
```

- [ ] **Step 2a: Lien vers resultats.html (ligne ~408, première moitié de phrase)**

```
OLD: cette décrue s'est traduite par un allègement progressif, mais encore incomplet, de la pression sur les factures d'énergie
NEW: cette décrue s'est traduite par un <a href="resultats.html" class="ilink">allègement progressif</a>, mais encore incomplet, de la pression sur les factures d'énergie
```

- [ ] **Step 2b: Lien vers b2b.html (même ligne, seconde moitié de phrase)**

```
OLD: qu'un accompagnement dans la négociation des contrats énergie continue d'avoir tout son sens pour les professionnels.
NEW: qu'un <a href="b2b.html" class="ilink">accompagnement dans la négociation des contrats énergie</a> continue d'avoir tout son sens pour les professionnels.
```

- [ ] **Step 3: Vérifier**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' ms-blog-barometre-2023.html | sort | uniq -c`
Expected: 3 lignes (`ms-blog-barometre-2022.html`, `resultats.html`, `b2b.html`).

- [ ] **Step 4: Commit**

```bash
git add ms-blog-barometre-2023.html
git commit -m "feat: add contextual internal links on ms-blog-barometre-2023.html"
```

---

## Task 14: Maillage interne — ms-blog-barometre-2024.html et 2025.html (3 liens chacune)

**Files:**
- Modify: `ms-blog-barometre-2024.html`
- Modify: `ms-blog-barometre-2025.html`

- [ ] **Step 1: ms-blog-barometre-2024.html — liens vers 2022 + 2023 (ligne ~402)**

```
OLD: Après le choc de 2022 et la décrue de 2023, 2024 aura été l'année de la stabilisation.
NEW: Après <a href="ms-blog-barometre-2022.html" class="ilink">le choc de 2022</a> et <a href="ms-blog-barometre-2023.html" class="ilink">la décrue de 2023</a>, 2024 aura été l'année de la stabilisation.
```

- [ ] **Step 2: ms-blog-barometre-2024.html — lien vers b2b.html (ligne ~408)**

```
OLD: un accompagnement dans la négociation des contrats énergie conserve tout son intérêt pour les professionnels souhaitant optimiser leurs coûts.
NEW: un <a href="b2b.html" class="ilink">accompagnement dans la négociation des contrats énergie</a> conserve tout son intérêt pour les professionnels souhaitant optimiser leurs coûts.
```

- [ ] **Step 3: Vérifier ms-blog-barometre-2024.html**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' ms-blog-barometre-2024.html | sort | uniq -c`
Expected: 3 lignes (`ms-blog-barometre-2022.html`, `ms-blog-barometre-2023.html`, `b2b.html`).

- [ ] **Step 4: Commit ms-blog-barometre-2024.html**

```bash
git add ms-blog-barometre-2024.html
git commit -m "feat: add contextual internal links on ms-blog-barometre-2024.html"
```

- [ ] **Step 5: ms-blog-barometre-2025.html — liens vers 2022 + 2023 + 2024 (ligne ~402)**

```
OLD: Après le choc de 2022, la décrue de 2023 et la stabilisation de 2024, 2025 change de registre : ce n'est plus le niveau moyen des prix qui caractérise l'année, mais leur volatilité.
NEW: Après <a href="ms-blog-barometre-2022.html" class="ilink">le choc de 2022</a>, <a href="ms-blog-barometre-2023.html" class="ilink">la décrue de 2023</a> et <a href="ms-blog-barometre-2024.html" class="ilink">la stabilisation de 2024</a>, 2025 change de registre : ce n'est plus le niveau moyen des prix qui caractérise l'année, mais leur volatilité.
```

- [ ] **Step 6: ms-blog-barometre-2025.html — lien vers b2b.html (ligne ~408)**

```
OLD: un accompagnement dans la négociation des contrats énergie garde tout son sens pour lisser ces à-coups et sécuriser des conditions tarifaires adaptées au profil de consommation de l'entreprise.
NEW: un <a href="b2b.html" class="ilink">accompagnement dans la négociation des contrats énergie</a> garde tout son sens pour lisser ces à-coups et sécuriser des conditions tarifaires adaptées au profil de consommation de l'entreprise.
```

Cela porte à 4 le nombre de cibles distinctes liées sur cette page (2022, 2023, 2024, b2b.html) — conforme à la fourchette 3-5.

- [ ] **Step 7: Vérifier ms-blog-barometre-2025.html**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' ms-blog-barometre-2025.html | sort | uniq -c`
Expected: 4 lignes (`ms-blog-barometre-2022.html`, `ms-blog-barometre-2023.html`, `ms-blog-barometre-2024.html`, `b2b.html`).

- [ ] **Step 8: Commit ms-blog-barometre-2025.html**

```bash
git add ms-blog-barometre-2025.html
git commit -m "feat: add contextual internal links on ms-blog-barometre-2025.html"
```

---

## Task 15: Maillage interne — ms-blog-barometre-2026-t1/t2/t3.html

**Files:**
- Modify: `ms-blog-barometre-2026-t1.html`
- Modify: `ms-blog-barometre-2026-t2.html`
- Modify: `ms-blog-barometre-2026-t3.html`

- [ ] **Step 1: ms-blog-barometre-2026-t1.html — lien vers b2c.html (ligne ~396)**

```
OLD: Les seules données publiques disponibles au moment de la rédaction sont soit des « prix repères de vente » à destination des particuliers (un indicateur de détail, non pertinent pour la méthodologie de gros suivie par ce Baromètre)
NEW: Les seules données publiques disponibles au moment de la rédaction sont soit des « prix repères de vente » à destination des <a href="b2c.html" class="ilink">particuliers</a> (un indicateur de détail, non pertinent pour la méthodologie de gros suivie par ce Baromètre)
```

- [ ] **Step 2: ms-blog-barometre-2026-t1.html — lien vers ms-blog-barometre-2025.html (ligne ~404)**

```
OLD: Après quatre bilans annuels couvrant 2022, 2023, 2024 et 2025, nous passons à une cadence trimestrielle
NEW: Après quatre bilans annuels couvrant 2022, 2023, 2024 et <a href="ms-blog-barometre-2025.html" class="ilink">2025</a>, nous passons à une cadence trimestrielle
```

- [ ] **Step 3: ms-blog-barometre-2026-t1.html — lien vers b2b.html (ligne ~408)**

```
OLD: Pour les entreprises, ce changement de cadence a une conséquence pratique : les signaux de marché seront désormais visibles avec un décalage plus court, ce qui facilite l'ajustement du calendrier de négociation des contrats énergie à la réalité des prix du moment
NEW: Pour les entreprises, ce changement de cadence a une conséquence pratique : les signaux de marché seront désormais visibles avec un décalage plus court, ce qui facilite l'ajustement du <a href="b2b.html" class="ilink">calendrier de négociation des contrats énergie</a> à la réalité des prix du moment
```

- [ ] **Step 4: Vérifier ms-blog-barometre-2026-t1.html**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' ms-blog-barometre-2026-t1.html | sort | uniq -c`
Expected: 3 lignes (`b2c.html`, `ms-blog-barometre-2025.html`, `b2b.html`).

- [ ] **Step 5: Commit ms-blog-barometre-2026-t1.html**

```bash
git add ms-blog-barometre-2026-t1.html
git commit -m "feat: add contextual internal links on ms-blog-barometre-2026-t1.html"
```

- [ ] **Step 6: ms-blog-barometre-2026-t2.html — lien vers ms-blog-barometre-2026-t1.html (ligne ~390)**

```
OLD: Ce niveau marque un repli net par rapport au trimestre précédent : T1 2026 affichait 74,00 €/MWh, soit un écart de plus de 16 €/MWh d'un trimestre à l'autre
NEW: Ce niveau marque un repli net par rapport au trimestre précédent : <a href="ms-blog-barometre-2026-t1.html" class="ilink">T1 2026</a> affichait 74,00 €/MWh, soit un écart de plus de 16 €/MWh d'un trimestre à l'autre
```

- [ ] **Step 7: ms-blog-barometre-2026-t2.html — lien vers b2c.html (ligne ~396)**

```
OLD: d'un côté, le « prix repère de vente » publié par la CRE pour les particuliers (un indicateur de détail, construit par ailleurs sur des tranches de consommation
NEW: d'un côté, le « prix repère de vente » publié par la CRE pour les <a href="b2c.html" class="ilink">particuliers</a> (un indicateur de détail, construit par ailleurs sur des tranches de consommation
```

- [ ] **Step 8: ms-blog-barometre-2026-t2.html — lien vers b2b.html (ligne ~408)**

```
OLD: Le calendrier de négociation d'un contrat énergie gagne à intégrer ce type de signal de court terme plutôt que de s'appuyer sur une référence de prix ancienne ou trop lissée.
NEW: Le <a href="b2b.html" class="ilink">calendrier de négociation d'un contrat énergie</a> gagne à intégrer ce type de signal de court terme plutôt que de s'appuyer sur une référence de prix ancienne ou trop lissée.
```

- [ ] **Step 9: Vérifier ms-blog-barometre-2026-t2.html**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' ms-blog-barometre-2026-t2.html | sort | uniq -c`
Expected: 3 lignes (`ms-blog-barometre-2026-t1.html`, `b2c.html`, `b2b.html`).

- [ ] **Step 10: Commit ms-blog-barometre-2026-t2.html**

```bash
git add ms-blog-barometre-2026-t2.html
git commit -m "feat: add contextual internal links on ms-blog-barometre-2026-t2.html"
```

- [ ] **Step 11: ms-blog-barometre-2026-t3.html — liens vers t1 + t2 (ligne ~406)**

```
OLD: ce niveau intermédiaire est nettement supérieur aux moyennes complètes des deux trimestres précédents (74,00 €/MWh sur T1 2026, 57,34 €/MWh sur T2 2026), un écart notable
NEW: ce niveau intermédiaire est nettement supérieur aux moyennes complètes des deux trimestres précédents (74,00 €/MWh sur <a href="ms-blog-barometre-2026-t1.html" class="ilink">T1 2026</a>, 57,34 €/MWh sur <a href="ms-blog-barometre-2026-t2.html" class="ilink">T2 2026</a>), un écart notable
```

- [ ] **Step 12: ms-blog-barometre-2026-t3.html — lien vers ms-blog-barometre-2022.html (ligne ~420)**

```
OLD: Ce troisième numéro marque une transition dans le format du Baromètre : les bilans T1 et T2 2026, ainsi que les rétrospectives annuelles 2022-2025, ont été rédigés en rattrapage (« backfill ») sur des trimestres déjà clos.
NEW: Ce troisième numéro marque une transition dans le format du Baromètre : les bilans T1 et T2 2026, ainsi que les rétrospectives annuelles <a href="ms-blog-barometre-2022.html" class="ilink">2022</a>-2025, ont été rédigés en rattrapage (« backfill ») sur des trimestres déjà clos.
```

- [ ] **Step 13: Vérifier ms-blog-barometre-2026-t3.html**

Run: `grep -oE '<a href="[a-z0-9.-]+\.html" class="ilink">' ms-blog-barometre-2026-t3.html | sort | uniq -c`
Expected: 3 lignes (`ms-blog-barometre-2026-t1.html`, `ms-blog-barometre-2026-t2.html`, `ms-blog-barometre-2022.html`).

- [ ] **Step 14: Commit ms-blog-barometre-2026-t3.html**

```bash
git add ms-blog-barometre-2026-t3.html
git commit -m "feat: add contextual internal links on ms-blog-barometre-2026-t3.html"
```

---

## Task 16: Vérification finale

**Files:** aucun (validation uniquement)

- [ ] **Step 1: Suite de tests du projet**

Run: `npm test`
Expected: tous les tests passent (aucun test ne couvre le HTML statique, donc aucune régression attendue de ce côté, mais on confirme qu'aucune autre modification n'a cassé le build/CSP/analytics).

- [ ] **Step 2: Un seul H1 sur index.html, aucun changement sur les autres pages**

Run:
```bash
grep -c "<h1" index.html
for f in b2b.html b2c.html comment-ca-marche.html resultats.html blog.html barometre-energie.html ms-blog-article-1.html ms-blog-article-2.html ms-blog-barometre-2022.html ms-blog-barometre-2023.html ms-blog-barometre-2024.html ms-blog-barometre-2025.html ms-blog-barometre-2026-t1.html ms-blog-barometre-2026-t2.html ms-blog-barometre-2026-t3.html; do echo "$f: $(grep -c '<h1' "$f")"; done
```
Expected: `index.html` → `1`. Toutes les autres pages → `1` (inchangé, elles avaient déjà leur H1).

- [ ] **Step 3: Toutes les cibles de liens `.ilink` existent bien dans le repo**

Run:
```bash
grep -ohE 'class="ilink"' -B0 *.html > /dev/null
grep -ohE '<a href="[a-z0-9.-]+\.html" class="ilink">' *.html | grep -oE 'href="[a-z0-9.-]+\.html"' | sed -E 's/href="|"//g' | sort -u | while read f; do [ -f "$f" ] && echo "OK  $f" || echo "MISSING $f"; done
```
Expected: uniquement des lignes `OK` — aucune ligne `MISSING`.

- [ ] **Step 4: Comptage total de liens `.ilink` par page (résumé)**

Run: `for f in *.html; do c=$(grep -oc '"ilink"' "$f" 2>/dev/null); [ "$c" != "0" ] && echo "$f: $c"; done`
Expected: 13 pages listées, chacune avec un compte entre 2 et 5 (2 uniquement pour `b2c.html`).

- [ ] **Step 5: Contrôle visuel manuel**

Ouvrir dans un navigateur (thème clair et thème sombre) : `index.html`, `b2b.html`, `ms-blog-article-1.html`. Vérifier que les liens `.ilink` sont lisibles (teal-light, soulignés, viraient au vert au survol) et ne cassent pas la mise en page. Vérifier que le hero d'`index.html` est visuellement identique à avant (H1 invisible).

- [ ] **Step 6: Commit final si des ajustements ont eu lieu pendant la vérification**

```bash
git status
git add -A
git commit -m "chore: final verification pass for internal linking + H1 fix" --allow-empty
```
(Ne committer que s'il y a effectivement des changements ; sinon ignorer cette étape.)
