import { z } from "zod";

import {
  canViewSuperbowlPrediction,
  hasSeasonKickedOff,
} from "../../../utils/superbowlVisibility";
import { UnauthorizedError } from "../../util/errors/unauthorized";
import { createTRPCRouter, publicProcedure } from "../trpc";

const getPlayerProfileSchema = z.object({
  leagueId: z.number().int(),
  memberId: z.number().int(),
});

export const playerProfileRouter = createTRPCRouter({
  get: publicProcedure
    .input(getPlayerProfileSchema)
    .query(async ({ ctx, input }) => {
      const { leagueId, memberId } = input;
      const { dbUser, db } = ctx;
      if (!dbUser) {
        throw UnauthorizedError;
      }
      const viewerMember = dbUser.leaguemembers.find(
        (membership) => membership.league_id === leagueId,
      );
      if (!viewerMember) {
        throw UnauthorizedError;
      }

      const member = await db.leaguemembers.findFirstOrThrow({
        where: { membership_id: memberId },
        select: {
          membership_id: true,
          league_id: true,
          role: true,
          people: { select: { username: true, email: true } },
          superbowl: { select: { winner: true, loser: true, score: true } },
          WeekWinners: { select: { week: true } },
          leaguemessages: { select: { message_id: true } },
          leagues: { select: { season: true } },
        },
      });
      if (member.league_id !== leagueId) {
        throw UnauthorizedError;
      }

      const superbowlPickHidden = !canViewSuperbowlPrediction(
        viewerMember.membership_id,
        member.membership_id,
        await hasSeasonKickedOff(db, member.leagues.season),
      );

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

      return {
        member: {
          ...member,
          superbowl: superbowlPickHidden ? [] : member.superbowl,
        },
        superbowlPickHidden,
        correctPicks,
        wrongPicks,
      };
    }),
});
