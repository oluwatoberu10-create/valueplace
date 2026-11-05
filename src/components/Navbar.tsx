"use client";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cartDrawer, useCart } from "@/lib/cart-store";
import { navLinks } from "./nav-links";
import { Logo } from "./Logo";

export function CartButton() {
  const { count } = useCart();
  return (
    <button
      type="button"
      onClick={() => cartDrawer.open()}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      data-testid="cart-button"
      className="relative flex size-11 items-center justify-center text-wine-800 hover:text-wine-700"
    >
      <ShoppingBag aria-hidden="true" className="size-6" />
      {count > 0 && (
        <span
          data-testid="cart-count"
          className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center bg-wine-800 px-1 text-xs font-bold text-cream tabular-nums"
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-wine-800/15 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo onClick={close} />

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link text-[0.95rem] font-medium text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/menu" className="btn btn-primary hidden !min-h-11 !px-5 sm:inline-flex">
            Order Now
          </Link>
          <CartButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-11 items-center justify-center text-wine-800 lg:hidden"
          >
            {open ? <X aria-hidden="true" className="size-6" /> : <MenuIcon aria-hidden="true" className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-wine-800/15 bg-paper px-4 pb-5 lg:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              className="block border-b border-wine-800/10 py-3.5 font-display text-2xl text-wine-800"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/menu" onClick={close} className="btn btn-primary mt-5 w-full">
            Order Now
          </Link>
        </nav>
      )}
    </header>
  );
}
