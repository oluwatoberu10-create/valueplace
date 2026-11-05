import { expect, test } from "@playwright/test";
import { addPlain, addWithChoice, card, fillDelivery, openCart, watchForErrors } from "./helpers";

const TEST_NUMBER = "2340000000000";
const ADMIN_PASSWORD = "e2e-only-admin-password";

test.describe("menu", () => {
  test("category filters and search narrow the list", async ({ page }) => {
    const check = watchForErrors(page);
    await page.goto("/menu");
    const count = page.getByTestId("result-count");
    await expect(count).toHaveText("14 meals");

    await page.getByRole("button", { name: "Soups" }).click();
    await expect(count).toHaveText("3 meals");
    await expect(card(page, "egusi-soup")).toBeVisible();
    await expect(card(page, "jollof-rice")).toHaveCount(0);

    await page.getByRole("button", { name: "All Meals" }).click();
    await page.getByLabel("Search meals by name").fill("JOLLOF");
    await expect(count).toHaveText("1 meal");
    await expect(card(page, "jollof-rice")).toBeVisible();

    await page.getByLabel("Search meals by name").fill("nothing like this");
    await expect(page.getByText("No meals found")).toBeVisible();
    await page.getByRole("button", { name: "Show all meals" }).click();
    await expect(count).toHaveText("14 meals");
    check();
  });

  test("every meal photo loads and is not stretched", async ({ page }) => {
    await page.goto("/menu");
    const images = page.locator('[data-testid="food-card"] img');
    await expect(images).toHaveCount(13); // 14 meals, one awaiting a usable photo
    await expect(page.getByText("Photo coming soon")).toHaveCount(1);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      expect(await img.evaluate((el) => getComputedStyle(el).objectFit)).toBe("cover");
    }
  });
});

