import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { DEFAULT_SEASON } from "~/utils/const";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";

export const authRouter = createTRPCRouter({
  signup: publicProcedure // authorized below to require supabase user
    .input(
      z.object({
        email: z.string(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        supabaseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, firstName, lastName, username, supabaseId } = input;

      // TODO figure out why this isn't working
      // if (!supabaseUser) {
      //   throw new TRPCError({
      //     code: "UNAUTHORIZED",
      //     message: "Could not sign you up. No supabase user found.",
      //   });
      // }

      // signed up successfully, create a user in the db
      // NOTE why isn't the supabaseUser populating when they should have a session after signUp?

      const person = await ctx.db.people.create({
        data: {
          username,
          season: DEFAULT_SEASON,
          email,
          supabase_id: supabaseId,
          fname: firstName,
          lname: lastName,
        },
      });

      revalidatePath("/", "layout");

      return person;
    }),
});
