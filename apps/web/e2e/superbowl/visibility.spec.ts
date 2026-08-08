import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId } from "../helpers/db";

test("Super Bowl opponents stay hidden before start and appear in progress", async ({
  page,
}) => {
  const activeLeagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  const competitionLeagueId = getLeagueId(E2E_LEAGUES.competition.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${activeLeagueId}/superbowl`);
  const ownPreseasonRow = page
    .getByRole("row")
    .filter({ hasText: "webplayer" });
  await expect(ownPreseasonRow.getByRole("cell")).toHaveCount(4);
  await expect(ownPreseasonRow.getByText("--")).toHaveCount(0);
  const hiddenAdminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(hiddenAdminRow.getByText("--")).toHaveCount(3);

  await page.goto(`/league/${competitionLeagueId}/superbowl`);
  const visibleAdminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(visibleAdminRow).toContainText("KC");
  await expect(visibleAdminRow).toContainText("DAL");
  await expect(visibleAdminRow).toContainText("51");
});
