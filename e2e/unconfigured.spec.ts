import { expect, test } from "@playwright/test";
import { addPlain, fillDelivery, watchForErrors } from "./helpers";

/** The site as it ships today: no WhatsApp number, database, address or admin password. */

test("placeholders are shown and nothing invented", async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto("/");
  const contact = page.locator("#contact");
  await expect(contact.getByText("Address to be added")).toBeVisible();
  await expect(contact.getByText("Phone number to be added")).toBeVisible();
  await expect(contact.getByText("WhatsApp number to be added")).toBeVisible();
  await expect(contact.getByText("Opening hours to be added")).toBeVisible();
  await expect(contact.getByText("Social media links to be added")).toBeVisible();
  await expect(page.getByTestId("directions")).toBeDisabled();
  await expect(page.getByTestId("contact-whatsapp")).toHaveCount(0);
  await expect(page.locator('a[href^="https://wa.me"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.getByTestId("sample-notice").first()).toBeVisible();
  check();
});

test("an order cannot be sent, and the customer is told so honestly", async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto("/menu");
  await addPlain(page, "fried-rice");
  await page.goto("/checkout");
  await fillDelivery(page);

  const response = page.waitForResponse((r) => r.url().endsWith("/api/orders"));
  await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
  expect(await (await response).json()).toMatchObject({ recorded: false, reason: "not-configured" });

  await expect(page).toHaveURL(/\/order$/);
  await expect(page.getByTestId("no-whatsapp")).toContainText("Your order has not been placed");
  await expect(page.getByTestId("open-whatsapp")).toHaveCount(0);
  await expect(page.getByTestId("confirm-sent")).toHaveCount(0);
  await expect(page.locator('a[href^="https://wa.me"]')).toHaveCount(0);
  await expect(page.getByTestId("cart-count")).toHaveText("1");
  check();
});

test("the admin page exposes nothing", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByTestId("admin-not-setup")).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveCount(0);
});
