import { db } from "~/server/db";
import { msf } from "~/server/services/mysportsfeeds";
import { DEFAULT_SEASON } from "~/utils/const";

async function run() {
  console.log("starting cron...");
  const games = await db.games.count();

  const msfGames = await msf.getGamesBySeason({ season: 2023 });

  console.log(`newly found ${games} games and ${msfGames.length} MSF games`);
}

await run().catch((e) => {
  console.error("error running cron", e);
  process.exit(1);
});

process.exit(0);
