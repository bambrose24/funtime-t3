import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type AxiomRequest, withAxiom } from "next-axiom";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export const dynamic = "force-dynamic";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: AxiomRequest) => {
  const context = await createTRPCContext({
    headers: req.headers,
  });
  req.log.with({
    userId: context.dbUser?.uid,
    email: context.supabaseUser?.email,
  });
  return context;
};

const handler = withAxiom((req: AxiomRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  }),
);

export { handler as GET, handler as POST };
