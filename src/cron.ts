import { CronJob } from "cron";
import { msf } from "~/server/services/mysportsfeeds";
import { db } from "~/server/db";

const job = new CronJob(
  "*/5 * * * *", // cronTime: every 5 minutes
  async function () {
    const games = await db.games.count();
    console.log(`found ${games} games`);
  }, // onTick
  async () => {
    console.log("closing down cron");
  },
  false, // start
  "America/Los_Angeles", // timeZone
);
job.start();
