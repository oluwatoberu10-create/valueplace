/**
 * A tiny localStorage-backed store for useSyncExternalStore: survives refreshes,
 * stays in sync across tabs, and renders its empty value during server rendering.
 */
export function createPersisted<T>(storageKey: string, empty: T, sanitize: (raw: unknown) => T) {
  let value: T = empty;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      value = raw ? sanitize(JSON.parse(raw)) : empty;
    } catch {
      value = empty; // corrupted or blocked storage must never break the page
    }
    loaded = true;
  }

  function onStorage(e: StorageEvent) {
    if (e.key !== storageKey) return;
    load();
    listeners.forEach((l) => l());
  }

  return {
    get(): T {
      if (!loaded) load();
      return value;
    },
    getServer(): T {
      return empty;
    },
    set(next: T) {
      value = next;
      loaded = true;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // storage full or blocked: still works for this page view
      }
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
  };
}
