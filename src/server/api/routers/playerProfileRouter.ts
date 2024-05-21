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

      const picksGrouped = await db.picks.groupBy({
        by: "correct",
        where: {
          member_id: memberId,
          done: 1,
        },
        _count: true,
      });

      const correctPicks = picksGrouped
        .filter((p) => p.correct === 1)
        .reduce((prev, curr) => prev + curr._count, 0);
      const wrongPicks = picksGrouped
        .filter((p) => p.correct !== 1)
        .reduce((prev, curr) => prev + curr._count, 0);

      return { member, correctPicks: correctPicks, wrongPicks };
    }),
});
