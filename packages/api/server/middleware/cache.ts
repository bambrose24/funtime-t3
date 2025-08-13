import { TRPCError } from "@trpc/server";
import superjson from "superjson";
import StableStringify from "json-stable-stringify";
import { redis } from "../redis";
import type { authorizedProcedure } from "../api/trpc";
import { getLogger } from "~/utils/logging";

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

type MiddlewareFn = Parameters<(typeof authorizedProcedure)["use"]>[0];

const CACHE_LOG_PREFIX = "[trpc cache]";

export const createCacheMiddleware: (options: CacheOptions) => MiddlewareFn = (
  options,
) => {
  const fn: MiddlewareFn = async ({ ctx, next, path, type, input }) => {
    // Only cache queries, not mutations
    if (type !== "query") {
      return next();
    }

    let cacheKey: string | undefined;
    try {
      const userEmail = ctx.dbUser?.email;
      cacheKey = generateCacheKey(path, options.by, input, userEmail);

      // Try to get from cache first
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        getLogger().info(
          `${CACHE_LOG_PREFIX}[hit] Cache HIT for ${path} (${cacheKey})`,
          { path, cacheKey },
        );
        return superjson.parse(cachedResult);
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
        await redis.setex(cacheKey, options.cacheTimeSeconds, serializedData);
        getLogger().info(
          `${CACHE_LOG_PREFIX}[set] Cached result for ${path} (${cacheKey}) for ${options.cacheTimeSeconds}s`,
          { path, cacheKey, cacheTimeSeconds: options.cacheTimeSeconds },
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
  return fn;
};
