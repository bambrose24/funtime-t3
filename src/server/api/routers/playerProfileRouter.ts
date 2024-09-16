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
          leagues: true,
        },
      });
      if (member.league_id !== leagueId) {
        throw UnauthorizedError;
      }

      const doneGames = await db.games.findMany({
        where: {
          season: member.leagues.season,
          done: true,
        },
      });

      const doneGids = doneGames.map((g) => g.gid);

      const picks = await db.picks.findMany({
        where: {
          member_id: memberId,
          gid: {
            in: doneGids,
          },
        },
      });

      const correctPicks = picks.filter((p) => p.correct === 1).length;
      const wrongPicks = picks.filter((p) => p.correct !== 1).length;

      return { member, correctPicks, wrongPicks };
    }),
});
