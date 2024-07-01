import { CronJob } from "cron";
import { db } from "./server/db";

const job = new CronJob(
  "*/5 * * * *", // cronTime: every 5 minutes
  function () {
    console.log("hello from cron after 5 minutes");
  }, // onTick
  async () => {
    const games = await db.games.count();
    console.log(`found ${games} games`);
  },
  false, // start
  "America/Los_Angeles", // timeZone
);
job.start();
