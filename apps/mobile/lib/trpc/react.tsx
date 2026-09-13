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
import { QUERY_CACHE_STORAGE_KEY } from "./persisted-cache";

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
export const getQueryClient = () =>
  (queryClientSingleton ??= createQueryClient());

export function TRPCReactProvider({
  children,
  onCacheRestored,
}: {
  children: React.ReactNode;
  onCacheRestored?: () => void;
}) {
  const queryClient = getQueryClient();
  const onCacheRestoredRef = React.useRef(onCacheRestored);
  onCacheRestoredRef.current = onCacheRestored;

  useEffect(() => {
    const persister = createAsyncStoragePersister({
      storage: AsyncStorage,
      key: QUERY_CACHE_STORAGE_KEY,
      serialize: SuperJSON.stringify,
      deserialize: SuperJSON.parse,
    });

    // Offline write queueing is unsupported in v1: never persist mutations, and
    // do not call resumePausedMutations (no mutation defaults are registered).
    const [unsubscribe, restorePromise] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      buster: "app-v1",
      dehydrateOptions: {
        shouldDehydrateMutation: () => false,
      },
    });

    let settled = false;
    const markRestored = () => {
      if (settled) {
        return;
      }
      settled = true;
      onCacheRestoredRef.current?.();
    };

    restorePromise.finally(markRestored);

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
          transformer: SuperJSON,
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

  // Always render the tree; the root splash gate covers restore instead of
  // returning null (which produced a blank frame between splash and UI).
  return (
    <QueryClientProvider client={queryClient}>
      <clientApi.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </clientApi.Provider>
    </QueryClientProvider>
  );
}
