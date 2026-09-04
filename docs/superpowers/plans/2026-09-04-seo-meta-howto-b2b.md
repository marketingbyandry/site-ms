# SEO meta descriptions, HowTo, boost b2b Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réécrire les 14 meta descriptions indexées, ajouter un schema `HowTo` sur `comment-ca-marche.html`, et renforcer `b2b.html` (schema `Service` + densification du contenu sectoriel).

**Architecture:** Site 100% statique, chaque `.html` autonome, pas de build HTML. Tous les changements sont des éditions directes de texte/JSON-LD dans les fichiers `.html` existants — aucune nouvelle logique, aucun nouveau script.

**Tech Stack:** HTML statique, JSON-LD (schema.org), `node --test` pour la suite existante.

## Global Constraints

- Meta descriptions : 137-165 caractères, angle propre à chaque page (spec §1).
- `og:description` mise à jour en miroir uniquement sur les pages qui en ont déjà une (spec §1) : ne pas ajouter d'Open Graph aux pages qui n'en ont pas.
- HowTo : pas de `totalTime`/`estimatedCost`/`tool`/`supply` inventés (spec §2).
- Service (b2b) : `provider` référence `{"@id": "https://cabinetms.fr/#organization"}`, pas d'`AggregateRating` (spec §3).
- Densification b2b : enrichir les 3 paragraphes existants, ne pas ajouter de carte/section (spec §3).
- Hors périmètre : H1 index.html, maillage interne, `assets/analytics.js` (spec, section Hors périmètre).

---

### Task 1: Meta descriptions — pages segment (index, b2b, b2c, blog, comment-ça-marche)

**Files:**
- Modify: `index.html:21`, `index.html:397`
- Modify: `b2b.html:21`, `b2b.html:247`
- Modify: `b2c.html:21`, `b2c.html:216`
- Modify: `blog.html:21`
- Modify: `comment-ca-marche.html:21`

**Interfaces:** Aucune — édition de texte statique, pas de code partagé avec les autres tâches.

- [ ] **Step 1: Éditer `index.html`**

Remplacer (ligne 21) :
```html
<meta name="description" content="M&S Strategy, cabinet d'expertise en négociation d'énergie depuis 2012. Étude gratuite de vos contrats gaz et électricité, sans engagement, résultat sous 24h.">
```
par :
```html
<meta name="description" content="Cabinet de courtage en énergie indépendant depuis 2012. Mise en concurrence de tous les fournisseurs pour vos contrats gaz et électricité. Étude gratuite sous 24h.">
```

Remplacer (ligne 397, `og:description`) :
```html
<meta property="og:description" content="M&S Strategy, cabinet de courtage en énergie indépendant depuis 2012. Nous négocions vos contrats gaz et électricité auprès de tous les fournisseurs, professionnels (TPE, PME, ETI) et particuliers. Étude gratuite, sans engagement, résultat sous 24h.">
```
par :
```html
<meta property="og:description" content="Cabinet de courtage en énergie indépendant depuis 2012. Mise en concurrence de tous les fournisseurs pour vos contrats gaz et électricité. Étude gratuite sous 24h.">
```

- [ ] **Step 2: Éditer `b2b.html`**

Remplacer (ligne 21) :
```html
<meta name="description" content="M&S Strategy négocie vos contrats gaz et électricité professionnels auprès de tous les fournisseurs du marché. Étude gratuite, sans engagement, résultat sous 24h.">
```
par :
```html
<meta name="description" content="Courtier en énergie pour TPE, PME et ETI : mise en concurrence de tous les fournisseurs gaz et électricité, mono ou multi-site. Étude gratuite, résultat sous 24h.">
```

Remplacer (ligne 247, `og:description`, texte identique à la ligne 21 actuelle) par la même nouvelle valeur.

- [ ] **Step 3: Éditer `b2c.html`**

Remplacer (ligne 21) :
```html
<meta name="description" content="M&S Strategy négocie gratuitement vos contrats gaz et électricité auprès de tous les fournisseurs du marché. Étude gratuite, sans engagement, résultat sous 24h.">
```
par :
```html
<meta name="description" content="Courtier en énergie pour particuliers : nous négocions votre contrat gaz et électricité auprès de tous les fournisseurs du marché. Étude gratuite, résultat sous 24h.">
```

