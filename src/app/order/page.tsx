import type { Metadata } from "next";
import { OrderFlow } from "@/components/OrderFlow";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

export default function OrderPage() {
  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <OrderFlow />
      </div>
    </main>
  );
}
