import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

test("player can join by share code with a required Super Bowl pick", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  await login(page, E2E_USERS.outsider);

  await page.goto(`/join-league/${E2E_LEAGUES.active.shareCode}`);
  await expect(
    page.getByRole("heading", { name: `Join ${E2E_LEAGUES.active.name}` }),
  ).toBeVisible();

  const submit = page.getByRole("button", {
    name: "Finish Super Bowl pick",
  });
  await expect(submit).toBeDisabled();

  await page.getByRole("combobox", { name: "AFC Team" }).click();
  await page.getByRole("option", { name: "Buffalo Bills" }).click();
  await page.getByRole("combobox", { name: "NFC Team" }).click();
  await page.getByRole("option", { name: "Philadelphia Eagles" }).click();
  await page.getByRole("radio", { name: "Pick Buffalo Bills to win" }).click();
  await page.getByLabel("Total Score").fill("48");

  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(new RegExp(`/league/${leagueId}$`));

  await expect
    .poll(() =>
      queryScalar(`
        SELECT CONCAT(s."winner", '|', s."loser", '|', s."score")
        FROM "superbowl" s
        JOIN "leaguemembers" m ON m."membership_id" = s."member_id"
        JOIN "people" p ON p."uid" = m."user_id"
        WHERE m."league_id" = ${leagueId}
          AND p."email" = '${E2E_USERS.outsider.email}'
      `),
    )
    .toBe("1|5|48");
});

test("a player cannot register after the season has started", async ({
  browserErrorGuard,
  page,
}, testInfo) => {
  browserErrorGuard.allow(
    /Failed to load resource: the server responded with a status of 400/,
  );
  browserErrorGuard.allow(
    /league\.register[\s\S]*Registration is closed because the season has started/,
  );
  const lateJoinCode = `E2ELATEJOIN${testInfo.retry}`;
  executeSql(`
    DELETE FROM "leagues" WHERE "share_code" = '${lateJoinCode}';
    INSERT INTO "leagues" (
      "created_by_user_id", "name", "season", "late_policy",
      "pick_policy", "reminder_policy", "scoring_type", "share_code",
      "superbowl_competition", "status"
    )
    SELECT "uid", 'E2E Late Registration League', 2028,
      'allow_late_and_lock_after_start', 'choose_winner',
      'three_hours_before', 'game_winner', '${lateJoinCode}', TRUE,
      'not_started'
    FROM "people"
    WHERE "email" = '${E2E_USERS.admin.email}';
  `);

  await login(page, E2E_USERS.outsider);
  await page.goto(`/join-league/${lateJoinCode}`);
  await expect(
    page.getByRole("heading", { name: "Join E2E Late Registration League" }),
  ).toBeVisible();

  await page.getByRole("combobox", { name: "AFC Team" }).click();
  await page.getByRole("option", { name: "Buffalo Bills" }).click();
  await page.getByRole("combobox", { name: "NFC Team" }).click();
  await page.getByRole("option", { name: "Philadelphia Eagles" }).click();
  await page.getByRole("radio", { name: "Pick Buffalo Bills to win" }).click();
  await page.getByLabel("Total Score").fill("48");
  await page.getByRole("button", { name: "Register" }).click();

  await expect(
    page.getByText("Registration is closed because the season has started"),
  ).toBeVisible();
  expect(
    queryScalar(`
      SELECT COUNT(*)
      FROM "leaguemembers" m
      JOIN "leagues" l ON l."league_id" = m."league_id"
      JOIN "people" p ON p."uid" = m."user_id"
      WHERE l."share_code" = '${lateJoinCode}'
        AND p."email" = '${E2E_USERS.outsider.email}'
    `),
  ).toBe("0");
});
