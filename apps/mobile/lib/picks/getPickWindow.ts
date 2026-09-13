import {
  getWeekPickDeadline,
  isPickLocked,
} from "@funtime/api/utils/pickPermissions";

export type PickWindowGame = {
  gid: number;
  ts: Date;
  is_tiebreaker?: boolean | null;
};

export function getPickWindow({
  policy,
  games,
  now,
}: {
  policy: string | null | undefined;
  games: readonly PickWindowGame[];
  now: Date;
}): {
  deadline: Date | null;
  isWeekClosed: boolean;
  lockedGameIds: ReadonlySet<number>;
  isTiebreakerLocked: boolean;
} {
  const deadline = getWeekPickDeadline(policy, games);
  const isWeekClosed = deadline != null && isPickLocked(deadline, now);

  const lockedGameIds = new Set<number>();
  for (const game of games) {
    if (isWeekClosed || isPickLocked(game.ts, now)) {
      lockedGameIds.add(game.gid);
    }
  }

  const tiebreaker = games.find((game) => game.is_tiebreaker);
  const isTiebreakerLocked = tiebreaker
    ? lockedGameIds.has(tiebreaker.gid)
    : isWeekClosed;

  return {
    deadline,
    isWeekClosed,
    lockedGameIds,
    isTiebreakerLocked,
  };
}
