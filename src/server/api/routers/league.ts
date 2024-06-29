import { z } from "zod";
import {
  authorizedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";
import { db } from "~/server/db";
import _ from "lodash";
import { getGames } from "~/server/util/getGames";
import { cache } from "~/utils/cache";
import { TRPCError } from "@trpc/server";
import { Defined } from "~/utils/defined";
import { UnauthorizedError } from "~/server/util/errors/unauthorized";

const picksSummarySchema = z.object({
  leagueId: z.number().int(),
  week: z.number().int().optional(),
});

const leagueIdSchema = z.object({
  leagueId: z.number().int(),
});

export const leagueRouter = createTRPCRouter({
  get: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ input, ctx }) => {
      const { leagueId } = input;
      const getLeagueImpl = cache(
        async () => {
          const usersLeagueIds = (
            ctx.dbUser?.leaguemembers.map((m) => m.league_id) ?? []
          ).filter(Defined);
          if (!usersLeagueIds.includes(leagueId)) {
            throw UnauthorizedError;
          }
          return await db.leagues.findFirstOrThrow({
            where: {
              AND: [
                {
                  league_id: {
                    in: ctx.dbUser?.leaguemembers
                      .map((m) => m.league_id)
                      .filter(Defined),
                  },
                },
                {
                  league_id: leagueId,
                },
              ],
            },
          });
        },
        ["getLeague", leagueId.toString()],
        {
          revalidate: 60 * 60, // one hour, doesn't change much
        },
      );
      return await getLeagueImpl();
    }),
  weekToPick: authorizedProcedure
    .input(leagueIdSchema)
    .query(async ({ input, ctx }) => {
      const { leagueId } = input;

      const data = await ctx.db.leagues.findUnique({
        where: {
          league_id: leagueId,
        },
        select: {
          season: true,
        },
      });
      if (!data?.season) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const { season } = data;

      const mostRecentUnstartedGame = await ctx.db.games.findFirst({
        where: {
          season,
          // ts: {
          //   gte: new Date(),
          // },
        },
        orderBy: {
          ts: "asc",
        },
      });

      if (!mostRecentUnstartedGame) {
        return { week: null, season: null, games: [] };
      }

      const { week } = mostRecentUnstartedGame;

      const games = await ctx.db.games.findMany({
        where: {
          season,
          week,
        },
      });

      return {
        season,
        week,
        games,
      };
    }),
  picksSummary: publicProcedure
    .input(picksSummarySchema)
    .query(async ({ input }) => {
      const { leagueId, week } = input;

      const REVALIDATE_SECONDS = 60;
      const getLeagueData = cache(
        async () => {
          const weekWhere = week
            ? {
                where: {
                  week,
                },
              }
            : {};

          const { season } = await db.leagues.findFirstOrThrow({
            where: { league_id: leagueId },
          });

          const [memberPicks, games] = await Promise.all([
            db.leaguemembers.findMany({
              where: {
                league_id: leagueId,
              },
              include: {
                people: {
                  select: { username: true, email: true, uid: true },
                },
                picks: {
                  select: {
                    correct: true,
                    winner: true,
                    gid: true,
                    done: true,
                    pickid: true,
                    score: true,
                    is_random: true,
                  },
                  ...weekWhere,
                },
              },
            }),
            getGames({ season, week }),
          ]);

          const gidToIndex = games.reduce((prev, curr, idx) => {
            prev.set(curr.gid, idx);
            return prev;
          }, new Map<number, number>());

          const mps = memberPicks.map((mp) => {
            mp.picks = _.sortBy(
              mp.picks,
              [(p) => gidToIndex.get(p.gid), (p) => p.gid],
              ["asc", "asc"],
            );
            return {
              ...mp,
              correctPicks: mp.picks.reduce((prev, curr) => {
                return prev + (curr.correct ? 1 : 0);
              }, 0),
              gameIdToPick: mp.picks.reduce((prev, curr) => {
                prev.set(curr.gid, curr);
                return prev;
              }, new Map<number, (typeof mp.picks)[number]>()),
            };
          });
          return mps;
        },
        [
          "leagueRouter.picksSummary",
          leagueId.toString(),
          week ? week.toString() : "",
        ],
        {
          revalidate: REVALIDATE_SECONDS,
        },
      );
      return await getLeagueData();
    }),
});
