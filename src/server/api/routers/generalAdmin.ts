import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, authorizedProcedure } from "../trpc";
import { DEFAULT_SEASON } from "~/utils/const";

const adminOnlyProcedure = authorizedProcedure.use(async ({ ctx, next }) => {
  if (ctx?.dbUser?.email !== "bambrose24@gmail.com") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Only the admin can access this data",
    });
  }
  return next();
});

export const generalAdminRouter = createTRPCRouter({
  getAdminData: adminOnlyProcedure
    .query(async ({ ctx }) => {
      const db = ctx.db;
      const SEASON = DEFAULT_SEASON;

      const [leaguesForSeason, membersForSeason, picksForSeason] = await Promise.all([
        db.leagues.count({
          where: {
            season: SEASON,
          }
        }),
        db.leaguemembers.count({
          where: {
            leagues: {
              season: SEASON,
            }
          }
        }),
        db.picks.count({
          where: {
            season: SEASON,
          }
        }),
      ]);

      return {
        leaguesForSeason,
        membersForSeason,
        picksForSeason,
      }
    }),
});
