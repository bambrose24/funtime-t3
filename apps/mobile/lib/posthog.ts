import PostHog from "posthog-react-native";

let posthogInstance: PostHog | null = null;

export function initPostHog() {
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
    enableSessionReplay: true, // Disable session replay for mobile
    captureAppLifecycleEvents: true, // Track app lifecycle
  });

  return posthogInstance;
}

export function getPostHog(): PostHog | null {
  return posthogInstance;
}
