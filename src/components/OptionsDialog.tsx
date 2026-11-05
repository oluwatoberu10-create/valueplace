"use client";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/config/menu";
import { formatNaira } from "@/lib/order";
import { QuantityStepper } from "./QuantityStepper";

export function OptionsDialog({
  item,
  onConfirm,
  onClose,
}: {
  item: MenuItem;
  onConfirm: (choices: Record<string, string>, qty: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const options = item.options ?? [];

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (options.some((o) => !choices[o.name])) {
      setShowErrors(true);
      return;
    }
    onConfirm(choices, qty);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby={`${item.id}-options-title`}
      data-testid="options-dialog"
      className="m-auto w-[calc(100%-2rem)] max-w-md bg-paper p-0 text-ink backdrop:bg-ink/60"
    >
      <form onSubmit={submit} className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`${item.id}-options-title`} className="font-display text-3xl leading-tight text-wine-800">
              {item.name}
            </h2>
            <p className="mt-1 font-semibold">{formatNaira(item.price)}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => ref.current?.close()}
            className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center text-wine-800"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        {options.map((option) => (
          <fieldset key={option.name} className="mt-5">
            <legend className="eyebrow mb-2 text-ink-soft">Choose {option.name.toLowerCase()}</legend>
            <div className="space-y-2">
              {option.choices.map((choice) => (
                <label
                  key={choice}
                  className="flex min-h-12 cursor-pointer items-center gap-3 border border-wine-800/20 px-4 has-checked:border-wine-800 has-checked:bg-wine-800/5"
                >
                  <input
                    type="radio"
                    name={option.name}
                    value={choice}
                    checked={choices[option.name] === choice}
                    onChange={() => setChoices((c) => ({ ...c, [option.name]: choice }))}
                    className="size-4 accent-wine-800"
                  />
                  {choice}
                </label>
              ))}
            </div>
            {showErrors && !choices[option.name] && (
              <p role="alert" className="mt-2 text-sm font-medium text-error">
                Please choose {option.name.toLowerCase()}.
              </p>
            )}
          </fieldset>
        ))}

        <div className="mt-6 flex items-center justify-between gap-4">
          <QuantityStepper value={qty} onChange={setQty} label={item.name} min={1} />
          <button type="submit" className="btn btn-primary flex-1">
            Add · {formatNaira(item.price * qty)}
          </button>
        </div>
      </form>
    </dialog>
  );
}
