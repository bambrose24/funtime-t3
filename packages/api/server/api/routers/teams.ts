import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { createCacheMiddleware } from "../../middleware/cache";

export const teamsRouter = createTRPCRouter({
  // Test the new cache system with params strategy
  getTeams: publicProcedure
    .use(createCacheMiddleware({ by: "params", cacheTimeSeconds: 300 }))
    .query(async () => {
      console.log("Executing getTeams query (cache miss)");
      return await db.teams.findMany();
    }),
});
