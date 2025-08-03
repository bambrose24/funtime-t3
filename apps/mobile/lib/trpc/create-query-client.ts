import { QueryClient, MutationCache } from "@tanstack/react-query";

// ----- QueryClient (invalidate everything on every mutation) -----
export const createQueryClient = () => {
  let qc!: QueryClient;

  const mutationCache = new MutationCache({
    onSettled: async () => {
      // Mark everything stale; only refetch active queries to avoid a stampede.
      await qc.invalidateQueries({ refetchType: "active" });
    },
  });

  qc = new QueryClient({
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5m
        gcTime: 24 * 60 * 60 * 1000, // 24h in-memory; persisted anyway
        refetchOnMount: true, // Will only refetch if stale (based on staleTime)
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: 2,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
        networkMode: "offlineFirst",
      },
      mutations: {
        networkMode: "offlineFirst",
        retry: 2,
      },
    },
  });

  return qc;
};
