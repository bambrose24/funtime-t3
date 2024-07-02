import { groupBy, orderBy, sortBy } from "lodash";
import { db } from "~/server/db";
import { msf } from "~/server/services/mysportsfeeds";

async function run() {
  const season = 2024;
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

  const msfGamesResponse = await msf.getGamesBySeason({ season });

  const groupedByWeek = groupBy(msfGamesResponse, (g) => g.schedule.week);

  const msfTiebreakerIds = new Set<number>();
  for (const groupedGames of Object.values(groupedByWeek)) {
    const sortedGames = orderBy(
      groupedGames,
      [(g) => new Date(g.schedule.startTime), (g) => g.schedule.id],
      ["asc", "asc"],
    );
    const lastGame = sortedGames.at(-1);
    if (lastGame) {
      msfTiebreakerIds.add(lastGame.schedule.id);
    }
  }

  const teams = await db.teams.findMany();
  const teamByAbbrev = groupBy(teams, (t) => t.abbrev);

  const creates: Array<Parameters<typeof db.games.create>[0]> = [];
  for (const msfGame of msfGamesResponse) {
    const homeTeam =
      teamByAbbrev[msfGame.schedule.homeTeam.abbreviation]?.at(0);
    const awayTeam =
      teamByAbbrev[msfGame.schedule.awayTeam.abbreviation]?.at(0);

    if (!homeTeam || !awayTeam) {
      throw new Error("Could not find home team");
    }

    creates.push({
      data: {
        season,
        week: msfGame.schedule.week,
        ts: new Date(msfGame.schedule.startTime),
        msf_id: msfGame.schedule.id,
        done: false,
        seconds: Math.round(
          new Date(msfGame.schedule.startTime).getTime() / 1000,
        ),
        is_tiebreaker: msfTiebreakerIds.has(msfGame.schedule.id),
        away: awayTeam.teamid,
        home: homeTeam.teamid,
      },
    });
  }

  console.log(`going to create ${creates.length} games...`);
  let i = 1;
  for (const create of creates) {
    console.log(`  creating game ${i} of ${creates.length}`);
    await db.games.create(create);
    i++;
  }

  console.log(`finished creating games, season ${season} is imported!`);
}

await run();
