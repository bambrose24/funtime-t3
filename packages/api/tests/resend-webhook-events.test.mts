import assert from "node:assert/strict";
import test from "node:test";

import type { WebhookEventPayload } from "resend";

import {
  getEmailDeliveryUpdate,
  isTrackedResendWebhookEvent,
  type TrackedResendWebhookEvent,
} from "../server/services/resend/webhook-events.ts";

const occurredAt = new Date("2026-08-26T03:00:00.000Z");
const baseData = {
  created_at: "2026-08-26T02:59:59.000Z",
  email_id: "email_123",
  message_id: "message_123",
  from: "Funtime <no-reply@play-funtime.com>",
  to: ["player@example.com"],
  subject: "Test email",
};

const event = <Type extends TrackedResendWebhookEvent["type"]>(
  type: Type,
  extraData: Record<string, unknown> = {},
) =>
  ({
    type,
    created_at: occurredAt.toISOString(),
    data: { ...baseData, ...extraData },
  }) as Extract<TrackedResendWebhookEvent, { type: Type }>;

test("tracks delivery outcome events but ignores engagement events", () => {
  assert.equal(isTrackedResendWebhookEvent(event("email.delivered")), true);
  assert.equal(
    isTrackedResendWebhookEvent({
      type: "email.opened",
      created_at: occurredAt.toISOString(),
      data: baseData,
    } satisfies WebhookEventPayload),
    false,
  );
});

test("records successful delivery and clears a prior failure", () => {
  assert.deepEqual(
    getEmailDeliveryUpdate(event("email.delivered"), occurredAt),
    {
      delivery_status: "delivered",
      delivered_at: occurredAt,
      failed_at: null,
      failure_reason: null,
    },
  );
});

test("preserves provider failure and bounce reasons", () => {
  assert.deepEqual(
    getEmailDeliveryUpdate(
      event("email.failed", { failed: { reason: "reached_daily_quota" } }),
      occurredAt,
    ),
    {
      delivery_status: "failed",
      failed_at: occurredAt,
      failure_reason: "reached_daily_quota",
    },
  );

  assert.deepEqual(
    getEmailDeliveryUpdate(
      event("email.bounced", {
        bounce: {
          message: "Recipient does not exist",
          subType: "General",
          type: "Permanent",
        },
      }),
      occurredAt,
    ),
    {
      delivery_status: "bounced",
      failed_at: occurredAt,
      failure_reason: "Recipient does not exist",
    },
  );
});

test("records complaint and suppression outcomes", () => {
  assert.deepEqual(
    getEmailDeliveryUpdate(event("email.complained"), occurredAt),
    {
      delivery_status: "complained",
      failed_at: occurredAt,
      failure_reason: "Recipient marked the email as spam.",
    },
  );

  assert.deepEqual(
    getEmailDeliveryUpdate(
      event("email.suppressed", {
        suppressed: {
          message: "Address is on the account suppression list",
          type: "OnAccountSuppressionList",
        },
      }),
      occurredAt,
    ),
    {
      delivery_status: "suppressed",
      failed_at: occurredAt,
      failure_reason: "Address is on the account suppression list",
    },
  );
});
