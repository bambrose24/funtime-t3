import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const homeRouter = createTRPCRouter({
  nav: publicProcedure.query(async ({ ctx }) => {
    const { db, supabaseUser, dbUser } = ctx;

    if (!supabaseUser || !dbUser) {
      return null;
    }

    const leagues = await db.leagues.findMany({
      where: {
        league_id: {
          in: dbUser.leaguemembers.map((m) => m.league_id),
        },
      },
    });
    return { leagues, dbUser };
  }),
  summary: publicProcedure
    .input(z.object({ season: z.number() }))
    .query(async ({ input, ctx }) => {
      const { db, supabaseUser, dbUser } = ctx;
      if (!supabaseUser || !dbUser) {
        return null;
      }
      const { season } = input;
      const leagues = await db.leagues.findMany({
        where: {
          league_id: {
            in: dbUser.leaguemembers.map((m) => m.league_id),
          },
        },
        orderBy: {
          season: "desc",
        },
        include: {
          WeekWinners: {
            where: {
              membership_id: {
                in: dbUser.leaguemembers.map((m) => m.membership_id),
              },
            },
            select: {
              correct_count: true,
              week: true,
            },
          },
          leaguemembers: {
            where: {
              membership_id: {
                in: dbUser.leaguemembers.map((m) => m.membership_id),
              },
            },
            include: {
              picks: {
                select: {
                  correct: true,
                },
              },
            },
          },
        },
      });
      return leagues;
    }),
});
