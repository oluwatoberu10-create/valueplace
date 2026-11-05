import { Clock, MapPin, MessageCircle, Navigation, Phone, Share2 } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { isValidWhatsAppNumber, whatsAppUrl } from "@/lib/order";
import { SectionHeading } from "./ui";

export function socialLinks() {
  const { instagram, facebook, tiktok, x } = restaurant.socials;
  return [
    { label: "Instagram", url: instagram },
    { label: "Facebook", url: facebook },
    { label: "TikTok", url: tiktok },
    { label: "X", url: x },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 border-b border-wine-800/15 py-5">
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold-deep" />
      <div className="min-w-0">
        <h3 className="eyebrow mb-1 text-ink-soft">{label}</h3>
        <div className="text-lg text-ink">{children}</div>
      </div>
    </div>
  );
}

function ToBeAdded({ what }: { what: string }) {
  return <span className="text-base text-ink-soft italic">{what} to be added</span>;
}

export function ContactSection() {
  const { address, phone, whatsappNumber, openingHours } = restaurant;
  const socials = socialLinks();
  const hasWhatsApp = isValidWhatsAppNumber(whatsappNumber);
  const query = address ? encodeURIComponent(address) : null;

  return (
    <section id="contact" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow="Contact" title="Come and see us" />
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            Look for the tall striped building with the Value Plus Place sign.
          </p>
          <div className="mt-6 border-t border-wine-800/15">
            <Row icon={MapPin} label="Address">
              {address ?? <ToBeAdded what="Address" />}
            </Row>
            <Row icon={Phone} label="Phone">
              {phone ? (
                <a className="underline" href={`tel:${phone.replace(/\s/g, "")}`}>
                  {phone}
                </a>
              ) : (
                <ToBeAdded what="Phone number" />
              )}
            </Row>
            <Row icon={MessageCircle} label="WhatsApp">
              {hasWhatsApp ? (
                <a
                  data-testid="contact-whatsapp"
                  className="underline"
                  href={whatsAppUrl(whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat with us on WhatsApp
                </a>
              ) : (
                <ToBeAdded what="WhatsApp number" />
              )}
            </Row>
            <Row icon={Clock} label="Opening hours">
              {openingHours.length > 0 ? (
                <ul>
                  {openingHours.map((h) => (
                    <li key={h.days}>
                      {h.days}: {h.hours}
                    </li>
                  ))}
                </ul>
              ) : (
                <ToBeAdded what="Opening hours" />
              )}
            </Row>
            <Row icon={Share2} label="Social media">
              {socials.length > 0 ? (
                <span className="flex flex-wrap gap-x-4">
                  {socials.map((s) => (
                    <a key={s.label} className="underline" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  ))}
                </span>
              ) : (
                <ToBeAdded what="Social media links" />
              )}
            </Row>
          </div>
        </div>

        <div className="flex flex-col">
          {query ? (
            <iframe
              title={`Map showing ${restaurant.name}`}
              src={`https://www.google.com/maps?q=${query}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="min-h-80 w-full flex-1 border-0"
            />
          ) : (
            <div className="facade-soft flex min-h-80 flex-1 items-center justify-center p-6">
              <p className="max-w-xs bg-paper px-5 py-4 text-center text-ink-soft">
                The map will appear here once the restaurant&apos;s address is added.
              </p>
            </div>
          )}
          {query ? (
            <a
              data-testid="directions"
              className="btn btn-primary mt-4 w-full"
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation aria-hidden="true" className="size-5" /> Get Directions
            </a>
          ) : (
            <button data-testid="directions" type="button" disabled className="btn btn-primary mt-4 w-full">
              <Navigation aria-hidden="true" className="size-5" /> Get Directions (address coming soon)
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
