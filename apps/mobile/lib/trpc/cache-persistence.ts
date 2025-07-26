import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const CACHE_KEY = 'funtime-trpc-cache';

// Create persister for AsyncStorage
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: CACHE_KEY,
});

/**
 * Setup cache persistence for React Query / tRPC
 * This saves the cache to AsyncStorage so it survives app restarts
 */
export function setupCachePersistence(queryClient: QueryClient) {
  return persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    buster: '1.0', // Increment this to force cache reset on app updates
    dehydrateOptions: {
      // Only persist certain queries to avoid storage bloat
      shouldDehydrateQuery: (query: any) => {
        // Persist global/essential data but not user-specific picks that change frequently
        const queryKey = query.queryKey;
        const [trpc, procedure] = queryKey;
        
        if (trpc !== 'trpc') return false;
        
        // Persist these essential queries
        const persistableQueries = [
          'teams.getTeams',
          'session.current', 
          'home.summary',
          'league.get',
          'time.activeWeekByLeague',
        ];
        
        return persistableQueries.some(key => key === procedure);
      },
    },
  });
}

/**
 * Clear the persisted cache (useful for debugging or after logout)
 */
export async function clearPersistedCache() {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Persisted cache cleared');
  } catch (error) {
    console.warn('Failed to clear persisted cache:', error);
  }
}

// Usage example in your auth logout flow:
export async function handleLogout() {
  await clearPersistedCache();
  // ... rest of logout logic
}