Remplacer (ligne 216, `og:description`, texte identique à la ligne 21 actuelle) par la même nouvelle valeur.

- [ ] **Step 4: Éditer `blog.html`**

Remplacer (ligne 21) :
```html
<meta name="description" content="Analyses, guides et outils M&S Strategy sur le courtage en énergie : quand renégocier, comment fonctionne le marché, et calculateur d'économies réalisables.">
```
par :
```html
<meta name="description" content="Analyses et actualités du marché de l'énergie : baromètre des prix, conseils de négociation et retours d'expérience du cabinet M&S Strategy.">
```

- [ ] **Step 5: Éditer `comment-ca-marche.html`**

Remplacer (ligne 21) :
```html
<meta name="description" content="Découvrez comment M&S Strategy négocie vos contrats gaz et électricité : analyse gratuite, appel d'offres auprès de tous les fournisseurs, comparatif clair, suivi dans la durée.">
```
par :
```html
<meta name="description" content="De l'envoi de votre facture à la signature du nouveau contrat : découvrez en 4 étapes comment M&S Strategy négocie votre énergie, gratuitement.">
```

- [ ] **Step 6: Vérifier les longueurs**

Run:
```bash
for f in index.html b2b.html b2c.html blog.html comment-ca-marche.html; do
  python3 -c "
import re,sys
t = open('$f', encoding='utf-8').read()
for m in re.finditer(r'name=\"description\" content=\"([^\"]*)\"', t):
    print(len(m.group(1)), '$f')
"
done
```
Expected: chaque longueur entre 137 et 165.

- [ ] **Step 7: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101` (aucun test dédié à ces fichiers, mais aucune régression).

- [ ] **Step 8: Commit**

```bash
git add index.html b2b.html b2c.html blog.html comment-ca-marche.html
git commit -m "SEO: reecrit les meta descriptions (index, b2b, b2c, blog, comment-ca-marche)"
```

---

### Task 2: Meta descriptions — pages outil et preuve (baromètre, calculateur, résultats, articles)

**Files:**
- Modify: `barometre-energie.html:21`
- Modify: `ms-strategy-calculateur.html:20`
- Modify: `resultats.html:21`
- Modify: `ms-blog-article-1.html:20`, `ms-blog-article-1.html:312`
- Modify: `ms-blog-article-2.html:20`, `ms-blog-article-2.html:197`

**Interfaces:** Aucune — indépendant de la Task 1.

- [ ] **Step 1: Éditer `barometre-energie.html`**

Remplacer (ligne 21) :
```html
<meta name="description" content="Suivez gratuitement l'évolution des prix de gros de l'électricité (ENTSO-E) et du gaz (index PEG Month-Ahead, via CRE) pour les entreprises, mis à jour chaque mois et chaque trimestre par M&S Strategy.">
```
par :
```html
<meta name="description" content="Suivez l'évolution des prix du gaz et de l'électricité sur le marché de gros, mise à jour régulière, pour anticiper le bon moment pour négocier.">
```

- [ ] **Step 2: Éditer `ms-strategy-calculateur.html`**

Remplacer (ligne 20) :
```html
<meta name="description" content="Calculez en temps réel ce que votre inaction sur votre contrat énergie vous coûte chaque mois, et ce que vous pourriez économiser.">
```
par :
```html
<meta name="description" content="Estimez en quelques clics les économies possibles sur votre contrat gaz ou électricité, avant une étude gratuite et personnalisée avec M&S Strategy.">
```

- [ ] **Step 3: Éditer `resultats.html`**

Remplacer (ligne 21) :
```html
<meta name="description" content="Les résultats obtenus par M&S Strategy pour ses clients : économies moyennes, volumes négociés, foyers et entreprises accompagnés depuis 2012.">
```
par :
```html
<meta name="description" content="Découvrez les économies réalisées par nos clients professionnels et particuliers grâce à notre négociation énergie : chiffres et cas concrets.">
```

- [ ] **Step 4: Éditer `ms-blog-article-1.html`**

Remplacer (ligne 20) :
```html
<meta name="description" content="Les sites industriels et logistiques font partie des plus gros consommateurs d'énergie en France. Voici pourquoi la majorité surpaye, et comment y remédier.">
```
par :
```html
<meta name="description" content="Puissance souscrite mal calibrée, clauses d'indexation défavorables : les raisons cachées qui font payer trop cher l'énergie de votre site industriel.">
```

Remplacer (ligne 312, `og:description`, texte identique à la ligne 20 actuelle) par la même nouvelle valeur.

- [ ] **Step 5: Éditer `ms-blog-article-2.html`**

Remplacer (ligne 20) :
```html
<meta name="description" content="Pour un site industriel ou logistique, la date de renégociation du contrat énergie est plus importante que le choix du fournisseur. Voici pourquoi, et comment anticiper.">
```
par :
```html
<meta name="description" content="Pourquoi renégocier votre contrat d'énergie 12 à 24 mois avant l'échéance change tout : la fenêtre de négociation optimale expliquée par M&S Strategy.">
```

Remplacer (ligne 197, `og:description`, texte identique à la ligne 20 actuelle) par la même nouvelle valeur.

- [ ] **Step 6: Vérifier les longueurs**

Run:
```bash
for f in barometre-energie.html ms-strategy-calculateur.html resultats.html ms-blog-article-1.html ms-blog-article-2.html; do
  python3 -c "
