import { TRPCError } from "@trpc/server";
import { groupBy } from "lodash";
import { z } from "zod";

import { authorizedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { resendApi } from "~/server/services/resend";
import { getLogger } from "~/utils/logging";

const pickSchema = z.object({
  gid: z.number().int(),
  winner: z.number().int(),
  score: z.number().int().min(1).max(200).optional(),
  isRandom: z.boolean(),
});

const submitPicksSchema = z.object({
  overrideMemberId: z.number().int().optional(),
  picks: z.array(pickSchema),
  leagueIds: z.array(z.number().int()),
});

export const picksRouter = createTRPCRouter({
  weeksWithPicks: authorizedProcedure.input(z.object({
    leagueId: z.number(),
  })).query(async ({ ctx, input }) => {
    const member = ctx.dbUser?.leaguemembers.find(m => m.league_id === input.leagueId);

    if (!member) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not a member of this league",
      });
    }

    const picks = await ctx.db.picks.findMany({
      where: {
        member_id: member.membership_id,
      },
      select: {
        week: true,
      },
      distinct: ['week'],
    });

    const weeks = Array.from(new Set(picks.map(p => p.week))).sort((a, b) => a - b);
    console.log('weeksWithPicks', weeks)

    return { weeks }
  }),
  submitPicks: authorizedProcedure
    .input(submitPicksSchema)
    .mutation(async ({ ctx, input }) => {
      const { dbUser, db } = ctx;
      const { leagueIds } = input;
      if (!dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to do that",
        });
      }

      /**
       * If overrideMemberId and multiple leagueIds, dont allow
       */
      if (input.overrideMemberId && leagueIds.length > 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot override multiple leagues",
        });
      }

      const pickedGames = await db.games.findMany({
        where: {
          gid: {
            in: input.picks.map((p) => p.gid),
          },
        },
      });

      const memberInclude = {
        leagues: true,
      } satisfies NonNullable<
        Parameters<typeof db.leaguemembers.findFirstOrThrow>[0]
      >["include"];

      const [overrideMember, fullViewerMembers] = await Promise.all([
        input.overrideMemberId
          ? db.leaguemembers.findFirstOrThrow({
            where: {
              membership_id: input.overrideMemberId,
              league_id: leagueIds.at(0),
            },
            include: memberInclude,
          })
          : null,
        db.leaguemembers.findMany({
          where: {
            membership_id: {
              in: dbUser.leaguemembers.map((m) => m.membership_id),
            },
          },
          include: memberInclude,
        }),
      ]);

      const viewerMembers = fullViewerMembers.filter((m) =>
        leagueIds.includes(m.league_id),
      );

      if (!viewerMembers.length) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not a member of all of these leagues (user ${dbUser.uid} leagueIds ${input.leagueIds.join(",")})`,
        });
      }

      if (
        overrideMember &&
        viewerMembers.find((m) => m.league_id === overrideMember.league_id)
          ?.role !== "admin"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `The user ${dbUser.uid} is not an admin of the league ${leagueIds.at(0)}`,
        });
      }

      const members = overrideMember ? [overrideMember] : viewerMembers;

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

      const picksSearch: NonNullable<Parameters<typeof db.picks.findMany>[0]> =
      {
        where: {
          member_id: { in: members.map((m) => m.membership_id) },
          week: {
            in: weeks,
          },
        },
      };

      const existingPicks = await db.picks.findMany(picksSearch);
      const existingPicksByGid = groupBy(
        existingPicks,
        (p) => `${p.member_id}_${p.gid}`,
      );

      for (const member of members) {
        await db.$transaction(async (tx) => {
          const promises = [];

          for (const pick of finalPicks) {
            const game = gamesById[pick.gid]?.at(0);
            if (!game) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error finding game to save pick to ${pick.gid}`,
              });
            }
            const existingPick =
              existingPicksByGid[`${member.membership_id}_${game.gid}`]?.at(0);

            if (existingPick) {
              promises.push(tx.picks.update({
                data: {
                  winner: pick.winner,
                  score: pick.score,
                  gid: pick.gid,
                  is_random: pick.isRandom,
                },
                where: {
                  pickid: existingPick.pickid,
                },
              }));
            } else {
              promises.push(tx.picks.create({
                data: {
                  winner: pick.winner,
                  gid: pick.gid,
                  score: pick.score,
                  member_id: member.membership_id,
                  season: member.leagues.season,
                  uid: member.user_id,
                  is_random: pick.isRandom,
                  week: game.week,
                  ts: new Date(),
                  loser: game.away + game.home - pick.winner,
                },
              }));
            }
          }
          return await Promise.all(promises);
        });
      }

      const picksForWeeks = await db.picks.findMany({
        where: {
          ...picksSearch.where,
        },
        distinct: ["gid"],
      });

      getLogger().info(
        `picksForWeeksLength and picksSearch.where ${picksForWeeks.length}, ${JSON.stringify(picksSearch.where)}`,
      );

      await resendApi.sendWeekPicksEmail({
        leagueIds,
        pickIds: picksForWeeks.map((p) => p.pickid),
        userId: members.at(0)?.user_id ?? 0,
      });

      return { pickedGames, picks: picksForWeeks };
    }),
});
