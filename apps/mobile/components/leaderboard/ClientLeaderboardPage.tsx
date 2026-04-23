import React, { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { clientApi } from "@/lib/trpc/react";
import { MobileLeaderboardTable } from "./MobileLeaderboardTable";
import { MobileLeaderboardTrendChart } from "./MobileLeaderboardTrendChart";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";

type Props = {
  leagueId: string;
};

function getRankLabel(rank: number) {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

export function ClientLeaderboardPage({ leagueId }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const leagueIdNumber = parseInt(leagueId, 10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

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
  const sortedMembers = leaderboard?.correctCountsSorted ?? [];
  const memberById = useMemo(() => {
    return new Map(
      sortedMembers.map((member) => [member.member.membership_id, member.member.people.username]),
    );
  }, [sortedMembers]);
  const selectedMembers = useMemo(() => {
    return selectedMemberIds
      .map((memberId) => {
        const username = memberById.get(memberId);
        if (!username) {
          return null;
        }
        return { memberId, username };
      })
      .filter((value): value is { memberId: number; username: string } => value !== null);
  }, [memberById, selectedMemberIds]);
  const topDefaultMemberIds = useMemo(() => {
    return sortedMembers
      .slice(0, Math.min(3, sortedMembers.length))
      .map((member) => member.member.membership_id);
  }, [sortedMembers]);

  React.useEffect(() => {
    if (topDefaultMemberIds.length === 0) {
      return;
    }
    setSelectedMemberIds((currentSelected) =>
      currentSelected.length === 0 ? topDefaultMemberIds : currentSelected,
    );
  }, [topDefaultMemberIds]);

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMemberIds((currentSelected) => {
      if (currentSelected.includes(memberId)) {
        return currentSelected.filter((id) => id !== memberId);
      }
      return [...currentSelected, memberId];
    });
  };

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

        {leaderboard.isSeasonOver ? (
          <View className="mb-4 px-4">
            <View className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
              <Text className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                {leaderboard.league.season} Season Complete
              </Text>
              <Text className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Final standings
              </Text>
              <View className="mt-3 gap-2">
                {Object.keys(leaderboard.topFinishersByRank)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((rank) => {
                    const finishers = leaderboard.topFinishersByRank[rank] ?? [];
                    if (finishers.length === 0) {
                      return null;
                    }
                    const names = finishers
                      .map((finisher) => `@${finisher.member.people.username}`)
                      .join(", ");
                    return (
                      <Text
                        key={`season_rank_${rank}`}
                        className="text-xs text-emerald-800 dark:text-emerald-200"
                      >
                        {getRankLabel(rank)} ({finishers[0]?.correct ?? 0}): {names}
                      </Text>
                    );
                  })}
              </View>
            </View>
          </View>
        ) : null}

        {leaderboard.chartableMembersData.length > 0 ? (
          <View className="mb-4 px-4">
            <View className="mb-3">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                Weekly Progression
              </Text>
              <Text className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Select members to include in the chart.
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <View className="flex-row gap-2 pr-4">
                {sortedMembers.map((member) => {
                  const memberId = member.member.membership_id;
                  const selected = selectedMemberIds.includes(memberId);
                  return (
                    <Pressable
                      key={`chart_member_${memberId}`}
                      onPress={() => toggleMemberSelection(memberId)}
                      className={`rounded-full border px-3 py-1.5 ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                          : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          selected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        @{member.member.people.username}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <MobileLeaderboardTrendChart
              data={leaderboard.chartableMembersData}
              selectedMembers={selectedMembers}
            />
          </View>
        ) : null}

        {/* Leaderboard Table */}
        <View className="px-4">
          <MobileLeaderboardTable leaderboard={leaderboard} leagueId={leagueId} />
        </View>
      </View>
    </ScrollView>
  );
}
