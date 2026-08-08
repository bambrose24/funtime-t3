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
  await page.getByRole("button", { name: "Chat" }).click();
  await expect(
    page.getByText("League Message Board", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Fixture player message")).toBeVisible();

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
