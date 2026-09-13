import { QueryClient } from "@tanstack/react-query";

/**
 * Shared QueryClient defaults for the mobile app.
 *
 * Mutations intentionally do not auto-retry or queue offline. Non-idempotent
 * writes (chat, join, picks) must fail fast with an actionable error rather than
 * pause and resume with no mutationFn. Queries keep offlineFirst so cached
 * reads still work.
 *
 * There is no global MutationCache onSettled invalidation — each mutation
 * invalidates only the queries it owns. messages.markRead must never refetch
 * the full app.
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5m
        gcTime: 24 * 60 * 60 * 1000, // 24h in-memory; persisted separately
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: 2,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
        networkMode: "offlineFirst",
      },
      mutations: {
        networkMode: "online",
        retry: 0,
      },
    },
  });
};
