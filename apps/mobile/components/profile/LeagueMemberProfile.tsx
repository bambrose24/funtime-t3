import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { clientApi } from "@/lib/trpc/react";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { useColorScheme } from "@/lib/useColorScheme";

type Props = {
  leagueId: string;
  memberId: string;
};

export function LeagueMemberProfile({ leagueId, memberId }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const leagueIdNumber = Number(leagueId);
  const memberIdNumber = Number(memberId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = clientApi.playerProfile.get.useQuery(
    {
      leagueId: leagueIdNumber,
      memberId: memberIdNumber,
    },
    {
      enabled:
        Number.isFinite(leagueIdNumber) &&
        Number.isFinite(memberIdNumber) &&
        memberIdNumber > 0,
    },
  );

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } =
    clientApi.teams.getTeams.useQuery(undefined, {
      enabled:
        Number.isFinite(leagueIdNumber) &&
        Number.isFinite(memberIdNumber) &&
        memberIdNumber > 0,
    });

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
    try {
      await Promise.all([refetchProfile(), refetchTeams()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProfile, refetchTeams]);

  const teamById = useMemo(() => {
    return new Map((teams ?? []).map((team) => [team.teamid, team]));
  }, [teams]);

  if (profileLoading || teamsLoading) {
    return <LeagueTabLoadingSkeleton rows={3} />;
  }

  if (!profileData) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-gray-500 dark:text-gray-400">
          Unable to load this profile.
        </Text>
      </View>
    );
  }

  const member = profileData.member;
  const superbowlPick = member.superbowl[0];
  const superbowlWinner = superbowlPick ? teamById.get(superbowlPick.winner) : null;
  const superbowlLoser = superbowlPick ? teamById.get(superbowlPick.loser) : null;
  const correctPicks = profileData.correctPicks;
  const wrongPicks = profileData.wrongPicks;
  const totalPicks = correctPicks + wrongPicks;
  const winRate = totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : null;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={isDarkColorScheme ? "#e5e7eb" : "#374151"}
        />
      }
    >
      <View className="gap-4">
        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-bold">
            @{member.people.username}
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {member.people.email}
          </Text>
          <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Role: {member.role}
          </Text>
        </View>

        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 text-base font-semibold">
            Season Summary
          </Text>
          <View className="gap-1.5">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Correct Picks: {correctPicks}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Wrong Picks: {wrongPicks}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Pick Accuracy: {winRate !== null ? `${winRate}%` : "--"}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Week Wins: {member.WeekWinners.length}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Messages Posted: {member.leaguemessages.length}
            </Text>
          </View>
          {member.WeekWinners.length > 0 ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {member.WeekWinners.map((win) => (
                <View
                  key={`member_week_win_${win.week}`}
                  className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950"
                >
                  <Text className="text-xs font-semibold text-blue-700 dark:text-blue-200">
                    Week {win.week}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 text-base font-semibold">
            Super Bowl Pick
          </Text>
          {!superbowlPick ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              No Super Bowl pick submitted.
            </Text>
          ) : (
            <View className="gap-2.5">
              <View className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Winner
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  {superbowlWinner ? (
                    <>
                      <TeamLogo abbrev={superbowlWinner.abbrev ?? ""} width={18} height={18} />
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                        {superbowlWinner.loc} {superbowlWinner.name}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {superbowlPick.winner}
                    </Text>
                  )}
                </View>
              </View>
              <View className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Loser
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  {superbowlLoser ? (
                    <>
                      <TeamLogo abbrev={superbowlLoser.abbrev ?? ""} width={18} height={18} />
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                        {superbowlLoser.loc} {superbowlLoser.name}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {superbowlPick.loser}
                    </Text>
                  )}
                </View>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Total Score: {superbowlPick.score}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
