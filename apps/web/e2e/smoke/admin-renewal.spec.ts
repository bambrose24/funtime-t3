import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId } from "../helpers/db";

test("completed-league admin page renders renewal controls", async ({
  page,
}) => {
  const leagueId = getLeagueId(E2E_LEAGUES.completedRegression.shareCode);
  await login(page, E2E_USERS.admin);

  await page.goto(`/league/${leagueId}/admin`);

  await expect(
    page.getByRole("heading", {
      name: `${E2E_LEAGUES.completedRegression.name} — Admin`,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "General Admin Settings" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Next Season" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Set Up Next Season" }),
  ).toBeVisible();
});
