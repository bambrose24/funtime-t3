import React from "react";
import { View, Text, ScrollView } from "react-native";
import { type RouterOutputs } from "~/trpc/types";
import { clientApi } from "@/lib/trpc/react";

type LeaderboardData = RouterOutputs["leaderboard"]["league"];

type Props = {
  leaderboard: LeaderboardData | null;
};

export function MobileLeaderboardTable({ leaderboard }: Props) {
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

  const formatRank = (rank: number) => {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return `${rank}th`;
  };

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
      {sortedMembers.map((member) => {
        const isCurrentUser = member.member.user_id === currentUserId;
        const rowBgColor = isCurrentUser 
          ? "bg-blue-50 dark:bg-blue-900/20" 
          : "bg-white dark:bg-zinc-900";

        return (
          <View
            key={member.member.membership_id}
            className={`flex-row ${rowBgColor}`}
          >
            {/* Rank */}
            <View className="w-20 justify-center border-r border-gray-200 px-3 py-3 dark:border-zinc-700">
              <Text className={`text-center text-sm font-semibold ${
                member.rank <= 3 
                  ? "text-yellow-600 dark:text-yellow-400" 
                  : "text-gray-900 dark:text-gray-100"
              }`}>
                {formatRank(member.rank)}
              </Text>
            </View>

            {/* Player Name */}
            <View className="flex-1 justify-center border-r border-gray-200 px-3 py-3 dark:border-zinc-700">
              <View className="flex-row items-center">
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
                {isCurrentUser && (
                  <View className="ml-2 rounded-full bg-blue-500 px-2 py-0.5">
                    <Text className="text-xs font-medium text-white">You</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Correct Count */}
            <View className="w-20 justify-center px-3 py-3">
              <Text className="text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                {member.correct}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}