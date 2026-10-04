import { useEffect, useState } from 'react';
import type { CompressionPreset } from '../../lib/compress';
import type { PdfPage, PdfSource } from '../../types';

export type Compression = 'none' | CompressionPreset;

export type FileState = {
  blob?: Blob;
  error?: string;
  /** True while the blob is missing or out of date for the current input. */
  pending: boolean;
};

/** Wait for a pause in edits before rebuilding. */
const BUILD_DELAY = 250;

/**
 * Builds the export (and its compressed version) in the background so the
 * drawer can show real sizes, and so downloading reuses the same bytes.
 */
export function useExportFiles(sources: PdfSource[], pages: PdfPage[], compression: Compression) {
  const [built, setBuilt] = useState<{ pages: PdfPage[]; blob?: Blob; error?: string } | null>(null);
  const [packed, setPacked] = useState<{
    input: Blob;
    preset: CompressionPreset;
    blob?: Blob;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { buildPdf } = await import('../../lib/pdf');
        const blob = await buildPdf(sources, pages);
        if (!cancelled) setBuilt({ pages, blob });
      } catch (err) {
        if (!cancelled) setBuilt({ pages, error: (err as Error).message });
      }
    }, BUILD_DELAY);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sources, pages]);

  const input = built?.pages === pages ? built.blob : undefined;

  useEffect(() => {
    if (!input || compression === 'none') return;
    const preset = compression;
    const controller = new AbortController();
    (async () => {
      try {
        const { compressPdf } = await import('../../lib/compress');
        const blob = await compressPdf(input, preset, controller.signal);
        if (!controller.signal.aborted) setPacked({ input, preset, blob });
      } catch (err) {
        if (!controller.signal.aborted) setPacked({ input, preset, error: (err as Error).message });
      }
    })();
    return () => controller.abort();
  }, [input, compression]);

  const original: FileState = {
    blob: built?.blob,
    error: built?.error,
    pending: built?.pages !== pages,
  };
  const compressed: FileState | null =
    compression === 'none'
      ? null
      : {
          blob: packed?.blob,
          error: packed?.error,
          pending: !input || packed?.input !== input || packed.preset !== compression,
        };
  return { original, compressed };
}
