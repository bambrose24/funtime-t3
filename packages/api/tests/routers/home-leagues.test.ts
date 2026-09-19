import { expect, test } from "bun:test";
import { getHomeLeagueStatus } from "../../utils/homeLeagueStatus";
import type { TRPCContext } from "../../server/api/trpc";

process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:1";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test";
process.env.E2E_MODE = "1";
const { homeRouter } = await import("../../server/api/routers/home");
const now = new Date("2026-09-13T17:00:00Z");
const schedule = [
  { week: 1, ts: new Date("2026-09-10T00:00:00Z"), done: true },
  { week: 1, ts: new Date("2026-09-14T00:00:00Z"), done: false },
  { week: 2, ts: new Date("2026-09-17T00:00:00Z"), done: false },
];
const week1Only = schedule.filter((game) => game.week === 1);
const firstKickoff = schedule[0]!.ts;

for (const policy of [
  null,
  "allow_late_and_lock_after_start",
  "allow_late_whole_week",
]) {
  test(`${policy}: an unsubmitted started week still needs remaining games`, () => {
    expect(getHomeLeagueStatus(schedule, new Set(), policy, now)).toEqual({
      state: "needed",
      week: 1,
    });
  });
}
test("first-kickoff policy advances Home once the started week is closed", () => {
  expect(
    getHomeLeagueStatus(schedule, new Set(), "close_at_first_game_start", now),
  ).toEqual({
    state: "needed",
    week: 2,
  });
});
test("submitting the started week does not fulfill the next unstarted week", () => {
  expect(getHomeLeagueStatus(schedule, new Set([1]), null, now)).toEqual({
    state: "needed",
    week: 2,
  });
});
test("picks on a later week do not skip a still-open unsubmitted week", () => {
  expect(getHomeLeagueStatus(schedule, new Set([2]), null, now)).toEqual({
    state: "needed",
    week: 1,
  });
});
test("the next unstarted week can already be submitted", () => {
  expect(getHomeLeagueStatus(schedule, new Set([1, 2]), null, now)).toEqual({
    state: "submitted",
    week: 2,
  });
});
test("first-kickoff policy closes the last remaining started week", () => {
  expect(
    getHomeLeagueStatus(week1Only, new Set(), "close_at_first_game_start", now),
  ).toEqual({ state: "closed", week: 1 });
  expect(
    getHomeLeagueStatus(
      week1Only,
      new Set([1]),
      "close_at_first_game_start",
      now,
    ),
  ).toEqual({ state: "submitted", week: 1 });
});
test("per-game policy still needs remaining games when no later week exists", () => {
  expect(getHomeLeagueStatus(week1Only, new Set(), null, now)).toEqual({
    state: "needed",
    week: 1,
  });
});
test("the deadline is inclusive and follows the current schedule", () => {
  expect(
    getHomeLeagueStatus(
      week1Only,
      new Set(),
      "close_at_first_game_start",
      new Date(firstKickoff.getTime() - 1),
    ),
  ).toEqual({ state: "needed", week: 1 });
  expect(
    getHomeLeagueStatus(
      week1Only,
      new Set(),
      "close_at_first_game_start",
      firstKickoff,
    ),
  ).toEqual({ state: "closed", week: 1 });
  expect(
    getHomeLeagueStatus(
      schedule,
      new Set(),
      "close_at_first_game_start",
      new Date(firstKickoff.getTime() - 1),
    ),
  ).toEqual({ state: "needed", week: 1 });
  expect(
    getHomeLeagueStatus(
      schedule,
      new Set(),
      "close_at_first_game_start",
      firstKickoff,
    ),
  ).toEqual({ state: "needed", week: 2 });
});
test("submitting a started allow-late week advances Home to the next open week", () => {
  expect(
    getHomeLeagueStatus(schedule, new Set([1]), null, firstKickoff),
  ).toEqual({ state: "needed", week: 2 });
});
test("missing schedule, final games in progress, and completed season are distinct", () => {
  expect(getHomeLeagueStatus([], new Set(), null, now).state).toBe(
    "no_schedule",
  );
  expect(
    getHomeLeagueStatus(schedule, new Set(), null, new Date("2026-09-18"))
      .state,
  ).toBe("closed");
  expect(
    getHomeLeagueStatus(
      schedule.map((game) => ({ ...game, done: true })),
      new Set(),
      null,
      new Date("2026-09-18"),
    ).state,
  ).toBe("season_over");
});

test("home query scopes memberships and batches weekly submissions across leagues", async () => {
  const queries: string[] = [];
  const ctx = {
    dbUser: {
      uid: 1,
      leaguemembers: [
        { league_id: 10, membership_id: 100, leagues: { season: 2026 } },
        { league_id: 11, membership_id: 101, leagues: { season: 2026 } },
        { league_id: 12, membership_id: 102, leagues: { season: 2025 } },
      ],
    },
    supabaseUser: { id: "viewer" },
    headers: new Headers(),
    db: {
      leagues: {
        findMany: async (args: { where: { league_id: { in: number[] } } }) => {
          queries.push("leagues");
          expect(args.where.league_id.in).toEqual([10, 11, 12]);
          return [
            { league_id: 10, name: "A", season: 2026, late_policy: null },
            { league_id: 11, name: "B", season: 2026, late_policy: null },
            { league_id: 12, name: "Past", season: 2025, late_policy: null },
          ];
        },
      },
      games: {
        findMany: async (args: { where: { season: number } }) => {
          queries.push("games");
          expect(args.where.season).toBe(2026);
          return [{ gid: 1, week: 1, ts: new Date("2100-01-01"), done: false }];
        },
      },
      picks: {
        findMany: async (args: {
          where: { member_id: { in: number[] }; gid: { in: number[] } };
        }) => {
          queries.push("picks");
          expect(args.where.member_id.in).toEqual([100, 101]);
          expect(args.where.gid.in).toEqual([1]);
          return [{ member_id: 100, week: 1 }];
        },
      },
    },
  } as unknown as TRPCContext;
  const rows = await homeRouter.createCaller(ctx).leagues();
  expect(rows?.map((row) => row.weeklyStatus?.state ?? null)).toEqual([
    "submitted",
    "needed",
    null,
  ]);
  expect(queries.sort()).toEqual(["games", "leagues", "picks"]);
  expect(
    await homeRouter.createCaller({ ...ctx, supabaseUser: null }).leagues(),
  ).toBeNull();
  expect(queries).toHaveLength(3);
});
