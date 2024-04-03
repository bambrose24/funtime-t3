import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { unstable_cache } from "next/cache";
import { db } from "~/server/db";
import _ from "lodash";
import { getGamesByWeek } from "~/server/util/getGamesByWeek";
import { getGamesBySeason } from "~/server/util/getGamesBySeason";

const picksSummarySchema = z.object({
  leagueId: z.number().int(),
  week: z.number().int().optional(),
});

export const leagueRouter = createTRPCRouter({
  picksSummary: publicProcedure
    .input(picksSummarySchema)
    .query(async ({ input }) => {
      const { leagueId, week } = input;

      const REVALIDATE_SECONDS = 60;
      const getLeagueData = unstable_cache(
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
            week
              ? getGamesByWeek({ week, season })
              : getGamesBySeason({ season }),
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
