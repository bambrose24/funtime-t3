import { publicCacheMiddleware } from "../../cache";
import { db } from "../../db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const teamsRouter = createTRPCRouter({
  // Test the new cache system with params strategy
  getTeams: publicProcedure
    .use(async (opts) => {
      return publicCacheMiddleware({
        by: "params",
        cacheTimeSeconds: 60 * 60,
        ...opts,
      });
    })
    .query(async () => {
      console.log("Executing getTeams query (cache miss)");
      return await db.teams.findMany();
    }),
});
