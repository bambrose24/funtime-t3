type ShareLeagueLike = {
  status?: string | null;
  share_code?: string | null;
  name?: string | null;
} | null;

export type ShareLeagueInvitePayload = {
  url: string;
  message: string;
};

export function getShareLeagueInvite(
  league: ShareLeagueLike,
  baseUrl = "https://play-funtime.com",
): ShareLeagueInvitePayload | null {
  if (!league || league.status !== "not_started") {
    return null;
  }

  const shareCode = league.share_code?.trim();
  if (!shareCode) {
    return null;
  }

  const leagueName = league.name?.trim() || "my league";
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const url = `${normalizedBaseUrl}/join-league/${shareCode}`;

  return {
    url,
    message: `Join "${leagueName}" on Funtime: ${url}`,
  };
}
