import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma-client/client";
import { env } from "../env.js";
import { config } from "../utils/config";

import { getLogger } from "../utils/logging";

const LOG_PREFIX = `[prisma client]`;

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    // Match Prisma 6 engine timeouts; pg defaults are unbounded connect + 10s idle.
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000,
  });

  const prisma = new PrismaClient({
    adapter,
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
  });

  if (config.logging.level !== "error") {
    prisma.$on("query", (e) => {
      getLogger().info(`${LOG_PREFIX} Query executed`, {
        prismaQueryDurationMs: e.duration,
        prismaQuery: e.query,
      });
    });
  }
  return prisma;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
