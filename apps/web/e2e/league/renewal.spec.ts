import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

test("admin creates one linked renewal and exercises isolated member invites", async ({
  page,
}) => {
  const priorLeagueId = getLeagueId(E2E_LEAGUES.completed.shareCode);
  // A timed-out navigation can happen after the create mutation commits.
  // Restore this journey's isolated starting state before every retry.
  executeSql(`
    DELETE FROM "leagues"
    WHERE "prior_league_id" = ${priorLeagueId}
  `);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${priorLeagueId}/admin`);
  await page
    .getByRole("link", { name: /Run It Back|Set Up Next Season/ })
    .click();
  await expect(
    page.getByRole("heading", {
      name: /Run it back for 2027|Set Up the 2027 Season/,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("League Name")).toHaveValue(
    "E2E Completed League 2027",
  );
  await page.getByRole("button", { name: "Create and Invite Players" }).click();

  await expect(page).toHaveURL(
    /\/league\/\d+\/renewal-invites\?priorLeagueId=\d+$/,
  );
  await expect(
    page.getByRole("heading", { name: "Invite last year's players" }),
  ).toBeVisible();
  await expect(page.getByText("1 eligible players")).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Invite webplayer" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Send Invites" }).click();
  await expect(page.getByText("Sent 0, skipped 1.")).toBeVisible();

  const renewalState = queryScalar(`
    SELECT CONCAT(
      next."season", '|',
      next."prior_league_id", '|',
      COUNT(m."membership_id")
    )
    FROM "leagues" next
    JOIN "leaguemembers" m ON m."league_id" = next."league_id"
    WHERE next."prior_league_id" = ${priorLeagueId}
    GROUP BY next."season", next."prior_league_id"
  `);
  expect(renewalState).toBe(`2027|${priorLeagueId}|1`);

  await page.goto(`/league/${priorLeagueId}/admin`);
  await expect(
    page.getByRole("link", { name: "Manage Invites" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Run It Back|Set Up Next Season/ }),
  ).toHaveCount(0);
});
