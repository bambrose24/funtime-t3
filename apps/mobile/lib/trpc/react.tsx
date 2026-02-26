// lib/trpc/react.tsx
import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import { type AppRouter } from "@funtime/api";
import { getBaseUrl } from "@/utils/getBaseUrl";
import {
  clearPersistedSupabaseSession,
  isInvalidRefreshTokenError,
  supabase,
} from "@/lib/supabase/client";
import { createQueryClient } from "./create-query-client";

export const clientApi = createTRPCReact<AppRouter>();

// ----- React Native focus/online wiring -----
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });
  return () => sub.remove();
});

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable));
  });
});

let queryClientSingleton: QueryClient | undefined;
const getQueryClient = () => (queryClientSingleton ??= createQueryClient());

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const persister = createAsyncStoragePersister({
      storage: AsyncStorage,
      serialize: SuperJSON.stringify,
      deserialize: SuperJSON.parse,
    });

    const [unsubscribe, restorePromise] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      buster: "app-v1",
    });

    restorePromise
      .then(() => queryClient.resumePausedMutations())
      .finally(() => setIsReady(true));

    return unsubscribe;
  }, [queryClient]);

  const [trpcClient] = useState(() =>
    clientApi.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            __DEV__ || (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: SuperJSON, // <— moved here
          headers: async () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "react-native");

            try {
              const {
                data: { session },
                error,
              } = await supabase.auth.getSession();

              if (error) {
                if (isInvalidRefreshTokenError(error)) {
                  console.warn(
                    "[tRPC] Invalid refresh token while building auth headers; clearing local auth state.",
                  );
                  await clearPersistedSupabaseSession("trpc:headers:getSession");
                } else {
                  console.error(
                    "[tRPC] Failed to read Supabase session while building auth headers.",
                    error,
                  );
                }

                return headers;
              }

              if (session?.access_token) {
                headers.set("Authorization", `Bearer ${session.access_token}`);
              }
            } catch (error) {
              if (isInvalidRefreshTokenError(error)) {
                console.warn(
                  "[tRPC] Invalid refresh token thrown while building auth headers; clearing local auth state.",
                );
                await clearPersistedSupabaseSession("trpc:headers:throw");
              } else {
                console.error(
                  "[tRPC] Unexpected error while building auth headers.",
                  error,
                );
              }
            }

            return headers;
          },
        }),
      ],
    }),
  );

  if (!isReady) return null; // or a splash screen

  return (
    <QueryClientProvider client={queryClient}>
      <clientApi.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </clientApi.Provider>
    </QueryClientProvider>
  );
}
