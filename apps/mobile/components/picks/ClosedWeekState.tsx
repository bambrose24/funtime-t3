import React from "react";
import { View } from "react-native";
import { format } from "date-fns";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export function ClosedWeekState({
  week,
  deadline,
  leagueId,
}: {
  week: number;
  deadline: Date | null;
  leagueId: number;
}) {
  return (
    <View className="flex-1 px-4 py-8">
      <View className="w-full max-w-2xl self-center rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
        <Text className="mb-2 text-center text-2xl font-bold text-app-fg-light dark:text-app-fg-dark">
          Picks are closed for week {week}
        </Text>
        <Text className="text-center text-base text-gray-600 dark:text-gray-400">
          This league closes all weekly picks at the first kickoff
          {deadline ? ` (${format(deadline, "EEE MMM d, h:mm a")})` : ""}.
        </Text>
        <Button
          className="mt-5"
          onPress={() => router.push(`/league/${leagueId}` as any)}
        >
          Back to league
        </Button>
      </View>
    </View>
  );
}
