import { unstable_cache } from "next/cache";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const REVALIDATE_SECONDS = 60 * 60; // 1 hour

export const teamsRouter = createTRPCRouter({
  getTeams: publicProcedure.query(async ({ ctx }) => {
    const getTeamsImpl = unstable_cache(
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
