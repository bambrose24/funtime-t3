type EspnSeasonGame = {
  season: {
    type: number;
  };
};

export type RegularSeasonEspnLoadResult<T extends EspnSeasonGame> = {
  espnGames: T[];
  skippedEspn: boolean;
  totalFetched: number;
  error?: unknown;
};

/**
 * ESPN failures must not abort cron. Score/time sync can skip; reminders
 * and other DB work still use stored kickoff times.
 */
export async function loadRegularSeasonEspnGames<T extends EspnSeasonGame>(
  fetchAllGames: () => Promise<T[]>,
): Promise<RegularSeasonEspnLoadResult<T>> {
  try {
    const allEspnGames = await fetchAllGames();
    return {
      espnGames: allEspnGames.filter((game) => game.season.type === 2),
      skippedEspn: false,
      totalFetched: allEspnGames.length,
    };
  } catch (error) {
    return {
      espnGames: [],
      skippedEspn: true,
      totalFetched: 0,
      error,
    };
  }
}
