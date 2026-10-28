// Minimal PDF writer: one full-page JPEG per page. No dependencies, no metadata.

/**
 * @param {Array<{jpeg: Uint8Array, pxWidth: number, pxHeight: number, ptWidth: number, ptHeight: number}>} pages
 * @returns {Blob}
 */
export function buildPdf(pages) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let length = 0;

  const write = (data) => {
    const bytes = typeof data === 'string' ? encoder.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const beginObject = (id) => {
    offsets[id] = length;
    write(`${id} 0 obj\n`);
  };
  const endObject = () => write('\nendobj\n');

  // Object layout: 1 = catalog, 2 = page tree, then 3 objects per page (page, content, image).
  const pageId = (i) => 3 + i * 3;
  const objectCount = 3 + pages.length * 3;

  write('%PDF-1.4\n%âãÏÓ\n');

  beginObject(1);
  write('<< /Type /Catalog /Pages 2 0 R >>');
  endObject();

  beginObject(2);
  write(`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${pageId(i)} 0 R`).join(' ')}] >>`);
  endObject();

  pages.forEach((page, i) => {
    const id = pageId(i);
    const w = page.ptWidth.toFixed(2);
    const h = page.ptHeight.toFixed(2);

    beginObject(id);
    write(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`);
    endObject();

    const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    beginObject(id + 1);
    write(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`);
    endObject();

    beginObject(id + 2);
    write(`<< /Type /XObject /Subtype /Image /Width ${page.pxWidth} /Height ${page.pxHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`);
    write(page.jpeg);
    write('\nendstream');
    endObject();
  });

  const xrefOffset = length;
  write(`xref\n0 ${objectCount}\n0000000000 65535 f \n`);
  for (let id = 1; id < objectCount; id++) {
    write(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }
  write(`trailer\n<< /Size ${objectCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return new Blob(chunks, { type: 'application/pdf' });
}
