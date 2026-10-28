// Watermark rendering engine. Draws a tiled, hard-to-remove watermark on a canvas.

/** Deterministic PRNG (mulberry32) so the same settings + trace code give the same output. */
export function createRng(seedText) {
  let seed = 2166136261;
  for (const ch of seedText) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Slightly shifts a color's channels so automated color-keying cannot isolate the mark. */
function jitterColor([r, g, b], rng, amount) {
  const d = () => Math.round((rng() - 0.5) * 2 * amount);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return `rgb(${clamp(r + d())} ${clamp(g + d())} ${clamp(b + d())})`;
}

/** Fine interlaced sine curves crossing the whole page (banknote-style guilloche). */
function drawGuilloche(ctx, w, h, rgb, opacity, rng) {
  const base = Math.min(w, h);
  const lines = 14;
  ctx.save();
  ctx.globalAlpha = Math.min(1, opacity * 0.55);
  ctx.strokeStyle = `rgb(${rgb.join(' ')})`;
  ctx.lineWidth = Math.max(1, base / 900);
  for (let i = 0; i < lines; i++) {
    const amp = base * (0.04 + rng() * 0.08);
    const period = base * (0.25 + rng() * 0.35);
    const phase = rng() * Math.PI * 2;
    const y0 = (h / lines) * (i + 0.5);
    const amp2 = amp * 0.35;
    const period2 = period / 2.7;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = y0 + amp * Math.sin((x / period) * Math.PI * 2 + phase) + amp2 * Math.sin((x / period2) * Math.PI * 2 - phase);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws the watermark onto `ctx` covering a `w` x `h` area.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {object} opts
 * @param {string} opts.text          Full watermark text.
 * @param {string} opts.microText     Text used for the micro-print lines.
 * @param {string} opts.color         Hex color (#rrggbb).
 * @param {number} opts.opacity       0..1
 * @param {number} opts.size          Font size as % of the shortest side.
 * @param {number} opts.density       1 (sparse) .. 5 (dense)
 * @param {number} opts.angle         Degrees.
 * @param {boolean} opts.wave         Per-glyph wave + jitter.
 * @param {boolean} opts.guilloche    Security line pattern.
 * @param {boolean} opts.micro        Micro-print lines between rows.
 * @param {string} opts.seed          PRNG seed.
 */
export function drawWatermark(ctx, w, h, opts) {
  const text = opts.text.trim();
  if (!text) return;

  const rng = createRng(`${opts.seed}|${w}x${h}`);
  const rgb = hexToRgb(opts.color);
  // Halo color: contrasting outline keeps the mark visible on both light and dark areas.
  const halo = luminance(rgb) > 0.6 ? 'rgb(0 0 0)' : 'rgb(255 255 255)';
  const base = Math.min(w, h);
  const fontPx = Math.max(10, (base * opts.size) / 100);
  const lineGap = fontPx * (6.2 - opts.density * 0.95);
  const diag = Math.hypot(w, h);
  const font = `700 ${fontPx}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  const unit = `${text}   •   `;

  if (opts.guilloche) drawGuilloche(ctx, w, h, rgb, opts.opacity, rng);

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((opts.angle * Math.PI) / 180);
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const unitWidth = ctx.measureText(unit).width;
  const widthCache = new Map();
  const charWidth = (ch) => {
    if (!widthCache.has(ch)) widthCache.set(ch, ctx.measureText(ch).width);
    return widthCache.get(ch);
  };

  const half = diag / 2 + fontPx * 2;
  let row = 0;
  for (let y = -half; y <= half; y += lineGap, row++) {
    // Stagger rows so the pattern does not form clean columns.
    const offset = opts.wave ? rng() * unitWidth : (row % 2) * (unitWidth / 2);
    const amp = opts.wave ? fontPx * (0.25 + rng() * 0.35) : 0;
    const period = fontPx * (9 + rng() * 8);
    const phase = rng() * Math.PI * 2;
    // Alternate filled and outlined rows: mixed styles defeat single-pass removal.
    const outlined = opts.wave && row % 3 === 2;

    for (let x = -half - offset; x < half; x += unitWidth) {
      if (!opts.wave) {
        drawGlyphRun(ctx, unit, x, y, { rgb, halo, fontPx, opacity: opts.opacity, outlined: false });
        continue;
      }
      let cx = x;
      for (const ch of unit) {
        const cw = charWidth(ch);
        if (ch.trim()) {
          const t = ((cx + cw / 2) / period) * Math.PI * 2 + phase;
          const cy = y + amp * Math.sin(t);
          const slope = Math.atan(amp * Math.cos(t) * ((Math.PI * 2) / period));
          ctx.save();
          ctx.translate(cx + cw / 2, cy);
          ctx.rotate(slope + (rng() - 0.5) * 0.12);
          const scale = 1 + (rng() - 0.5) * 0.1;
          ctx.scale(scale, scale);
          drawGlyphRun(ctx, ch, -cw / 2, (rng() - 0.5) * fontPx * 0.08, {
            rgb,
            halo,
            fontPx,
            opacity: opts.opacity * (0.85 + rng() * 0.3),
            outlined,
            color: jitterColor(rgb, rng, 28),
          });
          ctx.restore();
        }
        cx += cw;
      }
    }

    if (opts.micro && opts.microText) {
      drawMicroLine(ctx, opts.microText, y + lineGap / 2, half, fontPx, rgb, opts.opacity);
    }
  }
  ctx.restore();
}

function drawGlyphRun(ctx, str, x, y, { rgb, halo, fontPx, opacity, outlined, color }) {
  const fill = color ?? `rgb(${rgb.join(' ')})`;
  ctx.globalAlpha = Math.min(1, opacity * 0.55);
  ctx.strokeStyle = halo;
  ctx.lineWidth = Math.max(1, fontPx * 0.09);
  ctx.strokeText(str, x, y);
  ctx.globalAlpha = Math.min(1, opacity);
  if (outlined) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = Math.max(1, fontPx * 0.06);
    ctx.strokeText(str, x, y);
  } else {
    ctx.fillStyle = fill;
    ctx.fillText(str, x, y);
  }
}

function drawMicroLine(ctx, microText, y, half, fontPx, rgb, opacity) {
  const microPx = Math.max(6, fontPx * 0.22);
  ctx.save();
  ctx.font = `600 ${microPx}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.globalAlpha = Math.min(1, opacity * 1.1);
  ctx.fillStyle = `rgb(${rgb.join(' ')})`;
  const unit = `${microText} · `;
  const uw = ctx.measureText(unit).width;
  const repeated = unit.repeat(Math.ceil((half * 2) / uw) + 1);
  ctx.fillText(repeated, -half, y);
  ctx.restore();
}
