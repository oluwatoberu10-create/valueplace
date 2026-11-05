import type { Metadata } from "next";
import { MenuBrowser } from "@/components/MenuBrowser";
import { SampleNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the Value Plus Place menu and order your meal directly on WhatsApp.",
};

export default function MenuPage() {
  return (
    <main className="bg-cream">
      <div className="facade relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="eyebrow text-gold">Order online</p>
          <h1 className="mt-3 font-display text-5xl leading-none text-cream sm:text-7xl">Our Menu</h1>
          <p className="mt-4 max-w-lg text-lg text-cream/85">
            Pick your favourites, add them to your cart, and send your order to us on WhatsApp.
          </p>
        </div>
      </div>
      <MenuBrowser />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SampleNotice />
      </div>
    </main>
  );
}
