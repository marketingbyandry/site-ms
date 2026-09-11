# Leviers sociaux pour l'acquisition B2B — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser le socle technique et opérationnel du levier social B2B décrit dans `docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md` : attribution des leads social par plateforme, et premier cycle de contenu/pub prêt à être exécuté par le pipeline éditorial existant.

**Architecture:** Extension du système d'attribution `camp` déjà en production (`middleware.js`) avec 4 nouveaux codes, plus deux livrables de contenu (brief éditorial cycle 1, checklist ads) dans un nouveau dossier `content/social-b2b-launch/`, sur le modèle de `content/cold-outreach-waalaxy/` déjà existant.

**Tech Stack:** JavaScript (Vercel Edge Middleware), `node --test` pour les tests, Markdown pour les livrables de contenu.

## Global Constraints

- Codes de campagne social exacts, définis dans la spec : `soc-li`, `soc-fb`, `soc-ig`, `soc-x` (LinkedIn, Facebook, Instagram, X).
- Cible : acquisition de **nouveaux** prospects B2B — pas de réactivation de contacts déjà touchés par le cold outreach Waalaxy.
- 4 plateformes uniquement : LinkedIn, X, Facebook, Instagram. TikTok hors périmètre même si Buffer le couvre techniquement.
- Cadence de test définie dans la spec : LinkedIn 3×/semaine, X 2×/semaine, Facebook 3×/semaine, Instagram 2×/semaine.
- Répartition budget payant égale entre plateformes au lancement (pas de priorisation a priori) ; X Ads en option mineure seulement.
- Jalon de décision : 8 à 12 semaines de diffusion parallèle avant réallocation.
- `npm test` doit continuer à passer après tout changement de `middleware.js`.
- Aucun chiffre non sourcé ne doit être relayé tel quel dans le contenu social (risque déjà identifié en §8 de `docs/strategie-geo-seo/2026-07-22-strategie-geo-seo-ms-strategy.md`).

---

### Task 1: Codes de campagne social dans middleware.js

**Files:**
- Modify: `middleware.js:61-65` (constante `CAMPAIGNS`)
- Test: `test/middleware-attribution.test.mjs`

**Interfaces:**
- Consumes : `CAMPAIGNS` (array exporté par `middleware.js`), déjà consommé par `test/middleware-attribution.test.mjs` via `import middleware, { SLUGS, CAMPAIGNS } from '../middleware.js'`.
- Produces : 4 nouvelles valeurs dans `CAMPAIGNS` (`'soc-li'`, `'soc-fb'`, `'soc-ig'`, `'soc-x'`) que les Tasks 3 et 4 référencent dans leurs liens `?camp=`.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à la fin de `test/middleware-attribution.test.mjs` (après la ligne 165, dernier test existant) :

