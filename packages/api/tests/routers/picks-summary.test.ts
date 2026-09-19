import { expect, mock, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

// Exercise the real router with an in-memory DB boundary and no Next cache.
// No developer database, Redis, or email service is used by these queries.
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:1";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test";
process.env.E2E_MODE = "1";
mock.module("../../utils/cache", () => ({
  cache: (fn: unknown) => fn,
  getCoreUserTag: (key: number | string) => `coreUser_${key}`,
}));

const { leagueRouter } = await import("../../server/api/routers/league");
const leagueId = 10;
const week = 1;
const startedGames = [
  { gid: 100, ts: new Date("2000-01-01"), is_tiebreaker: false },
  { gid: 101, ts: new Date("2100-01-01"), is_tiebreaker: true },
];
const upcomingGames = [
  { gid: 100, ts: new Date("2100-01-01"), is_tiebreaker: false },
  { gid: 101, ts: new Date("2100-01-02"), is_tiebreaker: true },
];

function caller(
  viewerWeek: number | null,
  memberLeague = leagueId,
  games = startedGames,
  policy: string | null = null,
) {
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
      leagues: {
        findFirstOrThrow: async () => ({
          season: 2026,
          late_policy: policy,
        }),
      },
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

test("after first kickoff, submitted viewers see the full slate and future tiebreaker score", async () => {
  const rows = await caller(week).picksSummary({ leagueId, week });
  const other = rows.find((row) => row.membership_id === 2)!;
  expect(other.picks.map((p) => p.winner)).toEqual([101, 102]);
  expect(other.correctPicks).toBe(1);
  expect(other.tiebreakerScore).toBe(44);

  const own = rows.find((row) => row.membership_id === 1)!;
  expect(own.picks.map((p) => p.winner)).toEqual([101, 102]);
  expect(own.tiebreakerScore).toBe(44);
});

test("after first kickoff, unsubmitted viewers cannot see opponents while the week still accepts picks", async () => {
  for (const viewerWeek of [null, 2]) {
    const rows = await caller(viewerWeek).picksSummary({ leagueId, week });
    const other = rows.find((row) => row.membership_id === 2)!;
    expect(other.picks.map((p) => p.winner)).toEqual([null, null]);
    expect(other.correctPicks).toBe(0);
    expect(other.tiebreakerScore).toBe(0);
  }
});

test("after the week no longer accepts picks, unsubmitted viewers can see the slate", async () => {
  const finishedGames = [
    { gid: 100, ts: new Date("2000-01-01"), is_tiebreaker: false },
    { gid: 101, ts: new Date("2000-01-02"), is_tiebreaker: true },
  ];
  const rows = await caller(null, leagueId, finishedGames).picksSummary({
    leagueId,
    week,
  });
  const other = rows.find((row) => row.membership_id === 2)!;
  expect(other.picks.map((p) => p.winner)).toEqual([101, 102]);
  expect(other.tiebreakerScore).toBe(44);
});

test("first-kickoff policy reveals opponents after kickoff even without a submit", async () => {
  const rows = await caller(
    null,
    leagueId,
    startedGames,
    "close_at_first_game_start",
  ).picksSummary({ leagueId, week });
  const other = rows.find((row) => row.membership_id === 2)!;
  expect(other.picks.map((p) => p.winner)).toEqual([101, 102]);
  expect(other.tiebreakerScore).toBe(44);
});

test("before first kickoff, submitted viewers see only their own picks", async () => {
  const rows = await caller(week, leagueId, upcomingGames).picksSummary({
    leagueId,
    week,
  });
  const own = rows.find((row) => row.membership_id === 1)!;
  const other = rows.find((row) => row.membership_id === 2)!;
  expect(own.picks.map((p) => p.winner)).toEqual([101, 102]);
  expect(own.tiebreakerScore).toBe(44);
  expect(other.picks.map((p) => p.winner)).toEqual([null, null]);
  expect(other.picks.map((p) => p.correct)).toEqual([null, null]);
  expect(other.correctPicks).toBe(0);
  expect(other.tiebreakerScore).toBe(0);
});

test("before first kickoff, unsubmitted viewers also see empty opponent picks", async () => {
  const rows = await caller(null, leagueId, upcomingGames).picksSummary({
    leagueId,
    week,
  });
  const other = rows.find((row) => row.membership_id === 2)!;
  expect(other.picks.map((p) => p.winner)).toEqual([null, null]);
  expect(other.tiebreakerScore).toBe(0);
});

test("the full slate appears at the first kickoff for submitted viewers, not one millisecond before", async () => {
  const kickoff = new Date();
  const slate = [
    { gid: 100, ts: new Date(kickoff.getTime() - 1), is_tiebreaker: false },
    {
      gid: 101,
      ts: new Date(kickoff.getTime() + 86_400_000),
      is_tiebreaker: true,
    },
  ];
  const justStarted = await caller(week, leagueId, slate).picksSummary({
    leagueId,
    week,
  });
  expect(
    justStarted
      .find((row) => row.membership_id === 2)
      ?.picks.map((p) => p.winner),
  ).toEqual([101, 102]);

  const stillUpcoming = [
    {
      gid: 100,
      ts: new Date(kickoff.getTime() + 60_000),
      is_tiebreaker: false,
    },
    {
      gid: 101,
      ts: new Date(kickoff.getTime() + 86_400_000),
      is_tiebreaker: true,
    },
  ];
  const hidden = await caller(week, leagueId, stillUpcoming).picksSummary({
    leagueId,
    week,
  });
  expect(
    hidden.find((row) => row.membership_id === 2)?.picks.map((p) => p.winner),
  ).toEqual([null, null]);
});

test("membership in another league does not grant access", async () => {
  await expect(
    caller(week, 99).picksSummary({ leagueId, week }),
  ).rejects.toThrow("You are not in the league");
});
