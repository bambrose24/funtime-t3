import { db } from "~/server/db";
import { espn } from "~/server/services/espn";
async function run() {
  const week = 2;
  const season = 2024;
  const espnGamesSeason = await espn.getGamesBySeason({ season });

  const dbGames = await db.games.findMany({
    where: {
      week,
      season,
    },
  });

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
