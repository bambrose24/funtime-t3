import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("player submits, applies, and idempotently updates weekly picks", async ({
  page,
}) => {
  const activeLeagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  const competitionLeagueId = getLeagueId(E2E_LEAGUES.competition.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${activeLeagueId}/pick`);
  await expect(
    page.getByRole("heading", { name: "Make Your Picks" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Submit Picks" }),
  ).toBeDisabled();

  await page.getByRole("button", { name: "Randomize Picks" }).click();
  await page.getByLabel("Tiebreaker Score").fill("51");
  await page.getByRole("checkbox", { name: /apply for all of them/i }).check();
  await page.getByRole("button", { name: "Submit Picks" }).click();

  await expect(
    page.getByRole("heading", { name: "Your picks are in for week 1" }),
  ).toBeVisible();
  await expect(
    page.getByText("These picks apply to all 2 of your leagues"),
  ).toBeVisible();

  await expect
    .poll(() =>
      queryScalar(`
        SELECT COUNT(*)
        FROM "picks" p
        JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE person."email" = '${E2E_USERS.player.email}'
          AND m."league_id" IN (${activeLeagueId}, ${competitionLeagueId})
          AND p."week" = 1
      `),
    )
    .toBe("8");

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();
  await page.goto(`/league/${activeLeagueId}/pick`);
  await expect(
    page.getByRole("heading", { name: "Update Your Picks" }),
  ).toBeVisible();

  await page.getByLabel("Tiebreaker Score").fill("52");
  await page.getByRole("button", { name: "Update Picks" }).click();
  await expect(
    page.getByRole("heading", { name: "Your picks are in for week 1" }),
  ).toBeVisible();

  await expect
    .poll(() =>
      queryScalar(`
        SELECT CONCAT(COUNT(*), '|', MAX(p."score"))
        FROM "picks" p
        JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE person."email" = '${E2E_USERS.player.email}'
          AND m."league_id" = ${activeLeagueId}
          AND p."week" = 1
      `),
    )
    .toBe("4|52");
});
