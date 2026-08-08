import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { queryScalar } from "../helpers/db";

test("admin creates a configured league and an existing member cannot join twice", async ({
  page,
}) => {
  const createdName = "E2E Browser Created League";
  await login(page, E2E_USERS.admin);

  await page.goto("/league/create");
  await expect(
    page.getByRole("heading", { name: "Create a League" }),
  ).toBeVisible();
  await page.getByLabel("League Name").fill(createdName);
  await page.getByRole("button", { name: "Create League" }).click();
  await expect(page).toHaveURL(/\/league\/\d+$/);
  await expect(page.getByRole("heading", { name: createdName })).toBeVisible();

  const createdLeague = queryScalar(`
    SELECT CONCAT(
      l."late_policy", '|',
      l."pick_policy", '|',
      l."reminder_policy", '|',
      l."scoring_type", '|',
      l."superbowl_competition"::text, '|',
      m."role"
    )
    FROM "leagues" l
    JOIN "leaguemembers" m ON m."league_id" = l."league_id"
    JOIN "people" p ON p."uid" = m."user_id"
    WHERE l."name" = '${createdName}'
      AND p."email" = '${E2E_USERS.admin.email}'
  `);
  expect(createdLeague).toBe(
    "allow_late_and_lock_after_start|choose_winner|three_hours_before|game_winner|true|admin",
  );

  await page.context().clearCookies();
  await login(page, E2E_USERS.player);
  await page.goto(`/join-league/${E2E_LEAGUES.active.shareCode}`);
  await expect(
    page.getByRole("heading", { name: "You're already in the league" }),
  ).toBeVisible();
  await expect(page.getByText(E2E_LEAGUES.active.name)).toBeVisible();
  await expect(page.getByRole("button", { name: "League Home" })).toBeVisible();
});
