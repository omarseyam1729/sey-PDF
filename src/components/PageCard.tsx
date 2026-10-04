import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useCallback, type Dispatch, type MouseEvent, type ReactNode } from 'react';
import { thumbKey, useThumbnail } from '../lib/thumbnails';
import type { WorkspaceAction } from '../store/workspace';
import type { PdfPage } from '../types';
import { CheckIcon, DuplicateIcon, RotateIcon, TrashIcon } from './icons';

export type PageInfo = {
  page: PdfPage;
  /** 1-based position in the workspace. */
  number: number;
  sourceName: string;
  sourceColor: string;
};

type PageThumbProps = PageInfo & {
  selected?: boolean;
  lifted?: boolean;
  actions?: ReactNode;
};

/** The visual card, shared by the grid and the drag overlay. */
export function PageThumb({
  page,
  number,
  sourceName,
  sourceColor,
  selected,
  lifted,
  actions,
}: PageThumbProps) {
  const url = useThumbnail(thumbKey(page.sourceId, page.sourcePageIndex));

  return (
    <div
      className={`rounded-xl border bg-white p-2 ${
        selected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-neutral-200'
      } ${lifted ? 'shadow-xl' : 'shadow-sm'}`}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-neutral-100 p-3">
        {url ? (
          <img
            src={url}
            alt={`Page ${number}`}
            draggable={false}
            className="max-h-full max-w-full shadow ring-1 ring-black/5"
            style={{ transform: `rotate(${page.rotation}deg)` }}
          />
        ) : (
          <span className="text-xs text-neutral-400">Rendering…</span>
        )}
        {selected && (
          <span className="absolute top-2 left-2 grid size-5 place-items-center rounded-full bg-blue-500 text-white">
            <CheckIcon />
          </span>
        )}
        {actions && (
          <div className="absolute top-2 right-2 flex rounded-lg bg-white/95 shadow ring-1 ring-black/5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            {actions}
          </div>
        )}
      </div>
      <div className="mt-2 px-1">
        <div className="text-sm font-medium">Page {number}</div>
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <span className={`mr-0.5 size-2 shrink-0 rounded-full ${sourceColor}`} />
          <span className="truncate" title={sourceName}>
            {sourceName}
          </span>
          <span className="shrink-0">· p{page.sourcePageIndex + 1}</span>
        </div>
      </div>
    </div>
  );
}

type PageCardProps = PageInfo & {
  selected: boolean;
  dispatch: Dispatch<WorkspaceAction>;
};

export const PageCard = memo(function PageCard({ selected, dispatch, ...info }: PageCardProps) {
  const { id } = info.page;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // The whole card is the drag handle. Registering it as the activator keeps
  // Enter/Space on the action buttons from starting a keyboard drag.
  const ref = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      setActivatorNodeRef(node);
    },
    [setNodeRef, setActivatorNodeRef],
  );

  const act = (action: WorkspaceAction) => (event: MouseEvent) => {
    event.stopPropagation();
    dispatch(action);
  };

  const actionClass = 'grid size-8 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900';

  return (
    <div
      ref={ref}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`Page ${info.number}`}
      aria-pressed={selected}
      onClick={() => dispatch({ type: 'toggleSelect', id })}
      className={`group cursor-grab rounded-xl outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <PageThumb
        {...info}
        selected={selected}
        actions={
          <>
            <button type="button" title="Rotate" aria-label="Rotate" className={actionClass} onClick={act({ type: 'rotate', ids: [id] })}>
              <RotateIcon />
            </button>
            <button type="button" title="Duplicate" aria-label="Duplicate" className={actionClass} onClick={act({ type: 'duplicate', id })}>
              <DuplicateIcon />
            </button>
            <button type="button" title="Delete" aria-label="Delete" className={`${actionClass} hover:text-red-600`} onClick={act({ type: 'delete', ids: [id] })}>
              <TrashIcon />
            </button>
          </>
        }
      />
    </div>
  );
});
