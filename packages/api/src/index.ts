// Placeholder for tRPC router and types
// This will be populated when we move the tRPC code from the web app

// TODO: Move tRPC router and types here

// Export the tRPC router and types
export { appRouter, createCaller, type AppRouter } from "../server/api/root";
export { createTRPCRouter } from "../server/api/trpc";

// Export Prisma client from our generated client
export * from "./generated/prisma-client";
export { PrismaClient } from "./generated/prisma-client";

// Use the same Prisma client singleton from server/db.ts
export { db as prisma } from "../server/db";

export { espn } from "../server/services/espn";

export { resendApi } from "../server/services/resend";

export { msf } from "../server/services/mysportsfeeds";

// Export cache middleware
export {
  authorizedCacheMiddleware,
  publicCacheMiddleware,
} from "../server/cache";
