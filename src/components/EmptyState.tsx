type Props = {
  loading: boolean;
  onBrowse: () => void;
};

export function EmptyState({ loading, onBrowse }: Props) {
  return (
    <button
      type="button"
      onClick={onBrowse}
      className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-8 text-center hover:border-neutral-400 hover:bg-neutral-50"
    >
      <span className="text-lg font-medium">{loading ? 'Opening PDFs…' : 'Drop PDFs here'}</span>
      <span className="text-sm text-neutral-500">
        or click to choose files. Nothing is uploaded; everything happens in your browser.
      </span>
    </button>
  );
}
