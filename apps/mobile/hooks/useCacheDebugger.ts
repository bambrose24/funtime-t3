import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/trpc/react";
import { createComponentLogger } from "@/lib/logging";

/**
 * Debug hook to visualize cache hydration in real-time
 * Add this to your _layout.tsx to see what's happening
 */
export function useCacheDebugger() {
  const queryClient = useQueryClient();
  const logger = createComponentLogger('CacheDebugger');

  useEffect(() => {
    const logCacheState = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      logger.info("Cache state snapshot", {
        totalQueries: queries.length,
        queries: queries.map((query: any) => ({
          key: query.queryKey,
          status: query.state.status,
          dataUpdatedAt: new Date(query.state.dataUpdatedAt).toISOString(),
          hasData: !!query.state.data,
          isStale: query.isStale(),
        })),
      });
    };

    // Log initial state
    logCacheState();

    // Subscribe to cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event: any) => {
      logger.debug("Cache event", {
        type: event.type,
        query: event.query?.queryKey,
        action: event.action?.type,
      });

      if (event.type === "added" || event.type === "updated") {
        setTimeout(logCacheState, 100); // Small delay to see final state
      }
    });

    return unsubscribe;
  }, [queryClient, logger]);
}

/**
 * Hook to show exactly when data becomes available vs when components mount
 */
export function useDataAvailabilityTracker() {
  const utils = clientApi.useUtils();
  const logger = createComponentLogger('DataAvailabilityTracker');

  useEffect(() => {
    // Check what's already in cache when this component mounts
    const checkCachedData = () => {
      // Check session data
      const sessionData = utils.session.current.getData();
      
      // Check home data
      const homeData = utils.home.summary.getData();
      
      // Check teams data
      const teamsData = utils.teams.getTeams.getData();
      
      let firstLeagueDataAvailable = false;
      // If we have home data, check league data
      if (homeData && homeData.length > 0) {
        const firstLeague = homeData[0];
        const leagueData = utils.league.get.getData({
          leagueId: firstLeague.league_id,
        });
        firstLeagueDataAvailable = !!leagueData;
      }

      logger.info("Data availability check", {
        sessionDataAvailable: !!sessionData,
        homeDataAvailable: !!homeData,
        homeLeaguesCount: homeData?.length || 0,
        teamsDataAvailable: !!teamsData,
        teamsCount: teamsData?.length || 0,
        firstLeagueDataAvailable,
      });
    };

    checkCachedData();
  }, [utils, logger]);
}
