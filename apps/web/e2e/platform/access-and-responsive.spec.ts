import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("role boundaries and the core league state hold on a mobile viewport", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const activeLeagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  const resultsLeagueId = getLeagueId(E2E_LEAGUES.results.shareCode);
  const waitingLeagueId = getLeagueId(E2E_LEAGUES.waiting.shareCode);

  await login(page, E2E_USERS.superAdmin);
  await page.goto("/admin");
  await expect(page.getByText("All-time Total Picks")).toBeVisible();
  await expect(page.getByText("Picks by Season")).toBeVisible();

  const nonMemberLeagueResponse = await page
    .context()
    .request.get(`/league/${activeLeagueId}`);
  expect(nonMemberLeagueResponse.status()).toBe(404);

  await page.context().clearCookies();
  await login(page, E2E_USERS.outsider);
  const ordinaryAdminResponse = await page.context().request.get("/admin");
  expect(ordinaryAdminResponse.status()).toBe(404);

  const resultsMemberId = Number(
    queryScalar(`
      SELECT m."membership_id"
      FROM "leaguemembers" m
      JOIN "people" p ON p."uid" = m."user_id"
      WHERE m."league_id" = ${resultsLeagueId}
        AND p."email" = '${E2E_USERS.player.email}'
    `),
  );
  const profileInput = encodeURIComponent(
    JSON.stringify({
      json: { leagueId: resultsLeagueId, memberId: resultsMemberId },
    }),
  );
  const nonMemberProfileResponse = await page
    .context()
    .request.get(`/api/trpc/playerProfile.get?input=${profileInput}`);
  expect(nonMemberProfileResponse.status()).toBe(401);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/league/${waitingLeagueId}`);
  await expect(
    page.getByRole("heading", { name: E2E_LEAGUES.waiting.name }),
  ).toBeVisible();
  await expect(page.getByText("The season has not started yet")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Make Week 1 Picks" }),
  ).toBeVisible();
});
