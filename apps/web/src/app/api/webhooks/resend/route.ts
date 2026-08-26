import { type NextRequest, NextResponse } from "next/server";

import { processResendWebhookEvent, verifyResendWebhook } from "@funtime/api";
import { env } from "~/env";
import { logger } from "~/lib/axiom/logger";
import { withAxiom } from "~/lib/axiom/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handler = async (request: NextRequest) => {
  if (!env.RESEND_WEBHOOK_SECRET) {
    logger.error("[resend-webhook] RESEND_WEBHOOK_SECRET is not configured.");
    return new NextResponse("Webhook is not configured", { status: 503 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing webhook signature headers", {
      status: 400,
    });
  }

  const payload = await request.text();
  let event;

  try {
    event = verifyResendWebhook({
      payload,
      svixId,
      svixTimestamp,
      svixSignature,
      webhookSecret: env.RESEND_WEBHOOK_SECRET,
    });
  } catch (error) {
    logger.warn("[resend-webhook] Rejected invalid webhook signature.", {
      error,
      svixId,
    });
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }

  try {
    const result = await processResendWebhookEvent({ svixId, event });
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    logger.error("[resend-webhook] Failed to persist webhook event.", {
      error,
      eventType: event.type,
      svixId,
    });
    return new NextResponse("Unable to process webhook", { status: 500 });
  }
};

export const POST = withAxiom(handler);