test.describe("cart", () => {
  test("add, change quantity, remove, totals, and persistence", async ({ page }) => {
    const check = watchForErrors(page);
    await page.goto("/menu");

    await addPlain(page, "fried-rice"); // 3,000
    await addPlain(page, "fried-rice");
    await addWithChoice(page, "egusi-soup", "Eba"); // 4,000
    await addWithChoice(page, "egusi-soup", "Fufu"); // separate line
    await expect(page.getByTestId("cart-count")).toHaveText("4");

    await openCart(page);
    const lines = page.getByTestId("cart-line");
    await expect(lines).toHaveCount(3);
    await expect(lines.first().getByTestId("qty")).toHaveText("2");
    await expect(lines.first().getByTestId("line-total")).toHaveText("₦6,000");
    await expect(page.getByTestId("cart-total")).toHaveText("₦14,000");

    await page.getByRole("button", { name: "Increase quantity of Fried Rice with Beef" }).click();
    await expect(page.getByTestId("cart-total")).toHaveText("₦17,000");
    await page.getByRole("button", { name: "Decrease quantity of Fried Rice with Beef" }).click();
    await expect(page.getByTestId("cart-total")).toHaveText("₦14,000");

    await page.getByRole("button", { name: "Remove Egusi Soup from cart" }).first().click();
    await expect(lines).toHaveCount(2);
    await expect(page.getByTestId("cart-total")).toHaveText("₦10,000");

    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText("3");
    await openCart(page);
    await expect(page.getByTestId("cart-total")).toHaveText("₦10,000");

    await page.getByRole("button", { name: "Continue Shopping" }).click();
    await expect(page.getByTestId("cart-drawer")).toBeHidden();
    await expect(page).toHaveURL(/\/menu$/);

    // Decreasing from one removes the line.
    await openCart(page);
    await page.getByRole("button", { name: "Decrease quantity of Egusi Soup" }).click();
    await expect(lines).toHaveCount(1);
    check();
  });

  test("options must be chosen before adding", async ({ page }) => {
    await page.goto("/menu");
    await card(page, "banga-soup").getByRole("button", { name: /add .* to cart/i }).click();
    const dialog = page.getByTestId("options-dialog");
    await dialog.getByRole("button", { name: /^add ·/i }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Please choose swallow.");
    await expect(page.getByTestId("cart-count")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("a corrupted saved cart does not break the site", async ({ page }) => {
    const check = watchForErrors(page);
    await page.goto("/menu");
    await page.evaluate(() => localStorage.setItem("vpp-cart-v1", "{not json"));
    await page.reload();
    await expect(card(page, "jollof-rice")).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveCount(0);
    check();
  });

  test("empty checkout does not offer a form", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByTestId("empty-checkout")).toBeVisible();
    await expect(page.getByTestId("checkout-form")).toHaveCount(0);
    await page.getByRole("link", { name: "Browse the Menu" }).click();
    await expect(page).toHaveURL(/\/menu$/);
  });
});

test.describe("checkout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
    await addPlain(page, "fried-rice");
    await page.goto("/checkout");
    await expect(page.getByTestId("checkout-form")).toBeVisible();
  });

  test("validation blocks an incomplete order", async ({ page }) => {
    await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
    await expect(page.getByText(/valid phone number/)).toBeVisible();
    await expect(page.getByText("Please enter your delivery address.")).toBeVisible();
    await expect(page.getByText("Please enter your area or neighbourhood.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeFocused();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.getByLabel("Email address").fill("not-an-email");
    await fillDelivery(page);
    await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
    await expect(page.getByText(/email address doesn.t look right/)).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test("pickup hides delivery fields and needs no address", async ({ page }) => {
    await expect(page.getByTestId("delivery-fields")).toBeVisible();
    await page.getByLabel("Delivery address").fill("Should not travel");
    await page.getByRole("radio", { name: "Pickup" }).check();
    await expect(page.getByTestId("delivery-fields")).toHaveCount(0);
    await expect(page.getByTestId("pickup-note")).toBeVisible();

    await page.getByLabel("Full name").fill("Test Customer");
    await page.getByLabel("Phone number").fill("08000000000");
    await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
    await expect(page).toHaveURL(/\/order$/);
    const preview = page.getByTestId("message-preview");
    await expect(preview).toContainText("Order Type: Pickup");
    await expect(preview).not.toContainText("Should not travel");
    await expect(preview).toContainText("TOTAL: ₦3,000");
  });
});

test.describe("whatsapp order flow", () => {
  test("full journey: cart to WhatsApp to confirmation, then recorded for staff", async ({ page, context }) => {
    const check = watchForErrors(page);
    await page.goto("/menu");
    await addPlain(page, "fried-rice");
    await addPlain(page, "fried-rice");
    await addWithChoice(page, "egusi-soup", "Pounded Yam");

    await openCart(page);
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    await fillDelivery(page);
    await page.getByLabel("Any special instructions for your order?").fill("Extra pepper & no onions");
    const desktopOrMobileTotal = page.locator('[data-testid="summary-total"]:visible');
    await expect(desktopOrMobileTotal).toHaveText("₦10,000");

    const recorded = page.waitForResponse((r) => r.url().endsWith("/api/orders"));
    await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
    expect(await (await recorded).json()).toMatchObject({ recorded: true });

    // Prepared, but must not claim to be placed yet.
    await expect(page).toHaveURL(/\/order$/);
    await expect(page.getByRole("heading", { name: "Your order is ready." })).toBeVisible();
    await expect(page.getByText("Send the order through WhatsApp to confirm it with the restaurant.")).toBeVisible();
    await expect(page.getByTestId("confirmation")).toHaveCount(0);

    const reference = (await page.getByTestId("reference").innerText()).trim();
    expect(reference).toMatch(/^VP-[2-9A-HJKMNP-Z]{6}$/);

    // The link carries exactly the full order. It is checked, not sent anywhere: wa.me is stubbed.
    await context.route("https://wa.me/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "stub" }));
    const link = page.getByTestId("open-whatsapp");
    const url = new URL((await link.getAttribute("href"))!);
    expect(url.origin + url.pathname).toBe(`https://wa.me/${TEST_NUMBER}`);
    const message = url.searchParams.get("text")!;
    for (const expected of [
      "VALUE PLUS PLACE RESTAURANT — NEW ORDER",
      `Order Reference: ${reference}`,
      "Customer: Test Customer",
      "Phone: 0800 000 0000",
      "Order Type: Delivery",
      "Address: 1 Test Street",
      "Area: Test Area",
      "1. Fried Rice with Beef × 2 @ ₦3,000 — ₦6,000",
      "2. Egusi Soup (Pounded Yam) × 1 @ ₦4,000 — ₦4,000",
      "Subtotal: ₦10,000",
      "Delivery: To be confirmed",
      "TOTAL (before delivery): ₦10,000",
      "Special Instructions: Extra pepper & no onions",
      "sample website prices",
    ]) {
      expect(message).toContain(expected);
    }

    const popupPromise = context.waitForEvent("page");
    await link.click();
    const popup = await popupPromise;
    await popup.close();

    // Opening WhatsApp alone is not success, and the cart stays until they say they sent it.
    await expect(page.getByTestId("sent-check")).toBeVisible();
    await expect(page.getByTestId("confirmation")).toHaveCount(0);
    await expect(page.getByTestId("cart-count")).toHaveText("3");

    // Coming back from WhatsApp after the page was unloaded lands in the same place.
    await page.reload();
    await expect(page.getByTestId("sent-check")).toBeVisible();

    await page.getByTestId("confirm-sent").click();
    await expect(page.getByTestId("confirmation")).toBeVisible();
    await expect(page.getByTestId("confirmation")).toContainText(reference);
    await expect(page.getByTestId("cart-count")).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("confirmation")).toBeVisible();

    await page.getByTestId("new-order").click();
    await expect(page).toHaveURL(/\/menu$/);
    await page.goto("/order");
    await expect(page.getByTestId("no-order")).toBeVisible();
    check();

    // Staff see it, and can move it along.
    await page.goto("/admin");
    await expect(page.getByTestId("admin-order")).toHaveCount(0);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    const row = page.locator(`[data-testid="admin-order"][data-reference="${reference}"]`);
    await expect(row).toBeVisible();
    await expect(row).toContainText("Test Customer");
    await expect(row).toContainText("₦10,000");
    await row.getByRole("combobox").selectOption("preparing");
    await row.getByRole("button", { name: "Update" }).click();
    await expect(row.getByRole("combobox")).toHaveValue("preparing");
    await page.reload();
    await expect(row.getByRole("combobox")).toHaveValue("preparing");
  });

  test("going back to edit keeps what was typed", async ({ page }) => {
    await page.goto("/menu");
    await addPlain(page, "fried-rice");
    await page.goto("/checkout");
    await fillDelivery(page);
    await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
    await expect(page).toHaveURL(/\/order$/);
    await page.getByRole("link", { name: "Change my details" }).click();
    await expect(page.getByLabel("Full name")).toHaveValue("Test Customer");
    await expect(page.getByLabel("Delivery address")).toHaveValue("1 Test Street");
  });
});

test.describe("order api", () => {
  const valid = {
    reference: "VP-TEST23",
    details: {
      name: "Api Test",
      phone: "08000000000",
      email: "",
      method: "pickup",
      address: "",
      area: "",
      deliveryInstructions: "",
      notes: "",
    },
    lines: [{ itemId: "fried-rice", choices: {}, qty: 1 }],
  };

  test("rejects bad input", async ({ request }) => {
    const post = (data: unknown) => request.post("/api/orders", { data });
    expect((await post({ ...valid, lines: [] })).status()).toBe(400);
    expect((await post({ ...valid, reference: "<script>" })).status()).toBe(400);
    expect((await post({ ...valid, lines: [{ itemId: "ghost", choices: {}, qty: 1 }] })).status()).toBe(400);
    expect((await post({ ...valid, lines: [{ itemId: "fried-rice", choices: {}, qty: 9999 }] })).status()).toBe(400);
    expect((await post({ ...valid, lines: [{ itemId: "egusi-soup", choices: { Swallow: "Pizza" }, qty: 1 }] })).status()).toBe(400);
    expect((await post({ ...valid, details: { ...valid.details, phone: "x" } })).status()).toBe(400);
    expect((await post({ ...valid, details: "nope" })).status()).toBe(400);
  });

  test("ignores any price the browser sends", async ({ request, page, isMobile }) => {
    const reference = isMobile ? "VP-PAYCE3" : "VP-PAYCE2";
    const r = await request.post("/api/orders", {
      data: { ...valid, reference, lines: [{ itemId: "fried-rice", choices: {}, qty: 1, unitPrice: 1, lineTotal: 1 }], total: 1 },
    });
    expect(await r.json()).toMatchObject({ recorded: true });
    await page.goto("/admin");
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator(`[data-reference="${reference}"]`)).toContainText("₦3,000");
  });
});

test.describe("admin security", () => {
  test("wrong password shows no customer data", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("Password").fill("definitely wrong password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("That password is not correct.")).toBeVisible();
    await expect(page.getByTestId("admin-order")).toHaveCount(0);
  });

  test("a forged cookie is refused, and the session cookie is locked down", async ({ page, context }) => {
    await context.addCookies([
      { name: "vpp_admin", value: `${Date.now() + 1e7}.forged`, url: "http://localhost:3210/admin" },
    ]);
    await page.goto("/admin");
    await expect(page.getByTestId("admin-login")).toBeVisible();

    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    const cookie = (await context.cookies()).find((c) => c.name === "vpp_admin")!;
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Strict");

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByTestId("admin-login")).toBeVisible();
  });

  test("server secrets never reach the browser", async ({ page }) => {
    const bodies: string[] = [];
    page.on("response", async (r) => {
      if (/\.(js|css)|\/menu|\/admin/.test(r.url())) bodies.push(await r.text().catch(() => ""));
    });
    await page.goto("/menu");
    await page.goto("/admin");
    expect(bodies.length).toBeGreaterThan(0);
    for (const b of bodies) {
      expect(b).not.toContain("e2e-only-key");
      expect(b).not.toContain(ADMIN_PASSWORD);
    }
  });
});

test.describe("site", () => {
  test("home page has every section and working calls to action", async ({ page }) => {
    const check = watchForErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Good Food.Great Taste.Value Plus.");
    await expect(page.getByRole("heading", { name: "More Than Just a Meal. It's an Experience." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Craving Something Delicious?" })).toBeVisible();
    await expect(page.getByTestId("food-card")).toHaveCount(6);
    await expect(page.getByTestId("gallery-photo")).toHaveCount(6);
    await expect(page.getByTestId("contact-whatsapp")).toHaveAttribute("href", `https://wa.me/${TEST_NUMBER}`);

    for (const name of ["Explore Our Menu", "Order Your Meal"]) {
      await page.goto("/");
      await page.getByRole("link", { name }).click();
      await expect(page).toHaveURL(/\/menu$/);
    }
    check();
  });

  test("featured add to cart is connected to the real cart", async ({ page }) => {
    await page.goto("/");
    await addPlain(page, "fried-rice");
    await expect(page.getByTestId("cart-count")).toHaveText("1");
  });

  test("gallery lightbox opens, steps and closes", async ({ page }) => {
    await page.goto("/#gallery");
    await page.getByTestId("gallery-photo").first().click();
    const box = page.getByTestId("lightbox");
    await expect(box).toBeVisible();
    await expect(box.locator("figcaption")).toHaveText("Our building");
    await box.getByRole("button", { name: "Next photo" }).click();
    await expect(box.locator("figcaption")).toHaveText("At the serving counter");
    await box.getByRole("button", { name: "Close" }).click();
    await expect(box).toHaveCount(0);
  });

  test("no internal link is broken", async ({ page, request }) => {
    const seen = new Set<string>();
    for (const start of ["/", "/menu", "/checkout", "/order", "/admin"]) {
      await page.goto(start);
      const hrefs = await page.locator("a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
      hrefs.filter((h) => h.startsWith("/")).forEach((h) => seen.add(h));
    }
    for (const href of seen) {
      const path = href.split("#")[0] || "/";
      expect((await request.get(path)).status(), href).toBe(200);
    }
    // Every in-page target exists.
    await page.goto("/");
    for (const href of seen) {
      if (href.includes("#")) await expect(page.locator(`#${href.split("#")[1]}`)).toHaveCount(1);
    }
    expect((await request.get("/no-such-page")).status()).toBe(404);
  });

  test("nothing overflows sideways and tap targets are finger-sized", async ({ page, isMobile }) => {
    for (const path of ["/", "/menu", "/checkout"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
    if (!isMobile) return;
    await page.goto("/menu");
    await addPlain(page, "fried-rice");
    await expect(page.getByTestId("mobile-cart-bar")).toBeVisible();
    await page.getByTestId("mobile-cart-bar").click();
    const drawer = page.getByTestId("cart-drawer");
    for (const b of await drawer.getByRole("button").all()) {
      const box = await b.boundingBox();
      expect(box!.height, await b.getAttribute("aria-label") ?? "button").toBeGreaterThanOrEqual(40);
    }
  });

  test("hamburger menu works on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Gallery" }).click();
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
    await expect(page).toHaveURL(/#gallery$/);
    await expect(page.locator("#gallery")).toBeInViewport();
  });
});
