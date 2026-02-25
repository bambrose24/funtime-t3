import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { clientApi } from "@/lib/trpc/react";

type Props = {
  leagueId: string;
};

export function LeagueMyProfile({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();

  const viewerMembership = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);

  const { data: profileData, isLoading: profileLoading } =
    clientApi.playerProfile.get.useQuery(
      {
        leagueId: leagueIdNumber,
        memberId: viewerMembership?.membership_id ?? 0,
      },
      { enabled: !!viewerMembership },
    );

  const { data: teams } = clientApi.teams.getTeams.useQuery(undefined, {
    enabled: Boolean(profileData?.member.superbowl?.length),
  });

  const teamById = useMemo(() => {
    return new Map((teams ?? []).map((team) => [team.teamid, team]));
  }, [teams]);

  if (sessionLoading || profileLoading) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!viewerMembership || !profileData) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-gray-500 dark:text-gray-400">
          Unable to load your league profile.
        </Text>
      </View>
    );
  }

  const member = profileData.member;
  const superbowlPick = member.superbowl[0];
  const superbowlWinner = superbowlPick
    ? teamById.get(superbowlPick.winner)
    : null;
  const superbowlLoser = superbowlPick ? teamById.get(superbowlPick.loser) : null;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
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
          <View className="gap-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Correct Picks: {profileData.correctPicks}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Wrong Picks: {profileData.wrongPicks}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Week Wins: {member.WeekWinners.length}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Messages Posted: {member.leaguemessages.length}
            </Text>
          </View>
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
            <View className="gap-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Winner:{" "}
                {superbowlWinner
                  ? `${superbowlWinner.loc} ${superbowlWinner.name}`
                  : superbowlPick.winner}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Loser:{" "}
                {superbowlLoser
                  ? `${superbowlLoser.loc} ${superbowlLoser.name}`
                  : superbowlPick.loser}
              </Text>
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
