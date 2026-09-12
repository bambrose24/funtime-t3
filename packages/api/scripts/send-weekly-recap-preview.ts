import { render } from "react-email";
import { Resend } from "resend";
import WeekSummaryEmail from "../emails/week-summary";
import { buildPreview, parsePreviewArgs } from "../utils/weeklyRecapPreview";

async function main() {
  const options = parsePreviewArgs(process.argv.slice(2));
  if (options.help) {
    console.log(`Usage: pnpm email:test-weekly [--to email] [--scenario name] [--league-id id] [--dry-run]
Defaults: bambrose24@gmail.com, tiebreaker, league 123 (placeholder)
Scenarios: tiebreaker, outright, shared, missing-picks, final-week
--dry-run renders plain text without sending or requiring credentials.
Sending requires RESEND_API_KEY. Uses simulated data and makes no database writes.`);
    return;
  }
  const preview = buildPreview(options.scenario, options.to, options.leagueId);
  const element = WeekSummaryEmail(preview);
  const text = await render(element, { plainText: true });
  if (options.dryRun) {
    console.log(text);
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
  const html = await render(element);
  // Deliberately bypass production claims and logs: this is a repeatable preview,
  // addressed to exactly one requested inbox, with no real league/member data.
  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from: "Funtime System <no-reply@play-funtime.com>",
      to: [options.to],
      subject: `[TEST] Sunday Crew · Your Week ${preview.week} results`,
      html,
      text,
    },
    { idempotencyKey: `weekly-recap-preview/${crypto.randomUUID()}` },
  );
  if (error || !data?.id)
    throw new Error(
      `Preview was not confirmed sent (${error?.name ?? "missing message ID"}).`,
    );
  console.log(`Preview accepted by Resend. Message ID: ${data.id}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Preview failed.");
  process.exitCode = 1;
});
