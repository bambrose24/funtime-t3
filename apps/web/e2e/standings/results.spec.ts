import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId } from "../helpers/db";

test("completed results render weekly winners, tied ranks, chart, and profile totals", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const leagueId = getLeagueId(E2E_LEAGUES.results.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${leagueId}`);
  const winnerAlert = page.getByRole("alert").filter({
    hasText: /Congrats to this week's winners:/,
  });
  await expect(winnerAlert).toBeVisible();
  await expect(
    winnerAlert.getByRole("link", { name: "webadmin" }),
  ).toBeVisible();
  await expect(
    winnerAlert.getByRole("link", { name: "webplayer" }),
  ).toBeVisible();

  await page.goto(`/league/${leagueId}/leaderboard`);
  await expect(
    page.getByRole("heading", {
      name: `${E2E_LEAGUES.results.name} Leaderboard`,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "2029 Season Complete" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Weekly Standings" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Correct Picks by Week" }),
  ).toBeVisible();

  for (const username of ["webadmin", "webplayer"]) {
    const row = page.getByRole("row").filter({ hasText: username });
    await expect(row.getByRole("cell").nth(1)).toHaveText("1");
    await expect(row.getByRole("cell").nth(3)).toHaveText("2");
  }

  await page.goto(`/league/${leagueId}/my-profile`);
  await expect(page.getByRole("heading", { name: "webplayer" })).toBeVisible();
  await expect(page.getByText("2 / 2")).toBeVisible();
  await expect(page.getByText("Week 1", { exact: true })).toBeVisible();
});
