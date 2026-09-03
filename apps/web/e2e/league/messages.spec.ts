import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("member posts and deletes their message and admin deletes another member's message", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.competition.shareCode);
  const ownMessage = "Admin E2E message";
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${leagueId}`);
  const chatLink = page.getByRole("link", { name: /Open league chat/ });
  await expect(chatLink).toBeVisible();
  await chatLink.click();
  await expect(
    page.getByRole("heading", { name: "League Chat" }),
  ).toBeVisible();
  await expect(page.getByText("Fixture player message")).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(
        `SELECT r."last_read_message_id"
         FROM "league_message_read_state" r
         JOIN "leaguemembers" m ON m."membership_id" = r."membership_id"
         JOIN "people" p ON p."uid" = m."user_id"
         WHERE m."league_id" = ${leagueId}
           AND p."email" = 'web.e2e.admin@example.com'`,
      ),
    )
    .toBe("e2e-fixture-message");

  await page.getByPlaceholder("Type your message here...").fill(ownMessage);
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByText(ownMessage)).toBeVisible();
  await expect
    .poll(() =>
      queryScalar(
        `SELECT COUNT(*) FROM "leaguemessages" WHERE "league_id" = ${leagueId}`,
      ),
    )
    .toBe("2");

  await page
    .getByRole("button", { name: "Delete message from webplayer" })
    .click();
  await expect(page.getByText("You are deleting a message from")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByText("Fixture player message")).toBeHidden();

  await page.getByRole("button", { name: "Delete message from you" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByText(ownMessage)).toBeHidden();
  await expect
    .poll(() =>
      queryScalar(
        `SELECT COUNT(*) FROM "leaguemessages" WHERE "league_id" = ${leagueId}`,
      ),
    )
    .toBe("0");
});

test("league chat remains available before and after the season", async ({
  page,
}) => {
  await login(page, E2E_USERS.admin);

  for (const shareCode of [
    E2E_LEAGUES.waiting.shareCode,
    E2E_LEAGUES.completed.shareCode,
  ]) {
    const leagueId = getLeagueId(shareCode);
    await page.goto(`/league/${leagueId}/chat`);
    await expect(
      page.getByRole("heading", { name: "League Chat" }),
    ).toBeVisible();
  }
});
