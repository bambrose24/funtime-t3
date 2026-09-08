import { afterAll, beforeAll, expect, setSystemTime, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";
import type { LeagueStatus } from "../../src/generated/prisma-client";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error("Privacy tests require the isolated local DB and E2E_MODE=1");
}
const { db } = await import("../../server/db");
const { playerProfileRouter } =
  await import("../../server/api/routers/playerProfileRouter");
const { leagueRouter } = await import("../../server/api/routers/league");
const { leagueAdminRouter } =
  await import("../../server/api/routers/league/admin");
const { memberRouter } = await import("../../server/api/routers/member");
let firstGame: Awaited<ReturnType<typeof db.games.findFirstOrThrow>>;
beforeAll(async () => {
  firstGame = await db.games.findFirstOrThrow({ orderBy: { ts: "asc" } });
});
afterAll(async () => {
  setSystemTime();
  await db.$disconnect();
});
const rollback = new Error("Rollback privacy fixtures");
type Options = {
  offset: number;
  status?: LeagueStatus;
  actor?: "player" | "admin" | "superAdmin" | "outsider" | "anonymous";
  noSchedule?: boolean;
  wrongLeague?: boolean;
};
async function scenario({
  offset,
  status = "not_started",
  actor = "player",
  noSchedule,
  wrongLeague,
}: Options) {
  try {
    await db.$transaction(
      async (tx) => {
        // PostgreSQL seed timestamps may contain microseconds that JS Date
        // cannot represent. Set an exact millisecond boundary inside this rollback.
        await tx.games.update({
          where: { gid: firstGame.gid },
          data: { ts: firstGame.ts },
        });
        const suffix = crypto.randomUUID();
        const season = noSchedule ? 987654 : firstGame.season;
        if (noSchedule)
          expect(await tx.games.count({ where: { season } })).toBe(0);
        const viewer = await tx.people.create({
          data: {
            username: `viewer-${suffix}`,
            fname: "Viewer",
            lname: "Test",
            email: `web.e2e.privacy.viewer.${suffix}@example.com`,
            season,
          },
        });
        const opponent = await tx.people.create({
          data: {
            username: `opponent-${suffix}`,
            fname: "Private first name",
            lname: "Test",
            email: `web.e2e.privacy.opponent.${suffix}@example.com`,
            season,
          },
        });
        const league = await tx.leagues.create({
          data: {
            name: "E2E privacy",
            season,
            status,
            superbowl_competition: true,
            created_by_user_id: viewer.uid,
            leaguemembers: {
              create: [
                {
                  user_id: viewer.uid,
                  role: actor === "admin" ? "admin" : "player",
                },
                { user_id: opponent.uid, role: "player" },
              ],
            },
          },
          include: { leaguemembers: true },
        });
        const ownId = league.leaguemembers.find(
          (m) => m.user_id === viewer.uid,
        )!.membership_id;
        const opponentId = league.leaguemembers.find(
          (m) => m.user_id === opponent.uid,
        )!.membership_id;
        for (const member of league.leaguemembers)
          await tx.superbowl.create({
            data: {
              member_id: member.membership_id,
              uid: member.user_id,
              season,
              winner: firstGame.home,
              loser: firstGame.away,
              score: 57,
            },
          });
        await tx.leaguemessages.create({
          data: {
            member_id: opponentId,
            league_id: league.league_id,
            content: "Private message body must not be serialized with profile",
            message_type: "LEAGUE_MESSAGE",
          },
        });
        const dbUser = await tx.people.findUniqueOrThrow({
          where: { uid: viewer.uid },
          include: {
            leaguemembers: {
              select: {
                league_id: true,
                membership_id: true,
                role: true,
                leagues: { select: { season: true, name: true } },
              },
            },
          },
        });
        if (actor === "superAdmin") dbUser.email = "BAMBROSE24@GMAIL.COM";
        if (actor === "outsider") dbUser.leaguemembers = [];
        const ctx: TRPCContext = {
          db: tx as unknown as TRPCContext["db"],
          dbUser: actor === "anonymous" ? null : dbUser,
          supabaseUser: null,
          headers: new Headers(),
        };
        setSystemTime(new Date(firstGame.ts.getTime() + offset));
        const profile = playerProfileRouter.createCaller(ctx);
        const publicBoard = leagueRouter.createCaller(ctx);
        if (actor === "outsider" || actor === "anonymous") {
          await expect(
            profile.get({ leagueId: league.league_id, memberId: opponentId }),
          ).rejects.toThrow();
          await expect(
            publicBoard.superbowlPicks({ leagueId: league.league_id }),
          ).rejects.toThrow();
        } else if (wrongLeague) {
          const otherLeague = await tx.leagues.create({
            data: {
              name: "E2E other privacy",
              season,
              created_by_user_id: opponent.uid,
              leaguemembers: { create: { user_id: opponent.uid } },
            },
            include: { leaguemembers: true },
          });
          await expect(
            profile.get({
              leagueId: league.league_id,
              memberId: otherLeague.leaguemembers[0]!.membership_id,
            }),
          ).rejects.toThrow();
        } else {
          const revealed = !noSchedule && offset >= 0;
          const own = await profile.get({
            leagueId: league.league_id,
            memberId: ownId,
          });
          expect(own.member.superbowl).toEqual([
            { winner: firstGame.home, loser: firstGame.away, score: 57 },
          ]);
          expect(own.superbowlPickHidden).toBe(false);
          const other = await profile.get({
            leagueId: league.league_id,
            memberId: opponentId,
          });
          expect(other.superbowlPickHidden).toBe(!revealed);
          expect(other.member.superbowl).toEqual(
            revealed ? own.member.superbowl : [],
          );
          const serialized = JSON.parse(JSON.stringify(other));
          expect(serialized.member.people).toEqual({
            username: opponent.username,
            email: opponent.email,
          });
          expect(serialized.member.leaguemessages).toHaveLength(1);
          expect(serialized.member.leaguemessages[0]).not.toHaveProperty(
            "content",
          );
          expect(serialized.member).not.toHaveProperty("paid");
          const board = await publicBoard.superbowlPicks({
            leagueId: league.league_id,
          });
          expect(
            board.superbowlPicks.find((p) => p.member_id === ownId),
          ).toMatchObject({
            winner: firstGame.home,
            loser: firstGame.away,
            score: 57,
          });
          expect(
            board.superbowlPicks.find((p) => p.member_id === opponentId),
          ).toMatchObject(
            revealed
              ? { winner: firstGame.home, loser: firstGame.away, score: 57 }
              : { winner: null, loser: null, score: null },
          );
          expect(
            await publicBoard.hasStarted({ leagueId: league.league_id }),
          ).toBe(revealed);
          const commissioner = leagueAdminRouter
            .createCaller(ctx)
            .superbowlPicks({ leagueId: league.league_id });
          if (actor === "admin" || actor === "superAdmin") {
            expect(
              (await commissioner).members.find(
                (m) => m.membership_id === opponentId,
              )?.pick,
            ).toMatchObject({
              winner: firstGame.home,
              loser: firstGame.away,
              score: 57,
            });
          } else await expect(commissioner).rejects.toThrow();
          const edit = memberRouter
            .createCaller(ctx)
            .updateOrCreateSuperbowlPick({
              memberId: ownId,
              winnerTeamId: firstGame.away,
              loserTeamId: firstGame.home,
              score: 58,
            });
          if (revealed)
            await expect(edit).rejects.toThrow("Superbowl picks are locked");
          else await edit;
        }
        throw rollback;
      },
      { timeout: 15_000 },
    );
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    setSystemTime();
  }
}
for (const actor of ["player", "admin", "superAdmin"] as const) {
  for (const offset of [-1, 0, 1])
    test(`${actor}: profile and board kickoff ${offset}ms`, () =>
      scenario({ actor, offset }));
}
for (const status of ["in_progress", "completed"] as const)
  test(`future kickoff stays hidden despite ${status} status`, () =>
    scenario({ offset: -1, status }));
test("no schedule fails closed even with completed status", () =>
  scenario({ offset: 1, status: "completed", noSchedule: true }));
for (const actor of ["outsider", "anonymous"] as const)
  test(`${actor} cannot retrieve predictions`, () =>
    scenario({ offset: 1, actor }));
test("profile target must belong to requested league", () =>
  scenario({ offset: 1, wrongLeague: true }));
