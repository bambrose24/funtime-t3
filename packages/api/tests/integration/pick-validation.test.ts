import {
  afterAll,
  beforeAll,
  expect,
  setSystemTime,
  spyOn,
  test,
} from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Pick validation tests require the isolated local DB and E2E_MODE=1",
  );
}
const { db } = await import("../../server/db");
const { picksRouter } = await import("../../server/api/routers/picks");
const { leagueAdminRouter } =
  await import("../../server/api/routers/league/admin");
const { resendApi } = await import("../../server/services/resend");
const confirmation = spyOn(resendApi, "sendWeekPicksEmail").mockResolvedValue(
  undefined,
);
let game: Awaited<ReturnType<typeof db.games.findFirstOrThrow>>;
beforeAll(async () => {
  game = await db.games.findFirstOrThrow({ where: { is_tiebreaker: false } });
});
afterAll(async () => {
  setSystemTime();
  confirmation.mockRestore();
  await db.$disconnect();
});
const rollback = new Error("Rollback validation fixtures");
type Case = {
  name: string;
  invalid?: boolean;
  winner?: number;
  score?: number;
  tiebreaker?: boolean;
  wrongSeason?: boolean;
  missingGame?: boolean;
  duplicate?: boolean;
  missingMembership?: boolean;
  mixedSeason?: boolean;
  emptyPicks?: boolean;
  emptyLeagues?: boolean;
  newPick?: boolean;
};
async function scenario(
  endpoint: "submitPicks" | "setPick",
  options: Case,
  override = false,
) {
  try {
    await db.$transaction(
      async (tx) => {
        const suffix = crypto.randomUUID();
        const person = await tx.people.create({
          data: {
            username: `validation-${suffix}`,
            email: `web.e2e.validation.${suffix}@example.com`,
            fname: "Validation",
            lname: "Test",
            season: game.season,
          },
        });
        const league = await tx.leagues.create({
          data: {
            name: "E2E validation",
            season: game.season + (options.wrongSeason ? 1 : 0),
            created_by_user_id: person.uid,
            late_policy: "allow_late_and_lock_after_start",
            leaguemembers: { create: { user_id: person.uid, role: "admin" } },
          },
          include: { leaguemembers: true },
        });
        const memberId = league.leaguemembers[0]!.membership_id;
        const extraLeague =
          options.missingMembership || options.mixedSeason
            ? await tx.leagues.create({
                data: {
                  name: "E2E other validation",
                  season: game.season + (options.mixedSeason ? 1 : 0),
                  created_by_user_id: person.uid,
                  ...(options.mixedSeason
                    ? {
                        leaguemembers: {
                          create: { user_id: person.uid, role: "player" },
                        },
                      }
                    : {}),
                },
              })
            : null;
        await tx.games.update({
          where: { gid: game.gid },
          data: { is_tiebreaker: options.tiebreaker ?? false },
        });
        if (!options.newPick)
          await tx.picks.create({
            data: {
              uid: person.uid,
              member_id: memberId,
              season: league.season,
              week: game.week,
              gid: game.gid,
              winner: game.home,
            },
          });
        const before = await tx.picks.findMany({
          where: { uid: person.uid },
          orderBy: { pickid: "asc" },
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
        setSystemTime(new Date(game.ts.getTime() - 1));
        const pick = {
          gid: options.missingGame ? -1 : game.gid,
          winner: options.winner ?? game.away,
          score: options.score,
          isRandom: false,
        };
        const count = confirmation.mock.calls.length;
        const call =
          endpoint === "submitPicks"
            ? picksRouter.createCaller(ctx).submitPicks({
                leagueIds: options.emptyLeagues
                  ? []
                  : [
                      league.league_id,
                      ...(extraLeague ? [extraLeague.league_id] : []),
                    ],
                picks: options.emptyPicks
                  ? []
                  : options.duplicate
                    ? [pick, pick]
                    : options.missingGame
                      ? [{ ...pick, gid: game.gid }, pick]
                      : [pick],
                overrideMemberId: override ? memberId : undefined,
              })
            : leagueAdminRouter.createCaller(ctx).setPick({
                leagueId: league.league_id,
                memberId,
                gameId: pick.gid,
                winner: pick.winner,
                score: pick.score,
              });
        if (options.invalid) {
          await expect(call).rejects.toMatchObject({
            code: options.missingMembership ? "UNAUTHORIZED" : "BAD_REQUEST",
          });
          expect(
            await tx.picks.findMany({
              where: { uid: person.uid },
              orderBy: { pickid: "asc" },
            }),
          ).toEqual(before);
          expect(confirmation.mock.calls.length).toBe(count);
        } else {
          await call;
          const saved = await tx.picks.findMany({ where: { uid: person.uid } });
          expect(saved).toHaveLength(1);
          expect(saved[0]!.winner).toBe(pick.winner);
          // Omitted scores retain the existing database default of zero.
          expect(saved[0]!.score).toBe(options.score ?? 0);
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
const shared: Case[] = [
  { name: "winner outside matchup", winner: 999999, invalid: true },
  { name: "wrong season", wrongSeason: true, invalid: true },
  { name: "score on ordinary game", score: 40, invalid: true },
  ...[0, -1, 201, 1.5].map((score) => ({
    name: `invalid score ${score}`,
    score,
    tiebreaker: true,
    invalid: true,
  })),
  { name: "score lower boundary", score: 1, tiebreaker: true },
  { name: "score upper boundary", score: 200, tiebreaker: true },
  { name: "winner edit without score" },
  { name: "create valid pick", newPick: true },
  {
    name: "reject invalid new pick",
    newPick: true,
    winner: 999999,
    invalid: true,
  },
];
for (const endpoint of ["submitPicks", "setPick"] as const) {
  for (const options of shared)
    test(`${endpoint}: ${options.name}`, () => scenario(endpoint, options));
}
for (const override of [false, true]) {
  for (const options of [
    {
      name: "unknown game alongside valid edit",
      missingGame: true,
      invalid: true,
    },
    { name: "duplicate game", duplicate: true, invalid: true },
    {
      name: "duplicate new game",
      duplicate: true,
      newPick: true,
      invalid: true,
    },
  ])
    test(`submitPicks ${override ? "override" : "player"}: ${options.name}`, () =>
      scenario("submitPicks", options, override));
}
for (const options of [
  {
    name: "missing requested membership",
    missingMembership: true,
    invalid: true,
  },
  { name: "mixed destination seasons", mixedSeason: true, invalid: true },
  { name: "empty picks", emptyPicks: true, invalid: true },
  { name: "empty leagues", emptyLeagues: true, invalid: true },
])
  test(`submitPicks: ${options.name}`, () => scenario("submitPicks", options));
