import { prisma as db, espn } from "@funtime/api";
import { groupBy } from "lodash";
import { DEFAULT_SEASON } from "../utils/const";

const LOG_PREFIX = "[postseason]";

export interface PostseasonSyncResult {
  seeds: {
    processed: number;
    errors: number;
  };
  games: {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}

export async function syncPostseason(
  season: number = DEFAULT_SEASON
): Promise<PostseasonSyncResult> {
  console.log(`${LOG_PREFIX} Starting postseason sync for season ${season}...`);

  const teams = await db.teams.findMany();
  const teamByAbbrev = groupBy(teams, (t) => t.abbrev);

  const result: PostseasonSyncResult = {
    seeds: { processed: 0, errors: 0 },
    games: { created: 0, updated: 0, skipped: 0, errors: 0 },
  };

  // ========================================
  // Sync postseason team seeds from ESPN
  // ========================================
  console.log(`${LOG_PREFIX} Syncing playoff seeds...`);

  try {
    const espnSeedings = await espn.getPlayoffSeedings({ season });
    console.log(
      `${LOG_PREFIX} Found ${espnSeedings.length} playoff teams from ESPN standings`
    );

    for (const seeding of espnSeedings) {
      const team = teamByAbbrev[seeding.teamAbbrev]?.at(0);
      if (!team) {
        console.log(
          `${LOG_PREFIX} ⚠️  Could not find team for seeding: ${seeding.teamAbbrev}`
        );
        result.seeds.errors++;
        continue;
      }

      await db.postseason_team_seeds.upsert({
        where: {
          season_teamid: {
            season,
            teamid: team.teamid,
          },
        },
        create: {
          season,
          teamid: team.teamid,
          conference: seeding.conference,
          seed: seeding.seed,
        },
        update: {
          conference: seeding.conference,
          seed: seeding.seed,
        },
      });

      console.log(
        `${LOG_PREFIX} ✓ ${seeding.conference} #${seeding.seed}: ${seeding.teamName}`
      );
      result.seeds.processed++;
    }

    console.log(
      `${LOG_PREFIX} Seeds sync complete: ${result.seeds.processed} processed, ${result.seeds.errors} errors`
    );
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Error syncing playoff seeds:`, error);
  }

  // ========================================
  // Sync postseason games from ESPN
  // ========================================
  console.log(`${LOG_PREFIX} Syncing postseason games...`);

  try {
    const espnPostseasonGames = await espn.getPostseasonGames({ season });
    console.log(
      `${LOG_PREFIX} Found ${espnPostseasonGames.length} postseason games from ESPN`
    );

    // Get existing postseason games for this season
    const existingPostseasonGames = await db.postseason_games.findMany({
      where: { season },
    });
    const existingByEspnId = new Map(
      existingPostseasonGames.map((g) => [g.espn_id, g])
    );

    // Map to determine bracket position within each round
    const roundPositionCounters: Record<string, number> = {};

    // Create/update all games (including TBD ones)
    for (const espnGame of espnPostseasonGames) {
      const espnId = Number(espnGame.id);
      const round = espn.getPostseasonRound(espnGame.week.number);

      if (!round) {
        console.log(
          `${LOG_PREFIX} ⚠️  Skipping ESPN game ${espnId} - unknown round for week ${espnGame.week.number}`
        );
        result.games.skipped++;
        continue;
      }

      const espnCompetition = espnGame.competitions.at(0);
      const homeCompetitor = espnCompetition?.competitors.find(
        (c) => c.homeAway === "home"
      );
      const awayCompetitor = espnCompetition?.competitors.find(
        (c) => c.homeAway === "away"
      );

      const homeAbbrev = homeCompetitor?.team?.abbreviation
        ? espn.translateAbbreviation(homeCompetitor.team.abbreviation)
        : null;
      const awayAbbrev = awayCompetitor?.team?.abbreviation
        ? espn.translateAbbreviation(awayCompetitor.team.abbreviation)
        : null;

      // Handle TBD games - store with null teams
      const isTBD =
        homeAbbrev === "TBD" ||
        awayAbbrev === "TBD" ||
        !homeAbbrev ||
        !awayAbbrev;

      const homeTeam =
        !isTBD && homeAbbrev ? teamByAbbrev[homeAbbrev]?.at(0) : null;
      const awayTeam =
        !isTBD && awayAbbrev ? teamByAbbrev[awayAbbrev]?.at(0) : null;

      // For non-TBD games, if we can't find the team, skip it
      if (!isTBD && (!homeTeam || !awayTeam)) {
        console.log(
          `${LOG_PREFIX} ⚠️  Skipping ESPN postseason game ${espnId} - could not find teams (home: ${homeAbbrev}, away: ${awayAbbrev})`
        );
        result.games.skipped++;
        continue;
      }

      // Determine conference from teams, or from competitor data for TBD games
      let conference: "AFC" | "NFC" | null = null;
      if (homeTeam && awayTeam) {
        conference = espn.getGameConference(
          homeTeam.conference,
          awayTeam.conference
        ) as "AFC" | "NFC" | null;
      } else if (round !== "super_bowl") {
        // For TBD games, try to infer conference from the game name
        const gameName = espnGame.name?.toLowerCase() ?? "";
        if (gameName.includes("afc")) {
          conference = "AFC";
        } else if (gameName.includes("nfc")) {
          conference = "NFC";
        }
      }

      // Calculate bracket position
      const roundKey = `${round}-${conference ?? "SB"}`;
      roundPositionCounters[roundKey] =
        (roundPositionCounters[roundKey] ?? 0) + 1;
      const bracketPosition = roundPositionCounters[roundKey];

      // Determine winner
      const done = espnCompetition?.status.type.name === "STATUS_FINAL";
      const homeScore = homeCompetitor?.score
        ? Number(homeCompetitor.score)
        : null;
      const awayScore = awayCompetitor?.score
        ? Number(awayCompetitor.score)
        : null;

      let winner: number | null = null;
      if (done && homeScore !== null && awayScore !== null && homeTeam && awayTeam) {
        winner = homeScore > awayScore ? homeTeam.teamid : awayTeam.teamid;
      }

      const gameData = {
        season,
        round: round as "wild_card" | "divisional" | "conference" | "super_bowl",
        conference,
        ts: new Date(espnGame.date),
        home_team: homeTeam?.teamid ?? null,
        away_team: awayTeam?.teamid ?? null,
        home_score: homeScore,
        away_score: awayScore,
        winner,
        done,
        bracket_position: bracketPosition,
      };

      const existing = existingByEspnId.get(espnId);
      const gameLabel = isTBD
        ? `TBD vs TBD (${round} ${conference ?? "SB"})`
        : `${awayTeam?.abbrev ?? "?"} @ ${homeTeam?.abbrev ?? "?"} (${round})`;

      try {
        if (existing) {
          // Update existing game
          await db.postseason_games.update({
            where: { game_id: existing.game_id },
            data: gameData,
          });
          console.log(`${LOG_PREFIX} ✓ Updated: ${gameLabel}`);
          result.games.updated++;
        } else {
          // Create new game
          await db.postseason_games.create({
            data: {
              espn_id: espnId,
              ...gameData,
            },
          });
          console.log(`${LOG_PREFIX} ✓ Created: ${gameLabel}`);
          result.games.created++;
        }
      } catch (err) {
        console.error(`${LOG_PREFIX} ❌ Error saving game ${gameLabel}:`, err);
        result.games.errors++;
      }
    }

    console.log(
      `${LOG_PREFIX} Games sync complete: ${result.games.created} created, ${result.games.updated} updated, ${result.games.skipped} skipped, ${result.games.errors} errors`
    );
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Error syncing postseason games:`, error);
  }

  console.log(`${LOG_PREFIX} Postseason sync finished!`);
  return result;
}

// Script entry point
async function main() {
  const season = process.argv[2] ? parseInt(process.argv[2], 10) : DEFAULT_SEASON;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Postseason Sync Script - Season ${season}`);
  console.log(`${"=".repeat(50)}\n`);

  try {
    const result = await syncPostseason(season);
    console.log(`\n${"=".repeat(50)}`);
    console.log("Summary:");
    console.log(`  Seeds: ${result.seeds.processed} processed, ${result.seeds.errors} errors`);
    console.log(
      `  Games: ${result.games.created} created, ${result.games.updated} updated, ${result.games.skipped} skipped, ${result.games.errors} errors`
    );
    console.log(`${"=".repeat(50)}\n`);
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main();
}

