import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { db } from "~/server/db";
import { UnauthorizedError } from "~/server/util/errors/unauthorized";
import { getCoreUserTag } from "~/utils/cache";
import { updateUsernameSchema } from "~/utils/schemas/updateUsername";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
});
