import { E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId } from "../helpers/db";

function cleanup() {
  executeSql(
    `DELETE FROM "leagues" WHERE "share_code" IN ('E2EHOME', 'E2EHOMEPREV'); DELETE FROM "games" WHERE "gid" IN (9060101, 9060102);`,
  );
}
test.beforeEach(() => {
  cleanup();
  executeSql(`
    INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "done", "is_tiebreaker", "espn_id") VALUES
      (9060101, 2026, 1, NOW() + INTERVAL '1 day', 2, 1, FALSE, FALSE, 9060101),
      (9060102, 2026, 1, NOW() + INTERVAL '2 days', 6, 5, FALSE, TRUE, 9060102);
    INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
    SELECT "uid", 'Sunday Crew with a longer league name', 2026, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EHOME', FALSE, 'in_progress' FROM "people" WHERE "email" = '${E2E_USERS.player.email}';
    INSERT INTO "leagues" ("created_by_user_id", "name", "season", "share_code", "status")
    SELECT "uid", 'Sunday Crew last season', 2025, 'E2EHOMEPREV', 'completed' FROM "people" WHERE "email" = '${E2E_USERS.player.email}';
    INSERT INTO "leaguemembers" ("user_id", "league_id", "role")
    SELECT p."uid", l."league_id", 'player' FROM "people" p CROSS JOIN "leagues" l
    WHERE p."email" = '${E2E_USERS.player.email}' AND l."share_code" IN ('E2EHOME', 'E2EHOMEPREV');
  `);
});
test.afterEach(cleanup);

test("home shows weekly submission status and returns to the list after picking", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, E2E_USERS.player);
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "My leagues" })).toBeVisible();
  const active = page.getByRole("region", { name: "Active leagues" });
  await expect(active).toContainText("Picks needed");
  await expect(active).toContainText("Week 1");
  await expect(
    page.getByRole("link", { name: "Sunday Crew last season" }),
  ).toBeHidden();
  await page.getByText("Past seasons", { exact: false }).click();
  await expect(
    page.getByRole("link", { name: /Sunday Crew last season/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/funtime-home-mobile.png",
    fullPage: true,
  });

  const leagueId = getLeagueId("E2EHOME");
  await active.getByRole("link", { name: /Make picks for/ }).click();
  await expect(page).toHaveURL(new RegExp(`/league/${leagueId}/pick$`));
  await page.getByRole("button", { name: "Randomize Picks" }).click();
  await page.getByLabel("Tiebreaker Score").fill("45");
  await page.getByRole("button", { name: "Submit Picks" }).click();
  await expect(
    page.getByRole("heading", { name: "Your picks are in for week 1" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(active).toContainText("Picks are in");
  await expect(
    active.getByRole("link", { name: /Make picks for/ }),
  ).toHaveCount(0);
  await expect(
    active.getByRole("link", { name: /View picks for/ }),
  ).toHaveAttribute("href", `/league/${leagueId}?week=1`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({
    path: "/tmp/funtime-home-desktop.png",
    fullPage: true,
  });
});
