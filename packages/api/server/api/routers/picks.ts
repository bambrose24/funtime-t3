import { TRPCError } from "@trpc/server";
import { groupBy } from "lodash";
import { z } from "zod";

import { getLogger } from "../../../utils/logging";
import {
  getWeekPickDeadline,
  isPickLocked,
} from "../../../utils/pickPermissions";
import { resendApi } from "../../services/resend";
import { authorizedProcedure, createTRPCRouter } from "../trpc";

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
  weeksWithPicks: authorizedProcedure
    .input(
      z.object({
        leagueId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = ctx.dbUser?.leaguemembers.find(
        (m) => m.league_id === input.leagueId,
      );

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
        distinct: ["week"],
      });

      const weeks = Array.from(new Set(picks.map((p) => p.week))).sort(
        (a, b) => a - b,
      );

      return { weeks };
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

      const weeks = Array.from(new Set(pickedGames.map((g) => g.week)));
      const policyMembers = members.filter(
        (m) => m.leagues.late_policy === "close_at_first_game_start",
      );
      const schedule = policyMembers.length
        ? await db.games.findMany({
            where: {
              season: { in: policyMembers.map((m) => m.leagues.season) },
              week: { in: weeks },
            },
            select: { season: true, week: true, ts: true },
          })
        : [];
      const now = new Date();
      const closedMembers = policyMembers.filter((member) =>
        weeks.some((week) => {
          const deadline = getWeekPickDeadline(
            member.leagues.late_policy,
            schedule.filter(
              (game) =>
                game.season === member.leagues.season && game.week === week,
            ),
          );
          return (
            deadline &&
            isPickLocked(
              deadline,
              now,
              overrideMember ? dbUser.email : undefined,
            )
          );
        }),
      );
      const closedMemberIds = new Set(
        closedMembers.map((member) => member.membership_id),
      );
      const eligibleMembers = members.filter(
        (member) => !closedMemberIds.has(member.membership_id),
      );
      const outcomes = members.map((member) =>
        closedMemberIds.has(member.membership_id)
          ? {
              leagueId: member.league_id,
              leagueName: member.leagues.name,
              status: "skipped" as const,
              reason: "first_kickoff" as const,
            }
          : {
              leagueId: member.league_id,
              leagueName: member.leagues.name,
              status: "saved" as const,
            },
      );
      if (!eligibleMembers.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Weekly picks closed at the first kickoff for: ${closedMembers.map((m) => m.leagues.name).join(", ")}. No picks were saved.`,
        });
      }

      // Reject the whole override before any writes, even if it also contains
      // open games. The bulk endpoint must honor the dedicated editor's lock.
      if (
        overrideMember &&
        pickedGames.some((game) => isPickLocked(game.ts, now, dbUser.email))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "League admins cannot edit picks after kickoff",
        });
      }

      /**
       * Filter out picks that have already happened (unless doing an override)
       */
      const finalPicks = input.overrideMemberId
        ? input.picks
        : input.picks.filter((p) => {
            const game = gamesById[p.gid]?.at(0);
            if (!game || isPickLocked(game.ts, now)) {
              return false;
            }
            return true;
          });

      const picksSearch: NonNullable<Parameters<typeof db.picks.findMany>[0]> =
        {
          where: {
            member_id: { in: eligibleMembers.map((m) => m.membership_id) },
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

      for (const member of eligibleMembers) {
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
              promises.push(
                tx.picks.update({
                  data: {
                    winner: pick.winner,
                    score: pick.score,
                    gid: pick.gid,
                    is_random: pick.isRandom,
                  },
                  where: {
                    pickid: existingPick.pickid,
                  },
                }),
              );
            } else {
              promises.push(
                tx.picks.create({
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
                }),
              );
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
        leagueIds: eligibleMembers.map((member) => member.league_id),
        pickIds: picksForWeeks.map((p) => p.pickid),
        userId: eligibleMembers.at(0)?.user_id ?? 0,
      });

      return { pickedGames, picks: picksForWeeks, outcomes };
    }),
});
