"use client";
import { AlertTriangle, Check, CheckCircle2, Copy, MessageCircle, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { restaurant } from "@/config/restaurant";
import { cart, useHydrated } from "@/lib/cart-store";
import { formatWhatsAppMessage, isValidWhatsAppNumber, whatsAppUrl } from "@/lib/order";
import { pendingOrder, usePendingOrder, type PendingOrder } from "@/lib/order-store";
import { OrderSummary } from "./OrderSummary";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost w-full"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check aria-hidden="true" className="size-5" /> : <Copy aria-hidden="true" className="size-5" />}
      {copied ? "Copied" : "Copy order message"}
    </button>
  );
}

function ReadyToSend({ pending }: { pending: PendingOrder }) {
  const { order, stage } = pending;
  const message = formatWhatsAppMessage(order, restaurant.name);
  const canSend = isValidWhatsAppNumber(restaurant.whatsappNumber);
  const url = canSend ? whatsAppUrl(restaurant.whatsappNumber, message) : null;
  const opened = stage === "opened";

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <div>
        <p className="eyebrow text-gold-deep">
          Order reference <span data-testid="reference" className="ml-1 text-ink">{order.reference}</span>
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] text-wine-800 sm:text-5xl">Your order is ready.</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Send the order through WhatsApp to confirm it with the restaurant.
        </p>

        {!canSend && (
          <div role="alert" data-testid="no-whatsapp" className="mt-6 flex gap-3 border-l-2 border-error bg-error/5 p-4">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-error" />
            <div>
              <p className="font-semibold">Online ordering isn&apos;t connected yet</p>
              <p className="mt-1 text-sm text-ink-soft">
                The restaurant&apos;s WhatsApp number hasn&apos;t been added to this website, so this order can&apos;t be
                sent from here. Your order has not been placed.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {url && !opened && (
            <a
              data-testid="open-whatsapp"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => pendingOrder.setStage("opened")}
              className="btn btn-whatsapp w-full !min-h-14 !text-lg"
            >
              <MessageCircle aria-hidden="true" className="size-6" /> Send order on WhatsApp
            </a>
          )}

          {url && opened && (
            <div data-testid="sent-check" className="border border-wine-800/20 bg-paper p-5">
              <p className="font-display text-2xl text-wine-800">Did you press send in WhatsApp?</p>
              <p className="mt-1 text-ink-soft">
                The restaurant only receives your order once the message has been sent.
              </p>
              <button
                type="button"
                data-testid="confirm-sent"
                className="btn btn-primary mt-4 w-full"
                onClick={() => {
                  cart.clear();
                  pendingOrder.setStage("sent");
                }}
              >
                <Check aria-hidden="true" className="size-5" /> Yes, I&apos;ve sent my order
              </button>
              <a
                data-testid="reopen-whatsapp"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost mt-2 w-full"
              >
                <MessageCircle aria-hidden="true" className="size-5" /> Open WhatsApp again
              </a>
            </div>
          )}

          <CopyButton text={message} />
          <Link href="/checkout" className="btn btn-ghost w-full">
            <Pencil aria-hidden="true" className="size-4" /> Change my details
          </Link>
        </div>

        <details className="mt-6 border border-wine-800/15 bg-paper" open>
          <summary className="min-h-12 cursor-pointer px-4 py-3 font-semibold">The message you&apos;ll send</summary>
          <pre data-testid="message-preview" className="border-t border-wine-800/10 p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </pre>
        </details>
      </div>

      <OrderSummary lines={order.lines} totals={order.totals} method={order.details.method} showSampleNotice={order.pricesAreSamples} />
    </div>
  );
}

function Confirmation({ pending }: { pending: PendingOrder }) {
  const router = useRouter();
  const { order } = pending;
  return (
    <div data-testid="confirmation" className="mx-auto max-w-2xl text-center">
      <CheckCircle2 aria-hidden="true" className="mx-auto size-14 text-gold-deep" />
      <h1 className="mt-4 font-display text-4xl leading-[1.05] text-wine-800 sm:text-5xl">
        Thank you, {order.details.name.split(" ")[0]}.
      </h1>
      <p className="mt-4 text-lg text-ink-soft">
        Your order <strong data-testid="reference" className="text-ink">{order.reference}</strong> has gone to the
        restaurant on WhatsApp. They&apos;ll reply there to confirm it
        {order.totals.deliveryPending ? ", along with your delivery charge" : ""}.
      </p>
      <p className="mt-2 text-ink-soft">Please keep your reference in case you need to ask about your order.</p>
      <div className="mt-8 text-left">
        <OrderSummary lines={order.lines} totals={order.totals} method={order.details.method} showSampleNotice={order.pricesAreSamples} />
      </div>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          data-testid="new-order"
          className="btn btn-primary"
          onClick={() => {
            pendingOrder.set(null);
            router.push("/menu");
          }}
        >
          Start a new order
        </button>
        <Link href="/" className="btn btn-ghost">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export function OrderFlow() {
  const hydrated = useHydrated();
  const pending = usePendingOrder();

  if (!hydrated) return <div className="h-96 animate-pulse bg-wine-800/5" aria-label="Loading your order" />;
  if (!pending) {
    return (
      <div data-testid="no-order" className="border border-dashed border-wine-800/30 px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-wine-800">No order in progress</h1>
        <p className="mt-2 text-ink-soft">Choose your meals and head to checkout to get started.</p>
        <Link href="/menu" className="btn btn-primary mt-6">
          Browse the Menu
        </Link>
      </div>
    );
  }
  return pending.stage === "sent" ? <Confirmation pending={pending} /> : <ReadyToSend pending={pending} />;
}
