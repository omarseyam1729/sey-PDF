// A drawn (not screenshotted) preview of the editor for the landing page hero.

type MockPage = { color: string; rotate?: boolean; selected?: boolean; lifted?: boolean };

const PAGES: MockPage[] = [
  { color: 'bg-sky-500' },
  { color: 'bg-sky-500', selected: true },
  { color: 'bg-amber-500', rotate: true },
  { color: 'bg-amber-500', lifted: true },
  { color: 'bg-sky-500' },
  { color: 'bg-emerald-500' },
  { color: 'bg-emerald-500', selected: true },
  { color: 'bg-sky-500' },
];

export function LandingPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-xl select-none">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/5">
        <div className="flex items-center gap-1.5 border-b border-neutral-200 px-4 py-3">
          <span className="size-2.5 rounded-full bg-neutral-200" />
          <span className="size-2.5 rounded-full bg-neutral-200" />
          <span className="size-2.5 rounded-full bg-neutral-200" />
          <span className="ml-3 text-xs text-neutral-400">sey-pdf / Merge PDF</span>
          <span className="ml-auto rounded-md bg-neutral-900 px-2.5 py-1 text-[10px] font-medium text-white">Export</span>
        </div>
        <div className="grid grid-cols-4 gap-3 bg-neutral-50 p-4 sm:gap-4 sm:p-5">
          {PAGES.map((page, i) => (
            <MiniPage key={i} page={page} number={i + 1} />
          ))}
        </div>
      </div>

      <div className="absolute -bottom-8 -left-2 w-48 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg sm:-left-8 sm:w-56">
        <p className="text-[10px] font-medium tracking-wide text-neutral-500 uppercase">Download size</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">650 KB</p>
        <p className="mt-1 text-xs text-emerald-700">94% smaller than 11 MB</p>
      </div>
    </div>
  );
}

function MiniPage({ page, number }: { page: MockPage; number: number }) {
  return (
    <div
      className={`rounded-lg bg-white p-1.5 ${
        page.selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-neutral-200'
      } ${page.lifted ? '-translate-y-2 rotate-3 shadow-lg' : 'shadow-sm'}`}
    >
      <div className="grid aspect-square place-items-center rounded bg-neutral-100">
        <div className={`flex h-4/5 w-3/5 flex-col gap-1 bg-white p-1 shadow-sm ${page.rotate ? 'rotate-90' : ''}`}>
          <span className={`h-1 w-full rounded-sm ${page.color} opacity-80`} />
          <span className="h-0.5 w-4/5 rounded-sm bg-neutral-200" />
          <span className="h-0.5 w-full rounded-sm bg-neutral-200" />
          <span className="h-0.5 w-3/5 rounded-sm bg-neutral-200" />
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 px-0.5">
        <span className={`size-1.5 rounded-full ${page.color}`} />
        <span className="text-[9px] text-neutral-400">{number}</span>
      </div>
    </div>
  );
}
