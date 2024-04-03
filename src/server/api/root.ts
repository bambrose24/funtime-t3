import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { homeRouter } from "./routers/home";
import { sessionRouter } from "./routers/session";
import { timeRouter } from "./routers/time";
import { leagueRouter } from "./routers/league";
import { teamsRouter } from "./routers/teams";
import { gamesRouter } from "./routers/games";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  home: homeRouter,
  session: sessionRouter,
  time: timeRouter,
  league: leagueRouter,
  teams: teamsRouter,
  games: gamesRouter,
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
