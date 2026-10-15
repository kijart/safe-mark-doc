// Generates the PWA PNG icons without external dependencies.
// Usage: node tools/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Shape sampling in normalized coordinates (0..1). Returns [r,g,b,a].
function sample(x, y, { maskable }) {
  const BG = [15, 118, 110];
  const SHIELD = [255, 255, 255];
  const STRIPE = [153, 214, 205];

  // Rounded-square background (full bleed for maskable icons).
  if (!maskable) {
    const r = 0.22;
    const dx = Math.max(Math.abs(x - 0.5) - (0.5 - r), 0);
    const dy = Math.max(Math.abs(y - 0.5) - (0.5 - r), 0);
    if (dx * dx + dy * dy > r * r) return [0, 0, 0, 0];
  }

  // Shield: flat top, straight sides, curving to a point at the bottom.
  const s = maskable ? 0.72 : 0.86; // shrink into the maskable safe zone
  const sx = (x - 0.5) / s + 0.5;
  const sy = (y - 0.5) / s + 0.5;
  const top = 0.2, mid = 0.48, bottom = 0.86, halfW = 0.28;
  let inside = false;
  if (sy >= top && sy <= bottom) {
    const t = sy <= mid ? 0 : (sy - mid) / (bottom - mid);
    const w = halfW * (1 - Math.pow(t, 1.7));
    inside = Math.abs(sx - 0.5) <= w;
  }
  if (!inside) return [...BG, 255];

  // Diagonal stripes inside the shield (the "watermark" motif).
  const band = ((sx + sy) * 9) % 1;
  return band < 0.38 ? [...STRIPE, 255] : [...SHIELD, 255];
}

function render(size, opts) {
  const SS = 4; // supersampling for anti-aliasing
  const buf = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [cr, cg, cb, ca] = sample((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size, opts);
          r += cr * ca; g += cg * ca; b += cb * ca; a += ca;
        }
      }
      const i = (py * size + px) * 4;
      buf[i] = a ? Math.round(r / a) : 0;
      buf[i + 1] = a ? Math.round(g / a) : 0;
      buf[i + 2] = a ? Math.round(b / a) : 0;
      buf[i + 3] = Math.round(a / (SS * SS));
    }
  }
  return encodePng(size, buf);
}

const outDir = new URL('../icons/', import.meta.url);
mkdirSync(outDir, { recursive: true });
for (const [name, size, maskable] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
]) {
  writeFileSync(new URL(name, outDir), render(size, { maskable }));
  console.log('wrote', name);
}
