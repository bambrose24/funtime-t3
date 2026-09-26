import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { executeSql, getLeagueId, queryScalar } from "../helpers/db";

test("league admin cannot edit a pick after kickoff", async ({
  browserErrorGuard,
  page,
}) => {
  test.setTimeout(60_000);
  browserErrorGuard.allow(
    /Failed to load resource: the server responded with a status of 400/,
  );
  browserErrorGuard.allow(
    /league\.admin\.setPick[\s\S]*League admins cannot edit picks after kickoff/,
  );
  const overrideLeagueId = getLeagueId(E2E_LEAGUES.override.shareCode);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${overrideLeagueId}/admin/members`);
  const overridePlayerRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.player.email });
  await overridePlayerRow.getByRole("button", { name: "Edit Picks" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Pick for BUF at KC, game 2028001" })
    .click();
  await page.getByRole("option", { name: "KC", exact: true }).click();
  await expect(
    page.getByText(/League admins cannot edit picks after kickoff/),
  ).toBeVisible();
  expect(
    queryScalar(`
      SELECT COUNT(*)
      FROM "picks" p
      JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
      JOIN "people" person ON person."uid" = m."user_id"
      WHERE m."league_id" = ${overrideLeagueId}
        AND p."gid" = 2028001
        AND person."email" = '${E2E_USERS.player.email}'
    `),
  ).toBe("0");
  await dialog.getByRole("button", { name: "Close" }).click();
});

test("super admin can override a pick after kickoff", async ({ page }) => {
  test.setTimeout(60_000);
  const overrideLeagueId = getLeagueId(E2E_LEAGUES.override.shareCode);
  await login(page, E2E_USERS.superAdmin);
  await page.goto(`/league/${overrideLeagueId}/admin/members`);
  const superAdminPlayerRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.player.email });
  await superAdminPlayerRow.getByRole("button", { name: "Edit Picks" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Pick for BUF at KC, game 2028001" })
    .click();
  await page.getByRole("option", { name: "KC", exact: true }).click();
  await expect(page.getByText("Pick updated successfully")).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT p."winner"
        FROM "picks" p
        JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE m."league_id" = ${overrideLeagueId}
          AND p."gid" = 2028001
          AND person."email" = '${E2E_USERS.player.email}'
      `),
    )
    .toBe("2");
  await dialog.getByRole("button", { name: "Close" }).click();
});

