// Redaction: hides sensitive areas of a page irreversibly before the watermark is drawn.
// Regions use normalized coordinates (0..1) so they are independent of render resolution.

export const REDACT_MODES = ['box', 'blur', 'pixelate'];

const BOX_COLOR = '#111111';
const MIN_BLOCK = 8;
// Rough height of a line of body text, as a share of the page's short side
// (~44 px on a 2200 px wide PDF render, ~12 px on an 800×600 screenshot).
const LINE_FRACTION = 0.02;

/** Converts a normalized region to integer pixel bounds clamped to the canvas. */
export function toPixels(region, width, height) {
  const x = Math.max(0, Math.floor(region.x * width));
  const y = Math.max(0, Math.floor(region.y * height));
  const right = Math.min(width, Math.ceil((region.x + region.w) * width));
  const bottom = Math.min(height, Math.ceil((region.y + region.h) * height));
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
}

/**
 * Side of the square blocks a region is resampled to. Across the region's short side it keeps
 * at most one sample per line of text (and at most 5, or 6 for blur), so a strip over a single
 * line becomes one row of blocks each wider than a glyph: too little detail for tools like Depix
 * to match against a font.
 */
export function blockSize(w, h, pageWidth, pageHeight, smooth) {
  const shortSide = Math.min(w, h);
  const line = Math.max(MIN_BLOCK, LINE_FRACTION * Math.min(pageWidth, pageHeight));
  const samples = Math.min(smooth ? 6 : 5, Math.max(1, Math.floor(shortSide / line)));
  return Math.max(MIN_BLOCK, shortSide / samples);
}

/**
 * Resamples the area through a tiny canvas. Downscaling discards the detail for good,
 * so the result cannot be "un-blurred" the way a light Gaussian blur sometimes can.
 */
function resample(ctx, { x, y, w, h }, smooth) {
  // Both keep only a handful of samples per short side; blur then smooths them out.
  const block = blockSize(w, h, ctx.canvas.width, ctx.canvas.height, smooth);
  const sw = Math.max(1, Math.round(w / block));
  const sh = Math.max(1, Math.round(h / block));

  const small = document.createElement('canvas');
  small.width = sw;
  small.height = sh;
  const sctx = small.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(ctx.canvas, x, y, w, h, 0, 0, sw, sh);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (smooth) {
    // Upscale in two steps for a soft, even blur instead of visible blocks.
    const mid = document.createElement('canvas');
    mid.width = Math.max(1, Math.round(w / 4));
    mid.height = Math.max(1, Math.round(h / 4));
    const mctx = mid.getContext('2d');
    mctx.imageSmoothingEnabled = true;
    mctx.imageSmoothingQuality = 'high';
    mctx.drawImage(small, 0, 0, mid.width, mid.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(mid, x, y, w, h);
  } else {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, x, y, w, h);
  }
  ctx.restore();
}

/** Applies all regions to the canvas behind `ctx`, in order. */
export function applyRedactions(ctx, width, height, regions = []) {
  for (const region of regions) {
    const px = toPixels(region, width, height);
    if (px.w < 1 || px.h < 1) continue;
    if (region.mode === 'box') {
      ctx.save();
      ctx.fillStyle = BOX_COLOR;
      ctx.fillRect(px.x, px.y, px.w, px.h);
      ctx.restore();
    } else {
      resample(ctx, px, region.mode === 'blur');
    }
  }
}

/** Index of the topmost region containing the normalized point, or -1. */
export function hitTest(regions, nx, ny) {
  for (let i = regions.length - 1; i >= 0; i--) {
    const r = regions[i];
    if (nx >= r.x && nx <= r.x + r.w && ny >= r.y && ny <= r.y + r.h) return i;
  }
  return -1;
}
