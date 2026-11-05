"use client";
import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categories, type MenuItem } from "@/config/menu";
import { cart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/order";
import { OptionsDialog } from "./OptionsDialog";
import { MealImage } from "./ui";

export function FoodCard({ item, showCategory = true }: { item: MenuItem; showCategory?: boolean }) {
  const [choosing, setChoosing] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function confirmAdded() {
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1400);
  }

  function handleAdd() {
    if (item.options?.length) {
      setChoosing(true);
    } else {
      cart.add(item.id);
      confirmAdded();
    }
  }

  const category = categories.find((c) => c.id === item.category)?.label;

  return (
    <article
      data-testid="food-card"
      data-item={item.id}
      className="group grid grid-cols-[7.5rem_1fr] border border-wine-800/15 bg-paper transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(63,11,22,.55)] sm:flex sm:flex-col"
    >
      <MealImage
        src={item.image}
        alt={item.name}
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 120px"
        position={item.imagePosition}
        className="min-h-full sm:aspect-[5/4] sm:min-h-0"
      />
      <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
        {showCategory && <p className="eyebrow mb-1 !text-[0.66rem] text-gold-deep">{category}</p>}
        <h3 className="font-display text-xl leading-tight text-wine-800 sm:text-2xl">{item.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-snug text-ink-soft sm:text-[0.95rem]">{item.description}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4">
          <p className="text-lg font-semibold text-ink tabular-nums" data-testid="price">
            {formatNaira(item.price)}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${item.name} to cart`}
            className={`btn !min-h-11 !px-3.5 !text-sm ${justAdded ? "btn-added" : "btn-primary"}`}
          >
            {justAdded ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Plus aria-hidden="true" className="size-4" />
            )}
            {justAdded ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
      {choosing && (
        <OptionsDialog
          item={item}
          onClose={() => setChoosing(false)}
          onConfirm={(choices, qty) => {
            cart.add(item.id, choices, qty);
            setChoosing(false);
            confirmAdded();
          }}
        />
      )}
    </article>
  );
}
