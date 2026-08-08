import { groupBy, orderBy } from "lodash";
import { CURRENT_SEASON } from "../utils/const";
import { Defined } from "../utils/defined";

process.env.SKIP_ENV_VALIDATION ??= "1";

function parseSeason(rawSeason: string | undefined) {
  if (!rawSeason) {
    return CURRENT_SEASON;
  }

  const parsed = Number.parseInt(rawSeason, 10);
  if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= 3000) {
    return parsed;
  }

  throw new Error(`Invalid season value: ${rawSeason}`);
}

function getArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const seasonArg = args.find((arg) => !arg.startsWith("--"));

  return {
    dryRun,
    season: parseSeason(seasonArg),
  };
}

async function run() {
  const { dryRun, season } = getArgs();
  const [{ db }, { espn }] = await Promise.all([
    import("../server/db"),
    import("../server/services/espn"),
  ]);

  const existingGames = await db.games.findMany({
    where: {
      season,
    },
  });

  if (existingGames.length) {
    throw new Error(
      `Found ${existingGames.length} games for season ${season} already`,
    );

    // Can uncomment to delete picks and games that already existed for a corrupted import

    // console.log("Deleting picks for games that already existed...");
    // /**
    //  * Delete picks that exist because the games got corrupted
    //  */
    // await db.picks.deleteMany({
    //   where: {
    //     gid: {
    //       in: existingGames.map((g) => g.gid),
    //     },
    //   },
    // });
    // await db.games.deleteMany({
    //   where: {
    //     gid: {
    //       in: existingGames.map((g) => g.gid),
    //     },
    //   },
    // });
  }

  console.log(
    dryRun
      ? `Running dry-run import for season ${season}...`
      : `Importing season ${season}...`,
  );

  // Get games from ESPN instead of MySportsFeeds
  const espnGamesResponse = await espn.getGamesBySeason({ season });
  console.log(
    `Found ${espnGamesResponse.length} total games from ESPN for season ${season}`,
  );

  // Filter out playoff games - only keep regular season games (weeks 1-18)
  const regularSeasonGames = espnGamesResponse.filter((game) => {
    const week = game.week?.number;
    return week && week >= 1 && week <= 18 && game.season.type === 2;
  });

  console.log(
    `Found ${regularSeasonGames.length} regular season games from ESPN for season ${season}`,
  );

  // Group games by week to determine tiebreaker games
  const groupedByWeek = groupBy(regularSeasonGames, (g) => g.week.number);

  // Determine tiebreaker games (last game of each week)
  const espnTiebreakerIds = new Set<string>();
  for (const groupedGames of Object.values(groupedByWeek)) {
    const sortedGames = orderBy(
      groupedGames,
      [(g) => new Date(g.date), (g) => g.id],
      ["asc", "asc"],
    );
    const lastGame = sortedGames.at(-1);
    if (lastGame) {
      espnTiebreakerIds.add(lastGame.id);
    }
  }

  const teams = await db.teams.findMany();
  const teamByAbbrev = groupBy(teams, (t) => t.abbrev);
  const rams = teamByAbbrev["LA"]?.at(0);
  const washington = teamByAbbrev["WAS"]?.at(0);
  teamByAbbrev["WSH"] = [washington].filter(Defined);
  teamByAbbrev["LAR"] = [rams].filter(Defined);

  const creates: Array<Parameters<typeof db.games.create>[0]> = [];
  for (const espnGame of regularSeasonGames) {
    // Extract team info from ESPN game data
    const homeTeamAbbrev = espnGame.competitions[0]?.competitors.find(
      (c) => c.homeAway === "home",
    )?.team.abbreviation;
    const awayTeamAbbrev = espnGame.competitions[0]?.competitors.find(
      (c) => c.homeAway === "away",
    )?.team.abbreviation;

    const homeTeam = teamByAbbrev[homeTeamAbbrev ?? ""]?.at(0);
    const awayTeam = teamByAbbrev[awayTeamAbbrev ?? ""]?.at(0);

    if (!homeTeam || !awayTeam) {
      console.warn(
        `Could not find teams for game ${espnGame.id}: ${awayTeamAbbrev} @ ${homeTeamAbbrev}`,
      );
      continue;
    }

    creates.push({
      data: {
        season,
        week: espnGame.week.number,
        ts: new Date(espnGame.date),
        espn_id: Number(espnGame.id),
        done: false,
        seconds: Math.round(new Date(espnGame.date).getTime() / 1000),
        is_tiebreaker: espnTiebreakerIds.has(espnGame.id),
        away: awayTeam.teamid,
        home: homeTeam.teamid,
        homescore: 0,
        awayscore: 0,
      },
    });
  }

  console.log(`going to create ${creates.length} regular season games...`);

  if (dryRun) {
    const byWeek = Object.entries(
      groupBy(creates, (create) => create.data.week),
    )
      .map(([week, weekCreates]) => ({
        week: Number(week),
        count: weekCreates.length,
        firstKickoff: orderBy(
          weekCreates,
          (create) => create.data.ts,
          "asc",
        ).at(0)?.data.ts,
        tiebreakerEspnId: weekCreates.find(
          (create) => create.data.is_tiebreaker,
        )?.data.espn_id,
      }))
      .sort((a, b) => a.week - b.week);

    console.log(
      JSON.stringify({ season, totalGames: creates.length, byWeek }, null, 2),
    );
    console.log("dry-run complete; no games were inserted.");
    return;
  }

  let i = 1;
  for (const create of creates) {
    console.log(
      `  creating game ${i} of ${creates.length} - Week ${create.data.week}`,
    );
    await db.games.create(create);
    i++;
  }

  console.log(
    `finished creating regular season games, season ${season} is imported!`,
  );
}

await run();
