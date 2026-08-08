import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

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
