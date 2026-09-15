import { z } from "zod";

import { summarizePlayerProfile } from "../../../utils/playerProfileStats";
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
          people: { select: { username: true } },
          superbowl: { select: { winner: true, loser: true, score: true } },
          WeekWinners: { select: { week: true } },
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

      const [leagueMembers, doneGames] = await Promise.all([
        db.leaguemembers.findMany({
          where: { league_id: leagueId },
          select: { membership_id: true },
        }),
        db.games.findMany({
          where: {
            season: member.leagues.season,
            done: true,
          },
          select: { gid: true, week: true },
        }),
      ]);

      const doneGids = doneGames.map((game) => game.gid);
      const memberIds = leagueMembers.map(
        (leagueMember) => leagueMember.membership_id,
      );

      const [picks, correctGrouped] =
        doneGids.length === 0
          ? [[], []]
          : await Promise.all([
              db.picks.findMany({
                where: {
                  member_id: memberId,
                  gid: { in: doneGids },
                },
                select: {
                  gid: true,
                  week: true,
                  correct: true,
                  winner: true,
                },
              }),
              db.picks.groupBy({
                by: ["member_id"],
                where: {
                  member_id: { in: memberIds },
                  gid: { in: doneGids },
                  correct: 1,
                },
                _count: {
                  correct: true,
                },
              }),
            ]);

      const correctByMemberId = new Map<number, number>();
      for (const row of correctGrouped) {
        if (row.member_id == null) {
          continue;
        }
        correctByMemberId.set(row.member_id, row._count.correct);
      }

      const stats = summarizePlayerProfile({
        memberId,
        doneGames,
        picks,
        weekWinWeeks: member.WeekWinners.map((win) => win.week),
        memberIds,
        correctByMemberId,
      });

      return {
        member: {
          membership_id: member.membership_id,
          league_id: member.league_id,
          role: member.role,
          people: member.people,
          WeekWinners: member.WeekWinners,
          superbowl: superbowlPickHidden ? [] : member.superbowl,
        },
        superbowlPickHidden,
        ...stats,
      };
    }),
});
