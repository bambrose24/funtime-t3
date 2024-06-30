import { CronJob } from "cron";

const job = new CronJob(
  "*/5 * * * *", // cronTime: every 5 minutes
  function () {
    console.log("hello from cron after 5 minutes");
  }, // onTick
  async () => {
    console.log("done with cron");
  },
  true, // start
  "America/Los_Angeles", // timeZone
);