import re
t = open('$f', encoding='utf-8').read()
for m in re.finditer(r'name=\"description\" content=\"([^\"]*)\"', t):
    print(len(m.group(1)), '$f')
"
done
```
Expected: chaque longueur entre 137 et 165.

- [ ] **Step 7: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 8: Commit**

```bash
git add barometre-energie.html ms-strategy-calculateur.html resultats.html ms-blog-article-1.html ms-blog-article-2.html
git commit -m "SEO: reecrit les meta descriptions (barometre-energie, calculateur, resultats, articles)"
```

---

### Task 3: Meta descriptions — 6 éditions baromètre

**Files:**
- Modify: `ms-blog-barometre-2022.html:20`, `ms-blog-barometre-2022.html:312`
- Modify: `ms-blog-barometre-2023.html:20`, `ms-blog-barometre-2023.html:312`
- Modify: `ms-blog-barometre-2024.html:20`, `ms-blog-barometre-2024.html:312`
- Modify: `ms-blog-barometre-2025.html:20`, `ms-blog-barometre-2025.html:312`
- Modify: `ms-blog-barometre-2026-t1.html:20`, `ms-blog-barometre-2026-t1.html:312`
- Modify: `ms-blog-barometre-2026-t2.html:20`, `ms-blog-barometre-2026-t2.html:312`
- Modify: `ms-blog-barometre-2026-t3.html:20`, `ms-blog-barometre-2026-t3.html:322`

**Interfaces:** Aucune — indépendant des Tasks 1-2. Chaque description reprend le chiffre déjà présent dans la version actuelle (pas de nouveau chiffre inventé) — voir la valeur actuelle listée avant chaque remplacement.

- [ ] **Step 1: Éditer `ms-blog-barometre-2022.html`**

Remplacer (lignes 20 et 312, texte identique) :
```html
content="Rétrospective 2022 du Baromètre M&S Strategy des prix de l'énergie : électricité à 274,77 €/MWh, gaz à environ 98,1 €/MWh. Analyse de la crise énergétique déclenchée par l'invasion de l'Ukraine et du rôle de l'ARENH pour les entreprises françaises."
```
par :
```html
content="2022 : électricité à 274,77 €/MWh, gaz à ~98,1 €/MWh. Le choc énergétique déclenché par l'invasion de l'Ukraine et ses conséquences pour les entreprises."
```
(appliquer aux deux occurrences, `name="description"` ligne 20 et `og:description` ligne 312)

- [ ] **Step 2: Éditer `ms-blog-barometre-2023.html`**

Remplacer (lignes 20 et 312) :
```html
content="Rétrospective 2023 du Baromètre M&S Strategy des prix de l'énergie : électricité à 96,84 €/MWh, gaz à environ 40 €/MWh. Analyse de la normalisation progressive des marchés après le pic de la crise énergétique de 2022, pour les entreprises françaises."
```
par :
```html
content="2023 : électricité à 96,84 €/MWh, gaz à ~40 €/MWh. La décrue des prix après le choc de 2022, et ce qu'elle a changé pour les contrats professionnels."
```

- [ ] **Step 3: Éditer `ms-blog-barometre-2024.html`**

Remplacer (lignes 20 et 312) :
```html
content="Rétrospective 2024 du Baromètre M&S Strategy des prix de l'énergie : électricité à 58,62 €/MWh, gaz à environ 34 €/MWh. Analyse de la stabilisation des marchés de gros, encore au-dessus des niveaux d'avant-crise, pour les entreprises françaises."
```
par :
```html
content="2024 : électricité à 58,62 €/MWh, gaz à ~34 €/MWh. La stabilisation des prix de l'énergie, encore au-dessus des niveaux d'avant-crise, pour les entreprises."
```

- [ ] **Step 4: Éditer `ms-blog-barometre-2025.html`**

Remplacer (lignes 20 et 312) :
```html
content="Rétrospective 2025 du Baromètre M&S Strategy des prix de l'énergie : électricité à 62,26 €/MWh, gaz à environ 35 €/MWh. Analyse d'une année marquée par un pic hivernal puis une détente portée par le GNL, pour les entreprises françaises."
```
par :
```html
content="2025 : électricité à 62,26 €/MWh, gaz à ~35 €/MWh. Une année marquée par un pic hivernal puis une détente portée par le GNL, pour les entreprises françaises."
```

- [ ] **Step 5: Éditer `ms-blog-barometre-2026-t1.html`**

Remplacer (lignes 20 et 312) :
```html
content="Premier Baromètre trimestriel M&S Strategy des prix de l'énergie : électricité à 74,00 €/MWh sur T1 2026, en nette hausse par rapport à la moyenne 2025. Le prix du gaz sera ajouté dès qu'une source fiable sera disponible."
```
par :
```html
content="T1 2026 : électricité à 74,00 €/MWh, en nette hausse vs. la moyenne 2025. Premier bilan trimestriel des prix de l'énergie et son impact sur vos contrats."
```

- [ ] **Step 6: Éditer `ms-blog-barometre-2026-t2.html`**

Remplacer (lignes 20 et 312) :
```html
content="Deuxième Baromètre trimestriel M&S Strategy des prix de l'énergie : électricité à 57,34 €/MWh sur T2 2026, en net repli par rapport au T1. Le prix du gaz reste en attente d'une source fiable."
```
par :
```html
content="T2 2026 : électricité à 57,34 €/MWh, net repli après la hausse du T1. Deuxième bilan trimestriel des prix de l'énergie pour les entreprises françaises."
```

- [ ] **Step 7: Éditer `ms-blog-barometre-2026-t3.html`**

Remplacer (lignes 20 et 322) :
```html
content="Troisième Baromètre trimestriel M&S Strategy des prix de l'énergie, bilan intermédiaire : électricité à 101,37 €/MWh (1er-27 juillet), gaz PEG à 63,90 €/MWh en clôture du 24 juillet. Trimestre encore en cours."
```
par :
```html
content="T3 2026 (partiel) : électricité à 101,37 €/MWh, gaz PEG à 63,90 €/MWh, forte hausse. Bilan trimestriel des prix de l'énergie par M&S Strategy."
```

- [ ] **Step 8: Vérifier les longueurs**

Run:
```bash
for f in ms-blog-barometre-2022.html ms-blog-barometre-2023.html ms-blog-barometre-2024.html ms-blog-barometre-2025.html ms-blog-barometre-2026-t1.html ms-blog-barometre-2026-t2.html ms-blog-barometre-2026-t3.html; do
  python3 -c "
