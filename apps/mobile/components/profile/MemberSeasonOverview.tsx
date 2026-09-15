import React from "react";
import { Text, View } from "react-native";

type WeekRecord = {
  week: number;
  correct: number;
  wrong: number;
  missed: number;
  possible: number;
  won: boolean;
};

export type SeasonOverviewProfile = {
  correctPicks: number;
  wrongPicks: number;
  missedPicks: number;
  decidedGames: number;
  accuracyPct: number | null;
  rank: number | null;
  leagueSize: number;
  tiedForRank: boolean;
  correctBehind: number;
  weeks: WeekRecord[];
  member: {
    people: { username: string };
    role: string | null;
  };
};

function formatRank(profile: SeasonOverviewProfile) {
  if (profile.rank == null) {
    return "—";
  }
  return profile.tiedForRank ? `T-${profile.rank}` : `#${profile.rank}`;
}

function formatRecord(profile: SeasonOverviewProfile) {
  if (profile.decidedGames === 0) {
    return "—";
  }
  if (profile.missedPicks > 0) {
    return `${profile.correctPicks}–${profile.wrongPicks}–${profile.missedPicks}`;
  }
  return `${profile.correctPicks}–${profile.wrongPicks}`;
}

function vsFirstValue(profile: SeasonOverviewProfile) {
  if (profile.rank == null) {
    return "—";
  }
  if (profile.correctBehind === 0) {
    return profile.tiedForRank ? "Tied" : "Lead";
  }
  return `${profile.correctBehind} back`;
}

export function MemberSeasonOverview({
  profile,
  isViewer,
}: {
  profile: SeasonOverviewProfile;
  isViewer?: boolean;
}) {
  const weekWins = profile.weeks.filter((week) => week.won);
  const stats = [
    {
      label: "Correct",
      value: profile.decidedGames > 0 ? String(profile.correctPicks) : "—",
    },
    { label: "Record", value: formatRecord(profile) },
    {
      label: "Hit rate",
      value: profile.accuracyPct != null ? `${profile.accuracyPct}%` : "—",
    },
    { label: "Vs first", value: vsFirstValue(profile) },
  ];

  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xl font-semibold text-app-fg-light dark:text-app-fg-dark">
            {profile.member.people.username}
          </Text>
          {isViewer || profile.member.role === "admin" ? (
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {[
                isViewer ? "You" : null,
                profile.member.role === "admin" ? "Commissioner" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : null}
        </View>
        <View className="items-end">
          <Text className="text-xl font-semibold text-app-fg-light dark:text-app-fg-dark">
            {formatRank(profile)}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            of {profile.leagueSize}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap border-y border-gray-200 py-1 dark:border-zinc-700">
        {stats.map((stat) => (
          <View key={stat.label} className="w-1/2 py-2 pr-3">
            <Text className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {stat.label}
            </Text>
            <Text className="mt-0.5 text-lg font-semibold text-app-fg-light dark:text-app-fg-dark">
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      <View>
        <View className="mb-2 flex-row items-baseline justify-between">
          <Text className="text-sm font-medium text-app-fg-light dark:text-app-fg-dark">
            Week by week
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {weekWins.length === 0
              ? "No week wins yet"
              : `${weekWins.length} win${weekWins.length === 1 ? "" : "s"} · ${weekWins
                  .map((week) => week.week)
                  .join(", ")}`}
          </Text>
        </View>
        {profile.weeks.length === 0 ? (
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Completed weeks will land here as a box score.
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-1">
            {profile.weeks.map((week) => (
              <View
                key={`week_${week.week}`}
                className={
                  week.won
                    ? "w-11 items-center rounded-md bg-green-100 px-1 py-1.5 dark:bg-green-950"
                    : "w-11 items-center rounded-md bg-gray-100 px-1 py-1.5 dark:bg-zinc-800"
                }
              >
                <Text className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {week.week}
                </Text>
                <Text
                  className={
                    week.won
                      ? "mt-0.5 text-sm font-semibold text-green-800 dark:text-green-200"
                      : "mt-0.5 text-sm font-semibold text-app-fg-light dark:text-app-fg-dark"
                  }
                >
                  {week.correct}
                </Text>
              </View>
            ))}
          </View>
        )}
        {profile.missedPicks > 0 ? (
          <Text className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            {profile.missedPicks} missed pick
            {profile.missedPicks === 1 ? "" : "s"} count as losses
          </Text>
        ) : null}
      </View>
    </View>
  );
}
