import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("league admin can review and edit Super Bowl picks", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${leagueId}/admin`);
  await page.getByRole("tab", { name: "Super Bowl" }).click();
  await expect(page).toHaveURL(`/league/${leagueId}/admin/superbowl`);

  await expect(
    page.getByRole("heading", { name: "Super Bowl Picks", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("2 submitted", { exact: true })).toBeVisible();

  const adminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(adminRow).toContainText("KC");
  await expect(adminRow).toContainText("DAL");
  await expect(adminRow).toContainText("51");

  const playerRow = page.getByRole("row").filter({ hasText: "webplayer" });
  await expect(playerRow).toContainText("BUF");
  await expect(playerRow).toContainText("PHI");
  await expect(playerRow).toContainText("48");

  await page
    .getByRole("button", { name: "Edit Super Bowl pick for webadmin" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Edit Super Bowl pick" }),
  ).toBeVisible();

  await dialog.getByRole("combobox", { name: "AFC Team" }).click();
  await page.getByRole("option", { name: "Buffalo Bills" }).click();
  await dialog.getByRole("combobox", { name: "Winner" }).click();
  await page.getByRole("option", { name: "Buffalo Bills" }).click();
  await dialog.getByLabel("Total Score").fill("60");
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Updated Super Bowl pick for webadmin")).toBeVisible();
  await expect(adminRow).toContainText("BUF");
  await expect(adminRow).toContainText("DAL");
  await expect(adminRow).toContainText("60");
  await expect
    .poll(() =>
      queryScalar(`
        SELECT CONCAT(s."winner", '|', s."loser", '|', s."score")
        FROM "superbowl" s
        JOIN "leaguemembers" m ON m."membership_id" = s."member_id"
        JOIN "people" p ON p."uid" = m."user_id"
        WHERE m."league_id" = ${leagueId}
          AND p."email" = '${E2E_USERS.admin.email}'
      `),
    )
    .toBe("1|6|60");
});
