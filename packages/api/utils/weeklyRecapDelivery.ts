import type { PrismaClient } from "../src/generated/prisma-client";

type Identity = {
  league_id: number;
  user_id: number;
  season: number;
  week: number;
};

export async function claimWeeklyRecap(
  db: Pick<PrismaClient, "weeklyRecapDelivery">,
  identity: Identity,
): Promise<boolean> {
  // The unique index makes simultaneous claims atomic across cron processes.
  const inserted = await db.weeklyRecapDelivery.createMany({
    data: { ...identity, state: "sending" },
    skipDuplicates: true,
  });
  if (inserted.count === 1) return true;
  // Compare-and-set: only one runner can retry a confirmed rejection.
  const retry = await db.weeklyRecapDelivery.updateMany({
    where: { ...identity, state: "retryable" },
    data: { state: "sending" },
  });
  return retry.count === 1;
}
