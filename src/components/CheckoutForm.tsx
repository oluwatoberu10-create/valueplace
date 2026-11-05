"use client";
import { Bike, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { restaurant } from "@/config/restaurant";
import { useCart, useHydrated } from "@/lib/cart-store";
import {
  buildOrder,
  computeTotals,
  makeReference,
  validateDetails,
  type CartLine,
  type CheckoutDetails,
  type DetailErrors,
} from "@/lib/order";
import { pendingOrder } from "@/lib/order-store";
import { OrderSummary } from "./OrderSummary";

const BLANK: CheckoutDetails = {
  name: "",
  phone: "",
  email: "",
  method: "delivery",
  address: "",
  area: "",
  deliveryInstructions: "",
  notes: "",
};

/** Best effort: if no database is connected or the request fails, ordering carries on. */
async function recordOrder(reference: string, details: CheckoutDetails, lines: CartLine[]) {
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, details, lines }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // The WhatsApp message is what really places the order.
  }
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
        {optional && <span className="ml-1.5 text-sm font-normal text-ink-soft">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function MethodChoice({
  value,
  current,
  icon: Icon,
  title,
  onChange,
}: {
  value: CheckoutDetails["method"];
  current: CheckoutDetails["method"];
  icon: typeof Bike;
  title: string;
  onChange: (v: CheckoutDetails["method"]) => void;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center gap-3 border border-wine-800/25 bg-paper px-4 has-checked:border-wine-800 has-checked:bg-wine-800/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold-deep">
      <input
        type="radio"
        name="method"
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="size-4 accent-wine-800"
      />
      <Icon aria-hidden="true" className="size-5 text-wine-800" />
      <span className="font-semibold">{title}</span>
    </label>
  );
}

function CheckoutFormInner({ initial }: { initial: CheckoutDetails }) {
  const router = useRouter();
  const { lines, raw } = useCart();
  const [details, setDetails] = useState(initial);
  const [errors, setErrors] = useState<DetailErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof CheckoutDetails>(key: K, value: CheckoutDetails[K]) => {
    setDetails((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const input = (key: Exclude<keyof CheckoutDetails, "method">) => ({
    id: key,
    name: key,
    value: details[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
    className: "field w-full",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const found = validateDetails(details);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
      return;
    }
    setSubmitting(true);
    const order = buildOrder({
      cart: raw,
      details,
      reference: makeReference(),
      now: new Date(),
      deliveryFee: restaurant.deliveryFee,
      pricesAreSamples: restaurant.pricesAreSamples,
    });
    await recordOrder(order.reference, order.details, raw);
    pendingOrder.set({ order, stage: "ready" });
    router.push("/order");
  }

  const totals = computeTotals(lines, details.method, restaurant.deliveryFee);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-9" data-testid="checkout-form">
        <fieldset className="space-y-5">
          <legend className="mb-4 font-display text-2xl text-wine-800">Your details</legend>
          <Field id="name" label="Full name" error={errors.name}>
            <input {...input("name")} type="text" autoComplete="name" />
          </Field>
          <Field id="phone" label="Phone number" error={errors.phone}>
            <input {...input("phone")} type="tel" inputMode="tel" autoComplete="tel" />
          </Field>
          <Field id="email" label="Email address" optional error={errors.email}>
            <input {...input("email")} type="email" inputMode="email" autoComplete="email" />
          </Field>
        </fieldset>

        <fieldset>
          <legend className="mb-4 font-display text-2xl text-wine-800">How would you like your order?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <MethodChoice value="delivery" current={details.method} icon={Bike} title="Delivery" onChange={(v) => set("method", v)} />
            <MethodChoice value="pickup" current={details.method} icon={Store} title="Pickup" onChange={(v) => set("method", v)} />
          </div>

          {details.method === "delivery" ? (
            <div className="mt-5 space-y-5" data-testid="delivery-fields">
              <Field id="address" label="Delivery address" error={errors.address}>
                <input {...input("address")} type="text" autoComplete="street-address" />
              </Field>
              <Field id="area" label="Area or neighbourhood" error={errors.area}>
                <input {...input("area")} type="text" autoComplete="address-level2" />
              </Field>
              <Field id="deliveryInstructions" label="Additional delivery instructions" optional error={errors.deliveryInstructions}>
                <textarea {...input("deliveryInstructions")} rows={2} />
              </Field>
            </div>
          ) : (
            <p className="mt-4 border-l-2 border-gold bg-gold/10 px-3 py-2.5 text-sm text-ink-soft" data-testid="pickup-note">
              {restaurant.address
                ? `Collect your order from ${restaurant.address}.`
                : "The restaurant will confirm the pickup details on WhatsApp."}
            </p>
          )}
        </fieldset>

        <Field id="notes" label="Any special instructions for your order?" optional error={errors.notes}>
          <textarea {...input("notes")} rows={3} />
        </Field>

        {/* On phones the summary sits above the button, so people see the total before continuing. */}
        <div className="lg:hidden">
          <OrderSummary lines={lines} totals={totals} method={details.method} />
        </div>

        <div>
          <button type="submit" disabled={submitting} className="btn btn-primary w-full !min-h-14 !text-lg">
            {submitting ? "Preparing your order…" : "Continue to WhatsApp"}
          </button>
          <p className="mt-2 text-center text-sm text-ink-soft">
            You&apos;ll review your order before sending it to the restaurant.
          </p>
        </div>
      </form>

      <div className="sticky top-28 hidden lg:block">
        <OrderSummary lines={lines} totals={totals} method={details.method} />
      </div>
    </div>
  );
}

export function CheckoutForm() {
  const hydrated = useHydrated();
  const { lines } = useCart();

  if (!hydrated) {
    return <div className="h-96 animate-pulse bg-wine-800/5" aria-label="Loading checkout" />;
  }
  if (lines.length === 0) {
    return (
      <div data-testid="empty-checkout" className="border border-dashed border-wine-800/30 px-6 py-20 text-center">
        <ShoppingBag aria-hidden="true" className="mx-auto size-10 text-gold-deep" />
        <p className="mt-4 font-display text-3xl text-wine-800">Your cart is empty</p>
        <p className="mt-2 text-ink-soft">Choose a meal from the menu to start your order.</p>
        <Link href="/menu" className="btn btn-primary mt-6">
          Browse the Menu
        </Link>
      </div>
    );
  }
  // Coming back to edit keeps what they already typed.
  const previous = pendingOrder.get();
  const initial = previous && previous.stage !== "sent" ? previous.order.details : BLANK;
  return <CheckoutFormInner initial={initial} />;
}
