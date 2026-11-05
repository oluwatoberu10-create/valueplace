import { NextResponse } from "next/server";
import { menu } from "@/config/menu";
import { restaurant } from "@/config/restaurant";
import {
  buildOrder,
  choicesAreValid,
  lineKey,
  MAX_LINES,
  MAX_QTY,
  REFERENCE_PATTERN,
  validateDetails,
  type CartLine,
  type CheckoutDetails,
} from "@/lib/order";
import { insertOrder, ordersDatabaseConfigured } from "@/lib/order-records";
import { allowRequest } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 32 * 1024;

function bad(error: string, status = 400) {
  return NextResponse.json({ recorded: false, error }, { status });
}

function parseDetails(raw: unknown): CheckoutDetails | null {
  const d = raw as Record<string, unknown> | null;
  if (!d || typeof d !== "object") return null;
  const fields = ["name", "phone", "email", "address", "area", "deliveryInstructions", "notes"] as const;
  if (fields.some((f) => typeof d[f] !== "string")) return null;
  if (d.method !== "delivery" && d.method !== "pickup") return null;
  return d as unknown as CheckoutDetails;
}

/** Rebuilds cart lines from the menu: the browser's prices and names are never trusted. */
function parseLines(raw: unknown): CartLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LINES) return null;
  const lines: CartLine[] = [];
  for (const entry of raw) {
    const item = menu.find((m) => m.id === entry?.itemId);
    if (!item || !Number.isInteger(entry.qty) || entry.qty < 1 || entry.qty > MAX_QTY) return null;
    const choices = entry.choices;
    if (!choices || typeof choices !== "object" || !choicesAreValid(item, choices)) return null;
    lines.push({ key: lineKey(item.id, choices), itemId: item.id, choices, qty: entry.qty });
  }
  return lines;
}

export async function POST(request: Request) {
  if (!ordersDatabaseConfigured()) {
    return NextResponse.json({ recorded: false, reason: "not-configured" });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`order:${ip}`, 60, 10 * 60 * 1000)) return bad("Too many requests", 429);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return bad("Request too large", 413);

  let body: { reference?: unknown; details?: unknown; lines?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return bad("Invalid JSON");
  }

  if (typeof body?.reference !== "string" || !REFERENCE_PATTERN.test(body.reference)) {
    return bad("Invalid reference");
  }
  const details = parseDetails(body.details);
  if (!details || Object.keys(validateDetails(details)).length > 0) return bad("Invalid details");
  const lines = parseLines(body.lines);
  if (!lines) return bad("Invalid order items");

  const order = buildOrder({
    cart: lines,
    details,
    reference: body.reference,
    now: new Date(),
    deliveryFee: restaurant.deliveryFee,
    pricesAreSamples: restaurant.pricesAreSamples,
  });

  try {
    await insertOrder(order);
    return NextResponse.json({ recorded: true, reference: order.reference });
  } catch (error) {
    console.error("Could not record order", order.reference, error);
    return NextResponse.json({ recorded: false }, { status: 502 });
  }
}
