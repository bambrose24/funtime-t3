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
  await page.getByRole("link", { name: "Set Up Next Season" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Set Up the 2027 Season",
    }),
  ).toBeVisible();
  await expect(page.getByLabel("League Name")).toHaveValue(
    "E2E Completed League 2027",
  );
  await page.getByRole("button", { name: "Review Invites" }).click();
  await expect(
    page.getByRole("heading", { name: "Review next-season invites" }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Invite webplayer" }),
  ).toBeChecked();
  await page
    .getByRole("switch", {
      name: "Make webplayer an admin next season",
    })
    .click();
  await page
    .getByRole("button", { name: "Create league and send 1 invite" })
    .click();

  await expect(page).toHaveURL(
    /\/league\/\d+\/renewal-invites\?priorLeagueId=\d+$/,
  );
  await expect(
    page.getByRole("heading", { name: "Invite last year's players" }),
  ).toBeVisible();
  await expect(page.getByText("1 eligible players")).toBeVisible();

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

  const renewalAdminRole = queryScalar(`
    SELECT r."role"
    FROM "league_renewal_member_roles" r
    JOIN "leagues" next ON next."league_id" = r."league_id"
    JOIN "people" p ON p."uid" = r."user_id"
    WHERE next."prior_league_id" = ${priorLeagueId}
      AND p."email" = '${E2E_USERS.player.email}'
  `);
  expect(renewalAdminRole).toBe("admin");

  await page.goto(`/league/${priorLeagueId}/admin`);
  await expect(
    page.getByRole("link", { name: "Manage Invites" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Set Up Next Season" }),
  ).toHaveCount(0);

  const nextLeague = queryScalar(`
    SELECT CONCAT(next."league_id", '|', next."share_code")
    FROM "leagues" next
    WHERE next."prior_league_id" = ${priorLeagueId}
  `);
  const [nextLeagueId, nextLeagueShareCode] = nextLeague.split("|");
  expect(nextLeagueId).toMatch(/^\d+$/);
  expect(nextLeagueShareCode).toBeTruthy();

  await page.getByRole("button", { name: "User menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await login(page, E2E_USERS.player);

  await page.goto(`/join-league/${nextLeagueShareCode}`);
  await expect(
    page.getByRole("heading", { name: "Join E2E Completed League 2027" }),
  ).toBeVisible();

  await page.getByRole("combobox", { name: "AFC Team" }).click();
  await page.getByRole("option", { name: "Buffalo Bills" }).click();
  await page.getByRole("combobox", { name: "NFC Team" }).click();
  await page.getByRole("option", { name: "Philadelphia Eagles" }).click();
  await page.getByRole("radio", { name: "Pick Buffalo Bills to win" }).click();
  await page.getByLabel("Total Score").fill("48");
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page).toHaveURL(new RegExp(`/league/${nextLeagueId}$`));
  await expect
    .poll(() =>
      queryScalar(`
        SELECT m."role"
        FROM "leaguemembers" m
        JOIN "people" p ON p."uid" = m."user_id"
        WHERE m."league_id" = ${nextLeagueId}
          AND p."email" = '${E2E_USERS.player.email}'
      `),
    )
    .toBe("admin");
});
