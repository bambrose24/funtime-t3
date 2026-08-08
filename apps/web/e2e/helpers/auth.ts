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
  await expect
    .poll(
      async () => {
        const cookies = await page.context().cookies();
        return cookies.some(
          ({ name }) => name.startsWith("sb-") && name.includes("-auth-token"),
        );
      },
      { message: "Supabase auth cookie is available to server navigation" },
    )
    .toBe(true);
}
