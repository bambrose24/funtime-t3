import React, { useState } from "react";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import { type AppRouter } from "@funtime/api";

import { getBaseUrl } from "@/utils/getBaseUrl";

const createQueryClient = () => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSettled: () => {
        void queryClient.invalidateQueries();
      },
    }),
    defaultOptions: {
      queries: {
        // React Native specific defaults
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      },
    },
  });
  return queryClient;
};

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  // For React Native, we can use singleton pattern
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const clientApi = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    clientApi.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            __DEV__ || (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: async () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "react-native");

            // TODO: Add authentication headers from AsyncStorage
            // const token = await AsyncStorage.getItem('supabase-auth-token');
            // if (token) {
            //   headers.set('Authorization', `Bearer ${token}`);
            // }

            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <clientApi.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </clientApi.Provider>
    </QueryClientProvider>
  );
}
