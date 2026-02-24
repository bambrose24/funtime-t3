import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { MemberRole } from "../../../../src/generated/prisma-client";

const leagueMessageInput = z.object({
  leagueId: z.number().int(),
});

const writeMessageInput = z.object({
  leagueId: z.number().int(),
  content: z.string().min(1).max(500),
});

function getLeagueMember(
  dbUser: {
    leaguemembers: {
      league_id: number;
      membership_id: number;
      role: MemberRole | null;
    }[];
  } | null,
  leagueId: number,
) {
  return dbUser?.leaguemembers.find((m) => m.league_id === leagueId);
}

export const messagesRouter = createTRPCRouter({
  leagueMessageBoard: authorizedProcedure
    .input(leagueMessageInput)
    .query(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const { leagueId } = input;
      const member = getLeagueMember(dbUser, leagueId);
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a part of that league",
        });
      }

      return await ctx.db.leaguemessages.findMany({
        where: {
          league_id: leagueId,
          status: "PUBLISHED",
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          leaguemembers: {
            include: {
              people: true,
            },
          },
        },
      });
    }),
  leagueWeekMessageBoard: authorizedProcedure
    .input(
      z.object({
        leagueId: z.number().int(),
        week: z.number().int().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = getLeagueMember(ctx.dbUser, input.leagueId);
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a part of that league",
        });
      }

      // Backward-compatible alias while week-scoped callers are migrated.
      return await ctx.db.leaguemessages.findMany({
        where: {
          league_id: input.leagueId,
          status: "PUBLISHED",
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          leaguemembers: {
            include: {
              people: true,
            },
          },
        },
      });
    }),
  writeMessage: authorizedProcedure
    .input(writeMessageInput)
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const member = getLeagueMember(dbUser, input.leagueId);
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You arent in that league",
        });
      }

      const created = await ctx.db.leaguemessages.create({
        data: {
          content: input.content,
          message_type: "LEAGUE_MESSAGE",
          week: null,
          league_id: input.leagueId,
          member_id: member.membership_id,
          status: "PUBLISHED",
        },
      });
      return created;
    }),
  writeWeekMessage: authorizedProcedure
    .input(
      z.object({
        week: z.number().int().optional(),
        leagueId: z.number().int(),
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const member = getLeagueMember(dbUser, input.leagueId);
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You arent in that league",
        });
      }

      const created = await ctx.db.leaguemessages.create({
        data: {
          content: input.content,
          message_type: "LEAGUE_MESSAGE",
          week: null,
          league_id: input.leagueId,
          member_id: member.membership_id,
          status: "PUBLISHED",
        },
      });
      return created;
    }),

  deleteMessage: authorizedProcedure
    .input(
      z.object({
        messageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;

      const message = await ctx.db.leaguemessages.findFirstOrThrow({
        where: {
          message_id: input.messageId,
        },
      });

      const requestorMembership = getLeagueMember(dbUser, message.league_id);
      const isAuthor = requestorMembership?.membership_id === message.member_id;
      const isLeagueAdmin = requestorMembership?.role === MemberRole.admin;

      if (!isAuthor && !isLeagueAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "You can only delete your own message unless you are a league admin",
        });
      }

      await ctx.db.leaguemessages.delete({
        where: {
          message_id: message.message_id,
        },
      });
    }),
});
