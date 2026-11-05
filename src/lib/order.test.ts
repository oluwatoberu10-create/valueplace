import { describe, expect, it } from "vitest";
import {
  buildOrder,
  choicesAreValid,
  computeTotals,
  formatNaira,
  formatWhatsAppMessage,
  isValidWhatsAppNumber,
  lineKey,
  makeReference,
  priceLines,
  REFERENCE_PATTERN,
  validateDetails,
  whatsAppUrl,
  type CartLine,
  type CheckoutDetails,
} from "./order";
import type { MenuItem } from "@/config/menu";

const menu: MenuItem[] = [
  { id: "a", name: "Rice", description: "", price: 2500, category: "rice-yam", image: null },
  {
    id: "b",
    name: "Soup",
    description: "",
    price: 1000,
    category: "soups",
    image: null,
    options: [{ name: "Swallow", choices: ["Eba", "Fufu"] }],
  },
];
const cart: CartLine[] = [
  { key: "a", itemId: "a", choices: {}, qty: 2 },
  { key: "b|Swallow=Eba", itemId: "b", choices: { Swallow: "Eba" }, qty: 3 },
];
const details: CheckoutDetails = {
  name: " Ada Obi ",
  phone: "0801 234 5678",
  email: "",
  method: "delivery",
  address: "12 Sample Street",
  area: "Sample Area",
  deliveryInstructions: "",
  notes: "Extra pepper",
};
const order = (over: Partial<CheckoutDetails> = {}, fee: number | null = null, samples = false) =>
  buildOrder({
    cart,
    details: { ...details, ...over },
    reference: "VP-ABC234",
    now: new Date(0),
    deliveryFee: fee,
    pricesAreSamples: samples,
    menu,
  });

describe("totals", () => {
  const lines = priceLines(cart, menu);
  it("multiplies quantity by unit price", () => {
    expect(lines.map((l) => l.lineTotal)).toEqual([5000, 3000]);
  });
  it("leaves delivery unconfirmed when no fee is configured", () => {
    expect(computeTotals(lines, "delivery", null)).toEqual({
      subtotal: 8000,
      deliveryFee: null,
      total: 8000,
      deliveryPending: true,
    });
  });
  it("adds a configured fee to delivery", () => {
    expect(computeTotals(lines, "delivery", 1500)).toMatchObject({
      deliveryFee: 1500,
      total: 9500,
      deliveryPending: false,
    });
  });
  it("treats a zero fee as free delivery, not as unconfirmed", () => {
    expect(computeTotals(lines, "delivery", 0)).toMatchObject({
      deliveryFee: 0,
      total: 8000,
      deliveryPending: false,
    });
  });
  it("never charges delivery on pickup", () => {
    expect(computeTotals(lines, "pickup", 1500)).toMatchObject({
      deliveryFee: 0,
      total: 8000,
      deliveryPending: false,
    });
    expect(computeTotals(lines, "pickup", null).deliveryPending).toBe(false);
  });
  it("drops lines for meals no longer on the menu", () => {
    expect(priceLines([{ key: "x", itemId: "gone", choices: {}, qty: 1 }], menu)).toEqual([]);
  });
});

describe("validation", () => {
  it("accepts a complete delivery order and a pickup order without an address", () => {
    expect(validateDetails(details)).toEqual({});
    expect(validateDetails({ ...details, method: "pickup", address: "", area: "" })).toEqual({});
  });
  it("requires address and area only for delivery", () => {
    expect(Object.keys(validateDetails({ ...details, address: "", area: "" }))).toEqual([
      "address",
      "area",
    ]);
  });
  it.each(["", "123", "not a phone", "0801234567890123456"])("rejects phone %j", (phone) => {
    expect(validateDetails({ ...details, phone }).phone).toBeTruthy();
  });
  it.each(["08012345678", "+234 801 234 5678", "(0801) 234-5678"])("accepts phone %j", (phone) => {
    expect(validateDetails({ ...details, phone }).phone).toBeUndefined();
  });
  it("email is optional but checked when given", () => {
    expect(validateDetails({ ...details, email: "nope" }).email).toBeTruthy();
    expect(validateDetails({ ...details, email: "a@b.co" }).email).toBeUndefined();
  });
  it("rejects overly long fields", () => {
    expect(validateDetails({ ...details, notes: "x".repeat(501) }).notes).toBeTruthy();
  });
  it("checks option choices against the menu", () => {
    expect(choicesAreValid(menu[1], { Swallow: "Eba" })).toBe(true);
    expect(choicesAreValid(menu[1], { Swallow: "Pizza" })).toBe(false);
    expect(choicesAreValid(menu[1], {})).toBe(false);
    expect(choicesAreValid(menu[0], { Swallow: "Eba" })).toBe(false);
  });
});

