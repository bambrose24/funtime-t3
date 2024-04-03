import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { getGames } from "~/server/util/getGames";

const currentWeekSeasonInputSchema = z.object({
  leagueId: z.number().int(),
});

export const timeRouter = createTRPCRouter({
  activeWeekByLeague: publicProcedure
    .input(currentWeekSeasonInputSchema)
    .query(async ({ input }) => {
      const { leagueId } = input;

      const league = await db.leagues.findFirstOrThrow({
        where: { league_id: leagueId },
      });

      const { season } = league;

      const gamesBySeason = await getGames({ season });

      const now = new Date();
      const firstGameIdxAfterNow = gamesBySeason.findIndex((g) => {
        return g.ts > now;
      });
      if (firstGameIdxAfterNow === -1) {
        return gamesBySeason.at(firstGameIdxAfterNow);
      }
      return gamesBySeason.at(firstGameIdxAfterNow - 1);
    }),
});
