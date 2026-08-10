import {
  MemberRole,
  type PrismaClient,
} from "../../../../src/generated/prisma-client";
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

export async function getMissedPickCounts(
  db: PrismaClient,
  season: number,
  members: { membership_id: number; ts: Date }[],
) {
  const memberIds = members.map((member) => member.membership_id);
  const [seasonGames, pickCounts] = await Promise.all([
    db.games.findMany({
      where: { season },
      select: { ts: true },
    }),
    db.picks.groupBy({
      by: ["member_id"],
      where: {
        member_id: { in: memberIds },
        season,
      },
      _count: { pickid: true },
    }),
  ]);
  const pickCountByMemberId = new Map(
    pickCounts.map((count) => [count.member_id, count._count.pickid]),
  );

  return new Map(
    members.map((member) => {
      const gamesSinceJoining = seasonGames.filter(
        (game) => game.ts >= member.ts,
      ).length;
      const submittedPicks = pickCountByMemberId.get(member.membership_id) ?? 0;

      return [
        member.membership_id,
        Math.max(gamesSinceJoining - submittedPicks, 0),
      ];
    }),
  );
}
