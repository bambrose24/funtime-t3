import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type RouterOutputs } from "~/trpc/types";
import { Button } from "@/components/ui/button";

export type HomeLeagueCardData = NonNullable<
  RouterOutputs["home"]["leagues"]
>[number];

export type HomeLeagueWeeklyStatus = HomeLeagueCardData["weeklyStatus"];

export const HOME_LEAGUE_STATUS_LABELS = {
  submitted: "Picks are in",
  needed: "Picks needed",
  closed: "Picks not submitted · Closed",
  no_schedule: "Waiting for the schedule",
  season_over: "Season complete",
} as const;

/** Presentation for a league row: status copy and optional primary action. */
export function getHomeLeagueRowPresentation({
  leagueId,
  status,
  statusUnavailable,
}: {
  leagueId: number;
  status: HomeLeagueWeeklyStatus | null | undefined;
  statusUnavailable: boolean;
}): {
  statusLabel: string;
  weekLabel: string | null;
  action: { label: "Make picks" | "View picks"; href: string } | null;
} {
  if (statusUnavailable || status == null) {
    return {
      statusLabel: "Status unavailable",
      weekLabel: null,
      action: null,
    };
  }

  const statusLabel =
    HOME_LEAGUE_STATUS_LABELS[
      status.state as keyof typeof HOME_LEAGUE_STATUS_LABELS
    ] ?? "Status unavailable";

  const weekLabel =
    status.week != null &&
    (status.state === "submitted" ||
      status.state === "needed" ||
      status.state === "closed")
      ? `Week ${status.week}`
      : null;

  if (status.state === "needed") {
    return {
      statusLabel,
      weekLabel,
      action: {
        label: "Make picks",
        href: `/league/${leagueId}/pick`,
      },
    };
  }

  if (status.state === "submitted") {
    return {
      statusLabel,
      weekLabel,
      action: {
        label: "View picks",
        href: `/league/${leagueId}?week=${status.week}`,
      },
    };
  }

  return { statusLabel, weekLabel, action: null };
}

export function HomeLeagueCard({
  data,
  statusUnavailable = false,
}: {
  data: HomeLeagueCardData;
  statusUnavailable?: boolean;
}) {
  const presentation = getHomeLeagueRowPresentation({
    leagueId: data.league_id,
    status: data.weeklyStatus,
    statusUnavailable,
  });

  return (
    <View className="mx-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${data.name}`}
        onPress={() => {
          router.push({
            pathname: "/league/[id]" as any,
            params: { id: data.league_id.toString() },
          });
        }}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
            <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              {data.season}
            </Text>
          </View>
          {presentation.weekLabel ? (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {presentation.weekLabel}
            </Text>
          ) : null}
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <Text
            className="text-app-fg-light dark:text-app-fg-dark flex-1 pr-2 text-lg font-bold"
            numberOfLines={1}
          >
            {data.name}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </View>
      </Pressable>

      <Text
        className={
          data.weeklyStatus?.state === "needed" && !statusUnavailable
            ? "text-app-fg-light dark:text-app-fg-dark text-sm font-medium"
            : "text-sm text-gray-600 dark:text-gray-400"
        }
      >
        {presentation.statusLabel}
      </Text>

      {presentation.action ? (
        <View className="mt-3">
          <Button
            variant={
              presentation.action.label === "Make picks" ? "default" : "outline"
            }
            onPress={() => {
              router.push(presentation.action!.href as any);
            }}
          >
            {presentation.action.label}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
