import React from "react";
import { View, Text, ScrollView } from "react-native";
import { clientApi } from "@/lib/trpc/react";
import { MobileLeaderboardTable } from "./MobileLeaderboardTable";

type Props = {
  leagueId: string;
};

export function ClientLeaderboardPage({ leagueId }: Props) {
  const leagueIdNumber = parseInt(leagueId, 10);

  // Fetch leaderboard data
  const { data: leaderboard, isLoading, isError } = clientApi.leaderboard.league.useQuery(
    { leagueId: leagueIdNumber },
    {
      enabled: !!leagueIdNumber && !isNaN(leagueIdNumber),
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
    }
  );

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Loading leaderboard...
        </Text>
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-base text-red-500 dark:text-red-400">
          Failed to load leaderboard. Please try again.
        </Text>
      </View>
    );
  }

  // Show error if no data
  if (!leaderboard) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-base text-gray-500 dark:text-gray-400">
          No leaderboard data available.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="py-6">
        {/* Header */}
        <View className="mb-6 px-4">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            Leaderboard
          </Text>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            {leaderboard.league.name} Standings
          </Text>
        </View>

        {/* Leaderboard Table */}
        <View className="px-4">
          <MobileLeaderboardTable leaderboard={leaderboard} />
        </View>
      </View>
    </ScrollView>
  );
}