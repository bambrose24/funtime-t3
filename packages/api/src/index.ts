// Placeholder for tRPC router and types
// This will be populated when we move the tRPC code from the web app

// TODO: Move tRPC router and types here

// Export the tRPC router and types
export { appRouter, type AppRouter, createCaller } from "../server/api/root";
export { createTRPCRouter } from "../server/api/trpc";

// Export Prisma client from our generated client
export { PrismaClient } from "./generated/prisma-client";
export * from "./generated/prisma-client";

// Use the same Prisma client singleton from server/db.ts
export { db as prisma } from "../server/db";
