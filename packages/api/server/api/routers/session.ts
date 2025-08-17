import { createTRPCRouter, publicProcedure } from "../trpc";

export const sessionRouter = createTRPCRouter({
  current: publicProcedure.query(async ({ ctx }) => {
    const { supabaseUser, dbUser } = ctx;

    return { dbUser, supabaseUser };
  }),
});
