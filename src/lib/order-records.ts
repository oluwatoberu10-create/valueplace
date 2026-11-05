import "server-only";
import type { Order } from "./order";

/**
 * Optional order storage in Supabase, through its REST API. Runs only on the server,
 * using a key that must never be exposed to the browser. With no credentials the
 * site simply works through WhatsApp alone.
 */

export const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderRecord = {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfilment: "delivery" | "pickup";
  delivery_address: string | null;
  delivery_area: string | null;
  delivery_instructions: string | null;
  notes: string | null;
  items: { name: string; qty: number; unitPrice: number; lineTotal: number; choices: Record<string, string> }[];
  subtotal: number;
  delivery_fee: number | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

function credentials() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function ordersDatabaseConfigured(): boolean {
  return credentials() !== null;
}

async function request(path: string, init: RequestInit & { prefer?: string } = {}) {
  const c = credentials();
  if (!c) throw new Error("Orders database is not configured");
  const { prefer, ...rest } = init;
  const response = await fetch(`${c.url}/rest/v1/${path}`, {
    ...rest,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Orders database returned ${response.status}`);
  }
  return response;
}

export async function insertOrder(order: Order): Promise<void> {
  const { details: d, totals: t } = order;
  await request("orders", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      reference: order.reference,
      customer_name: d.name,
      customer_phone: d.phone,
      customer_email: d.email || null,
      fulfilment: d.method,
      delivery_address: d.address || null,
      delivery_area: d.area || null,
      delivery_instructions: d.deliveryInstructions || null,
      notes: d.notes || null,
      items: order.lines.map((l) => ({
        name: l.name,
        qty: l.qty,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        choices: l.choices,
      })),
      subtotal: t.subtotal,
      delivery_fee: t.deliveryFee,
      total: t.total,
    }),
  });
}

export async function listOrders(limit = 100): Promise<OrderRecord[]> {
  const response = await request(`orders?select=*&order=created_at.desc&limit=${limit}`);
  return response.json();
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await request(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ status }),
  });
}
