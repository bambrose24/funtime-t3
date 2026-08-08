import { expect, type Page } from "@playwright/test";

export async function login(
  page: Page,
  user: { email: string; password: string },
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.locator("#password").fill(user.password);
  await page.locator("form").getByRole("button", { name: "Login" }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}
