import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cache } from "~/utils/cache";

export const teamsRouter = createTRPCRouter({
  getTeams: publicProcedure.query(async () => {
    const getTeamsImpl = cache(
      async () => {
        return await db.teams.findMany();
      },
      ["getTeams"],
      {
        revalidate: 60 * 60, // 1 hour
      },
    );
    return await getTeamsImpl();
  }),
});
