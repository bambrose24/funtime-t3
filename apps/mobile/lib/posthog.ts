import PostHog from "posthog-react-native";
import { isE2EMode } from "./e2e";

let posthogInstance: PostHog | null = null;

/**
 * Session replay is disabled for the private-league mobile app (MOB-12c).
 * The previous `enableSessionReplay: true` + "Disable…" comment were contradictory.
 */
export const MOBILE_SESSION_REPLAY_ENABLED = false;

export function initPostHog() {
  if (isE2EMode) {
    return null;
  }

  if (posthogInstance) {
    return posthogInstance;
  }

  const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  const POSTHOG_HOST =
    process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!POSTHOG_API_KEY) {
    if (__DEV__) {
      console.warn("PostHog API key not found in environment variables");
    }
    return null;
  }

  posthogInstance = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    enableSessionReplay: MOBILE_SESSION_REPLAY_ENABLED,
    captureAppLifecycleEvents: true,
  });

  return posthogInstance;
}

export function getPostHog(): PostHog | null {
  return posthogInstance;
}

/** Test-only helper to inject/clear the singleton. */
export function __setPostHogForTests(instance: PostHog | null) {
  posthogInstance = instance;
}
