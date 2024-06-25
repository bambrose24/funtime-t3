/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { cache, getCoreUserTag } from "~/utils/cache";
import { createLogger, getLogger } from "~/utils/logging";
import { RequestContext } from "~/utils/requestContext";
import { supabaseServer } from "~/utils/supabase/server";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = supabaseServer();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let dbUser = null;
  if (supabaseUser?.email) {
    const getDbUser = cache(
      async () => {
        return await db.people.findFirst({
          where: {
            email: supabaseUser.email,
          },
          include: {
            leaguemembers: {
              select: {
                league_id: true,
                membership_id: true,
              },
            },
          },
        });
      },
      ["getUserByEmail", supabaseUser.email],
      {
        revalidate: 10, // 10 seconds but revalidate via tag below
        tags: [getCoreUserTag(supabaseUser.email)],
      },
    );
    dbUser = await getDbUser();
  }

  const context = {
    db,
    supabaseUser,
    dbUser,
    ...opts,
  };

  await setupRequestContext(context);

  return context;
};

async function setupRequestContext(
  context: Awaited<ReturnType<typeof createTRPCContext>>,
) {
  const userId = context.dbUser?.uid ?? "";
  RequestContext.set("userId", userId.toString());

  const logger = createLogger({
    userId,
  });

  RequestContext.set("logger", logger);
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const LOG_PREFIX = `[trpc]`;

/**
 * Global procedure with top-level logging middleware.
 */
const procedure = t.procedure.use(async ({ path, type, next }) => {
  const start = Date.now();
  const typeAndPath = { trpcPath: path, trpcType: type };
  getLogger().info(`${LOG_PREFIX} starting trpc request handling`, {
    ...typeAndPath,
  });
  const result = await next();
  const durationMs = Date.now() - start;

  getLogger().info(`${LOG_PREFIX} tRPC request ended`, {
    ...typeAndPath,
    trpcRequestDurationMs: durationMs,
    ok: result.ok,
    ...(result.ok === false
      ? {
          trpcError: result.error.message,
          trpcErrorCode: result.error.code,
          ...(result.error.stack ? { trpcErrorStack: result.error.stack } : {}),
        }
      : {}),
  });
  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = procedure;

/**
 * A procedure that can only run if the user is authenticated via Supabase.
 */
export const authorizedProcedure = procedure.use(async ({ ctx, next }) => {
  if (!ctx.dbUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do that.",
    });
  }
  return next();
});
