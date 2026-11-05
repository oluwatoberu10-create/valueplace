import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="mb-8 font-display text-5xl leading-none text-wine-800">Checkout</h1>
        <CheckoutForm />
      </div>
    </main>
  );
}
