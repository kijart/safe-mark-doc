// Generates the app screenshots: the ones in the manifest and the link preview image (src/screenshots/), the welcome
// screen image (src/img/), and the README ones (docs/screenshots/).
// The document is an invented sample ID card drawn here, and the date and trace code are fixed, so the images
// only change when the UI does.
// Usage: npm install --no-save playwright-core && node tools/make-screenshots.mjs (uses the installed Google Chrome)
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = new URL('../src/', import.meta.url);
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png',
};
const DATE = new Date('2026-11-05T10:32:00');

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html');
  try {
    const body = readFileSync(new URL(`.${path}`, ROOT));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

// Same sequence on every run, so the trace code doesn't change.
function fixRandom() {
  let seed = 7;
  crypto.getRandomValues = (array) => {
    for (let i = 0; i < array.length; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      array[i] = seed >>> 16 & 255; // the low bits of this generator repeat
    }
    return array;
  };
}

// Invented ID card ("Mark Safely"), drawn in the page and returned as PNG bytes.
async function drawCard() {
  const c = new OffscreenCanvas(1600, 1000);
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 1600, 1000);
  bg.addColorStop(0, '#e6edf5');
  bg.addColorStop(1, '#f7ebe2');
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(0, 0, 1600, 1000, 48);
  g.fill();
  g.fillStyle = '#1e3a5f';
  g.font = 'bold 68px Helvetica, Arial, sans-serif';
  g.fillText('IDENTITY CARD', 80, 130);
  g.fillStyle = '#4b5563';
  g.font = '30px Helvetica, Arial, sans-serif';
  g.fillText('SPECIMEN · SAMPLE DOCUMENT', 80, 180);
  g.fillStyle = '#c7d3e0';
  g.fillRect(80, 250, 400, 520);
  g.fillStyle = '#8796ab';
  g.beginPath();
  g.arc(280, 430, 110, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(280, 770, 190, 210, 0, Math.PI, 0);
  g.fill();
  const fields = [['SURNAME', 'SAFELY'], ['GIVEN NAMES', 'MARK'], ['DATE OF BIRTH', '01 01 1990'], ['DOCUMENT NO.', 'X0000000']];
  fields.forEach(([label, value], i) => {
    const y = 290 + i * 125;
    g.fillStyle = '#4b5563';
    g.font = '28px Helvetica, Arial, sans-serif';
    g.fillText(label, 560, y);
    g.fillStyle = '#111827';
    g.font = `bold ${i < 2 ? 52 : 42}px Helvetica, Arial, sans-serif`;
    g.fillText(value, 560, y + 55);
  });
  g.fillStyle = '#1f2937';
  g.font = '36px Courier New, monospace';
  g.fillText('IDXSPECIMEN<<<<<<<<SAFELY<<MARK<<<<', 80, 920);
  const blob = await c.convertToBlob({ type: 'image/png' });
  return [...new Uint8Array(await blob.arrayBuffer())];
}

// `width` scales the image down, keeping its proportions.
async function toWebp(page, png, { width, quality = 0.9 } = {}) {
  const bytes = await page.evaluate(async ({ data, width, quality }) => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(data)], { type: 'image/png' }));
    const w = width ?? bitmap.width;
    const h = Math.round((bitmap.height * w) / bitmap.width);
    const c = new OffscreenCanvas(w, h);
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(bitmap, 0, 0, w, h);
    const blob = await c.convertToBlob({ type: 'image/webp', quality });
    return [...new Uint8Array(await blob.arrayBuffer())];
  }, { data: [...png], width, quality });
  return Buffer.from(bytes);
}

