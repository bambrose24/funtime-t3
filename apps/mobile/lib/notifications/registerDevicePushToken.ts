import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

export type RegisterDevicePushTokenResult =
  | { status: "registered"; token: string }
  | { status: "permission_not_granted"; permissionStatus: string }
  | { status: "missing_project_id" }
  | { status: "skipped_e2e" };

type RegisterDevicePushTokenArgs = {
  registerPushToken: (input: {
    token: string;
    platform: "ios" | "android" | "web";
  }) => Promise<unknown>;
  /** When true, never prompt — only register if already granted. */
  requestPermissionIfNeeded?: boolean;
  isE2EMode?: boolean;
};

function resolveProjectId(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId
  );
}

/**
 * Registers this installation's Expo push token when OS permission allows.
 * Callers that want a contextual OS prompt must request permission first and
 * pass `requestPermissionIfNeeded: false` (or leave it false, the default).
 */
export async function registerDevicePushToken({
  registerPushToken,
  requestPermissionIfNeeded = false,
  isE2EMode = false,
}: RegisterDevicePushTokenArgs): Promise<RegisterDevicePushTokenResult> {
  if (isE2EMode) {
    return { status: "skipped_e2e" };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted" && requestPermissionIfNeeded) {
    const permission = await Notifications.requestPermissionsAsync();
    status = permission.status;
  }
  if (status !== "granted") {
    return {
      status: "permission_not_granted",
      permissionStatus: status,
    };
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    console.warn(
      "[Push] Skipping Expo push token registration because no EAS projectId is configured. Set EXPO_PUBLIC_EAS_PROJECT_ID or expose expo.extra.eas.projectId.",
    );
    return { status: "missing_project_id" };
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const platform: "ios" | "android" | "web" =
    Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web";

  await registerPushToken({
    token: tokenResult.data,
    platform,
  });

  return { status: "registered", token: tokenResult.data };
}

export async function getOsNotificationPermission(): Promise<
  "granted" | "denied" | "undetermined" | "unknown"
> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted" || status === "denied" || status === "undetermined") {
      return status;
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}
