import { useEffect, useRef } from "react";
import { clientApi } from "@/lib/trpc/react";
import { type Session } from "@supabase/supabase-js";
import { createComponentLogger } from "@/lib/logging";

/**
 * Hook to prefetch essential data on cold start
 * This runs immediately after authentication to make the app feel instant
 */
export function useColdStartPrefetch(session: Session | null, isLoading: boolean) {
  const utils = clientApi.useUtils();
  const hasPrefetched = useRef(false);
  const logger = createComponentLogger('ColdStartPrefetch');

  useEffect(() => {
    if (isLoading || !session || hasPrefetched.current) return;

    const prefetchEssentialData = async () => {
      try {
        logger.info('Starting cold start prefetch');

        // Step 1: Prefetch user session/profile data (needed everywhere)
        const sessionPromise = utils.session.current.prefetch();
        
        // Step 2: Prefetch global data (needed everywhere) 
        const teamsPromise = utils.teams.getTeams.prefetch();
        
        // Wait for essential data
        await Promise.all([sessionPromise, teamsPromise]);

        // Step 3: Get user's leagues (for home screen)
        const homeDataPromise = utils.home.summary.prefetch();
        await homeDataPromise;

        // Step 4: Get the home data to determine which leagues to prefetch
        const homeData = utils.home.summary.getData();
        if (!homeData || homeData.length === 0) {
          logger.info('Cold start prefetch complete (no leagues)');
          return;
        }

        // Step 5: Prefetch data for the user's most important leagues
        // Prioritize current season leagues and limit to top 3 for performance
        const priorityLeagues = homeData
          .filter(league => league.season === 2025) // Current season
          .slice(0, 3); // Top 3 leagues only

        logger.info('Prefetching priority leagues', { 
          priorityLeaguesCount: priorityLeagues.length,
          totalLeagues: homeData.length 
        });

        // Step 6: Prefetch league data in parallel (but don't await - let it happen in background)
        const leaguePromises = priorityLeagues.map(async (league) => {
          try {
            // Core league data
            await utils.league.get.prefetch({ leagueId: league.league_id });
            await utils.time.activeWeekByLeague.prefetch({ 
              leagueId: league.league_id 
            });
            
            // If we have active week data, prefetch current week's games and picks
            const weekData = utils.time.activeWeekByLeague.getData({ 
              leagueId: league.league_id 
            });
            
            if (weekData) {
              // Don't await these - let them load in background
              utils.games.getGames.prefetch({
                week: weekData.week,
                season: league.season,
              });
              
              utils.league.picksSummary.prefetch({
                leagueId: league.league_id,
                week: weekData.week,
              });
            }
          } catch (error) {
            logger.warn('Failed to prefetch league', { 
              leagueId: league.league_id, 
              error: error instanceof Error ? error.message : String(error) 
            });
          }
        });

        // Don't await league prefetches - let them happen in background
        Promise.all(leaguePromises).then(() => {
          logger.info('Priority league prefetch complete');
        });

        logger.info('Cold start prefetch complete (essential data loaded)');

      } catch (error) {
        logger.error('Cold start prefetch failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    // Mark as prefetched immediately to prevent duplicate calls
    hasPrefetched.current = true;
    
    // Start prefetching (don't await - let app continue loading)
    prefetchEssentialData();

  }, [session, isLoading, utils, logger]);

  return {
    hasPrefetched: hasPrefetched.current,
  };
}