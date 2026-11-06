import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

function chromeExecutable() {
  if (process.env.CHROME_PATH) {
    if (!fs.existsSync(process.env.CHROME_PATH)) throw new Error('CHROME_PATH does not exist.');
    return process.env.CHROME_PATH;
  }
  const candidates = process.platform === 'win32' ? [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ] : process.platform === 'darwin' ? [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ] : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}

export async function launchFilmBrowser() {
  const softwareGL = process.env.FILM_GPU !== '1';
  return chromium.launch({
    headless: true,
    executablePath: chromeExecutable(),
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--hide-scrollbars',
      ...(softwareGL ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []),
    ],
  });
}

export function monitorPage(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText || 'unknown error';
    // HTMLMediaElement legitimately cancels a byte range during pause/seek or
    // navigation. Do not count that deliberate cancellation as a broken asset.
    if (request.resourceType() === 'media' && failure === 'net::ERR_ABORTED') return;
    if (!request.url().endsWith('/favicon.ico')) errors.push(`Request failed (${failure}): ${request.url()}`);
  });
  return errors;
}

export async function prepareFilmPage(page, origin, { capture = true } = {}) {
  // Media byte ranges can stay active independently of visual readiness.
  await page.goto(`${origin}/${capture ? '?capture=1' : ''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.cardShareFilm?.ready === true, null, { timeout: 90_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    window.cardShareFilm.pause();
    window.cardShareFilm.seek(0);
  });
  const duration = await page.evaluate(() => window.cardShareFilm.duration);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Film API has no valid duration.');
  return duration;
}

export async function seekFrame(page, seconds) {
  await page.evaluate(async (time) => {
    window.cardShareFilm.seek(time);
    // This is a paint barrier, not a playback clock. Exported time stays n/fps.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, seconds);
}
