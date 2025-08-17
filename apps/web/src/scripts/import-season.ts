import { prisma as db, espn } from "@funtime/api";
import { groupBy, orderBy } from "lodash";

async function run() {
  const season = 2025;
  const existingGames = await db.games.findMany({
    where: {
      season,
    },
  });
  if (existingGames.length) {
    throw new Error(
      `Found ${existingGames.length} games for season ${season} already`,
    );
  }

  console.log("can make games!");

  // Get games from ESPN instead of MySportsFeeds
  const espnGamesResponse = await espn.getGamesBySeason({ season });
  console.log(
    `Found ${espnGamesResponse.length} games from ESPN for season ${season}`,
  );

  // Group games by week to determine tiebreaker games
  const groupedByWeek = groupBy(espnGamesResponse, (g) => g.week.number);

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

  const creates: Array<Parameters<typeof db.games.create>[0]> = [];
  for (const espnGame of espnGamesResponse) {
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

  console.log(`going to create ${creates.length} games...`);
  let i = 1;
  for (const create of creates) {
    console.log(
      `  creating game ${i} of ${creates.length} - Week ${create.data.week}`,
    );
    await db.games.create(create);
    i++;
  }

  console.log(`finished creating games, season ${season} is imported!`);
}

await run();
