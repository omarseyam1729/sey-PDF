import { primaryButton, secondaryButton } from './buttons';

type Props = {
  pageCount: number;
  selectedCount: number;
  exportOpen: boolean;
  onToggleExport: () => void;
  onExtract: () => void;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
};

export function Toolbar({
  pageCount,
  selectedCount,
  exportOpen,
  onToggleExport,
  onExtract,
  onRotateSelected,
  onDeleteSelected,
  onClearSelection,
}: Props) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
      <div className="mr-auto">
        <h1 className="text-lg font-semibold tracking-tight">sey-pdf</h1>
        <p className="text-xs text-neutral-500">Files stay on your device.</p>
      </div>

      {selectedCount > 0 && (
        // Own row under the title on phones, inline beside Export on wider screens.
        <div className="order-last flex w-full flex-wrap items-center gap-1.5 sm:order-none sm:w-auto sm:gap-2">
          <span className="text-sm text-neutral-600">{selectedCount} selected</span>
          <button type="button" className={secondaryButton} onClick={onRotateSelected}>
            Rotate
          </button>
          <button type="button" className={secondaryButton} onClick={onDeleteSelected}>
            Delete
          </button>
          <button type="button" className={secondaryButton} onClick={onExtract}>
            Extract
          </button>
          <button type="button" className={secondaryButton} onClick={onClearSelection}>
            Clear
          </button>
        </div>
      )}

      <button
        type="button"
        className={primaryButton}
        disabled={pageCount === 0 && !exportOpen}
        aria-expanded={exportOpen}
        aria-controls={exportOpen ? 'export-drawer' : undefined}
        onClick={onToggleExport}
      >
        Export
      </button>
    </header>
  );
}
