export const emailTypeLabels: Record<string, string> = {
  week_reminder: "Pick reminder",
  week_summary: "Weekly summary",
  week_picks: "Picks confirmation",
  league_registration: "League welcome",
  league_broadcast: "League message",
  league_renewal: "League renewal",
};
export const emailStatusLabels: Record<string, string> = {
  queued: "Accepted",
  sent: "Sent",
  delivered: "Delivered",
  delayed: "Delayed",
  delivery_delayed: "Delayed",
  bounced: "Bounced",
  failed: "Failed",
  complained: "Marked as spam",
  suppressed: "Suppressed",
  opened: "Opened",
  clicked: "Clicked",
  canceled: "Canceled",
  scheduled: "Scheduled",
};
export const isEmailFailure = (status: string) =>
  ["bounced", "failed", "complained", "suppressed", "canceled"].includes(
    status,
  );

export function getEmailDisplayStatus(email: {
  delivery_status: string;
  open_count: number;
  click_count: number;
  resend_data?: { last_event: string } | null;
}) {
  const latest = email.resend_data?.last_event;
  // An open/click never erases a recorded bounce or complaint.
  const delivery =
    latest === "opened" || latest === "clicked"
      ? email.delivery_status === "queued"
        ? "delivered"
        : email.delivery_status
      : (latest ?? email.delivery_status);
  return {
    delivery,
    label: emailStatusLabels[delivery] ?? "Unknown",
    opened: email.open_count > 0 || latest === "opened",
    clicked: email.click_count > 0 || latest === "clicked",
  };
}
