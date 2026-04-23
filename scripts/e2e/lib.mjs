import fs from "node:fs";
import path from "node:path";

export const DEFAULT_CURRENT_SEASON = 2025;
export const DEFAULT_ANCHOR_UTC = "2026-09-11T00:00:00Z";

export function parseSeason(rawSeason, fallbackSeason = DEFAULT_CURRENT_SEASON) {
  const parsed = Number.parseInt(String(rawSeason ?? ""), 10);
  if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= 3000) {
    return parsed;
  }
  return fallbackSeason;
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sqlEscapeString(value) {
  return String(value).replace(/'/g, "''");
}

function sqlLiteral(value, options = {}) {
  const { type = "text" } = options;
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (type === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  if (type === "number") {
    if (!Number.isFinite(Number(value))) {
      throw new Error(`Expected numeric SQL literal, received: ${value}`);
    }
    return String(Number(value));
  }

  if (type === "timestamp") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Expected valid timestamp SQL literal, received: ${value}`);
    }
    return `'${date.toISOString()}'::timestamptz`;
  }

  return `'${sqlEscapeString(value)}'`;
}

function normalizeFixture(fixture) {
  if (!fixture || typeof fixture !== "object") {
    throw new Error("Fixture must be an object");
  }

  const teams = Array.isArray(fixture.teams) ? fixture.teams : [];
  const games = Array.isArray(fixture.games) ? fixture.games : [];

  if (teams.length === 0) {
    throw new Error("Fixture must include at least one team");
  }

  if (games.length === 0) {
    throw new Error("Fixture must include at least one game");
  }

  return {
    ...fixture,
    teams: teams
      .map((team) => ({
        teamid: Number(team.teamid),
        abbrev: team.abbrev ?? null,
        loc: team.loc,
        name: team.name,
        conference: team.conference ?? null,
        primary_color: team.primary_color ?? null,
        secondary_color: team.secondary_color ?? null,
        tertiary_color: team.tertiary_color ?? null,
      }))
      .sort((a, b) => a.teamid - b.teamid),
    games: games
      .map((game) => ({
        gid: Number(game.gid),
        season: Number(game.season),
        week: Number(game.week),
        ts: new Date(game.ts).toISOString(),
        home: Number(game.home),
        away: Number(game.away),
        homescore: Number(game.homescore ?? 0),
        awayscore: Number(game.awayscore ?? 0),
        done: Boolean(game.done ?? false),
        winner:
          game.winner === null || game.winner === undefined
            ? null
            : Number(game.winner),
        international: Boolean(game.international ?? false),
        seconds: Number(game.seconds),
        current_record: game.current_record ?? null,
        is_tiebreaker: Boolean(game.is_tiebreaker ?? false),
        homerecord: game.homerecord ?? null,
        awayrecord: game.awayrecord ?? null,
        current_quarter_seconds_remaining:
          game.current_quarter_seconds_remaining === null ||
          game.current_quarter_seconds_remaining === undefined
            ? null
            : Number(game.current_quarter_seconds_remaining),
        current_quarter:
          game.current_quarter === null || game.current_quarter === undefined
            ? null
            : Number(game.current_quarter),
        msf_id: game.msf_id === null || game.msf_id === undefined ? null : Number(game.msf_id),
        espn_id:
          game.espn_id === null || game.espn_id === undefined
            ? null
            : Number(game.espn_id),
      }))
      .sort((a, b) => {
        const tsDiff = new Date(a.ts).getTime() - new Date(b.ts).getTime();
        if (tsDiff !== 0) return tsDiff;
        return a.gid - b.gid;
      }),
  };
}

export function buildSeedSql(fixtureInput) {
  const fixture = normalizeFixture(fixtureInput);

  const sql = [];
  sql.push("-- Generated file. Do not edit by hand.");
  sql.push(`-- metadata: ${JSON.stringify(fixture.metadata ?? {})}`);
  sql.push("BEGIN;");
  sql.push(
    'TRUNCATE TABLE "picks", "superbowl", "leaguemessages", "WeekWinners", "EmailLogs", "leaguemembers", "leagues", "people", "postseason_team_seeds", "postseason_games", "games", "teams" RESTART IDENTITY CASCADE;',
  );

  sql.push("\n-- Teams");
  for (const team of fixture.teams) {
    sql.push(
      `INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (${sqlLiteral(team.teamid, { type: "number" })}, ${sqlLiteral(team.abbrev)}, ${sqlLiteral(team.loc)}, ${sqlLiteral(team.name)}, ${sqlLiteral(team.conference)}, ${sqlLiteral(team.primary_color)}, ${sqlLiteral(team.secondary_color)}, ${sqlLiteral(team.tertiary_color)});`,
    );
  }

  sql.push("\n-- Games");
  for (const game of fixture.games) {
    sql.push(
      `INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "homescore", "awayscore", "done", "winner", "international", "seconds", "current_record", "is_tiebreaker", "homerecord", "awayrecord", "current_quarter_seconds_remaining", "current_quarter", "msf_id", "espn_id") VALUES (${sqlLiteral(game.gid, { type: "number" })}, ${sqlLiteral(game.season, { type: "number" })}, ${sqlLiteral(game.week, { type: "number" })}, ${sqlLiteral(game.ts, { type: "timestamp" })}, ${sqlLiteral(game.home, { type: "number" })}, ${sqlLiteral(game.away, { type: "number" })}, ${sqlLiteral(game.homescore, { type: "number" })}, ${sqlLiteral(game.awayscore, { type: "number" })}, ${sqlLiteral(game.done, { type: "boolean" })}, ${sqlLiteral(game.winner, { type: "number" })}, ${sqlLiteral(game.international, { type: "boolean" })}, ${sqlLiteral(game.seconds, { type: "number" })}, ${sqlLiteral(game.current_record)}, ${sqlLiteral(game.is_tiebreaker, { type: "boolean" })}, ${sqlLiteral(game.homerecord)}, ${sqlLiteral(game.awayrecord)}, ${sqlLiteral(game.current_quarter_seconds_remaining, { type: "number" })}, ${sqlLiteral(game.current_quarter, { type: "number" })}, ${sqlLiteral(game.msf_id, { type: "number" })}, ${sqlLiteral(game.espn_id, { type: "number" })});`,
    );
  }

  sql.push("\n-- Keep SERIAL sequences aligned with fixture IDs");
  sql.push(
    `SELECT setval(pg_get_serial_sequence('"teams"', 'teamid'), COALESCE((SELECT MAX("teamid") FROM "teams"), 1), true);`,
  );
  sql.push(
    `SELECT setval(pg_get_serial_sequence('"games"', 'gid'), COALESCE((SELECT MAX("gid") FROM "games"), 1), true);`,
  );

  sql.push("COMMIT;");
  sql.push("");

  return sql.join("\n");
}

export function writeSeedSqlFromFixture({ fixturePath, outputPath }) {
  const fixture = readJsonFile(fixturePath);
  const sql = buildSeedSql(fixture);

  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, sql, "utf8");

  return {
    fixture,
    outputPath,
    teamCount: fixture.teams?.length ?? 0,
    gameCount: fixture.games?.length ?? 0,
  };
}

export function applyFutureScheduleTransform({ games, anchorUtc }) {
  if (!Array.isArray(games) || games.length === 0) {
    throw new Error("Cannot transform empty game list");
  }

  const minSourceTimestamp = Math.min(
    ...games.map((game) => new Date(game.ts).getTime()),
  );
  const anchorTimestamp = new Date(anchorUtc).getTime();

  if (Number.isNaN(anchorTimestamp)) {
    throw new Error(`Invalid E2E_SCHEDULE_ANCHOR_UTC value: ${anchorUtc}`);
  }

  const offsetMs = anchorTimestamp - minSourceTimestamp;

  const transformedGames = games.map((game) => {
    const shiftedDate = new Date(new Date(game.ts).getTime() + offsetMs);

    return {
      gid: Number(game.gid),
      season: Number(game.season),
      week: Number(game.week),
      ts: shiftedDate.toISOString(),
      home: Number(game.home),
      away: Number(game.away),
      homescore: 0,
      awayscore: 0,
      done: false,
      winner: 0,
      international: Boolean(game.international ?? false),
      seconds: Math.floor(shiftedDate.getTime() / 1000),
      current_record: game.current_record ?? "0-0,0-0",
      is_tiebreaker: Boolean(game.is_tiebreaker),
      homerecord: game.homerecord ?? null,
      awayrecord: game.awayrecord ?? null,
      current_quarter_seconds_remaining: null,
      current_quarter: null,
      msf_id: game.msf_id ?? null,
      espn_id: game.espn_id ?? null,
    };
  });

  transformedGames.sort((a, b) => {
    const tsDiff = new Date(a.ts).getTime() - new Date(b.ts).getTime();
    if (tsDiff !== 0) return tsDiff;
    return a.gid - b.gid;
  });

  return {
    transformedGames,
    anchorUtc: new Date(anchorTimestamp).toISOString(),
    offsetMs,
    minSourceTimestamp: new Date(minSourceTimestamp).toISOString(),
  };
}
