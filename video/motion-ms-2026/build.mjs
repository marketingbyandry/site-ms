// Génère les deux formats (16:9 et 9:16) à partir de src/template.html.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
const tpl = readFileSync(here + 'src/template.html', 'utf8');
// VOICE=clemence génère la variante voix féminine dans landscape-clemence/ et vertical-clemence/.
const voice = process.env.VOICE || '';
const formats = [
  { dir: 'landscape', W: 1920, H: 1080, ORI: '16:9', cls: '', v: 'false' },
  { dir: 'vertical', W: 1080, H: 1920, ORI: '9:16', cls: 'v', v: 'true' },
];
for (const f of formats) {
  const out = here + f.dir + (voice ? '-' + voice : '');
  rmSync(out + '/assets', { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(here + 'src/assets', out + '/assets', { recursive: true });
  const html = tpl.replaceAll('{{W}}', f.W).replaceAll('{{H}}', f.H).replaceAll('{{ORI}}', f.ORI)
    .replaceAll('{{ORI_CLASS}}', f.cls).replaceAll('{{IS_V}}', f.v);
  const voiced = voice
    ? html.replace('assets/audio/voiceover.mp3" data-start="1.7" data-duration="17.46"', `assets/audio/voiceover-${voice}.mp3" data-start="1.7" data-duration="17.29"`)
    : html;
  writeFileSync(out + '/index.html', voiced);
  console.log('built', out.slice(here.length));
}
