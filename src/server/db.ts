import { PrismaClient } from "~/generated/prisma-client";

import { env } from "~/env";
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
  });

  if (env.VERCEL_ENV === "production") {
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
