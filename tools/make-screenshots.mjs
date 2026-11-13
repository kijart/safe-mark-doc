// Generates the app screenshots: the ones in the manifest (src/screenshots/) and the README ones (docs/screenshots/).
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

async function toWebp(page, png) {
  const bytes = await page.evaluate(async (data) => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(data)], { type: 'image/png' }));
    const c = new OffscreenCanvas(bitmap.width, bitmap.height);
    c.getContext('2d').drawImage(bitmap, 0, 0);
    const blob = await c.convertToBlob({ type: 'image/webp', quality: 0.9 });
    return [...new Uint8Array(await blob.arrayBuffer())];
  }, [...png]);
  return Buffer.from(bytes);
}

async function shoot({ colorScheme, width, height, scale, scrollTo }) {
  const context = await browser.newContext({
    colorScheme, locale: 'en-GB', viewport: { width, height }, deviceScaleFactor: scale, serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(DATE);
  await page.addInitScript(fixRandom);
  await page.goto(url);
  const card = Buffer.from(await page.evaluate(drawCard));
  await page.setInputFiles('#file-input', { name: 'id-card.png', mimeType: 'image/png', buffer: card });
  await page.waitForFunction(() => !document.querySelector('#download-btn').disabled);
  await page.click('[data-preset="identity"]');
  // Below the sticky top bar.
  if (scrollTo) await page.locator(scrollTo).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70));
  await page.waitForTimeout(500); // let the preview redraw
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

await browser.close();
server.close();
