import "server-only";

import { headers } from "next/headers";
import { unstable_cache } from "next/cache";

import { createCaller } from "@funtime/api";
import { createTRPCContext } from "@funtime/api/server/api/trpc";
import type { inferAsyncReturnType } from "@trpc/server";

type Context = inferAsyncReturnType<typeof createTRPCContext>;

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = unstable_cache(
  async (): Promise<Context> => {
    const heads = new Headers(headers());
    heads.set("x-trpc-source", "rsc");

    return await createTRPCContext({
      headers: heads,
    });
  },
  ["trpc-context"],
  { revalidate: 0 },
);

export const serverApi = createCaller(createContext);
