# Value Plus Place Restaurant website

A restaurant website with a working cart and WhatsApp ordering. Built with Next.js, TypeScript and Tailwind CSS.

Customers browse the menu, add meals to a cart that survives refreshes, and fill in checkout. The site then
prepares a complete order message for them to send to the restaurant on WhatsApp. No payment is taken online.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```
npm install
npm run dev
```

Then open http://localhost:3000.

## Before going live: what the restaurant must supply

**Required to take orders**

- [ ] **WhatsApp number** for receiving orders. Until this is set, customers cannot send an order and the site tells them so.
- [ ] **Real menu and prices.** Every price on the site today is a sample. Then set `pricesAreSamples: false`.
- [ ] **Check every dish name and description.** They were written by looking at the photos, and some are best guesses (Banga Soup, Vegetable Soup, Yam Porridge and Peppered Ponmo especially).

**Needed for a complete site**

- [ ] Street address (this turns on the map and the Get Directions button)
- [ ] Phone number
- [ ] Opening hours
- [ ] Social media links
- [ ] Delivery charge, or a decision to keep confirming it on WhatsApp
- [ ] The real swallow and spice choices for each dish (the current ones are samples)
- [ ] Which dishes should be featured on the home page
- [ ] The preferred spelling of the name: the signs say both "Value Plus Place" and "Valueplus Place"

**Photos still missing**

- [ ] Interior and dining area (none were in the folder)
- [ ] Drinks and sides, if they should be sold online (none in the folder, so there is no Drinks category)
- [ ] Bakery items and bread: the building sign advertises a bakery, but nothing was supplied
- [ ] **Gizzard Skewers:** the supplied photo has a Vecteezy stock watermark, so it was left out

**Please check photo rights.** Many of the dish photos look like stock or internet images rather than the
restaurant's own food. Confirm you have the right to use them. Photos of your real dishes are always the safest choice.

## How to change things

Almost everything lives in three files in `src/config/`. Each one has instructions at the top.

| To change | Edit | What to do |
| --- | --- | --- |
| WhatsApp number | `src/config/restaurant.ts` | Set `whatsappNumber`, or set `NEXT_PUBLIC_WHATSAPP_NUMBER` in your host. International format, digits only: drop the leading 0 and add 234. |
| Phone, address, hours, socials | `src/config/restaurant.ts` | Replace `null` with the real value. |
| Delivery fee | `src/config/restaurant.ts` | `deliveryFee`: `null` means "to be confirmed", `0` means free, any other number is a flat charge in naira. |
| Meal prices | `src/config/menu.ts` | Change `price`: whole naira, no commas or ₦ sign. |
| Add or remove a meal | `src/config/menu.ts` | Copy or delete a block. Each `id` must be unique. |
| Meal photos | `public/images/menu/` | Add the file, then set the meal's `image` to `/images/menu/your-photo.webp`. Square or 5:4 photos crop best. If a crop cuts off the food, set `imagePosition`, for example `"center top"`. |
| Categories | `src/config/menu.ts` | Edit `categories`. Categories with no meals are hidden automatically. |
| Home page featured meals | `src/config/menu.ts` | Add or remove `featured: true`. |
| Gallery | `src/config/gallery.ts` | Add the photo to `public/images/` and add an entry. The first six get the mosaic layout. |

After editing, redeploy the site for changes to appear.

## Deploying

Any host that supports Next.js will work. On [Vercel](https://vercel.com): import the project, add any environment
variables from `.env.example`, and deploy. `NEXT_PUBLIC_WHATSAPP_NUMBER` is read at build time, so redeploy after changing it.

## Optional: recording orders and the staff page

WhatsApp is enough to take orders. If you also want a list of orders with statuses at `/admin`:

1. Create a free project at [supabase.com](https://supabase.com).
2. In its SQL editor, run `supabase/schema.sql`.
3. Add these environment variables in your host (see `.env.example`):
   - `SUPABASE_URL`: your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: the service role key. This is a secret: never add `NEXT_PUBLIC_` to its name.
   - `ADMIN_PASSWORD`: a password for staff, at least 12 characters
4. Redeploy, then sign in at `/admin`.

Good to know:

- Orders are recorded when the customer finishes checkout, which is before they press send in WhatsApp. So a
  **pending** order on the staff page may never have been sent. Look for the matching reference in WhatsApp before cooking.
- Staff share one password. Changing `ADMIN_PASSWORD` signs everyone out.
- The table has row level security on with no policies, so only the website's server can read it.
- If the database is unreachable, customers can still order on WhatsApp.

## Tests

```
npm test                  # order logic: totals, validation, the WhatsApp message
npx playwright install chromium
```

The browser tests run against a production build, on desktop and phone sizes. They use a placeholder WhatsApp
number and a mock database, and never contact WhatsApp or Supabase.

Windows PowerShell:

```
$env:NEXT_PUBLIC_WHATSAPP_NUMBER="2340000000000"; npm run build; Remove-Item Env:NEXT_PUBLIC_WHATSAPP_NUMBER
npx playwright test

npm run build
$env:E2E_MODE="unconfigured"; npx playwright test; Remove-Item Env:E2E_MODE
```

macOS or Linux:

```
NEXT_PUBLIC_WHATSAPP_NUMBER=2340000000000 npm run build && npx playwright test
npm run build && E2E_MODE=unconfigured npx playwright test
```

Rebuild without the test number before deploying. The test number must never ship.

## Where things are

```
src/config/        restaurant details, menu, gallery: the files to edit
src/lib/order.ts   totals, validation, the WhatsApp message (no UI, fully tested)
src/lib/*-store.ts cart and pending order, saved in the browser
src/components/    navigation, food cards, cart drawer, checkout form, order flow, gallery, contact
src/app/           pages: home, /menu, /checkout, /order, /admin, and /api/orders
supabase/          optional database schema
scripts/           how the supplied photos were trimmed and named
e2e/               browser tests
```
