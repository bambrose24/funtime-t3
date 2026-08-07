import { MemberRole } from "../../../../src/generated/prisma-client";
import {
  CAN_CREATE_NEXT_SEASON_LEAGUES,
  DEFAULT_SEASON,
} from "../../../../utils/const";
import { getRenewalIneligibilityReason as getBaseRenewalIneligibilityReason } from "../../../../utils/seasonRenewal";

const MAX_LEAGUE_NAME_LENGTH = 100;

export function suggestRenewalLeagueName(
  rawName: string,
  season = DEFAULT_SEASON,
) {
  const trimmed = rawName.trim();
  const withoutTrailingYear = trimmed
    .replace(/\s*(?:-\s*)?\(?20\d{2}\)?\s*$/, "")
    .trim();
  const baseName = withoutTrailingYear || trimmed || "Funtime League";
  const seasonSuffix = ` ${season}`;
  const maxBaseLength = MAX_LEAGUE_NAME_LENGTH - seasonSuffix.length;
  const trimmedBaseName =
    baseName.length > maxBaseLength
      ? baseName.slice(0, maxBaseLength).trim()
      : baseName;
  const suggestedName = `${trimmedBaseName || "Funtime League"}${seasonSuffix}`;

  if (suggestedName.length <= MAX_LEAGUE_NAME_LENGTH) {
    return suggestedName;
  }

  return suggestedName.slice(0, MAX_LEAGUE_NAME_LENGTH);
}

export function isLeagueAdmin(
  memberships:
    | {
        league_id: number;
        role: string | null;
      }[]
    | undefined,
  leagueId: number,
) {
  return memberships?.some(
    (member) =>
      member.league_id === leagueId && member.role === MemberRole.admin,
  );
}

type PriorLeagueForRenewal = {
  season: number;
  status: string;
};

export function getRenewalIneligibilityReason(
  priorLeague: PriorLeagueForRenewal,
) {
  return getBaseRenewalIneligibilityReason(priorLeague, {
    targetSeason: DEFAULT_SEASON,
    renewalsOpen: CAN_CREATE_NEXT_SEASON_LEAGUES,
  });
}
