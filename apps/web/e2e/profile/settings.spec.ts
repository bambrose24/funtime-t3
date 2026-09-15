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

test("weekly recap email preference can be turned off and back on", async ({
  page,
}) => {
  await login(page, E2E_USERS.outsider);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/settings/notifications");

  await expect(page.getByRole("button", { name: "Profile" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Notifications" }),
  ).toBeVisible();

  const toggle = page.getByRole("switch", { name: "Weekly recap emails" });
  await expect(toggle).toBeVisible();
  await expect(toggle).toBeChecked();

  await toggle.click();
  await expect(
    page.getByText("Weekly recap emails are off."),
  ).toBeVisible();
  await expect.poll(() =>
    queryScalar(`
      SELECT "week_summary_emails_enabled"::text
      FROM "people"
      WHERE "email" = '${E2E_USERS.outsider.email}'
    `),
  ).toBe("false");

  await toggle.click();
  await expect(
    page.getByText("Weekly recap emails are on."),
  ).toBeVisible();
  await expect.poll(() =>
    queryScalar(`
      SELECT "week_summary_emails_enabled"::text
      FROM "people"
      WHERE "email" = '${E2E_USERS.outsider.email}'
    `),
  ).toBe("true");
});
