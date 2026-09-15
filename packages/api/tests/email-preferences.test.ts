import { expect, test } from "bun:test";
import {
  WEEK_SUMMARY_PREFERENCES_URL,
  wantsWeekSummaryEmail,
} from "../utils/emailPreferences";

test("weekly recap emails default to on", () => {
  expect(wantsWeekSummaryEmail({ week_summary_emails_enabled: true })).toBe(
    true,
  );
  expect(wantsWeekSummaryEmail({ week_summary_emails_enabled: false })).toBe(
    false,
  );
});

test("preferences link goes to the user notifications settings page", () => {
  expect(WEEK_SUMMARY_PREFERENCES_URL).toBe(
    "https://www.play-funtime.com/settings/notifications",
  );
});
