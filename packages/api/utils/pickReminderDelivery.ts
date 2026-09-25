import type { PrismaClient } from "../src/generated/prisma-client/client";

export type PickReminderIdentity = {
  league_id: number;
  user_id: number;
  season: number;
  week: number;
};

export async function claimPickReminder(
  db: Pick<PrismaClient, "pickReminderDelivery">,
  identity: PickReminderIdentity,
): Promise<boolean> {
  const inserted = await db.pickReminderDelivery.createMany({
    data: { ...identity, state: "sending" },
    skipDuplicates: true,
  });
  if (inserted.count === 1) return true;
  // Only a confirmed rejection can be retried. Never expire ambiguous sends.
  const retry = await db.pickReminderDelivery.updateMany({
    where: { ...identity, state: "retryable" },
    data: { state: "sending" },
  });
  return retry.count === 1;
}
