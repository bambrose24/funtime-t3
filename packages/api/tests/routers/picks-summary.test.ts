import { expect, mock, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

// Exercise the real router with an in-memory DB boundary and no Next cache.
// No developer database, Redis, or email service is used by these queries.
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:1";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test";
process.env.E2E_MODE = "1";
mock.module("../../utils/cache", () => ({ cache: (fn: unknown) => fn }));

const { leagueRouter } = await import("../../server/api/routers/league");
const leagueId = 10;
const week = 1;
const games = [
  { gid: 100, ts: new Date("2000-01-01"), is_tiebreaker: false },
  { gid: 101, ts: new Date("2100-01-01"), is_tiebreaker: true },
];

function caller(viewerWeek: number | null, memberLeague = leagueId) {
  const pick = (gid: number, pickWeek: number) => ({
    gid,
    week: pickWeek,
    winner: gid + 1,
    correct: gid === 100 ? 1 : null,
    done: gid === 100,
    score: gid === 101 ? 44 : null,
  });
  const members = [
    {
      membership_id: 1,
      league_id: leagueId,
      people: { username: "Viewer" },
      picks:
        viewerWeek === null ? [] : games.map((g) => pick(g.gid, viewerWeek)),
    },
    {
      membership_id: 2,
      league_id: leagueId,
      people: { username: "Other player" },
      picks: games.map((g) => pick(g.gid, week)),
    },
  ];
  const ctx = {
    dbUser: {
      uid: 1,
      leaguemembers: [{ league_id: memberLeague, membership_id: 1 }],
    },
    db: {
      leagues: { findFirstOrThrow: async () => ({ season: 2026 }) },
      games: { findMany: async () => games },
      leaguemembers: {
        findMany: async (args: {
          include: { picks: { where: { week: number } } };
        }) =>
          members.map((member) => ({
            ...member,
            picks: member.picks.filter(
              (p) => p.week === args.include.picks.where.week,
            ),
          })),
      },
    },
    supabaseUser: null,
    headers: new Headers(),
  } as unknown as TRPCContext;
  return leagueRouter.createCaller(ctx);
}

test("submitted viewers see the full slate and future tiebreaker score", async () => {
  const rows = await caller(week).picksSummary({ leagueId, week });
  for (const row of rows) {
    expect(row.picks.map((p) => p.winner)).toEqual([101, 102]);
    expect(row.correctPicks).toBe(1);
    expect(row.tiebreakerScore).toBe(44);
  }
});

for (const viewerWeek of [null, 2]) {
  test(`viewers with picks for ${viewerWeek ?? "no week"} cannot see week 1 picks`, async () => {
    const rows = await caller(viewerWeek).picksSummary({ leagueId, week });
    const other = rows.find((row) => row.membership_id === 2)!;
    expect(other.picks.map((p) => p.winner)).toEqual([null, null]);
    expect(other.picks.map((p) => p.correct)).toEqual([null, null]);
    expect(other.correctPicks).toBe(0);
    expect(other.tiebreakerScore).toBe(0);
  });
}

test("membership in another league does not grant access", async () => {
  await expect(
    caller(week, 99).picksSummary({ leagueId, week }),
  ).rejects.toThrow("You are not in the league");
});
