import { groupBy, orderBy } from "lodash";

process.env.SKIP_ENV_VALIDATION ??= "1";

const DEFAULT_SEASON = 2026;
const EXPECTED_REGULAR_SEASON_GAMES = 272;
const EXPECTED_REGULAR_SEASON_WEEKS = 18;

function parseSeason(rawSeason: string | undefined) {
  if (!rawSeason) {
    return DEFAULT_SEASON;
  }

  const parsed = Number.parseInt(rawSeason, 10);
  if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= 3000) {
    return parsed;
  }

  throw new Error(`Invalid season value: ${rawSeason}`);
}

function getArgs() {
  const args = process.argv.slice(2);
  const seasonArg = args.find((arg) => !arg.startsWith("--"));

  return {
    season: parseSeason(seasonArg ?? process.env.FUNTIME_CURRENT_SEASON),
  };
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const { season } = getArgs();
  const { db } = await import("../server/db");

  console.log(`Validating imported NFL season ${season}...`);

  const [games, teams] = await Promise.all([
    db.games.findMany({
      where: { season },
      orderBy: [{ week: "asc" }, { ts: "asc" }, { gid: "asc" }],
      select: {
        gid: true,
        season: true,
        week: true,
        ts: true,
        home: true,
        away: true,
        homescore: true,
        awayscore: true,
        done: true,
        winner: true,
        is_tiebreaker: true,
        espn_id: true,
      },
    }),
    db.teams.findMany({
      select: {
        teamid: true,
        abbrev: true,
      },
    }),
  ]);

  assert(
    games.length === EXPECTED_REGULAR_SEASON_GAMES,
    `Expected ${EXPECTED_REGULAR_SEASON_GAMES} games for season ${season}, found ${games.length}`,
  );

  const gamesByWeek = groupBy(games, (game) => game.week);
  const weeks = Object.keys(gamesByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  assert(
    weeks.length === EXPECTED_REGULAR_SEASON_WEEKS,
    `Expected ${EXPECTED_REGULAR_SEASON_WEEKS} weeks, found ${weeks.length}`,
  );
  assert(weeks[0] === 1, `Expected first week to be 1, found ${weeks[0]}`);
  assert(
    weeks.at(-1) === EXPECTED_REGULAR_SEASON_WEEKS,
    `Expected last week to be ${EXPECTED_REGULAR_SEASON_WEEKS}, found ${weeks.at(-1)}`,
  );

  const teamIds = new Set(teams.map((team) => team.teamid));
  const missingTeamLinks = games.filter(
    (game) => !teamIds.has(game.home) || !teamIds.has(game.away),
  );
  assert(
    missingTeamLinks.length === 0,
    `Found ${missingTeamLinks.length} game(s) with missing home/away team links`,
  );

  const espnIds = games.map((game) => game.espn_id).filter((id) => id !== null);
  assert(
    espnIds.length === games.length,
    `Expected every game to have an espn_id, found ${espnIds.length}/${games.length}`,
  );
  assert(
    new Set(espnIds).size === espnIds.length,
    "Expected every imported game to have a unique espn_id",
  );

  const doneGames = games.filter((game) => game.done);
  assert(
    doneGames.length === 0,
    `Expected imported season to have no completed games, found ${doneGames.length}`,
  );

  const scoredGames = games.filter(
    (game) => (game.homescore ?? 0) !== 0 || (game.awayscore ?? 0) !== 0,
  );
  assert(
    scoredGames.length === 0,
    `Expected imported season scores to be 0-0, found ${scoredGames.length} scored game(s)`,
  );

  const invalidTeamGames = games.filter((game) => game.home === game.away);
  assert(
    invalidTeamGames.length === 0,
    `Expected no game to have the same home/away team, found ${invalidTeamGames.length}`,
  );

  const weekSummaries = weeks.map((week) => {
    const weekGames = gamesByWeek[week] ?? [];
    const tiebreakerCount = weekGames.filter(
      (game) => game.is_tiebreaker,
    ).length;
    assert(
      tiebreakerCount === 1,
      `Expected exactly one tiebreaker in week ${week}, found ${tiebreakerCount}`,
    );

    const sortedWeekGames = orderBy(weekGames, ["ts", "gid"], ["asc", "asc"]);
    return {
      week,
      games: weekGames.length,
      tiebreakers: tiebreakerCount,
      firstKickoff: sortedWeekGames.at(0)?.ts.toISOString(),
      lastKickoff: sortedWeekGames.at(-1)?.ts.toISOString(),
    };
  });

  const firstKickoff = games.at(0)?.ts;
  const lastKickoff = games.at(-1)?.ts;
  assert(firstKickoff, "Expected at least one first kickoff");
  assert(lastKickoff, "Expected at least one last kickoff");

  console.log(
    JSON.stringify(
      {
        season,
        games: games.length,
        teams: teams.length,
        firstKickoff: firstKickoff.toISOString(),
        lastKickoff: lastKickoff.toISOString(),
        weeks: weekSummaries,
      },
      null,
      2,
    ),
  );
  console.log(`Season ${season} import validation passed.`);
}

await run();
