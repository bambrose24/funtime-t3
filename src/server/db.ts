import "server-only";
import { PrismaClient } from "@prisma/client";

import { env } from "~/env";
import { getServerLogger } from "~/utils/logging";

const LOG_PREFIX = `[prisma client]`;

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
  });

  prisma.$on("query", (e) => {
    getServerLogger().info(`${LOG_PREFIX} Query executed`, {
      prismaQueryDurationMs: e.duration,
      prismaQuery: e.query,
    });
  });
  return prisma;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
