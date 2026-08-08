import { E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { queryScalar } from "../helpers/db";

test("profile username validation, uniqueness, and update work", async ({
  browserErrorGuard,
  page,
}) => {
  browserErrorGuard.allow(
    /Failed to load resource: the server responded with a status of 409/,
  );
  browserErrorGuard.allow(
    /settings\.updateUsername[\s\S]*That username is already taken/,
  );

  await login(page, E2E_USERS.outsider);
  await page.goto("/settings/profile");

  const username = page.getByLabel("Username");
  const submit = page.getByRole("button", { name: "Update Username" });

  await username.fill("bad!");
  await expect(
    page.getByText(/Only numbers and letters allowed/),
  ).toBeVisible();
  await expect(submit).toBeDisabled();

  await username.fill("webplayer");
  await submit.click();
  await expect(
    page.getByText("That username is already taken. Try a new one."),
  ).toBeVisible();
  expect(
    queryScalar(`
      SELECT "username"
      FROM "people"
      WHERE "email" = '${E2E_USERS.outsider.email}'
    `),
  ).toBe("weboutsider");

  await username.fill("weboutsiderupdated");
  await submit.click();
  await expect(
    page.getByText(/Successfully updated your username/),
  ).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT "username"
        FROM "people"
        WHERE "email" = '${E2E_USERS.outsider.email}'
      `),
    )
    .toBe("weboutsiderupdated");
});
