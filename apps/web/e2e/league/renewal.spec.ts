import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

test.afterEach(() => {
  const priorLeagueId = getLeagueId(E2E_LEAGUES.completed.shareCode);
  executeSql(`
    DELETE FROM "leagues"
    WHERE "prior_league_id" = ${priorLeagueId}
  `);
});

test("admin creates one linked renewal and exercises isolated member invites", async ({
  page,
  browser,
}, testInfo) => {
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
      name: "Set Up the 2026 Season",
    }),
  ).toBeVisible();
  await expect(page.getByLabel("League Name")).toHaveValue(
    "E2E Completed League 2026",
  );
  await page.getByRole("button", { name: "Review Invites" }).click();
  await expect(
    page.getByRole("heading", { name: "Review next-season invites" }),
  ).toBeVisible();
  if (testInfo.project.name === "mobile-web-chromium") {
    const dialogBox = await page.getByRole("dialog").boundingBox();
    expect(dialogBox).not.toBeNull();
    expect(dialogBox?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((dialogBox?.x ?? 0) + (dialogBox?.width ?? 0)).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? 0,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await expect(
    page.getByRole("checkbox", { name: "Invite webplayer" }),
  ).toBeChecked();
  await expect(page.getByText("Last season")).toBeVisible();
  await expect(
    page.getByText(/Missed \d+ picks?|Picked every game/),
  ).toBeVisible();
  await page
    .getByRole("switch", {
      name: "Make webplayer an admin next season",
    })
    .click();
  await page
    .getByRole("button", { name: "Create league and send 1 invite" })
    .click();

  await expect(page).toHaveURL(/\/league\/\d+\/renewal-invites$/);
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
  expect(renewalState).toBe(`2026|${priorLeagueId}|1`);

  const renewalAdminRole = queryScalar(`
    SELECT r."role"
    FROM "league_renewal_member_roles" r
    JOIN "leagues" next ON next."league_id" = r."league_id"
    JOIN "people" p ON p."uid" = r."user_id"
    WHERE next."prior_league_id" = ${priorLeagueId}
      AND p."email" = '${E2E_USERS.player.email}'
  `);
  expect(renewalAdminRole).toBe("admin");

  const renewalLeagueId = Number(
    queryScalar(`
      SELECT "league_id"
      FROM "leagues"
      WHERE "prior_league_id" = ${priorLeagueId}
    `),
  );
  const renewalShareCode = queryScalar(`
    SELECT "share_code"
    FROM "leagues"
    WHERE "league_id" = ${renewalLeagueId}
  `);

  // An invite link is safe to open in a separate browser session. The
  // receiving player signs in, sees their account username, and joins.
  const playerPage = await browser.newPage();
  await login(playerPage, E2E_USERS.player);
  await playerPage.goto(`/join-league/${renewalShareCode}`);
  await expect(
    playerPage.getByRole("heading", { name: /Join / }),
  ).toBeVisible();
  await expect(
    playerPage.getByText("webplayer", { exact: true }),
  ).toBeVisible();

  await playerPage.getByRole("combobox", { name: "AFC Team" }).click();
  await playerPage.getByRole("option", { name: "Buffalo Bills" }).click();
  await playerPage.getByRole("combobox", { name: "NFC Team" }).click();
  await playerPage.getByRole("option", { name: "Philadelphia Eagles" }).click();
  await playerPage
    .getByRole("radio", { name: "Pick Buffalo Bills to win" })
    .click();
  await playerPage.getByLabel("Total Score").fill("42");
  await playerPage.getByRole("button", { name: "Register" }).click();
  await expect(playerPage).toHaveURL(new RegExp(`/league/${renewalLeagueId}$`));

  const joinedUsername = queryScalar(`
    SELECT p."username"
    FROM "leaguemembers" m
    JOIN "people" p ON p."uid" = m."user_id"
    WHERE m."league_id" = ${renewalLeagueId}
      AND p."email" = '${E2E_USERS.player.email}'
  `);
  expect(joinedUsername).toBe("webplayer");
  const joinedMemberRole = queryScalar(`
    SELECT m."role"
    FROM "leaguemembers" m
    JOIN "people" p ON p."uid" = m."user_id"
    WHERE m."league_id" = ${renewalLeagueId}
      AND p."email" = '${E2E_USERS.player.email}'
  `);
  expect(joinedMemberRole).toBe("admin");
  await playerPage.close();

  await page.goto(`/league/${priorLeagueId}/admin`);
  await expect(
    page.getByRole("link", { name: "Manage Invites" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Set Up Next Season" }),
  ).toHaveCount(0);

  await page.goto(`/league/${renewalLeagueId}/admin`);
  await expect(
    page.getByRole("heading", { name: "Renewal Invites" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Manage Renewal Invites" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/league/${renewalLeagueId}/renewal-invites$`),
  );
  await expect(
    page.getByRole("heading", { name: "Invite last year's players" }),
  ).toBeVisible();
});

test("admin can create a renewal without sending invitations", async ({
  page,
}) => {
  const priorLeagueId = getLeagueId(E2E_LEAGUES.completed.shareCode);
  executeSql(`
    DELETE FROM "leagues"
    WHERE "prior_league_id" = ${priorLeagueId}
  `);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${priorLeagueId}/admin`);
  await page.getByRole("link", { name: "Set Up Next Season" }).click();
  await page.getByRole("button", { name: "Review Invites" }).click();

  await expect(
    page.getByRole("button", { name: "Create League and Send 1 Invite" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create League Without Sending" })
    .click();

  await expect(page).toHaveURL(/\/league\/\d+\/renewal-invites$/);

  const renewalState = queryScalar(`
    SELECT CONCAT(
      next."league_id", '|',
      next."season", '|',
      COUNT(m."membership_id"), '|',
      COUNT(e."email_log_id")
    )
    FROM "leagues" next
    JOIN "leaguemembers" m ON m."league_id" = next."league_id"
    LEFT JOIN "EmailLogs" e
      ON e."league_id" = next."league_id"
      AND e."email_type" = 'renewal_invite'
    WHERE next."prior_league_id" = ${priorLeagueId}
    GROUP BY next."league_id", next."season"
  `);
  const [nextLeagueId] = renewalState.split("|");
  expect(renewalState).toBe(`${nextLeagueId}|2026|1|0`);

  await expect(
    page.getByRole("button", { name: "Send Invites" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Back to Admin Settings" }),
  ).toHaveAttribute("href", `/league/${nextLeagueId}/admin`);
  await expect(page.getByRole("link", { name: "Open League" })).toHaveCount(0);
});
