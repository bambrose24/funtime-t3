import { E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId } from "../helpers/db";

const SHARE_CODE = "E2ESEASONADMIN";
const LEAGUE_NAME = "E2E Season Admin League";

function cleanup() {
  executeSql(`DELETE FROM "leagues" WHERE "share_code" = '${SHARE_CODE}'`);
}

test.beforeEach(() => {
  cleanup();
  executeSql(`
    INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
    SELECT "uid", '${LEAGUE_NAME}', 2026, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', '${SHARE_CODE}', FALSE, 'in_progress'
    FROM "people" WHERE "email" = '${E2E_USERS.admin.email}';
    INSERT INTO "leaguemembers" ("user_id", "league_id", "role")
    SELECT p."uid", l."league_id", 'admin' FROM "people" p CROSS JOIN "leagues" l
    WHERE l."share_code" = '${SHARE_CODE}'
      AND p."email" IN ('${E2E_USERS.admin.email}', '${E2E_USERS.player.email}');
    INSERT INTO "leaguemembers" ("user_id", "league_id", "role")
    SELECT p."uid", l."league_id", 'player' FROM "people" p CROSS JOIN "leagues" l
    WHERE l."share_code" = '${SHARE_CODE}'
      AND p."email" = '${E2E_USERS.outsider.email}';
  `);
});

test.afterEach(cleanup);

test("admin dashboard lists current-season leagues with members and admins", async ({
  page,
}) => {
  const leagueId = getLeagueId(SHARE_CODE);

  await login(page, E2E_USERS.superAdmin);
  await page.goto("/admin");

  await expect(page.getByText("2026 Leagues")).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: LEAGUE_NAME });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell").nth(1)).toHaveText("3");
  await expect(row).toContainText("webadmin");
  await expect(row).toContainText("webplayer");
  await expect(row.getByRole("link", { name: LEAGUE_NAME })).toHaveAttribute(
    "href",
    `/league/${leagueId}/admin`,
  );
});
