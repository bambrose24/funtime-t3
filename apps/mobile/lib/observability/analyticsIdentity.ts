import type { IdentityTransition } from "@/lib/auth/identitySession";

/** Minimal PostHog surface used for identity sync (injectable in tests). */
export type AnalyticsClient = {
  identify: (distinctId: string) => void;
  reset: () => void;
};

/**
 * Keep analytics identity aligned with auth transitions from MOB-01a.
 * - signed_in → identify
 * - signed_out → reset
 * - switched → reset then identify (never leave prior user attached)
 */
export function syncAnalyticsIdentity(
  transition: IdentityTransition,
  client: AnalyticsClient | null | undefined,
): void {
  if (!client) {
    return;
  }
  switch (transition.type) {
    case "none":
      return;
    case "signed_in":
      client.identify(transition.uid);
      return;
    case "signed_out":
      client.reset();
      return;
    case "switched":
      client.reset();
      client.identify(transition.nextUid);
      return;
  }
}

const SENSITIVE_META_KEYS = new Set([
  "password",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "authorization",
  "email",
  "phone",
  "cookie",
  "session",
]);

const MAX_META_STRING = 500;
const MAX_META_KEYS = 20;

/**
 * Bound and redact logger metadata before it ships on `mobile_log`.
 * Drops sensitive keys, truncates long strings, and caps key count.
 */
export function sanitizeLogMeta(
  meta: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  let count = 0;
  for (const [key, value] of Object.entries(meta)) {
    if (count >= MAX_META_KEYS) {
      sanitized._metaTruncated = true;
      break;
    }
    if (SENSITIVE_META_KEYS.has(key) || /secret|password|token|email/i.test(key)) {
      sanitized[key] = "[redacted]";
      count += 1;
      continue;
    }
    if (typeof value === "string") {
      sanitized[key] =
        value.length > MAX_META_STRING
          ? `${value.slice(0, MAX_META_STRING)}…`
          : value;
      count += 1;
      continue;
    }
    if (
      value == null ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      sanitized[key] = value;
      count += 1;
      continue;
    }
    // Avoid shipping arbitrary objects/arrays.
    sanitized[key] = "[omitted]";
    count += 1;
  }
  return sanitized;
}
