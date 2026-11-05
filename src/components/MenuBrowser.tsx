"use client";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, menu, type CategoryId } from "@/config/menu";
import { FoodCard } from "./FoodCard";

type Filter = CategoryId | "all";

export function CategoryFilter({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (next: Filter) => void;
}) {
  const present = categories.filter((c) => menu.some((m) => m.category === c.id));
  const tabs: { id: Filter; label: string }[] = [{ id: "all", label: "All Meals" }, ...present];
  return (
    <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={active === t.id}
          onClick={() => onChange(t.id)}
          className={`min-h-11 shrink-0 border px-4 text-sm font-semibold transition-colors ${
            active === t.id
              ? "border-wine-800 bg-wine-800 text-cream"
              : "border-wine-800/25 bg-paper text-wine-800 hover:border-wine-800"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function MenuBrowser() {
  const [category, setCategory] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter(
      (m) =>
        (category === "all" || m.category === category) &&
        (!q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)),
    );
  }, [category, query]);

  const reset = () => {
    setCategory("all");
    setQuery("");
  };

  return (
    <>
      <div className="sticky top-[4.5rem] z-30 border-b border-wine-800/15 bg-cream/95 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter active={category} onChange={setCategory} />
          <div className="relative lg:w-72">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meals"
              aria-label="Search meals by name"
              className="field !min-h-11 w-full !pr-10 !pl-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-0 right-0 flex size-11 items-center justify-center text-ink-soft"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <p aria-live="polite" data-testid="result-count" className="mb-4 text-sm text-ink-soft">
          {results.length} {results.length === 1 ? "meal" : "meals"}
        </p>
        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {results.map((item) => (
              <FoodCard key={item.id} item={item} showCategory={category === "all"} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-wine-800/30 px-6 py-16 text-center">
            <p className="font-display text-3xl text-wine-800">No meals found</p>
            <p className="mt-2 text-ink-soft">Try a different word, or browse everything we have.</p>
            <button type="button" onClick={reset} className="btn btn-primary mt-6">
              Show all meals
            </button>
          </div>
        )}
      </div>
    </>
  );
}
