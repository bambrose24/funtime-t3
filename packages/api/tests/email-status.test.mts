import assert from "node:assert/strict";
import test from "node:test";
import { getEmailDisplayStatus } from "../utils/emailStatus.ts";
import { safeEmailPreview } from "../server/services/resend/email-preview.ts";
import { getEmailActivity } from "../server/services/resend/email-activity.ts";
import type { EmailLogs } from "../src/generated/prisma-client/client.ts";

test("keeps delivery failures visible when an engagement event is the latest event", () => {
  assert.deepEqual(
    getEmailDisplayStatus({
      delivery_status: "bounced",
      open_count: 2,
      click_count: 0,
      resend_data: { last_event: "clicked" },
    }),
    {
      delivery: "bounced",
      label: "Bounced",
      opened: true,
      clicked: true,
    },
  );
});
test("missing engagement is unknown and click does not invent an open event", () => {
  const status = getEmailDisplayStatus({
    delivery_status: "queued",
    open_count: 0,
    click_count: 0,
  });
  assert.equal(status.label, "Accepted");
  assert.equal(status.opened, false);
  assert.equal(
    getEmailDisplayStatus({
      delivery_status: "queued",
      open_count: 0,
      click_count: 0,
      resend_data: { last_event: "clicked" },
    }).opened,
    false,
  );
});
test("uses Resend's latest status for historical emails without webhook data", () => {
  assert.equal(
    getEmailDisplayStatus({
      delivery_status: "queued",
      open_count: 0,
      click_count: 0,
      resend_data: { last_event: "bounced" },
    }).label,
    "Bounced",
  );
});
test("preview removes tracking, navigation and executable content", () => {
  const safe = safeEmailPreview(
    `<style>@import url(https://track.example);</style><meta http-equiv="refresh" content="0;url=https://track.example"><script>alert(1)</script><img src="https://track.example/open"><a href="https://track.example/click" onclick="bad()">Make picks</a><div style="background:url(https://track.example)">Hello</div><form action="https://track.example"><input></form>`,
    null,
  )!;
  assert.match(safe, /Make picks/);
  assert.match(safe, /Hello/);
  assert.doesNotMatch(
    safe,
    /https:|src=|href=|onclick|style=|<script|<meta|<form|<input|<img/,
  );
  assert.equal(
    safeEmailPreview(null, "<img src=x>&"),
    "<pre>&lt;img src=x&gt;&amp;</pre>",
  );
  assert.equal(safeEmailPreview(null, null), null);
});
test("activity aggregates only authorized message IDs without leaking webhook payloads", async () => {
  const timestamp = new Date("2026-09-25T00:00:00Z");
  const log = {
    email_log_id: "log1",
    resend_id: "r1",
    ts: timestamp,
    email_type: "week_summary",
    week: 4,
    delivery_status: "bounced",
    failure_reason: "Mailbox missing",
  } as EmailLogs;
  const database = {
    emailDeliveryEvents: {
      groupBy: async (query: any) => {
        assert.deepEqual(query.where.resend_id.in, ["r1"]);
        return [
          {
            resend_id: "r1",
            event_type: "email.opened",
            _count: { _all: 2 },
            _max: { occurred_at: timestamp },
          },
        ];
      },
    },
  } as unknown as Parameters<typeof getEmailActivity>[0];
  const [email] = await getEmailActivity(database, [log]);
  assert.equal(email!.open_count, 2);
  assert.equal(email!.last_opened_at, timestamp);
  assert.equal(email!.click_count, 0);
  assert.equal(email!.delivery_status, "bounced");
  assert.equal("payload" in email!, false);
});
