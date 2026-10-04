type Props = {
  pageCount: number;
  selectedCount: number;
  exporting: boolean;
  onExport: () => void;
  onExtract: () => void;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
};

export const primaryButton =
  'rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-40';
export const secondaryButton =
  'rounded-lg border border-neutral-300 bg-white px-2.5 py-2 sm:px-3 text-sm font-medium hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40';

export function Toolbar({
  pageCount,
  selectedCount,
  exporting,
  onExport,
  onExtract,
  onRotateSelected,
  onDeleteSelected,
  onClearSelection,
}: Props) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mr-auto">
        <h1 className="text-lg font-semibold tracking-tight">sey-pdf</h1>
        <p className="text-xs text-neutral-500">Files stay on your device.</p>
      </div>

      {selectedCount > 0 && (
        // Own row under the title on phones, inline beside Export on wider screens.
        <div className="order-last flex w-full flex-wrap items-center gap-1.5 sm:order-none sm:gap-2 sm:w-auto">
          <span className="text-sm text-neutral-600">{selectedCount} selected</span>
          <button type="button" className={secondaryButton} onClick={onRotateSelected}>
            Rotate
          </button>
          <button type="button" className={secondaryButton} onClick={onDeleteSelected}>
            Delete
          </button>
          <button type="button" className={secondaryButton} disabled={exporting} onClick={onExtract}>
            Extract
          </button>
          <button type="button" className={secondaryButton} onClick={onClearSelection}>
            Clear
          </button>
        </div>
      )}

      <button type="button" className={primaryButton} disabled={pageCount === 0 || exporting} onClick={onExport}>
        {exporting ? 'Exporting…' : 'Export'}
      </button>
    </header>
  );
}
