import React from "react";
import { Switch, Text, View } from "react-native";

type WeekSummaryEmailSettingsProps = {
  enabled: boolean;
  isUpdating?: boolean;
  onToggle: () => void;
};

export function WeekSummaryEmailSettings({
  enabled,
  isUpdating = false,
  onToggle,
}: WeekSummaryEmailSettingsProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 p-3">
      <View className="flex-1 pr-3">
        <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
          Weekly recap emails
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          After each week is final, get your results and standing by email.
          Applies to every league on your account.
        </Text>
      </View>
      <Switch
        accessibilityLabel="Weekly recap emails"
        value={enabled}
        onValueChange={() => {
          if (isUpdating) {
            return;
          }
          onToggle();
        }}
        disabled={isUpdating}
        trackColor={{ false: "#9ca3af", true: "#22c55e" }}
        thumbColor={enabled ? "#ffffff" : "#f3f4f6"}
      />
    </View>
  );
}
