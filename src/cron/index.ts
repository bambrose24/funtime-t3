import { db } from "~/server/db";

async function run() {
  console.log("starting cron...");
  const games = await db.games.count();
  console.log(`newly found ${games} games`);
}

await run().catch((e) => {
  console.error("error running cron", e);
  process.exit(1);
});

process.exit(0);
