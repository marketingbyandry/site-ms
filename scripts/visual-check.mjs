// Contrôle visuel des pages clés dans un vrai navigateur (Chromium via Playwright).
// Usage : node scripts/visual-check.mjs [dossier-captures]
// Vérifie en mobile (390px) et desktop (1440px) : scroll horizontal, images cassées,
// erreurs JavaScript. Sort en code 1 si un problème est trouvé.
// Le débordement est mesuré via scrollWidth : Chrome le masque avec body{overflow-x:hidden},
// mais iOS Safari laisse quand même glisser la page (cf. PR #86).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, readFile } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] ?? join(ROOT, '.audit-captures');
const PAGES = ['index.html', 'b2b.html', 'b2c.html', 'blog.html', 'comment-ca-marche.html', 'resultats.html', 'barometre-energie.html', 'ms-strategy-calculateur.html'];
const VIEWPORTS = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require('playwright'); } catch {}
  const globalRoot = execSync('npm root -g').toString().trim();
  return createRequire(join(globalRoot, 'noop.js'))('playwright');
}

// Serveur HTTP local : en file://, le navigateur applique d'autres règles de sécurité (faux positifs).
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.mp4': 'video/mp4' };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '') || 'index.html';
  if (path.startsWith('..')) { res.writeHead(403).end(); return; }
  readFile(join(ROOT, path), (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(data);
  });
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch(process.env.PLAYWRIGHT_BROWSERS_PATH ? {} : { executablePath: '/opt/pw-browsers/chromium' });
mkdirSync(OUT, { recursive: true });
const problems = new Set();

for (const [label, viewport] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext({ viewport });
  for (const page of PAGES) {
    const tab = await context.newPage();
    const errors = [];
    tab.on('pageerror', (e) => errors.push(e.message));
    await tab.goto(BASE + page, { waitUntil: 'load', timeout: 20_000 }).catch(() => {});
    await tab.waitForTimeout(800);
    const r = await tab.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src.startsWith(location.origin)).map((i) => i.getAttribute('src')),
    }));
    if (r.overflow > 1) problems.add(`${page} [${label}] : contenu plus large que l'écran de ${r.overflow}px (scroll horizontal possible sur iOS Safari)`);
    for (const src of r.brokenImages) problems.add(`${page} [${label}] : image cassée ${src}`);
    for (const e of errors) problems.add(`${page} [${label}] : erreur JS « ${e.slice(0, 120)} »`);
    await tab.screenshot({ path: join(OUT, `${page.replace('.html', '')}-${label}.png`) });
    await tab.close();
  }
  await context.close();
}
await browser.close();
server.close();

console.log(`# Contrôle visuel — ${PAGES.length} pages × ${Object.keys(VIEWPORTS).length} formats`);
console.log(problems.size ? [...problems].map((p) => `- ${p}`).join('\n') : '- Rien à signaler');
console.log(`\nCaptures : ${OUT}`);
process.exitCode = problems.size ? 1 : 0;
