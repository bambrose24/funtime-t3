import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const memberRouter = createTRPCRouter({
  picksForWeek: authorizedProcedure
    .input(
      z.object({
        week: z.number().int(),
        leagueId: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { dbUser, db } = ctx;
      if (!dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to do that",
        });
      }

      const member = dbUser.leaguemembers.find(
        (m) => m.league_id === input.leagueId,
      );

      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not in that league (league ${input.leagueId} user ${dbUser.uid})`,
        });
      }

      return await db.picks.findMany({
        where: {
          member_id: member.membership_id,
          week: input.week,
        },
      });
    }),
});
