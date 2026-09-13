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

const isMissingPushPreferenceColumnError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  );
};

export type PushNotificationStatusReason =
  | "ok"
  | "in_app_disabled"
  | "storage_unavailable";

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

      revalidateTag(getCoreUserTag(dbUser.uid), "max");
      revalidateTag(getCoreUserTag(dbUser.email), "max");
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
          // Do not flip token.enabled or the account preference on re-register.
          update: {
            user_id: dbUser.uid,
            platform: input.platform ?? null,
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
  unregisterPushToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbUser = ctx.dbUser;
      if (!dbUser) {
        throw UnauthorizedError;
      }

      try {
        // Only the caller's own token for this installation. Other devices of
        // the same user are left enabled.
        const result = await ctx.db.pushNotificationTokens.updateMany({
          where: {
            token: input.token,
            user_id: dbUser.uid,
          },
          data: {
            enabled: false,
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
            "Push token unregister skipped: pushNotificationTokens table missing.",
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
        await ctx.db.people.update({
          where: {
            uid: dbUser.uid,
          },
          data: {
            push_notifications_enabled: input.enabled,
          },
        });
        return {
          success: true,
          updatedCount: 1,
          unavailable: false as const,
        };
      } catch (error) {
        if (
          isMissingPushTokensTableError(error) ||
          isMissingPushPreferenceColumnError(error)
        ) {
          console.warn(
            "Push notification preference update skipped: account preference column or push storage missing.",
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
      const [person, tokenCount] = await Promise.all([
        ctx.db.people.findUniqueOrThrow({
          where: { uid: dbUser.uid },
          select: { push_notifications_enabled: true },
        }),
        ctx.db.pushNotificationTokens.count({
          where: { user_id: dbUser.uid },
        }),
      ]);

      const preference = person.push_notifications_enabled;
      const reason: PushNotificationStatusReason = preference
        ? "ok"
        : "in_app_disabled";

      return {
        // `enabled` remains the durable account preference for existing clients.
        enabled: preference,
        preference,
        tokenCount,
        reason,
        unavailable: false as const,
      };
    } catch (error) {
      if (
        isMissingPushTokensTableError(error) ||
        isMissingPushPreferenceColumnError(error)
      ) {
        console.warn(
          "Push notification status unavailable: push preference or token storage missing.",
        );
        return {
          enabled: false,
          preference: false,
          tokenCount: 0,
          reason: "storage_unavailable" as const,
          unavailable: true as const,
        };
      }
      throw error;
    }
  }),
});
