import React from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";
import { clientApi } from "@/lib/trpc/react";
import { ClientPickPage } from "@/components/picks/ClientPickPage";
import { DEFAULT_SEASON } from "@/constants";

export default function PickScreen() {
  // Get session first to ensure user is authenticated
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();

  // Only fetch other data if user is authenticated and has leagues
  const firstLeagueId = session?.dbUser?.leaguemembers?.find(
    (m) => m.leagues.season === DEFAULT_SEASON,
  )?.league_id;

  const { data: weekToPick, isLoading: weekLoading } =
    clientApi.league.weekToPick.useQuery(
      { leagueId: firstLeagueId! },
      { enabled: !!firstLeagueId },
    );

  const { data: teams, isLoading: teamsLoading } =
    clientApi.teams.getTeams.useQuery();

  const { data: league, isLoading: leagueLoading } =
    clientApi.league.get.useQuery(
      { leagueId: firstLeagueId! },
      { enabled: !!firstLeagueId },
    );

  const { data: existingPicks, isLoading: picksLoading } =
    clientApi.member.picksForWeek.useQuery(
      {
        leagueId: firstLeagueId!,
        week: weekToPick?.week ?? 0,
      },
      { enabled: !!firstLeagueId && !!weekToPick?.week },
    );

  // Show loading state
  if (
    sessionLoading ||
    weekLoading ||
    teamsLoading ||
    leagueLoading ||
    picksLoading
  ) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading picks...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show welcome screen if not authenticated
  if (!session?.dbUser) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          <View className="items-center justify-center py-16">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-4 text-center text-3xl font-bold">
              Sign In Required
            </Text>
            <Text className="text-center text-base text-gray-600 dark:text-gray-400">
              Please sign in to make your picks!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show no leagues message
  if (!firstLeagueId || !league) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          <View className="items-center justify-center py-16">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-4 text-center text-3xl font-bold">
              No Leagues Found
            </Text>
            <Text className="text-center text-base text-gray-600 dark:text-gray-400">
              Join or create a league to start making picks!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show season over message
  if (!weekToPick?.week || !weekToPick?.games?.length) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          <View className="items-center justify-center py-16">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-4 text-center text-3xl font-bold">
              Season Over!
            </Text>
            <Text className="text-center text-base text-gray-600 dark:text-gray-400">
              The season is over. Play again next year!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ClientPickPage leagueId={firstLeagueId.toString()} />
    </SafeAreaView>
  );
}
