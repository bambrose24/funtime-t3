import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

test.beforeEach(() => {
  // A retry must start before submission without changing the opponent's card.
  executeSql(`
    DELETE FROM "picks" p
    USING "leaguemembers" m, "people" person, "leagues" l
    WHERE p."member_id" = m."membership_id"
      AND m."user_id" = person."uid"
      AND m."league_id" = l."league_id"
      AND person."email" = '${E2E_USERS.player.email}'
      AND l."share_code" = '${E2E_LEAGUES.integrity.shareCode}'
      AND p."week" = 1
  `);
});

test("started games lock and submission reveals the full weekly picks table", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.integrity.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${leagueId}?week=1`);
  const hiddenAdminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(hiddenAdminRow.getByText("--")).toHaveCount(2);
  await expect(hiddenAdminRow.getByRole("cell").nth(2)).toHaveText("0");

  // Check the authenticated response too: hiding only the table would leak picks.
  const summaryUrl = `/api/trpc/league.picksSummary?input=${encodeURIComponent(
    JSON.stringify({ json: { leagueId, week: 1 } }),
  )}`;
  const hiddenResponse = await page.request.get(summaryUrl);
  expect(hiddenResponse.ok()).toBe(true);
  const hiddenRows = (await hiddenResponse.json()).result.data.json;
  const hiddenAdmin = hiddenRows.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webadmin",
  );
  expect(hiddenAdmin).toMatchObject({ correctPicks: 0, tiebreakerScore: 0 });
  expect(hiddenAdmin.picks).toHaveLength(2);
  for (const pick of hiddenAdmin.picks) {
    expect(pick).toMatchObject({ winner: null, correct: null });
  }

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
  // The seeded week has one started game and one future tiebreaker. Both
  // opponents' picks must appear, even though the viewer missed the first game.
  const futureTeam = queryScalar(`
    SELECT t."abbrev" FROM "games" g
    JOIN "teams" t ON t."teamid" = g."home"
    WHERE g."gid" = 2028002
  `);
  expect(futureTeam).not.toBe("");
  await expect(submittedAdminRow.getByRole("cell")).toHaveText([
    "webadmin",
    "0",
    "46",
    "KC",
    futureTeam,
  ]);
  await expect(submittedAdminRow.getByText("--")).toHaveCount(0);

  const visibleResponse = await page.request.get(summaryUrl);
  expect(visibleResponse.ok()).toBe(true);
  const visibleRows = (await visibleResponse.json()).result.data.json;
  const visibleAdmin = visibleRows.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webadmin",
  );
  expect(visibleAdmin.tiebreakerScore).toBe(46);
  expect(visibleAdmin.picks).toEqual([
    expect.objectContaining({ gid: 2028001, winner: 2 }),
    expect.objectContaining({ gid: 2028002, winner: 6 }),
  ]);

  // A fresh server render must preserve the reveal, not just client state.
  await page.reload();
  await expect(submittedAdminRow.getByRole("cell")).toHaveText([
    "webadmin",
    "0",
    "46",
    "KC",
    futureTeam,
  ]);
});
