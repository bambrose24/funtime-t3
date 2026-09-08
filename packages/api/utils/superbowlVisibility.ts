import type { PrismaClient } from "../src/generated/prisma-client";

/** Reveal predictions at the same scheduled kickoff that locks owner edits. */
export async function hasSeasonKickedOff(
  db: Pick<PrismaClient, "games">,
  season: number,
  now = new Date(),
): Promise<boolean> {
  return Boolean(
    await db.games.findFirst({
      where: { season, ts: { lte: now } },
      select: { gid: true },
    }),
  );
}

export function canViewSuperbowlPrediction(
  viewerMemberId: number,
  targetMemberId: number | null,
  seasonStarted: boolean,
): boolean {
  return viewerMemberId === targetMemberId || seasonStarted;
}
