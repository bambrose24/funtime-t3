export type PushNotificationStatusReason =
  | "ok"
  | "in_app_disabled"
  | "storage_unavailable";

export type OsNotificationPermission =
  | "granted"
  | "denied"
  | "undetermined"
  | "unknown";

export type PushPreferenceStatusInput = {
  preference: boolean;
  tokenCount: number;
  reason: PushNotificationStatusReason;
  unavailable?: boolean;
  osPermission: OsNotificationPermission;
};

export type PushPreferencePresentation = {
  statusLabel: string;
  preferenceOn: boolean;
  canToggle: boolean;
  summary: string;
  guidance: string;
  toggleHint: string;
  showOpenSettings: boolean;
};

export const NOTIFICATION_PERMISSION_CONTEXT_TITLE = "Turn on notifications?";
export const NOTIFICATION_PERMISSION_CONTEXT_BODY =
  "Funtime uses notifications for pick reminders, weekly summaries, and league messages. Next, your device will ask for permission.";

export function getPushPreferencePresentation(
  input: PushPreferenceStatusInput,
): PushPreferencePresentation {
  const preferenceOn = Boolean(input.preference);
  const tokenCount = Math.max(0, input.tokenCount);
  const storageUnavailable =
    input.unavailable === true || input.reason === "storage_unavailable";

  if (storageUnavailable) {
    return {
      statusLabel: "Unavailable",
      preferenceOn: false,
      canToggle: false,
      summary:
        "Push settings are unavailable until notification storage is deployed.",
      guidance:
        "Notification delivery settings are temporarily unavailable. Try again after the next update.",
      toggleHint: "Settings are unavailable right now.",
      showOpenSettings: false,
    };
  }

  if (input.osPermission === "denied") {
    return {
      statusLabel: preferenceOn ? "Blocked by OS" : "Disabled",
      preferenceOn,
      canToggle: true,
      summary: preferenceOn
        ? "Account preference is on, but the OS has denied notification permission."
        : "Notifications are off in Funtime, and the OS has also denied permission.",
      guidance:
        "Open system settings and allow notifications for Funtime, then return here and refresh.",
      toggleHint: preferenceOn
        ? "Preference is on. Delivery still needs OS permission."
        : "Toggle to save your Funtime preference. OS permission still needs to be fixed separately.",
      showOpenSettings: true,
    };
  }

  if (!preferenceOn) {
    return {
      statusLabel: "Disabled",
      preferenceOn: false,
      canToggle: true,
      summary:
        tokenCount > 0
          ? `Preference off. ${tokenCount} device token${tokenCount === 1 ? "" : "s"} on file will not receive pushes.`
          : "Preference off. No registered device token yet.",
      guidance:
        "Turn this on to receive reminders, summaries, and message alerts. You can do this before a device token exists.",
      toggleHint: "Toggle notification delivery for this account.",
      showOpenSettings: false,
    };
  }

  if (tokenCount === 0) {
    const waitingOnPermission =
      input.osPermission === "undetermined" ||
      input.osPermission === "unknown";
    return {
      statusLabel: waitingOnPermission ? "Needs permission" : "Enabled",
      preferenceOn: true,
      canToggle: true,
      summary: waitingOnPermission
        ? "Preference is on. Allow notifications when prompted so this device can register."
        : "Preference is on. Waiting for this device to register a push token.",
      guidance: waitingOnPermission
        ? "Funtime will ask for notification permission so reminders can reach this device."
        : "Preference is saved. Delivery starts once a push token is registered on a physical device.",
      toggleHint: "Toggle notification delivery for this account.",
      showOpenSettings: false,
    };
  }

  return {
    statusLabel: "Enabled",
    preferenceOn: true,
    canToggle: true,
    summary: `Enabled on ${tokenCount} device${tokenCount === 1 ? "" : "s"}.`,
    guidance:
      "Weekly reminders and league updates will be delivered to your registered devices.",
    toggleHint: "Toggle notification delivery for this account.",
    showOpenSettings: false,
  };
}
