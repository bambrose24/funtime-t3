import React from "react";
import { View, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { type RouterOutputs } from "~/trpc/types";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { SelectOption } from "@/components/ui/select-option";
import { Text } from "../ui/text";

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

export function PickGameCard({
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
    <View
      className={`rounded-lg border px-4 py-2 ${
        game.is_tiebreaker
          ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
          : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
      }`}
    >
      {/* Game Time */}
      <View className="mb-2 items-center">
        <Text className="text-center text-sm text-secondary-foreground">
          {format(game.ts, "EEE MMM d, h:mm a")}
        </Text>
        {game.is_tiebreaker && (
          <Text className="mt-1 text-center text-xs font-medium text-secondary-foreground">
            Tiebreaker Game
          </Text>
        )}
      </View>

      {/* Main Game Selection - 5 Column Grid Layout */}
      <View className="mb-2 flex-row items-center">
        {/* Away Team - 2 columns */}
        <SelectOption
          onPress={() => !isDisabled && onTeamSelect(awayTeam.teamid)}
          disabled={isDisabled}
          selected={awaySelected}
          className="mr-1 h-14 flex-row items-center justify-center"
          style={{ flex: 2 }}
        >
          <View className="flex flex-row items-center gap-2">
            <TeamLogo abbrev={awayTeam.abbrev ?? ""} width={32} height={32} />
            <Text className="text-base font-semibold">
              {awayTeam.abbrev || ""}
            </Text>
          </View>
        </SelectOption>

        {/* VS Separator - 1 column */}
        <View className="items-center justify-center px-2" style={{ flex: 1 }}>
          <Text className="text-lg font-semibold text-secondary-foreground">
            @
          </Text>
        </View>

        {/* Home Team - 2 columns */}
        <SelectOption
          onPress={() => !isDisabled && onTeamSelect(homeTeam.teamid)}
          disabled={isDisabled}
          selected={homeSelected}
          className="ml-1 h-14 flex-row items-center justify-center"
          style={{ flex: 2 }}
        >
          <View className="mr-2 items-center">
            <Text className="text-base font-semibold">
              {homeTeam.abbrev || ""}
            </Text>
          </View>
          <TeamLogo abbrev={homeTeam.abbrev ?? ""} width={32} height={32} />
        </SelectOption>
      </View>

      {/* Records row */}
      {(game.awayrecord || game.homerecord) && (
        <View className="mb-2 flex-row items-center">
          <View className="items-center" style={{ flex: 2 }}>
            <Text className="text-xs text-secondary-foreground">
              {game.awayrecord ? String(game.awayrecord) : ""}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <View className="items-center" style={{ flex: 2 }}>
            <Text className="text-xs text-secondary-foreground">
              {game.homerecord ? String(game.homerecord) : ""}
            </Text>
          </View>
        </View>
      )}

      {/* Disabled message */}
      {started && (
        <Text className="mt-2 text-center text-sm text-warning">
          Game started
        </Text>
      )}

      {/* Tiebreaker Score Input */}
      {tiebreakerScore}
    </View>
  );
}
