import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import _ from "lodash";
import { getGames } from "~/server/util/getGames";
import { cache } from "~/utils/cache";

const picksSummarySchema = z.object({
  leagueId: z.number().int(),
  week: z.number().int().optional(),
});

const getLeagueSchema = z.object({
  leagueId: z.number().int(),
});

export const leagueRouter = createTRPCRouter({
  get: publicProcedure.input(getLeagueSchema).query(async ({ input }) => {
    const { leagueId } = input;
    const getLeagueImpl = cache(
      async () => {
        return await db.leagues.findFirstOrThrow({
          where: { league_id: leagueId },
        });
      },
      ["getLeague", leagueId.toString()],
      {
        revalidate: 60 * 60, // one hour, doesn't change much
      },
    );
    return await getLeagueImpl();
  }),
  picksSummary: publicProcedure
    .input(picksSummarySchema)
    .query(async ({ input }) => {
      const { leagueId, week } = input;
      console.log("in picks summary");

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
