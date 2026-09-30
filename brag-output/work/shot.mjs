import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
for (const [u,n] of [['index.html','home'],['ms-strategy-calculateur.html','calc']]) {
  await p.goto('http://localhost:8765/'+u, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  for (let i=0;i<4;i++){ await p.screenshot({ path: `brag-output/work/${n}-${i}.png` }); await p.mouse.wheel(0,900); await p.waitForTimeout(900); }
}
await b.close();
