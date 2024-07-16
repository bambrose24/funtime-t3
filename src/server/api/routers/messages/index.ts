import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  leagueWeekMessageBoard: authorizedProcedure
    .input(
      z.object({
        leagueId: z.number().int(),
        week: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const { leagueId, week } = input;
      if (!dbUser?.leaguemembers.some((m) => m.league_id === leagueId)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a part of that league",
        });
      }

      return await ctx.db.leaguemessages.findMany({
        where: {
          week,
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
  writeWeekMessage: authorizedProcedure
    .input(
      z.object({
        week: z.number().int(),
        leagueId: z.number().int(),
        content: z.string().min(1).max(300),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const member = dbUser?.leaguemembers.find(
        (m) => m.league_id === input.leagueId,
      );
      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You arent in that league",
        });
      }

      const { week, leagueId, content } = input;

      const created = await ctx.db.leaguemessages.create({
        data: {
          content,
          message_type: "WEEK_COMMENT",
          week,
          league_id: leagueId,
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

      if (
        !dbUser?.leaguemembers.some(
          (m) => m.membership_id === message.member_id,
        )
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You cant delete a message that is not yours",
        });
      }

      await ctx.db.leaguemessages.delete({
        where: {
          message_id: message.message_id,
        },
      });
    }),
});
