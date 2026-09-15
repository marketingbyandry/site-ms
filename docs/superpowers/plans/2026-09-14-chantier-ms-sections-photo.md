# Déploiement du Chantier MS (sections + photos sur le site) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déployer 6 des 7 sections du gabarit "Chantier MS" (hero exclu) sur `index.html`, `b2b.html`, `b2c.html`, `comment-ca-marche.html`, `resultats.html`, plus un traitement photo sur les 9 pages du blog, avec des placeholders en attendant les vraies photos de l'utilisateur.

**Architecture:** Un fichier CSS partagé unique (`assets/chantier-sections.css`) porte tout le nouveau CSS (composants + tokens de mapping gabarit→site), chargé via `<link>` sur les 15 pages concernées — pour ne pas dupliquer ce CSS 15 fois. Chaque page garde son `<script>` inline existant ; on l'étend au minimum (une ligne de sélecteur, ou un petit observer dédié sur les pages articles) plutôt que d'introduire un nouveau système JS.

**Tech Stack:** HTML/CSS/JS statique (aucun framework, aucun bundler pour ces fichiers). Tests : `node --test test/*.test.mjs` (`npm test`), convention du repo = lecture du HTML/JS source brut via `readFileSync` + assertions regex/string (voir `test/ticker-css-animation.test.mjs`), pas de DOM/jsdom.

## Global Constraints

