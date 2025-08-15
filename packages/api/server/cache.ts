import { TRPCError } from "@trpc/server";
import StableStringify from "json-stable-stringify";
import superjson from "superjson";
import { getLogger } from "~/utils/logging";
import type { authorizedProcedure, publicProcedure } from "./api/trpc";
import { redis } from "./redis";

type CacheStrategy = "params_and_user" | "params" | "user";

interface CacheOptions {
  by: CacheStrategy;
  cacheTimeSeconds: number;
}

function generateCacheKey(
  procedurePath: string,
  strategy: CacheStrategy,
  input: object,
  userEmail?: string,
): string {
  const prefix = `trpc:${procedurePath}`;

  switch (strategy) {
    case "params_and_user":
      if (!userEmail) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User required for params_and_user cache strategy",
        });
      }
      return `${prefix}:user:${userEmail}:params:${StableStringify(input)}`;

    case "params":
      return `${prefix}:params:${StableStringify(input)}`;

    case "user":
      if (!userEmail) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User required for user cache strategy",
        });
      }
      return `${prefix}:user:${userEmail}`;
  }
}

const middlewareMarker = "middlewareMarker" as "middlewareMarker" & {
  __brand: "middlewareMarker";
};

const CACHE_LOG_PREFIX = "[trpc cache]";

type AuthorizedMiddlewareFn = Parameters<
  (typeof authorizedProcedure)["use"]
>[0];
type PublicMiddlewareFn = Parameters<(typeof publicProcedure)["use"]>[0];

const _dummyAuthorizedMiddleware: AuthorizedMiddlewareFn = async (opts) => {
  return opts.next();
};
const _dummyPublicMiddleware: PublicMiddlewareFn = async (opts) => {
  return opts.next();
};

type AuthorizedMiddlewareFnParameters = Parameters<
  typeof _dummyAuthorizedMiddleware
>[0];
type PublicMiddlewareFnParameters = Parameters<
  typeof _dummyPublicMiddleware
>[0];
type AuthorizedCacheMiddlewareOptions = CacheOptions &
  Omit<AuthorizedMiddlewareFnParameters, "input"> & { input: unknown };
type PublicCacheMiddlewareOptions = CacheOptions &
  Omit<PublicMiddlewareFnParameters, "input"> & { input: unknown };

type MiddlewareReturn = ReturnType<
  Parameters<typeof _dummyAuthorizedMiddleware>[0]["next"]
>;

export const authorizedCacheMiddleware = async (
  opts: AuthorizedCacheMiddlewareOptions,
): Promise<MiddlewareReturn> => {
  const { ctx, next, path, type, input, by, cacheTimeSeconds } = opts;

  // Only cache queries, not mutations
  if (type !== "query") {
    return next();
  }

  let cacheKey: string | undefined;
  try {
    const userEmail = ctx.dbUser?.email;
    cacheKey = generateCacheKey(path, by, input as object, userEmail);

    // Try to get from cache first
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      getLogger().info(
        `${CACHE_LOG_PREFIX}[hit] Cache HIT for ${path} (${cacheKey})`,
        { path, cacheKey },
      );
      return {
        ok: true,
        data: superjson.parse(cachedResult),
        marker: middlewareMarker,
      };
    }

    getLogger().info(
      `${CACHE_LOG_PREFIX}[miss] Cache MISS for ${path} (${cacheKey})`,
      { path, cacheKey },
    );

    // Execute the procedure
    const result = await next();

    // Cache successful results
    if (result.ok) {
      const serializedData = superjson.stringify(result.data);
      await redis.setex(cacheKey, cacheTimeSeconds, serializedData);
      getLogger().info(
        `${CACHE_LOG_PREFIX}[set] Cached result for ${path} (${cacheKey}) for ${cacheTimeSeconds}s`,
        { path, cacheKey, cacheTimeSeconds },
      );
    }

    return result;
  } catch (error) {
    getLogger().error(
      `${CACHE_LOG_PREFIX}[error] Cache middleware error: ${String(error)}`,
      { path, cacheKey, error: String(error) },
    );
    // Fall back to executing without cache
    return next();
  }
};

/**
 * This is meant to be the same implementation as authorizedCacheMiddleware so if
 * something/someone comes to change the implementation, make sure it matches above.
 *
 * It could not easily be deduped because typescript is having a hard time.
 */
export const publicCacheMiddleware = async (
  opts: PublicCacheMiddlewareOptions,
): Promise<MiddlewareReturn> => {
  const { ctx, next, path, type, input, by, cacheTimeSeconds } = opts;

  // Only cache queries, not mutations
  if (type !== "query") {
    return next();
  }

  let cacheKey: string | undefined;
  try {
    const userEmail = ctx.dbUser?.email;
    cacheKey = generateCacheKey(path, by, input as object, userEmail);

    // Try to get from cache first
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      getLogger().info(
        `${CACHE_LOG_PREFIX}[hit] Cache HIT for ${path} (${cacheKey})`,
        { path, cacheKey },
      );
      return {
        ok: true,
        data: superjson.parse(cachedResult),
        marker: middlewareMarker,
      };
    }

    getLogger().info(
      `${CACHE_LOG_PREFIX}[miss] Cache MISS for ${path} (${cacheKey})`,
      { path, cacheKey },
    );

    // Execute the procedure
    const result = await next();

    // Cache successful results
    if (result.ok) {
      const serializedData = superjson.stringify(result.data);
      await redis.setex(cacheKey, cacheTimeSeconds, serializedData);
      getLogger().info(
        `${CACHE_LOG_PREFIX}[set] Cached result for ${path} (${cacheKey}) for ${cacheTimeSeconds}s`,
        { path, cacheKey, cacheTimeSeconds },
      );
    }

    return result;
  } catch (error) {
    getLogger().error(
      `${CACHE_LOG_PREFIX}[error] Cache middleware error: ${String(error)}`,
      { path, cacheKey, error: String(error) },
    );
    // Fall back to executing without cache
    return next();
  }
};
