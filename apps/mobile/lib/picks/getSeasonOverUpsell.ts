type NextLeagueLike = {
  name?: string | null;
  share_code?: string | null;
  status?: string | null;
  season?: number | null;
} | null;

export type SeasonOverUpsell = {
  leagueName: string;
  shareCode: string;
  season: number | null;
};

export function getSeasonOverUpsell(
  nextLeague: NextLeagueLike,
): SeasonOverUpsell | null {
  if (!nextLeague) {
    return null;
  }

  if (nextLeague.status !== "not_started") {
    return null;
  }

  const shareCode = nextLeague.share_code?.trim();
  if (!shareCode) {
    return null;
  }

  const leagueName = nextLeague.name?.trim() || "next season league";

  return {
    leagueName,
    shareCode,
    season: typeof nextLeague.season === "number" ? nextLeague.season : null,
  };
}