async function shoot({ colorScheme, width, height, scale, scrollTo }) {
  const context = await browser.newContext({
    colorScheme, locale: 'en-GB', viewport: { width, height }, deviceScaleFactor: scale, serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(DATE);
  await page.addInitScript(fixRandom);
  // The welcome dialog shows on a first visit; the screenshots are of the app behind it.
  await page.addInitScript(() => localStorage.setItem('ms-ui-v1', JSON.stringify({ welcomed: true })));
  await page.goto(url);
  const card = Buffer.from(await page.evaluate(drawCard));
  await page.setInputFiles('#file-input', { name: 'id-card.png', mimeType: 'image/png', buffer: card });
  await page.waitForFunction(() => !document.querySelector('#download-btn').disabled);
  await page.click('[data-preset="identity"]');
  await page.waitForTimeout(500); // let the preview redraw
  // Below the sticky top bar; after the redraw, which changes the page height.
  if (scrollTo) await page.locator(scrollTo).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70));
  const png = await page.screenshot();
  return { png, page, context };
}

const browser = await chromium.launch({ channel: 'chrome' });
const write = (path, data) => {
  const file = new URL(path, new URL('../', import.meta.url));
  mkdirSync(new URL('./', file), { recursive: true });
  writeFileSync(file, data);
  console.log(`wrote ${path} (${Math.round(data.length / 1024)} KB)`);
};

// Manifest screenshots: phone (scrolled to the export options and the preview) and computer.
for (const [name, opts] of [
  ['narrow', { colorScheme: 'light', width: 412, height: 915, scale: 2, scrollTo: 'fieldset:has(input[name="format"])' }],
  ['wide', { colorScheme: 'light', width: 1280, height: 800, scale: 1 }],
]) {
  const { png, context } = await shoot(opts);
  write(`src/screenshots/${name}.png`, png);
  await context.close();
}

// README screenshots, light and dark, at 2x for high-density screens.
for (const colorScheme of ['light', 'dark']) {
  const { png, page, context } = await shoot({ colorScheme, width: 1280, height: 800, scale: 2 });
  write(`docs/screenshots/${colorScheme}.webp`, await toWebp(page, png));
  await context.close();
}

// Link preview (og:image in index.html, also the repository's social preview): 1200×630 with the watermarked
// preview next to the app's name and promise.
{
  const { page, context } = await shoot({ colorScheme: 'light', width: 1280, height: 800, scale: 2 });
  const preview = (await page.locator('#stage canvas').screenshot()).toString('base64');
  await context.close();
  const logo = readFileSync(new URL('icons/favicon.svg', ROOT)).toString('base64');
  const social = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await social.setContent(`<!doctype html>
    <style>
      body { margin: 0; width: 1200px; height: 630px; display: flex; align-items: center; gap: 44px; padding: 0 60px;
        box-sizing: border-box; overflow: hidden; font-family: system-ui, sans-serif; color: #fff;
        background: linear-gradient(135deg, #0f766e, #134e4a); }
      .text { flex: 0 0 470px; }
      .brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; }
      .brand img { border-radius: 13px; box-shadow: 0 0 0 2px rgba(255, 255, 255, .45); }
      h1 { font-size: 50px; line-height: 1.08; margin: 34px 0 20px; letter-spacing: -0.01em; }
      p { font-size: 23px; line-height: 1.4; margin: 0; color: #d5f0ec; }
      .tags { margin-top: 30px; font-size: 19px; font-weight: 600; color: #99d6cd; }
      img.card { width: 540px; border-radius: 22px; box-shadow: 0 24px 60px rgba(0, 0, 0, .35); transform: rotate(-3deg); }
    </style>
    <div class="text">
      <div class="brand"><img src="data:image/svg+xml;base64,${logo}" width="56" height="56" alt="">Safe Mark Doc</div>
      <h1>Watermark your ID before sharing it</h1>
      <p>Say who each copy is for, add the date and a trace code.</p>
      <div class="tags">100% in the browser · Nothing is uploaded · Free</div>
    </div>
    <img class="card" src="data:image/png;base64,${preview}" alt="">`);
  await social.waitForLoadState('load');
  write('src/screenshots/social.png', await social.screenshot());
  await social.close();
}

// Welcome screen image: the watermarked sample card, shown up to 520 px wide (here at 2x).
{
  const { page, context } = await shoot({ colorScheme: 'light', width: 1280, height: 800, scale: 2 });
  const card = await page.locator('#stage canvas').screenshot();
  write('src/img/welcome.webp', await toWebp(page, card, { width: 1040, quality: 0.7 }));
  await context.close();
}

await browser.close();
server.close();
