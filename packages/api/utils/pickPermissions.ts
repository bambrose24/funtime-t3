export const isSuperAdminUser = (email?: string | null) =>
  email?.toLowerCase() === "bambrose24@gmail.com";

/** Kickoff itself is locked. Only explicit super-admin edits may bypass it. */
export const isPickLocked = (
  kickoff: Date,
  now: Date,
  overrideActorEmail?: string | null,
) => kickoff <= now && !isSuperAdminUser(overrideActorEmail);

/** Legacy all-week/null settings retain the existing per-game lock behavior. */
export const getWeekPickDeadline = (
  policy: string | null | undefined,
  games: readonly { ts: Date }[],
): Date | null =>
  policy === "close_at_first_game_start" && games.length
    ? new Date(Math.min(...games.map((game) => game.ts.getTime())))
    : null;
