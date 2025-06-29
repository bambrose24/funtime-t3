import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cache } from "~/utils/cache";

export const teamsRouter = createTRPCRouter({
  getTeams: publicProcedure.query(async ({ ctx }) => {
    const getTeamsImpl = cache(
      async () => {
        return await ctx.db.teams.findMany();
      },
      ["getTeams"],
      {
        revalidate: 60 * 60, // 1 hour
      },
    );
    return await getTeamsImpl();
  }),
});
