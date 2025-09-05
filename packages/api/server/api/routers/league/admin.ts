import { TRPCError } from "@trpc/server";
import { addDays, subDays } from "date-fns";
import { groupBy, orderBy } from "lodash";
import { z } from "zod";
import {
  MemberRole,
  type PrismaClient,
} from "../../../../src/generated/prisma-client";
import { Defined } from "../../../../utils/defined";
import { resendApi } from "../../../services/resend";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";

const leagueAdminProcedure = authorizedProcedure
  .input(z.object({ leagueId: z.number().int() }))
  .use(async ({ ctx, next, path, input }) => {
    const member = ctx.dbUser?.leaguemembers.find(
      (m) => m.league_id === input.leagueId,
    );
    if (member?.role !== MemberRole.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You are not an admin of the league ${input.leagueId}. Path ${path}`,
      });
    }
    return next();
  });

const canSendBroadcastThisWeek = async (db: PrismaClient, leagueId: number) => {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const recentBroadcasts = await db.emailLogs.findMany({
    where: {
      league_id: leagueId,
      email_type: "league_broadcast",
      ts: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      ts: "desc",
    },
    distinct: ["resend_id"], // since we log the same email for all the members we send to, we count distinct email instances instead of number of rows here
    take: 2,
    select: {
      ts: true,
    },
  });

  if (recentBroadcasts.length < 2) {
    return { canSend: true } as const;
  } else {
    const secondMostRecent = recentBroadcasts[1]?.ts;
    if (secondMostRecent) {
      const nextAvailableTime = addDays(secondMostRecent, 7);
      return { canSend: false, nextAvailableTime } as const;
    }
    return { canSend: false, nextAvailableTime: addDays(now, 7) } as const;
  }
};

export const leagueAdminRouter = createTRPCRouter({
  changeMemberRole: leagueAdminProcedure
    .input(
      z.object({ memberId: z.number().int(), role: z.nativeEnum(MemberRole) }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { leagueId, memberId, role } = input;
      const memberInLeague = await db.leaguemembers.findFirstOrThrow({
        where: {
          membership_id: memberId,
          league_id: leagueId,
        },
      });

      const updatedMember = await db.leaguemembers.update({
        where: {
          membership_id: memberInLeague.membership_id,
        },
        data: {
          role,
        },
      });

      return updatedMember;
    }),
  removeMember: leagueAdminProcedure
    .input(
      z.object({
        memberId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { leagueId, memberId } = input;
      const memberInLeague = await db.leaguemembers.findFirstOrThrow({
        where: {
          membership_id: memberId,
          league_id: leagueId,
        },
      });

      await db.leaguemembers.delete({
        where: {
          membership_id: memberInLeague.membership_id,
        },
      });

      return { success: true };
    }),
  members: leagueAdminProcedure.query(async ({ ctx, input }) => {
    const { db } = ctx;
    const { leagueId } = input;

    const [dbMembers, league] = await Promise.all([
      db.leaguemembers.findMany({
        where: {
          league_id: leagueId,
        },
        include: {
          people: true,
          WeekWinners: true,
        },
      }),
      db.leagues.findFirstOrThrow({
        where: {
          league_id: leagueId,
        },
      }),
    ]);
    const memberIds = dbMembers.map((m) => m.membership_id);

    const [picks, allGames] = await Promise.all([
      db.picks.groupBy({
        by: ["member_id", "correct"],
        where: {
          member_id: {
            in: memberIds,
          },
          done: 1,
        },
        _count: true,
      }),
      await db.games.findMany({
        where: {
          season: league.season,
        },
      }),
    ]);

    const now = new Date();
    const startedGames = allGames.filter((g) => g.ts < now);
    const startedGameIds = new Set(startedGames.map((g) => g.gid));

    const donePicksByMemberId = groupBy(picks, (p) => p.member_id);

    const picksMadeForStartedGames = await db.picks.groupBy({
      by: ["member_id"],
      where: {
        gid: {
          in: Array.from(startedGameIds),
        },
      },
      _count: true,
    });

    const picksMadeForStartedGamesByMemberId = groupBy(
      picksMadeForStartedGames,
      (p) => p.member_id,
    );

    const members = orderBy(
      dbMembers.map((member) => {
        const picksCounts = donePicksByMemberId[member.membership_id] ?? [];

        const picksMadeList =
          picksMadeForStartedGamesByMemberId[member.membership_id] ?? [];
        const picksMadeForStartedGamesForMember = picksMadeList.reduce(
          (prev, curr) => {
            return prev + curr._count;
          },
          0,
        );

        const correctPicks = picksCounts
          .filter((p) => p.correct === 1)
          .reduce((prev, curr) => prev + curr._count, 0);
        const wrongPicks = picksCounts
          .filter((p) => p.correct !== 1)
          .reduce((prev, curr) => prev + curr._count, 0);

        return {
          ...member,
          correctPicks,
          wrongPicks,
          misssedPicks: startedGames.length - picksMadeForStartedGamesForMember,
        };
      }),
      (m) => m.people.username.toLowerCase(),
    );

    return { members };
  }),
  setMembersPaid: leagueAdminProcedure
    .input(
      z.object({
        memberIds: z.array(z.number().int()),
        paid: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { memberIds, paid, leagueId } = input;

      // Validate that all memberIds belong to the specified league
      const validMembers = await db.leaguemembers.findMany({
        where: {
          membership_id: { in: memberIds },
          league_id: leagueId,
        },
        select: { membership_id: true },
      });

      const validMemberIds = validMembers.map((m) => m.membership_id);

      // Ensure that the validMemberIds are exactly the same as the input memberIds
      if (
        !validMemberIds.every((id) => memberIds.includes(id)) ||
        !memberIds.every((id) => validMemberIds.includes(id))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more member IDs are not valid for this league",
        });
      }

      // Update the paid status for valid members
      await db.leaguemembers.updateMany({
        where: {
          membership_id: { in: validMemberIds },
          league_id: leagueId,
        },
        data: { paid },
      });

      return { success: true, updatedCount: validMemberIds.length };
    }),
  memberPicks: leagueAdminProcedure
    .input(
      z.object({
        memberId: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { leagueId, memberId } = input;

      const member = await ctx.db.leaguemembers.findFirstOrThrow({
        where: {
          league_id: leagueId,
          membership_id: memberId,
        },
      });

      return await ctx.db.picks.findMany({
        where: {
          member_id: member.membership_id,
        },
      });
    }),
  setPick: leagueAdminProcedure
    .input(
      z.object({
        memberId: z.number().int().min(1),
        gameId: z.number().int().min(1),
        winner: z.number().int().min(1),
        score: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { gameId, memberId, leagueId, winner, score } = input;
      const [game, member, league] = await Promise.all([
        ctx.db.games.findFirstOrThrow({
          where: {
            gid: gameId,
          },
        }),
        ctx.db.leaguemembers.findFirstOrThrow({
          where: {
            league_id: leagueId,
            membership_id: memberId,
          },
        }),
        ctx.db.leagues.findFirstOrThrow({
          where: {
            league_id: leagueId,
          },
        }),
      ]);

      if (!member || !game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game or member not found",
        });
      }

      if (![game.away, game.home].includes(winner)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Could not find team ${winner} for game ${game.gid}`,
        });
      }

      const existingPick = await ctx.db.picks.findFirst({
        where: {
          gid: gameId,
          member_id: memberId,
        },
      });

      if (existingPick) {
        await ctx.db.picks.update({
          where: {
            pickid: existingPick.pickid,
          },
          data: {
            winner,
            correct: null,
            done: null,
            score: Boolean(score) ? score : null,
          },
        });
      } else {
        await ctx.db.picks.create({
          data: {
            member_id: memberId,
            uid: member.user_id,
            season: league.season,
            week: game.week,
            gid: gameId,
            winner,
            score: Boolean(score) ? score : null,
          },
        });
      }
    }),
  memberEmails: leagueAdminProcedure
    .input(z.object({ memberId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { memberId, leagueId } = input;

      // Ensure the member is in the league
      const memberInLeague = await db.leaguemembers.findFirst({
        where: {
          membership_id: memberId,
          league_id: leagueId,
        },
      });

      if (!memberInLeague) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found in this league",
        });
      }

      // Fetch email logs for the member
      const emailLogs = await db.emailLogs.findMany({
        where: {
          member_id: memberId,
          league_id: leagueId,
        },
        orderBy: {
          ts: "desc",
        },
      });

      // Fetch email contents from Resend API
      const emailsResponse = await Promise.all(
        emailLogs.map(async (log) => {
          try {
            const emailContent = await resendApi.get(log.resend_id);
            const data = emailContent?.data;
            return {
              id: log.email_log_id,
              resend_id: log.resend_id,
              resend_data: data,
            };
          } catch (error) {
            console.error(
              `Failed to fetch email content for ID ${log.resend_id}:`,
              error,
            );
            return null;
          }
        }),
      );

      return { emails: emailsResponse.filter(Defined) };
    }),
  changeName: leagueAdminProcedure
    .input(
      z.object({
        leagueName: z.string().min(5).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { leagueId, leagueName } = input;
      const updatedLeague = await db.leagues.update({
        where: {
          league_id: leagueId,
        },
        data: {
          name: leagueName,
        },
      });
      return updatedLeague;
    }),
  canSendLeagueBroadcast: leagueAdminProcedure.query(async ({ ctx, input }) => {
    const { db, dbUser } = ctx;
    const { leagueId } = input;

    // Check if the user is an admin of the league
    const adminMembership = dbUser?.leaguemembers.find(
      (m) => m.role === MemberRole.admin && m.league_id === leagueId,
    );
    if (!adminMembership || !dbUser) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not an admin of this league",
      });
    }

    return await canSendBroadcastThisWeek(db, leagueId);
  }),
  sendBroadcast: leagueAdminProcedure
    .input(
      z.object({
        markdownString: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      const { leagueId, markdownString } = input;
      const adminMembership = dbUser?.leaguemembers.find(
        (m) => m.role === "admin" && m.league_id === leagueId,
      );
      if (!adminMembership || !dbUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not an admin of this league",
        });
      }

      // Fetch the league and admin information
      const league = await db.leagues.findFirstOrThrow({
        where: { league_id: leagueId },
      });

      // Check if a broadcast can be sent this week
      const canSendBroadcast = await canSendBroadcastThisWeek(db, leagueId);
      if (!canSendBroadcast.canSend) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `You can only send two broadcasts per week. ${canSendBroadcast.nextAvailableTime ? `Please try again after ${canSendBroadcast.nextAvailableTime.toISOString()}.` : ""}`,
        });
      }

      // Fetch all league members' email addresses
      const members = await db.leaguemembers.findMany({
        where: { league_id: leagueId },
        include: { people: true },
      });

      const to = members
        .map((m) => {
          return { email: m.people.email, memberId: m.membership_id };
        })
        .filter((t) => t.email !== null) as {
        email: string;
        memberId: number;
      }[];

      // Send the broadcast email
      try {
        await resendApi.sendLeagueBroadcast({
          leagueName: league.name,
          adminName: dbUser.username,
          markdownMessage: markdownString,
          to,
          leagueId,
        });

        return { success: true, message: "Broadcast sent successfully" };
      } catch (error) {
        console.error("Error sending broadcast:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send broadcast",
        });
      }
    }),
});
