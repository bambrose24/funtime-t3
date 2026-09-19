import { E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

const ALLOW_LATE_CODE = "E2ENEXTWEEK";
const FIRST_KICKOFF_CODE = "E2ENEXTWEEKCLOSE";
const WEEK1_STARTED = 2031001;
const WEEK1_REMAINING = 2031002;
const WEEK2_OPEN = 2031003;
const WEEK2_TIEBREAKER = 2031004;

function cleanup() {
  executeSql(`
    DELETE FROM "picks" WHERE "gid" IN (${WEEK1_STARTED}, ${WEEK1_REMAINING}, ${WEEK2_OPEN}, ${WEEK2_TIEBREAKER});
    DELETE FROM "leagues" WHERE "share_code" IN ('${ALLOW_LATE_CODE}', '${FIRST_KICKOFF_CODE}');
    DELETE FROM "games" WHERE "gid" IN (${WEEK1_STARTED}, ${WEEK1_REMAINING}, ${WEEK2_OPEN}, ${WEEK2_TIEBREAKER});
  `);
}

function picksSummaryUrl(leagueId: number, week = 1) {
  return `/api/trpc/league.picksSummary?input=${encodeURIComponent(
    JSON.stringify({ json: { leagueId, week } }),
  )}`;
}

test.beforeEach(() => {
  cleanup();
  executeSql(`
    INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "done", "is_tiebreaker", "espn_id") VALUES
      (${WEEK1_STARTED}, 2031, 1, NOW() - INTERVAL '1 hour', 2, 1, FALSE, FALSE, ${WEEK1_STARTED}),
      (${WEEK1_REMAINING}, 2031, 1, NOW() + INTERVAL '1 day', 6, 5, FALSE, TRUE, ${WEEK1_REMAINING}),
      (${WEEK2_OPEN}, 2031, 2, NOW() + INTERVAL '3 days', 2, 1, FALSE, FALSE, ${WEEK2_OPEN}),
      (${WEEK2_TIEBREAKER}, 2031, 2, NOW() + INTERVAL '4 days', 6, 5, FALSE, TRUE, ${WEEK2_TIEBREAKER});
    INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
    SELECT "uid", 'E2E Allow Late Remaining', 2031, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', '${ALLOW_LATE_CODE}', FALSE, 'in_progress'
    FROM "people" WHERE "email" = '${E2E_USERS.policyPlayer.email}';
    INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
    SELECT "uid", 'E2E First Kickoff Skip', 2031, 'close_at_first_game_start', 'choose_winner', 'three_hours_before', 'game_winner', '${FIRST_KICKOFF_CODE}', FALSE, 'in_progress'
    FROM "people" WHERE "email" = '${E2E_USERS.policyPlayer.email}';
    INSERT INTO "leaguemembers" ("user_id", "league_id", "role")
    SELECT p."uid", l."league_id", 'player' FROM "people" p
    JOIN "leagues" l ON l."share_code" IN ('${ALLOW_LATE_CODE}', '${FIRST_KICKOFF_CODE}')
    WHERE p."email" IN ('${E2E_USERS.policyPlayer.email}', '${E2E_USERS.admin.email}');
    INSERT INTO "picks" ("uid", "season", "week", "gid", "winner", "loser", "score", "is_random", "member_id")
    SELECT m."user_id", g."season", g."week", g."gid", g."home", g."away",
      CASE WHEN g."is_tiebreaker" THEN 46 ELSE NULL END,
      FALSE, m."membership_id"
    FROM "leaguemembers" m
    JOIN "leagues" l ON l."league_id" = m."league_id"
    JOIN "people" p ON p."uid" = m."user_id"
    JOIN "games" g ON g."gid" IN (${WEEK1_STARTED}, ${WEEK1_REMAINING})
    WHERE l."share_code" IN ('${ALLOW_LATE_CODE}', '${FIRST_KICKOFF_CODE}')
      AND p."email" = '${E2E_USERS.admin.email}';
  `);
});
test.afterEach(cleanup);

test("allow-late keeps the started week until remaining games are submitted", async ({
  page,
}) => {
  expect(
    queryScalar(
      `SELECT COUNT(*) FROM "games" WHERE "gid" = ${WEEK1_REMAINING} AND "ts" > NOW()`,
    ),
  ).toBe("1");

  const leagueId = getLeagueId(ALLOW_LATE_CODE);
  await login(page, E2E_USERS.policyPlayer);
  await page.goto(`/league/${leagueId}?week=1`);
  await expect(
    page.getByRole("heading", {
      name: "Make your picks to see the league's picks",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "webadmin" }),
  ).toHaveCount(0);

  const hidden = await page.request.get(picksSummaryUrl(leagueId));
  expect(hidden.ok()).toBe(true);
  const hiddenAdmin = (await hidden.json()).result.data.json.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webadmin",
  );
  expect(
    hiddenAdmin.picks.every(
      (pick: { winner: number | null }) => pick.winner == null,
    ),
  ).toBe(true);

  await page.getByRole("link", { name: "Make your picks" }).click();
  await expect(page).toHaveURL(new RegExp(`/league/${leagueId}/pick$`));
  await expect(
    page.getByRole("heading", { name: "Make Your Picks" }),
  ).toBeVisible();
  await expect(page.getByText("Week 1, 2031")).toBeVisible();
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK1_STARTED}`) }),
  ).toHaveCount(2);
  await expect(
    page
      .getByRole("radio", { name: new RegExp(`for game ${WEEK1_STARTED}`) })
      .first(),
  ).toBeDisabled();
  await expect(
    page.getByRole("radio", {
      name: new RegExp(`for game ${WEEK1_REMAINING}`),
    }),
  ).toHaveCount(2);
  await expect(
    page
      .getByRole("radio", {
        name: new RegExp(`for game ${WEEK1_REMAINING}`),
      })
      .first(),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Randomize Picks" }).click();
  await page.getByLabel("Tiebreaker Score").fill("47");
  await page.getByRole("button", { name: "Submit Picks" }).click();
  await expect(
    page.getByRole("heading", { name: "Your picks are in for week 1" }),
  ).toBeVisible();

  expect(
    queryScalar(`
      SELECT CONCAT(COUNT(*), '|', MIN(p."week"), '|', MAX(p."week"), '|', MIN(p."gid"), '|', MAX(p."gid"))
      FROM "picks" p
      JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
      JOIN "people" person ON person."uid" = m."user_id"
      WHERE m."league_id" = ${leagueId}
        AND person."email" = '${E2E_USERS.policyPlayer.email}'
    `),
  ).toBe(`1|1|1|${WEEK1_REMAINING}|${WEEK1_REMAINING}`);

  await page.goto(`/league/${leagueId}/pick`);
  await expect(page.getByText("Week 2, 2031")).toBeVisible();
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK2_OPEN}`) }),
  ).toHaveCount(2);

  await page.goto(`/league/${leagueId}?week=1`);
  await expect(
    page.getByRole("heading", {
      name: "Make your picks to see the league's picks",
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "webadmin" }),
  ).toBeVisible();
});

test("first-kickoff advances past a started week and still shows the closed week's table", async ({
  page,
}) => {
  const leagueId = getLeagueId(FIRST_KICKOFF_CODE);
  await login(page, E2E_USERS.policyPlayer);
  await page.goto(`/league/${leagueId}?week=1`);
  await expect(
    page.getByRole("heading", {
      name: "Make your picks to see the league's picks",
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "webadmin" }),
  ).toBeVisible();

  const revealed = await page.request.get(picksSummaryUrl(leagueId));
  expect(revealed.ok()).toBe(true);
  const revealedAdmin = (await revealed.json()).result.data.json.find(
    (row: { people: { username: string } }) =>
      row.people.username === "webadmin",
  );
  expect(
    revealedAdmin.picks.every(
      (pick: { winner: number | null }) => pick.winner != null,
    ),
  ).toBe(true);

  await page.goto(`/league/${leagueId}/pick`);
  await expect(
    page.getByRole("heading", { name: "Make Your Picks" }),
  ).toBeVisible();
  await expect(page.getByText("Week 2, 2031")).toBeVisible();
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK1_STARTED}`) }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK2_OPEN}`) }),
  ).toHaveCount(2);
});
