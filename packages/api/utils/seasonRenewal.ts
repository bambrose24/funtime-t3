export const FIRST_SELF_SERVICE_RENEWAL_SEASON = 2027;

type PriorLeagueForRenewal = {
  season: number;
  status: string;
};

export function canCreateNextSeasonLeagues(currentSeason: number) {
  return currentSeason >= FIRST_SELF_SERVICE_RENEWAL_SEASON;
}

export function getRenewalIneligibilityReason(
  priorLeague: PriorLeagueForRenewal,
  {
    targetSeason,
    renewalsOpen,
  }: {
    targetSeason: number;
    renewalsOpen: boolean;
  },
) {
  if (!renewalsOpen) {
    return "Next-season league creation is not open yet";
  }

  if (priorLeague.season >= targetSeason) {
    return "Only prior-season leagues can be renewed";
  }

  if (priorLeague.status !== "completed") {
    return "Only completed leagues can be renewed";
  }

  return null;
}
