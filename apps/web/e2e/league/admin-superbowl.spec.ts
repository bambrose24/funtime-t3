import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId } from "../helpers/db";

test("league admin can review every preseason Super Bowl pick", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${leagueId}/admin/superbowl`);

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
});
