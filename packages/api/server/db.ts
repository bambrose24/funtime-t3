import { env } from "../env.js";
import { PrismaClient } from "../src/generated/prisma-client";
import { config } from "../utils/config";

import { getLogger } from "~/utils/logging";

const LOG_PREFIX = `[prisma client]`;

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
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
