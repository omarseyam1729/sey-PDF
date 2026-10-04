import { arrayMove } from '@dnd-kit/sortable';
import type { PdfPage, PdfSource, Rotation } from '../types';

export type WorkspaceState = {
  sources: PdfSource[];
  pages: PdfPage[];
  selected: ReadonlySet<string>;
};

export type WorkspaceAction =
  | { type: 'addSource'; source: PdfSource }
  | { type: 'move'; activeId: string; overId: string }
  | { type: 'rotate'; ids: string[] }
  | { type: 'duplicate'; id: string }
  | { type: 'delete'; ids: string[] }
  | { type: 'toggleSelect'; id: string }
  | { type: 'clearSelection' }
  | { type: 'reset' };

export const initialWorkspace: WorkspaceState = {
  sources: [],
  pages: [],
  selected: new Set(),
};

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'addSource': {
      const { source } = action;
      const newPages = Array.from({ length: source.pageCount }, (_, i) => ({
        id: crypto.randomUUID(),
        sourceId: source.id,
        sourcePageIndex: i,
        rotation: 0 as const,
      }));
      return {
        ...state,
        sources: [...state.sources, source],
        pages: [...state.pages, ...newPages],
      };
    }

    case 'move': {
      const from = state.pages.findIndex((p) => p.id === action.activeId);
      const to = state.pages.findIndex((p) => p.id === action.overId);
      if (from === -1 || to === -1 || from === to) return state;
      return { ...state, pages: arrayMove(state.pages, from, to) };
    }

    case 'rotate': {
      const ids = new Set(action.ids);
      return {
        ...state,
        pages: state.pages.map((p) =>
          ids.has(p.id) ? { ...p, rotation: ((p.rotation + 90) % 360) as Rotation } : p,
        ),
      };
    }

    case 'duplicate': {
      const index = state.pages.findIndex((p) => p.id === action.id);
      if (index === -1) return state;
      const copy = { ...state.pages[index], id: crypto.randomUUID() };
      return { ...state, pages: state.pages.toSpliced(index + 1, 0, copy) };
    }

    case 'delete': {
      const ids = new Set(action.ids);
      const selected = new Set(state.selected);
      ids.forEach((id) => selected.delete(id));
      return { ...state, pages: state.pages.filter((p) => !ids.has(p.id)), selected };
    }

    case 'toggleSelect': {
      const selected = new Set(state.selected);
      if (!selected.delete(action.id)) selected.add(action.id);
      return { ...state, selected };
    }

    case 'clearSelection':
      return state.selected.size === 0 ? state : { ...state, selected: new Set() };

    case 'reset':
      return initialWorkspace;
  }
}
