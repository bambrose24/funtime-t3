type LeagueSummary = {
  league_id: number;
  season: number;
};

export function getSingleActiveLeague<T extends LeagueSummary>(
  leagues: T[] | null | undefined,
  season: number,
): T | null {
  if (!leagues?.length) {
    return null;
  }

  const activeLeagues = leagues.filter((league) => league.season === season);
  if (activeLeagues.length !== 1) {
    return null;
  }

  return activeLeagues[0] ?? null;
}