test("league admin handles member picks, email history, throttling, and removal", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const adminOpsLeagueId = getLeagueId(E2E_LEAGUES.adminOps.shareCode);
  // This workflow changes a pick and removes the member. Recreate only its
  // local fixture on every attempt so retries exercise the same transitions.
  executeSql(`
    BEGIN;
    DELETE FROM "leaguemembers"
    WHERE "league_id" = ${adminOpsLeagueId}
      AND "user_id" = (SELECT "uid" FROM "people" WHERE "email" = '${E2E_USERS.outsider.email}');
    INSERT INTO "leaguemembers" ("league_id", "user_id", "role", "paid")
    SELECT ${adminOpsLeagueId}, "uid", 'player', FALSE
    FROM "people" WHERE "email" = '${E2E_USERS.outsider.email}';
    INSERT INTO "EmailLogs" (
      "email_log_id", "league_id", "member_id", "email_type", "ts", "resend_id",
      "delivery_status", "delivered_at", "failed_at", "failure_reason"
    )
    SELECT fixture.id, m."league_id", m."membership_id", 'league_broadcast',
      NOW() - fixture.age, fixture.resend_id, fixture.status::"EmailDeliveryStatus",
      CASE WHEN fixture.status = 'delivered' THEN NOW() - fixture.age END,
      CASE WHEN fixture.status = 'bounced' THEN NOW() - fixture.age END,
      CASE WHEN fixture.status = 'bounced' THEN 'Mailbox does not exist' END
    FROM "leaguemembers" m
    JOIN "people" p ON p."uid" = m."user_id"
    CROSS JOIN (VALUES
      ('e2e-admin-ops-email-1', 'e2e-resend-1', 'delivered', INTERVAL '1 day'),
      ('e2e-admin-ops-email-2', 'e2e-resend-2', 'bounced', INTERVAL '2 days')
    ) AS fixture(id, resend_id, status, age)
    WHERE m."league_id" = ${adminOpsLeagueId} AND p."email" = '${E2E_USERS.outsider.email}';
    DELETE FROM "EmailDeliveryEvents" WHERE "resend_id" IN ('e2e-resend-1', 'e2e-resend-2');
    INSERT INTO "EmailDeliveryEvents" ("id", "svix_id", "resend_id", "event_type", "occurred_at", "payload")
    VALUES
      ('e2e-open-1', 'e2e-open-1', 'e2e-resend-1', 'email.opened', NOW() - INTERVAL '2 hours', '{}'),
      ('e2e-open-2', 'e2e-open-2', 'e2e-resend-1', 'email.opened', NOW() - INTERVAL '1 hour', '{}'),
      ('e2e-click-1', 'e2e-click-1', 'e2e-resend-1', 'email.clicked', NOW() - INTERVAL '30 minutes', '{}');
    COMMIT;
  `);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${adminOpsLeagueId}/admin/members`);
  const outsiderRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.outsider.email });
  await outsiderRow.getByRole("button", { name: "Edit Picks" }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Pick for BUF at KC, game 2027001" })
    .click();
  await page.getByRole("option", { name: "KC", exact: true }).click();
  await expect(page.getByText("Pick updated successfully")).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(`
        SELECT p."winner"
        FROM "picks" p
        JOIN "leaguemembers" m ON m."membership_id" = p."member_id"
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE m."league_id" = ${adminOpsLeagueId}
          AND p."gid" = 2027001
          AND person."email" = '${E2E_USERS.outsider.email}'
      `),
    )
    .toBe("2");
  await dialog.getByRole("button", { name: "Close" }).click();

  await outsiderRow.getByRole("button", { name: "View Emails" }).click();
  dialog = page.getByRole("dialog");
  const emails = dialog.getByRole("listitem");
  await expect(emails).toHaveCount(2);
  await expect(dialog.getByText("League message", { exact: true })).toHaveCount(
    2,
  );
  const deliveredEmail = emails.filter({ hasText: "Delivered" });
  await expect(
    deliveredEmail.getByText("Opened · 2", { exact: true }),
  ).toBeVisible();
  await expect(
    deliveredEmail.getByText("Clicked · 1", { exact: true }),
  ).toBeVisible();
  const bouncedEmail = emails.filter({ hasText: "Bounced" });
  await expect(bouncedEmail.getByText("Mailbox does not exist")).toBeVisible();
  await expect(
    bouncedEmail.getByText("No open recorded", { exact: true }),
  ).toBeVisible();
  await expect(
    bouncedEmail.getByText("No click recorded", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Details", exact: true }),
  ).toHaveCount(2);

  await deliveredEmail
    .getByRole("button", { name: "Details", exact: true })
    .click();
  // Real provider calls are disabled in E2E; details must retain stored activity.
  await expect(
    deliveredEmail.getByText(/Resend is unavailable for this email/),
  ).toBeVisible();
  await expect(
    deliveredEmail.getByText("Last open recorded", { exact: true }),
  ).toBeVisible();
  await expect(
    deliveredEmail.getByText("Last click recorded", { exact: true }),
  ).toBeVisible();
  const refresh = deliveredEmail.getByRole("button", {
    name: "Refresh from Resend",
  });
  await refresh.click();
  await expect(refresh).toBeEnabled();
  await expect(
    deliveredEmail.getByText("Opened · 2", { exact: true }),
  ).toBeVisible();
  await deliveredEmail
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Refresh email activity" }).click();
  await expect(
    dialog.getByRole("button", { name: "Refresh email activity" }),
  ).toBeEnabled();
  await expect(emails).toHaveCount(2);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();

  await page.goto(`/league/${adminOpsLeagueId}/admin`);
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();

  await page.goto(`/league/${adminOpsLeagueId}/admin/members`);
  const removableRow = page
    .getByRole("row")
    .filter({ hasText: E2E_USERS.outsider.email });
  await removableRow
    .getByRole("button", { name: "Actions for weboutsider" })
    .click();
  await page.getByRole("menuitem", { name: "Edit Player" }).click();
  await page
    .getByRole("button", {
      name: `Remove weboutsider from ${E2E_LEAGUES.adminOps.name}`,
    })
    .click();
  await page
    .getByRole("button", {
      name: `Yes, remove weboutsider from ${E2E_LEAGUES.adminOps.name}`,
    })
    .click();
  await expect(removableRow).toHaveCount(0);
  await expect
    .poll(() =>
      queryScalar(`
        SELECT COUNT(*)
        FROM "leaguemembers" m
        JOIN "people" person ON person."uid" = m."user_id"
        WHERE m."league_id" = ${adminOpsLeagueId}
          AND person."email" = '${E2E_USERS.outsider.email}'
      `),
    )
    .toBe("0");
});
