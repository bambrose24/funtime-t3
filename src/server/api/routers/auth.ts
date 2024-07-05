import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { DEFAULT_SEASON } from "~/utils/const";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  signup: publicProcedure // authorized below to require supabase user
    .input(
      z.object({
        email: z.string(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, firstName, lastName, username } = input;
      const { supabaseUser, dbUser } = ctx;

      console.log("supabaseUser and dbUser", supabaseUser, dbUser);

      if (!supabaseUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Could not sign you up. No supabase user found.",
        });
      }

      // signed up successfully, create a user in the db

      const person = await ctx.db.people.create({
        data: {
          username,
          season: DEFAULT_SEASON,
          email,
          supabase_id: supabaseUser.id,
          fname: firstName,
          lname: lastName,
        },
      });

      return person;
    }),
});
