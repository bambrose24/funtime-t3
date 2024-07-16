import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  leagueWeekMessageBoard: authorizedProcedure
    .input(
      z.object({
        leagueId: z.number().int(),
        week: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const { leagueId, week } = input;
      if (!dbUser?.leaguemembers.some((m) => m.league_id === leagueId)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a part of that league",
        });
      }

      return await ctx.db.leaguemessages.findMany({
        where: {
          week,
          league_id: leagueId,
          status: "PUBLISHED",
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          leaguemembers: {
            include: {
              people: true,
            },
          },
        },
      });
    }),
});
