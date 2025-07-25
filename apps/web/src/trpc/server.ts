import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { createCaller } from "@funtime/api";
import { createTRPCContext } from "@funtime/api/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 *
 * Using cache() ensures that the context is created only once per request,
 * preventing duplicate database queries and connection overhead.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

export const serverApi = createCaller(createContext);
