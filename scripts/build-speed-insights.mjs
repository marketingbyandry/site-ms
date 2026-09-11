// Construit assets/speed-insights.js a partir de src/speed-insights.js.
//
// La sortie est commitee : le site est deployé en statique par Vercel, sans
// etape de build. Apres toute modification de src/speed-insights.js, relancer
// `npm run build:speed-insights` et commiter le resultat.

import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const BANNER = '/* GENERE par `npm run build:speed-insights` — ne pas editer. Source : src/speed-insights.js */';

export async function buildSpeedInsights(outfile) {
  await esbuild.build({
    entryPoints: ['src/speed-insights.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2017'],
    banner: { js: BANNER },
    outfile,
    logLevel: 'silent'
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildSpeedInsights('assets/speed-insights.js');
}
