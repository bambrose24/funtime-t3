import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { type RouterOutputs } from "~/trpc/types";
import { clientApi } from "@/lib/trpc/react";

type LeaderboardData = RouterOutputs["leaderboard"]["league"];

type Props = {
  leaderboard: LeaderboardData | null;
  leagueId: string;
};

export function MobileLeaderboardTable({ leaderboard, leagueId }: Props) {
  // Get current user to highlight their row
  const { data: session } = clientApi.session.current.useQuery();
  const currentUserId = session?.dbUser?.uid;

  // Sort members by rank (should already be sorted from API)
  const sortedMembers = leaderboard?.correctCountsSorted;

  if (!leaderboard || !sortedMembers || sortedMembers.length === 0) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="text-center text-gray-500 dark:text-gray-400">
          No leaderboard data available
        </Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
      {/* Header Row */}
      <View className="flex-row bg-gray-50 dark:bg-zinc-800">
        {/* Rank Column */}
        <View className="w-20 border-r border-gray-200 px-3 py-3 dark:border-zinc-700">
          <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Rank
          </Text>
        </View>
        {/* Player Column */}
        <View className="flex-1 border-r border-gray-200 px-3 py-3 dark:border-zinc-700">
          <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Player
          </Text>
        </View>
        {/* Correct Picks Column */}
        <View className="w-20 px-3 py-3">
          <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Correct
          </Text>
        </View>
      </View>

      {/* Data Rows */}
      {sortedMembers.map((member, index) => {
        const isCurrentUser = member.member.user_id === currentUserId;
        const rowBgColor = isCurrentUser
          ? "bg-blue-50 dark:bg-blue-900/20"
          : index % 2 === 0
            ? "bg-white dark:bg-zinc-900"
            : "bg-gray-50 dark:bg-zinc-950";

        return (
          <Pressable
            key={member.member.membership_id}
            className={`flex-row active:opacity-80 ${rowBgColor}`}
            onPress={() =>
              router.push(
                `/league/${leagueId}/player/${member.member.membership_id}` as any,
              )
            }
          >
            {/* Rank */}
            <View className="w-20 justify-center border-r border-gray-200 px-3 py-3 dark:border-zinc-700">
              <Text
                className={`text-center text-sm font-semibold ${
                  member.rank <= 3
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {member.rank}
              </Text>
            </View>

            {/* Player Name */}
            <View className="flex-1 justify-center border-r border-gray-200 px-3 py-3 dark:border-zinc-700">
              <Text
                className={`text-sm ${
                  isCurrentUser
                    ? "font-bold text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
                numberOfLines={1}
              >
                {member.member.people.username}
              </Text>
            </View>

            {/* Correct Count */}
            <View className="w-20 justify-center px-3 py-3">
              <Text className="text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                {member.correct}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
