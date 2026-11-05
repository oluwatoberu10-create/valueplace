"use client";
import { useSyncExternalStore } from "react";
import type { Order } from "./order";
import { createPersisted } from "./persisted";

/**
 * The order being sent. Persisted because tapping through to WhatsApp can unload
 * this page on a phone, and the customer needs to find it when they come back.
 *   ready   prepared, not sent yet
 *   opened  WhatsApp has been opened at least once
 *   sent    the customer told us they pressed send in WhatsApp
 */
export type OrderStage = "ready" | "opened" | "sent";
export type PendingOrder = { order: Order; stage: OrderStage };

function sanitize(raw: unknown): PendingOrder | null {
  const p = raw as PendingOrder | null;
  if (!p || !p.order?.reference || !Array.isArray(p.order.lines)) return null;
  if (!p.order.details || !p.order.totals) return null;
  return p.stage === "ready" || p.stage === "opened" || p.stage === "sent" ? p : null;
}

const store = createPersisted<PendingOrder | null>("vpp-order-v1", null, sanitize);

export const pendingOrder = {
  get: () => store.get(),
  set: (p: PendingOrder | null) => store.set(p),
  setStage(stage: OrderStage) {
    const current = store.get();
    if (current) store.set({ ...current, stage });
  },
};

export function usePendingOrder() {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}
