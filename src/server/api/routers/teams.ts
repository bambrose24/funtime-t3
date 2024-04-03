import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cache } from "~/utils/cache";

const REVALIDATE_SECONDS = 60 * 60; // 1 hour

export const teamsRouter = createTRPCRouter({
  getTeams: publicProcedure.query(async () => {
    const getTeamsImpl = cache(
      async () => {
        return await db.teams.findMany();
      },
      ["getTeams"],
      {
        revalidate: REVALIDATE_SECONDS,
      },
    );
    return await getTeamsImpl();
  }),
});
