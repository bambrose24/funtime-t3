import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { type RouterOutputs } from "~/trpc/types";
import { TeamLogo } from "@/components/shared/TeamLogo";

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
    <View className="rounded-lg border border-gray-200 bg-white px-4 py-1 dark:border-zinc-700 dark:bg-zinc-800">
      {/* Game Time */}
      <Text className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {format(game.ts, "EEE MMM d, h:mm a")}
      </Text>

      {/* Main Game Selection - 5 Column Grid Layout */}
      <View className="mb-3 flex-row items-center">
        {/* Away Team - 2 columns */}
        <TouchableOpacity
          onPress={() => !isDisabled && onTeamSelect(awayTeam.teamid)}
          disabled={isDisabled}
          className={`mr-1 flex-row items-center justify-center rounded-lg px-1 py-2 ${
            awaySelected
              ? "border-2 border-green-500 bg-green-100 dark:bg-green-900"
              : "border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
          } ${isDisabled ? "opacity-50" : ""}`}
          style={{ flex: 2 }}
        >
          <TeamLogo abbrev={awayTeam.abbrev ?? ""} width={32} height={32} />
          <View className="ml-2 items-center">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              {awayTeam.abbrev || ""}
            </Text>
          </View>
        </TouchableOpacity>

        {/* VS Separator - 1 column */}
        <View className="items-center justify-center px-2" style={{ flex: 1 }}>
          <Text className="text-lg font-medium text-gray-400">@</Text>
        </View>

        {/* Home Team - 2 columns */}
        <TouchableOpacity
          onPress={() => !isDisabled && onTeamSelect(homeTeam.teamid)}
          disabled={isDisabled}
          className={`ml-1 flex-row items-center justify-center rounded-lg px-1 py-2 ${
            homeSelected
              ? "border-2 border-green-500 bg-green-100 dark:bg-green-900"
              : "border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
          } ${isDisabled ? "opacity-50" : ""}`}
          style={{ flex: 2 }}
        >
          <View className="mr-2 items-center">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              {homeTeam.abbrev || ""}
            </Text>
          </View>
          <TeamLogo abbrev={homeTeam.abbrev ?? ""} width={32} height={32} />
        </TouchableOpacity>
      </View>

      {/* Records row */}
      {(game.awayrecord || game.homerecord) && (
        <View className="mb-2 flex-row items-center">
          <View className="items-center" style={{ flex: 2 }}>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {game.awayrecord ? String(game.awayrecord) : ""}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <View className="items-center" style={{ flex: 2 }}>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {game.homerecord ? String(game.homerecord) : ""}
            </Text>
          </View>
        </View>
      )}

      {/* Disabled message */}
      {started && (
        <Text className="mt-2 text-center text-sm text-orange-600 dark:text-orange-400">
          Game started
        </Text>
      )}

      {/* Tiebreaker Score Input */}
      {tiebreakerScore}
    </View>
  );
}
