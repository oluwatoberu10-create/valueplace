"use client";
import { ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cart, cartDrawer, useCart, useCartDrawerOpen } from "@/lib/cart-store";
import { describeChoices, formatNaira } from "@/lib/order";
import { QuantityStepper } from "./QuantityStepper";
import { MealImage, SampleNotice } from "./ui";

export function CartDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useCartDrawerOpen();
  const { lines, subtotal, count } = useCart();
  const close = () => cartDrawer.close();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="cart-title"
      data-testid="cart-drawer"
      className="cart-drawer ml-auto h-dvh max-h-none w-full max-w-md bg-paper p-0 text-ink backdrop:bg-ink/60"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-wine-800/15 px-5 py-4">
          <h2 id="cart-title" className="font-display text-3xl text-wine-800">
            Your cart{count > 0 && <span className="ml-2 text-lg text-ink-soft tabular-nums">({count})</span>}
          </h2>
          <button type="button" aria-label="Close cart" onClick={close} className="-mr-2 flex size-11 items-center justify-center text-wine-800">
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag aria-hidden="true" className="size-10 text-gold-deep" />
            <p className="mt-4 font-display text-2xl text-wine-800">Your cart is empty</p>
            <p className="mt-1 text-ink-soft">Add a meal and it will show up here.</p>
            <Link href="/menu" onClick={close} className="btn btn-primary mt-6">
              Browse the Menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-wine-800/10 overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.key} data-testid="cart-line" className="flex gap-3.5 py-4">
                  <MealImage src={line.image} alt="" sizes="80px" className="size-20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="leading-snug font-semibold">{line.name}</h3>
                        {Object.keys(line.choices).length > 0 && (
                          <p className="text-sm text-ink-soft">{describeChoices(line.choices)}</p>
                        )}
                        <p className="text-sm text-ink-soft tabular-nums">{formatNaira(line.unitPrice)} each</p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name} from cart`}
                        onClick={() => cart.remove(line.key)}
                        className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center text-ink-soft hover:text-error"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QuantityStepper value={line.qty} label={line.name} onChange={(q) => cart.setQty(line.key, q)} />
                      <p data-testid="line-total" className="font-semibold tabular-nums">
                        {formatNaira(line.lineTotal)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-wine-800/15 px-5 pt-4 pb-5">
              <SampleNotice className="mb-3 !text-xs" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-soft">Subtotal</span>
                <span data-testid="cart-subtotal" className="tabular-nums">{formatNaira(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-display text-xl text-wine-800">Cart total</span>
                <span data-testid="cart-total" className="text-xl font-bold tabular-nums">{formatNaira(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">Any delivery charge is shown at checkout.</p>
              <Link href="/checkout" onClick={close} className="btn btn-primary mt-4 w-full">
                Proceed to Checkout
              </Link>
              <button type="button" onClick={close} className="btn btn-ghost mt-2 w-full">
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

/** Always-visible way into the cart on small screens. */
export function MobileCartBar() {
  const { count, subtotal } = useCart();
  const pathname = usePathname();
  const hidden = pathname.startsWith("/checkout") || pathname.startsWith("/order") || pathname.startsWith("/admin");
  if (count === 0 || hidden) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-wine-900 bg-paper p-3 lg:hidden">
      <button
        type="button"
        data-testid="mobile-cart-bar"
        onClick={() => cartDrawer.open()}
        className="btn btn-primary w-full !justify-between"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag aria-hidden="true" className="size-5" />
          View cart ({count})
        </span>
        <span className="tabular-nums">{formatNaira(subtotal)}</span>
      </button>
    </div>
  );
}
