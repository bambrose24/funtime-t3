import { z } from "zod";
import {
  authorizedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../../trpc";
import { db } from "~/server/db";
import _ from "lodash";
import { getGames } from "~/server/util/getGames";
import { cache } from "~/utils/cache";
import { TRPCError } from "@trpc/server";
import { Defined } from "~/utils/defined";
import { UnauthorizedError } from "~/server/util/errors/unauthorized";
import {
  LatePolicy,
  PickPolicy,
  ReminderPolicy,
  ScoringType,
} from "~/generated/prisma-client";
import { leagueAdminRouter } from "./admin";
import { DEFAULT_SEASON } from "~/utils/const";

const picksSummarySchema = z.object({
  leagueId: z.number().int(),
  week: z.number().int().optional(),
});

const leagueIdSchema = z.object({
  leagueId: z.number().int(),
});

export const leagueRouter = createTRPCRouter({
  admin: leagueAdminRouter,
  create: authorizedProcedure
    .input(
      z.object({
        name: z.string(),
        priorLeagueId: z.number().optional(),
        latePolicy: z
          .nativeEnum(LatePolicy)
          .default(LatePolicy.allow_late_and_lock_after_start),
        pickPolicy: z.nativeEnum(PickPolicy).default(PickPolicy.choose_winner),
        scoringType: z.nativeEnum(ScoringType).default(ScoringType.game_winner),
        reminderPolicy: z
          .nativeEnum(ReminderPolicy)
          .default(ReminderPolicy.three_hours_before),
        superbowlCompetition: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      if (!dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const response = await ctx.db.leagues.create({
        data: {
          name: input.name,
          season: DEFAULT_SEASON,
          prior_league_id: input.priorLeagueId ?? null,
          late_policy: input.latePolicy,
          pick_policy: input.pickPolicy,
          reminder_policy: input.reminderPolicy,
          superbowl_competition: input.superbowlCompetition,
          created_by_user_id: dbUser.uid,
          created_time: new Date(),
          leaguemembers: {
            create: {
              user_id: dbUser.uid,
              role: "admin",
            },
          },
        },
      });
      return response;
    }),
  get: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ input, ctx }) => {
      const { leagueId } = input;
      const getLeagueImpl = cache(
        async () => {
          const usersLeagueIds = (
            ctx.dbUser?.leaguemembers.map((m) => m.league_id) ?? []
          ).filter(Defined);
          if (!usersLeagueIds.includes(leagueId)) {
            throw UnauthorizedError;
          }
          return await db.leagues.findFirstOrThrow({
            where: {
              AND: [
                {
                  league_id: {
                    in: ctx.dbUser?.leaguemembers
                      .map((m) => m.league_id)
                      .filter(Defined),
                  },
                },
                {
                  league_id: leagueId,
                },
              ],
            },
          });
        },
        ["getLeague", leagueId.toString()],
        {
          revalidate: 60 * 60, // one hour, doesn't change much
        },
      );
      return await getLeagueImpl();
    }),
  weekToPick: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ input, ctx }) => {
      const { leagueId } = input;
      const member = ctx.dbUser?.leaguemembers.find(
        (m) => m.league_id === leagueId,
      );
      if (!member) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You are not in that league ${leagueId} user ${ctx.dbUser?.uid}`,
        });
      }

      const data = await ctx.db.leagues.findUnique({
        where: {
          league_id: leagueId,
        },
        select: {
          season: true,
        },
      });
      if (!data?.season) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const { season } = data;

      const mostRecentUnstartedGame = await ctx.db.games.findFirst({
        where: {
          season,
          // ts: {
          //   gte: new Date(),
          // },
        },
        orderBy: {
          ts: "asc",
        },
      });

      if (!mostRecentUnstartedGame) {
        return { week: null, season: null, games: [] };
      }

      const { week } = mostRecentUnstartedGame;

      const games = await ctx.db.games.findMany({
        where: {
          season,
          week,
        },
        orderBy: [
          {
            is_tiebreaker: "asc",
          },
          { ts: "asc" },
          { gid: "asc" },
        ],
      });

      const memberPicks = await ctx.db.picks.findMany({
        where: {
          gid: {
            in: games.map((g) => g.gid),
          },
          member_id: member.membership_id,
        },
      });

      return {
        season,
        week,
        games,
        picks: memberPicks,
      };
    }),
  picksSummary: publicProcedure
    .input(picksSummarySchema)
    .query(async ({ input }) => {
      const { leagueId, week } = input;

      const REVALIDATE_SECONDS = 60;
      const getLeagueData = cache(
        async () => {
          const weekWhere = week
            ? {
                where: {
                  week,
                },
              }
            : {};

          const { season } = await db.leagues.findFirstOrThrow({
            where: { league_id: leagueId },
          });

          const [memberPicks, games] = await Promise.all([
            db.leaguemembers.findMany({
              where: {
                league_id: leagueId,
              },
              include: {
                people: {
                  select: { username: true, email: true, uid: true },
                },
                picks: {
                  select: {
                    correct: true,
                    winner: true,
                    gid: true,
                    done: true,
                    pickid: true,
                    score: true,
                    is_random: true,
                  },
                  ...weekWhere,
                },
              },
            }),
            getGames({ season, week }),
          ]);

          const gidToIndex = games.reduce((prev, curr, idx) => {
            prev.set(curr.gid, idx);
            return prev;
          }, new Map<number, number>());

          const mps = memberPicks.map((mp) => {
            mp.picks = _.sortBy(
              mp.picks,
              [(p) => gidToIndex.get(p.gid), (p) => p.gid],
              ["asc", "asc"],
            );
            return {
              ...mp,
              correctPicks: mp.picks.reduce((prev, curr) => {
                return prev + (curr.correct ? 1 : 0);
              }, 0),
              gameIdToPick: mp.picks.reduce((prev, curr) => {
                prev.set(curr.gid, curr);
                return prev;
              }, new Map<number, (typeof mp.picks)[number]>()),
            };
          });
          return mps;
        },
        [
          "leagueRouter.picksSummary",
          leagueId.toString(),
          week ? week.toString() : "",
        ],
        {
          revalidate: REVALIDATE_SECONDS,
        },
      );
      return await getLeagueData();
    }),

  createForm: authorizedProcedure.query(() => {
    return {
      latePolicy: [
        LatePolicy.allow_late_and_lock_after_start,
        LatePolicy.close_at_first_game_start,
      ],
      pickPolicy: PickPolicy,
      reminderPolicy: ReminderPolicy,
      scoringType: ScoringType,
    };
  }),

  correctPickCount: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const { leagueId } = input;
      const member = dbUser?.leaguemembers.find(
        (m) => m.league_id === leagueId,
      );
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `User ${dbUser?.uid} is not in league ${leagueId}`,
        });
      }

      const [correct, wrong] = await Promise.all([
        ctx.db.picks.count({
          where: {
            correct: 1,
            done: 1,
            member_id: member.membership_id,
          },
        }),
        ctx.db.picks.count({
          where: {
            correct: 0,
            done: 1,
            member_id: member.membership_id,
          },
        }),
      ]);

      return { leagueId, correct, wrong, total: correct + wrong };
    }),
});
