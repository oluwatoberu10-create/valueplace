import Link from "next/link";
import { StripeMark } from "./ui";

export function Logo({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Value Plus Place Restaurant, home"
      className={`flex items-center gap-2.5 ${light ? "text-cream" : "text-wine-800"}`}
    >
      <StripeMark className="size-8 shrink-0" />
      <span className="leading-none">
        <span className="block font-display text-xl sm:text-[1.4rem]">Value Plus Place</span>
        <span className={`eyebrow mt-1 block !text-[0.62rem] ${light ? "text-gold" : "text-gold-deep"}`}>
          Restaurant
        </span>
      </span>
    </Link>
  );
}
