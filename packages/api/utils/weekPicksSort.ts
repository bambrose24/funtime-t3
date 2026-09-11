type TiebreakerGame = {
  ts: Date | string;
  done: boolean | null;
  homescore: number | null;
  awayscore: number | null;
};

type WeekPick = {
  correctPicks: number;
  tiebreakerScore: number | null;
  people: { username: string };
};

export function getStartedTiebreakerScore(
  game: TiebreakerGame | undefined,
  now = new Date(),
): number | null {
  if (!game || (!game.done && new Date(game.ts) > now)) return null;
  return (game.homescore ?? 0) + (game.awayscore ?? 0);
}

export function sortWeekPicks<T extends WeekPick>(
  picks: readonly T[],
  actualTiebreakerScore: number | null,
): T[] {
  return [...picks].sort((a, b) => {
    const correctDifference = b.correctPicks - a.correctPicks;
    if (correctDifference !== 0) return correctDifference;

    if (actualTiebreakerScore !== null) {
      const pointsDifference =
        Math.abs((a.tiebreakerScore ?? 0) - actualTiebreakerScore) -
        Math.abs((b.tiebreakerScore ?? 0) - actualTiebreakerScore);
      if (pointsDifference !== 0) return pointsDifference;
    }

    return a.people.username.localeCompare(b.people.username, "en", {
      sensitivity: "base",
    });
  });
}
