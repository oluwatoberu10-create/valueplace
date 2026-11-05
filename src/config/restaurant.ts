/**
 * RESTAURANT DETAILS: the one file to edit for contact information and delivery.
 *
 * Anything left as `null` or "" shows as a clearly-labelled placeholder on the site.
 * Nothing here has been invented: fill these in with the restaurant's real details.
 */
export const restaurant = {
  name: "Value Plus Place Restaurant",
  shortName: "Value Plus Place",

  /**
   * The WhatsApp number that receives orders, in international format, digits only.
   * Format example: a Nigerian number written locally as 080X XXX XXXX becomes 23480XXXXXXXX
   * (drop the leading 0, add 234). Replace the whole expression with your number in quotes.
   * Until this is set, customers can fill in checkout but cannot send an order.
   */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",

  /** Phone number exactly as customers should see and dial it. */
  phone: null as string | null,
  email: null as string | null,

  /** Full street address. Enables the map and the Get Directions button. */
  address: null as string | null,

  /** Example shape: [{ days: "Monday to Saturday", hours: "..." }] */
  openingHours: [] as { days: string; hours: string }[],

  /** Only links that are filled in are shown. Use full URLs. */
  socials: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
    x: null as string | null,
  },

  /**
   * Delivery charge in naira, added to every delivery order.
   *   null  the site says "To be confirmed" and the restaurant confirms it on WhatsApp.
   *   0     free delivery.
   *   any other number: a flat charge of that many naira.
   */
  deliveryFee: null as number | null,

  /**
   * Leave `true` while menu.ts still holds sample prices: the site then shows a
   * "sample prices" notice and marks WhatsApp orders. Set to `false` once real
   * prices are in place.
   */
  pricesAreSamples: true,
};
