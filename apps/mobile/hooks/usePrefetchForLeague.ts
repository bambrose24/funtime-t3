import { useCallback, useEffect } from "react";
import { clientApi } from "@/lib/trpc/react";

/**
 * Comprehensive league data prefetching hook
 * Prefetches ALL data needed for the entire league experience
 */
export function usePrefetchForLeague(leagueId: number | undefined, options?: {
  immediate?: boolean; // Start prefetching immediately
  aggressive?: boolean; // Prefetch even more data (picks history, etc.)
}) {
  const utils = clientApi.useUtils();
  const { immediate = false, aggressive = false } = options || {};

  const prefetchLeagueData = useCallback(async () => {
    if (!leagueId) return;

    try {
      // Core league data (needed for all screens)
      const corePromises = [
        utils.league.get.prefetch({ leagueId }),
        utils.time.activeWeekByLeague.prefetch({ leagueId }),
        utils.teams.getTeams.prefetch(), // Global data, needed everywhere
      ];

      // Wait for core data to get activeWeek info
      await Promise.all(corePromises);

      // Get the cached data to determine dependent queries
      const leagueData = utils.league.get.getData({ leagueId });
      const activeWeek = utils.time.activeWeekByLeague.getData({ leagueId });

      if (!activeWeek || !leagueData) return;

      // Overview tab data
      const overviewPromises = [
        utils.games.getGames.prefetch({
          week: activeWeek.week,
          season: leagueData.season,
        }),
        utils.league.picksSummary.prefetch({
          leagueId,
          week: activeWeek.week,
        }),
        utils.member.picksForWeek.prefetch({
          leagueId,
          week: activeWeek.week,
        }),
      ];

      // Picks tab data (same as overview mostly, but includes weekToPick)
      const picksPromises = [
        utils.league.weekToPick.prefetch({ leagueId }),
      ];

      // Leaderboard tab data (when we implement it)
      const leaderboardPromises: Promise<any>[] = [
        // We can add specific leaderboard queries here when available
        // utils.league.standings.prefetch({ leagueId }),
        // utils.league.weekWinners.prefetch({ leagueId }),
      ];

      // League info/settings data
      const infoPromises = [
        utils.league.correctPickCount.prefetch({ leagueId }),
        // utils.league.members.prefetch({ leagueId }),
        // utils.league.settings.prefetch({ leagueId }),
      ];

      // Execute all tab-specific prefetches in parallel
      await Promise.all([
        ...overviewPromises,
        ...picksPromises,
        ...leaderboardPromises,
        ...infoPromises,
      ]);

      // Aggressive prefetching for even better UX
      if (aggressive) {
        const aggressivePromises = [];

        // Prefetch picks for previous weeks (for history/trends)
        for (let week = Math.max(1, activeWeek.week - 2); week < activeWeek.week; week++) {
          aggressivePromises.push(
            utils.league.picksSummary.prefetch({
              leagueId,
              week,
            }),
            utils.games.getGames.prefetch({
              week,
              season: leagueData.season,
            })
          );
        }

        // Prefetch next week's data if available
        if (activeWeek.week < 18) { // NFL regular season is typically 18 weeks
          aggressivePromises.push(
            utils.games.getGames.prefetch({
              week: activeWeek.week + 1,
              season: leagueData.season,
            })
          );
        }

        // Execute aggressive prefetches (don't await - let them happen in background)
        Promise.all(aggressivePromises).catch(() => {
          // Silently handle errors for aggressive prefetching
        });
      }

    } catch (error) {
      // Silently handle prefetch errors - they're optimizations, not requirements
      console.warn('League prefetch failed:', error);
    }
  }, [leagueId, utils, aggressive]);

  // Immediate prefetching if requested
  useEffect(() => {
    if (immediate && leagueId) {
      prefetchLeagueData();
    }
  }, [immediate, leagueId, prefetchLeagueData]);

  return {
    prefetchLeagueData,
    isReady: !!leagueId, // Simple readiness check
  };
}

/**
 * Hook to prefetch data for multiple leagues
 * Use this on the home screen to preload league data
 */
export function usePrefetchActiveSeasonLeagues(
  leagueIds: number[], 
  options?: {
    immediate?: boolean;
    aggressive?: boolean;
  }
) {
  const utils = clientApi.useUtils();
  const { immediate = false, aggressive = false } = options || {};

  const prefetchAllActiveLeagues = useCallback(async () => {
    if (leagueIds.length === 0) return;

    try {
      // Prefetch global data once
      await utils.teams.getTeams.prefetch();

      // For each league, run the same prefetch logic as usePrefetchForLeague
      const allPromises = leagueIds.map(async (leagueId) => {
        // Core league data (needed for all screens)
        const corePromises = [
          utils.league.get.prefetch({ leagueId }),
          utils.time.activeWeekByLeague.prefetch({ leagueId }),
        ];

        // Wait for core data to get activeWeek info
        await Promise.all(corePromises);

        // Get the cached data to determine dependent queries
        const leagueData = utils.league.get.getData({ leagueId });
        const activeWeek = utils.time.activeWeekByLeague.getData({ leagueId });

        if (!activeWeek || !leagueData) return;

        // Overview tab data
        const overviewPromises = [
          utils.games.getGames.prefetch({
            week: activeWeek.week,
            season: leagueData.season,
          }),
          utils.league.picksSummary.prefetch({
            leagueId,
            week: activeWeek.week,
          }),
          utils.member.picksForWeek.prefetch({
            leagueId,
            week: activeWeek.week,
          }),
        ];

        // Picks tab data
        const picksPromises = [
          utils.league.weekToPick.prefetch({ leagueId }),
        ];

        // League info/settings data
        const infoPromises = [
          utils.league.correctPickCount.prefetch({ leagueId }),
        ];

        // Execute all tab-specific prefetches in parallel
        await Promise.all([
          ...overviewPromises,
          ...picksPromises,
          ...infoPromises,
        ]);

        // Aggressive prefetching for even better UX
        if (aggressive) {
          const aggressivePromises = [];

          // Prefetch picks for previous weeks (for history/trends)
          for (let week = Math.max(1, activeWeek.week - 2); week < activeWeek.week; week++) {
            aggressivePromises.push(
              utils.league.picksSummary.prefetch({
                leagueId,
                week,
              }),
              utils.games.getGames.prefetch({
                week,
                season: leagueData.season,
              })
            );
          }

          // Prefetch next week's data if available
          if (activeWeek.week < 18) { // NFL regular season is typically 18 weeks
            aggressivePromises.push(
              utils.games.getGames.prefetch({
                week: activeWeek.week + 1,
                season: leagueData.season,
              })
            );
          }

          // Execute aggressive prefetches (don't await - let them happen in background)
          Promise.all(aggressivePromises).catch(() => {
            // Silently handle errors for aggressive prefetching
          });
        }
      });

      // Execute all league prefetches in parallel
      await Promise.all(allPromises);

    } catch (error) {
      console.warn('Active season prefetch failed:', error);
    }
  }, [leagueIds, utils, aggressive]);

  // Immediate prefetching if requested
  useEffect(() => {
    if (immediate && leagueIds.length > 0) {
      prefetchAllActiveLeagues();
    }
  }, [immediate, leagueIds, prefetchAllActiveLeagues]);

  return {
    prefetchAllActiveLeagues,
  };
}