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
