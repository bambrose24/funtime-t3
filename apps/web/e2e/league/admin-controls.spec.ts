import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("league admin renames a league, updates a member, and player is denied admin access", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const leagueId = getLeagueId(E2E_LEAGUES.competition.shareCode);
  const renamedLeague = "E2E Competition Renamed";
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${leagueId}/admin`);
  await page.getByLabel("League Name").fill(renamedLeague);
  await page
    .getByLabel("League Name")
    .locator("xpath=ancestor::form")
    .getByRole("button", { name: "Save" })
    .click();
  await expect(
    page.getByRole("heading", { name: `${renamedLeague} — Admin` }),
  ).toBeVisible();
  expect(
    queryScalar(`SELECT "name" FROM "leagues" WHERE "league_id" = ${leagueId}`),
  ).toBe(renamedLeague);

  await page.goto(`/league/${leagueId}/admin/members`);
  const playerRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.player.email });
  const donatedSwitch = playerRow.getByRole("switch", {
    name: "Donated status for webplayer",
  });
  await expect(donatedSwitch).not.toBeChecked();
  await donatedSwitch.check();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT m."paid"::text
        FROM "leaguemembers" m
        JOIN "people" p ON p."uid" = m."user_id"
        WHERE m."league_id" = ${leagueId}
          AND p."email" = '${E2E_USERS.player.email}'
      `),
    )
    .toBe("true");

  await playerRow
    .getByRole("button", { name: "Actions for webplayer" })
    .click();
  await page.getByRole("menuitem", { name: "Edit Player" }).click();
  await page.getByRole("combobox", { name: "Role for webplayer" }).click();
  await page.getByRole("option", { name: "Admin" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT m."role"::text
        FROM "leaguemembers" m
        JOIN "people" p ON p."uid" = m."user_id"
        WHERE m."league_id" = ${leagueId}
          AND p."email" = '${E2E_USERS.player.email}'
      `),
    )
    .toBe("admin");

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();
  await expect(playerRow).toContainText("Admin");
  await playerRow
    .getByRole("button", { name: "Actions for webplayer" })
    .click();
  await page.getByRole("menuitem", { name: "Edit Player" }).click();
  await page.getByRole("combobox", { name: "Role for webplayer" }).click();
  await page.getByRole("option", { name: "Player" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT m."role"::text
        FROM "leaguemembers" m
        JOIN "people" p ON p."uid" = m."user_id"
        WHERE m."league_id" = ${leagueId}
          AND p."email" = '${E2E_USERS.player.email}'
      `),
    )
    .toBe("player");

  await page.context().clearCookies();
  await login(page, E2E_USERS.player);
  const deniedResponse = await page
    .context()
    .request.get(`/league/${leagueId}/admin`);
  expect(deniedResponse.status()).toBe(404);
});
