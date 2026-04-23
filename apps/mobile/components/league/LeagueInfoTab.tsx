import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { clientApi } from "@/lib/trpc/react";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";

type Props = {
  leagueId: string;
};

export function LeagueInfoTab({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const { data: league, isLoading: leagueLoading } = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) },
  );
  const { data: members, isLoading: membersLoading } = clientApi.league.members.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) },
  );

  const admins = useMemo(() => {
    return (members ?? []).filter((member) => member.role === "admin");
  }, [members]);

  if (leagueLoading || membersLoading) {
    return <LeagueTabLoadingSkeleton rows={4} />;
  }

  if (!league) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-gray-500 dark:text-gray-400">
          League details unavailable.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="gap-4">
        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
            League Information
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {league.name}
          </Text>

          <View className="mt-4">
            <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              League Admins
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <Pressable
                    key={`league_admin_${admin.membership_id}`}
                    onPress={() =>
                      router.push(
                        `/league/${leagueIdNumber}/player/${admin.membership_id}` as any,
                      )
                    }
                    className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-900 dark:bg-blue-950"
                  >
                    <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      @{admin.people.username}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  No admins listed.
                </Text>
              )}
            </View>
          </View>
        </View>

        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
            League Rules
          </Text>

          <View className="mt-4 gap-4">
            <View>
              <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                Weekly Picks
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Pick each game winner and submit a tiebreaker total score for the final
                chronological game. Weekly winner is most correct picks, then closest
                tiebreaker score, then co-winners if still tied.
              </Text>
            </View>

            <View>
              <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                Seasonal Picks
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Season standings are based on total correct picks across the full season.
                Top finishers share season winner recognition.
              </Text>
            </View>

            {league.superbowl_competition ? (
              <View>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                  Super Bowl Competition
                </Text>
                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Before kickoff, submit a winner, loser, and total score. Contest ranks by
                  correct winner first, then correct loser, then closest total score.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
