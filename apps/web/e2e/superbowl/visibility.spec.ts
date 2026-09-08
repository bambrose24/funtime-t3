import { E2E_LEAGUES, E2E_USERS } from "../fixtures/constants";
import { expect, test } from "../fixtures/test";
import { login } from "../helpers/auth";
import { getLeagueId, queryScalar } from "../helpers/db";

test("Super Bowl opponents stay hidden before start and appear in progress", async ({
  page,
}) => {
  const activeLeagueId = getLeagueId(E2E_LEAGUES.active.shareCode);
  const visibleLeagueId = getLeagueId(E2E_LEAGUES.visiblePredictions.shareCode);
  await login(page, E2E_USERS.player);

  await page.goto(`/league/${activeLeagueId}/superbowl`);
  const ownPreseasonRow = page
    .getByRole("row")
    .filter({ hasText: "webplayer" });
  await expect(ownPreseasonRow.getByRole("cell")).toHaveCount(4);
  await expect(ownPreseasonRow.getByText("--")).toHaveCount(0);
  const hiddenAdminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(hiddenAdminRow.getByText("--")).toHaveCount(3);

  const opponentMemberId = Number(
    queryScalar(`
    SELECT m."membership_id" FROM "leaguemembers" m
    JOIN "people" p ON p."uid" = m."user_id"
    WHERE m."league_id" = ${activeLeagueId}
      AND p."email" = '${E2E_USERS.admin.email}'
  `),
  );
  const profileInput = { leagueId: activeLeagueId, memberId: opponentMemberId };
  const apiResponse = await page.request.get(
    `/api/trpc/playerProfile.get?input=${encodeURIComponent(JSON.stringify({ json: profileInput }))}`,
  );
  expect(apiResponse.ok()).toBe(true);
  const profile = (await apiResponse.json()).result.data.json;
  expect(profile.superbowlPickHidden).toBe(true);
  expect(profile.member.superbowl).toEqual([]);
  expect(Object.keys(profile.member.people).sort()).toEqual([
    "email",
    "username",
  ]);

  // A direct navigation serializes this profile into the server-rendered page.
  // Check that boundary as well as the client-visible section.
  const document = await page.goto(
    `/league/${activeLeagueId}/player/${opponentMemberId}`,
  );
  expect(document).not.toBeNull();
  const html = (await document!.text()).replaceAll('\\"', '"');
  expect(html).toContain('"superbowlPickHidden":true');
  expect(html).toContain('"superbowl":[]');
  await expect(
    page.getByRole("heading", { name: "webadmin", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/over .*score/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(/over .*score/)).toHaveCount(0);

  await page.goto(`/league/${visibleLeagueId}/superbowl`);
  const visibleAdminRow = page.getByRole("row").filter({ hasText: "webadmin" });
  await expect(visibleAdminRow).toContainText("KC");
  await expect(visibleAdminRow).toContainText("DAL");
  await expect(visibleAdminRow).toContainText("51");
});
