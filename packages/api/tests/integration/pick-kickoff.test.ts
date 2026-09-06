import {
  afterAll,
  beforeAll,
  expect,
  setSystemTime,
  spyOn,
  test,
} from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

// Import the real routers only after checking the environment. Never use a
// developer's configured database or enable external effects in these tests.
const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Pick integration tests require the isolated local DB and E2E_MODE=1",
  );
}
const { db } = await import("../../server/db");
const { picksRouter } = await import("../../server/api/routers/picks");
const { leagueAdminRouter } =
  await import("../../server/api/routers/league/admin");

const { resendApi } = await import("../../server/services/resend");
// Delivery is a separate boundary: its global DB queries cannot see these
// rollback-only fixtures, and no confirmation should escape the test.
const confirmation = spyOn(resendApi, "sendWeekPicksEmail").mockResolvedValue(
  undefined,
);

let game: Awaited<ReturnType<typeof db.games.findFirstOrThrow>>;
let futureGame: typeof game;
beforeAll(async () => {
  game = await db.games.findFirstOrThrow({ orderBy: { gid: "asc" } });
  futureGame = await db.games.findFirstOrThrow({
    where: { season: game.season, ts: { gt: game.ts } },
  });
});
afterAll(async () => {
  setSystemTime();
  confirmation.mockRestore();
  await db.$disconnect();
});

const rollback = new Error("Rollback test fixtures");
type Actor = "admin" | "player" | "superAdmin" | "outsider";

async function scenario(
  endpoint: "submitPicks" | "setPick",
  actor: Actor,
  offsetMs: number,
  allowed: boolean,
  options: {
    wrongLeague?: boolean;
    selfSubmit?: boolean;
    mixed?: boolean;
  } = {},
) {
  const { wrongLeague, selfSubmit, mixed } = options;
  try {
    await db.$transaction(
      async (tx) => {
        const suffix = crypto.randomUUID();
        const person = await tx.people.create({
          data: {
            username: `kickoff-${suffix}`,
            fname: "Test",
            lname: "Admin",
            email: `web.e2e.kickoff.${suffix}@example.com`,
            season: game.season,
          },
        });
        const target = await tx.people.create({
          data: {
            username: `target-${suffix}`,
            fname: "Test",
            lname: "Player",
            email: `web.e2e.target.${suffix}@example.com`,
            season: game.season,
          },
        });
        const league = await tx.leagues.create({
          data: {
            name: "E2E kickoff guard",
            season: game.season,
            created_by_user_id: person.uid,
            leaguemembers: {
              create: [
                {
                  user_id: person.uid,
                  role: actor === "player" ? "player" : "admin",
                },
                { user_id: target.uid, role: "player" },
              ],
            },
          },
          include: { leaguemembers: true },
        });
        const member = league.leaguemembers.find(
          (m) => m.user_id === (selfSubmit ? person.uid : target.uid),
        )!;
        const initialPick = await tx.picks.create({
          data: {
            uid: member.user_id,
            season: game.season,
            week: game.week,
            member_id: member.membership_id,
            gid: game.gid,
            winner: game.home,
          },
        });
        // The real mutation's transaction runs inside this rollback-only fixture
        // transaction. Models/queries/writes are real Prisma/PostgreSQL operations.
        const scopedDb = new Proxy(tx, {
          get(target, prop) {
            if (prop === "$transaction")
              return async (fn: (client: typeof tx) => unknown) => fn(tx);
            return Reflect.get(target, prop);
          },
        }) as unknown as TRPCContext["db"];
        const otherLeague = wrongLeague
          ? await tx.leagues.create({
              data: {
                name: "E2E other kickoff league",
                season: game.season,
                created_by_user_id: person.uid,
                leaguemembers: {
                  create: { user_id: person.uid, role: "admin" },
                },
              },
            })
          : null;
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
        if (actor === "superAdmin") dbUser.email = "BAMBROSE24@GMAIL.COM";
        if (actor === "outsider") dbUser.leaguemembers = [];
        const ctx: TRPCContext = {
          db: scopedDb,
          dbUser,
          supabaseUser: null,
          headers: new Headers(),
        };
        setSystemTime(new Date(game.ts.getTime() + offsetMs));
        const leagueId = otherLeague?.league_id ?? league.league_id;
        const confirmationCount = confirmation.mock.calls.length;
        const call =
          endpoint === "submitPicks"
            ? picksRouter.createCaller(ctx).submitPicks({
                leagueIds: [leagueId],
                overrideMemberId: selfSubmit ? undefined : member.membership_id,
                picks: [
                  { gid: game.gid, winner: game.away, isRandom: false },
                  ...(mixed
                    ? [
                        {
                          gid: futureGame.gid,
                          winner: futureGame.away,
                          isRandom: false,
                        },
                      ]
                    : []),
                ],
              })
            : leagueAdminRouter.createCaller(ctx).setPick({
                leagueId,
                memberId: member.membership_id,
                gameId: game.gid,
                winner: game.away,
              });
        if (allowed) {
          await call;
        } else if (actor === "admin" && !wrongLeague && offsetMs >= 0) {
          await expect(call).rejects.toThrow(
            "League admins cannot edit picks after kickoff",
          );
        } else {
          await expect(call).rejects.toThrow();
        }
        if (!allowed)
          expect(confirmation.mock.calls.length).toBe(confirmationCount);
        expect(
          (
            await tx.picks.findUniqueOrThrow({
              where: { pickid: initialPick.pickid },
            })
          ).winner,
        ).toBe(
          allowed && (!selfSubmit || offsetMs < 0) ? game.away : game.home,
        );
        expect(
          await tx.picks.count({ where: { member_id: member.membership_id } }),
        ).toBe(1);
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

for (const endpoint of ["submitPicks", "setPick"] as const) {
  for (const offset of [-1, 0, 1]) {
    test(`${endpoint}: admin at kickoff ${offset}ms`, () =>
      scenario(endpoint, "admin", offset, offset < 0));
    test(`${endpoint}: super admin at kickoff ${offset}ms`, () =>
      scenario(endpoint, "superAdmin", offset, true));
  }
  test(`${endpoint}: player cannot override a member`, () =>
    scenario(endpoint, "player", -1, false));
  test(`${endpoint}: outsider cannot override a member`, () =>
    scenario(endpoint, "outsider", -1, false));
  test(`${endpoint}: target must belong to requested league`, () =>
    scenario(endpoint, "admin", -1, false, { wrongLeague: true }));
}

for (const offset of [-1, 0, 1]) {
  test(`submitPicks: player self-submission at kickoff ${offset}ms`, () =>
    scenario("submitPicks", "player", offset, true, { selfSubmit: true }));
}
test("submitPicks: reject mixed locked/open override without partial writes", () =>
  scenario("submitPicks", "admin", 0, false, { mixed: true }));
