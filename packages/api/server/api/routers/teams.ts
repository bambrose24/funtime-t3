import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { publicCacheMiddleware } from "../../cache";

const SECONDS_IN_HOUR = 60 * 60;

export const teamsRouter = createTRPCRouter({
  // Test the new cache system with params strategy
  getTeams: publicProcedure
    .use(async (opts) => {
      return publicCacheMiddleware({
        by: "params",
        cacheTimeSeconds: SECONDS_IN_HOUR,
        ...opts,
      });
    })
    .query(async () => {
      console.log("Executing getTeams query (cache miss)");
      return await db.teams.findMany();
    }),
});
