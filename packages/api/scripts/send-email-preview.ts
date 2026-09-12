import { render } from "react-email";
import { Resend } from "resend";
import {
  emailPreviews,
  emailTestHelp,
  parseEmailTestArgs,
  type EmailPreviewId,
} from "../utils/emailPreview";
import { setTimeout as delay } from "node:timers/promises";

async function main() {
  const options = parseEmailTestArgs(process.argv.slice(2));
  if (options.list) {
    console.log(emailTestHelp());
    return;
  }
  const ids: EmailPreviewId[] = options.all
    ? (Object.keys(emailPreviews) as EmailPreviewId[])
    : [options.type!];
  if (options.dryRun) {
    for (const id of ids) {
      const definition = emailPreviews[id];
      const preview = definition.build({
        ...options,
        scenario: options.scenario ?? definition.scenarios[0],
      });
      console.log(
        `[TEST] ${id}: ${preview.subject}\n${await render(preview.element, { plainText: true })}`,
      );
    }
    return;
  }
  if (
    ["E2E_MODE", "FUNTIME_DISABLE_EMAILS"].some((name) =>
      ["1", "true", "yes", "on"].includes(
        (process.env[name] ?? "").toLowerCase(),
      ),
    )
  ) {
    throw new Error(
      "Email sending is disabled by E2E_MODE or FUNTIME_DISABLE_EMAILS.",
    );
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey)
    throw new Error(
      "RESEND_API_KEY is required. Set it in your environment or local .env.local file.",
    );
  const client = new Resend(apiKey);
  for (const [index, id] of ids.entries()) {
    if (index > 0) await delay(1000);
    const definition = emailPreviews[id];
    const preview = definition.build({
      ...options,
      scenario: options.scenario ?? definition.scenarios[0],
    });
    const html = await render(preview.element);
    const text = await render(preview.element, { plainText: true });
    // Deliberately bypass production claims and logs: this is a repeatable preview,
    // addressed to exactly one requested inbox, with no real league/member data.
    const { data, error } = await client.emails.send(
      {
        from: "Funtime System <no-reply@play-funtime.com>",
        to: [options.to],
        subject: `[TEST: ${id}] ${preview.subject}`,
        html,
        text,
      },
      { idempotencyKey: `email-preview/${crypto.randomUUID()}` },
    );
    if (error || !data?.id)
      throw new Error(
        `Preview was not confirmed sent (${error?.name ?? "missing message ID"}).`,
      );
    console.log(`${id} preview accepted by Resend. Message ID: ${data.id}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Preview failed.");
  process.exitCode = 1;
});
