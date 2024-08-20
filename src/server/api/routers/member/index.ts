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
  updateOrCreateSuperbowlPick: authorizedProcedure
    .input(
      z.object({
        memberId: z.number().int(),
        winnerTeamId: z.number().int(),
        loserTeamId: z.number().int(),
        score: z.number().int().min(1).max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      const { memberId, winnerTeamId, loserTeamId, score } = input;
      const leagueMembmer = dbUser?.leaguemembers.find(
        (m) => m.membership_id === memberId,
      );
      if (!leagueMembmer || !dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not in that league (member ${memberId})`,
        });
      }

      const [existingSuperbowlPick, league] = await Promise.all([
        db.superbowl.findFirst({
          where: {
            member_id: memberId,
          },
        }),
        db.leagues.findFirstOrThrow({
          where: {
            league_id: leagueMembmer.league_id,
          },
        }),
      ]);

      if (!league.superbowl_competition) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Superbowl competition is not enabled for this league",
        });
      }

      if (existingSuperbowlPick) {
        await db.superbowl.update({
          where: {
            pickid: existingSuperbowlPick.pickid,
          },
          data: {
            winner: winnerTeamId,
            loser: loserTeamId,
            score,
          },
        });
      } else {
        await db.superbowl.create({
          data: {
            uid: dbUser.uid,
            score,
            member_id: memberId,
            winner: winnerTeamId,
            loser: loserTeamId,
          },
        });
      }
    }),
});
