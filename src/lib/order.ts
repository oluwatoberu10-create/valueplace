/** Pure order logic shared by the browser and the server. No React, no storage. */
import { menu as defaultMenu, type MenuItem } from "@/config/menu";

export type CartLine = {
  /** Unique per meal + chosen options, so "Egusi / Eba" and "Egusi / Fufu" are separate lines. */
  key: string;
  itemId: string;
  choices: Record<string, string>;
  qty: number;
};

export type PricedLine = CartLine & {
  name: string;
  image: string | null;
  unitPrice: number;
  lineTotal: number;
};

export type FulfilmentMethod = "delivery" | "pickup";

export type CheckoutDetails = {
  name: string;
  phone: string;
  email: string;
  method: FulfilmentMethod;
  address: string;
  area: string;
  deliveryInstructions: string;
  notes: string;
};

export type Totals = {
  subtotal: number;
  /** null means "to be confirmed by the restaurant". */
  deliveryFee: number | null;
  total: number;
  deliveryPending: boolean;
};

export type Order = {
  reference: string;
  createdAt: string;
  details: CheckoutDetails;
  lines: PricedLine[];
  totals: Totals;
  pricesAreSamples: boolean;
};

export const MAX_QTY = 99;
export const MAX_LINES = 50;

const LIMITS = {
  name: 80,
  phone: 24,
  email: 120,
  address: 240,
  area: 100,
  deliveryInstructions: 400,
  notes: 500,
};

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function lineKey(itemId: string, choices: Record<string, string>): string {
  const parts = Object.keys(choices)
    .sort()
    .map((k) => `${k}=${choices[k]}`);
  return [itemId, ...parts].join("|");
}

export function describeChoices(choices: Record<string, string>): string {
  return Object.values(choices).join(", ");
}

/** Attach current menu names and prices. Lines for meals no longer on the menu are dropped. */
export function priceLines(lines: CartLine[], menu: MenuItem[] = defaultMenu): PricedLine[] {
  return lines.flatMap((line) => {
    const item = menu.find((m) => m.id === line.itemId);
    if (!item) return [];
    return [
      {
        ...line,
        name: item.name,
        image: item.image,
        unitPrice: item.price,
        lineTotal: item.price * line.qty,
      },
    ];
  });
}

export function computeTotals(
  lines: PricedLine[],
  method: FulfilmentMethod,
  configuredFee: number | null,
): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const deliveryFee = method === "pickup" ? 0 : configuredFee;
  return {
    subtotal,
    deliveryFee,
    total: subtotal + (deliveryFee ?? 0),
    deliveryPending: deliveryFee === null,
  };
}

export type DetailErrors = Partial<Record<keyof CheckoutDetails, string>>;

export function validateDetails(d: CheckoutDetails): DetailErrors {
  const errors: DetailErrors = {};
  if (d.name.trim().length < 2) errors.name = "Please enter your full name.";
  const digits = d.phone.replace(/[\s()-]/g, "").replace(/^\+/, "");
  if (!/^\d{10,15}$/.test(digits)) {
    errors.phone = "Please enter a valid phone number, including the area code.";
  }
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) {
    errors.email = "That email address doesn't look right. You can also leave it blank.";
  }
  if (d.method !== "delivery" && d.method !== "pickup") {
    errors.method = "Please choose delivery or pickup.";
  }
  if (d.method === "delivery") {
    if (d.address.trim().length < 5) errors.address = "Please enter your delivery address.";
    if (d.area.trim().length < 2) errors.area = "Please enter your area or neighbourhood.";
  }
  for (const [field, max] of Object.entries(LIMITS) as [keyof typeof LIMITS, number][]) {
    if (d[field].length > max) errors[field] = `Please keep this under ${max} characters.`;
  }
  return errors;
}

/** Choices must exactly match what the menu offers, with every option answered. */
export function choicesAreValid(item: MenuItem, choices: Record<string, string>): boolean {
  const options = item.options ?? [];
  if (Object.keys(choices).length !== options.length) return false;
  return options.every((o) => o.choices.includes(choices[o.name]));
}

export function makeReference(
  random: Uint8Array = crypto.getRandomValues(new Uint8Array(6)),
): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O or 1/I/L: easy to read over the phone
  return `VP-${Array.from(random, (b) => alphabet[b % alphabet.length]).join("")}`;
}

export const REFERENCE_PATTERN = /^VP-[2-9A-HJKMNP-Z]{6}$/;

/** Removes delivery fields from pickup orders so stale typed-in addresses never travel. */
export function cleanDetails(d: CheckoutDetails): CheckoutDetails {
  const delivery = d.method === "delivery";
  return {
    name: d.name.trim(),
    phone: d.phone.trim(),
    email: d.email.trim(),
    method: d.method,
    address: delivery ? d.address.trim() : "",
    area: delivery ? d.area.trim() : "",
    deliveryInstructions: delivery ? d.deliveryInstructions.trim() : "",
    notes: d.notes.trim(),
  };
}

export function buildOrder(args: {
  cart: CartLine[];
  details: CheckoutDetails;
  reference: string;
  now: Date;
  deliveryFee: number | null;
  pricesAreSamples: boolean;
  menu?: MenuItem[];
}): Order {
  const details = cleanDetails(args.details);
  const lines = priceLines(args.cart, args.menu);
  return {
    reference: args.reference,
    createdAt: args.now.toISOString(),
    details,
    lines,
    totals: computeTotals(lines, details.method, args.deliveryFee),
    pricesAreSamples: args.pricesAreSamples,
  };
}

export function formatWhatsAppMessage(order: Order, restaurantName: string): string {
  const { details: d, totals: t } = order;
  const out: string[] = [
    `${restaurantName.toUpperCase()} — NEW ORDER`,
    "",
    `Order Reference: ${order.reference}`,
    "",
    `Customer: ${d.name}`,
    `Phone: ${d.phone}`,
  ];
  if (d.email) out.push(`Email: ${d.email}`);
  out.push("", `Order Type: ${d.method === "delivery" ? "Delivery" : "Pickup"}`);
  if (d.method === "delivery") {
    out.push(`Address: ${d.address}`, `Area: ${d.area}`);
    if (d.deliveryInstructions) out.push(`Delivery Instructions: ${d.deliveryInstructions}`);
  }
  out.push("", "ORDER ITEMS:", "");
  order.lines.forEach((l, i) => {
    const choices = describeChoices(l.choices);
    out.push(
      `${i + 1}. ${l.name}${choices ? ` (${choices})` : ""} × ${l.qty} @ ${formatNaira(l.unitPrice)} — ${formatNaira(l.lineTotal)}`,
    );
  });
  out.push("", `Subtotal: ${formatNaira(t.subtotal)}`);
  if (d.method === "delivery") {
    out.push(`Delivery: ${t.deliveryFee === null ? "To be confirmed" : formatNaira(t.deliveryFee)}`);
  }
  out.push(
    "",
    t.deliveryPending
      ? `TOTAL (before delivery): ${formatNaira(t.total)}`
      : `TOTAL: ${formatNaira(t.total)}`,
  );
  if (d.notes) out.push("", `Special Instructions: ${d.notes}`);
  if (order.pricesAreSamples) {
    out.push("", "(Note: sample website prices. Please confirm the final amount.)");
  }
  return out.join("\n");
}

/** International format, digits only, no leading zero. */
export function isValidWhatsAppNumber(number: string): boolean {
  return /^[1-9]\d{7,14}$/.test(number);
}

export function whatsAppUrl(number: string, message?: string): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
