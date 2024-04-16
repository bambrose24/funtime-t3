import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const sessionRouter = createTRPCRouter({
  current: publicProcedure.query(async ({ ctx }) => {
    const { supabaseUser, dbUser } = ctx;

    return { dbUser, supabaseUser };
  }),
  settings: publicProcedure.query(async ({ ctx }) => {
    const { supabaseUser, dbUser } = ctx;
    return { dbUser, supabaseUser };
  }),
});
