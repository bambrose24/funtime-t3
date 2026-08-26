import type { WebhookEventPayload } from "resend";

import type { EmailDeliveryStatus } from "../../../src/generated/prisma-client";

const TRACKED_EVENT_TYPES = [
  "email.delivered",
  "email.delivery_delayed",
  "email.failed",
  "email.bounced",
  "email.complained",
  "email.suppressed",
] as const;

type TrackedEventType = (typeof TRACKED_EVENT_TYPES)[number];
export type TrackedResendWebhookEvent = Extract<
  WebhookEventPayload,
  { type: TrackedEventType }
>;

export type EmailDeliveryUpdate = {
  delivery_status: EmailDeliveryStatus;
  delivered_at?: Date | null;
  failed_at?: Date | null;
  failure_reason?: string | null;
};

const trackedEventTypes = new Set<string>(TRACKED_EVENT_TYPES);

export const isTrackedResendWebhookEvent = (
  event: WebhookEventPayload,
): event is TrackedResendWebhookEvent => trackedEventTypes.has(event.type);

export const getEmailDeliveryUpdate = (
  event: TrackedResendWebhookEvent,
  occurredAt = new Date(event.created_at),
): EmailDeliveryUpdate => {
  switch (event.type) {
    case "email.delivered":
      return {
        delivery_status: "delivered",
        delivered_at: occurredAt,
        failed_at: null,
        failure_reason: null,
      };
    case "email.delivery_delayed":
      return { delivery_status: "delayed" };
    case "email.failed":
      return {
        delivery_status: "failed",
        failed_at: occurredAt,
        failure_reason: event.data.failed.reason,
      };
    case "email.bounced":
      return {
        delivery_status: "bounced",
        failed_at: occurredAt,
        failure_reason: event.data.bounce.message,
      };
    case "email.complained":
      return {
        delivery_status: "complained",
        failed_at: occurredAt,
        failure_reason: "Recipient marked the email as spam.",
      };
    case "email.suppressed":
      return {
        delivery_status: "suppressed",
        failed_at: occurredAt,
        failure_reason: event.data.suppressed.message,
      };
  }
};
