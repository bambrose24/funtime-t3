import { Resend, type WebhookEventPayload } from "resend";

import { Prisma } from "../../../src/generated/prisma-client";
import { getLogger } from "../../../utils/logging";
import { db } from "../../db";
import {
  getEmailDeliveryUpdate,
  isTrackedResendWebhookEvent,
  type TrackedResendWebhookEvent,
} from "./webhook-events";

const resendWebhookVerifier = new Resend();

export const verifyResendWebhook = ({
  payload,
  svixId,
  svixTimestamp,
  svixSignature,
  webhookSecret,
}: {
  payload: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
  webhookSecret: string;
}) =>
  resendWebhookVerifier.webhooks.verify({
    payload,
    headers: {
      id: svixId,
      timestamp: svixTimestamp,
      signature: svixSignature,
    },
    webhookSecret,
  });

type EmailLogWriter = Pick<Prisma.TransactionClient, "emailLogs">;

const applyEmailDeliveryUpdate = async ({
  database,
  event,
  occurredAt,
}: {
  database: EmailLogWriter;
  event: TrackedResendWebhookEvent;
  occurredAt: Date;
}) => {
  const update = getEmailDeliveryUpdate(event, occurredAt);
  const result = await database.emailLogs.updateMany({
    where: {
      resend_id: event.data.email_id,
      OR: [{ last_event_at: null }, { last_event_at: { lte: occurredAt } }],
    },
    data: {
      ...update,
      last_event_at: occurredAt,
    },
  });

  return result.count;
};

export const processResendWebhookEvent = async ({
  svixId,
  event,
}: {
  svixId: string;
  event: WebhookEventPayload;
}) => {
  if (!isTrackedResendWebhookEvent(event)) {
    return { handled: false, duplicate: false, matchedEmailLogs: 0 };
  }

  const occurredAt = new Date(event.created_at);
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error(`Invalid Resend webhook timestamp: ${event.created_at}`);
  }

  return await db.$transaction(async (transaction) => {
    const inserted = await transaction.emailDeliveryEvents.createMany({
      data: [
        {
          svix_id: svixId,
          resend_id: event.data.email_id,
          event_type: event.type,
          occurred_at: occurredAt,
          payload: JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue,
        },
      ],
      skipDuplicates: true,
    });

    if (inserted.count === 0) {
      return { handled: true, duplicate: true, matchedEmailLogs: 0 };
    }

    const matchedEmailLogs = await applyEmailDeliveryUpdate({
      database: transaction,
      event,
      occurredAt,
    });

    return { handled: true, duplicate: false, matchedEmailLogs };
  });
};

export const reconcileEmailDeliveryState = async (resendId: string) => {
  let latestEvent;
  try {
    latestEvent = await db.emailDeliveryEvents.findFirst({
      where: { resend_id: resendId },
      orderBy: [{ occurred_at: "desc" }, { received_at: "desc" }],
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      getLogger().warn(
        "[resend-webhook] Delivery event table is not available; skipping reconciliation.",
      );
      return 0;
    }
    throw error;
  }

  if (!latestEvent) {
    return 0;
  }

  const event = latestEvent.payload as unknown as WebhookEventPayload;
  if (!isTrackedResendWebhookEvent(event) || event.data.email_id !== resendId) {
    return 0;
  }

  return await applyEmailDeliveryUpdate({
    database: db,
    event,
    occurredAt: latestEvent.occurred_at,
  });
};
