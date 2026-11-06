import { spawn } from 'node:child_process';
import { mkdir, stat, rename } from 'node:fs/promises';
import path from 'node:path';
import { once } from 'node:events';
import ffmpegStatic from 'ffmpeg-static';
import { createPreviewServer, PROMO_ROOT } from './serve.mjs';
import { launchFilmBrowser, monitorPage, prepareFilmPage, seekFrame } from './browser.mjs';

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

async function main() {
  const fps = Number(argument('fps', 30));
  const width = Number(argument('width', 1080));
  const height = width * 16 / 9;
  if (![30, 60].includes(fps)) throw new Error('--fps must be 30 or 60.');
  if (!Number.isInteger(width) || width < 180 || width > 2160 || width % 2 || !Number.isInteger(height) || height % 2) {
    throw new Error('--width must give an even 9:16 size, e.g. 360, 540, 720, 1080, or 2160.');
  }
  const silent = process.argv.includes('--silent');
  const workers = Number(argument('workers', 2));
  if (!Number.isInteger(workers) || workers < 1 || workers > 4) throw new Error('--workers must be 1–4.');
  const audioPath = path.join(PROMO_ROOT, 'assets', 'soundtrack.wav');
  if (!silent) {
    try {
      if ((await stat(audioPath)).size < 44) throw new Error('Empty WAV');
    } catch {
      throw new Error('Run npm run audio first to generate assets/soundtrack.wav, or pass --silent.');
    }
  }
  const output = path.resolve(PROMO_ROOT, argument('output', `output/CardShare-${width}x${height}-${fps}fps.mp4`));
  const temporary = `${output}.partial.mp4`;
  await mkdir(path.dirname(output), { recursive: true });
  const ffmpeg = process.env.FFMPEG_PATH || ffmpegStatic;
  if (!ffmpeg) throw new Error('FFmpeg not found. Install dependencies or set FFMPEG_PATH.');

  let preview, browser, encoder;
  let encoderDone;
  let encoderError = '';
  try {
    preview = await createPreviewServer({ port: 0 });
    browser = await launchFilmBrowser();
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: 'dark' });
    const errors = monitorPage(page);
    const duration = await prepareFilmPage(page, preview.origin);
    const capturePages = [page];
    const captureErrors = [errors];
    for (let i=1;i<workers;i++) {
      const next=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:'dark'});
      captureErrors.push(monitorPage(next));
      await prepareFilmPage(next,preview.origin);capturePages.push(next);
    }
    const sessions=await Promise.all(capturePages.map(p=>p.context().newCDPSession(p)));
    const box = await page.locator('#film').boundingBox();
    if (!box || Math.abs(box.width - width) > 1 || Math.abs(box.height - height) > 1) {
      throw new Error(`Capture frame must fill ${width}×${height}; got ${JSON.stringify(box)}.`);
    }
    if (errors.length) throw new Error(`Browser failed: ${errors.join('\n')}`);
    const args = [
      '-hide_banner', '-loglevel', 'warning', '-y',
      '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'png', '-i', 'pipe:0',
      ...(!silent ? ['-i', audioPath] : []),
      '-map', '0:v:0', ...(!silent ? ['-map', '1:a:0'] : []),
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
      '-r', String(fps), '-threads', '4', '-color_primaries', 'bt709',
      '-color_trc', 'bt709', '-colorspace', 'bt709',
      ...(!silent ? ['-c:a', 'aac', '-b:a', '320k', '-ar', '48000'] : ['-an']),
      '-t', String(duration), '-movflags', '+faststart', temporary,
    ];
    encoder = spawn(ffmpeg, args, { stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true });
    encoder.stderr.on('data', (chunk) => { encoderError = (encoderError + chunk.toString()).slice(-12_000); });
    // Both child and stdin errors are handled so a failed encoder cannot crash Node
    // with an unhandled EPIPE while the browser is rendering its next frame.
    let pipeError;
    encoder.stdin.on('error', (error) => { pipeError = error; });
    encoderDone = new Promise((resolve, reject) => {
      encoder.once('error', reject);
      encoder.once('close', (code) => code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}: ${encoderError}`)));
    });
    encoderDone.catch(() => {});
    const total = Math.round(duration * fps);
    console.log(`Rendering ${total} exact frames at ${width}×${height}, ${fps} fps…`);
    for (let batch = 0; batch < total; batch += workers) {
      if (pipeError || encoder.exitCode !== null) throw pipeError || new Error(`FFmpeg stopped: ${encoderError}`);
      const frames=await Promise.all(capturePages.slice(0,Math.min(workers,total-batch)).map(async(p,index)=>{
        await seekFrame(p,(batch+index)/fps);
        const result=await sessions[index].send('Page.captureScreenshot',{format:'png',optimizeForSpeed:true,fromSurface:true,captureBeyondViewport:false});
        return Buffer.from(result.data,'base64');
      }));
      for(let index=0;index<frames.length;index++){
        const frame=batch+index;
        if(!encoder.stdin.write(frames[index]))await once(encoder.stdin,'drain');
        if(frame===0||(frame+1)%fps===0||frame===total-1)console.log(`${frame+1}/${total} frames (${Math.round((frame+1)/total*100)}%)`);
      }
      const allErrors=captureErrors.flat();
      if (allErrors.length) throw new Error(`Browser failed: ${allErrors.join('\n')}`);
    }
    encoder.stdin.end();
    await encoderDone;
    await rename(temporary, output);
    const info = await stat(output);
    console.log(`Exported: ${output} (${(info.size / 1024 / 1024).toFixed(1)} MB)`);
  } finally {
    if (encoder && encoder.exitCode === null) encoder.kill();
    await browser?.close();
    await preview?.close();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
