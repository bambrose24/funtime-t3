type LeagueLike = {
  name?: string | null;
};

export function filterLeaguesByQuery<T extends LeagueLike>(
  leagues: readonly T[],
  rawQuery: string,
): T[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return [...leagues];
  }

  return leagues.filter((league) =>
    (league.name ?? "").toLowerCase().includes(query),
  );
}
