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

/** First-kickoff leagues close at the earliest start; others stay open while any game is unstarted. */
export const isWeekClosedForPicks = (
  policy: string | null | undefined,
  games: readonly { ts: Date }[],
  now: Date,
) => {
  const deadline = getWeekPickDeadline(policy, games);
  if (deadline) {
    return isPickLocked(deadline, now);
  }
  return !games.some((game) => game.ts > now);
};

/** Opponent picks stay hidden until the week's earliest kickoff, inclusive. */
export const hasWeekKickedOff = (
  games: readonly { ts: Date | string }[],
  now = new Date(),
) => {
  const kickoff = firstKickoff(games);
  return Boolean(kickoff && isPickLocked(kickoff, now));
};

export const canViewMemberWeekPicks = ({
  viewerMemberId,
  targetMemberId,
  weekHasStarted,
  viewerHasSubmitted,
  weekClosedForPicks,
}: {
  viewerMemberId: number;
  targetMemberId: number;
  weekHasStarted: boolean;
  viewerHasSubmitted: boolean;
  weekClosedForPicks: boolean;
}) =>
  viewerMemberId === targetMemberId ||
  (weekHasStarted && (viewerHasSubmitted || weekClosedForPicks));

/** Replace the league table until this person can no longer pick this week. */
export const shouldHideLeaguePicksTable = (
  viewerHasSubmitted: boolean,
  weekClosedForPicks: boolean,
) => !viewerHasSubmitted && !weekClosedForPicks;
