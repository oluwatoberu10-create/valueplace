"use client";
import { useMemo, useSyncExternalStore } from "react";
import { MAX_LINES, MAX_QTY, lineKey, priceLines, type CartLine } from "./order";
import { createPersisted } from "./persisted";

const EMPTY: CartLine[] = [];

function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return EMPTY;
  return raw.filter(
    (l): l is CartLine =>
      l &&
      typeof l.key === "string" &&
      typeof l.itemId === "string" &&
      typeof l.choices === "object" &&
      l.choices !== null &&
      Number.isInteger(l.qty) &&
      l.qty >= 1 &&
      l.qty <= MAX_QTY,
  );
}

const store = createPersisted<CartLine[]>("vpp-cart-v1", EMPTY, sanitize);

export const cart = {
  add(itemId: string, choices: Record<string, string> = {}, qty = 1) {
    const key = lineKey(itemId, choices);
    const lines = store.get();
    const existing = lines.find((l) => l.key === key);
    if (existing) {
      store.set(
        lines.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l)),
      );
    } else if (lines.length < MAX_LINES) {
      store.set([...lines, { key, itemId, choices, qty }]);
    }
  },
  setQty(key: string, qty: number) {
    if (qty < 1) return cart.remove(key);
    store.set(store.get().map((l) => (l.key === key ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)));
  },
  remove(key: string) {
    store.set(store.get().filter((l) => l.key !== key));
  },
  clear() {
    store.set(EMPTY);
  },
};

export function useCart() {
  const raw = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  return useMemo(() => {
    const lines = priceLines(raw);
    return {
      lines,
      /** The unpriced lines, for building an order. */
      raw,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
    };
  }, [raw]);
}

const noopSubscribe = () => () => {};
/** False during server rendering and the first client render, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Open/closed state of the cart drawer. */
let drawerOpen = false;
const drawerListeners = new Set<() => void>();
export const cartDrawer = {
  open() {
    drawerOpen = true;
    drawerListeners.forEach((l) => l());
  },
  close() {
    drawerOpen = false;
    drawerListeners.forEach((l) => l());
  },
};
export function useCartDrawerOpen() {
  return useSyncExternalStore(
    (l) => {
      drawerListeners.add(l);
      return () => drawerListeners.delete(l);
    },
    () => drawerOpen,
    () => false,
  );
}
