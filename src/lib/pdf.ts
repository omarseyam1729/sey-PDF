import { degrees, PDFDocument, type PDFPage } from 'pdf-lib';
import type { PdfPage, PdfSource } from '../types';

/**
 * Builds a new PDF containing exactly `pages`, in order, with their rotations.
 * This one path powers merge, reorder, delete, duplicate, rotate and extract.
 */
export async function buildPdf(sources: PdfSource[], pages: PdfPage[]): Promise<Blob> {
  const out = await PDFDocument.create();
  const copied: PDFPage[] = new Array(pages.length);

  // One copyPages call per source so shared fonts and images are copied once.
  // Repeated indices (duplicates) still come back as separate page objects.
  for (const source of sources) {
    const positions = pages.flatMap((page, i) => (page.sourceId === source.id ? [i] : []));
    if (positions.length === 0) continue;

    const doc = await PDFDocument.load(await source.file.arrayBuffer());
    const result = await out.copyPages(
      doc,
      positions.map((i) => pages[i].sourcePageIndex),
    );
    positions.forEach((position, j) => {
      copied[position] = result[j];
    });
  }

  pages.forEach((page, i) => {
    const pdfPage = out.addPage(copied[i]);
    const angle = pdfPage.getRotation().angle + page.rotation;
    pdfPage.setRotation(degrees(((angle % 360) + 360) % 360));
  });

  // pdf-lib types its output loosely; it is always backed by a plain ArrayBuffer.
  const bytes = (await out.save()) as Uint8Array<ArrayBuffer>;
  return new Blob([bytes], { type: 'application/pdf' });
}
