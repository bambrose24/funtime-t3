#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { DEFAULT_FIXTURE_SEASON } from "./lib.ts";

const season = DEFAULT_FIXTURE_SEASON;
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:55422/postgres";

function runSql(query) {
  return execFileSync(
    "psql",
    [databaseUrl, "-v", "ON_ERROR_STOP=1", "-qAt", "-c", query],
    { encoding: "utf8" },
  ).trim();
}

function runJsonQuery(query) {
  // Every caller supplies a SELECT. Passing BEGIN/SELECT/ROLLBACK as one
  // `psql -c` command causes psql to report only the final command's output on
  // some versions, leaving the JSON result empty.
  const output = runSql(query);
  if (!output) {
    return null;
  }
  return JSON.parse(output);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const stats = runJsonQuery(`
SELECT row_to_json(s)
FROM (
  SELECT
    (SELECT COUNT(*) FROM "teams")::int AS team_count,
    (SELECT COUNT(*) FROM "games" WHERE "season" = ${season})::int AS game_count,
    (SELECT COUNT(*) FROM "games" WHERE "season" = ${season} AND COALESCE("done", false) = true)::int AS done_count,
    (SELECT MIN("ts") FROM "games" WHERE "season" = ${season}) AS first_game_ts,
    (SELECT MIN("week") FROM "games" WHERE "season" = ${season})::int AS first_week
) s;
`);

assert(stats, "Unable to load seed stats");
assert(stats.team_count > 0, "Seed verification failed: teams table is empty");
assert(
  stats.game_count > 0,
  `Seed verification failed: no games found for season ${season}`,
);
assert(
  stats.done_count === 0,
  "Seed verification failed: seeded games must be upcoming (done=false)",
);
assert(
  stats.first_week === 1,
  "Seed verification failed: first available week must be 1",
);
assert(
  new Date(stats.first_game_ts).getTime() > Date.now(),
  "Seed verification failed: first game must be in the future",
);

const seasonState = runJsonQuery(`
SELECT row_to_json(s)
FROM (
  SELECT
    (
      SELECT row_to_json(g)
      FROM (
        SELECT "gid", "week", "ts"
        FROM "games"
        WHERE "season" = ${season} AND "ts" <= NOW()
        ORDER BY "ts" DESC
        LIMIT 1
      ) g
    ) AS most_recent_started_game,
    (
      SELECT row_to_json(g)
      FROM (
        SELECT "gid", "week", "ts"
        FROM "games"
        WHERE "season" = ${season} AND "ts" >= NOW()
        ORDER BY "ts" ASC
        LIMIT 1
      ) g
    ) AS next_game_to_start,
    (
      SELECT (MIN("ts") < NOW())
      FROM "games"
      WHERE "season" = ${season}
    ) AS has_started
) s;
`);

const candidateGames = runJsonQuery(`
SELECT COALESCE(json_agg(g ORDER BY g."is_tiebreaker" ASC, g."ts" ASC, g."gid" ASC), '[]'::json)
FROM (
  SELECT "gid", "week", "ts", "home", "away", COALESCE("is_tiebreaker", false) AS "is_tiebreaker"
  FROM "games"
  WHERE "season" = ${season}
) g;
`);

assert(
  Array.isArray(candidateGames) && candidateGames.length > 0,
  "No candidate games for weekToPick verification",
);

const nowMs = Date.now();
const startedWeeks = new Set(
  candidateGames
    .filter((g) => new Date(g.ts).getTime() <= nowMs)
    .map((g) => g.week),
);
const weeks = [...new Set(candidateGames.map((g) => g.week))].sort(
  (a, b) => a - b,
);
const weekToReturn =
  weeks.find((week) => !startedWeeks.has(week)) ?? weeks.at(-1) ?? 1;
const gamesToReturn = candidateGames.filter((g) => g.week === weekToReturn);

assert(
  weekToReturn === 1,
  `Expected weekToPick to be 1, received ${weekToReturn}`,
);
assert(
  seasonState?.has_started === false,
  "Expected seeded season to report hasStarted=false",
);

const openGames = gamesToReturn.filter(
  (g) => new Date(g.ts).getTime() >= Date.now(),
);
assert(
  openGames.length > 0,
  "Expected at least one open game for submitPicks verification",
);

const tiebreakerCount = gamesToReturn.filter((g) => g.is_tiebreaker).length;
assert(
  tiebreakerCount === 1,
  `Expected exactly one tiebreaker game for week ${weekToReturn}, found ${tiebreakerCount}`,
);

console.log(
  `[e2e] Seed verified read-only for season ${season}. teams=${stats.team_count}, games=${stats.game_count}, weekToPick=${weekToReturn}, openGames=${openGames.length}, tiebreakers=${tiebreakerCount}`,
);
