import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { clientApi } from "@/lib/trpc/react";
import { MobileLeaderboardTable } from "./MobileLeaderboardTable";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";

type Props = {
  leagueId: string;
};

export function ClientLeaderboardPage({ leagueId }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const leagueIdNumber = parseInt(leagueId, 10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch leaderboard data
  const { data: leaderboard, isLoading, isError, refetch } =
    clientApi.leaderboard.league.useQuery(
      { leagueId: leagueIdNumber },
      {
        enabled: !!leagueIdNumber && !isNaN(leagueIdNumber),
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: true,
      },
    );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const standingsSummary = useMemo(() => {
    const members = leaderboard?.correctCountsSorted ?? [];
    const leaderCorrect = members[0]?.correct ?? null;
    const tiedLeaders =
      leaderCorrect !== null
        ? members.filter((member) => member.correct === leaderCorrect).length
        : 0;
    return {
      membersCount: members.length,
      leaderCorrect,
      tiedLeaders,
    };
  }, [leaderboard?.correctCountsSorted]);

  // Show loading state
  if (isLoading) {
    return <LeagueTabLoadingSkeleton rows={4} />;
  }

  // Show error state
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-base text-red-500 dark:text-red-400">
          Failed to load leaderboard. Please try again.
        </Text>
        <View className="mt-4">
          <Button variant="outline" onPress={() => void onRefresh()}>
            Retry
          </Button>
        </View>
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
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={isDarkColorScheme ? "#e5e7eb" : "#374151"}
        />
      }
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
          <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            Tap a player row to open their profile.
          </Text>
        </View>

        <View className="mb-4 px-4">
          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <View className="flex-row items-center justify-between">
              <View className="items-center">
                <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Members
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-base font-semibold">
                  {standingsSummary.membersCount}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Leader Correct
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-base font-semibold">
                  {standingsSummary.leaderCorrect ?? "--"}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tied Leaders
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-base font-semibold">
                  {standingsSummary.tiedLeaders}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Leaderboard Table */}
        <View className="px-4">
          <MobileLeaderboardTable leaderboard={leaderboard} leagueId={leagueId} />
        </View>
      </View>
    </ScrollView>
  );
}
