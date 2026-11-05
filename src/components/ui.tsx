import { Info } from "lucide-react";
import Image from "next/image";
import { restaurant } from "@/config/restaurant";

/** The five-bar mark, taken from the building's striped facade. */
export function StripeMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={className}>
      <path d="M0 8h4v20H0zM6 4h4v24H6zM12 0h4v28h-4zM18 4h4v24h-4zM24 8h4v20h-4z" fill="currentColor" />
    </svg>
  );
}

/** A thin band of the facade stripes, used to divide sections. */
export function StripeBand({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`stripe-band h-3 w-full ${className}`} />;
}

export function SectionHeading({
  eyebrow,
  title,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div>
      {eyebrow && (
        <p className={`eyebrow mb-3 ${light ? "text-gold" : "text-gold-deep"}`}>{eyebrow}</p>
      )}
      <h2 className={`font-display text-4xl leading-[1.05] sm:text-5xl ${light ? "text-cream" : "text-wine-800"}`}>
        {title}
      </h2>
    </div>
  );
}

/** Shown wherever prices appear until real prices replace the samples. */
export function SampleNotice({ className = "" }: { className?: string }) {
  if (!restaurant.pricesAreSamples) return null;
  return (
    <p
      data-testid="sample-notice"
      className={`flex items-start gap-2 border-l-2 border-gold bg-gold/10 px-3 py-2 text-sm text-ink-soft ${className}`}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-deep" />
      <span>Prices shown are samples for now. The restaurant will confirm the final amount.</span>
    </p>
  );
}

export function MealImage({
  src,
  alt,
  sizes,
  position,
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  position?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-cream ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={position ? { objectPosition: position } : undefined}
        />
      ) : (
        <div className="facade-soft flex h-full w-full items-center justify-center p-2 text-center">
          <span className="bg-paper px-2 py-1 text-xs font-semibold text-ink-soft">Photo coming soon</span>
        </div>
      )}
    </div>
  );
}
