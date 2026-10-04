import { useEffect, useRef } from 'react';
import { primaryButton } from '../../components/buttons';
import { CloseIcon } from '../../components/icons';
import { downloadBlob } from '../../lib/download';
import type { PdfPage, PdfSource } from '../../types';
import { useExportFiles, type Compression, type FileState } from './useExportFiles';

export type ExportScope = 'all' | 'selected';

const COMPRESSION_OPTIONS: { value: Compression; label: string; hint: string }[] = [
  { value: 'none', label: 'None', hint: 'Pages exactly as they are.' },
  { value: 'lossless', label: 'Lossless', hint: 'Repacks the file. No quality loss.' },
  { value: 'balanced', label: 'Balanced', hint: 'Shrinks large images. Still sharp on screen.' },
  { value: 'strong', label: 'Strong', hint: 'Smallest file. Images get noticeably softer.' },
];

type Props = {
  sources: PdfSource[];
  /** The pages that will be exported, in order. */
  pages: PdfPage[];
  scope: ExportScope;
  totalCount: number;
  selectedCount: number;
  compression: Compression;
  onScopeChange: (scope: ExportScope) => void;
  onCompressionChange: (compression: Compression) => void;
  onClose: () => void;
};

export function ExportDrawer({
  sources,
  pages,
  scope,
  totalCount,
  selectedCount,
  compression,
  onScopeChange,
  onCompressionChange,
  onClose,
}: Props) {
  const { original, compressed } = useExportFiles(sources, pages, compression);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => titleRef.current?.focus(), []);

  // The file the download button saves.
  const output = compressed ?? original;
  const canDownload = pages.length > 0 && !output.pending && !!output.blob;
  const filename = exportFileName(sources, pages, scope, compressed !== null);

  return (
    <aside
      id="export-drawer"
      aria-labelledby="export-title"
      className="fixed inset-0 z-30 flex flex-col bg-white transition duration-200 ease-out starting:translate-x-4 starting:opacity-0 sm:static sm:z-auto sm:w-96 sm:shrink-0 sm:border-l sm:border-neutral-200"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
        <h2 id="export-title" ref={titleRef} tabIndex={-1} className="font-semibold outline-none">
          Export
        </h2>
        <button
          type="button"
          aria-label="Close export panel"
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {selectedCount > 0 && (
          <div role="group" aria-label="Pages to export" className={`${segmentGroup} grid-cols-2`}>
            {(['all', 'selected'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={scope === value}
                onClick={() => onScopeChange(value)}
                className={`${segment} ${scope === value ? segmentActive : segmentIdle}`}
              >
                {value === 'all' ? `All pages (${totalCount})` : `Selected (${selectedCount})`}
              </button>
            ))}
          </div>
        )}

        <section aria-live="polite">
          <h3 className={sectionHeading}>Download size</h3>
          <SizeSummary pages={pages} original={original} compressed={compressed} />
        </section>

        <fieldset>
          <legend className={sectionHeading}>Compression</legend>
          <div className={`${segmentGroup} grid-cols-4`}>
            {COMPRESSION_OPTIONS.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="compression"
                  value={option.value}
                  checked={compression === option.value}
                  onChange={() => onCompressionChange(option.value)}
                  className="peer sr-only"
                />
                <span
                  className={`${segment} ${segmentIdle} block cursor-pointer peer-checked:bg-white peer-checked:text-neutral-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {COMPRESSION_OPTIONS.find((option) => option.value === compression)?.hint}
          </p>
          {compressed && !original.pending && !compressed.pending && original.blob && compressed.blob && (
            <Savings before={original.blob.size} after={compressed.blob.size} />
          )}
        </fieldset>
      </div>

      <div className="border-t border-neutral-200 p-5">
        <button
          type="button"
          className={`${primaryButton} w-full`}
          disabled={!canDownload}
          onClick={() => output.blob && downloadBlob(output.blob, filename)}
        >
          {compressed ? 'Download compressed PDF' : 'Download PDF'}
        </button>
        <p className="mt-2 truncate text-center text-xs text-neutral-500" title={filename}>
          {filename}
        </p>
      </div>
    </aside>
  );
}

const sectionHeading = 'mb-2 text-xs font-medium tracking-wide text-neutral-500 uppercase';
const segmentGroup = 'grid gap-1 rounded-lg bg-neutral-100 p-1';
const segment = 'rounded-md px-1 py-1.5 text-center text-sm font-medium';
const segmentIdle = 'text-neutral-600 hover:text-neutral-900';
const segmentActive = 'bg-white text-neutral-900 shadow-sm';

type SizeSummaryProps = {
  pages: PdfPage[];
  original: FileState;
  compressed: FileState | null;
};

function SizeSummary({ pages, original, compressed }: SizeSummaryProps) {
  if (pages.length === 0) return <p className="text-sm text-neutral-500">No pages to export.</p>;

  const error = original.error ?? compressed?.error;
  if (error) {
    return (
      <p className="text-sm text-red-700">
        {original.error ? "Couldn't build this PDF" : 'Compression failed'}: {error}
      </p>
    );
  }

  const output = compressed ?? original;
  const fileCount = new Set(pages.map((p) => p.sourceId)).size;
  const status = original.pending ? 'Calculating…' : compressed?.pending ? 'Compressing…' : null;

  return (
    <div>
      <p className={`text-3xl font-semibold tabular-nums ${output.pending ? 'text-neutral-300' : ''}`}>
        {output.blob ? formatBytes(output.blob.size) : '—'}
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        {status ??
          `${pages.length} ${pages.length === 1 ? 'page' : 'pages'} from ${fileCount} ${fileCount === 1 ? 'file' : 'files'}`}
      </p>
    </div>
  );
}

function Savings({ before, after }: { before: number; after: number }) {
  const saved = Math.max(0, Math.round((1 - after / before) * 100));
  return (
    <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm">
      <dl className="grid grid-cols-[1fr_auto] gap-y-1">
        <dt className="text-neutral-500">Original</dt>
        <dd className="text-right tabular-nums">{formatBytes(before)}</dd>
        <dt className="text-neutral-500">Compressed</dt>
        <dd className="text-right tabular-nums">{formatBytes(after)}</dd>
        <dt className="text-neutral-500">Saved</dt>
        <dd className={`text-right font-medium tabular-nums ${saved > 0 ? 'text-emerald-700' : ''}`}>{saved}%</dd>
      </dl>
      {saved === 0 && (
        <p className="mt-2 text-xs text-neutral-500">This file is already compact at this setting.</p>
      )}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

function exportFileName(sources: PdfSource[], pages: PdfPage[], scope: ExportScope, compressed: boolean) {
  const used = sources.filter((s) => pages.some((p) => p.sourceId === s.id));
  const base = used.length === 1 ? used[0].name.replace(/\.pdf$/i, '') : 'merged';
  return `${base}-${scope === 'selected' ? 'extract' : 'edited'}${compressed ? '-compressed' : ''}.pdf`;
}
