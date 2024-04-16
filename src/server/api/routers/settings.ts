import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { getCoreUserTag } from "~/utils/cache";
import { updateUsernameSchema } from "~/utils/schemas/updateUsername";

export const settingsRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const { supabaseUser, dbUser } = ctx;
    return { dbUser, supabaseUser };
  }),
  updateUsername: publicProcedure
    .input(updateUsernameSchema)
    .mutation(async ({ ctx, input }) => {
      const { username } = input;
      const dbUser = ctx.dbUser;

      if (!dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to do that.",
        });
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
});
