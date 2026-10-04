import { useEffect, useReducer, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { EmptyState } from './components/EmptyState';
import { Notices, type Notice } from './components/Notices';
import { PageGrid } from './components/PageGrid';
import { secondaryButton, Toolbar } from './components/Toolbar';
import { downloadBlob } from './lib/download';
import { clearThumbnails } from './lib/thumbnails';
import { initialWorkspace, workspaceReducer } from './store/workspace';
import type { PdfPage, PdfSource } from './types';

function outputName(sources: PdfSource[], pages: PdfPage[], suffix: string) {
  const used = sources.filter((s) => pages.some((p) => p.sourceId === s.id));
  const base = used.length === 1 ? used[0].name.replace(/\.pdf$/i, '') : 'merged';
  return `${base}-${suffix}.pdf`;
}

export default function App() {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspace);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  const notify = (message: string) =>
    setNotices((current) => [...current, { id: crypto.randomUUID(), message }]);

  async function addFiles(files: File[]) {
    setLoadingCount((count) => count + files.length);
    // PDF.js is large; load it on first use so the empty page paints fast.
    const { openPdf, renderThumbnails } = await import('./lib/renderPdf');
    // One at a time so pages are appended in the order the files were dropped.
    for (const file of files) {
      try {
        const doc = await openPdf(file);
        const source = { id: crypto.randomUUID(), file, name: file.name, pageCount: doc.numPages };
        dispatch({ type: 'addSource', source });
        renderThumbnails(source.id, doc).catch(() =>
          notify(`Couldn't render previews for ${file.name}.`),
        );
      } catch (err) {
        notify(`${file.name} ${(err as Error).message}`);
      } finally {
        setLoadingCount((count) => count - 1);
      }
    }
  }

  async function exportPages(pages: PdfPage[], suffix: string) {
    setExporting(true);
    try {
      const { buildPdf } = await import('./lib/pdf');
      const blob = await buildPdf(state.sources, pages);
      downloadBlob(blob, outputName(state.sources, pages, suffix));
    } catch (err) {
      console.error(err);
      notify(`Export failed: ${(err as Error).message}`);
    } finally {
      setExporting(false);
    }
  }

  // Extract keeps workspace order, not the order pages were clicked.
  const extractSelected = () =>
    exportPages(state.pages.filter((p) => state.selected.has(p.id)), 'extract');

  function clearAll() {
    if (!window.confirm('Remove all files and pages from the workspace?')) return;
    dispatch({ type: 'reset' });
    clearThumbnails();
  }

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted, rejected) => {
      rejected.forEach(({ file }) => notify(`${file.name} is not a PDF.`));
      if (accepted.length > 0) void addFiles(accepted);
    },
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch({ type: 'clearSelection' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const selectedIds = [...state.selected];
  const pageCount = state.pages.length;
  const fileCount = new Set(state.pages.map((p) => p.sourceId)).size;

  return (
    <div {...getRootProps({ className: 'flex min-h-screen flex-col outline-none' })}>
      <input {...getInputProps()} />

      <Toolbar
        pageCount={pageCount}
        selectedCount={selectedIds.length}
        exporting={exporting}
        onExport={() => exportPages(state.pages, 'edited')}
        onExtract={extractSelected}
        onRotateSelected={() => dispatch({ type: 'rotate', ids: selectedIds })}
        onDeleteSelected={() => dispatch({ type: 'delete', ids: selectedIds })}
        onClearSelection={() => dispatch({ type: 'clearSelection' })}
      />

      <main className="flex-1 p-4 sm:p-6">
        {pageCount === 0 ? (
          <EmptyState loading={loadingCount > 0} onBrowse={open} />
        ) : (
          <PageGrid state={state} dispatch={dispatch} />
        )}
      </main>

      <footer className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <button type="button" className={secondaryButton} onClick={open}>
          Add PDF
        </button>
        <span className="text-sm text-neutral-500">
          {loadingCount > 0
            ? 'Opening PDFs…'
            : `${pageCount} ${pageCount === 1 ? 'page' : 'pages'} from ${fileCount} ${fileCount === 1 ? 'file' : 'files'}`}
        </span>
        {state.sources.length > 0 && (
          <button type="button" className="ml-auto text-sm text-neutral-500 hover:text-neutral-900" onClick={clearAll}>
            Clear all
          </button>
        )}
      </footer>

      <Notices
        notices={notices}
        onDismiss={(id) => setNotices((current) => current.filter((n) => n.id !== id))}
      />

      {isDragActive && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-blue-500/10 p-6">
          <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-white px-10 py-8 text-lg font-medium text-blue-700 shadow-lg">
            Drop PDFs to add them
          </div>
        </div>
      )}
    </div>
  );
}
