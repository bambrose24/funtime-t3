#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_ANCHOR_UTC,
  DEFAULT_CURRENT_SEASON,
  applyFutureScheduleTransform,
  ensureDir,
  parseSeason,
  writeSeedSqlFromFixture,
} from "./lib.mjs";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const season = parseSeason(process.env.FUNTIME_CURRENT_SEASON, DEFAULT_CURRENT_SEASON);
const anchorUtc = process.env.E2E_SCHEDULE_ANCHOR_UTC ?? DEFAULT_ANCHOR_UTC;
const liveDatabaseUrl = process.env.LIVE_DATABASE_URL;

if (!liveDatabaseUrl) {
  throw new Error(
    "LIVE_DATABASE_URL is required to refresh E2E fixtures from the live database.",
  );
}

function runPsqlJson(query) {
  const output = execFileSync(
    "psql",
    [liveDatabaseUrl, "-v", "ON_ERROR_STOP=1", "-tA", "-c", query],
    { encoding: "utf8" },
  ).trim();

  if (!output) {
    return null;
  }

  return JSON.parse(output);
}

const teamsQuery = `
SELECT COALESCE(json_agg(t ORDER BY t.teamid), '[]'::json)
FROM (
  SELECT
    teamid,
    abbrev,
    loc,
    name,
    conference,
    primary_color,
    secondary_color,
    tertiary_color
  FROM teams
  ORDER BY teamid
) t;
`;

const gamesQuery = `
SELECT COALESCE(json_agg(g ORDER BY g.ts, g.gid), '[]'::json)
FROM (
  SELECT
    gid,
    season,
    week,
    ts,
    home,
    away,
    homescore,
    awayscore,
    done,
    winner,
    international,
    seconds,
    current_record,
    is_tiebreaker,
    homerecord,
    awayrecord,
    current_quarter_seconds_remaining,
    current_quarter,
    msf_id,
    espn_id
  FROM games
  WHERE season = ${season}
  ORDER BY ts, gid
) g;
`;

const teams = runPsqlJson(teamsQuery) ?? [];
const sourceGames = runPsqlJson(gamesQuery) ?? [];

if (!Array.isArray(teams) || teams.length === 0) {
  throw new Error(`Live dump returned no teams. Check LIVE_DATABASE_URL access.`);
}
if (!Array.isArray(sourceGames) || sourceGames.length === 0) {
  throw new Error(`Live dump returned no games for season ${season}.`);
}

const { transformedGames, offsetMs, minSourceTimestamp, anchorUtc: normalizedAnchorUtc } =
  applyFutureScheduleTransform({
    games: sourceGames,
    anchorUtc,
  });

const fixture = {
  metadata: {
    source: "live_database",
    generatedAtUtc: new Date().toISOString(),
    season,
    anchorUtc: normalizedAnchorUtc,
    minSourceTimestamp,
    offsetMs,
    teamCount: teams.length,
    gameCount: transformedGames.length,
  },
  season,
  teams,
  games: transformedGames,
};

const fixturePath = path.join(repoRoot, "supabase", "fixtures", `season-${season}.json`);
const defaultFixturePath = path.join(repoRoot, "supabase", "fixtures", "season-2025.json");
const rawSnapshotPath = path.join(
  repoRoot,
  "supabase",
  ".temp",
  `live-season-${season}.raw.json`,
);

ensureDir(path.dirname(fixturePath));
ensureDir(path.dirname(rawSnapshotPath));

fs.writeFileSync(
  rawSnapshotPath,
  JSON.stringify(
    {
      metadata: {
        source: "live_database_raw",
        generatedAtUtc: new Date().toISOString(),
        season,
      },
      season,
      teams,
      games: sourceGames,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

if (season === DEFAULT_CURRENT_SEASON && fixturePath !== defaultFixturePath) {
  fs.copyFileSync(fixturePath, defaultFixturePath);
}

const seedResult = writeSeedSqlFromFixture({
  fixturePath: defaultFixturePath,
  outputPath: path.join(repoRoot, "supabase", "seed.sql"),
});

console.log(`[e2e] Raw snapshot written to ${rawSnapshotPath}`);
console.log(`[e2e] Fixture written to ${fixturePath}`);
console.log(
  `[e2e] Seed generated at ${seedResult.outputPath} (${seedResult.teamCount} teams, ${seedResult.gameCount} games)`,
);
