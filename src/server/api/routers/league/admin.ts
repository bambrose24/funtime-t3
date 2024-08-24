import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { MemberRole } from "~/generated/prisma-client";
import { TRPCError } from "@trpc/server";
import { groupBy, orderBy } from "lodash";
import { subHours } from 'date-fns';
import { resendApi } from "~/server/services/resend";

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

      const oneHourAgo = subHours(new Date(), 1);
      const recentBroadcast = await db.emailLogs.findFirst({
        where: {
          league_id: leagueId,
          email_type: "league_broadcast",
          ts: {
            gte: oneHourAgo
          }
        },
        orderBy: {
          ts: 'desc'
        }
      });

      return { canSendBroadcast: !recentBroadcast };
    }),
  sendBroadcast: leagueAdminProcedure
    .input(
      z.object({
        leagueId: z.string(),
        markdownString: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      const adminMembership = dbUser?.leaguemembers.find(m => m.role === 'admin' && m.league_id === leagueId);
      if (!adminMembership || !dbUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not an admin of this league",
        });
      }
      const { leagueId, markdownString } = input;

      // Fetch the league and admin information
      const league = await db.leagues.findFirstOrThrow({
        where: { league_id: leagueId },
      });



      // Check if a broadcast has been sent in the last hour
      const oneHourAgo = subHours(new Date(), 1);
      const recentBroadcast = await db.emailLogs.findFirst({
        where: {
          league_id: leagueId,
          email_type: "league_broadcast",
          ts: {
            gte: oneHourAgo
          }
        },
        orderBy: {
          ts: 'desc'
        }
      });

      if (recentBroadcast) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You can only send one broadcast per hour. Please try again later.",
        });
      }

      // Fetch all league members' email addresses
      const members = await db.leaguemembers.findMany({
        where: { league_id: leagueId },
        include: { people: true },
      });

      const emailAddresses = members
        .map((m) => m.people.email)
        .filter((email): email is string => email !== null);

      // Send the broadcast email
      try {
        await resendApi.sendLeagueBroadcast({
          leagueName: league.name,
          adminName: dbUser.username,
          markdownMessage: markdownString,
          to: emailAddresses,
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
