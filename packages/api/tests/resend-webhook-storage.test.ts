import { beforeEach, expect, mock, test } from "bun:test";
import type { WebhookEventPayload } from "resend";

const events = new Map<string, any>();
let log: any;
const updateMany = mock(async ({ where, data }: any) => {
  if (!log || log.resend_id !== where.resend_id) return { count: 0 };
  if (log.last_event_at && log.last_event_at > where.OR[1].last_event_at.lte)
    return { count: 0 };
  Object.assign(log, data);
  return { count: 1 };
});
const db: any = {
  emailLogs: { updateMany },
  emailDeliveryEvents: {
    createMany: async ({ data: [event] }: any) => {
      if (events.has(event.svix_id)) return { count: 0 };
      events.set(event.svix_id, event);
      return { count: 1 };
    },
    findFirst: async ({ where }: any) =>
      [...events.values()]
        .filter(
          (e) =>
            e.resend_id === where.resend_id &&
            where.event_type.in.includes(e.event_type),
        )
        .sort((a, b) => b.occurred_at - a.occurred_at)[0] ?? null,
  },
  $transaction: async (callback: any) => callback(db),
};
mock.module("../server/db", () => ({ db }));
const { processResendWebhookEvent, reconcileEmailDeliveryState } =
  await import("../server/services/resend/webhooks");
const event = (type: string, minute: number): WebhookEventPayload =>
  ({
    type,
    created_at: `2026-09-25T00:${minute.toString().padStart(2, "0")}:00Z`,
    data: { email_id: "r1", bounce: { message: "Mailbox missing" } },
  }) as WebhookEventPayload;
beforeEach(() => {
  events.clear();
  log = { resend_id: "r1", delivery_status: "queued", last_event_at: null };
  updateMany.mockClear();
});

test("duplicate engagement callbacks are stored only once and never update delivery", async () => {
  await processResendWebhookEvent({
    svixId: "open",
    event: event("email.opened", 2),
  });
  expect(
    (
      await processResendWebhookEvent({
        svixId: "open",
        event: event("email.opened", 2),
      })
    ).duplicate,
  ).toBe(true);
  expect(events.size).toBe(1);
  expect(updateMany).not.toHaveBeenCalled();
});
test("out-of-order engagement does not prevent a bounce from being recorded", async () => {
  await processResendWebhookEvent({
    svixId: "open",
    event: event("email.opened", 3),
  });
  await processResendWebhookEvent({
    svixId: "bounce",
    event: event("email.bounced", 2),
  });
  await processResendWebhookEvent({
    svixId: "delivered",
    event: event("email.delivered", 1),
  });
  expect(log.delivery_status).toBe("bounced");
  expect(log.failure_reason).toBe("Mailbox missing");
});
test("events arriving before the send log reconcile the delivery outcome even when click is newest", async () => {
  log = null;
  await processResendWebhookEvent({
    svixId: "delivered",
    event: event("email.delivered", 1),
  });
  await processResendWebhookEvent({
    svixId: "clicked",
    event: event("email.clicked", 2),
  });
  log = { resend_id: "r1", delivery_status: "queued", last_event_at: null };
  await reconcileEmailDeliveryState("r1");
  expect(log.delivery_status).toBe("delivered");
  expect(events.size).toBe(2);
});
