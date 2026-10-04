import { useEffect, useMemo, useState, type Dispatch } from 'react';
import { secondaryButton } from '../components/buttons';
import { EmptyState } from '../components/EmptyState';
import { PageGrid } from '../components/PageGrid';
import { Toolbar } from '../components/Toolbar';
import { ExportDrawer, type ExportScope } from '../features/export/ExportDrawer';
import type { Compression } from '../features/export/useExportFiles';
import type { WorkspaceAction, WorkspaceState } from '../store/workspace';
import type { Tool } from '../tools';

type Props = {
  tool: Tool;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  loading: boolean;
  onAddFiles: () => void;
  onClearAll: () => void;
};

export function Editor({ tool, state, dispatch, loading, onAddFiles, onClearAll }: Props) {
  // Compress is all about the output, so its export panel starts open.
  const [exportScope, setExportScope] = useState<ExportScope | null>(tool.compression ? 'all' : null);
  const [compression, setCompression] = useState<Compression>(tool.compression ?? 'none');
  const pageCount = state.pages.length;
  const hasPages = pageCount > 0;
  const exportOpen = exportScope !== null && hasPages;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (exportOpen) setExportScope(null);
      else dispatch({ type: 'clearSelection' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exportOpen, dispatch]);

  // Exporting the selection falls back to all pages once nothing is selected.
  const scope: ExportScope = exportScope === 'selected' && state.selected.size > 0 ? 'selected' : 'all';
  // Memoised so the drawer only rebuilds the PDF when the exported pages change.
  // Extract keeps workspace order, not the order pages were clicked.
  const exportPages = useMemo(
    () => (scope === 'selected' ? state.pages.filter((p) => state.selected.has(p.id)) : state.pages),
    [scope, state.pages, state.selected],
  );

  const selectedIds = [...state.selected];
  const fileCount = new Set(state.pages.map((p) => p.sourceId)).size;

  return (
    <div className="flex h-dvh flex-col">
      <Toolbar
        toolName={tool.name}
        pageCount={pageCount}
        selectedCount={selectedIds.length}
        exportOpen={exportOpen}
        onToggleExport={() => setExportScope(exportOpen ? null : 'all')}
        onExtract={() => setExportScope('selected')}
        onRotateSelected={() => dispatch({ type: 'rotate', ids: selectedIds })}
        onDeleteSelected={() => dispatch({ type: 'delete', ids: selectedIds })}
        onClearSelection={() => dispatch({ type: 'clearSelection' })}
      />

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {hasPages ? (
            <>
              <p className="mb-4 text-sm text-neutral-500">{tool.hint}</p>
              <PageGrid state={state} dispatch={dispatch} />
            </>
          ) : (
            <EmptyState title={tool.dropTitle} hint={tool.hint} loading={loading} onBrowse={onAddFiles} />
          )}
        </main>

        {exportOpen && (
          <ExportDrawer
            sources={state.sources}
            pages={exportPages}
            scope={scope}
            totalCount={pageCount}
            selectedCount={state.selected.size}
            compression={compression}
            onScopeChange={setExportScope}
            onCompressionChange={setCompression}
            onClose={() => setExportScope(null)}
          />
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-neutral-200 bg-white px-4 py-3 sm:px-6">
        <button type="button" className={secondaryButton} onClick={onAddFiles}>
          Add PDF
        </button>
        <span className="text-sm text-neutral-500">
          {loading
            ? 'Opening PDFs…'
            : `${pageCount} ${pageCount === 1 ? 'page' : 'pages'} from ${fileCount} ${fileCount === 1 ? 'file' : 'files'}`}
        </span>
        {state.sources.length > 0 && (
          <button type="button" className="ml-auto text-sm text-neutral-500 hover:text-neutral-900" onClick={onClearAll}>
            Clear all
          </button>
        )}
      </footer>
    </div>
  );
}
