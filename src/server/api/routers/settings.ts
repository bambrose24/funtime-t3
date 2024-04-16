import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { UnauthorizedError } from "~/server/util/errors/unauthorized";
import { getCoreUserTag } from "~/utils/cache";
import { updateUsernameSchema } from "~/utils/schemas/updateUsername";

export const settingsRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const { supabaseUser, dbUser } = ctx;

    if (!dbUser) {
      throw UnauthorizedError;
    }

    // no caching on purpose
    return await db.people.findFirstOrThrow({
      where: { uid: dbUser.uid },
    });
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
});
