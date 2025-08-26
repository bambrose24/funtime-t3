import { db, espn } from "../server/db";
import { groupBy } from "lodash";
import orderBy from "lodash/orderBy";

async function run() {
  const season = 2024;
  // const week = 2;

  try {
    const espnGamesResponse = orderBy(
      await espn.getGamesBySeason({ season }),
      (g) => new Date(g.date),
      "asc",
    );

    console.log(`Retrieved ${espnGamesResponse.length} games:`);

    const dbGames = await db.games.findMany({
      where: {
        season,
      },
      orderBy: {
        ts: "asc",
      },
    });
    const teams = await db.teams.findMany();

    const teamByAbbrev = groupBy(teams, (t) => t.abbrev);

    const noMatchGids = [] as number[];

    for (const dbGame of dbGames) {
      const espnGame = espnGamesResponse.find((g) => {
        const competition = g.competitions.at(0);
        const espnGameWeek = g.week.number;
        const homeTeam = competition?.competitors.find(
          (c) => c.homeAway === "home",
        );
        const awayTeam = competition?.competitors.find(
          (c) => c.homeAway === "away",
        );

        const homeAbbrev = homeTeam?.team.abbreviation
          ? espn.translateAbbreviation(homeTeam.team.abbreviation)
          : null;
        const awayAbbrev = awayTeam?.team.abbreviation
          ? espn.translateAbbreviation(awayTeam.team.abbreviation)
          : null;

        const homeDbTeam = homeAbbrev ? teamByAbbrev[homeAbbrev]?.at(0) : null;
        const awayDbTeam = awayAbbrev ? teamByAbbrev[awayAbbrev]?.at(0) : null;

        const result =
          homeDbTeam?.teamid === dbGame.home &&
          awayDbTeam?.teamid === dbGame.away &&
          dbGame.week === espnGameWeek;
        return result;
      });
      if (espnGame && Number(espnGame.id)) {
        // const espnGameId = Number(espnGame.id);
        console.log(
          `found espnGame with id ${espnGame.id} for dbGame ${dbGame.gid}`,
        );
        // await db.games.update({
        //   where: {
        //     gid: dbGame.gid,
        //   },
        //   data: {
        //     espn_id: espnGameId,
        //   }
        // });
      } else {
        console.log(`   did not find espnGame for dbGame ${dbGame.gid}`);
        noMatchGids.push(dbGame.gid);
      }
    }
    console.log(`Number of games without a match: ${noMatchGids.length}`);

    // console.log("\nAll ESPN Games:");
    // espnGamesResponse.forEach((game, index) => {
    //   const competition = game.competitions[0];
    //   const homeTeam = competition?.competitors.find(c => c.homeAway === 'home')?.team;
    //   const awayTeam = competition?.competitors.find(c => c.homeAway === 'away')?.team;

    //   console.log(`Game ${index + 1}:`);
    //   console.log(`  ESPN ID: ${game.id}`);
    //   console.log(`  Week: ${game.week.number}`);
    //   console.log(`  Home Team: ${homeTeam?.displayName} (${homeTeam?.abbreviation})`);
    //   console.log(`  Away Team: ${awayTeam?.displayName} (${awayTeam?.abbreviation})`);
    //   console.log(`  Date: ${new Date(game.date).toLocaleString()}`);
    //   console.log(`  Status: ${game.status.type.name}`);
    //   console.log('---');
    // });
  } catch (error) {
    console.error("Error fetching games:", error);
  }
}

await run();
