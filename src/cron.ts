import { msf } from "~/server/services/mysportsfeeds";
import { db } from "~/server/db";

async function run() {
  console.log("starting cron...");
  const games = await db.games.count();
  console.log(`found ${games} games`);
}

run().catch((e) => {
  console.error("error running cron", e);
});
