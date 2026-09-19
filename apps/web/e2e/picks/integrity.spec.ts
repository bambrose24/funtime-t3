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

function picksSummaryUrl(leagueId: number, week = 1) {
  return `/api/trpc/league.picksSummary?input=${encodeURIComponent(
    JSON.stringify({ json: { leagueId, week } }),
  )}`;
}

test("started games lock and the league table stays hidden until this player submits", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.integrity.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${leagueId}?week=1`);
  await expect(
    page.getByRole("heading", {
      name: "Make your picks to see the league's picks",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Make your picks" }),
  ).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "webadmin" }),
  ).toHaveCount(0);

  // Check the authenticated response too: hiding only the table would leak picks.
  const summaryUrl = picksSummaryUrl(leagueId);
  const startedResponse = await page.request.get(summaryUrl);
  expect(startedResponse.ok()).toBe(true);
  const startedRows = (await startedResponse.json()).result.data.json;
  const startedAdmin = startedRows.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webadmin",
  );
  expect(startedAdmin.tiebreakerScore).toBe(0);
  expect(
    startedAdmin.picks.every(
      (pick: { winner: number | null }) => pick.winner == null,
    ),
  ).toBe(true);

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
  const adminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  const futureTeam = queryScalar(`
    SELECT t."abbrev" FROM "games" g
    JOIN "teams" t ON t."teamid" = g."home"
    WHERE g."gid" = 2028002
  `);
  expect(futureTeam).not.toBe("");
  await expect(adminRow.getByRole("cell")).toHaveText([
    "webadmin",
    "0",
    "46",
    "KC",
    futureTeam,
  ]);
  await expect(adminRow.getByText("--")).toHaveCount(0);

  const revealedResponse = await page.request.get(summaryUrl);
  expect(revealedResponse.ok()).toBe(true);
  const revealedAdmin = (await revealedResponse.json()).result.data.json.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webadmin",
  );
  expect(revealedAdmin.tiebreakerScore).toBe(46);
  expect(revealedAdmin.picks).toEqual([
    expect.objectContaining({ gid: 2028001, winner: 2 }),
    expect.objectContaining({ gid: 2028002, winner: 6 }),
  ]);

  // A fresh server render must preserve the reveal, not just client state.
  await page.reload();
  await expect(adminRow.getByRole("cell")).toHaveText([
    "webadmin",
    "0",
    "46",
    "KC",
    futureTeam,
  ]);
});

test("submitted picks stay private until the first game of the week starts", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.competition.shareCode);
  const gameCount = Number(
    queryScalar(`
      SELECT COUNT(*) FROM "games" g
      JOIN "leagues" l ON l."season" = g."season"
      WHERE l."league_id" = ${leagueId} AND g."week" = 1
    `),
  );
  expect(gameCount).toBeGreaterThan(0);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${leagueId}?week=1`);
  const adminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  const playerRow = page.getByRole("row").filter({ hasText: "webplayer" });
  await expect(adminRow.getByText("--")).toHaveCount(0);
  await expect(playerRow.getByText("--")).toHaveCount(gameCount);
  await expect(playerRow.getByRole("cell").nth(2)).toHaveText("0");

  const response = await page.request.get(picksSummaryUrl(leagueId));
  expect(response.ok()).toBe(true);
  const rows = (await response.json()).result.data.json;
  const admin = rows.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webadmin",
  );
  const player = rows.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webplayer",
  );
  expect(admin.picks.length).toBe(gameCount);
  expect(
    admin.picks.every((pick: { winner: number | null }) => pick.winner),
  ).toBe(true);
  expect(admin.tiebreakerScore).toBe(44);
  expect(
    player.picks.every(
      (pick: { winner: number | null }) => pick.winner == null,
    ),
  ).toBe(true);
  expect(player.tiebreakerScore).toBe(0);

  await page.reload();
  await expect(adminRow.getByText("--")).toHaveCount(0);
  await expect(playerRow.getByText("--")).toHaveCount(gameCount);
});
