"use client";
import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "@/lib/order";

/** `min` is 1 in the options dialog; in the cart, decreasing from 1 removes the line. */
export function QuantityStepper({
  value,
  onChange,
  label,
  min = 0,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  min?: number;
}) {
  const buttonClass =
    "flex size-11 items-center justify-center text-wine-800 hover:bg-wine-800/5 disabled:opacity-30 sm:size-10";
  return (
    <div className="inline-flex items-center border border-wine-800/30 bg-paper">
      <button
        type="button"
        className={buttonClass}
        aria-label={`Decrease quantity of ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span aria-live="polite" data-testid="qty" className="w-8 text-center font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={buttonClass}
        aria-label={`Increase quantity of ${label}`}
        disabled={value >= MAX_QTY}
        onClick={() => onChange(value + 1)}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
