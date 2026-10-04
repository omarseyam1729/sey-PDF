import { useSyncExternalStore } from 'react';

// Thumbnail object URLs live outside React state so a newly rendered
// thumbnail only re-renders the card that shows it, not the whole grid.
const urls = new Map<string, string>();
const listeners = new Set<() => void>();
let generation = 0;

export const thumbKey = (sourceId: string, pageIndex: number) => `${sourceId}:${pageIndex}`;

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setThumbnail(key: string, url: string) {
  urls.set(key, url);
  notify();
}

/** Bumped by clearThumbnails so in-flight renders know to stop. */
export const thumbnailGeneration = () => generation;

export function clearThumbnails() {
  urls.forEach((url) => URL.revokeObjectURL(url));
  urls.clear();
  generation++;
  notify();
}

export function useThumbnail(key: string): string | undefined {
  return useSyncExternalStore(subscribe, () => urls.get(key));
}
