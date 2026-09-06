import { E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

test("closed week is read-only and mixed-policy rejection preserves a retryable draft", async ({
  page,
  browserErrorGuard,
}) => {
  browserErrorGuard.allow(
    /Failed to load resource: the server responded with a status of 400/,
  );
  browserErrorGuard.allow(/picks\.submitPicks[\s\S]*first kickoff/);
  executeSql(`
    INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "scoring_type", "share_code", "status")
    SELECT "uid", 'E2E Policy Open', 2028, 'allow_late_and_lock_after_start', 'choose_winner', 'game_winner', 'E2EPOLICYOPEN', 'in_progress'
    FROM "people" WHERE "email" = '${E2E_USERS.policyPlayer.email}';
    INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "scoring_type", "share_code", "status")
    SELECT "uid", 'E2E Policy Closed', 2028, 'close_at_first_game_start', 'choose_winner', 'game_winner', 'E2EPOLICYCLOSED', 'in_progress'
    FROM "people" WHERE "email" = '${E2E_USERS.policyPlayer.email}';
    INSERT INTO "leaguemembers" ("user_id", "league_id", "role")
    SELECT p."uid", l."league_id", 'player' FROM "people" p CROSS JOIN "leagues" l
    WHERE p."email" = '${E2E_USERS.policyPlayer.email}' AND l."share_code" IN ('E2EPOLICYOPEN', 'E2EPOLICYCLOSED');
  `);
  const openId = getLeagueId("E2EPOLICYOPEN");
  const closedId = getLeagueId("E2EPOLICYCLOSED");
  try {
    await login(page, E2E_USERS.policyPlayer);
    await page.goto(`/league/${closedId}/pick`);
    await expect(
      page.getByRole("heading", { name: "Picks are closed for week 1" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Submit Picks" }),
    ).toHaveCount(0);
    await expect(page.getByRole("radio")).toHaveCount(0);
    await page.goto(`/league/${openId}/pick`);
    await page.getByRole("button", { name: "Randomize Picks" }).click();
    await page.getByLabel("Tiebreaker Score").fill("51");
    const chosen = await page
      .getByRole("radio", { checked: true })
      .getAttribute("id");
    expect(chosen).toBeTruthy();
    const applyAll = page.getByRole("checkbox", {
      name: /apply for all of them/i,
    });
    await applyAll.check();
    await page.getByRole("button", { name: "Submit Picks" }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({
          hasText:
            "Weekly picks closed at the first kickoff for: E2E Policy Closed",
        }),
    ).toBeVisible();
    expect(
      queryScalar(
        `SELECT COUNT(*) FROM "picks" p JOIN "leaguemembers" m ON m."membership_id" = p."member_id" WHERE m."league_id" IN (${openId}, ${closedId})`,
      ),
    ).toBe("0");
    await expect(page.getByLabel("Tiebreaker Score")).toHaveValue("51");
    await expect(page.locator(`[id="${chosen}"]`)).toBeChecked();
    await applyAll.uncheck();
    await expect(
      page.getByRole("button", { name: "Submit Picks" }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Submit Picks" }).click();
    await expect(
      page.getByRole("heading", { name: "Your picks are in for week 1" }),
    ).toBeVisible();
    expect(
      queryScalar(
        `SELECT COUNT(*) FROM "picks" p JOIN "leaguemembers" m ON m."membership_id" = p."member_id" WHERE m."league_id" = ${openId}`,
      ),
    ).toBe("1");
    expect(
      queryScalar(
        `SELECT COUNT(*) FROM "picks" p JOIN "leaguemembers" m ON m."membership_id" = p."member_id" WHERE m."league_id" = ${closedId}`,
      ),
    ).toBe("0");
  } finally {
    executeSql(
      `DELETE FROM "leagues" WHERE "league_id" IN (${openId}, ${closedId})`,
    );
  }
});
