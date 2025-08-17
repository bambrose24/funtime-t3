import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_SEASON } from "../../../utils/const";

export const authRouter = createTRPCRouter({
  signup: publicProcedure // authorized below to require supabase user
    .input(
      z.object({
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, username } = input;
      const { db, supabaseUser } = ctx;

      if (!supabaseUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Could not sign you up. No supabase user found.",
        });
      }

      const person = await db.people.create({
        data: {
          username,
          season: DEFAULT_SEASON,
          email: supabaseUser.email,
          supabase_id: supabaseUser.id,
          fname: firstName,
          lname: lastName,
        },
      });

      revalidatePath("/", "layout");

      return person;
    }),
});
