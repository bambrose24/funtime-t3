# League email activity

League admins can open Members → View Emails to see stored delivery outcomes,
recorded opens/clicks, timestamps, and failure reasons. Details → Refresh from
Resend retrieves the latest provider status and content for that message. The
list itself makes no Resend requests in updated web/mobile clients. Older mobile
clients remain compatible with the original memberEmails response.

## Resend setup

Use the existing signed webhook at `/api/webhooks/resend` with its configured
`RESEND_WEBHOOK_SECRET`. Subscribe it to `email.sent`, `email.delivered`,
`email.delivery_delayed`, `email.failed`, `email.bounced`, `email.complained`,
`email.suppressed`, **`email.opened`**, and **`email.clicked`**.

Open and click tracking must be enabled on the sending domain in Resend for
engagement events to be emitted. This PR does not change account settings.
See [Resend tracking setup](https://resend.com/blog/introducing-custom-tracking-domain)
and [webhook events](https://resend.com/docs/webhooks/event-types).

Previously ignored engagement events are not reconstructed automatically. A
single-message refresh can show Resend's latest event for an older email, but
does not invent its historical event count or timestamp. Counts represent
webhooks recorded by this app, deduplicated by the signed event ID.

Delivery and engagement are independent: an open/click cannot clear a bounce or
complaint or prevent an older delivery event from being reconciled. No new
database migration is needed; events use the existing EmailDeliveryEvents table.

## Interpreting activity

- Accepted means the message was accepted for sending, not necessarily delivered.
- Delivered means the recipient's mail server accepted it, not that it reached the inbox.
- No open/click recorded does not prove the recipient did not read the message.
  Tracking may be disabled or blocked, and privacy tools/link scanners can create
  automated events.
- Previews remove remote images, links, scripts, and CSS to avoid generating
  tracking events when an admin inspects an email. Formatting is simplified.

Raw webhook payloads, IP addresses, and click URLs are not exposed by the admin
activity API. Both list and individual detail requests enforce league admin
access and scope logs to the requested member and league.
