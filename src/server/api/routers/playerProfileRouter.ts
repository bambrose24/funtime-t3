import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { UnauthorizedError } from "~/server/util/errors/unauthorized";

const getPlayerProfileSchema = z.object({
  leagueId: z.number().int(),
  memberId: z.number().int(),
});

export const playerProfileRouter = createTRPCRouter({
  get: publicProcedure
    .input(getPlayerProfileSchema)
    .query(async ({ ctx, input }) => {
      const { leagueId, memberId } = input;
      const { dbUser } = ctx;
      if (!dbUser) {
        throw UnauthorizedError;
      }
      const viewerLeagues = ctx.dbUser?.leaguemembers.map((m) => m.league_id);
      if (!viewerLeagues?.includes(leagueId)) {
        throw UnauthorizedError;
      }

      const member = await db.leaguemembers.findFirstOrThrow({
        where: { membership_id: memberId },
        include: {
          people: true,
          superbowl: true,
          WeekWinners: true,
          leaguemessages: true,
        },
      });
      if (member.league_id !== leagueId) {
        throw UnauthorizedError;
      }

      const [correctPicks, wrongPicks] = await Promise.all([
        db.picks.count({
          where: {
            correct: 1,
            member_id: memberId,
          },
        }),
        db.picks.count({ where: { correct: 0, member_id: memberId } }),
      ]);

      return { member, correctPicks, wrongPicks };
    }),
});
