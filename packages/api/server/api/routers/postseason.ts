import { z } from "zod";
import { publicCacheMiddleware } from "../../cache";
import { db } from "../../db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const postseasonRouter = createTRPCRouter({
  /**
   * Get all postseason games for a season, ordered by round and date
   */
  getGames: publicProcedure
    .input(z.object({ season: z.number().int() }))
    .use(async (opts) => {
      return publicCacheMiddleware({
        by: "params",
        cacheTimeSeconds: 60, // 1 minute cache - playoffs are updated frequently
        ...opts,
      });
    })
    .query(async ({ input }) => {
      const games = await db.postseason_games.findMany({
        where: { season: input.season },
        include: {
          home_team_rel: true,
          away_team_rel: true,
          winner_team_rel: true,
        },
        orderBy: [
          { ts: "asc" },
        ],
      });
      return games;
    }),

  /**
   * Get postseason games structured as a bracket for display
   * Returns games organized by round and conference, plus team seeds for calculating matchups
   */
  getBracket: publicProcedure
    .input(z.object({ season: z.number().int() }))
    .use(async (opts) => {
      return publicCacheMiddleware({
        by: "params",
        cacheTimeSeconds: 60,
        ...opts,
      });
    })
    .query(async ({ input }) => {
      const [games, seeds] = await Promise.all([
        db.postseason_games.findMany({
          where: { season: input.season },
          include: {
            home_team_rel: true,
            away_team_rel: true,
            winner_team_rel: true,
          },
          orderBy: [{ ts: "asc" }],
        }),
        db.postseason_team_seeds.findMany({
          where: { season: input.season },
          include: {
            team: true,
          },
        }),
      ]);

      type GameWithTeams = (typeof games)[number];

      // Organize games by round and conference
      const bracket = {
        wild_card: {
          AFC: games.filter(
            (g): g is GameWithTeams =>
              g.round === "wild_card" && g.conference === "AFC"
          ),
          NFC: games.filter(
            (g): g is GameWithTeams =>
              g.round === "wild_card" && g.conference === "NFC"
          ),
        },
        divisional: {
          AFC: games.filter(
            (g): g is GameWithTeams =>
              g.round === "divisional" && g.conference === "AFC"
          ),
          NFC: games.filter(
            (g): g is GameWithTeams =>
              g.round === "divisional" && g.conference === "NFC"
          ),
        },
        conference: {
          AFC: games.filter(
            (g): g is GameWithTeams =>
              g.round === "conference" && g.conference === "AFC"
          ),
          NFC: games.filter(
            (g): g is GameWithTeams =>
              g.round === "conference" && g.conference === "NFC"
          ),
        },
        super_bowl: games.filter(
          (g): g is GameWithTeams => g.round === "super_bowl"
        ),
      };

      // Create a map of teamid -> seed for easy lookup
      const seedsByTeamId = Object.fromEntries(
        seeds.map((s) => [s.teamid, s.seed])
      );

      // Also group seeds by conference
      const seedsByConference = {
        AFC: seeds
          .filter((s) => s.conference === "AFC")
          .sort((a, b) => a.seed - b.seed),
        NFC: seeds
          .filter((s) => s.conference === "NFC")
          .sort((a, b) => a.seed - b.seed),
      };

      return {
        ...bracket,
        seeds: seedsByTeamId,
        seedsByConference,
      };
    }),

  /**
   * Get playoff seeds for a season
   */
  getSeeds: publicProcedure
    .input(z.object({ season: z.number().int() }))
    .use(async (opts) => {
      return publicCacheMiddleware({
        by: "params",
        cacheTimeSeconds: 300, // 5 minute cache - seeds don't change often
        ...opts,
      });
    })
    .query(async ({ input }) => {
      const seeds = await db.postseason_team_seeds.findMany({
        where: { season: input.season },
        include: {
          team: true,
        },
        orderBy: [
          { conference: "asc" },
          { seed: "asc" },
        ],
      });

      return seeds;
    }),
});

