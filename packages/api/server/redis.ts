import Redis from "ioredis";
import { env } from "~/env";
import { getLogger } from "~/utils/logging";

export const redis = new Redis(env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  getLogger().error(`Redis connection error: ${err.message}, ${err.stack}`);
});

redis.on("connect", () => {
  getLogger().info("Redis connected");
});
