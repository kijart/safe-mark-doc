// Document tone: turns a rendered page into grayscale, like a photocopy.
// It runs before redactions and the watermark, so the watermark keeps its color.

/** Converts the canvas in place. 'color' and unknown tones leave it untouched. */
export function applyTone(canvas, tone) {
  if (tone !== 'gray') return;
  const { width, height } = canvas;
  if (!width || !height) return;
  const ctx = canvas.getContext('2d');
  const image = ctx.getImageData(0, 0, width, height);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const y = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = d[i + 1] = d[i + 2] = y;
  }
  ctx.putImageData(image, 0, 0);
}
