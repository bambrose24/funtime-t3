import { z } from "zod";
import {
  authorizedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../../trpc";
import { orderBy } from "lodash";
import { getGames } from "~/server/util/getGames";
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
  fromJoinCode: publicProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code } = input;
      const league = await ctx.db.leagues.findFirst({
        where: {
          share_code: code,
        },
      });
      if (!league) {
        return null;
      }
      return league;
    }),
  register: authorizedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        superbowl: z
          .object({
            winnerTeamId: z.number().int(),
            loserTeamId: z.number().int(),
            score: z.number().int().min(1),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      if (!dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const { code, superbowl } = input;
      const league = await ctx.db.leagues.findFirstOrThrow({
        where: {
          share_code: code,
        },
      });

      const isInLeague = dbUser.leaguemembers.find(
        (m) => m.league_id === league.league_id,
      );
      if (isInLeague) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `User ${dbUser.uid} is already in league ${league.league_id}`,
        });
      }

      if (league.superbowl_competition && !superbowl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Superbowl competition requires superbowl data`,
        });
      }

      const leagueMember = await ctx.db.leaguemembers.create({
        data: {
          league_id: league.league_id,
          user_id: dbUser.uid,
          role: "player",
        },
      });

      if (superbowl) {
        await ctx.db.superbowl.create({
          data: {
            winner: superbowl.winnerTeamId,
            loser: superbowl.loserTeamId,
            uid: dbUser.uid,
            season: league.season,
            member_id: leagueMember.membership_id,
            score: superbowl.score,
          },
        });
      }

      return leagueMember;
    }),
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
      const { db } = ctx;
      const usersLeagueIds = (
        ctx.dbUser?.leaguemembers.map((m) => m.league_id) ?? []
      ).filter(Defined);
      if (!usersLeagueIds.includes(leagueId)) {
        throw UnauthorizedError;
      }
      return await db.leagues.findFirstOrThrow({
        where: {
          league_id: leagueId,
        },
      });
    }),
  members: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ input, ctx }) => {
      const { leagueId } = input;
      const { db } = ctx;
      const usersLeagueIds = (
        ctx.dbUser?.leaguemembers.map((m) => m.league_id) ?? []
      ).filter(Defined);
      if (!usersLeagueIds.includes(leagueId)) {
        throw UnauthorizedError;
      }
      return await db.leaguemembers.findMany({
        where: {
          league_id: leagueId,
        },
        include: {
          people: true,
        },
      });
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
          ts: {
            gte: new Date(),
          },
        },
        orderBy: {
          ts: "asc",
        },
      });

      if (!mostRecentUnstartedGame) {
        return { week: null, season: null, games: [] };
      }

      const { week } = mostRecentUnstartedGame;

      const gamesResp = await ctx.db.games.findMany({
        where: {
          season,
          week,
        },
      });

      const games = orderBy(
        gamesResp,
        [(g) => g.is_tiebreaker, (g) => g.ts, (g) => g.gid],
        ["asc", "asc", "asc"],
      );

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
    .query(async ({ input, ctx }) => {
      const { dbUser, db } = ctx;
      const { leagueId, week } = input;
      const viewerMember = dbUser?.leaguemembers.find(
        (m) => m.league_id === leagueId,
      );
      if (!viewerMember) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not in the league (league ${leagueId} user ${dbUser?.uid})`,
        });
      }
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

      const viewerMemberPicks = memberPicks.find(
        (mp) => mp.membership_id === viewerMember.membership_id,
      );
      const viewerHasPicks = Boolean(viewerMemberPicks?.picks?.length);
      const firstGameTs = orderBy(games, (g) => g.ts, "asc").at(0)?.ts;
      const weekStarted = firstGameTs && firstGameTs < new Date();

      const gidToIndex = games.reduce((prev, curr, idx) => {
        prev.set(curr.gid, idx);
        return prev;
      }, new Map<number, number>());

      const mps = memberPicks.map((mp) => {
        mp.picks = orderBy(
          mp.picks,
          [(p) => gidToIndex.get(p.gid), (p) => p.gid],
          ["asc", "asc"],
        );
        mp.picks = mp.picks.map((p) => {
          if (
            (!viewerHasPicks || !weekStarted) &&
            mp.membership_id !== viewerMember.membership_id
          ) {
            return { ...p, winner: null, correct: null, score: null };
          }
          return p;
        });
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
