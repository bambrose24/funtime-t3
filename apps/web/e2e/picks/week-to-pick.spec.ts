import { E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

const SHARE_CODE = "E2ENEXTWEEK";
const WEEK1_STARTED = 2031001;
const WEEK1_REMAINING = 2031002;
const WEEK2_OPEN = 2031003;
const WEEK2_TIEBREAKER = 2031004;

function cleanup() {
  executeSql(`
    DELETE FROM "picks" WHERE "gid" IN (${WEEK1_STARTED}, ${WEEK1_REMAINING}, ${WEEK2_OPEN}, ${WEEK2_TIEBREAKER});
    DELETE FROM "leagues" WHERE "share_code" = '${SHARE_CODE}';
    DELETE FROM "games" WHERE "gid" IN (${WEEK1_STARTED}, ${WEEK1_REMAINING}, ${WEEK2_OPEN}, ${WEEK2_TIEBREAKER});
  `);
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
    SELECT "uid", 'E2E Next Unstarted Week', 2031, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', '${SHARE_CODE}', FALSE, 'in_progress'
    FROM "people" WHERE "email" = '${E2E_USERS.policyPlayer.email}';
    INSERT INTO "leaguemembers" ("user_id", "league_id", "role")
    SELECT p."uid", l."league_id", 'player' FROM "people" p
    JOIN "leagues" l ON l."share_code" = '${SHARE_CODE}'
    WHERE p."email" = '${E2E_USERS.policyPlayer.email}';
  `);
});
test.afterEach(cleanup);

test("pick page advances to the next unstarted week after kickoff", async ({
  page,
}) => {
  expect(
    queryScalar(
      `SELECT COUNT(*) FROM "games" WHERE "gid" = ${WEEK1_REMAINING} AND "ts" > NOW()`,
    ),
  ).toBe("1");

  const leagueId = getLeagueId(SHARE_CODE);
  await login(page, E2E_USERS.policyPlayer);
  await page.goto(`/league/${leagueId}/pick`);

  await expect(
    page.getByRole("heading", { name: "Make Your Picks" }),
  ).toBeVisible();
  await expect(page.getByText("Week 2, 2031")).toBeVisible();
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK1_STARTED}`) }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK1_REMAINING}`) }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK2_OPEN}`) }),
  ).toHaveCount(2);
  await expect(
    page.getByRole("radio", { name: new RegExp(`for game ${WEEK2_TIEBREAKER}`) }),
  ).toHaveCount(2);

  await page.getByRole("button", { name: "Randomize Picks" }).click();
  await page.getByLabel("Tiebreaker Score").fill("47");
  await page.getByRole("button", { name: "Submit Picks" }).click();
  await expect(
    page.getByRole("heading", { name: "Your picks are in for week 2" }),
  ).toBeVisible();

  expect(
    queryScalar(`
      SELECT CONCAT(COUNT(*), '|', MIN(p."week"), '|', MAX(p."week"), '|', MIN(p."gid"), '|', MAX(p."gid"))
      FROM "picks" p
      JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
      WHERE m."league_id" = ${leagueId}
    `),
  ).toBe(`2|2|2|${WEEK2_OPEN}|${WEEK2_TIEBREAKER}`);
});
