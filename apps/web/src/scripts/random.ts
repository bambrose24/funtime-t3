import { db } from "~/server/db";
import { espn } from "~/server/services/espn";
async function run() {
  const week = 17;
  const season = 2025;
  const espnGamesSeason = await espn.getGamesBySeason({ season });

  const dbGames = await db.games.findMany({
    where: {
      week,
      season,
    },
  });
  const teams = await db.teams.findMany();

  const espnWeekGames = espnGamesSeason.filter(g => g.week.number === week)
  console.log('espnWeekGames...', espnWeekGames.length);

  const espnWeekGamesWithNoDbGames = espnWeekGames.filter(g => !dbGames.find(db => db.espn_id === Number(g.id)));
  console.log('espnWeekGamesWithNoDbGames...', espnWeekGamesWithNoDbGames.length);

  for (const toCreateEspnGame of espnWeekGamesWithNoDbGames) {

    const homeTeamAbbrev = toCreateEspnGame.competitions[0]?.competitors.find(c => c.homeAway === 'home')?.team.abbreviation;
    const homeTeamId = teams.find(t => t.abbrev === homeTeamAbbrev)?.teamid;
    const awayTeamAbbrev = toCreateEspnGame.competitions[0]?.competitors.find(c => c.homeAway === 'away')?.team.abbreviation;
    const awayTeamId = teams.find(t => t.abbrev === awayTeamAbbrev)?.teamid;

    if (!homeTeamId || !awayTeamId) {
      console.log('No home or away team found...', toCreateEspnGame)
      continue;
    }

    // await db.games.create({
    //   data: {
    //     espn_id: Number(toCreateEspnGame.id),
    //     week,
    //     season,
    //     home: homeTeamId,
    //     away: awayTeamId,
    //     homescore: 0,
    //     awayscore: 0,
    //     ts: new Date(toCreateEspnGame.date)
    //   }
    // })
  }

  for (const dbGame of dbGames) {
    const espnGame = espnGamesSeason.find(g => dbGame.espn_id && Number(g.id) === dbGame.espn_id)
    if (!espnGame) {
      console.log(`No game found... ${JSON.stringify(espnGame)}`);
    }

    if (dbGame.gid === 4245) {
      console.log('dbGame and espnGame...', dbGame, espnGame)
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("An error occurred:", e);
    process.exit(1);
  });
