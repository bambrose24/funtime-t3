import { expect, test } from "../fixtures/test";

test("anonymous visitor can open the landing page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Welcome to Funtime - Free NFL Pick 'em",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sign up" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
});
