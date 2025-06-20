import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const currentWeekSeasonInputSchema = z.object({
  leagueId: z.number().int(),
});

export const timeRouter = createTRPCRouter({
  activeWeekByLeague: publicProcedure
    .input(currentWeekSeasonInputSchema)
    .query(async ({ input, ctx }) => {
      const { leagueId } = input;

      const league = await db.leagues.findFirstOrThrow({
        where: { league_id: leagueId },
      });

      const { season } = league;

      const now = new Date();
      const mostRecentStartedGame = await ctx.db.games.findFirst({
        where: {
          season,
          ts: {
            lte: now,
          },
        },
        select: {
          week: true,
          ts: true,
        },
        orderBy: {
          ts: "desc",
        },
      });

      return mostRecentStartedGame;
    }),
});
