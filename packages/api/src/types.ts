// Client-safe types that can be imported in browser code
export type MemberRole = "admin" | "member";
export type ScoringType = "standard" | "confidence";
export type PickPolicy = "anytime" | "before_kickoff";
export type LatePolicy = "allow" | "disallow";
export type ReminderPolicy = "daily" | "weekly" | "none";

// Re-export types from Prisma client for server-side use
export type {
  leagues,
  leaguemembers,
  people,
  picks,
  games,
  WeekWinners,
  PrismaClient
} from "./generated/prisma-client"; 