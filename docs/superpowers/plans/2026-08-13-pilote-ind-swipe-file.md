# Pilote IND — élargissement scope campagne cold outreach — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Étendre la séquence email du segment IND de 3 à 4 emails (nouvel email
« histoire → leçon »), tester un CTA-mot-clé sur deux emails, et décliner les
mêmes deux angles en 2 posts LinkedIn — conformément à la spec
`docs/superpowers/specs/2026-08-13-pilote-ind-swipe-file-design.md`.

**Architecture:** Contenu statique (MJML → HTML) dans
`content/cold-outreach-waalaxy/`, pas de code applicatif. Chaque tâche
modifie ou crée un fichier texte, vérifié par compilation MJML et par des
greps de conformité (anti-slop, vouvoiement) plutôt que par des tests
unitaires.

**Tech Stack:** MJML (CLI `npx mjml`), Markdown, Git.

## Global Constraints

- Vouvoiement systématique dans toute copie produite (email et LinkedIn).
- Aucune des tournures interdites listées dans la spec (section « Contrainte
  transversale : pas d'IA slop ») : ouvertures génériques, triades creuses,
  superlatifs vides, construction « Ce n'est pas X, c'est Y » en série,
  questions rhétoriques comme transition, clôture inspirationnelle abstraite,
  rythme haché systématique, emoji hors format « Script vidéo ».
- Chaque affirmation forte s'appuie sur un chiffre ou un mécanisme réel et
  vérifiable (comme `74 → 104 €/MWh`, seule formulation validée du Baromètre
  — pas de reformulation avec d'autres décimales).
- Pas de cas client nommé ni attribué — récit sectoriel générique uniquement.
- Tracking : `ref=ag&camp=ind-e<n>` pour les emails, `utm_source=linkedin_organic&utm_campaign=pilote-ind&utm_content=post-<n>` pour LinkedIn — jamais l'inverse.
- Travail effectué dans le worktree
  `/Users/antoinegaussin/SITE MS/.claude/worktrees/cold-outreach-ind-pilote`
  (branche `worktree-cold-outreach-ind-pilote`). Ne pas toucher au checkout
  principal `/Users/antoinegaussin/SITE MS`.

---

### Task 1: Importer la campagne IND existante dans ce worktree

Ce worktree a été créé depuis `origin/main`, qui ne contient pas encore les 9
templates de la campagne (travail non commité de la session précédente, situé
uniquement dans le checkout principal). Cette tâche copie ce travail existant
sans y toucher à la source.

**Files:**
- Create (copie) : `content/cold-outreach-waalaxy/` (répertoire entier :
  `README.md`, `mjml/*.mjml` × 9, `html/*.html` × 9)

**Interfaces:**
- Produit : le répertoire `content/cold-outreach-waalaxy/` tel qu'il existe
  dans le checkout principal, disponible pour les tâches suivantes.

- [ ] **Step 1: Copier le répertoire depuis le checkout principal**

```bash
cd "/Users/antoinegaussin/SITE MS/.claude/worktrees/cold-outreach-ind-pilote"
cp -R "/Users/antoinegaussin/SITE MS/content/cold-outreach-waalaxy" content/
```

- [ ] **Step 2: Vérifier que les 9 templates + README sont présents**

```bash
find content/cold-outreach-waalaxy -type f | sort
```

Expected: 1 `README.md`, 9 fichiers dans `mjml/` (`chr-e1..e3`, `ind-e1..e3`,
`tert-e1..e3`), 9 fichiers dans `html/` — 19 fichiers au total.

- [ ] **Step 3: Vérifier que les templates compilent (baseline saine avant modification)**

```bash
npx --yes mjml content/cold-outreach-waalaxy/mjml/ind-e1.mjml -o /tmp/check-ind-e1.html && echo "OK: ind-e1 compiles"
```

Expected: `OK: ind-e1 compiles`, aucune erreur MJML.

- [ ] **Step 4: Commit**

```bash
git add content/cold-outreach-waalaxy
git commit -m "chore: import baseline campagne IND (3 segments × 3 emails)"
```

---

### Task 2: Renommer l'email final `ind-e3` → `ind-e4`

L'insertion du nouvel email « histoire → leçon » en position E3 décale
l'ancien email de clôture (« Dernier mot avant de refermer le dossier ») en
position E4. Son contenu ne change pas, seul son nom de fichier et son
paramètre de tracking changent.

**Files:**
- Modify (renommage) : `content/cold-outreach-waalaxy/mjml/ind-e3.mjml` →
  `content/cold-outreach-waalaxy/mjml/ind-e4.mjml`
- Modify : `content/cold-outreach-waalaxy/mjml/ind-e4.mjml:59` (paramètre
  `camp`)

**Interfaces:**
- Consomme : le fichier produit à la Task 1.
- Produit : `content/cold-outreach-waalaxy/mjml/ind-e4.mjml`, référencé par
  la Task 5 (README) et la Task 7 (build final).

- [ ] **Step 1: Renommer le fichier avec git mv**

```bash
git mv content/cold-outreach-waalaxy/mjml/ind-e3.mjml content/cold-outreach-waalaxy/mjml/ind-e4.mjml
git mv content/cold-outreach-waalaxy/html/ind-e3.html content/cold-outreach-waalaxy/html/ind-e4.html
```

- [ ] **Step 2: Mettre à jour le paramètre de tracking**

Remplacer, à la ligne 59 de `content/cold-outreach-waalaxy/mjml/ind-e4.mjml` :

```
        <mj-button href="https://www.byandry.com/b2b.html?ref=ag&camp=ind-e3" background-color="#4cde80" color="#07131a"
```

par :

```
        <mj-button href="https://www.byandry.com/b2b.html?ref=ag&camp=ind-e4" background-color="#4cde80" color="#07131a"
```

- [ ] **Step 3: Vérifier qu'il ne reste aucune référence à `ind-e3` dans le fichier renommé**

```bash
grep -n "ind-e3\|Je referme le dossier" content/cold-outreach-waalaxy/mjml/ind-e4.mjml
```

Expected: aucune sortie (le `mj-title` "Je referme le dossier de mon côté"
reste inchangé — c'est le contenu de l'email, seule la sortie du grep sur
`ind-e3` doit être vide).

```bash
grep -c "camp=ind-e4" content/cold-outreach-waalaxy/mjml/ind-e4.mjml
```

Expected: `1`

- [ ] **Step 4: Recompiler et vérifier**

```bash
npx --yes mjml content/cold-outreach-waalaxy/mjml/ind-e4.mjml -o content/cold-outreach-waalaxy/html/ind-e4.html
grep -c "camp=ind-e4" content/cold-outreach-waalaxy/html/ind-e4.html
```

Expected: `1` (le lien tracké apparaît bien dans le HTML compilé).

- [ ] **Step 5: Commit**

```bash
git add content/cold-outreach-waalaxy
git commit -m "refactor: renomme ind-e3 en ind-e4 (dernier message), camp=ind-e4"
```

---

### Task 3: Créer le nouvel `ind-e3.mjml` — histoire → leçon

**Files:**
- Create: `content/cold-outreach-waalaxy/mjml/ind-e3.mjml`
- Create: `content/cold-outreach-waalaxy/html/ind-e3.html` (généré)

**Interfaces:**
- Consomme : la section bannière (`mj-image` avec `src="data:image/jpeg..."`)
  de `content/cold-outreach-waalaxy/mjml/ind-e1.mjml`, lignes 26-27 (entre les
  commentaires `<!-- Banner -->` et `</mj-column>`).
- Produit : `content/cold-outreach-waalaxy/mjml/ind-e3.mjml`, référencé par
  la Task 5 (README) et la Task 7 (build final).

- [ ] **Step 1: Extraire la section bannière de `ind-e1.mjml` (même image que le reste de la séquence IND, cf. README — `Fogcity_green.webp`)**

```bash
sed -n '26,27p' content/cold-outreach-waalaxy/mjml/ind-e1.mjml > /tmp/ind-banner.txt
wc -l /tmp/ind-banner.txt
```

Expected: `1 /tmp/ind-banner.txt` (une seule ligne — le `mj-image` en base64).

- [ ] **Step 2: Créer le fichier avec le contenu complet**

Créer `content/cold-outreach-waalaxy/mjml/ind-e3.mjml` avec ce contenu, en
insérant la ligne de `/tmp/ind-banner.txt` à l'endroit marqué
`{{BANNER_LINE}}` :

```
<mjml>
  <mj-head>
    <mj-title>Le renouvellement qui change la donne</mj-title>
    <mj-preview>Une clause d'indexation ne se découvre pas au moment de la signature — elle se lit avant.</mj-preview>
    <mj-attributes>
      <mj-all font-family="Helvetica Neue, Helvetica, Arial, sans-serif" />
      <mj-text font-size="15px" color="#f5f0e8" line-height="1.65" />
    </mj-attributes>
    <mj-style>
      a.plain-link { color: #5ecfdc; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#0c2028" width="600px">

    <!-- Header: logo only, ~64px — matches "logo-only" header sizing -->
    <mj-section background-color="#07131a" padding="22px 24px 18px 24px">
      <mj-column>
        <mj-image src="https://www.byandry.com/assets/ms-strategy-logo.png" alt="M&amp;S Strategy" width="108px" align="left" padding="0" />
      </mj-column>
    </mj-section>

    <!-- Banner: real <img> (not CSS background) so it has genuine alt text
         for screen readers and degrades safely in clients that block
         background-images -->
    <mj-section background-color="#07131a" padding="0">
      <mj-column>
{{BANNER_LINE}}
      </mj-column>
    </mj-section>

    <!-- BLUF headline: the offer in one line, readable even on a 2-second
         skim before any body copy -->
    <mj-section background-color="#07131a" padding="26px 24px 4px 24px">
      <mj-column>
        <mj-text font-size="21px" font-weight="700" line-height="1.3" color="#f5f0e8" padding-bottom="4px">
          Beaucoup découvrent leur exposition au marché au moment du renouvellement.
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Body: sequence of distinct sections (hook / proof / explanation)
         separated by hairline dividers, so the eye follows a defined path
         instead of one running block of text -->
    <mj-section background-color="#07131a" padding="10px 24px 0 24px">
      <mj-column>
        <mj-text color="#f5f0e8" padding-bottom="14px">Bonjour {{prénom}},</mj-text>
        <mj-text color="#f5f0e8" padding-bottom="14px">Une PME industrielle sous contrat fixe depuis plusieurs années arrive à échéance de renouvellement cet été. Le nouveau contrat proposé est indexé sur le prix de marché — une clause présente dès la signature initiale, mais jamais présentée comme un risque à l'époque.</mj-text>
        <mj-divider border-color="#173842" border-width="1px" padding="16px 0 16px 0" />
        <mj-text padding="4px 0 18px 0">
          <div style="border-left:3px solid #4cde80; padding-left:16px;">
            <span style="display:block; font-size:34px; font-weight:800; color:#4cde80; line-height:1.15;">74 → 104 €/MWh</span>
            <span style="display:block; font-size:12px; letter-spacing:.05em; text-transform:uppercase; color:#8aacb4; margin-top:6px;">prix de gros moyen électricité, juin → juillet 2026 (ENTSO-E)</span>
          </div>
        </mj-text>
        <mj-text color="#f5f0e8" padding-bottom="14px">Ce mouvement se retrouve directement sur la facture de tout contrat indexé — <strong style="color:#4cde80">sans qu'aucune ligne ne l'annonce à l'avance</strong>.</mj-text>
        <mj-divider border-color="#173842" border-width="1px" padding="16px 0 16px 0" />
        <mj-text color="#f5f0e8" padding-bottom="14px">La bonne nouvelle : cette clause se lit et se négocie avant la signature, pas après. Si votre contrat industrie arrive à échéance dans les prochains mois, c'est le moment de la relire.</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#07131a" padding="8px 24px 26px 24px">
      <mj-column>
        <mj-text padding="4px 0 18px 0">
          <div style="border-left:3px solid #5ecfdc; padding-left:16px; font-size:17px; font-weight:600; line-height:1.45; color:#f5f0e8;">Répondez à cet email avec le mot <strong style="color:#5ecfdc">AUDIT</strong>, je vous transmets le lien directement.</div>
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#07131a" padding="0 24px 30px 24px">
      <mj-column>
        <mj-divider border-color="#173842" border-width="1px" padding="0 0 18px 0" />
        <mj-text font-size="13px" color="#f5f0e8" line-height="1.5">
          Antoine Gaussin<br/>
          <span style="color:#8aacb4">M&amp;S Strategy — Cabinet d'expertise énergie</span>
        </mj-text>
        <mj-text font-size="11px" color="#8aacb4" padding-top="16px" line-height="1.5">
          M&amp;S Strategy — SIREN 752 139 477 — Lattes (34), France.<br/>
          Vous recevez cet email dans le cadre d'une prospection B2B liée à votre activité professionnelle.
          Pour ne plus recevoir nos messages, répondez simplement « STOP ».
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

Concrètement : écrire ce contenu dans le fichier, puis remplacer la ligne
`{{BANNER_LINE}}` par le contenu exact de `/tmp/ind-banner.txt` (utiliser un
éditeur de texte ou `sed` — ne pas retaper la ligne base64 à la main).

```bash
sed -i '' -e "/{{BANNER_LINE}}/r /tmp/ind-banner.txt" -e "/{{BANNER_LINE}}/d" content/cold-outreach-waalaxy/mjml/ind-e3.mjml
```

- [ ] **Step 3: Vérifier que le placeholder a bien été remplacé**

```bash
grep -c "BANNER_LINE" content/cold-outreach-waalaxy/mjml/ind-e3.mjml
```

Expected: `0`

- [ ] **Step 4: Vérifier la conformité anti-slop et vouvoiement (contrainte globale)**

```bash
grep -inE "dans un monde où|imaginez un instant|avez-vous déjà pensé|le choix vous appartient|révolutionnaire|unique en son genre|transforme votre business" content/cold-outreach-waalaxy/mjml/ind-e3.mjml
grep -inE "\btu\b|\bton\b|\bta\b|\btes\b|\btoi\b" content/cold-outreach-waalaxy/mjml/ind-e3.mjml
```

Expected: aucune sortie pour les deux commandes.

- [ ] **Step 5: Compiler et vérifier**

```bash
npx --yes mjml content/cold-outreach-waalaxy/mjml/ind-e3.mjml -o content/cold-outreach-waalaxy/html/ind-e3.html
grep -c "74 → 104 €/MWh" content/cold-outreach-waalaxy/html/ind-e3.html
grep -c "répondez.*AUDIT\|AUDIT" content/cold-outreach-waalaxy/html/ind-e3.html
```

Expected: MJML compile sans erreur ; les deux greps renvoient `1` ou plus.

- [ ] **Step 6: Commit**

```bash
git add content/cold-outreach-waalaxy
git commit -m "feat: nouvel email ind-e3 (histoire→leçon) avec CTA-mot-clé"
```

---

### Task 4: Remplacer le CTA lien par le CTA-mot-clé sur `ind-e1`

**Files:**
- Modify: `content/cold-outreach-waalaxy/mjml/ind-e1.mjml:62-71`

**Interfaces:**
- Consomme : le fichier produit à la Task 1.
- Produit : `content/cold-outreach-waalaxy/mjml/ind-e1.mjml` mis à jour,
  référencé par la Task 7 (build final).

- [ ] **Step 1: Remplacer la section bouton par le callout mot-clé**

Dans `content/cold-outreach-waalaxy/mjml/ind-e1.mjml`, remplacer (lignes
62-71) :

```
    <mj-section background-color="#07131a" padding="8px 24px 26px 24px">
      <mj-column>
        <mj-button href="https://www.byandry.com/b2b.html?ref=ag&camp=ind-e1" background-color="#4cde80" color="#07131a"
          font-weight="700" font-size="13px" letter-spacing="0.04em" border-radius="2px"
          padding="20px 0 0 0" inner-padding="14px 30px">
          Transmettre ma facture
        </mj-button>
        
      </mj-column>
    </mj-section>
```

par :

```
    <mj-section background-color="#07131a" padding="8px 24px 26px 24px">
      <mj-column>
        <mj-text padding="4px 0 18px 0">
          <div style="border-left:3px solid #5ecfdc; padding-left:16px; font-size:17px; font-weight:600; line-height:1.45; color:#f5f0e8;">Répondez à cet email avec le mot <strong style="color:#5ecfdc">AUDIT</strong>, je vous transmets le lien directement.</div>
        </mj-text>
      </mj-column>
    </mj-section>
```

Le lien `https://www.byandry.com/b2b.html?ref=ag&camp=ind-e1` disparaît de cet
email (plus de bouton) — c'est attendu : `ind-e1` n'a plus de clic trackable,
seulement des réponses comptées manuellement (cf. spec, section « Mesure de
succès »).

- [ ] **Step 2: Vérifier qu'il ne reste plus de `mj-button` dans le fichier**

```bash
grep -c "mj-button" content/cold-outreach-waalaxy/mjml/ind-e1.mjml
```

Expected: `0`

- [ ] **Step 2b: Vérifier la conformité anti-slop et vouvoiement du nouveau texte**

```bash
grep -inE "dans un monde où|imaginez un instant|avez-vous déjà pensé|le choix vous appartient|révolutionnaire|unique en son genre|transforme votre business" content/cold-outreach-waalaxy/mjml/ind-e1.mjml
grep -inE "\btu\b|\bton\b|\bta\b|\btes\b|\btoi\b" content/cold-outreach-waalaxy/mjml/ind-e1.mjml
```

Expected: aucune sortie pour les deux commandes.

- [ ] **Step 3: Compiler et vérifier**

```bash
npx --yes mjml content/cold-outreach-waalaxy/mjml/ind-e1.mjml -o content/cold-outreach-waalaxy/html/ind-e1.html
grep -c "AUDIT" content/cold-outreach-waalaxy/html/ind-e1.html
```

Expected: compilation sans erreur, grep renvoie `1` ou plus.

- [ ] **Step 4: Commit**

```bash
git add content/cold-outreach-waalaxy
git commit -m "feat: ind-e1 — CTA-mot-clé (répondre AUDIT) au lieu du bouton lien"
```

---

### Task 5: Mettre à jour le README de la campagne

**Files:**
- Modify: `content/cold-outreach-waalaxy/README.md`

**Interfaces:**
- Consomme : les changements des Tasks 2, 3, 4.
- Produit : documentation à jour pour la Task 7 et pour toute session future.

- [ ] **Step 1: Mettre à jour la section « Séquence »**

Remplacer :

```
## Séquence

- `*-e1` — accroche + offre (audit gratuit, positionnement cabinet d'expertise)
- `*-e2` — relance à J+4/5, angle différent par segment (groupement d'achat,
  ou donnée chiffrée du Baromètre pour `ind-e2`)
- `*-e3` — dernière relance à J+10, ton « je referme le dossier »
```

par :

```
## Séquence

- `*-e1` — accroche + offre (audit gratuit, positionnement cabinet d'expertise)
- `*-e2` — relance à J+4/5, angle différent par segment (groupement d'achat,
  ou donnée chiffrée du Baromètre pour `ind-e2`)
- `*-e3` — CHR/TERT : dernière relance à J+10, ton « je referme le dossier ».
  IND (pilote) : nouvel email à J+8, « histoire → leçon » sur un récit
  sectoriel générique bâti sur la donnée Baromètre `74 → 104 €/MWh` —
  voir `docs/superpowers/specs/2026-08-13-pilote-ind-swipe-file-design.md`.
- `ind-e4` — pilote uniquement : dernière relance à J+14 (ton « je referme
  le dossier », contenu inchangé de l'ancien `ind-e3`).

### CTA-mot-clé (pilote IND)

`ind-e1` et `ind-e3` remplacent le bouton-lien habituel par un texte
« Répondez à cet email avec le mot AUDIT » — testé contre `ind-e2`/`ind-e4`
qui gardent le bouton-lien classique, pour comparer taux de réponse et taux
de clic sur la même séquence.
```

- [ ] **Step 2: Ajouter une section LinkedIn**

Ajouter, juste avant la section `## Tracking` existante :

```
## Volet LinkedIn (pilote IND)

2 posts déclinant les mêmes angles que `ind-e2` (donnée marché) et le
nouveau `ind-e3` (récit sectoriel), publiés depuis le profil personnel
d'Antoine — voir `linkedin.md`. Même format que
`content/social-organique-b2b/semaine-XX.md` (autre branche) : vouvoiement,
lien tracké en UTM plutôt qu'en `ref/camp`.

```

- [ ] **Step 3: Mettre à jour la ligne de tracking pour préciser le cas LinkedIn**

Dans la section `## Tracking` existante, ajouter après le paragraphe sur
`camp=<segment>-e<n>` :

```

Le volet LinkedIn du pilote IND n'utilise pas `ref`/`camp` : il suit la
convention UTM déjà en place pour le contenu organique
(`utm_source=linkedin_organic&utm_campaign=pilote-ind&utm_content=post-<n>`),
cf. `linkedin.md`.
```

- [ ] **Step 4: Vérifier la cohérence du fichier**

```bash
grep -n "ind-e4\|ind-e3\|linkedin.md" content/cold-outreach-waalaxy/README.md
```

Expected: les trois termes apparaissent chacun au moins une fois, dans les
sections mises à jour.

- [ ] **Step 5: Commit**

```bash
git add content/cold-outreach-waalaxy/README.md
git commit -m "docs: README campagne — séquence 4 emails IND, CTA-mot-clé, volet LinkedIn"
```

---

### Task 6: Créer `linkedin.md` — les 2 posts du pilote

**Files:**
- Create: `content/cold-outreach-waalaxy/linkedin.md`

**Interfaces:**
- Consomme : les angles de `ind-e2` (donnée marché) et du nouveau `ind-e3`
  (récit sectoriel), créés aux Tasks 1 et 3.
- Produit : `content/cold-outreach-waalaxy/linkedin.md`, référencé par le
  README (Task 5).

- [ ] **Step 1: Créer le fichier avec le contenu complet**

```markdown
# Pilote IND — volet LinkedIn

Profil : personnel (Antoine). Format aligné sur
`content/social-organique-b2b/semaine-XX.md` (autre branche) — vouvoiement,
un mécanisme concret expliqué, une donnée réelle, pas de mot magique.

## Post 1 — donnée marché (décline `ind-e2`)

En un mois, le prix de gros de l'électricité est passé de 74 à 104 €/MWh.

Si votre contrat industriel est indexé sur ce prix, ou arrive à échéance
dans les mois qui viennent, cette hausse se retrouve directement sur votre
facture — sans qu'aucune ligne ne l'annonce à l'avance.

La clause d'indexation figure dans le contrat dès la signature. Elle se lit
et se négocie avant, pas après le renouvellement.

Donnée extraite du Baromètre des prix de l'énergie, mis à jour chaque mois :
https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=pilote-ind&utm_content=post-1

## Post 2 — récit sectoriel (décline le nouveau `ind-e3`)

Une PME industrielle sous contrat fixe depuis plusieurs années. Le
renouvellement arrive cet été. Le nouveau prix proposé est indexé sur le
marché de gros — personne dans l'entreprise n'avait identifié ce changement
de règle avant de recevoir la proposition.

Ce n'est pas un cas isolé : la clause d'indexation est rarement présentée
comme un risque au moment de la signature initiale.

Ce qui change la donne, c'est de la relire avant l'échéance, pas après.

Si votre contrat industrie arrive à échéance dans les prochains mois :
https://byandry.com/b2b.html?utm_source=linkedin_organic&utm_campaign=pilote-ind&utm_content=post-2
```

- [ ] **Step 2: Vérifier la conformité anti-slop et vouvoiement**

```bash
grep -inE "dans un monde où|imaginez un instant|avez-vous déjà pensé|le choix vous appartient|révolutionnaire|unique en son genre|transforme votre business" content/cold-outreach-waalaxy/linkedin.md
grep -inE "\btu\b|\bton\b|\bta\b|\btes\b|\btoi\b" content/cold-outreach-waalaxy/linkedin.md
```

Expected: aucune sortie pour les deux commandes.

- [ ] **Step 3: Vérifier la présence des deux liens UTM distincts**

```bash
grep -c "utm_content=post-1" content/cold-outreach-waalaxy/linkedin.md
grep -c "utm_content=post-2" content/cold-outreach-waalaxy/linkedin.md
```

Expected: `1` pour chaque commande.

- [ ] **Step 4: Commit**

```bash
git add content/cold-outreach-waalaxy/linkedin.md
git commit -m "feat: 2 posts LinkedIn pilote IND (donnée marché + récit sectoriel)"
```

---

### Task 7: Build final et vérification globale

**Files:**
- Modify (régénération) : `content/cold-outreach-waalaxy/html/ind-e1.html`,
  `ind-e2.html`, `ind-e3.html`, `ind-e4.html`

**Interfaces:**
- Consomme : les fichiers MJML produits aux Tasks 2, 3, 4.
- Produit : sortie HTML finale du pilote, prête pour relecture manuelle.

- [ ] **Step 1: Recompiler tous les emails IND**

```bash
cd "/Users/antoinegaussin/SITE MS/.claude/worktrees/cold-outreach-ind-pilote"
for f in content/cold-outreach-waalaxy/mjml/ind-e*.mjml; do
  npx --yes mjml "$f" -o "content/cold-outreach-waalaxy/html/$(basename "$f" .mjml).html"
done
echo "build OK"
```

Expected: `build OK`, aucune erreur MJML sur les 4 fichiers.

- [ ] **Step 2: Vérifier qu'il y a bien 4 emails IND et que les paramètres `camp` sont cohérents**

```bash
ls content/cold-outreach-waalaxy/mjml/ind-e*.mjml
grep -h "camp=ind-e" content/cold-outreach-waalaxy/mjml/ind-e*.mjml
```

Expected: 4 fichiers listés (`ind-e1.mjml` à `ind-e4.mjml`) ; le grep
renvoie 2 lignes (`ind-e2` et `ind-e4` ont un bouton avec `camp=`, `ind-e1`
et `ind-e3` n'en ont pas — c'est attendu, CTA-mot-clé).

- [ ] **Step 3: Vérifier le poids des fichiers HTML (rappel README : limite Gmail ~102 Ko)**

```bash
ls -la content/cold-outreach-waalaxy/html/ind-e*.html
```

Note pour la relecture humaine : si `ind-e3.html` (nouveau, reprend la
bannière base64 de `ind-e1`) dépasse largement les autres, c'est le même
avertissement déjà documenté dans le README pour toute la campagne
(placeholders base64 à remplacer par une URL publique avant envoi réel) —
pas une régression propre à ce pilote.

- [ ] **Step 4: Commit final si des fichiers HTML ont changé**

```bash
git add content/cold-outreach-waalaxy/html
git status --short
git commit -m "build: régénère le HTML des 4 emails IND" || echo "rien à commit (déjà à jour)"
```

- [ ] **Step 5: Push de la branche**

```bash
git push -u origin worktree-cold-outreach-ind-pilote
```

---

## Hors périmètre (rappel de la spec)

- Choix de l'outil d'envoi email.
- Implémentation du paramètre `camp` dans `middleware.js`.
- Dashboard de visualisation.
- Réconciliation de `linkedin.md` avec le calendrier
  `content/social-organique-b2b/` (autre branche) — à faire au merge si
  besoin.
