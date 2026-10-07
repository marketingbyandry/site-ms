// Génère les deux formats (16:9 et 9:16) à partir de src/template.html.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
const tpl = readFileSync(here + 'src/template.html', 'utf8');
// VOICE=clemence|genevieve génère la variante voix féminine dans landscape-<voix>/ et vertical-<voix>/.
const voice = process.env.VOICE || '';
function stretch(html, k) {
  const ORIGIN = 1.3, BASE_T = 24.3, LOGO = 14.7;
  const T = +(BASE_T + (LOGO - ORIGIN) * (k - 1)).toFixed(2);
  const r2 = (x) => String(+x.toFixed(3));
  const scaled = ['hud', 's1', 's2', 's3', 's4', 's5'];
  const shifted = ['sfx-hook', 'sfx-late', 'sfx-c1', 'sfx-c2', 'sfx-c3', 'sfx-c4', 'sfx-win', 'sfx-logo'];
  for (const id of [...scaled, ...shifted, 's6']) {
    html = html.replace(new RegExp(`(id="${id}"[^>]*?)data-start="([\\d.]+)" data-duration="([\\d.]+)"`), (m, pre, st, du) => {
      const ns = ORIGIN + (+st - ORIGIN) * k;
      const nd = id === 's6' ? T - ns : scaled.includes(id) ? +du * k : +du;
      return `${pre}data-start="${r2(ns)}" data-duration="${r2(nd)}"`;
    });
  }
  html = html.replaceAll('data-duration="24.3"', `data-duration="${T}"`);
  // La musique s'arrête net 8,6 s après l'arrivée du logo, comme dans la version de référence.
  const logo = ORIGIN + (LOGO - ORIGIN) * k;
  html = html.replace('data-media-start="6.7"', `data-media-start="${r2(30 - (logo + 8.6))}"`);
  html = html.replace(/\{"t":19\.2,"v":0\.3\},\{"t":19\.7,"v":0\.75\},\{"t":23\.5,"v":0\.75\},\{"t":24\.3,"v":0\}/,
    `{"t":${r2(logo + 4.5)},"v":0.3},{"t":${r2(logo + 5)},"v":0.75},{"t":${r2(T - 0.8)},"v":0.75},{"t":${T},"v":0}`);
  return html.replace('tl.add(st, 1.3);', `st.timeScale(${r2(1 / k)});\n      tl.add(st, 1.3);`);
}

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
  // Placement de chaque voix alternative (fichiers déjà calés phrase par phrase sur le minutage d'Hugo).
  // stretch : ralentit le récit (tout ce qui suit le hook) pour une voix plus posée.
  const voices = {
    clemence: { start: '1.7', dur: '17.29' },
    genevieve: { start: '1.55', dur: '17.74' },
    'genevieve-expressive': { start: '1.7', dur: '20.17', stretch: 1.2 },
  };
  const v = voices[voice];
  let voiced = v
    ? html.replace('assets/audio/voiceover.mp3" data-start="1.7" data-duration="17.46"', `assets/audio/voiceover-${voice}.mp3" data-start="${v.start}" data-duration="${v.dur}"`)
    : html;
  if (v && v.stretch) voiced = stretch(voiced, v.stretch);
  writeFileSync(out + '/index.html', voiced);
  console.log('built', out.slice(here.length));
}
