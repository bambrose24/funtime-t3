import { TRPCError } from "@trpc/server";
import { orderBy } from "lodash";
import { z } from "zod";
import {
  LatePolicy,
  LeagueStatus,
  MemberRole,
  PickPolicy,
  ReminderPolicy,
  ScoringType,
} from "../../../../src/generated/prisma-client";
import {
  CAN_CREATE_NEXT_SEASON_LEAGUES,
  DEFAULT_SEASON,
} from "../../../../utils/const";
import { Defined } from "../../../../utils/defined";
import { authorizedCacheMiddleware } from "../../../cache";
import { resendApi } from "../../../services/resend";
import { UnauthorizedError } from "../../../util/errors/unauthorized";
import { getGames } from "../../../util/getGames";
import {
  authorizedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../../trpc";
import { leagueAdminRouter } from "./admin";
import {
  getRenewalIneligibilityReason,
  isLeagueAdmin,
  suggestRenewalLeagueName,
} from "./renewal";

const SUPER_ADMIN_EMAIL = "bambrose24@gmail.com";

const isSuperAdminUser = (email?: string | null) => {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL;
};

const picksSummarySchema = z.object({
  leagueId: z.number().int(),
  week: z.number().int(), // only allowed for specific week because otherwise the response is too big and hangs forever
});

const leagueIdSchema = z.object({
  leagueId: z.number().int(),
});

export const leagueRouter = createTRPCRouter({
  admin: leagueAdminRouter,
  renewalStatus: authorizedProcedure.query(() => {
    return { isOpen: CAN_CREATE_NEXT_SEASON_LEAGUES };
  }),
  canCreate: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.dbUser) {
      return false;
    }

    return true;

    // TODO: can this be faster?
    // const lastStarted = await ctx.db.games.findFirst({
    //   where: {
    //     ts: {
    //       lte: new Date(),
    //     },
    //     season: {
    //       gte: DEFAULT_SEASON - 1,
    //     },
    //   },
    //   orderBy: {
    //     ts: "desc",
    //   },
    // });

    // if (!lastStarted || lastStarted.season >= DEFAULT_SEASON) {
    //   return false;
    // }
    // return true;
  }),
  renewalCandidates: authorizedProcedure.query(async ({ ctx }) => {
    const { db, dbUser } = ctx;
    if (!dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (!CAN_CREATE_NEXT_SEASON_LEAGUES) {
      return [];
    }

    const priorAdminLeagues = await db.leagues.findMany({
      where: {
        season: {
          lt: DEFAULT_SEASON,
        },
        status: LeagueStatus.completed,
        leaguemembers: {
          some: {
            user_id: dbUser.uid,
            role: MemberRole.admin,
          },
        },
      },
      include: {
        _count: {
          select: {
            leaguemembers: true,
          },
        },
        leaguemembers: {
          select: {
            role: true,
          },
        },
        future_leagues: {
          where: {
            season: DEFAULT_SEASON,
          },
          take: 1,
        },
      },
      orderBy: [
        {
          season: "desc",
        },
        {
          created_time: "asc",
        },
      ],
    });

    return priorAdminLeagues
      .filter((league) => league.future_leagues.length === 0)
      .map((league) => {
        const adminCount = league.leaguemembers.filter(
          (member) => member.role === MemberRole.admin,
        ).length;

        return {
          priorLeagueId: league.league_id,
          name: league.name,
          season: league.season,
          status: league.status,
          memberCount: league._count.leaguemembers,
          adminCount,
          suggestedName: suggestRenewalLeagueName(league.name),
          nextLeague: league.future_leagues.at(0) ?? null,
        };
      })
      .sort((a, b) => {
        if (a.season !== b.season) {
          return b.season - a.season;
        }
        return b.memberCount - a.memberCount;
      });
  }),
  renewalPreview: authorizedProcedure
    .input(
      z.object({
        priorLeagueId: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      if (!dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const priorLeague = await db.leagues.findFirstOrThrow({
        where: {
          league_id: input.priorLeagueId,
        },
        include: {
          _count: {
            select: {
              leaguemembers: true,
            },
          },
          leaguemembers: {
            select: {
              role: true,
            },
          },
          future_leagues: {
            where: {
              season: DEFAULT_SEASON,
            },
            take: 1,
          },
        },
      });

      if (!isLeagueAdmin(dbUser.leaguemembers, priorLeague.league_id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not an admin of the prior league",
        });
      }

      const ineligibilityReason = getRenewalIneligibilityReason(priorLeague);
      if (ineligibilityReason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: ineligibilityReason,
        });
      }

      const adminCount = priorLeague.leaguemembers.filter(
        (member) => member.role === MemberRole.admin,
      ).length;

      return {
        priorLeague: {
          league_id: priorLeague.league_id,
          name: priorLeague.name,
          season: priorLeague.season,
          status: priorLeague.status,
          late_policy: priorLeague.late_policy,
          pick_policy: priorLeague.pick_policy,
          reminder_policy: priorLeague.reminder_policy,
          scoring_type: priorLeague.scoring_type,
          superbowl_competition: priorLeague.superbowl_competition,
        },
        suggestedName: suggestRenewalLeagueName(priorLeague.name),
        memberCount: priorLeague._count.leaguemembers,
        adminCount,
        nextLeague: priorLeague.future_leagues.at(0) ?? null,
      };
    }),
  renewalInvitees: authorizedProcedure
    .input(
      z.object({
        priorLeagueId: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      if (!dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const priorLeague = await db.leagues.findFirstOrThrow({
        where: {
          league_id: input.priorLeagueId,
        },
        include: {
          leaguemembers: {
            include: {
              people: true,
            },
            orderBy: [
              { role: "asc" },
              {
                people: {
                  username: "asc",
                },
              },
            ],
          },
        },
      });

      if (!isLeagueAdmin(dbUser.leaguemembers, priorLeague.league_id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not an admin of the prior league",
        });
      }

      const ineligibilityReason = getRenewalIneligibilityReason(priorLeague);
      if (ineligibilityReason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: ineligibilityReason,
        });
      }

      const eligibleMembers = priorLeague.leaguemembers
        .filter((member) => member.user_id !== dbUser.uid)
        .filter((member) => Boolean(member.people.email))
        .map((member) => ({
          membershipId: member.membership_id,
          username: member.people.username,
          email: member.people.email,
          role: member.role ?? MemberRole.player,
        }));

      return {
        eligibleMembers,
        defaultSelectedMemberIds: eligibleMembers.map(
          (member) => member.membershipId,
        ),
        missingEmailCount: priorLeague.leaguemembers.filter(
          (member) => member.user_id !== dbUser.uid && !member.people.email,
        ).length,
      };
    }),
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
  weekWinners: authorizedProcedure
    .input(
      z.object({
        leagueId: z.number().int(),
        week: z.number().int(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { leagueId, week } = input;
      const { db, dbUser } = ctx;
      const member = dbUser?.leaguemembers.find(
        (m) => m.league_id === leagueId,
      );
      if (!member) {
        throw UnauthorizedError;
      }
      const winners = await db.weekWinners.findMany({
        where: {
          league_id: leagueId,
          week,
        },
        include: {
          leaguemembers: {
            include: {
              people: true,
            },
          },
        },
      });
      return { winners };
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

      const role =
        league.prior_league_id &&
        dbUser.leaguemembers.some(
          (member) =>
            member.league_id === league.prior_league_id &&
            member.role === MemberRole.admin,
        )
          ? MemberRole.admin
          : MemberRole.player;

      const leagueMember = await ctx.db.leaguemembers.create({
        data: {
          league_id: league.league_id,
          user_id: dbUser.uid,
          role,
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

      await resendApi.sendLeagueRegistrationEmail(leagueMember.membership_id);

      return leagueMember;
    }),
  create: authorizedProcedure
    .input(
      z.object({
        name: z.string().min(5).max(100),
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

      try {
        const response = await ctx.db.$transaction(async (tx) => {
          if (input.priorLeagueId) {
            const priorLeague = await tx.leagues.findFirst({
              where: {
                league_id: input.priorLeagueId,
              },
              include: {
                leaguemembers: {
                  select: {
                    user_id: true,
                    role: true,
                  },
                },
              },
            });

            if (!priorLeague) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Prior league not found",
              });
            }

            const ineligibilityReason =
              getRenewalIneligibilityReason(priorLeague);
            if (ineligibilityReason) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: ineligibilityReason,
              });
            }

            const isPriorLeagueAdmin = priorLeague.leaguemembers.some(
              (member) =>
                member.user_id === dbUser.uid &&
                member.role === MemberRole.admin,
            );
            if (!isPriorLeagueAdmin) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not an admin of the prior league",
              });
            }

            const existingRenewal = await tx.leagues.findFirst({
              where: {
                prior_league_id: input.priorLeagueId,
                season: DEFAULT_SEASON,
              },
            });
            if (existingRenewal) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "This league has already been renewed for the current season",
              });
            }
          }

          return await tx.leagues.create({
            data: {
              name: input.name,
              season: DEFAULT_SEASON,
              prior_league_id: input.priorLeagueId ?? null,
              late_policy: input.latePolicy,
              pick_policy: input.pickPolicy,
              reminder_policy: input.reminderPolicy,
              scoring_type: input.scoringType,
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
        });

        return response;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "This league has already been renewed for the current season",
          });
        }
        throw error;
      }
    }),
  hasStarted: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ ctx, input }) => {
      const { leagueId } = input;
      const viewerInLeague =
        ctx.dbUser?.leaguemembers.map((m) => m.league_id) ?? [];
      if (!viewerInLeague.includes(leagueId)) {
        throw UnauthorizedError;
      }
      const league = await ctx.db.leagues.findFirstOrThrow({
        where: {
          league_id: leagueId,
        },
      });
      const firstGame = await ctx.db.games.findFirst({
        where: {
          season: league.season,
        },
        orderBy: {
          ts: "asc",
        },
      });
      return firstGame && firstGame.ts < new Date();
    }),
  get: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ input, ctx }) => {
      const { leagueId } = input;
      const { db } = ctx;
      const requestorIsSuperAdmin = isSuperAdminUser(ctx.dbUser?.email);
      const usersLeagueIds = (
        ctx.dbUser?.leaguemembers.map((m) => m.league_id) ?? []
      ).filter(Defined);
      if (!requestorIsSuperAdmin && !usersLeagueIds.includes(leagueId)) {
        throw UnauthorizedError;
      }
      return await db.leagues.findFirstOrThrow({
        where: {
          league_id: leagueId,
        },
        include: {
          WeekWinners: {
            select: {
              correct_count: true,
              week: true,
              membership_id: true,
            },
          },
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
      const requestorIsSuperAdmin = isSuperAdminUser(ctx.dbUser?.email);
      const member = ctx.dbUser?.leaguemembers.find(
        (m) => m.league_id === leagueId,
      );
      if (!member && !requestorIsSuperAdmin) {
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

      const [mostRecentStartedGame, nextGameToStart] = await Promise.all([
        ctx.db.games.findFirst({
          where: {
            season,
            ts: {
              lte: new Date(),
            },
          },
          orderBy: {
            ts: "desc",
          },
        }),
        ctx.db.games.findFirst({
          where: {
            season,
            ts: {
              gte: new Date(),
            },
          },
          orderBy: {
            ts: "asc",
          },
        }),
      ]);

      const { week } = mostRecentStartedGame ?? nextGameToStart ?? { week: 1 };

      const gamesResp = await ctx.db.games.findMany({
        where: {
          season,
          OR: [
            {
              week,
            },
            // A fix to not look ahead if week 1 hasn't started yet
            { week: week + 1 },
          ],
        },
      });

      const games = orderBy(
        gamesResp,
        [(g) => g.is_tiebreaker, (g) => g.ts, (g) => g.gid],
        ["asc", "asc", "asc"],
      );

      const mostRecentStartedWeekGames = games.filter((g) => g.week === week);
      const nextWeekGames = games.filter((g) => g.week === week + 1);

      const multipleWeekMemberPicks = await ctx.db.picks.findMany({
        where: {
          gid: {
            in: games.map((g) => g.gid),
          },
          member_id: member?.membership_id ?? -1,
        },
      });

      const mostRecentStartedWeekPicks = multipleWeekMemberPicks.filter(
        (pick) =>
          mostRecentStartedWeekGames.some((game) => game.gid === pick.gid),
      );
      const nextWeekPicks = multipleWeekMemberPicks.filter((pick) =>
        nextWeekGames.some((game) => game.gid === pick.gid),
      );

      const weekToReturn =
        mostRecentStartedWeekPicks.length > 0 ||
        (nextGameToStart && nextGameToStart.week === week + 1)
          ? week + 1
          : week;

      const picksToReturn =
        weekToReturn === week ? mostRecentStartedWeekPicks : nextWeekPicks;
      const gamesToReturn =
        weekToReturn === week ? mostRecentStartedWeekGames : nextWeekGames;

      return {
        season,
        week: weekToReturn,
        games: gamesToReturn,
        picks: picksToReturn,
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
              select: {
                username: true,
                email: true,
                uid: true,
              },
            },
            picks: {
              select: {
                correct: true,
                winner: true,
                gid: true,
                done: true,
                score: true,
              },
              ...weekWhere,
            },
          },
        }),
        getGames({ season, week, db }),
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
      const tiebreakerGameId = games.find((g) => g.is_tiebreaker)?.gid;

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

        const correctPicks = mp.picks.reduce((prev, curr) => {
          return prev + (curr.correct ? 1 : 0);
        }, 0);
        const tiebreakerScore = tiebreakerGameId
          ? (mp.picks.find((p) => p.gid === tiebreakerGameId)?.score ?? 0)
          : 0;

        return {
          ...mp,
          picks: mp.picks.map((p) => {
            return {
              correct: p.correct,
              done: p.done,
              gid: p.gid,
              winner: p.winner,
            };
          }),
          correctPicks,
          tiebreakerScore,
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

      // Get the league's season to filter games
      const league = await ctx.db.leagues.findUniqueOrThrow({
        where: { league_id: leagueId },
      });

      // Get all done games for this season
      const doneGames = await ctx.db.games.findMany({
        where: {
          season: league.season,
          done: true,
        },
        select: { gid: true },
      });
      const doneGids = doneGames.map((g) => g.gid);

      // Count picks for done games
      const [correct, wrong] = await Promise.all([
        ctx.db.picks.count({
          where: {
            correct: 1,
            member_id: member.membership_id,
            gid: { in: doneGids },
          },
        }),
        ctx.db.picks.count({
          where: {
            correct: 0,
            member_id: member.membership_id,
            gid: { in: doneGids },
          },
        }),
      ]);

      return { leagueId, correct, wrong, total: correct + wrong };
    }),
  superbowlPicks: authorizedProcedure
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

      const league = await ctx.db.leagues.findFirstOrThrow({
        where: {
          league_id: leagueId,
        },
      });

      const leagueNotStarted = league.status === LeagueStatus.not_started;

      const superbowlPicks = await ctx.db.superbowl.findMany({
        where: {
          leaguemembers: {
            league_id: leagueId,
          },
        },
        include: {
          leaguemembers: {
            include: {
              people: true,
            },
          },
        },
      });

      return {
        superbowlPicks: orderBy(
          superbowlPicks,
          (s) => s.leaguemembers?.people.username?.toLocaleLowerCase(),
          "asc",
        ).map((p) => {
          if (leagueNotStarted && p.member_id !== member.membership_id) {
            return {
              ...p,
              winner: null,
              loser: null,
              score: null,
            };
          }
          return p;
        }),
      };
    }),
  nextLeague: authorizedProcedure
    .input(leagueIdSchema)
    .use(async (opts) => {
      return authorizedCacheMiddleware({
        by: "params",
        // A renewal can be created while a member is viewing the prior league.
        // Keep this short so the next-season upsell appears promptly.
        cacheTimeSeconds: 60 * 5,
        ...opts,
      });
    })
    .query(async ({ ctx, input }) => {
      const { leagueId } = input;
      const { db } = ctx;
      const usersLeagueIds = (
        ctx.dbUser?.leaguemembers.map((m) => m.league_id) ?? []
      ).filter(Defined);
      if (!usersLeagueIds.includes(leagueId)) {
        throw UnauthorizedError;
      }

      const nextLeague = await db.leagues.findFirst({
        where: {
          prior_league_id: leagueId,
          season: DEFAULT_SEASON,
        },
        orderBy: { created_time: "desc" },
      });

      return { nextLeague };
    }),
});
