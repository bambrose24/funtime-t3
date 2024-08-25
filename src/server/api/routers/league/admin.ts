import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { MemberRole, type PrismaClient } from "~/generated/prisma-client";
import { TRPCError } from "@trpc/server";
import { groupBy, orderBy } from "lodash";
import { addDays, subDays } from 'date-fns';
import { resendApi } from "~/server/services/resend";
import { Defined } from "~/utils/defined";

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
        gte: sevenDaysAgo
      }
    },
    orderBy: {
      ts: 'desc'
    },
    distinct: ['resend_id'], // since we log the same email for all the members we send to, we count distinct email instances instead of number of rows here
    take: 2,
    select: {
      ts: true
    }
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

    const [picks, doneGames] = await Promise.all([
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
      await db.games.count({
        where: {
          season: league.season,
          done: true,
        },
      }),
    ]);

    const donePicksByMemberId = groupBy(picks, (p) => p.member_id);

    const members = orderBy(
      dbMembers.map((member) => {
        const picksCounts = donePicksByMemberId[member.membership_id] ?? [];
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
          misssedPicks: doneGames - (correctPicks + wrongPicks),
        };
      }),
      (m) => m.people.username.toLowerCase(),
    );

    return { members };
  }),
  memberEmails: leagueAdminProcedure.input(z.object({ memberId: z.number().int() })).query(async ({ ctx, input }) => {

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
        code: 'NOT_FOUND',
        message: 'Member not found in this league',
      });
    }

    // Fetch email logs for the member
    const emailLogs = await db.emailLogs.findMany({
      where: {
        member_id: memberId,
        league_id: leagueId,
      },
      orderBy: {
        ts: 'desc',
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
          console.error(`Failed to fetch email content for ID ${log.resend_id}:`, error);
          return null;
        }
      })
    );

    return { emails: emailsResponse.filter(Defined) }

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
  canSendLeagueBroadcast: leagueAdminProcedure
    .query(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      const { leagueId } = input;

      // Check if the user is an admin of the league
      const adminMembership = dbUser?.leaguemembers.find(m => m.role === MemberRole.admin && m.league_id === leagueId);
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
      const adminMembership = dbUser?.leaguemembers.find(m => m.role === 'admin' && m.league_id === leagueId);
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
          message: `You can only send two broadcasts per week. ${canSendBroadcast.nextAvailableTime ? `Please try again after ${canSendBroadcast.nextAvailableTime.toISOString()}.` : ''}`,
        });
      }

      // Fetch all league members' email addresses
      const members = await db.leaguemembers.findMany({
        where: { league_id: leagueId },
        include: { people: true },
      });

      const to = members
        .map((m) => { return { email: m.people.email, memberId: m.membership_id } }).filter(t => t.email !== null) as { email: string; memberId: number }[];

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