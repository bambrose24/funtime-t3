import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId } from "../helpers/db";

test("protected registration redirects anonymous users and sign-out clears the session", async ({
  page,
}) => {
  await page.goto(`/join-league/${E2E_LEAGUES.active.shareCode}`);
  await expect(page).toHaveURL(
    new RegExp(
      `/login\\?upsell=registration&redirectTo=/join-league/${E2E_LEAGUES.active.shareCode}$`,
    ),
  );

  await login(page, E2E_USERS.player);
  const leagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  await page.goto(`/league/${leagueId}/pick`);
  await page.getByRole("button", { name: "Log out" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await page.goto(`/join-league/${E2E_LEAGUES.active.shareCode}`);
  await expect(page).toHaveURL(/\/login\?upsell=registration/);
});
