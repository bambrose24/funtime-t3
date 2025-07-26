import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/trpc/react';

/**
 * Debug hook to visualize cache hydration in real-time
 * Add this to your _layout.tsx to see what's happening
 */
export function useCacheDebugger() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const logCacheState = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      console.log('📊 CACHE STATE:', {
        totalQueries: queries.length,
        queries: queries.map((query: any) => ({
          key: query.queryKey,
          status: query.state.status,
          dataUpdatedAt: new Date(query.state.dataUpdatedAt).toISOString(),
          hasData: !!query.state.data,
          isStale: query.isStale(),
        }))
      });
    };

    // Log initial state
    logCacheState();

    // Subscribe to cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event: any) => {
      console.log('🔄 CACHE EVENT:', {
        type: event.type,
        query: event.query?.queryKey,
        action: event.action?.type,
      });
      
      if (event.type === 'added' || event.type === 'updated') {
        setTimeout(logCacheState, 100); // Small delay to see final state
      }
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to show exactly when data becomes available vs when components mount
 */
export function useDataAvailabilityTracker() {
  const utils = clientApi.useUtils();

  useEffect(() => {
    // Check what's already in cache when this component mounts
    const checkCachedData = () => {
      console.log('🎯 DATA AVAILABILITY CHECK:');
      
      // Check session data
      const sessionData = utils.session.current.getData();
      console.log('  Session data available:', !!sessionData);
      
      // Check home data  
      const homeData = utils.home.summary.getData();
      console.log('  Home data available:', !!homeData, homeData?.length || 0, 'leagues');
      
      // Check teams data
      const teamsData = utils.teams.getTeams.getData();
      console.log('  Teams data available:', !!teamsData, teamsData?.length || 0, 'teams');
      
      // If we have home data, check league data
      if (homeData && homeData.length > 0) {
        const firstLeague = homeData[0];
        const leagueData = utils.league.get.getData({ leagueId: firstLeague.league_id });
        console.log('  First league data available:', !!leagueData);
      }
    };

    checkCachedData();
  }, [utils]);
}