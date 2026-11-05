import Link from "next/link";
import { restaurant } from "@/config/restaurant";
import { socialLinks } from "./ContactSection";
import { Logo } from "./Logo";
import { navLinks } from "./nav-links";
import { StripeBand } from "./ui";

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="eyebrow mb-4 text-gold">{children}</h2>;
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="text-cream/60 italic">{children}</span>;
}

export function Footer() {
  const socials = socialLinks();
  return (
    <footer className="bg-ink pb-24 text-cream/85 lg:pb-0">
      <StripeBand />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            Good food. Great taste. Value plus.
          </p>
        </div>

        <div>
          <Heading>Explore</Heading>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Heading>Find us</Heading>
          <ul className="space-y-2 text-sm">
            <li>{restaurant.address ?? <Placeholder>Address to be added</Placeholder>}</li>
            <li>
              {restaurant.phone ? (
                <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                  {restaurant.phone}
                </a>
              ) : (
                <Placeholder>Phone number to be added</Placeholder>
              )}
            </li>
            <li>
              {socials.length > 0 ? (
                <span className="flex flex-wrap gap-x-3">
                  {socials.map((s) => (
                    <a key={s.label} href={s.url} rel="noopener noreferrer" target="_blank" className="underline hover:text-gold">
                      {s.label}
                    </a>
                  ))}
                </span>
              ) : (
                <Placeholder>Social media links to be added</Placeholder>
              )}
            </li>
          </ul>
        </div>

        <div>
          <Heading>Opening hours</Heading>
          {restaurant.openingHours.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {restaurant.openingHours.map((h) => (
                <li key={h.days}>
                  {h.days}: {h.hours}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">
              <Placeholder>Opening hours to be added</Placeholder>
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-cream/60 sm:px-6">
          © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
