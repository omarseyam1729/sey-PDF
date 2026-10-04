import { useSyncExternalStore } from 'react';

// A tiny pushState router: the app only has a handful of flat routes.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

export function usePath() {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

export function navigate(path: string) {
  if (path === window.location.pathname) return;
  window.history.pushState(null, '', path);
  listeners.forEach((listener) => listener());
  window.scrollTo(0, 0);
}
