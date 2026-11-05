import { expect, type ConsoleMessage, type Page } from "@playwright/test";

/** Fails a test on console errors or uncaught exceptions. */
export function watchForErrors(page: Page): () => void {
  const problems: string[] = [];
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`exception: ${e.message}`));
  return () => expect(problems).toEqual([]);
}

export const card = (page: Page, id: string) => page.locator(`[data-testid="food-card"][data-item="${id}"]`);

export async function addPlain(page: Page, id: string) {
  await card(page, id).getByRole("button", { name: /add .* to cart/i }).click();
}

export async function addWithChoice(page: Page, id: string, choice: string) {
  await card(page, id).getByRole("button", { name: /add .* to cart/i }).click();
  const dialog = page.getByTestId("options-dialog");
  await dialog.getByRole("radio", { name: choice }).check();
  await dialog.getByRole("button", { name: /^add ·/i }).click();
  await expect(dialog).toHaveCount(0);
}

export async function openCart(page: Page) {
  await page.getByTestId("cart-button").click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
}

export async function fillDelivery(page: Page) {
  await page.getByLabel("Full name").fill("Test Customer");
  await page.getByLabel("Phone number").fill("0800 000 0000");
  await page.getByLabel("Delivery address").fill("1 Test Street");
  await page.getByLabel("Area or neighbourhood").fill("Test Area");
}
