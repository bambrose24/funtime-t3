import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, authorizedProcedure, publicProcedure } from "../trpc";
import { DEFAULT_SEASON } from "~/utils/const";

const SUPER_ADMIN_EMAILS = ["bambrose24@gmail.com"];

const adminOnlyProcedure = authorizedProcedure.use(async ({ ctx, next }) => {
  if (!SUPER_ADMIN_EMAILS.includes(ctx?.dbUser?.email ?? "")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Only the admin can access this data",
    });
  }
  return next();
});

export const generalAdminRouter = createTRPCRouter({
  isSuperAdmin: publicProcedure.query(async ({ ctx }) => {
    return SUPER_ADMIN_EMAILS.includes(ctx.dbUser?.email ?? "");
  }),
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
