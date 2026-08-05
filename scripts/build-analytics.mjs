// Construit assets/analytics.js a partir de src/analytics.js.
//
// La sortie est commitee : le site est deployé en statique par Vercel, sans
// etape de build. Apres toute modification de src/, relancer
// `npm run build:analytics` et commiter le resultat — test/analytics-build.
// test.mjs echoue si les deux divergent.

import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const BANNER = '/* GENERE par `npm run build:analytics` — ne pas editer. Source : src/analytics.js */';

export async function buildAnalytics(outfile) {
  await esbuild.build({
    entryPoints: ['src/analytics.js'],
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
  await buildAnalytics('assets/analytics.js');
}
