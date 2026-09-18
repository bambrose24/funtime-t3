export const isSuperAdminUser = (email?: string | null) =>
  email?.toLowerCase() === "bambrose24@gmail.com";

/** Kickoff itself is locked. Only explicit super-admin edits may bypass it. */
export const isPickLocked = (
  kickoff: Date,
  now: Date,
  overrideActorEmail?: string | null,
) => kickoff <= now && !isSuperAdminUser(overrideActorEmail);

const firstKickoff = (games: readonly { ts: Date | string }[]) =>
  games.length
    ? new Date(Math.min(...games.map((game) => new Date(game.ts).getTime())))
    : null;

/** Legacy all-week/null settings retain the existing per-game lock behavior. */
export const getWeekPickDeadline = (
  policy: string | null | undefined,
  games: readonly { ts: Date }[],
): Date | null =>
  policy === "close_at_first_game_start" ? firstKickoff(games) : null;

/** Opponent picks stay hidden until the week's earliest kickoff, inclusive. */
export const hasWeekKickedOff = (
  games: readonly { ts: Date | string }[],
  now = new Date(),
) => {
  const kickoff = firstKickoff(games);
  return Boolean(kickoff && isPickLocked(kickoff, now));
};

export const canViewMemberWeekPicks = (
  viewerMemberId: number,
  targetMemberId: number,
  weekHasStarted: boolean,
) => viewerMemberId === targetMemberId || weekHasStarted;
