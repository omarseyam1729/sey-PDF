import {
  type Announcements,
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMemo, useState, type Dispatch } from 'react';
import type { WorkspaceAction, WorkspaceState } from '../store/workspace';
import type { PdfPage } from '../types';
import { PageCard, PageThumb, type PageInfo } from './PageCard';

const SOURCE_COLORS = [
  'bg-sky-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-teal-500',
];

type Props = {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
};

export function PageGrid({ state, dispatch }: Props) {
  const { pages, sources, selected } = state;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Long-press to drag on touch screens so swiping still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sourceInfo = useMemo(
    () =>
      new Map(
        sources.map((s, i) => [s.id, { name: s.name, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }]),
      ),
    [sources],
  );
  const ids = useMemo(() => pages.map((p) => p.id), [pages]);

  const info = (page: PdfPage, index: number): PageInfo => {
    const source = sourceInfo.get(page.sourceId)!;
    return { page, number: index + 1, sourceName: source.name, sourceColor: source.color };
  };

  const activeIndex = activeId ? pages.findIndex((p) => p.id === activeId) : -1;

  // Screen reader announcements in page positions instead of internal ids.
  const position = (id: UniqueIdentifier) => pages.findIndex((p) => p.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up page ${position(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `Page ${position(active.id)} is over position ${position(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Page ${position(active.id)} was moved to position ${position(over.id)}.`
        : `Page ${position(active.id)} was dropped.`,
    onDragCancel: ({ active }) => `Moving page ${position(active.id)} was cancelled.`,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ announcements }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        if (over) dispatch({ type: 'move', activeId: String(active.id), overId: String(over.id) });
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
          {pages.map((page, i) => (
            <PageCard
              key={page.id}
              {...info(page, i)}
              selected={selected.has(page.id)}
              dispatch={dispatch}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeIndex !== -1 && (
          <div className="cursor-grabbing">
            <PageThumb {...info(pages[activeIndex], activeIndex)} lifted />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
