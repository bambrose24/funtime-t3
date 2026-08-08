import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("started games lock and other players' future picks remain hidden", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.integrity.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${leagueId}?week=1`);
  const hiddenAdminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(hiddenAdminRow.getByText("--")).toHaveCount(2);

  await page.goto(`/league/${leagueId}/pick`);
  await expect(
    page.getByRole("heading", { name: "Make Your Picks" }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "Buffalo Bills for game 2028001" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("radio", { name: "Philadelphia Eagles for game 2028002" }),
  ).toBeEnabled();

  const submit = page.getByRole("button", { name: "Submit Picks" });
  await page.getByRole("button", { name: "Randomize Picks" }).click();
  await expect(submit).toBeDisabled();
  await page.getByLabel("Tiebreaker Score").fill("0");
  await expect(submit).toBeDisabled();
  await page.getByLabel("Tiebreaker Score").fill("201");
  await expect(submit).toBeDisabled();
  await page.getByLabel("Tiebreaker Score").fill("44");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(
    page.getByRole("heading", { name: "Your picks are in for week 1" }),
  ).toBeVisible();

  expect(
    queryScalar(`
      SELECT CONCAT(COUNT(*), '|', MIN("gid"), '|', MAX("score"))
      FROM "picks" p
      JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
      JOIN "people" person ON person."uid" = m."user_id"
      WHERE m."league_id" = ${leagueId}
        AND person."email" = '${E2E_USERS.player.email}'
    `),
  ).toBe("1|2028002|44");

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();
  await page.goto(`/league/${leagueId}?week=1`);
  const submittedAdminRow = page
    .getByRole("row")
    .filter({ hasText: "webadmin" });
  await expect(
    submittedAdminRow.getByText("KC", { exact: true }),
  ).toBeVisible();
  await expect(submittedAdminRow.getByText("--")).toHaveCount(1);
});
