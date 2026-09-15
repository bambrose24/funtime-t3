export const WEEK_SUMMARY_PREFERENCES_PATH = "/settings/notifications";
export const WEEK_SUMMARY_PREFERENCES_URL = `https://www.play-funtime.com${WEEK_SUMMARY_PREFERENCES_PATH}`;

export function wantsWeekSummaryEmail(person: {
  week_summary_emails_enabled: boolean;
}) {
  return person.week_summary_emails_enabled;
}
