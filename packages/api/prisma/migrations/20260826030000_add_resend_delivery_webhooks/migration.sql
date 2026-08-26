CREATE TYPE "EmailDeliveryStatus" AS ENUM (
  'queued',
  'delivered',
  'delayed',
  'failed',
  'bounced',
  'complained',
  'suppressed'
);

ALTER TABLE "EmailLogs"
ADD COLUMN "delivery_status" "EmailDeliveryStatus" NOT NULL DEFAULT 'queued',
ADD COLUMN "last_event_at" TIMESTAMPTZ(6),
ADD COLUMN "delivered_at" TIMESTAMPTZ(6),
ADD COLUMN "failed_at" TIMESTAMPTZ(6),
ADD COLUMN "failure_reason" TEXT;

CREATE TABLE "EmailDeliveryEvents" (
  "id" TEXT NOT NULL,
  "svix_id" TEXT NOT NULL,
  "resend_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL,
  "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload" JSONB NOT NULL,

  CONSTRAINT "EmailDeliveryEvents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailDeliveryEvents_svix_id_key"
ON "EmailDeliveryEvents"("svix_id");

CREATE INDEX "idx_emaildeliveryevents_resend_occurred"
ON "EmailDeliveryEvents"("resend_id", "occurred_at");

CREATE INDEX "idx_emaildeliveryevents_occurred_at"
ON "EmailDeliveryEvents"("occurred_at");