import re
t = open('$f', encoding='utf-8').read()
for m in re.finditer(r'name=\"description\" content=\"([^\"]*)\"', t):
    print(len(m.group(1)), '$f')
"
done
```
Expected: chaque longueur entre 137 et 165.

- [ ] **Step 9: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 10: Commit**

```bash
git add ms-blog-barometre-2022.html ms-blog-barometre-2023.html ms-blog-barometre-2024.html ms-blog-barometre-2025.html ms-blog-barometre-2026-t1.html ms-blog-barometre-2026-t2.html ms-blog-barometre-2026-t3.html
git commit -m "SEO: reecrit les meta descriptions des 6 editions barometre"
```

---

### Task 4: Schema HowTo sur comment-ca-marche.html

**Files:**
- Modify: `comment-ca-marche.html:170-179` (bloc JSON-LD existant, insertion juste après)

**Interfaces:** Aucune dépendance sur les tasks précédentes.

- [ ] **Step 1: Insérer le bloc HowTo**

Le fichier a aujourd'hui (lignes 170-179) :
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://cabinetms.fr/"},
    {"@type": "ListItem", "position": 2, "name": "Comment ça marche", "item": "https://cabinetms.fr/comment-ca-marche.html"}
  ]
}
</script>
</head>
```

Remplacer par :
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://cabinetms.fr/"},
    {"@type": "ListItem", "position": 2, "name": "Comment ça marche", "item": "https://cabinetms.fr/comment-ca-marche.html"}
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Comment fonctionne le courtage en énergie M&S Strategy",
  "step": [
    {"@type": "HowToStep", "position": 1, "name": "Vous nous envoyez votre facture", "text": "Un simple envoi par email ou via notre formulaire en ligne suffit. Nous analysons votre consommation réelle, la structure de votre contrat actuel et sa date d'échéance. Cette étape est gratuite et sans engagement."},
    {"@type": "HowToStep", "position": 2, "name": "Nous lançons l'appel d'offres", "text": "Nous consultons simultanément l'ensemble des fournisseurs actifs sur votre segment (historiques et alternatifs) au lieu de comparer seulement 3 ou 4 acteurs comme le font la plupart des comparateurs en ligne."},
    {"@type": "HowToStep", "position": 3, "name": "Vous recevez un comparatif clair", "text": "Un tableau simple et chiffré : prix, conditions contractuelles, clauses d'indexation. Aucune pression commerciale : vous gardez la décision finale et pouvez toujours choisir de ne pas changer de fournisseur."},
    {"@type": "HowToStep", "position": 4, "name": "Nous finalisons le changement", "text": "Si vous validez une offre, nous nous occupons des démarches administratives auprès du nouveau fournisseur. Aucune coupure de service. Le changement se fait de façon transparente pour vous."},
    {"@type": "HowToStep", "position": 5, "name": "Nous suivons votre dossier dans la durée", "text": "Notre accompagnement ne s'arrête pas à la signature. Nous anticipons votre prochaine échéance de renouvellement et vous alertons 12 à 24 mois avant, pour ne jamais rater la meilleure fenêtre de négociation."}
  ]
}
</script>
</head>
```

- [ ] **Step 2: Vérifier que le JSON est valide**

Run:
```bash
python3 -c "
import re, json
t = open('comment-ca-marche.html', encoding='utf-8').read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', t, re.S)
howto = [json.loads(b) for b in blocks if '\"HowTo\"' in b]
assert len(howto) == 1
assert len(howto[0]['step']) == 5
print('OK', howto[0]['step'][0]['name'])
"
```
Expected: `OK Vous nous envoyez votre facture` sans erreur `json.JSONDecodeError`.

- [ ] **Step 3: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 4: Commit**

```bash
git add comment-ca-marche.html
git commit -m "SEO: ajoute le schema HowTo sur comment-ca-marche.html"
```

---

### Task 5: Schema Service sur b2b.html

**Files:**
- Modify: `b2b.html:296-303` (bloc BreadcrumbList existant, insertion juste après)

**Interfaces:** Consomme l'`@id` `"https://cabinetms.fr/#organization"` déjà déclaré sur `index.html` (`ProfessionalService`, ligne 405) — ne redéclare pas l'organisation, y fait seulement référence.

- [ ] **Step 1: Insérer le bloc Service**

Le fichier a aujourd'hui (lignes 293-303) :
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://cabinetms.fr/"},
    {"@type": "ListItem", "position": 2, "name": "Professionnels (B2B)", "item": "https://cabinetms.fr/b2b.html"}
  ]
}
</script>
</head>
```

