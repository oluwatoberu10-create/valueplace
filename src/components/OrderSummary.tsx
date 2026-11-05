import { describeChoices, formatNaira, type FulfilmentMethod, type PricedLine, type Totals } from "@/lib/order";
import { SampleNotice } from "./ui";

export function OrderSummary({
  lines,
  totals,
  method,
  showSampleNotice = true,
}: {
  lines: PricedLine[];
  totals: Totals;
  method: FulfilmentMethod;
  showSampleNotice?: boolean;
}) {
  return (
    <section className="border border-wine-800/15 bg-paper p-5 sm:p-6">
      <h2 className="font-display text-2xl text-wine-800">Order summary</h2>
      <ul className="mt-4 divide-y divide-wine-800/10">
        {lines.map((l) => (
          <li key={l.key} data-testid="summary-line" className="flex justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold">
                {l.name} <span className="font-normal text-ink-soft">× {l.qty}</span>
              </p>
              {Object.keys(l.choices).length > 0 && (
                <p className="text-sm text-ink-soft">{describeChoices(l.choices)}</p>
              )}
              <p className="text-sm text-ink-soft tabular-nums">{formatNaira(l.unitPrice)} each</p>
            </div>
            <p className="font-semibold tabular-nums">{formatNaira(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-1.5 border-t border-wine-800/20 pt-3">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd data-testid="summary-subtotal" className="tabular-nums">{formatNaira(totals.subtotal)}</dd>
        </div>
        {method === "delivery" && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Delivery</dt>
            <dd data-testid="summary-delivery" className="text-right tabular-nums">
              {totals.deliveryFee === null ? "To be confirmed" : formatNaira(totals.deliveryFee)}
            </dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4 pt-2">
          <dt className="font-display text-xl text-wine-800">
            Total
            {totals.deliveryPending && <span className="ml-1 font-sans text-sm text-ink-soft">(before delivery)</span>}
          </dt>
          <dd data-testid="summary-total" className="text-xl font-bold tabular-nums">{formatNaira(totals.total)}</dd>
        </div>
      </dl>
      {totals.deliveryPending && (
        <p className="mt-2 text-sm text-ink-soft">The restaurant will confirm the delivery charge on WhatsApp.</p>
      )}
      {showSampleNotice && <SampleNotice className="mt-4" />}
    </section>
  );
}
