import { MutationCache, QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSettled: () => {
        void queryClient.invalidateQueries();
      },
    }),
  });
  return queryClient;
};
