#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_SEASON = 2026;

function parseSeason(rawSeason) {
  if (!rawSeason) {
    return DEFAULT_SEASON;
  }

  const parsed = Number.parseInt(String(rawSeason), 10);
  if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= 3000) {
    return parsed;
  }

  throw new Error(`Invalid season value: ${rawSeason}`);
}

function redactUrl(urlString) {
  try {
    const url = new URL(urlString);
    const dbName = url.pathname.replace(/^\//, "") || "(none)";
    const port = Number(url.port || "5432");
    return `${url.protocol}//${url.hostname}:${port}/${dbName}`;
  } catch {
    return "(invalid URL)";
  }
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const season = parseSeason(args[0] ?? process.env.FUNTIME_CURRENT_SEASON);
const databaseUrl =
  process.env.READONLY_DATABASE_URL ??
  process.env.VALIDATION_DATABASE_URL ??
  process.env.DATABASE_URL;
const allowEmpty = hasFlag("--allow-empty");
const allowWritePrivileges = hasFlag("--allow-write-privileges");

if (!databaseUrl) {
  throw new Error(
    "READONLY_DATABASE_URL, VALIDATION_DATABASE_URL, or DATABASE_URL is required. Prefer a dedicated read-only Postgres connection string.",
  );
}

function getPsqlConnection(rawUrl: string) {
  const url = new URL(rawUrl);
  const schema = url.searchParams.get("schema") ?? "public";
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
    throw new Error(`Unsupported schema name in database URL: ${schema}`);
  }

  url.searchParams.delete("schema");
  url.searchParams.delete("pgbouncer");
  url.searchParams.delete("connection_limit");
  url.searchParams.delete("pool_timeout");

  return {
    url: url.toString(),
    schema,
  };
}

function quoteIdent(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function qualifiedTable(schema: string, table: string) {
  return `${quoteIdent(schema)}.${quoteIdent(table)}`;
}

const connection = getPsqlConnection(databaseUrl);
const teamsTable = qualifiedTable(connection.schema, "teams");
const gamesTable = qualifiedTable(connection.schema, "games");
const searchPath =
  connection.schema === "public"
    ? quoteIdent("public")
    : `${quoteIdent(connection.schema)}, ${quoteIdent("public")}`;

const sql = `
BEGIN READ ONLY;
SET LOCAL search_path TO ${searchPath};
WITH target AS (
  SELECT ${season}::int AS season
),
privileges AS (
  SELECT
    has_table_privilege(current_user, '${teamsTable}', 'SELECT') AS can_select_teams,
    has_table_privilege(current_user, '${gamesTable}', 'SELECT') AS can_select_games,
    has_table_privilege(current_user, '${teamsTable}', 'INSERT') AS can_insert_teams,
    has_table_privilege(current_user, '${teamsTable}', 'UPDATE') AS can_update_teams,
    has_table_privilege(current_user, '${teamsTable}', 'DELETE') AS can_delete_teams,
    has_table_privilege(current_user, '${teamsTable}', 'TRUNCATE') AS can_truncate_teams,
    has_table_privilege(current_user, '${gamesTable}', 'INSERT') AS can_insert_games,
    has_table_privilege(current_user, '${gamesTable}', 'UPDATE') AS can_update_games,
    has_table_privilege(current_user, '${gamesTable}', 'DELETE') AS can_delete_games,
    has_table_privilege(current_user, '${gamesTable}', 'TRUNCATE') AS can_truncate_games,
    has_schema_privilege(current_user, '${connection.schema}', 'CREATE') AS can_create_public
),
stats AS (
  SELECT
    (SELECT COUNT(*)::int FROM "teams") AS team_count,
    (SELECT COUNT(*)::int FROM "games", target WHERE "games".season = target.season) AS game_count,
    (SELECT COUNT(DISTINCT week)::int FROM "games", target WHERE "games".season = target.season) AS week_count,
    (SELECT COUNT(*)::int FROM "games", target WHERE "games".season = target.season AND COALESCE(done, false) = true) AS done_count,
    (SELECT MIN(ts) FROM "games", target WHERE "games".season = target.season) AS first_game_ts,
    (SELECT MAX(ts) FROM "games", target WHERE "games".season = target.season) AS last_game_ts,
    (
      SELECT COUNT(*)::int
      FROM "games" g
      LEFT JOIN "teams" h ON h.teamid = g.home
      LEFT JOIN "teams" a ON a.teamid = g.away
      WHERE g.season = (SELECT season FROM target)
        AND (h.teamid IS NULL OR a.teamid IS NULL)
    ) AS games_with_missing_teams
),
weeks AS (
  SELECT COALESCE(json_agg(row_to_json(w) ORDER BY w.week), '[]'::json) AS value
  FROM (
    SELECT
      week,
      COUNT(*)::int AS game_count,
      MIN(ts) AS first_kickoff,
      MAX(ts) AS last_kickoff,
      COUNT(*) FILTER (WHERE COALESCE(is_tiebreaker, false))::int AS tiebreaker_count
    FROM "games", target
    WHERE "games".season = target.season
    GROUP BY week
  ) w
)
SELECT json_build_object(
  'role', current_user,
  'database', current_database(),
  'season', (SELECT season FROM target),
  'privileges', (SELECT row_to_json(privileges) FROM privileges),
  'stats', (SELECT row_to_json(stats) FROM stats),
  'weeks', (SELECT value FROM weeks)
)::text;
ROLLBACK;
`;

const raw = execFileSync(
  "psql",
  [connection.url, "-X", "-v", "ON_ERROR_STOP=1", "-qAt", "-c", sql],
  { encoding: "utf8" },
).trim();

const result = JSON.parse(raw);
const { privileges, stats } = result;
const hasWritePrivileges =
  privileges.can_insert_teams ||
  privileges.can_update_teams ||
  privileges.can_delete_teams ||
  privileges.can_truncate_teams ||
  privileges.can_insert_games ||
  privileges.can_update_games ||
  privileges.can_delete_games ||
  privileges.can_truncate_games ||
  privileges.can_create_public;

if (!privileges.can_select_teams || !privileges.can_select_games) {
  throw new Error(
    "Read-only validation failed: role cannot SELECT both public.teams and public.games.",
  );
}

if (!allowWritePrivileges && hasWritePrivileges) {
  throw new Error(
    "Read-only validation failed: role still has write/create privileges on public teams/games. Pass --allow-write-privileges only for diagnostics.",
  );
}

if (!allowEmpty && stats.game_count === 0) {
  throw new Error(
    `Read-only validation failed: no games found for season ${season}. Pass --allow-empty for a pre-import access check.`,
  );
}

console.log(
  `[season-readonly] Connected as ${result.role} to ${redactUrl(databaseUrl)}`,
);
console.log(
  `[season-readonly] season=${season} teams=${stats.team_count} games=${stats.game_count} weeks=${stats.week_count} done=${stats.done_count}`,
);
console.log(
  `[season-readonly] first=${stats.first_game_ts ?? "(none)"} last=${stats.last_game_ts ?? "(none)"} missingTeamLinks=${stats.games_with_missing_teams}`,
);
console.log("[season-readonly] week breakdown:");
for (const week of result.weeks) {
  console.log(
    `  week ${week.week}: games=${week.game_count}, tiebreakers=${week.tiebreaker_count}, first=${week.first_kickoff}, last=${week.last_kickoff}`,
  );
}
