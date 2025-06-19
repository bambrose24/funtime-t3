// Placeholder for tRPC router and types
// This will be populated when we move the tRPC code from the web app

// TODO: Move tRPC router and types here

// Export the tRPC router and types
export { appRouter, type AppRouter, createCaller } from "../server/api/root";
export { createTRPCRouter } from "../server/api/trpc";

// Export Prisma client from our generated client
export { PrismaClient } from "./generated/prisma-client";
export * from "./generated/prisma-client";

// Create and export a Prisma client instance
import { PrismaClient } from "./generated/prisma-client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} 