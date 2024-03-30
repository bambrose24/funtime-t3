import { TRPCClientError } from "@trpc/client";
import { cookies } from "next/headers";
import { loginSchema } from "~/lib/schemas/auth";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabaseServer } from "~/utils/supabase/server";

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    if (ctx.supabaseUser) {
      throw new TRPCClientError(
        "You are already logged in. Log out to log in as someone else.",
      );
    }

    const { email, password } = input;
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      throw new TRPCClientError(response.error.message);
    }
  }),
  signup: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { supabaseUser } = ctx;

      if (supabaseUser) {
        throw new TRPCClientError(
          "You are already logged in. Try logging out before signing up",
        );
      }

      const cookieStore = cookies();
      const supabase = supabaseServer(cookieStore);

      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (response.error) {
        throw new TRPCClientError(response.error.message);
      }
      // NOTE: don't make a User in our DB until they register for a league
    }),
});
