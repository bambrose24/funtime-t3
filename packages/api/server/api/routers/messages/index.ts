import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { MemberRole, Prisma } from "../../../../src/generated/prisma-client";
import { expoPushApi } from "../../../services/expo-push";

const leagueMessageInput = z.object({
  leagueId: z.number().int(),
});

const writeMessageInput = z.object({
  leagueId: z.number().int(),
  content: z.string().min(1).max(500),
});

const messageReadInput = z.object({
  leagueId: z.number().int(),
  messageId: z.string(),
});

const legacyReadStateInput = z.object({
  leagueId: z.number().int(),
  lastSeenAt: z.date(),
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

function isCursorAfterOrEqual(
  current: { last_read_at: Date; last_read_message_id: string },
  candidate: { createdAt: Date; message_id: string },
) {
  const timestampDifference =
    current.last_read_at.getTime() - candidate.createdAt.getTime();

  return (
    timestampDifference > 0 ||
    (timestampDifference === 0 &&
      current.last_read_message_id >= candidate.message_id)
  );
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
        orderBy: [{ createdAt: "asc" }, { message_id: "asc" }],
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
        orderBy: [{ createdAt: "asc" }, { message_id: "asc" }],
        include: {
          leaguemembers: {
            include: {
              people: true,
            },
          },
        },
      });
    }),
  unreadCounts: authorizedProcedure.query(async ({ ctx }) => {
    const memberships = ctx.dbUser?.leaguemembers ?? [];
    if (memberships.length === 0) {
      return {};
    }

    const unreadCounts = await ctx.db.$queryRaw<
      Array<{ league_id: number; unread_count: bigint }>
    >(Prisma.sql`
      SELECT
        membership."league_id",
        COUNT(message."message_id") AS "unread_count"
      FROM "leaguemembers" AS membership
      LEFT JOIN "league_message_read_state" AS read_state
        ON read_state."membership_id" = membership."membership_id"
      LEFT JOIN "leaguemessages" AS message
        ON message."league_id" = membership."league_id"
        AND message."status" = 'PUBLISHED'::"MessageStatus"
        AND (
          read_state."membership_id" IS NULL
          OR message."createdAt" > read_state."last_read_at"
          OR (
            message."createdAt" = read_state."last_read_at"
            AND message."message_id" > read_state."last_read_message_id"
          )
        )
      WHERE membership."membership_id" IN (${Prisma.join(
        memberships.map((membership) => membership.membership_id),
      )})
      GROUP BY membership."membership_id", membership."league_id"
    `);

    return Object.fromEntries(
      unreadCounts.map(({ league_id, unread_count }) => [
        league_id,
        Number(unread_count),
      ]),
    );
  }),
  markRead: authorizedProcedure
    .input(messageReadInput)
    .mutation(async ({ ctx, input }) => {
      const member = getLeagueMember(ctx.dbUser, input.leagueId);
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a part of that league",
        });
      }

      const message = await ctx.db.leaguemessages.findFirst({
        where: {
          message_id: input.messageId,
          league_id: input.leagueId,
          status: "PUBLISHED",
        },
        select: {
          createdAt: true,
          message_id: true,
        },
      });
      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found in that league",
        });
      }

      const existing = await ctx.db.league_message_read_state.findUnique({
        where: { membership_id: member.membership_id },
      });
      if (existing && isCursorAfterOrEqual(existing, message)) {
        return { advanced: false };
      }

      if (existing) {
        const updated = await ctx.db.league_message_read_state.updateMany({
          where: {
            membership_id: member.membership_id,
            OR: [
              { last_read_at: { lt: message.createdAt } },
              {
                last_read_at: message.createdAt,
                last_read_message_id: { lt: message.message_id },
              },
            ],
          },
          data: {
            last_read_at: message.createdAt,
            last_read_message_id: message.message_id,
          },
        });
        return { advanced: updated.count > 0 };
      } else {
        const state = await ctx.db.league_message_read_state.upsert({
          where: { membership_id: member.membership_id },
          update: {},
          create: {
            membership_id: member.membership_id,
            last_read_at: message.createdAt,
            last_read_message_id: message.message_id,
          },
        });

        if (!isCursorAfterOrEqual(state, message)) {
          const updated = await ctx.db.league_message_read_state.updateMany({
            where: {
              membership_id: member.membership_id,
              OR: [
                { last_read_at: { lt: message.createdAt } },
                {
                  last_read_at: message.createdAt,
                  last_read_message_id: { lt: message.message_id },
                },
              ],
            },
            data: {
              last_read_at: message.createdAt,
              last_read_message_id: message.message_id,
            },
          });

          return { advanced: updated.count > 0 };
        }
      }

      return { advanced: true };
    }),
  importLegacyReadState: authorizedProcedure
    .input(legacyReadStateInput)
    .mutation(async ({ ctx, input }) => {
      const member = getLeagueMember(ctx.dbUser, input.leagueId);
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a part of that league",
        });
      }

      const existing = await ctx.db.league_message_read_state.findUnique({
        where: { membership_id: member.membership_id },
      });
      if (existing) {
        return { imported: false };
      }

      const latestSeenMessage = await ctx.db.leaguemessages.findFirst({
        where: {
          league_id: input.leagueId,
          status: "PUBLISHED",
          createdAt: { lte: input.lastSeenAt },
        },
        orderBy: [{ createdAt: "desc" }, { message_id: "desc" }],
        select: {
          createdAt: true,
          message_id: true,
        },
      });
      if (!latestSeenMessage) {
        return { imported: false };
      }

      await ctx.db.league_message_read_state.upsert({
        where: { membership_id: member.membership_id },
        update: {},
        create: {
          membership_id: member.membership_id,
          last_read_at: latestSeenMessage.createdAt,
          last_read_message_id: latestSeenMessage.message_id,
        },
      });

      return { imported: true };
    }),
  writeMessage: authorizedProcedure
    .input(writeMessageInput)
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      if (!dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to write messages",
        });
      }
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

      await expoPushApi.sendLeagueMessageNotification({
        db: ctx.db,
        leagueId: input.leagueId,
        authorUserId: dbUser.uid,
        authorUsername: dbUser.username,
        messageContent: input.content,
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
      if (!dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to write messages",
        });
      }
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

      await expoPushApi.sendLeagueMessageNotification({
        db: ctx.db,
        leagueId: input.leagueId,
        authorUserId: dbUser.uid,
        authorUsername: dbUser.username,
        messageContent: input.content,
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
