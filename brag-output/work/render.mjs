import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
const FPS=30, DUR=21, N=FPS*DUR;
const ff = spawn('/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2', ['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
  '-i','music.wav','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-profile:v','high',
  '-af','loudnorm=I=-14:TP=-1.5:LRA=9','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','-shortest','video.mp4'], { stdio:['pipe','inherit','inherit'] });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('http://localhost:8765/brag-output/work/composition.html', { waitUntil: 'networkidle' });
await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
for (let i=0;i<N;i++){
  await p.evaluate(t=>window.render(t), i/FPS);
  const buf = await p.screenshot({ type:'jpeg', quality:95 });
  if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
  if(i%90===0) console.log('frame',i);
}
ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close();
