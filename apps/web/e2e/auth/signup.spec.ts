import { expect, test } from "../fixtures/test";
import { queryScalar } from "../helpers/db";

const signupUser = {
  email: "web.e2e.signup@example.com",
  password: "Password123!",
  username: "websignup",
  firstName: "Signup",
  lastName: "Journey",
};

test("new user can sign up and complete their profile", async ({ page }) => {
  await page.goto("/signup");

  await page.getByLabel("Email").fill(signupUser.email);
  await page.getByLabel("Password", { exact: true }).fill(signupUser.password);
  await page.getByLabel("Confirm Password").fill(signupUser.password);
  await page.getByRole("button", { name: "Create an account" }).click();

  await expect(
    page.getByRole("button", { name: "Check your email" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(page).toHaveURL(/\/confirm-signup$/);

  await page.getByLabel("First Name").fill(signupUser.firstName);
  await page.getByLabel("Last Name").fill(signupUser.lastName);
  await page.getByLabel("Username").fill(signupUser.username);
  await page.getByRole("button", { name: "Finish Signup" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(() =>
      queryScalar(
        `SELECT COUNT(*) FROM "people" WHERE "email" = '${signupUser.email}' AND "username" = '${signupUser.username}'`,
      ),
    )
    .toBe("1");
});
