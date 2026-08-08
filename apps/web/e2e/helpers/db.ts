import { execFileSync } from "node:child_process";

const localDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
const databaseUrl = process.env.SUPABASE_DB_URL ?? localDatabaseUrl;

if (databaseUrl !== localDatabaseUrl) {
  throw new Error(`[web-e2e] Refusing non-local database URL: ${databaseUrl}`);
}

export function queryScalar(sql: string) {
  return execFileSync(
    "psql",
    [databaseUrl, "-v", "ON_ERROR_STOP=1", "-qAt", "-c", sql],
    { encoding: "utf8" },
  ).trim();
}

export function executeSql(sql: string) {
  execFileSync(
    "psql",
    [databaseUrl, "-v", "ON_ERROR_STOP=1", "-q", "-c", sql],
    {
      stdio: "pipe",
    },
  );
}

export function getLeagueId(shareCode: string) {
  if (!/^E2E[A-Z]+$/.test(shareCode)) {
    throw new Error(`Unexpected E2E share code: ${shareCode}`);
  }
  const leagueId = Number(
    queryScalar(
      `SELECT "league_id" FROM "leagues" WHERE "share_code" = '${shareCode}'`,
    ),
  );
  if (!Number.isInteger(leagueId)) {
    throw new Error(`Unable to resolve league ${shareCode}`);
  }
  return leagueId;
}
