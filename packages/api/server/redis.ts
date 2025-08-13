import Redis from "ioredis";
import { env } from "~/env";
import { getLogger } from "~/utils/logging";

const url = env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(url, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  getLogger().error(`❌ Redis connection error: ${err.message}, ${err.stack}`);
});

redis.on("connect", () => {
  getLogger().info(`✅ Redis connected to ${url}`);
});
