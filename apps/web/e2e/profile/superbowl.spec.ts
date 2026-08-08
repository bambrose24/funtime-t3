import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("player can view their profile and update a Super Bowl prediction", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${leagueId}/my-profile`);
  await expect(page.getByRole("heading", { name: "webplayer" })).toBeVisible();
  await expect(page.getByText("BUF over PHI (score 48)")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Edit your Super Bowl pick" }),
  ).toBeVisible();

  await dialog.getByRole("combobox", { name: "AFC Team" }).click();
  await page.getByRole("option", { name: "Kansas City Chiefs" }).click();
  await dialog.getByRole("combobox", { name: "Winner" }).click();
  await page.getByRole("option", { name: "Kansas City Chiefs" }).click();
  await dialog.getByLabel("Total Score").fill("53");
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("KC over PHI (score 53)")).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT CONCAT(s."winner", '|', s."loser", '|', s."score")
        FROM "superbowl" s
        JOIN "leaguemembers" m ON m."membership_id" = s."member_id"
        JOIN "people" p ON p."uid" = m."user_id"
        WHERE m."league_id" = ${leagueId}
          AND p."email" = '${E2E_USERS.player.email}'
      `),
    )
    .toBe("2|5|53");
});
