import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { homeRouter } from "./routers/home";
import { sessionRouter } from "./routers/session";
import { timeRouter } from "./routers/time";
import { leagueRouter } from "./routers/league";
import { teamsRouter } from "./routers/teams";
import { gamesRouter } from "./routers/games";
import { leaderboardRouter } from "./routers/leaderboard";
import { settingsRouter } from "./routers/settings";
import { playerProfileRouter } from "./routers/playerProfileRouter";
import { picksRouter } from "./routers/picks";
import { authRouter } from "./routers/auth";
import { messagesRouter } from "./routers/messages";
import { memberRouter } from "./routers/member";
import { generalAdminRouter } from "./routers/generalAdmin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  home: homeRouter,
  picks: picksRouter,
  session: sessionRouter,
  settings: settingsRouter,
  time: timeRouter,
  league: leagueRouter,
  teams: teamsRouter,
  games: gamesRouter,
  leaderboard: leaderboardRouter,
  playerProfile: playerProfileRouter,
  messages: messagesRouter,
  member: memberRouter,
  generalAdmin: generalAdminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
