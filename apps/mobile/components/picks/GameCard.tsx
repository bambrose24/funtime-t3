import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { type RouterOutputs } from "~/trpc/types";

type Team = RouterOutputs["teams"]["getTeams"][number];
type Game = RouterOutputs["league"]["weekToPick"]["games"][number];

type Props = {
  game: Game;
  homeTeam: Team;
  awayTeam: Team;
  selectedWinner: number | null;
  onTeamSelect: (teamId: number) => void;
  disabled?: boolean;
  tiebreakerScore?: React.ReactNode;
};

export function GameCard({
  game,
  homeTeam,
  awayTeam,
  selectedWinner,
  onTeamSelect,
  disabled = false,
  tiebreakerScore,
}: Props) {
  const started = game.ts < new Date();
  const isDisabled = disabled || started;

  // Determine which team is selected
  const homeSelected = selectedWinner === homeTeam.teamid;
  const awaySelected = selectedWinner === awayTeam.teamid;

  return (
    <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      {/* Game Time */}
      <Text className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">
        {format(game.ts, "EEE MMM d, h:mm a")}
      </Text>

      {/* Teams */}
      <View className="mb-2 flex-row items-center justify-between">
        {/* Away Team */}
        <TouchableOpacity
          onPress={() => !isDisabled && onTeamSelect(awayTeam.teamid)}
          disabled={isDisabled}
          className={`mr-2 flex-1 flex-row items-center justify-center rounded-lg p-3 ${
            awaySelected
              ? "border-2 border-green-500 bg-green-100 dark:bg-green-900"
              : "border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
          } ${isDisabled ? "opacity-50" : ""}`}
        >
          <View className="items-center">
            {/* Team Logo Placeholder - TODO: Add actual team logos */}
            <View className="mb-1 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
              {awayTeam.abbrev}
            </Text>
            {game.awayrecord && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {game.awayrecord}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* VS Separator */}
        <View className="mx-2">
          <Text className="font-medium text-gray-400">@</Text>
        </View>

        {/* Home Team */}
        <TouchableOpacity
          onPress={() => !isDisabled && onTeamSelect(homeTeam.teamid)}
          disabled={isDisabled}
          className={`ml-2 flex-1 flex-row items-center justify-center rounded-lg p-3 ${
            homeSelected
              ? "border-2 border-green-500 bg-green-100 dark:bg-green-900"
              : "border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
          } ${isDisabled ? "opacity-50" : ""}`}
        >
          <View className="items-center">
            {/* Team Logo Placeholder - TODO: Add actual team logos */}
            <View className="mb-1 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
              {homeTeam.abbrev}
            </Text>
            {game.homerecord && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {game.homerecord}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Disabled message */}
      {started && (
        <Text className="mt-2 text-center text-xs text-orange-600 dark:text-orange-400">
          This game has already started
        </Text>
      )}

      {/* Tiebreaker Score Input */}
      {tiebreakerScore}
    </View>
  );
}