describe("cart line keys", () => {
  it("separates meals by choice and ignores key order", () => {
    expect(lineKey("b", { Swallow: "Eba" })).not.toBe(lineKey("b", { Swallow: "Fufu" }));
    expect(lineKey("b", { x: "1", y: "2" })).toBe(lineKey("b", { y: "2", x: "1" }));
  });
});

describe("references", () => {
  it("match the published pattern", () => {
    for (let i = 0; i < 200; i++) expect(makeReference()).toMatch(REFERENCE_PATTERN);
  });
});

describe("whatsapp message", () => {
  it("contains every required field for delivery", () => {
    expect(formatWhatsAppMessage(order({}, 1500), "Value Plus Place Restaurant")).toBe(
      [
        "VALUE PLUS PLACE RESTAURANT — NEW ORDER",
        "",
        "Order Reference: VP-ABC234",
        "",
        "Customer: Ada Obi",
        "Phone: 0801 234 5678",
        "",
        "Order Type: Delivery",
        "Address: 12 Sample Street",
        "Area: Sample Area",
        "",
        "ORDER ITEMS:",
        "",
        "1. Rice × 2 @ ₦2,500 — ₦5,000",
        "2. Soup (Eba) × 3 @ ₦1,000 — ₦3,000",
        "",
        "Subtotal: ₦8,000",
        "Delivery: ₦1,500",
        "",
        "TOTAL: ₦9,500",
        "",
        "Special Instructions: Extra pepper",
      ].join("\n"),
    );
  });
  it("says delivery is unconfirmed and does not call the figure final", () => {
    const m = formatWhatsAppMessage(order(), "X");
    expect(m).toContain("Delivery: To be confirmed");
    expect(m).toContain("TOTAL (before delivery): ₦8,000");
  });
  it("leaves delivery fields out of pickup orders even if they were typed", () => {
    const m = formatWhatsAppMessage(order({ method: "pickup" }, 1500), "X");
    expect(m).toContain("Order Type: Pickup");
    expect(m).not.toMatch(/Address|Area|Delivery/);
    expect(m).toContain("TOTAL: ₦8,000");
  });
  it("flags sample prices", () => {
    expect(formatWhatsAppMessage(order({}, null, true), "X")).toContain("sample website prices");
  });
});

describe("whatsapp url", () => {
  it("encodes newlines, naira signs and ampersands", () => {
    const url = whatsAppUrl("2340000000000", "A & B\n₦5,000");
    expect(url.startsWith("https://wa.me/2340000000000?text=")).toBe(true);
    expect(new URL(url).searchParams.get("text")).toBe("A & B\n₦5,000");
  });
  it("requires international digits", () => {
    expect(isValidWhatsAppNumber("")).toBe(false);
    expect(isValidWhatsAppNumber("08000000000")).toBe(false);
    expect(isValidWhatsAppNumber("+2340000000000")).toBe(false);
    expect(isValidWhatsAppNumber("2340000000000")).toBe(true);
  });
});

describe("formatNaira", () => {
  it("groups thousands", () => {
    expect(formatNaira(1234567)).toBe("₦1,234,567");
    expect(formatNaira(0)).toBe("₦0");
  });
});
