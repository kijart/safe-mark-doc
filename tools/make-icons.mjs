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

// Icon geometry in normalized coordinates (0..1), shared with src/icons/favicon.svg:
// a document with a folded corner, diagonal watermark stripes and text lines
// (one of them redacted), protected by a shield badge.
const PAGE = { left: 0.2, right: 0.7, top: 0.14, bottom: 0.86, radius: 0.045, fold: 0.15 };
const LINES = [
  // [y, x0, x1, redacted]
  [0.36, 0.28, 0.45, false],
  [0.49, 0.28, 0.62, false],
  [0.62, 0.28, 0.48, true],
  [0.75, 0.28, 0.44, false],
];
const LINE_HALF = 0.03;
const SHIELD = { cx: 0.72, top: 0.55, width: 0.3, height: 0.35, ring: 0.035 };
const CHECK = [[0.635, 0.715], [0.7, 0.78], [0.81, 0.655]];
const CHECK_HALF = 0.025;

const COLORS = {
  bg: [15, 118, 110],
  page: [255, 255, 255],
  stripe: [216, 239, 236],
  fold: [153, 214, 205],
  text: [95, 168, 160],
  redacted: [16, 61, 57],
  shield: [16, 61, 57],
  check: [255, 255, 255],
};

function insideRoundedRect(x, y, { left, right, top, bottom, radius }) {
  if (x < left || x > right || y < top || y > bottom) return false;
  const dx = Math.max(left + radius - x, x - (right - radius), 0);
  const dy = Math.max(top + radius - y, y - (bottom - radius), 0);
  return dx * dx + dy * dy <= radius * radius;
}

function insideBar(x, y, [cy, x0, x1]) {
  const dx = Math.max(x0 - x, x - x1, 0);
  const dy = y - cy;
  return dx * dx + dy * dy <= LINE_HALF * LINE_HALF;
}

// Shield: flat top, straight sides, curving to a point at the bottom.
// `grow` enlarges it uniformly (used for the separating ring).
function insideShield(x, y, grow = 0) {
  const { cx, top, width, height } = SHIELD;
  const k = 1 + (2 * grow) / width;
  const h = height * k;
  const t0 = top - (h - height) / 2;
  const v = (y - t0) / h;
  if (v < 0 || v > 1) return false;
  const t = v <= 0.45 ? 0 : (v - 0.45) / 0.55;
  return Math.abs(x - cx) <= ((width * k) / 2) * (1 - Math.pow(t, 1.7));
}

function nearSegment(x, y, [ax, ay], [bx, by], half) {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
  const dx = x - (ax + t * vx), dy = y - (ay + t * vy);
  return dx * dx + dy * dy <= half * half;
}

// Returns [r,g,b,a] for a point of the icon.
function sample(x, y, { maskable }) {
  // Rounded-square background (full bleed for maskable icons).
  if (!maskable) {
    const r = 0.22;
    const dx = Math.max(Math.abs(x - 0.5) - (0.5 - r), 0);
    const dy = Math.max(Math.abs(y - 0.5) - (0.5 - r), 0);
    if (dx * dx + dy * dy > r * r) return [0, 0, 0, 0];
  }

  const s = maskable ? 0.8 : 1; // shrink into the maskable safe zone
  const px = (x - 0.5) / s + 0.5;
  const py = (y - 0.5) / s + 0.5;
  if (insideShield(px, py)) {
    const onCheck = nearSegment(px, py, CHECK[0], CHECK[1], CHECK_HALF) || nearSegment(px, py, CHECK[1], CHECK[2], CHECK_HALF);
    return [...(onCheck ? COLORS.check : COLORS.shield), 255];
  }
  // A background-colored ring separates the badge from the page.
  if (insideShield(px, py, SHIELD.ring)) return [...COLORS.bg, 255];
  if (!insideRoundedRect(px, py, PAGE)) return [...COLORS.bg, 255];

  // Folded top-right corner: the triangle above the diagonal is cut away,
  // the one below it is the flap.
  const fx = px - (PAGE.right - PAGE.fold);
  const fy = py - PAGE.top;
  if (fx > 0 && fy < PAGE.fold) return fx > fy ? [...COLORS.bg, 255] : [...COLORS.fold, 255];

  for (const line of LINES) {
    if (insideBar(px, py, line)) return [...(line[3] ? COLORS.redacted : COLORS.text), 255];
  }

  // Diagonal stripes across the page (the watermark motif).
  const band = ((px + py) * 8) % 1;
  return band < 0.4 ? [...COLORS.stripe, 255] : [...COLORS.page, 255];
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

const outDir = new URL('../src/icons/', import.meta.url);
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
