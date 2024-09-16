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
      const viewerMember = ctx.dbUser?.leaguemembers.find((m) => m.league_id);
      if (!viewerMember) {
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

      const doneGidsForTheYear = await db.games.findMany({
        where: {
          season: viewerMember.leagues.season,
          done: true,
        },
        select: {
          gid: true,
        }
      })

      const doneGids = doneGidsForTheYear.map(g => g.gid);

      const picksGrouped = await db.picks.groupBy({
        by: "correct",
        where: {
          member_id: memberId,
          gid: {
            in: doneGids,
          }
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
