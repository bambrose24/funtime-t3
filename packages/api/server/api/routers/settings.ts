import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getCoreUserTag } from "../../../utils/cache";
import { updateUsernameSchema } from "../../../utils/schemas/updateUsername";
import { db } from "../../db";
import { UnauthorizedError } from "../../util/errors/unauthorized";
import { createTRPCRouter, publicProcedure } from "../trpc";

const isMissingPushTokensTableError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2021"
  );
};

export const settingsRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const { dbUser: dbUserCached } = ctx;

    if (!dbUserCached) {
      throw UnauthorizedError;
    }

    // no caching on purpose
    const dbUser = await db.people.findFirstOrThrow({
      where: { uid: dbUserCached.uid },
    });

    return { dbUser };
  }),
  updateUsername: publicProcedure
    .input(updateUsernameSchema)
    .mutation(async ({ ctx, input }) => {
      const { username } = input;
      const dbUser = ctx.dbUser;

      if (!dbUser) {
        throw UnauthorizedError;
      }
      const existing = await db.people.findFirst({ where: { username } });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That username is already taken. Try a new one.",
        });
      }

      await db.people.update({
        where: {
          uid: dbUser.uid,
        },
        data: {
          username,
        },
      });

      revalidateTag(getCoreUserTag(dbUser.uid));
      revalidateTag(getCoreUserTag(dbUser.email));
    }),
  registerPushToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        platform: z.enum(["ios", "android", "web"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbUser = ctx.dbUser;
      if (!dbUser) {
        throw UnauthorizedError;
      }

      try {
        await ctx.db.pushNotificationTokens.upsert({
          where: {
            token: input.token,
          },
          create: {
            token: input.token,
            user_id: dbUser.uid,
            platform: input.platform ?? null,
            enabled: true,
            last_seen_at: new Date(),
          },
          update: {
            user_id: dbUser.uid,
            platform: input.platform ?? null,
            enabled: true,
            last_seen_at: new Date(),
          },
        });
        return { success: true, unavailable: false as const };
      } catch (error) {
        if (isMissingPushTokensTableError(error)) {
          console.warn(
            "Push token registration skipped: pushNotificationTokens table missing. Run db push before enabling notifications.",
          );
          return { success: false, unavailable: true as const };
        }
        throw error;
      }
    }),
  setPushNotificationsEnabled: publicProcedure
    .input(
      z.object({
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbUser = ctx.dbUser;
      if (!dbUser) {
        throw UnauthorizedError;
      }

      try {
        const result = await ctx.db.pushNotificationTokens.updateMany({
          where: {
            user_id: dbUser.uid,
          },
          data: {
            enabled: input.enabled,
          },
        });
        return {
          success: true,
          updatedCount: result.count,
          unavailable: false as const,
        };
      } catch (error) {
        if (isMissingPushTokensTableError(error)) {
          console.warn(
            "Push notification preference update skipped: pushNotificationTokens table missing.",
          );
          return {
            success: false,
            updatedCount: 0,
            unavailable: true as const,
          };
        }
        throw error;
      }
    }),
  pushNotificationStatus: publicProcedure.query(async ({ ctx }) => {
    const dbUser = ctx.dbUser;
    if (!dbUser) {
      throw UnauthorizedError;
    }

    try {
      const tokens = await ctx.db.pushNotificationTokens.findMany({
        where: {
          user_id: dbUser.uid,
        },
        select: {
          enabled: true,
        },
      });

      const tokenCount = tokens.length;
      const enabled = tokenCount > 0 && tokens.some((token) => token.enabled);

      return {
        enabled,
        tokenCount,
        unavailable: false as const,
      };
    } catch (error) {
      if (isMissingPushTokensTableError(error)) {
        console.warn(
          "Push notification status unavailable: pushNotificationTokens table missing.",
        );
        return {
          enabled: false,
          tokenCount: 0,
          unavailable: true as const,
        };
      }
      throw error;
    }
  }),
});
