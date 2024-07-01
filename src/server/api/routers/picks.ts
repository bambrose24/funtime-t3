import { TRPCError } from "@trpc/server";
import { groupBy } from "lodash";
import { z } from "zod";

import { authorizedProcedure, createTRPCRouter } from "~/server/api/trpc";

const pickSchema = z.object({
  gid: z.number().int(),
  winner: z.number().int(),
  score: z.number().int().min(1).max(200).optional(),
  isRandom: z.boolean(),
});

const submitPicksSchema = z.object({
  overrideMemberId: z.number().int().optional(),
  picks: z.array(pickSchema),
  leagueId: z.number().int(),
});

export const picksRouter = createTRPCRouter({
  submitPicks: authorizedProcedure
    .input(submitPicksSchema)
    .mutation(async ({ ctx, input }) => {
      const { dbUser, db } = ctx;
      const { leagueId } = input;
      if (!dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to do that",
        });
      }
      const pickedGames = await db.games.findMany({
        where: {
          gid: {
            in: input.picks.map((p) => p.gid),
          },
        },
      });

      const [overrideMember, viewerMember] = await Promise.all([
        input.overrideMemberId
          ? db.leaguemembers.findFirstOrThrow({
              where: {
                membership_id: input.overrideMemberId,
                league_id: leagueId,
              },
              include: {
                leagues: true,
              },
            })
          : null,
        db.leaguemembers.findFirstOrThrow({
          where: {
            membership_id:
              dbUser.leaguemembers.find((m) => m.league_id === leagueId)
                ?.membership_id ?? -1,
          },
          include: {
            leagues: true,
          },
        }),
      ]);

      if (overrideMember && viewerMember.role !== "admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `The viewer member ${viewerMember.membership_id} is not an admin of the league ${leagueId}`,
        });
      }
      const member = overrideMember ?? viewerMember;

      const gamesById = groupBy(pickedGames, (g) => g.gid);

      /**
       * Make sure every game with a score is actually a tiebreaker game
       */
      const picksWithScores = input.picks.filter((p) => p.score !== undefined);
      const picksWithScoresGids = picksWithScores.map((p) => p.gid);
      picksWithScoresGids.forEach((gid) => {
        const game = gamesById[gid]?.at(0);
        if (!game?.is_tiebreaker) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Gamd ID ${gid} is not a tiebreaker game`,
          });
        }
      });

      const now = new Date();

      /**
       * Filter out picks that have already happened (unless doing an override)
       */
      const finalPicks = input.overrideMemberId
        ? input.picks
        : input.picks.filter((p) => {
            const game = gamesById[p.gid]?.at(0);
            if (!game || game.ts < now) {
              return false;
            }
            return true;
          });

      const weeks = Array.from(new Set(pickedGames.map((g) => g.week)));
      const existingPicks = await db.picks.findMany({
        where: {
          member_id: member.membership_id,
          week: {
            in: weeks,
          },
        },
      });
      const existingPicksByGid = groupBy(existingPicks, (p) => p.gid);
      return { pickedGames };
      // await db.$transaction(async (tx) => {
      //   await Promise.all(
      //     finalPicks.map(async (pick) => {
      //       const game = gamesById[pick.gid]?.at(0);
      //       if (!game) {
      //         throw new TRPCError({
      //           code: "INTERNAL_SERVER_ERROR",
      //           message: `Error finding game to save pick to ${pick.gid}`,
      //         });
      //       }
      //       const existingPick = existingPicksByGid[game.gid]?.at(0);
      //       if (existingPick) {
      //         return tx.picks.update({
      //           data: {
      //             winner: pick.winner,
      //             score: pick.score,
      //             gid: pick.gid,
      //             is_random: pick.isRandom,
      //           },
      //           where: {
      //             pickid: existingPick.pickid,
      //           },
      //         });
      //       }
      //       return tx.picks.create({
      //         data: {
      //           winner: pick.winner,
      //           gid: pick.gid,
      //           score: pick.score,
      //           member_id: member.membership_id,
      //           season: member.leagues.season,
      //           uid: member.user_id,
      //           is_random: pick.isRandom,
      //           week: game.week,
      //           ts: new Date(),
      //           loser: game.away + game.home - pick.winner,
      //         },
      //       });
      //     }),
      //   );
      // });
      // return { pickedGames };
    }),
});