```js
test('les 4 codes de campagne social sont acceptes par le middleware', () => {
  const socialCodes = ['soc-li', 'soc-fb', 'soc-ig', 'soc-x'];
  for (const code of socialCodes) {
    assert.ok(
      CAMPAIGNS.includes(code),
      `${code} doit figurer dans CAMPAIGNS`
    );
    const response = call(`https://cabinetms.fr/b2b.html?camp=${code}`);
    assert.equal(campCookie(response), code);
  }
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `npm test`
Expected: FAIL — `AssertionError` sur `CAMPAIGNS.includes(code)` pour `soc-li` (les codes n'existent pas encore dans `CAMPAIGNS`).

- [ ] **Step 3: Ajouter les codes dans middleware.js**

Remplacer dans `middleware.js` (lignes 61-65) :

```js
export const CAMPAIGNS = [
  'chr-e1', 'chr-e2', 'chr-e3',
  'ind-e1', 'ind-e2', 'ind-e3',
  'tert-e1', 'tert-e2', 'tert-e3'
];
```

par :

```js
export const CAMPAIGNS = [
  'chr-e1', 'chr-e2', 'chr-e3',
  'ind-e1', 'ind-e2', 'ind-e3',
  'tert-e1', 'tert-e2', 'tert-e3',
  // Levier social B2B (docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md)
  'soc-li', 'soc-fb', 'soc-ig', 'soc-x'
];
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — tous les tests de `test/middleware-attribution.test.mjs` passent, y compris le nouveau. Les tests existants qui destructurent `const [CAMP, OTHER_CAMP] = CAMPAIGNS;` continuent de prendre les deux premiers éléments (`chr-e1`, `chr-e2`), donc aucune régression.

- [ ] **Step 5: Commit**

```bash
git add middleware.js test/middleware-attribution.test.mjs
git commit -m "Ajoute les codes camp social (soc-li/soc-fb/soc-ig/soc-x)"
```

---

### Task 2: Documenter les codes social dans attribution-commerciaux.md

**Files:**
- Modify: `docs/attribution-commerciaux.md` (section « Suivi de campagne (camp) »)

**Interfaces:**
- Consumes : les 4 codes ajoutés en Task 1.
- Produces : aucune (documentation terminale).

- [ ] **Step 1: Ajouter un paragraphe listant les codes social**

Dans `docs/attribution-commerciaux.md`, juste après le paragraphe qui commence par « Whitelist séparée (`CAMPAIGNS` dans `middleware.js`... » (ligne ~118-120), insérer :

```markdown

Depuis le levier social B2B
([spec](superpowers/specs/2026-09-07-leviers-social-b2b-design.md)),
`CAMPAIGNS` contient aussi 4 codes par plateforme — `soc-li` (LinkedIn),
`soc-fb` (Facebook), `soc-ig` (Instagram), `soc-x` (X) — posés par les liens
de post organiques et les annonces payantes de chaque plateforme. Même
mécanique dernier-touch que les codes `*-e<n>` du cold outreach.
```

- [ ] **Step 2: Vérifier le rendu**

Run: `git diff docs/attribution-commerciaux.md`
Expected: le nouveau paragraphe s'insère proprement entre les deux paragraphes existants, sans casser la liste à puces qui suit.

- [ ] **Step 3: Commit**

```bash
git add docs/attribution-commerciaux.md
git commit -m "Documente les codes camp social dans attribution-commerciaux.md"
```

---

### Task 3: Brief éditorial du premier cycle (2 semaines)

**Files:**
- Create: `content/social-b2b-launch/README.md`
- Create: `content/social-b2b-launch/brief-cycle-1.md`

**Interfaces:**
- Consumes : codes `camp` de la Task 1 (`soc-li`, `soc-fb`, `soc-ig`, `soc-x`) pour construire les liens CTA.
- Produces : le fichier `brief-cycle-1.md`, source d'entrée pour la personne/agent qui alimente le calendrier éditorial Notion du pipeline général (`Pipeline Éditorial M&S`).

- [ ] **Step 1: Créer le README du dossier**

Créer `content/social-b2b-launch/README.md` :

```markdown
# Levier social B2B — lancement

Contenu du premier cycle de test du levier social B2B décrit dans
[`docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md`](../../docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md).

- `brief-cycle-1.md` — briefs des 2 premières semaines de publication
  organique, un par plateforme et par créneau (à transférer dans le
  calendrier éditorial Notion du pipeline général avant production).
- `ads-checklist.md` — checklist de paramétrage des campagnes payantes
  LinkedIn Ads et Meta Ads.

## Gisements de contenu référencés

Chaque brief cite l'un de ces 4 gisements (cf. spec, §1) plutôt que
d'inventer un angle ad hoc :

1. Piliers/clusters SEO (`docs/strategie-geo-seo/`)
2. Baromètre trimestriel des prix de l'énergie
3. Fournisseurs partenaires / preuve sociale
   (`docs/superpowers/specs/2026-08-13-fournisseurs-partenaires-design.md`)
4. Coulisses / expertise dirigeant

## Attention chiffres

Toute statistique relayée (économies moyennes, évolution de prix) doit
être sourcée ou nuancée — risque déjà identifié en §8 de la stratégie
GEO/SEO. Ne jamais reprendre telle quelle une statistique non sourcée de
la home.
```

- [ ] **Step 2: Créer le brief du cycle 1**

Créer `content/social-b2b-launch/brief-cycle-1.md` :

```markdown
# Brief cycle 1 — 2 semaines

Format par ligne : gisement source, angle, format, lien CTA. La rédaction
complète (copywriting) se fait à l'entrée en production via le pipeline
éditorial général — ce brief fixe l'angle et la source, pas le texte
final.

## LinkedIn (`soc-li`) — 3×/semaine, 6 posts

| # | Gisement | Angle | Format | CTA |
|---|---|---|---|---|
| L1 | Pilier SEO « courtier vs comparateur » | Un courtier n'est pas un comparateur : la différence qui change le prix final d'un contrat pro | Post texte answer-first + tableau comparatif | `https://cabinetms.fr/b2b.html?camp=soc-li` |
| L2 | Baromètre trimestriel | Le prix de l'électricité pro a bougé ce trimestre — ce que ça change pour la prochaine négociation | Carrousel PDF (chiffres Baromètre sourcés) | `https://cabinetms.fr/b2b.html?camp=soc-li` |
| L3 | Fournisseurs partenaires / preuve sociale | Nous ne sommes pas rémunérés différemment selon le fournisseur retenu — pourquoi ça change tout pour le client | Post texte + logos fournisseurs | `https://cabinetms.fr/b2b.html?camp=soc-li` |
| L4 | Cluster SEO « courtier gratuit ou arnaque » | Un courtier en énergie gratuit, ça cache quoi ? La réponse honnête | Post texte answer-first | `https://cabinetms.fr/b2b.html?camp=soc-li` |
| L5 | Coulisses / expertise dirigeant | Ce qu'on répond quand un dirigeant dit « mon contrat est en cours, je ne peux rien faire » | Post texte + citation | `https://cabinetms.fr/b2b.html?camp=soc-li` |
| L6 | Cluster SEO « fenêtre 12-24 mois » | La fenêtre pour renégocier un contrat pro n'est pas celle qu'on croit | Carrousel PDF | `https://cabinetms.fr/b2b.html?camp=soc-li` |

## X (`soc-x`) — 2×/semaine, 4 threads

| # | Gisement | Angle | Format | CTA |
|---|---|---|---|---|
| X1 | Baromètre trimestriel | Le prix du MWh électrique pro vient de bouger — ce que la plupart des dirigeants ignorent sur leur contrat indexé | Thread 4-5 tweets | `https://cabinetms.fr/b2b.html?camp=soc-x` |
| X2 | Cluster SEO « lexique énergie » | ARENH, TURPE, CEE : le lexique énergie du dirigeant, en une phrase chacun | Thread définitions courtes | `https://cabinetms.fr/b2b.html?camp=soc-x` |
| X3 | Cluster SEO « courtier gratuit » | Comment un courtier en énergie peut être gratuit pour l'entreprise — le modèle expliqué en 5 tweets | Thread | `https://cabinetms.fr/b2b.html?camp=soc-x` |
| X4 | Baromètre trimestriel | Mise à jour Baromètre + angle prise de position sur la tendance du marché | Thread + visuel chiffre | `https://cabinetms.fr/b2b.html?camp=soc-x` |

## Facebook (`soc-fb`) — 3×/semaine, 6 posts

| # | Gisement | Angle | Format | CTA |
|---|---|---|---|---|
| F1 | Pilier SEO « guide complet courtier énergie pro » | Version accroche locale du guide courtier pro, ciblage dirigeants de TPE | Post texte + lien article | `https://cabinetms.fr/b2b.html?camp=soc-fb` |
| F2 | Fournisseurs partenaires / preuve sociale | Reformulation simple et rassurante pour petit commerçant | Post texte + visuel logos | `https://cabinetms.fr/b2b.html?camp=soc-fb` |
| F3 | Baromètre trimestriel | Visuel chiffre simple + légende ancrée local (bassin économique ciblé) | Image unique | `https://cabinetms.fr/b2b.html?camp=soc-fb` |
| F4 | Cluster SEO « renégocier contrat en cours » | Reformulation simple : oui, on peut renégocier même en plein contrat | Post texte | `https://cabinetms.fr/b2b.html?camp=soc-fb` |
| F5 | Coulisses / expertise dirigeant | Cas client anonymisé, secteur commerce | Post texte + citation | `https://cabinetms.fr/b2b.html?camp=soc-fb` |
| F6 | Cluster SEO « multi-sites » | Comment mutualiser les contrats d'énergie quand on a plusieurs boutiques | Post texte | `https://cabinetms.fr/b2b.html?camp=soc-fb` |

## Instagram (`soc-ig`) — 2×/semaine, 4 posts

| # | Gisement | Angle | Format | CTA |
|---|---|---|---|---|
| I1 | Baromètre trimestriel | Visuel-chiffre (carrousel 3 slides), chiffre sourcé et daté | Carrousel | `https://cabinetms.fr/b2b.html?camp=soc-ig` (lien en bio) |
| I2 | Coulisses / expertise dirigeant | Reel 30s : les 3 étapes du courtage, reprises du HowTo `comment-ca-marche.html` | Reel | `https://cabinetms.fr/b2b.html?camp=soc-ig` (lien en bio) |
| I3 | Fournisseurs partenaires / preuve sociale | Visuel « nombre de fournisseurs consultés à chaque étude » | Image unique | `https://cabinetms.fr/b2b.html?camp=soc-ig` (lien en bio) |
| I4 | Coulisses / expertise dirigeant | Reel témoignage/citation dirigeant satisfait (anonymisé si besoin) | Reel | `https://cabinetms.fr/b2b.html?camp=soc-ig` (lien en bio) |

## Rappel attribution

Chaque lien ci-dessus ne porte que `camp` (pas de `ref` commercial) : un
dépôt de facture Tally issu de ces liens retombera sur le repli `ag` côté
attribution commerciale (comportement déjà documenté dans
`docs/attribution-commerciaux.md`), tout en gardant sa traçabilité
plateforme via `camp`.
```

- [ ] **Step 3: Vérifier les liens**

Run: `grep -o 'https://cabinetms.fr/b2b.html?camp=soc-[a-z]*' content/social-b2b-launch/brief-cycle-1.md | sort -u`
Expected: exactement 4 lignes, une par code (`soc-fb`, `soc-ig`, `soc-li`, `soc-x`) — confirme qu'aucune ligne du brief ne pointe vers un code hors périmètre.

- [ ] **Step 4: Commit**

```bash
git add content/social-b2b-launch/README.md content/social-b2b-launch/brief-cycle-1.md
git commit -m "Ajoute le brief editorial du cycle 1 du levier social B2B"
```

---

### Task 4: Checklist de paramétrage des campagnes payantes

**Files:**
- Create: `content/social-b2b-launch/ads-checklist.md`

**Interfaces:**
- Consumes : codes `camp` de la Task 1 ; liste des bassins économiques déjà ciblés en SEO (`docs/strategie-geo-seo/2026-07-22-strategie-geo-seo-ms-strategy.md`, §2 pilier B — Montpellier, Paris, Lyon, Marseille, Toulouse, Bordeaux, Lille, Nantes).
- Produces : aucune (checklist opérationnelle terminale, exécutée manuellement dans LinkedIn Campaign Manager / Meta Ads Manager, hors dépôt de code).

- [ ] **Step 1: Créer la checklist**

Créer `content/social-b2b-launch/ads-checklist.md` :

```markdown
# Checklist campagnes payantes — cycle 1

Budget réparti à parts égales entre LinkedIn Ads et Meta Ads au
lancement (pas de priorisation a priori). X Ads optionnel, enveloppe
mineure seulement — X sert un rôle GEO/citation plus que conversion.

## LinkedIn Campaign Manager

- [ ] Objectif de campagne : génération de leads / trafic vers site.
- [ ] Ciblage :
  - Taille d'entreprise : TPE/PME/ETI (1 à 999 employés).
  - Secteurs : à sélectionner selon les 3 segments déjà travaillés en
    cold outreach (hôtellerie-restauration, industrie/production,
    tertiaire — écoles, associations, santé/EHPAD).
  - Intitulés de poste : dirigeant, gérant, DAF, office manager,
    responsable achats.
- [ ] Créatifs : posts L1 à L6 du brief cycle 1
  (`content/social-b2b-launch/brief-cycle-1.md`), en priorité L1
  (guide courtier) et L2 (Baromètre) pour les premiers tests.
- [ ] Lien de destination : `https://cabinetms.fr/b2b.html?camp=soc-li`
  (même code que l'organique LinkedIn — pas de distinction payant/
  organique dans l'attribution, cf. spec).
- [ ] Budget : moitié de l'enveloppe payante totale du cycle 1.

## Meta Ads Manager (Facebook + Instagram)

- [ ] Objectif de campagne : trafic vers site / génération de leads.
- [ ] Ciblage géographique : bassins économiques déjà ciblés en SEO
  local (`docs/strategie-geo-seo/`, pilier B) — Montpellier en
  priorité (proximité), puis Paris, Lyon, Marseille, Toulouse,
  Bordeaux, Lille, Nantes.
- [ ] Ciblage démographique : dirigeants/gérants de TPE, centres
  d'intérêt « petite entreprise », « gestion d'entreprise ».
- [ ] Audience lookalike : à activer une fois un volume suffisant de
  leads Tally atteint (non disponible au lancement du cycle 1).
- [ ] Créatifs : posts F1-F6 (Facebook) et I1-I4 (Instagram) du brief
  cycle 1.
- [ ] Lien de destination : `https://cabinetms.fr/b2b.html?camp=soc-fb`
  pour les créatifs Facebook, `https://cabinetms.fr/b2b.html?camp=soc-ig`
  pour les créatifs Instagram.
- [ ] Budget : moitié de l'enveloppe payante totale du cycle 1, répartie
  entre Facebook et Instagram selon le volume de créatifs disponibles
  (Facebook a 6 posts contre 4 pour Instagram sur ce cycle).

## X Ads (optionnel)

- [ ] Enveloppe mineure uniquement si budget restant après LinkedIn et
  Meta — X sert un rôle GEO/citation, pas de conversion directe.
- [ ] Lien de destination si activé : `https://cabinetms.fr/b2b.html?camp=soc-x`.

## Jalon de décision (8 à 12 semaines)

- [ ] Exporter le coût par lead par plateforme (LinkedIn Campaign
  Manager, Meta Ads Manager).
- [ ] Croiser avec le volume de leads Tally par code `camp`
  (`soc-li`, `soc-fb`, `soc-ig`, `soc-x`) sur la même période.
- [ ] Réallouer le budget et la cadence de publication vers la ou les
  plateformes qui convertissent réellement, pas vers celle qui engage
  le plus.
```

- [ ] **Step 2: Vérifier la cohérence des liens**

Run: `grep -o 'camp=soc-[a-z]*' content/social-b2b-launch/ads-checklist.md | sort -u`
Expected : `camp=soc-fb`, `camp=soc-ig`, `camp=soc-li`, `camp=soc-x` — les 4 codes de la Task 1, aucun code inventé.

- [ ] **Step 3: Commit**

```bash
git add content/social-b2b-launch/ads-checklist.md
git commit -m "Ajoute la checklist de parametrage des campagnes payantes sociales"
```

---

### Task 5: Mise à jour du suivi de projet

**Files:**
- Modify: `~/Documents/Obsidian Vault/Agents HQ/Projets/MS Strategy.md` (frontmatter)

**Interfaces:**
- Consumes : rien du code — clôture le changement d'étape ouvert par ce plan.
- Produces : rien — dernière étape du plan.

- [ ] **Step 1: Mettre à jour le frontmatter**

Dans le frontmatter de la note, mettre à jour :
- `stage:` → `Exécution` (tant que le cycle 1 n'est pas encore lancé/mesuré) ou `Livraison` si ce plan est exécuté en une fois jusqu'au commit final.
- `agent:` → `dev-builder` (Task 1-2) puis `content-builder` (Task 3-4) — indiquer le dernier agent ayant touché le projet.
- `status:` → ajouter une entrée décrivant ce qui a été livré : les 4 codes `camp` social, le brief cycle 1, la checklist ads, avec liens vers la spec et le plan.
- `updated:` → date du jour d'exécution.

- [ ] **Step 2: Commit du dépôt SITE MS (pas de commit Obsidian — vault non versionné avec ce dépôt)**

Vérifier qu'aucun fichier du dépôt `SITE MS` n'a été oublié :

```bash
git status --short
```

Expected: propre (rien en attente) — tous les fichiers des Tasks 1-4 ont déjà été commités individuellement.

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Self-Review

**Couverture de la spec** : §1 (moteur de contenu) → Task 3 (brief référence les 4 gisements) ; §2 (déclinaison plateforme/cadence) → Task 3 (cadence respectée par plateforme) ; §3 (payant) → Task 4 ; §4 (attribution/mesure) → Task 1 + Task 4 (jalon de décision) ; §5 (gouvernance) → Task 5. Aucune section de la spec sans tâche correspondante.

**Placeholders** : aucun « TBD »/« TODO » dans les livrables — les briefs contiennent des angles concrets, pas des cases vides ; les seules cases à cocher sont des checklists opérationnelles (Task 4), pas des trous de contenu.

**Cohérence des types/noms** : les 4 codes `soc-li`/`soc-fb`/`soc-ig`/`soc-x` sont identiques dans `middleware.js` (Task 1), `attribution-commerciaux.md` (Task 2), `brief-cycle-1.md` (Task 3) et `ads-checklist.md` (Task 4) — vérifié par les commandes `grep` de vérification à chaque tâche concernée.
