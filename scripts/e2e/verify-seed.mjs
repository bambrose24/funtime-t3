#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { DEFAULT_CURRENT_SEASON, parseSeason } from "./lib.mjs";

const season = parseSeason(process.env.FUNTIME_CURRENT_SEASON, DEFAULT_CURRENT_SEASON);
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:55422/postgres";

function runSql(query) {
  return execFileSync(
    "psql",
    [databaseUrl, "-v", "ON_ERROR_STOP=1", "-tA", "-c", query],
    { encoding: "utf8" },
  ).trim();
}

function runJsonQuery(query) {
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
assert(stats.game_count > 0, `Seed verification failed: no games found for season ${season}`);
assert(stats.done_count === 0, "Seed verification failed: seeded games must be upcoming (done=false)");
assert(stats.first_week === 1, "Seed verification failed: first available week must be 1");
assert(new Date(stats.first_game_ts).getTime() > Date.now(), "Seed verification failed: first game must be in the future");

let createdUserId = null;
let createdLeagueId = null;

try {
  const unique = Date.now();
  const createdUser = runJsonQuery(`
WITH inserted AS (
  INSERT INTO "people" ("username", "fname", "lname", "email", "season", "supabase_id")
  VALUES (
    'e2e_${unique}',
    'E2E',
    'Verifier',
    'e2e_${unique}@example.com',
    ${season},
    'e2e_${unique}'
  )
  RETURNING "uid", "email"
)
SELECT row_to_json(inserted) FROM inserted;
`);

  assert(createdUser?.uid, "Unable to create verification user");
  createdUserId = Number(createdUser.uid);

  const createdLeague = runJsonQuery(`
WITH inserted AS (
  INSERT INTO "leagues" ("created_by_user_id", "name", "created_time", "season")
  VALUES (${createdUserId}, 'E2E Verify ${unique}', NOW(), ${season})
  RETURNING "league_id", "season"
)
SELECT row_to_json(inserted) FROM inserted;
`);

  assert(createdLeague?.league_id, "Unable to create verification league");
  createdLeagueId = Number(createdLeague.league_id);

  const createdMember = runJsonQuery(`
WITH inserted AS (
  INSERT INTO "leaguemembers" ("league_id", "user_id", "role")
  VALUES (${createdLeagueId}, ${createdUserId}, 'admin')
  RETURNING "membership_id"
)
SELECT row_to_json(inserted) FROM inserted;
`);

  assert(createdMember?.membership_id, "Unable to create verification league membership");
  const memberId = Number(createdMember.membership_id);

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

  const currentWeek =
    seasonState?.most_recent_started_game?.week ??
    seasonState?.next_game_to_start?.week ??
    1;

  const candidateGames = runJsonQuery(`
SELECT COALESCE(json_agg(g ORDER BY g."is_tiebreaker" ASC, g."ts" ASC, g."gid" ASC), '[]'::json)
FROM (
  SELECT "gid", "week", "ts", "home", "away", COALESCE("is_tiebreaker", false) AS "is_tiebreaker"
  FROM "games"
  WHERE "season" = ${season} AND "week" IN (${currentWeek}, ${currentWeek + 1})
) g;
`);

  assert(Array.isArray(candidateGames) && candidateGames.length > 0, "No candidate games for weekToPick verification");

  const weekGames = candidateGames.filter((g) => g.week === currentWeek);
  const nextWeekGames = candidateGames.filter((g) => g.week === currentWeek + 1);
  const weekToReturn =
    seasonState?.next_game_to_start?.week === currentWeek + 1
      ? currentWeek + 1
      : currentWeek;

  const gamesToReturn = weekToReturn === currentWeek ? weekGames : nextWeekGames;

  assert(weekToReturn === 1, `Expected weekToPick to be 1, received ${weekToReturn}`);
  assert(seasonState?.has_started === false, "Expected seeded season to report hasStarted=false");

  const openGames = gamesToReturn.filter((g) => new Date(g.ts).getTime() >= Date.now());
  assert(openGames.length > 0, "Expected at least one open game for submitPicks verification");

  const picksToInsert = openGames.slice(0, Math.min(2, openGames.length));
  for (const game of picksToInsert) {
    runSql(`
INSERT INTO "picks" ("uid", "season", "week", "gid", "winner", "loser", "score", "member_id", "ts", "is_random")
VALUES (
  ${createdUserId},
  ${season},
  ${weekToReturn},
  ${Number(game.gid)},
  ${Number(game.home)},
  ${Number(game.away)},
  42,
  ${memberId},
  NOW(),
  false
);
`);
  }

  const savedPickCount = runJsonQuery(`
SELECT row_to_json(s)
FROM (
  SELECT COUNT(*)::int AS count
  FROM "picks"
  WHERE "member_id" = ${memberId} AND "week" = ${weekToReturn}
) s;
`);

  assert(
    savedPickCount?.count === picksToInsert.length,
    `Expected ${picksToInsert.length} saved picks, found ${savedPickCount?.count ?? 0}`,
  );

  console.log(
    `[e2e] Seed verified for season ${season}. teams=${stats.team_count}, games=${stats.game_count}, weekToPick=${weekToReturn}, persistedPicks=${savedPickCount.count}`,
  );
} finally {
  if (createdLeagueId) {
    runSql(`DELETE FROM "leagues" WHERE "league_id" = ${createdLeagueId};`);
  }
  if (createdUserId) {
    runSql(`DELETE FROM "people" WHERE "uid" = ${createdUserId};`);
  }
}
