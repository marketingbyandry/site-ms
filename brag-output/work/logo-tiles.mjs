import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const logos = [['Logo_METEnergie.png.webp','metenergie'],['Logo_OHM_Energie.png','ohm'],['Logo_Alterna.webp','alterna'],['engie-logo.png','engie'],['GazelEnergie.png','gazel'],['TotalEnergies.png','totalenergies'],['PICOTY.png.png','picoty'],['Logo_Primeo.webp','primeo']];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 400, height: 200 }, deviceScaleFactor: 2 });
for (const [f, n] of logos) {
  await p.setContent(`<html><body style="margin:0;background:transparent">
  <div id="t" style="width:360px;height:120px;background:#fff;border-radius:18px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:22px 36px">
  <img src="http://localhost:8765/assets/${f}" style="max-width:100%;max-height:100%;object-fit:contain"></div></body></html>`);
  await p.waitForLoadState('networkidle');
  await p.locator('#t').screenshot({ path: `brag-output/work/logos/${n}.png`, omitBackground: true });
}
await b.close();
