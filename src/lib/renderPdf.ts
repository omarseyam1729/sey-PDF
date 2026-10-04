import {
  getDocument,
  GlobalWorkerOptions,
  PasswordException,
  type PDFDocumentProxy,
} from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { setThumbnail, thumbKey, thumbnailGeneration } from './thumbnails';

GlobalWorkerOptions.workerSrc = workerSrc;

/** Longest thumbnail edge, in CSS pixels. */
const THUMB_SIZE = 220;

/**
 * Opens a PDF with PDF.js for inspection and rendering.
 * Throws an Error whose message completes "<file name> ...".
 */
export async function openPdf(file: File): Promise<PDFDocumentProxy> {
  const task = getDocument({ data: await file.arrayBuffer() });
  let doc: PDFDocumentProxy;
  try {
    doc = await task.promise;
  } catch (err) {
    await task.destroy();
    if (err instanceof PasswordException) throw new Error('is password-protected.');
    throw new Error('could not be read as a PDF.');
  }

  // pdf-lib can't export encrypted PDFs, even ones that open without a password.
  const { info } = await doc.getMetadata();
  if ((info as { EncryptFilterName?: string | null }).EncryptFilterName) {
    await doc.loadingTask.destroy();
    throw new Error('is encrypted. Remove its restrictions and try again.');
  }
  return doc;
}

/** Renders a small thumbnail for every page, then closes the document. */
export async function renderThumbnails(sourceId: string, doc: PDFDocumentProxy) {
  const generation = thumbnailGeneration();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  try {
    for (let i = 0; i < doc.numPages; i++) {
      if (generation !== thumbnailGeneration()) return;

      const page = await doc.getPage(i + 1);
      const base = page.getViewport({ scale: 1 });
      const scale = (THUMB_SIZE * pixelRatio) / Math.max(base.width, base.height);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, viewport }).promise;
      page.cleanup();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.85),
      );
      if (blob && generation === thumbnailGeneration()) {
        setThumbnail(thumbKey(sourceId, i), URL.createObjectURL(blob));
      }
    }
  } finally {
    await doc.loadingTask.destroy();
  }
}
