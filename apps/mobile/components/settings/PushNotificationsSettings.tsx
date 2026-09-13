import React from "react";
import { Switch, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import {
  getPushPreferencePresentation,
  type OsNotificationPermission,
  type PushNotificationStatusReason,
} from "@/lib/settings/pushNotificationPreference";
import { cn } from "@/lib/utils";

export type PushNotificationsSettingsProps = {
  preference: boolean;
  tokenCount: number;
  reason: PushNotificationStatusReason;
  unavailable?: boolean;
  osPermission: OsNotificationPermission;
  isUpdating?: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  onOpenSettings?: () => void;
};

export function PushNotificationsSettings({
  preference,
  tokenCount,
  reason,
  unavailable = false,
  osPermission,
  isUpdating = false,
  onToggle,
  onRefresh,
  onOpenSettings,
}: PushNotificationsSettingsProps) {
  const presentation = getPushPreferencePresentation({
    preference,
    tokenCount,
    reason,
    unavailable,
    osPermission,
  });

  const canToggle = presentation.canToggle && !isUpdating;
  const badgeUnavailable = unavailable || reason === "storage_unavailable";
  const badgeEnabled = presentation.preferenceOn && !badgeUnavailable;

  return (
    <View className="gap-2 p-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
            Notification Status
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {presentation.statusLabel}
          </Text>
        </View>
        <View
          className={cn(
            "rounded-full px-2 py-0.5",
            badgeUnavailable
              ? "bg-amber-100 dark:bg-amber-950"
              : badgeEnabled
                ? "bg-emerald-100 dark:bg-emerald-950"
                : "bg-gray-100 dark:bg-zinc-700",
          )}
        >
          <Text
            className={cn(
              "text-[10px] font-semibold",
              badgeUnavailable
                ? "text-amber-700 dark:text-amber-300"
                : badgeEnabled
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-gray-600 dark:text-gray-300",
            )}
          >
            {badgeUnavailable ? "N/A" : badgeEnabled ? "ON" : "OFF"}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
          <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-600 dark:text-gray-300">
            Tokens: {tokenCount}
          </Text>
        </View>
        <View
          className={cn(
            "rounded-full border px-2.5 py-1",
            presentation.preferenceOn
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
              : "border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900",
          )}
        >
          <Text
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.8px]",
              presentation.preferenceOn
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-gray-600 dark:text-gray-300",
            )}
          >
            Preference: {presentation.preferenceOn ? "On" : "Off"}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {presentation.summary}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {presentation.guidance}
      </Text>

      <View className="mt-1 flex-row items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">
        <View className="flex-1 pr-3">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
            Allow Push Notifications
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {presentation.toggleHint}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Allow Push Notifications"
          value={presentation.preferenceOn}
          onValueChange={() => {
            if (!canToggle) {
              return;
            }
            onToggle();
          }}
          disabled={!canToggle}
          trackColor={{ false: "#9ca3af", true: "#22c55e" }}
          thumbColor={presentation.preferenceOn ? "#ffffff" : "#f3f4f6"}
        />
      </View>

      {presentation.showOpenSettings && onOpenSettings ? (
        <Button size="sm" variant="outline" onPress={onOpenSettings}>
          Open system settings
        </Button>
      ) : null}

      <Button
        size="sm"
        variant="outline"
        disabled={isUpdating}
        onPress={onRefresh}
      >
        {isUpdating ? "Saving..." : "Refresh Notification Status"}
      </Button>
    </View>
  );
}