Remplacer par :
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://cabinetms.fr/"},
    {"@type": "ListItem", "position": 2, "name": "Professionnels (B2B)", "item": "https://cabinetms.fr/b2b.html"}
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Courtage en énergie pour professionnels",
  "provider": {"@id": "https://cabinetms.fr/#organization"},
  "areaServed": "FR",
  "audience": {"@type": "BusinessAudience", "audienceType": "TPE, PME, ETI"},
  "description": "Négociation de contrats gaz et électricité pour entreprises, mise en concurrence de l'ensemble des fournisseurs du marché."
}
</script>
</head>
```

- [ ] **Step 2: Vérifier que le JSON est valide**

Run:
```bash
python3 -c "
import re, json
t = open('b2b.html', encoding='utf-8').read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', t, re.S)
svc = [json.loads(b) for b in blocks if '\"Service\"' in b]
assert len(svc) == 1
assert svc[0]['provider']['@id'] == 'https://cabinetms.fr/#organization'
print('OK', svc[0]['serviceType'])
"
```
Expected: `OK Courtage en énergie pour professionnels` sans erreur.

- [ ] **Step 3: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 4: Commit**

```bash
git add b2b.html
git commit -m "SEO: ajoute le schema Service sur b2b.html"
```

---

### Task 6: Densification du contenu sectoriel — b2b.html

**Files:**
- Modify: `b2b.html` (bloc `Secteurs accompagnés`, 3 paragraphes `.vb`)

**Interfaces:** Aucune dépendance sur les tasks précédentes. Ne touche pas au schema Service (Task 5) ni aux meta descriptions (Tasks 1-3) — peut être fait dans n'importe quel ordre par rapport à elles.

- [ ] **Step 1: Éditer le paragraphe "Industrie & production"**

Remplacer :
```html
<p class="vb">Sites à forte consommation, puissance souscrite élevée, besoins de continuité : nous négocions des conditions adaptées à vos contraintes de production.</p>
```
par :
```html
<p class="vb">Sites à forte consommation, puissance souscrite élevée, besoins de continuité : agroalimentaire, métallurgie, plasturgie, logistique. Nous négocions des conditions adaptées à vos contraintes de production.</p>
```

- [ ] **Step 2: Éditer le paragraphe "Commerce & multi-sites"**

Remplacer :
```html
<p class="vb">Réseaux de boutiques, franchises, agences réparties sur le territoire. Nous consolidons vos volumes pour un pouvoir de négociation renforcé.</p>
```
par :
```html
<p class="vb">Réseaux de boutiques, franchises, agences ou cabinets médicaux répartis sur le territoire. Nous consolidons vos volumes pour un pouvoir de négociation renforcé.</p>
```

- [ ] **Step 3: Éditer le paragraphe "Tertiaire & collectivités"**

Remplacer :
```html
<p class="vb">Bureaux, copropriétés professionnelles, structures publiques et parapubliques bénéficient d'un accompagnement rigoureux, adapté aux procédures propres à chaque structure.</p>
```
par :
```html
<p class="vb">Bureaux, copropriétés professionnelles, mairies, écoles et structures publiques ou parapubliques bénéficient d'un accompagnement rigoureux, adapté aux procédures propres à chaque structure.</p>
```

- [ ] **Step 4: Vérifier visuellement**

Ouvrir `b2b.html` dans un navigateur local, section "Secteurs accompagnés" — les 3 cartes doivent rester sur une seule ligne de texte par carte comme avant (pas de débordement visuel dû à l'ajout de mots).

- [ ] **Step 5: Vérifier que la suite existante passe toujours**

Run: `npm test`
Expected: `101/101`.

- [ ] **Step 6: Commit**

```bash
git add b2b.html
git commit -m "SEO: densifie le contenu sectoriel de b2b.html avec des exemples concrets"
```

---

## Self-Review

**Spec coverage** :
- §1 meta descriptions (14 pages + og:description en miroir) → Tasks 1-3. ✓
- §2 HowTo → Task 4 (corrigé à 5 étapes après vérification du fichier réel). ✓
- §3 Service + densification b2b → Tasks 5-6. ✓
- Hors périmètre (H1, maillage interne, analytics.js) → non touché par ce plan. ✓

**Placeholder scan** : aucun "TBD"/"TODO" — chaque step a le texte exact à écrire.

**Type consistency** : n/a (pas de fonctions/signatures partagées entre tasks — éditions de texte indépendantes).
