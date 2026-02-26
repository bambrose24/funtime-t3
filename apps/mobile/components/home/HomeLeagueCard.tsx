import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { type RouterOutputs } from "~/trpc/types";

// Type for league data from home.summary - matches the web app approach
type LeagueCardData = NonNullable<RouterOutputs["home"]["summary"]>[number];

export function HomeLeagueCard({ data }: { data: LeagueCardData }) {
  const weekWins = data.viewerWeekWins ?? [];
  const correctPickCount = data.viewerCorrectPickCount ?? {
    correct: 0,
    total: 0,
  };

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/league/[id]" as any,
          params: { id: data.league_id.toString() },
        });
      }}
      activeOpacity={0.7}
    >
      <View className="mx-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        {/* League Name Header */}
        <View className="mb-4">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-lg font-bold">
            {data.name}
          </Text>
        </View>

        {/* Stats Section */}
        <View className="gap-3">
          {/* Correct Picks Row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Correct Picks
            </Text>
            <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
              {`${correctPickCount.correct} / ${correctPickCount.total}`}
            </Text>
          </View>

          {/* Separator */}
          <View className="h-px bg-gray-200 dark:bg-zinc-700" />

          {/* Week Wins Row */}
          <View className="flex-row items-start justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Week Wins
            </Text>
            <View className="ml-4 flex-1">
              {weekWins.length === 0 ? (
                <Text className="text-app-fg-light dark:text-app-fg-dark text-right text-sm">
                  None
                </Text>
              ) : (
                <View className="flex-row flex-wrap justify-end gap-1">
                  {weekWins.map((week) => (
                    <View
                      key={`week_win_${week}_${data.league_id}`}
                      className="rounded-md bg-green-100 px-2 py-1 dark:bg-green-900"
                    >
                      <Text className="text-xs font-medium text-green-800 dark:text-green-200">
                        Week {week}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
