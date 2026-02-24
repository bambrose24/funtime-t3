import Constants from "expo-constants";

export function getBaseUrl() {
  const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitApiUrl) {
    return explicitApiUrl.replace(/\/$/, "");
  }

  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(":")[0];
    if (host) {
      return `http://${host}:3000`;
    }
    return "http://127.0.0.1:3000";
  }

  return "https://www.play-funtime.com";
}
