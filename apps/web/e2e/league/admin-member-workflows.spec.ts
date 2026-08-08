import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("league admin cannot edit a pick after kickoff", async ({
  browserErrorGuard,
  page,
}) => {
  test.setTimeout(60_000);
  browserErrorGuard.allow(
    /Failed to load resource: the server responded with a status of 400/,
  );
  browserErrorGuard.allow(
    /league\.admin\.setPick[\s\S]*League admins cannot edit picks after kickoff/,
  );
  const overrideLeagueId = getLeagueId(E2E_LEAGUES.override.shareCode);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${overrideLeagueId}/admin/members`);
  const overridePlayerRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.player.email });
  await overridePlayerRow.getByRole("button", { name: "Edit Picks" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Pick for BUF at KC, game 2028001" })
    .click();
  await page.getByRole("option", { name: "KC", exact: true }).click();
  await expect(
    page.getByText(/League admins cannot edit picks after kickoff/),
  ).toBeVisible();
  expect(
    queryScalar(`
      SELECT COUNT(*)
      FROM "picks" p
      JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
      JOIN "people" person ON person."uid" = m."user_id"
      WHERE m."league_id" = ${overrideLeagueId}
        AND p."gid" = 2028001
        AND person."email" = '${E2E_USERS.player.email}'
    `),
  ).toBe("0");
  await dialog.getByRole("button", { name: "Close" }).click();
});

test("super admin can override a pick after kickoff", async ({ page }) => {
  test.setTimeout(60_000);
  const overrideLeagueId = getLeagueId(E2E_LEAGUES.override.shareCode);
  await login(page, E2E_USERS.superAdmin);
  await page.goto(`/league/${overrideLeagueId}/admin/members`);
  const superAdminPlayerRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.player.email });
  await superAdminPlayerRow.getByRole("button", { name: "Edit Picks" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Pick for BUF at KC, game 2028001" })
    .click();
  await page.getByRole("option", { name: "KC", exact: true }).click();
  await expect(page.getByText("Pick updated successfully")).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT p."winner"
        FROM "picks" p
        JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE m."league_id" = ${overrideLeagueId}
          AND p."gid" = 2028001
          AND person."email" = '${E2E_USERS.player.email}'
      `),
    )
    .toBe("2");
  await dialog.getByRole("button", { name: "Close" }).click();
});

test("league admin handles member picks, email history, throttling, and removal", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const adminOpsLeagueId = getLeagueId(E2E_LEAGUES.adminOps.shareCode);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${adminOpsLeagueId}/admin/members`);
  const outsiderRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.outsider.email });
  await outsiderRow.getByRole("button", { name: "Edit Picks" }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Pick for BUF at KC, game 2027001" })
    .click();
  await page.getByRole("option", { name: "KC", exact: true }).click();
  await expect(page.getByText("Pick updated successfully")).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT p."winner"
        FROM "picks" p
        JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE m."league_id" = ${adminOpsLeagueId}
          AND p."gid" = 2027001
          AND person."email" = '${E2E_USERS.outsider.email}'
      `),
    )
    .toBe("2");
  await dialog.getByRole("button", { name: "Close" }).click();

  await outsiderRow.getByRole("button", { name: "View Emails" }).click();
  dialog = page.getByRole("dialog");
  await expect(dialog.getByText("No subject")).toHaveCount(2);
  await expect(
    dialog.getByRole("button", { name: "View Content" }),
  ).toHaveCount(2);
  await dialog.getByRole("button", { name: "Close" }).click();

  await page.goto(`/league/${adminOpsLeagueId}/admin`);
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();

  await page.goto(`/league/${adminOpsLeagueId}/admin/members`);
  const removableRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.outsider.email });
  await removableRow
    .getByRole("button", { name: "Actions for weboutsider" })
    .click();
  await page.getByRole("menuitem", { name: "Edit Player" }).click();
  await page
    .getByRole("button", {
      name: `Remove weboutsider from ${E2E_LEAGUES.adminOps.name}`,
    })
    .click();
  await page
    .getByRole("button", {
      name: `Yes, remove weboutsider from ${E2E_LEAGUES.adminOps.name}`,
    })
    .click();
  await expect(removableRow).toHaveCount(0);
  await expect
    .poll(() =>
      queryScalar(`
        SELECT COUNT(*)
        FROM "leaguemembers" m
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE m."league_id" = ${adminOpsLeagueId}
          AND person."email" = '${E2E_USERS.outsider.email}'
      `),
    )
    .toBe("0");
});
