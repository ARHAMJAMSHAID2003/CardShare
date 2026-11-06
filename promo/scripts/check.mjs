import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createPreviewServer, PROMO_ROOT } from './serve.mjs';
import { launchFilmBrowser, monitorPage, prepareFilmPage, seekFrame } from './browser.mjs';

const TIMES = [0, 1.8, 3.2, 4.9, 6.7, 8.8, 10.8, 13.4, 15.1, 16.9, 18.8, 21.6, 24.9, 28.3, 31.2, 34.5, 36.8, 38.5, 40.5, 43.5];
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');

async function main() {
  const output = path.join(PROMO_ROOT, 'output', 'qa');
  await mkdir(output, { recursive: true });
  let preview, browser;
  try {
    preview = await createPreviewServer({ port: 0 });
    browser = await launchFilmBrowser();
    const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 1 });
    const errors = monitorPage(page);
    const duration = await prepareFilmPage(page, preview.origin);
    const frames = [];
    for (const time of TIMES) {
      await seekFrame(page, time);
      const name = `frame-${time.toFixed(1).replace('.', '-')}.png`;
      await page.locator('#film').screenshot({ path: path.join(output, name) });
      frames.push({ time, name });
      console.log(`Inspected ${time.toFixed(1)}s`);
    }
    await seekFrame(page, 12.8);
    const first = hash(await page.locator('#film').screenshot());
    await seekFrame(page, 22.2);
    await seekFrame(page, 2.3);
    await seekFrame(page, 12.8);
    const second = hash(await page.locator('#film').screenshot());
    const deterministic = first === second;
    const assets = await page.evaluate(() => ({
      brokenImages: [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
      fontsReady: document.fonts.status === 'loaded',
      canvas: [...document.querySelectorAll('#film canvas')].map((canvas) => ({ width: canvas.width, height: canvas.height })),
      scrollWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));

    // Assemble actual captured frames; this is also the visual-review artifact.
    const tiles = frames.map(({ time, name }) => `<figure><img src="./${name}"><figcaption>${time.toFixed(1)}s</figcaption></figure>`).join('');
    const sheet = `<!doctype html><meta charset="utf-8"><title>CardShare timeline review</title><style>*{box-sizing:border-box}body{margin:0;padding:18px;background:#151819;color:#dce9e1;font:12px system-ui}header{display:flex;justify-content:space-between;align-items:center;margin:0 0 14px}h1{font-size:18px;font-weight:500;margin:0}.grid{display:grid;grid-template-columns:repeat(6,180px);gap:12px}figure{margin:0}img{width:180px;height:320px;object-fit:contain;display:block}figcaption{padding:6px 0;color:#93a69b}</style><header><h1>CardShare · motion review</h1><span>24 seconds / exact master-clock samples</span></header><div class="grid">${tiles}</div>`;
    await writeFile(path.join(output, 'contact-sheet.html'), sheet.replace('24 seconds / exact master-clock samples',`${duration} seconds / exact master-clock samples`));
    const sheetPage = await browser.newPage({ viewport: { width: 1176, height: 1160 }, deviceScaleFactor: 1 });
    await sheetPage.goto(`${preview.origin}/output/qa/contact-sheet.html`);
    await sheetPage.screenshot({ path: path.join(output, 'contact-sheet.png'), fullPage: true });

    const player = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const playerErrors = monitorPage(player);
    await prepareFilmPage(player, preview.origin, { capture: false });
    const controls = {};
    const replay = player.locator('#replay');
    const play = player.locator('#play-toggle');
    const scrubber = player.locator('#scrubber');
    if (await scrubber.count()) {
      await scrubber.evaluate((input) => {
        input.value = '13.2';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      controls.scrub = Math.abs(await player.evaluate(() => window.cardShareFilm.time) - 13.2) < 0.05;
    } else controls.scrub = false;
    if (await play.count()) {
      await play.click();
      await player.waitForTimeout(250);
      const moving = await player.evaluate(() => window.cardShareFilm.time);
      await play.click();
      const stopped = await player.evaluate(() => window.cardShareFilm.time);
      await player.waitForTimeout(180);
      controls.playPause = moving > 13.2 && Math.abs(await player.evaluate(() => window.cardShareFilm.time) - stopped) < 0.02;
    } else controls.playPause = false;
    if (await replay.count()) {
      await replay.click();
      controls.replay = await player.evaluate(() => window.cardShareFilm.time) < 0.3;
      await player.evaluate(() => window.cardShareFilm.pause());
    } else controls.replay = false;
    await seekFrame(player, 12.8);
    await player.screenshot({ path: path.join(output, 'desktop-player.png') });
    await player.setViewportSize({ width: 390, height: 844 });
    await player.screenshot({ path: path.join(output, 'mobile-player.png') });
    const mobileOverflow = await player.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    const allErrors = [...errors, ...playerErrors];
    const report = {
      duration, keyframes: TIMES, deterministicSeek: deterministic,
      assets, controls, mobileOverflow, browserErrors: allErrors,
      passed: duration === 44 && deterministic && !assets.brokenImages.length
        && assets.fontsReady && assets.canvas.length > 0 && assets.canvas.every((c) => c.width && c.height)
        && assets.scrollWidth <= assets.viewport + 1 && !mobileOverflow
        && Object.values(controls).every(Boolean) && !allErrors.length,
      note: 'Contact-sheet and player PNGs require human visual review for typography, transitions, and composition.',
    };
    await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    console.log(`Visual review: ${path.join(output, 'contact-sheet.png')}`);
    if (!report.passed) process.exitCode = 1;
  } finally {
    await browser?.close();
    await preview?.close();
  }
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
