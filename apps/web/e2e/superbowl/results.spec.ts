import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId } from "../helpers/db";

test("completed Super Bowl bracket ranks contest predictions", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.bracket.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${leagueId}/superbowl`);
  await expect(
    page.getByText("Playoff Bracket", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Final", { exact: true })).toBeVisible();
  await expect(page.getByText("KC over DAL • Score: 51")).toBeVisible();

  const winnerRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(winnerRow.getByRole("cell")).toHaveCount(5);
  await expect(winnerRow.getByText("1", { exact: true })).toBeVisible();
  await expect(winnerRow).toContainText("KC");
  await expect(winnerRow).toContainText("DAL");
  await expect(winnerRow).toContainText("51");
  await expect(winnerRow).toContainText("🏆");

  const secondPlaceRow = page.getByRole("row").filter({ hasText: "webplayer" });
  await expect(secondPlaceRow.getByText("2", { exact: true })).toBeVisible();
  await expect(secondPlaceRow).toContainText("BUF");
  await expect(secondPlaceRow).toContainText("PHI");
  await expect(secondPlaceRow).toContainText("48");
});