- Aucun hero n'est remplacé ou restructuré sur aucune page (contrainte explicite utilisateur). Les insertions se font uniquement entre sections existantes, jamais à la place du hero.
- Les chiffres du gabarit (8 216, 94%, −21%/−17%/−19%) sont repris tels quels, avec leur badge "gabarit — donnée d'exemple" conservé (décision explicite utilisateur, cf. spec §"Chiffres du gabarit").
- Le widget console (Section 5) est repris tel quel, y compris ses valeurs de marché sans mention de fraîcheur (décision explicite utilisateur).
- Ne pas fusionner `.pcta`/`.cta-btn`/`.ncta` en une seule classe — hors périmètre, appartient au chantier audit `design-is` séparé (PR #77).
- Ne jamais toucher `assets/hero-search.js` ni les blocs `.psearch`/`.psearch-*` sur `b2b.html`/`b2c.html` (fonctionnalité PR #71, déjà sur `origin/main`, sans rapport avec ce plan).
- Chaque section neuve place un `.rule-note` (ou équivalent) signalant que les emplacements photo sont des placeholders en attendant de vraies photos (cf. pattern déjà shippé PR #76).

---

## Point de départ critique — ne pas partir de la branche `photo-system-section`

La Section 6 (cartes flip photo) existe déjà en code, mais sur la branche `photo-system-section` (PR #76), qui **a divergé de `main` le 09-09** (commit `22617c0`), soit **avant** que la PR #71 (module de recherche hero sur `b2b.html`/`b2c.html`) soit mergée le 09-11. Un diff brut de `photo-system-section` contre `origin/main` fait donc apparaître à tort une suppression du module de recherche hero + de `assets/hero-search.js` sur `b2b.html`/`b2c.html` — un artefact de staleness, pas un changement voulu.

Ce plan part de `origin/main` (déjà fait : worktree `worktree-chantier-ms-sections-photo`, branche du même nom). Le Task 2 récupère uniquement le diff réel d'`index.html` entre le merge-base et `photo-system-section`, jamais les autres fichiers de cette branche.

---

### Task 1: Fichier CSS partagé `assets/chantier-sections.css`

**Files:**
- Create: `assets/chantier-sections.css`
- Test: `test/chantier-sections-css.test.mjs`

**Interfaces:**
- Produces: tokens CSS `--line`, `--surface`, `--surface-2`, `--ok`, `--bad` ; classes `.photo-section`, `.photo-inner`, `.photo-system-grid`, `.flip-card`, `.flip-card-inner`, `.flip-card-front`, `.flip-card-back`, `.flip-back-title`, `.flip-back-text`, `.flip-hint`, `.photo-ph` (+ `.tag`, `.dot-grid`), `.rule-note`, `.blog-thumb`, `.article-banner`, `.mirror-row` (+ `.stat`, `.visual`), `.cases-head`, `.cases-grid-3`, `.case-card`, `.logo-ph`, `.sample-tag`, `.compare` (+ `.compare-top`, `.compare-row`, `.mark`), `.console-standalone`, `.console-panel`, `.pulse`, `.btn-aurora`. Toutes les tâches suivantes chargent ce fichier via `<link rel="stylesheet" href="assets/chantier-sections.css">`.

- [ ] **Step 1: Write the failing test**

```js
// test/chantier-sections-css.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = () => readFileSync('assets/chantier-sections.css', 'utf8');

test('chantier-sections.css définit les tokens de mapping gabarit → site', () => {
  const source = css();
  assert.match(source, /--line:\s*rgba\(43,181,200,\.15\)/);
  assert.match(source, /--surface:\s*linear-gradient/);
  assert.match(source, /--surface-2:\s*rgba\(13,79,92,\.18\)/);
  assert.match(source, /--ok:\s*var\(--green\)/);
  assert.match(source, /--bad:\s*#e05555/);
});

test('chantier-sections.css définit les classes de la Section 6 (photo system, déjà shippé PR #76)', () => {
  const source = css();
  assert.match(source, /\.photo-section\{/);
  assert.match(source, /\.photo-system-grid\{/);
  assert.match(source, /\.flip-card\{/);
  assert.match(source, /\.flip-card-inner\{/);
  assert.match(source, /\.flip-card-front,\.flip-card-back\{/);
  assert.match(source, /\.flip-card-back\{/);
  assert.match(source, /\.flip-hint\{/);
  assert.match(source, /\.photo-ph\{/);
  assert.match(source, /\.photo-ph \.tag\{/);
  assert.match(source, /\.photo-ph \.dot-grid\{/);
  assert.match(source, /\.rule-note\{/);
  assert.match(source, /:root\[data-theme="light"\] \.flip-card-back\{/);
});

test('chantier-sections.css définit les variantes photo autonomes (vignette blog, bannière article)', () => {
  const source = css();
  assert.match(source, /\.blog-thumb\{[^}]*position:\s*relative/);
  assert.match(source, /\.article-banner\{[^}]*position:\s*relative/);
});

test('chantier-sections.css définit les classes des sections 2, 3, 4, 5 et 7', () => {
  const source = css();
  assert.match(source, /\.mirror-row\{/);
  assert.match(source, /\.cases-grid-3\{/);
  assert.match(source, /\.case-card\{/);
  assert.match(source, /\.compare\{/);
  assert.match(source, /\.compare-row\{/);
  assert.match(source, /\.mark\.ok\{/);
  assert.match(source, /\.mark\.bad\{/);
  assert.match(source, /\.console-standalone\{/);
  assert.match(source, /\.console-panel\{/);
  assert.match(source, /\.btn-aurora\{/);
  assert.match(source, /\.btn-aurora:hover::before\{/);
});

test('chantier-sections.css respecte prefers-reduced-motion sur ses animations', () => {
  const source = css();
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="chantier-sections"`
Expected: FAIL — `ENOENT: no such file or directory, open 'assets/chantier-sections.css'`

- [ ] **Step 3: Write the file**

```css
/* assets/chantier-sections.css
   Styles partagés pour les sections du "Chantier MS" (gabarit
   https://claude.ai/code/artifact/6d344bec-a46b-4e6d-9730-e7080b932e7c)
   déployées sur plusieurs pages du site. Un seul fichier pour éviter de
   dupliquer ce CSS 15 fois — voir
   docs/superpowers/specs/2026-09-14-chantier-ms-sections-photo-design.md */

:root{
  --line:rgba(43,181,200,.15);
  --surface:linear-gradient(135deg,rgba(13,79,92,.35),rgba(10,26,31,.9));
  --surface-2:rgba(13,79,92,.18);
  --ok:var(--green);
  --bad:#e05555;
}

/* ─── PHOTO PLACEHOLDER — règle de traitement photo (Section 6) ─── */
.photo-section{padding:7rem 5vw;background:var(--dark2);border-top:1px solid rgba(26,122,138,.1)}
.photo-inner{max-width:1100px;margin:0 auto}
.photo-inner>.sbody{max-width:620px}
.photo-system-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:2.6rem}
@media(max-width:768px){.photo-system-grid{grid-template-columns:repeat(2,1fr)}}
.flip-card{position:relative;display:block;width:100%;aspect-ratio:3/4;border:none;background:none;padding:0;margin:0;font:inherit;color:inherit;text-align:inherit;cursor:pointer;-webkit-perspective:1400px;perspective:1400px}
.flip-card-inner{position:relative;width:100%;height:100%;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;-webkit-transform:rotate3d(.18,1,.06,var(--flip-deg,0deg));transform:rotate3d(.18,1,.06,var(--flip-deg,0deg));transition:-webkit-transform .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
.flip-card-front,.flip-card-back{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;border-radius:4px;overflow:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);will-change:transform}
.flip-card-back{-webkit-transform:rotate3d(.18,1,.06,180deg) translateZ(0);transform:rotate3d(.18,1,.06,180deg) translateZ(0);background:linear-gradient(135deg,rgba(13,79,92,.35),rgba(10,26,31,.9));border:1px solid rgba(43,181,200,.18);padding:1.2rem 1.1rem;display:flex;flex-direction:column;justify-content:flex-end;gap:.4rem}
.flip-back-title{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.1rem;color:var(--teal-glow)}
.flip-back-text{font-size:.78rem;color:var(--muted);line-height:1.55}
.flip-hint{position:absolute;bottom:14px;right:14px;font-family:'Satoshi',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#f5f0e8;background:rgba(7,19,26,.55);border:1px solid rgba(94,207,220,.18);padding:.3rem .55rem;border-radius:2px;backdrop-filter:blur(4px);transition:opacity .3s ease}
.flip-card.flipped .flip-hint{opacity:0}
:root[data-theme="light"] .flip-card-back{background:rgba(26,122,138,.05)}

.photo-ph{position:absolute;inset:0;border-radius:4px;overflow:hidden;border:1px solid rgba(43,181,200,.15);
  background:radial-gradient(circle at 30% 20%,rgba(94,207,220,.16),transparent 55%),
    repeating-linear-gradient(120deg,rgba(138,172,180,.09) 0 1px,transparent 1px 26px),
    linear-gradient(165deg,var(--teal-dark) 0%,rgba(7,19,26,.95) 78%);
  filter:grayscale(.7) sepia(.15) hue-rotate(140deg) brightness(.85);
  transition:filter 1s cubic-bezier(.16,1,.3,1)}
.photo-ph.in,.photo-ph:hover{filter:grayscale(0) sepia(0) hue-rotate(0) brightness(1)}
.photo-ph .tag{position:absolute;top:14px;left:14px;font-family:'Satoshi',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#f5f0e8;background:rgba(7,19,26,.55);border:1px solid rgba(94,207,220,.18);padding:.3rem .55rem;border-radius:2px;backdrop-filter:blur(4px)}
.photo-ph .dot-grid{position:absolute;inset:0;opacity:.5;background-image:radial-gradient(rgba(245,240,232,.25) 1px,transparent 1.4px);background-size:18px 18px}

.rule-note{margin-top:2.2rem;display:flex;gap:.9rem;align-items:flex-start;padding:1.3rem 1.4rem;border:1px solid rgba(43,181,200,.15);border-radius:4px;background:linear-gradient(135deg,rgba(13,79,92,.35),rgba(10,26,31,.9))}
.rule-note .dot{width:8px;height:8px;border-radius:50%;background:var(--teal-light);margin-top:.45rem;flex-shrink:0}
.rule-note p{font-size:.86rem;color:var(--muted);line-height:1.65}

/* Emplacements photo hors carte flip (vignette blog, bannière article) :
   .photo-ph est position:absolute par défaut (pour remplir un parent
   .flip-card-front en inset:0). Ces deux variantes le transforment en
   bloc autonome dimensionné par aspect-ratio, tout en restant le contexte
   de positionnement de ses enfants .dot-grid/.tag (position:relative,
   jamais static, sinon .dot-grid se positionnerait par rapport à un
   ancêtre plus lointain). */
.blog-thumb{position:relative;aspect-ratio:16/9;margin-bottom:1.2rem}
.article-banner{position:relative;aspect-ratio:21/9;margin-bottom:2rem}

/* ─── SECTION 2 : bandeau chiffres en miroir ─────────────────────── */
.mirror-row{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.mirror-row:not(:last-child){margin-bottom:18px}
.mirror-row .stat,.mirror-row .visual{padding:40px 44px;display:flex;flex-direction:column;justify-content:center}
.mirror-row .visual{padding:0;min-height:220px;position:relative}
.mirror-row:nth-child(even){direction:rtl}
.mirror-row:nth-child(even) > *{direction:ltr}
@media (max-width:760px){.mirror-row{grid-template-columns:1fr}.mirror-row:nth-child(even){direction:ltr}}
.mirror-row .stat .num{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(40px,4.6vw,64px);color:var(--teal-light);font-variant-numeric:tabular-nums;line-height:1}
.mirror-row .stat .label{margin-top:10px;color:var(--muted);font-size:14px;max-width:26ch}
.mirror-row .stat .src{margin-top:16px;font-family:monospace;font-size:10px;color:var(--muted);opacity:.7;text-transform:uppercase;letter-spacing:.06em}
.mirror-row .visual .photo-ph{border-radius:0;border:none;position:absolute;inset:0}

/* ─── SECTION 3 : grille de résultats par secteur ────────────────── */
.cases-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:44px;flex-wrap:wrap}
.cases-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media (max-width:860px){.cases-grid-3{grid-template-columns:1fr}}
.case-card{border:1px solid var(--line);border-radius:14px;padding:26px;background:var(--surface);transition:transform .4s cubic-bezier(.16,1,.3,1),border-color .4s ease,background .4s ease}
.case-card:hover{transform:translateY(-6px);border-color:var(--teal-mid);background:var(--surface-2)}
.case-card .sector{font-family:monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.case-card .delta{font-family:'Instrument Serif',serif;font-weight:400;font-size:36px;color:var(--green-glow);margin-top:14px}
.case-card .desc{margin-top:10px;font-size:14px;color:var(--cream);opacity:.85;line-height:1.5}
.case-card .foot{margin-top:20px;padding-top:16px;border-top:1px solid var(--line);display:flex;align-items:center;gap:10px}
.logo-ph{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,var(--teal),var(--teal-dark));display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:10px;color:var(--cream);flex-shrink:0}
.case-card .foot .sites{font-size:12px;color:var(--muted)}
.sample-tag{font-family:monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border:1px dashed var(--line);padding:4px 8px;border-radius:5px}

/* ─── SECTION 4 : comparatif ──────────────────────────────────────── */
.compare{border:1px solid var(--line);border-radius:16px;overflow:hidden}
.compare-top{display:grid;grid-template-columns:1.4fr 1fr 1fr;background:var(--surface)}
.compare-top .cell{padding:22px 22px 18px}
.compare-top .cell.brand{background:linear-gradient(135deg,rgba(26,122,138,.18),rgba(76,222,128,.10));position:relative}
.compare-top .cell.brand::after{content:"Recommandé";position:absolute;top:14px;right:16px;font-family:monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--green-glow);border:1px solid rgba(76,222,128,.4);padding:3px 7px;border-radius:100px}
.compare-top h4{font-size:16px;font-weight:500;font-family:'Satoshi',sans-serif}
.compare-top .cell:first-child h4{opacity:0}
.compare-row{display:grid;grid-template-columns:1.4fr 1fr 1fr;border-top:1px solid var(--line)}
.compare-row .cell{padding:16px 22px;font-size:14px;display:flex;align-items:center}
.compare-row .cell:first-child{color:var(--cream);opacity:.9}
.compare-row:hover{background:var(--surface)}
.mark{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px}
.mark.ok{background:rgba(76,222,128,.14);color:var(--ok)}
.mark.bad{background:rgba(226,118,95,.12);color:var(--bad)}

/* ─── SECTION 5 : widget console (autonome, hors hero) ───────────── */
.console-standalone{border-radius:20px;overflow:hidden;position:relative;background:radial-gradient(circle at 75% 30%,rgba(94,207,220,.14),transparent 55%),linear-gradient(160deg,var(--dark),#041017 120%);border:1px solid var(--line);padding:clamp(40px,6vw,80px)}
.console-panel{margin-top:44px;max-width:420px;border:1px solid var(--line);border-radius:14px;padding:22px 24px;background:rgba(245,240,232,.04);backdrop-filter:blur(6px);transition:border-color .3s ease}
.console-panel:hover{border-color:var(--teal-light)}
.console-panel .row{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:1px solid var(--line)}
.console-panel .row:last-child{border-bottom:none}
.console-panel .k{font-family:monospace;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.console-panel .v{font-family:monospace;font-size:14px;color:var(--teal-glow);font-variant-numeric:tabular-nums}
.console-panel .v.up{color:var(--green-glow)}
.pulse{width:7px;height:7px;border-radius:50%;background:var(--green);display:inline-block;margin-right:7px;box-shadow:0 0 0 0 rgba(76,222,128,.6);animation:cs-pulse 2.4s infinite}
@keyframes cs-pulse{0%{box-shadow:0 0 0 0 rgba(76,222,128,.5)}70%{box-shadow:0 0 0 9px rgba(76,222,128,0)}100%{box-shadow:0 0 0 0 rgba(76,222,128,0)}}
@media (prefers-reduced-motion:reduce){.pulse{animation:none}}

/* ─── SECTION 7 : effet bouton "aurora" au survol ────────────────── */
.btn-aurora{position:relative;z-index:0;overflow:hidden}
.btn-aurora::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(130px 80px at 50% 18%,var(--green-glow),var(--teal-light) 50%,transparent 78%);mix-blend-mode:screen;opacity:0;transition:opacity .45s ease}
.btn-aurora:hover::before{opacity:.55}
@media (prefers-reduced-motion:reduce){.btn-aurora::before{transition:none}}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="chantier-sections"`
Expected: PASS (5/5)

- [ ] **Step 5: Commit**

```bash
git add assets/chantier-sections.css test/chantier-sections-css.test.mjs
git commit -m "feat: fichier CSS partagé pour les sections du Chantier MS"
```

---

### Task 2: `index.html` — récupérer la Section 6 déjà shippée (PR #76) et migrer son CSS

**Files:**
- Modify: `index.html`
- Test: `test/index-photo-system.test.mjs`

**Interfaces:**
- Consumes: `assets/chantier-sections.css` (Task 1) — classes `.photo-section`, `.flip-card*`, `.photo-ph*`, `.rule-note*`.
- Produces: `index.html` contient désormais `<section class="photo-section">` entre `.about-section` et `.careers`, et charge `chantier-sections.css`. Les tâches suivantes sur `index.html` (Task 3) s'appuient sur ce `<link>` déjà présent.

- [ ] **Step 1: Write the failing test**

```js
// test/index-photo-system.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('index.html', 'utf8');

test('index.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('index.html contient la Section 6 (photo system) entre L\'entreprise et Rejoindre', () => {
  const source = html();
  const aboutIdx = source.indexOf('<section class="about-section">');
  const photoIdx = source.indexOf('<section class="photo-section">');
  const careersIdx = source.indexOf('<section class="careers" id="careers">');
  assert.ok(aboutIdx > -1, 'about-section doit exister');
  assert.ok(photoIdx > aboutIdx, 'photo-section doit venir après about-section');
  assert.ok(careersIdx > photoIdx, 'careers doit venir après photo-section');
});

test('index.html ne duplique plus en inline le CSS déjà présent dans chantier-sections.css', () => {
  const source = html();
  const styleOpen = source.indexOf('<style>');
  const styleClose = source.indexOf('</style>');
  const inlineStyle = source.slice(styleOpen, styleClose);
  assert.doesNotMatch(inlineStyle, /\.flip-card-inner\{/, 'CSS des cartes flip doit être dans assets/chantier-sections.css');
  assert.doesNotMatch(inlineStyle, /\.photo-system-grid\{/, 'CSS de la grille photo doit être dans assets/chantier-sections.css');
});

test('index.html conserve le gestionnaire JS de bascule des cartes flip', () => {
  const source = html();
  assert.match(source, /document\.querySelectorAll\('\.flip-card'\)\.forEach/);
  assert.match(source, /card\.setAttribute\('aria-pressed'/);
});

test('index.html observe toujours .photo-ph dans le reveal scroll', () => {
  assert.match(html(), /document\.querySelectorAll\('\.reveal,\s*\.photo-ph'\)\.forEach\(el => obs\.observe\(el\)\);/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="index.html"`
Expected: FAIL — aucune trace de `photo-section`/`<link>` sur `origin/main`.

- [ ] **Step 3: Cherry-pick le diff réel d'index.html depuis photo-system-section**

```bash
git diff 22617c0f984a44d031eee3fbe650a7ca27f5bf86 origin/photo-system-section -- index.html | git apply -
```

Expected: applique proprement (156 lignes de diff), aucun conflit — ce diff ne touche qu'`index.html`.

- [ ] **Step 4: Run test to verify partial pass**

Run: `npm test -- --test-name-pattern="index.html"`
Expected: les tests "Section 6" et "gestionnaire JS" et "reveal .photo-ph" PASSENT déjà (le diff les apporte). Les tests "<link>" et "ne duplique plus" ÉCHOUENT encore (CSS toujours inline, pas de `<link>`).

- [ ] **Step 5: Retirer le CSS dupliqué de l'inline `<style>` et ajouter le `<link>`**

Dans `index.html`, supprimer du bloc `<style>` interne les règles suivantes (désormais dans `assets/chantier-sections.css`, Task 1) :

```css
.photo-section{padding:7rem 5vw;background:var(--dark2);border-top:1px solid rgba(26,122,138,.1)}
.photo-inner{max-width:1100px;margin:0 auto}
.photo-inner>.sbody{max-width:620px}
.photo-system-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:2.6rem}
@media(max-width:768px){.photo-system-grid{grid-template-columns:repeat(2,1fr)}}
.flip-card{position:relative;display:block;width:100%;aspect-ratio:3/4;border:none;background:none;padding:0;margin:0;font:inherit;color:inherit;text-align:inherit;cursor:pointer;-webkit-perspective:1400px;perspective:1400px}
.flip-card-inner{position:relative;width:100%;height:100%;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;-webkit-transform:rotate3d(.18,1,.06,var(--flip-deg,0deg));transform:rotate3d(.18,1,.06,var(--flip-deg,0deg));transition:-webkit-transform .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
.flip-card-front,.flip-card-back{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;border-radius:4px;overflow:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);will-change:transform}
.flip-card-back{-webkit-transform:rotate3d(.18,1,.06,180deg) translateZ(0);transform:rotate3d(.18,1,.06,180deg) translateZ(0);background:linear-gradient(135deg,rgba(13,79,92,.35),rgba(10,26,31,.9));border:1px solid rgba(43,181,200,.18);padding:1.2rem 1.1rem;display:flex;flex-direction:column;justify-content:flex-end;gap:.4rem}
.flip-back-title{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.1rem;color:var(--teal-glow)}
.flip-back-text{font-size:.78rem;color:var(--muted);line-height:1.55}
.flip-hint{position:absolute;bottom:14px;right:14px;font-family:'Satoshi',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#f5f0e8;background:rgba(7,19,26,.55);border:1px solid rgba(94,207,220,.18);padding:.3rem .55rem;border-radius:2px;backdrop-filter:blur(4px);transition:opacity .3s ease}
.flip-card.flipped .flip-hint{opacity:0}
.photo-ph{position:absolute;inset:0;border-radius:4px;overflow:hidden;border:1px solid rgba(43,181,200,.15);
  background:radial-gradient(circle at 30% 20%,rgba(94,207,220,.16),transparent 55%),
    repeating-linear-gradient(120deg,rgba(138,172,180,.09) 0 1px,transparent 1px 26px),
    linear-gradient(165deg,var(--teal-dark) 0%,rgba(7,19,26,.95) 78%);
  filter:grayscale(.7) sepia(.15) hue-rotate(140deg) brightness(.85);
  transition:filter 1s cubic-bezier(.16,1,.3,1)}
.photo-ph.in,.photo-ph:hover{filter:grayscale(0) sepia(0) hue-rotate(0) brightness(1)}
.photo-ph .tag{position:absolute;top:14px;left:14px;font-family:'Satoshi',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#f5f0e8;background:rgba(7,19,26,.55);border:1px solid rgba(94,207,220,.18);padding:.3rem .55rem;border-radius:2px;backdrop-filter:blur(4px)}
.photo-ph .dot-grid{position:absolute;inset:0;opacity:.5;background-image:radial-gradient(rgba(245,240,232,.25) 1px,transparent 1.4px);background-size:18px 18px}
.rule-note{margin-top:2.2rem;display:flex;gap:.9rem;align-items:flex-start;padding:1.3rem 1.4rem;border:1px solid rgba(43,181,200,.15);border-radius:4px;background:linear-gradient(135deg,rgba(13,79,92,.35),rgba(10,26,31,.9))}
.rule-note .dot{width:8px;height:8px;border-radius:50%;background:var(--teal-light);margin-top:.45rem;flex-shrink:0}
.rule-note p{font-size:.86rem;color:var(--muted);line-height:1.65}
```

Et dans le bloc `:root[data-theme="light"]`, retirer : `.flip-card-back{background:rgba(26,122,138,.05)}`.

Ajouter juste avant la balise `<style>` (ligne 29 sur `origin/main`, peut avoir bougé après le cherry-pick — chercher la première occurrence de `<style>` dans le `<head>`) :

```html
<link rel="stylesheet" href="assets/chantier-sections.css">
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="index.html"`
Expected: PASS (5/5)

- [ ] **Step 7: Run full suite**

Run: `npm test`
Expected: tous les tests existants restent verts (aucune régression — le rendu de la Section 6 est inchangé, seul son CSS a changé d'emplacement).

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: récupère la Section 6 (photo system, PR #76) et migre son CSS vers chantier-sections.css"
```

---

### Task 3: `index.html` — Section 2 (bandeau chiffres en miroir)

**Files:**
- Modify: `index.html`
- Test: `test/index-mirror-stats.test.mjs`

**Interfaces:**
- Consumes: `.mirror-row`, `.rule-note` (Task 1).

- [ ] **Step 1: Write the failing test**

```js
// test/index-mirror-stats.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('index.html', 'utf8');

test('index.html insère la Section 2 (chiffres en miroir) entre .brand et .seo-intro', () => {
  const source = html();
  const brandCloseIdx = source.indexOf('</section>', source.indexOf('<section class="brand">'));
  const mirrorIdx = source.indexOf('<div class="mirror-row');
  const seoIdx = source.indexOf('<section class="seo-intro">');
  assert.ok(mirrorIdx > brandCloseIdx, 'chiffres en miroir doit venir après le bandeau marque');
  assert.ok(seoIdx > mirrorIdx, 'seo-intro doit venir après les chiffres en miroir');
});

test('la Section 2 affiche les deux chiffres du gabarit avec le badge donnée d\'exemple', () => {
  const source = html();
  assert.match(source, /8\s?216/);
  assert.match(source, />94%</);
  assert.match(source, /gabarit — donnée d'exemple/);
});

test('la Section 2 contient un avertissement placeholder photo (rule-note)', () => {
  const source = html();
  const mirrorIdx = source.indexOf('<div class="mirror-row');
  const noteIdx = source.indexOf('<div class="rule-note', mirrorIdx);
  assert.ok(noteIdx > mirrorIdx, 'un rule-note doit suivre la Section 2');
  assert.ok(noteIdx - mirrorIdx < 3000, 'le rule-note doit être proche de la Section 2 (pas celui de la Section 6 plus bas)');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="Section 2"`
Expected: FAIL — aucun `.mirror-row` sur `index.html`.

- [ ] **Step 3: Insérer la Section 2**

Dans `index.html`, juste après `</section>` (fermeture de `<section class="brand">`) et avant `<!-- SEO: QU'EST-CE QU'UN COURTIER EN ÉNERGIE -->` :

```html
<!-- CHIFFRES EN MIROIR (Chantier MS, Section 2) -->
<section class="market-section" style="padding-top:0">
  <div class="mirror-row reveal">
    <div class="stat">
      <div class="num">8 216</div>
      <p class="label">professionnels déjà accompagnés dans la négociation de leurs contrats</p>
    </div>
    <div class="visual"><div class="photo-ph"><span class="dot-grid"></span><span class="tag">équipe</span></div></div>
  </div>
  <div class="mirror-row reveal d1">
    <div class="visual"><div class="photo-ph"><span class="dot-grid"></span><span class="tag">terrain</span></div></div>
    <div class="stat">
      <div class="num">94%</div>
      <p class="label">de taux de renouvellement des contrats négociés par le cabinet</p>
      <p class="src">gabarit — donnée d'exemple</p>
    </div>
  </div>
  <div class="rule-note reveal d2">
    <span class="dot"></span>
    <p><strong>En attendant :</strong> ces emplacements sont réservés à de vraies photos, même règle de traitement que la section "Charte visuelle" plus bas sur cette page.</p>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="Section 2"`
Expected: PASS (3/3)

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 6: Commit**

```bash
git add index.html test/index-mirror-stats.test.mjs
git commit -m "feat: ajoute la Section 2 (chiffres en miroir) sur index.html"
```

---

### Task 4: `b2b.html` — Section 3 (grille de résultats par secteur)

**Files:**
- Modify: `b2b.html`
- Test: `test/b2b-cases-grid.test.mjs`

**Interfaces:**
- Consumes: `.cases-grid-3`, `.case-card`, `.logo-ph`, `.sample-tag` (Task 1).
- Produces: `b2b.html` charge désormais `chantier-sections.css` — Task 5 (même fichier) s'appuie dessus sans le rajouter.

- [ ] **Step 1: Write the failing test**

```js
// test/b2b-cases-grid.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2b.html', 'utf8');

test('b2b.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('b2b.html insère la grille de résultats par secteur entre les 4 étapes et "sur-mesure"', () => {
  const source = html();
  const howCloseIdx = source.indexOf('</section>', source.indexOf('<section class="how-band">'));
  const casesIdx = source.indexOf('<div class="cases-grid-3">');
  const valsIdx = source.indexOf('<section class="vals">');
  assert.ok(casesIdx > howCloseIdx, 'la grille de résultats doit venir après les 4 étapes');
  assert.ok(valsIdx > casesIdx, '"sur-mesure" doit venir après la grille de résultats');
});

test('la grille de résultats affiche le badge "gabarit — données d\'exemple" et 3 cas sectoriels', () => {
  const source = html();
  assert.match(source, /gabarit — données d'exemple/);
  assert.match(source, /Restauration · 14 sites/);
  assert.match(source, /−21%/);
  assert.match(source, /Industrie agroalimentaire/);
  assert.match(source, /−17%/);
  assert.match(source, /Commerce de détail/);
  assert.match(source, /−19%/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="b2b"`
Expected: FAIL.

- [ ] **Step 3: Ajouter le `<link>` et insérer la section**

Ajouter juste avant `<style>` (ligne 106 sur `origin/main`, chercher la première occurrence dans `<head>`) :

```html
<link rel="stylesheet" href="assets/chantier-sections.css">
```

Insérer entre `</section>` (fermeture de `.how-band`, ligne 453 sur `origin/main`) et `<section class="vals">` (ligne 456 sur `origin/main`) :

```html
<!-- RÉSULTATS PAR SECTEUR (Chantier MS, Section 3) -->
<section class="cases-section" style="padding:6rem 5vw;max-width:1100px;margin:0 auto">
  <div class="cases-head reveal">
    <div>
      <h2 class="sh2">Ce que la négociation change, secteur par secteur</h2>
    </div>
    <span class="sample-tag">gabarit — données d'exemple</span>
  </div>
  <div class="cases-grid-3">
    <div class="case-card reveal">
      <p class="sector">Restauration · 14 sites</p>
      <p class="delta">−21%</p>
      <p class="desc">sur la part énergie du compte d'exploitation, après remise en concurrence des contrats électricité.</p>
      <div class="foot"><div class="logo-ph">RX</div><span class="sites">Réseau multi-sites</span></div>
    </div>
    <div class="case-card reveal d1">
      <p class="sector">Industrie agroalimentaire</p>
      <p class="delta">−17%</p>
      <p class="desc">de facture gaz sur un site de production, contrat renégocié 4 mois avant échéance.</p>
      <div class="foot"><div class="logo-ph">IA</div><span class="sites">Site unique</span></div>
    </div>
    <div class="case-card reveal d2">
      <p class="sector">Commerce de détail</p>
      <p class="delta">−19%</p>
      <p class="desc">sur l'ensemble du parc, avec un interlocuteur unique pour 22 points de vente.</p>
      <div class="foot"><div class="logo-ph">CD</div><span class="sites">22 sites</span></div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="b2b"`
Expected: PASS (3/3)

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 6: Commit**

```bash
git add b2b.html test/b2b-cases-grid.test.mjs
git commit -m "feat: ajoute la Section 3 (résultats par secteur) sur b2b.html"
```

---

### Task 5: `b2b.html` — Section 4 (comparatif, copie B2B verbatim gabarit)

**Files:**
- Modify: `b2b.html`
- Test: `test/b2b-compare.test.mjs`

**Interfaces:**
- Consumes: `.compare`, `.compare-top`, `.compare-row`, `.mark` (Task 1) ; `<link>` déjà ajouté (Task 4).

- [ ] **Step 1: Write the failing test**

```js
// test/b2b-compare.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2b.html', 'utf8');

test('b2b.html insère le comparatif entre "sur-mesure" et le formulaire d\'étude', () => {
  const source = html();
  const valsCloseIdx = source.indexOf('</section>', source.indexOf('<section class="vals">'));
  const compareIdx = source.indexOf('class="compare');
  const uploadIdx = source.indexOf('<section class="upload-section" id="upload">');
  assert.ok(compareIdx > valsCloseIdx, 'le comparatif doit venir après "sur-mesure"');
  assert.ok(uploadIdx > compareIdx, 'le formulaire d\'étude doit venir après le comparatif');
});

test('le comparatif B2B reprend les 5 lignes verbatim du gabarit', () => {
  const source = html();
  assert.match(source, /Mise en concurrence des offres/);
  assert.match(source, /Suivi des marchés de gros/);
  assert.match(source, /Interlocuteur dédié/);
  assert.match(source, /Alerte avant échéance de contrat/);
  assert.match(source, /Temps interne/);
  assert.match(source, /Sur économies réalisées/);
  assert.match(source, /<div class="cell brand">/);
});
```

Note : "Recommandé" est généré par CSS (`.compare-top .cell.brand::after{content:"Recommandé"}`,
déjà dans `assets/chantier-sections.css`), jamais présent dans le HTML source de `b2b.html` —
le test vérifie donc la marque `class="cell brand"` qui déclenche ce badge, pas le mot lui-même.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="comparatif"`
Expected: FAIL.

- [ ] **Step 3: Insérer la section**

Insérer entre `</section>` (fermeture de `.vals`, ligne 481 sur `origin/main`) et `<section class="upload-section" id="upload">` (ligne 484 sur `origin/main`) :

```html
<!-- COMPARATIF (Chantier MS, Section 4) -->
<section class="compare-section" style="padding:6rem 5vw;max-width:900px;margin:0 auto">
  <h2 class="sh2 reveal" style="margin-bottom:2rem;text-align:center">Sans courtier, contre avec M&amp;S Strategy</h2>
  <div class="compare reveal d1">
    <div class="compare-top">
      <div class="cell"></div>
      <div class="cell"><h4>Seul face au fournisseur</h4></div>
      <div class="cell brand"><h4>Avec M&amp;S Strategy</h4></div>
    </div>
    <div class="compare-row"><div class="cell">Mise en concurrence des offres</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Suivi des marchés de gros</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Interlocuteur dédié</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Alerte avant échéance de contrat</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Coût du service</div><div class="cell">Temps interne</div><div class="cell">Sur économies réalisées</div></div>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="comparatif"`
Expected: PASS (2/2)

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 6: Commit**

```bash
git add b2b.html test/b2b-compare.test.mjs
git commit -m "feat: ajoute la Section 4 (comparatif) sur b2b.html"
```

---

### Task 6: `b2c.html` — Section 4 (comparatif, copie adaptée particuliers)

**Files:**
- Modify: `b2c.html`
- Test: `test/b2c-compare.test.mjs`

**Interfaces:**
- Consumes: `.compare`, `.compare-top`, `.compare-row`, `.mark` (Task 1).

- [ ] **Step 1: Write the failing test**

```js
// test/b2c-compare.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('b2c.html', 'utf8');

test('b2c.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('b2c.html insère le comparatif entre "sur-mesure" et le formulaire d\'étude', () => {
  const source = html();
  const valsCloseIdx = source.indexOf('</section>', source.indexOf('<section class="vals">'));
  const compareIdx = source.indexOf('class="compare');
  const uploadIdx = source.indexOf('<section class="upload-section" id="upload">');
  assert.ok(compareIdx > valsCloseIdx);
  assert.ok(uploadIdx > compareIdx);
});

test('le comparatif B2C utilise la copie adaptée particuliers, pas la copie B2B', () => {
  const source = html();
  assert.match(source, /Suivi des évolutions tarifaires/);
  assert.match(source, /Conseiller dédié/);
  assert.match(source, /Temps passé à comparer/);
  assert.doesNotMatch(source, /Suivi des marchés de gros/, 'ne doit pas reprendre la formulation B2B');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="b2c"`
Expected: FAIL.

- [ ] **Step 3: Ajouter le `<link>` et insérer la section**

Ajouter avant `<style>` (ligne 29 sur `origin/main`) :

```html
<link rel="stylesheet" href="assets/chantier-sections.css">
```

Insérer entre `</section>` (fermeture de `.vals`, ligne 433 sur `origin/main`) et `<section class="upload-section" id="upload">` (ligne 436 sur `origin/main`) :

```html
<!-- COMPARATIF (Chantier MS, Section 4, copie particuliers) -->
<section class="compare-section" style="padding:6rem 5vw;max-width:900px;margin:0 auto">
  <h2 class="sh2 reveal" style="margin-bottom:2rem;text-align:center">Sans courtier, contre avec M&amp;S Strategy</h2>
  <div class="compare reveal d1">
    <div class="compare-top">
      <div class="cell"></div>
      <div class="cell"><h4>Seul face au fournisseur</h4></div>
      <div class="cell brand"><h4>Avec M&amp;S Strategy</h4></div>
    </div>
    <div class="compare-row"><div class="cell">Mise en concurrence des offres</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Suivi des évolutions tarifaires</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Conseiller dédié</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Alerte avant échéance de contrat</div><div class="cell"><span class="mark bad">✕</span></div><div class="cell"><span class="mark ok">✓</span></div></div>
    <div class="compare-row"><div class="cell">Coût du service</div><div class="cell">Temps passé à comparer</div><div class="cell">Sur économies réalisées</div></div>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="b2c"`
Expected: PASS (3/3)

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 6: Commit**

```bash
git add b2c.html test/b2c-compare.test.mjs
git commit -m "feat: ajoute la Section 4 (comparatif, copie particuliers) sur b2c.html"
```

---

### Task 7: `comment-ca-marche.html` — Section 5 (widget console autonome)

**Files:**
- Modify: `comment-ca-marche.html`
- Test: `test/comment-ca-marche-console.test.mjs`

**Interfaces:**
- Consumes: `.console-standalone`, `.console-panel`, `.pulse` (Task 1).

- [ ] **Step 1: Write the failing test**

```js
// test/comment-ca-marche-console.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('comment-ca-marche.html', 'utf8');

test('comment-ca-marche.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('comment-ca-marche.html insère le widget console entre les étapes et "Comparer davantage"', () => {
  const source = html();
  const stepsCloseIdx = source.indexOf('</section>', source.indexOf('<section class="steps">'));
  const consoleIdx = source.indexOf('<section class="console-standalone');
  const seoIdx = source.indexOf('<section class="seo-intro">');
  assert.ok(consoleIdx > stepsCloseIdx, 'le widget doit venir après les étapes');
  assert.ok(seoIdx > consoleIdx, '"Comparer davantage" doit venir après le widget');
});

test('le widget console affiche les 4 lignes du gabarit sans étiquette de fraîcheur (décision utilisateur)', () => {
  const source = html();
  assert.match(source, /0,182 €\/kWh/);
  assert.match(source, /−4,2%/);
  assert.match(source, /favorable/);
  assert.match(source, />8\s?216</);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="console"`
Expected: FAIL.

- [ ] **Step 3: Ajouter le `<link>` et insérer la section**

Ajouter avant `<style>` (ligne 30 sur `origin/main`) :

```html
<link rel="stylesheet" href="assets/chantier-sections.css">
```

Insérer entre `</section>` (fermeture de `.steps`, ligne 275 sur `origin/main`) et `<section class="seo-intro">` (ligne 278 sur `origin/main`) :

```html
<!-- WIDGET MARCHÉ (Chantier MS, Section 5) -->
<section class="console-standalone reveal" style="max-width:1100px;margin:4rem auto">
  <span class="stag">Le marché, en un coup d'œil</span>
  <h2 class="sh2" style="margin-top:1rem;max-width:16ch">Le marché de l'énergie, visible en un coup d'œil</h2>
  <p class="sbody" style="max-width:40ch;margin-top:1rem">Un indicateur pour situer votre contrat dans le marché.</p>
  <div class="console-panel">
    <div class="row"><span class="k"><span class="pulse"></span>Prix marché — élec. pro</span><span class="v">0,182 €/kWh</span></div>
    <div class="row"><span class="k">Évolution 30 jours</span><span class="v up">−4,2%</span></div>
    <div class="row"><span class="k">Fenêtre de négociation</span><span class="v">favorable</span></div>
    <div class="row"><span class="k">Contrats suivis</span><span class="v">8 216</span></div>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="console"`
Expected: PASS (3/3)

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 6: Commit**

```bash
git add comment-ca-marche.html test/comment-ca-marche-console.test.mjs
git commit -m "feat: ajoute la Section 5 (widget marché) sur comment-ca-marche.html"
```

---

### Task 8: `resultats.html` — Section 3 (grille de résultats par secteur)

**Files:**
- Modify: `resultats.html`
- Test: `test/resultats-cases-grid.test.mjs`

**Interfaces:**
- Consumes: `.cases-grid-3`, `.case-card`, `.logo-ph`, `.sample-tag` (Task 1).

- [ ] **Step 1: Write the failing test**

```js
// test/resultats-cases-grid.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('resultats.html', 'utf8');

test('resultats.html charge le CSS partagé chantier-sections.css', () => {
  assert.match(html(), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/);
});

test('resultats.html insère la grille de résultats entre "méthode structurée" et "économies adaptées"', () => {
  const source = html();
  const seoCloseIdx = source.indexOf('</section>', source.indexOf('<section class="seo-intro">'));
  const casesIdx = source.indexOf('<div class="cases-grid-3">');
  const valsIdx = source.indexOf('<section class="vals">');
  assert.ok(casesIdx > seoCloseIdx, 'la grille de résultats doit venir après "méthode structurée"');
  assert.ok(valsIdx > casesIdx, '"économies adaptées" doit venir après la grille de résultats');
});

test('la grille de résultats affiche le badge et les 3 cas sectoriels du gabarit', () => {
  const source = html();
  assert.match(source, /gabarit — données d'exemple/);
  assert.match(source, /−21%/);
  assert.match(source, /−17%/);
  assert.match(source, /−19%/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="resultats"`
Expected: FAIL.

- [ ] **Step 3: Ajouter le `<link>` et insérer la section**

Ajouter avant `<style>` (ligne 30 sur `origin/main`) :

```html
<link rel="stylesheet" href="assets/chantier-sections.css">
```

Insérer entre `</section>` (fermeture de `.seo-intro`, ligne 285 sur `origin/main`) et `<section class="vals">` (ligne 288 sur `origin/main`) :

```html
<!-- RÉSULTATS PAR SECTEUR (Chantier MS, Section 3) -->
<section class="cases-section" style="padding:6rem 5vw;max-width:1100px;margin:0 auto">
  <div class="cases-head reveal">
    <div>
      <h2 class="sh2">Ce que la négociation change, secteur par secteur</h2>
    </div>
    <span class="sample-tag">gabarit — données d'exemple</span>
  </div>
  <div class="cases-grid-3">
    <div class="case-card reveal">
      <p class="sector">Restauration · 14 sites</p>
      <p class="delta">−21%</p>
      <p class="desc">sur la part énergie du compte d'exploitation, après remise en concurrence des contrats électricité.</p>
      <div class="foot"><div class="logo-ph">RX</div><span class="sites">Réseau multi-sites</span></div>
    </div>
    <div class="case-card reveal d1">
      <p class="sector">Industrie agroalimentaire</p>
      <p class="delta">−17%</p>
      <p class="desc">de facture gaz sur un site de production, contrat renégocié 4 mois avant échéance.</p>
      <div class="foot"><div class="logo-ph">IA</div><span class="sites">Site unique</span></div>
    </div>
    <div class="case-card reveal d2">
      <p class="sector">Commerce de détail</p>
      <p class="delta">−19%</p>
      <p class="desc">sur l'ensemble du parc, avec un interlocuteur unique pour 22 points de vente.</p>
      <div class="foot"><div class="logo-ph">CD</div><span class="sites">22 sites</span></div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="resultats"`
Expected: PASS (3/3)

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 6: Commit**

```bash
git add resultats.html test/resultats-cases-grid.test.mjs
git commit -m "feat: ajoute la Section 3 (résultats par secteur) sur resultats.html"
```

---

### Task 9: Section 7 — effet bouton "aurora" sur tous les CTA existants

**Files:**
- Modify: `index.html`, `b2b.html`, `b2c.html`, `comment-ca-marche.html`, `resultats.html`, `blog.html`, `ms-blog-article-1.html`, `ms-blog-article-2.html`, `ms-blog-barometre-2022.html`, `ms-blog-barometre-2023.html`, `ms-blog-barometre-2024.html`, `ms-blog-barometre-2025.html`, `ms-blog-barometre-2026-t1.html`, `ms-blog-barometre-2026-t2.html`, `ms-blog-barometre-2026-t3.html`
- Test: `test/btn-aurora-rollout.test.mjs`

**Interfaces:**
- Consumes: `.btn-aurora` (Task 1).

**Note de portée** : la spec approuvée dit "Section 7 appliqué globalement... sur les boutons CTA existants" sans exclure les boutons situés dans un hero. C'est un ajout de classe CSS (effet de survol) sur un bouton qui existe déjà, pas une restructuration du hero — traité ici comme conforme à la contrainte "heros non touchés", qui visait le remplacement de contenu (Section 1), pas un hover CSS sur un bouton existant. Classes ciblées, confirmées par grep sur `origin/main` : `.pcta` (hero panels index/b2b/b2c), `.cta-btn` (bandes CTA index, bouton "Transmettre ma facture" des pages articles), `.ncta` (nav "Étude gratuite" — index/b2b/b2c/comment-ca-marche/resultats/blog), `.ccb-btn` (bande carrières index), `.nav-cta` (nav des pages articles, classe distincte de `.ncta`).

- [ ] **Step 1: Write the failing test**

```js
// test/btn-aurora-rollout.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const AURORA_TARGET_CLASSES = ['pcta', 'cta-btn', 'ncta', 'ccb-btn', 'nav-cta'];
const PAGES = [
  'index.html', 'b2b.html', 'b2c.html', 'comment-ca-marche.html', 'resultats.html',
  'blog.html',
  'ms-blog-article-1.html', 'ms-blog-article-2.html',
  'ms-blog-barometre-2022.html', 'ms-blog-barometre-2023.html', 'ms-blog-barometre-2024.html',
  'ms-blog-barometre-2025.html', 'ms-blog-barometre-2026-t1.html', 'ms-blog-barometre-2026-t2.html',
  'ms-blog-barometre-2026-t3.html',
];

test('chaque bouton CTA existant (pcta/cta-btn/ncta/ccb-btn/nav-cta) porte aussi btn-aurora', () => {
  for (const page of PAGES) {
    const source = readFileSync(page, 'utf8');
    const classAttrRe = /class="([^"]*)"/g;
    let match;
    let checkedAny = false;
    while ((match = classAttrRe.exec(source)) !== null) {
      const classes = match[1].split(/\s+/);
      if (classes.some(c => AURORA_TARGET_CLASSES.includes(c))) {
        checkedAny = true;
        assert.ok(classes.includes('btn-aurora'), `${page}: "${match[1]}" doit aussi porter btn-aurora`);
      }
    }
    assert.ok(checkedAny, `${page}: aucun bouton CTA connu trouvé — vérifier la liste AURORA_TARGET_CLASSES`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="btn-aurora"`
Expected: FAIL — `assert.ok(classes.includes('btn-aurora'))` échoue sur le premier bouton trouvé.

- [ ] **Step 3: Appliquer la classe sur les 15 pages**

```bash
python3 - <<'PYEOF'
import re

files = [
  'index.html', 'b2b.html', 'b2c.html', 'comment-ca-marche.html', 'resultats.html',
  'blog.html',
  'ms-blog-article-1.html', 'ms-blog-article-2.html',
  'ms-blog-barometre-2022.html', 'ms-blog-barometre-2023.html', 'ms-blog-barometre-2024.html',
  'ms-blog-barometre-2025.html', 'ms-blog-barometre-2026-t1.html', 'ms-blog-barometre-2026-t2.html',
  'ms-blog-barometre-2026-t3.html',
]
targets = {'pcta', 'cta-btn', 'ncta', 'ccb-btn', 'nav-cta'}

def add_aurora(m):
    classes = m.group(1).split()
    if targets & set(classes) and 'btn-aurora' not in classes:
        classes.append('btn-aurora')
    return 'class="' + ' '.join(classes) + '"'

for f in files:
    with open(f, encoding='utf8') as fh:
        original = fh.read()
    updated = re.sub(r'class="([^"]*)"', add_aurora, original)
    if updated != original:
        with open(f, 'w', encoding='utf8') as fh:
            fh.write(updated)
        print(f"updated {f}")
    else:
        print(f"NO CHANGE {f} — vérifier manuellement")
PYEOF
```

Vérifier que la sortie ne contient aucune ligne `NO CHANGE` — sinon inspecter ce fichier manuellement (bouton avec une classe non listée, ou déjà à jour).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="btn-aurora"`
Expected: PASS (1/1)

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 6: Commit**

```bash
git add index.html b2b.html b2c.html comment-ca-marche.html resultats.html blog.html \
  ms-blog-article-1.html ms-blog-article-2.html \
  ms-blog-barometre-2022.html ms-blog-barometre-2023.html ms-blog-barometre-2024.html \
  ms-blog-barometre-2025.html ms-blog-barometre-2026-t1.html ms-blog-barometre-2026-t2.html \
  ms-blog-barometre-2026-t3.html test/btn-aurora-rollout.test.mjs
git commit -m "feat: applique l'effet bouton aurora (Section 7) aux CTA existants sur tout le site"
```

---

### Task 10: `blog.html` — vignette photo sur les 9 cartes article

**Files:**
- Modify: `blog.html`
- Test: `test/blog-thumbnails.test.mjs`

**Interfaces:**
- Consumes: `.photo-ph`, `.blog-thumb` (Task 1).

- [ ] **Step 1: Write the failing test**

```js
// test/blog-thumbnails.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = () => readFileSync('blog.html', 'utf8');

test('blog.html ajoute une vignette photo sur chacune des 9 cartes article', () => {
  const source = html();
  const count = (source.match(/<div class="photo-ph blog-thumb">/g) || []).length;
  assert.equal(count, 9, 'les 9 cartes .res-card doivent recevoir une vignette photo');
});

test('chaque vignette précède le res-tag de sa carte', () => {
  const source = html();
  // (?! tool-card) exclut la 10e carte .res-card de blog.html, le lien
  // "Outil interactif" vers ms-strategy-calculateur.html — ce n'est pas un
  // article, il ne reçoit pas de photo (portée : "une photo par article").
  const cardRe = /<a href="[^"]+" class="res-card(?! tool-card)[^"]*">/g;
  let match;
  let checked = 0;
  while ((match = cardRe.exec(source)) !== null) {
    const cardStart = match.index;
    const nextTagIdx = source.indexOf('res-tag', cardStart);
    const thumbIdx = source.indexOf('photo-ph blog-thumb', cardStart);
    assert.ok(thumbIdx > -1 && thumbIdx < nextTagIdx, `carte à l'offset ${cardStart} doit avoir sa vignette avant res-tag`);
    checked++;
  }
  assert.equal(checked, 9);
});

test('blog.html observe .photo-ph dans son reveal scroll', () => {
  assert.match(html(), /document\.querySelectorAll\('\.reveal,\s*\.photo-ph'\)\.forEach\(el => obs\.observe\(el\)\);/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="blog.html"`
Expected: FAIL.

- [ ] **Step 3: Insérer les vignettes**

```bash
python3 - <<'PYEOF'
import re

with open('blog.html', encoding='utf8') as fh:
    html = fh.read()

pattern = re.compile(r'(<a href="[^"]+" class="res-card(?! tool-card)[^"]*">\n)(\s*)(<span class="res-tag">)')

def insert_thumb(m):
    indent = m.group(2)
    return (
        m.group(1)
        + indent + '<div class="photo-ph blog-thumb"><span class="dot-grid"></span></div>\n'
        + indent + m.group(3)
    )

new_html, n = pattern.subn(insert_thumb, html)
assert n == 9, f"expected 9 replacements, got {n}"

with open('blog.html', 'w', encoding='utf8') as fh:
    fh.write(new_html)
print(f"inserted {n} thumbnails")
PYEOF
```

- [ ] **Step 4: Étendre le reveal observer**

Dans `blog.html`, remplacer :

```js
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
```

par :

```js
document.querySelectorAll('.reveal, .photo-ph').forEach(el => obs.observe(el));
```

**Correctif post-revue (whole-branch review)** : ce plan original omettait un `<link rel="stylesheet" href="assets/chantier-sections.css">` dans `<head>` de `blog.html`, contrairement aux 14 autres pages touchées par ce chantier qui l'ont chacune ajouté dans leur propre tâche. Sans ce lien, les 9 vignettes insérées ici (et la classe `btn-aurora` de la Task 9 sur le bouton nav de cette page) étaient sans style. Ajouté lors de la revue finale de branche, avec une assertion dans `test/blog-thumbnails.test.mjs`. C'est la 4e lacune de ce type détectée sur ce projet.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="blog.html"`
Expected: PASS (3/3)

- [ ] **Step 6: Run full suite**

Run: `npm test`
Expected: tous verts.

- [ ] **Step 7: Commit**

```bash
git add blog.html test/blog-thumbnails.test.mjs
git commit -m "feat: ajoute une vignette photo sur les 9 cartes article de blog.html"
```

---

### Task 11: 9 pages article — bannière photo dans l'en-tête

**Files:**
- Modify: `ms-blog-article-1.html`, `ms-blog-article-2.html`, `ms-blog-barometre-2022.html`, `ms-blog-barometre-2023.html`, `ms-blog-barometre-2024.html`, `ms-blog-barometre-2025.html`, `ms-blog-barometre-2026-t1.html`, `ms-blog-barometre-2026-t2.html`, `ms-blog-barometre-2026-t3.html`
- Test: `test/blog-article-banners.test.mjs`

**Interfaces:**
- Consumes: `.photo-ph`, `.article-banner` (Task 1).

**Note** : `<header class="hero">` sur ces pages désigne le masthead de l'article (titre + stats), pas le hero principal du site protégé par la contrainte "pas de remplacement de hero" — on y ajoute une bannière, on ne le restructure pas.

Ces pages utilisent un mécanisme de reveal différent des pages principales (`classList.add('visible')`, pas `'in'`) — `.photo-ph.in` ne se déclencherait donc jamais via leur observer existant. Un observer dédié, séparé, est ajouté pour `.photo-ph` sur chaque page.

- [ ] **Step 1: Write the failing test**

```js
// test/blog-article-banners.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ARTICLES = [
  'ms-blog-article-1.html', 'ms-blog-article-2.html',
  'ms-blog-barometre-2022.html', 'ms-blog-barometre-2023.html', 'ms-blog-barometre-2024.html',
  'ms-blog-barometre-2025.html', 'ms-blog-barometre-2026-t1.html', 'ms-blog-barometre-2026-t2.html',
  'ms-blog-barometre-2026-t3.html',
];

test('chaque page article charge le CSS partagé chantier-sections.css', () => {
  for (const page of ARTICLES) {
    assert.match(readFileSync(page, 'utf8'), /<link rel="stylesheet" href="assets\/chantier-sections\.css">/, `${page} doit charger chantier-sections.css`);
  }
});

test('chaque page article insère une bannière photo avant .article-meta, dans le header hero', () => {
  for (const page of ARTICLES) {
    const source = readFileSync(page, 'utf8');
    const headerIdx = source.indexOf('<header class="hero">');
    assert.ok(headerIdx > -1, `${page}: header hero introuvable`);
    const bannerIdx = source.indexOf('<div class="photo-ph article-banner">', headerIdx);
    const metaIdx = source.indexOf('<div class="article-meta">', headerIdx);
    assert.ok(bannerIdx > headerIdx && bannerIdx < metaIdx, `${page}: la bannière doit être entre <header class="hero"> et .article-meta`);
  }
});

test('chaque page article observe .photo-ph via un observer dédié (classe .in)', () => {
  for (const page of ARTICLES) {
    const source = readFileSync(page, 'utf8');
    assert.match(source, /document\.querySelectorAll\('\.photo-ph'\)\.forEach\(el => photoObs\.observe\(el\)\);/, `${page} doit observer .photo-ph`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="article"`
Expected: FAIL.

- [ ] **Step 3: Insérer la bannière et le `<link>` sur les 9 pages**

```bash
python3 - <<'PYEOF'
import re

files = [
  'ms-blog-article-1.html', 'ms-blog-article-2.html',
  'ms-blog-barometre-2022.html', 'ms-blog-barometre-2023.html', 'ms-blog-barometre-2024.html',
  'ms-blog-barometre-2025.html', 'ms-blog-barometre-2026-t1.html', 'ms-blog-barometre-2026-t2.html',
  'ms-blog-barometre-2026-t3.html',
]

header_pattern = re.compile(r'(<header class="hero">\n)(\s*)(<div class="article-meta">)')
style_pattern = re.compile(r'(<style>)')

for f in files:
    with open(f, encoding='utf8') as fh:
        html = fh.read()

    def insert_banner(m):
        indent = m.group(2)
        return (
            m.group(1)
            + indent + '<div class="photo-ph article-banner"><span class="dot-grid"></span></div>\n'
            + indent + m.group(3)
        )

    new_html, n_banner = header_pattern.subn(insert_banner, html)
    assert n_banner == 1, f"{f}: expected 1 banner insertion, got {n_banner}"

    new_html, n_link = style_pattern.subn(
        '<link rel="stylesheet" href="assets/chantier-sections.css">\n\\1', new_html, count=1
    )
    assert n_link == 1, f"{f}: expected 1 <style> tag to anchor the <link>, got {n_link}"

    with open(f, 'w', encoding='utf8') as fh:
        fh.write(new_html)
    print(f"updated {f}")
PYEOF
```

- [ ] **Step 4: Ajouter l'observer dédié `.photo-ph` sur les 9 pages**

Dans chaque fichier, juste après le bloc existant :

```js
const revealEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: 0.1 });
revealEls.forEach(el => revObs.observe(el));
```

ajouter :

```js
const photoObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); photoObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.photo-ph').forEach(el => photoObs.observe(el));
```

(Vérifier au préalable, par `grep -n "revealEls = document.querySelectorAll" <fichier>`, que le bloc existe bien à l'identique sur les 9 pages avant d'automatiser cette édition — sinon l'ajouter manuellement fichier par fichier avec le même bloc.)

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="article"`
Expected: PASS (3/3)

- [ ] **Step 6: Run full suite**

Run: `npm test`
Expected: tous verts (aucune régression sur les tests existants des pages articles, ex. compteurs animés `.stat-num`).

- [ ] **Step 7: Commit**

```bash
git add ms-blog-article-1.html ms-blog-article-2.html \
  ms-blog-barometre-2022.html ms-blog-barometre-2023.html ms-blog-barometre-2024.html \
  ms-blog-barometre-2025.html ms-blog-barometre-2026-t1.html ms-blog-barometre-2026-t2.html \
  ms-blog-barometre-2026-t3.html test/blog-article-banners.test.mjs
git commit -m "feat: ajoute une bannière photo en en-tête des 9 pages article de blog"
```

---

## Self-Review

**Couverture de la spec** : les 6 sections du gabarit (2,3,4,5,6,7 — Section 1 exclue) sont couvertes (Tasks 2-9), le traitement photo des 9 articles + blog.html est couvert (Tasks 10-11), le fichier CSS partagé évite la duplication sur 15 pages (Task 1), les chiffres du gabarit sont repris tels quels avec leur badge (Tasks 3, 4, 8), le widget console est repris sans étiquette de fraîcheur (Task 7) — tout conforme aux décisions explicites de la spec.

**Placeholders** : aucun "TBD"/"TODO" — la seule zone d'incertitude assumée est la Task 11 Step 4 (vérifier la structure identique sur les 9 pages avant scripter), explicitement signalée avec la commande de vérification à faire avant d'agir, pas laissée en blanc.

**Cohérence des types/sélecteurs** : `.photo-ph` (classe de base, Task 1) est réutilisé identiquement dans `.mirror-row .visual .photo-ph` (Task 3), `.blog-thumb` (Task 10) et `.article-banner` (Task 11) — mêmes noms partout. `AURORA_TARGET_CLASSES` (Task 9) est cohérent avec les classes CTA confirmées par grep sur chaque page concernée.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-14-chantier-ms-sections-photo.md`. Deux options d'exécution :

**1. Subagent-Driven (recommandé)** — je dépêche un sous-agent frais par tâche, avec relecture entre chaque, itération rapide.

**2. Exécution en ligne** — j'exécute les tâches dans cette session avec `executing-plans`, par lots avec points de contrôle.

Laquelle préfères-tu ?
