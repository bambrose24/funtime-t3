import type {
  PrismaClient,
  EmailLogs,
} from "../../../src/generated/prisma-client/client";

type ActivityDatabase = Pick<PrismaClient, "emailDeliveryEvents">;

export async function getEmailActivity(
  database: ActivityDatabase,
  logs: EmailLogs[],
) {
  if (logs.length === 0) return [];
  const events = await database.emailDeliveryEvents.groupBy({
    by: ["resend_id", "event_type"],
    where: {
      resend_id: { in: logs.map((log) => log.resend_id) },
      event_type: { in: ["email.opened", "email.clicked"] },
    },
    _count: { _all: true },
    _max: { occurred_at: true },
  });
  const byMessageAndType = new Map(
    events.map((event) => [`${event.resend_id}:${event.event_type}`, event]),
  );
  return logs.map((log) => {
    const opened = byMessageAndType.get(`${log.resend_id}:email.opened`);
    const clicked = byMessageAndType.get(`${log.resend_id}:email.clicked`);
    return {
      id: log.email_log_id,
      resend_id: log.resend_id,
      sent_at: log.ts,
      email_type: log.email_type,
      week: log.week,
      delivery_status: log.delivery_status,
      last_event_at: log.last_event_at,
      delivered_at: log.delivered_at,
      failed_at: log.failed_at,
      failure_reason: log.failure_reason,
      open_count: opened?._count._all ?? 0,
      last_opened_at: opened?._max.occurred_at ?? null,
      click_count: clicked?._count._all ?? 0,
      last_clicked_at: clicked?._max.occurred_at ?? null,
    };
  });
}
