import { afterAll, beforeAll, expect, setSystemTime, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";
import type { LatePolicy } from "../../src/generated/prisma-client/client";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Week-to-pick tests require the isolated local DB and E2E_MODE=1",
  );
}
const { db } = await import("../../server/db");
const { leagueRouter } = await import("../../server/api/routers/league");

let firstGame: Awaited<ReturnType<typeof db.games.findFirstOrThrow>>;
let laterGame: typeof firstGame;
let nextWeekGame: typeof firstGame | null;
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
  nextWeekGame = await db.games.findFirst({
    where: {
      season: firstGame.season,
      week: { gt: firstGame.week },
    },
    orderBy: [{ week: "asc" }, { ts: "asc" }],
  });
});
afterAll(async () => {
  setSystemTime();
  await db.$disconnect();
});

const rollback = new Error("Rollback week-to-pick fixtures");

async function expectWeekToPick(
  options: { policy: LatePolicy; submitted?: boolean },
  week: number,
) {
  try {
    await db.$transaction(
      async (tx) => {
        const suffix = crypto.randomUUID();
        const person = await tx.people.create({
          data: {
            username: `weekpick-${suffix}`,
            email: `web.e2e.weekpick.${suffix}@example.com`,
            fname: "Week",
            lname: "Pick",
            season: firstGame.season,
          },
        });
        const league = await tx.leagues.create({
          data: {
            name: "E2E week to pick",
            season: firstGame.season,
            created_by_user_id: person.uid,
            late_policy: options.policy,
            leaguemembers: {
              create: { user_id: person.uid, role: "player" },
            },
          },
          include: { leaguemembers: true },
        });
        const memberId = league.leaguemembers[0]!.membership_id;
        if (options.submitted) {
          await tx.picks.create({
            data: {
              uid: person.uid,
              season: laterGame.season,
              week: laterGame.week,
              gid: laterGame.gid,
              winner: laterGame.away,
              member_id: memberId,
            },
          });
        }
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
        setSystemTime(new Date(firstGame.ts.getTime() + 1));
        const result = await leagueRouter
          .createCaller({
            db: scopedDb,
            dbUser,
            supabaseUser: null,
            headers: new Headers(),
          })
          .weekToPick({ leagueId: league.league_id });
        expect(result.week).toBe(week);
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

test("allow-late weekToPick stays on the started week until this person submits", async () => {
  await expectWeekToPick(
    { policy: "allow_late_and_lock_after_start" },
    firstGame.week,
  );
  if (!nextWeekGame) return;
  await expectWeekToPick(
    { policy: "allow_late_and_lock_after_start", submitted: true },
    nextWeekGame.week,
  );
});

test("first-kickoff weekToPick advances at kickoff even without picks", async () => {
  await expectWeekToPick(
    { policy: "close_at_first_game_start" },
    nextWeekGame?.week ?? firstGame.week,
  );
  await expectWeekToPick(
    { policy: "close_at_first_game_start", submitted: true },
    nextWeekGame?.week ?? firstGame.week,
  );
});
