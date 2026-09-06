import {
  afterAll,
  beforeAll,
  expect,
  setSystemTime,
  spyOn,
  test,
} from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";
import type { LatePolicy } from "../../src/generated/prisma-client";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Late-policy tests require the isolated local DB and E2E_MODE=1",
  );
}
const { db } = await import("../../server/db");
const { picksRouter } = await import("../../server/api/routers/picks");
const { leagueAdminRouter } =
  await import("../../server/api/routers/league/admin");
const { leagueRouter } = await import("../../server/api/routers/league");
const { resendApi } = await import("../../server/services/resend");
const confirmation = spyOn(resendApi, "sendWeekPicksEmail").mockResolvedValue(
  undefined,
);
let firstGame: Awaited<ReturnType<typeof db.games.findFirstOrThrow>>;
let laterGame: typeof firstGame;
beforeAll(async () => {
  firstGame = await db.games.findFirstOrThrow({ orderBy: { gid: "asc" } });
  laterGame = await db.games.findFirstOrThrow({
    where: {
      season: firstGame.season,
      week: firstGame.week,
      ts: { gt: firstGame.ts },
    },
    orderBy: { ts: "asc" },
  });
});
afterAll(async () => {
  setSystemTime();
  confirmation.mockRestore();
  await db.$disconnect();
});
const rollback = new Error("Rollback late-policy fixtures");

type Options = {
  policy: LatePolicy | null;
  offset: number;
  actor?: "player" | "admin" | "superAdmin";
  endpoint?: "submitPicks" | "setPick";
  mixed?: boolean;
  metadata?: boolean;
  rescheduled?: boolean;
};
async function scenario({
  policy,
  offset,
  actor = "player",
  endpoint = "submitPicks",
  mixed,
  metadata,
  rescheduled,
}: Options) {
  try {
    await db.$transaction(
      async (tx) => {
        const suffix = crypto.randomUUID();
        const person = await tx.people.create({
          data: {
            username: `policy-${suffix}`,
            email: `web.e2e.policy.${suffix}@example.com`,
            fname: "Policy",
            lname: "Test",
            season: firstGame.season,
          },
        });
        const league = await tx.leagues.create({
          data: {
            name: "E2E first kickoff",
            season: firstGame.season,
            created_by_user_id: person.uid,
            late_policy: policy,
            leaguemembers: {
              create: {
                user_id: person.uid,
                role: actor === "player" ? "player" : "admin",
              },
            },
          },
          include: { leaguemembers: true },
        });
        const memberId = league.leaguemembers[0]!.membership_id;
        const openLeague = mixed
          ? await tx.leagues.create({
              data: {
                name: "E2E open games",
                season: firstGame.season,
                created_by_user_id: person.uid,
                late_policy: "allow_late_and_lock_after_start",
                leaguemembers: {
                  create: { user_id: person.uid, role: "player" },
                },
              },
            })
          : null;
        if (rescheduled)
          await tx.games.update({
            where: { gid: firstGame.gid },
            data: {
              ts: new Date(laterGame.ts.getTime() + 86400000),
            },
          });
        const dbUser = await tx.people.findUniqueOrThrow({
          where: { uid: person.uid },
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
        if (actor === "superAdmin") dbUser.email = "bambrose24@gmail.com";
        const scopedDb = new Proxy(tx, {
          get(target, prop) {
            if (prop === "$transaction")
              return async (fn: (client: typeof tx) => unknown) => fn(tx);
            return Reflect.get(target, prop);
          },
        }) as unknown as TRPCContext["db"];
        const ctx: TRPCContext = {
          db: scopedDb,
          dbUser,
          supabaseUser: null,
          headers: new Headers(),
        };
        setSystemTime(new Date(firstGame.ts.getTime() + offset));
        const closed =
          policy === "close_at_first_game_start" && offset >= 0 && !rescheduled;
        if (metadata) {
          const result = await leagueRouter
            .createCaller(ctx)
            .weekToPick({ leagueId: league.league_id });
          expect(result.picksClosed).toBe(closed);
          expect(result.picksCloseAt?.getTime() ?? null).toBe(
            policy === "close_at_first_game_start"
              ? (rescheduled ? laterGame.ts : firstGame.ts).getTime()
              : null,
          );
        } else {
          const callsBefore = confirmation.mock.calls.length;
          // Request only the LATER game: the cutoff must come from the whole
          // schedule, not just game IDs in the submitted payload.
          const result =
            endpoint === "setPick"
              ? leagueAdminRouter
                  .createCaller(ctx)
                  .setPick({
                    leagueId: league.league_id,
                    memberId,
                    gameId: laterGame.gid,
                    winner: laterGame.away,
                  })
              : picksRouter.createCaller(ctx).submitPicks({
                  leagueIds: openLeague
                    ? [openLeague.league_id, league.league_id]
                    : [league.league_id],
                  overrideMemberId: actor === "player" ? undefined : memberId,
                  picks: [
                    {
                      gid: laterGame.gid,
                      winner: laterGame.away,
                      isRandom: false,
                    },
                  ],
                });
          if (closed && actor !== "superAdmin") {
            await expect(result).rejects.toThrow("first kickoff");
            expect(confirmation.mock.calls.length).toBe(callsBefore);
            expect(await tx.picks.count({ where: { uid: person.uid } })).toBe(
              0,
            );
          } else {
            await result;
            expect(await tx.picks.count({ where: { uid: person.uid } })).toBe(
              openLeague ? 2 : 1,
            );
          }
        }
        throw rollback;
      },
      { timeout: 15000 },
    );
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    setSystemTime();
  }
}

for (const offset of [-1, 0, 1]) {
  test(`first-kickoff policy: player submits later game at ${offset}ms`, () =>
    scenario({ policy: "close_at_first_game_start", offset }));
  for (const endpoint of ["submitPicks", "setPick"] as const) {
    for (const actor of ["admin", "superAdmin"] as const) {
      test(`first-kickoff policy: ${actor} ${endpoint} at ${offset}ms`, () =>
        scenario({
          policy: "close_at_first_game_start",
          offset,
          actor,
          endpoint,
        }));
    }
  }
}
for (const policy of [
  "allow_late_and_lock_after_start",
  "allow_late_whole_week",
  null,
] as const) {
  test(`preserve ${policy}: unstarted later game stays open`, () =>
    scenario({ policy, offset: 1 }));
}
test("mixed-policy submission rejects before writing the open league", () =>
  scenario({ policy: "close_at_first_game_start", offset: 1, mixed: true }));
test("cutoff follows the current schedule after rescheduling", () =>
  scenario({
    policy: "close_at_first_game_start",
    offset: 1,
    rescheduled: true,
  }));
for (const offset of [-1, 0, 1]) {
  test(`weekToPick reports first-kickoff deadline and closed state at ${offset}ms`, () =>
    scenario({ policy: "close_at_first_game_start", offset, metadata: true }));
}
