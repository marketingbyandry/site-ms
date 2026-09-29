import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('http://localhost:8765/brag-output/work/composition.html', { waitUntil: 'networkidle' });
await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
const ts = process.argv.slice(2).map(Number);
for (const t of ts) { await p.evaluate(t=>window.render(t), t); await p.screenshot({ path: 'still-'+t.toFixed(2)+'.jpg', type:'jpeg', quality:80 }); }
await b.close();
