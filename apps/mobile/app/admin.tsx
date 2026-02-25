import React, { useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/trpc/react";
import { DEFAULT_SEASON } from "@/constants";

export default function MobileGlobalAdminScreen() {
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: isSuperAdmin, isLoading: isSuperAdminLoading } =
    clientApi.generalAdmin.isSuperAdmin.useQuery();
  const { data: adminData, isLoading: adminDataLoading } =
    clientApi.generalAdmin.getAdminData.useQuery(undefined, {
      enabled: Boolean(isSuperAdmin),
    });

  const seasonLeagues = useMemo(() => {
    return (adminData?.allLeagues ?? [])
      .filter((league) => league.season === DEFAULT_SEASON)
      .sort((a, b) => b.members - a.members);
  }, [adminData?.allLeagues]);

  const totalPicksAllTime = useMemo(() => {
    return (adminData?.picksBySeason ?? []).reduce(
      (total, row) => total + row._count,
      0,
    );
  }, [adminData?.picksBySeason]);

  const totalMessages = useMemo(() => {
    return (adminData?.messagesSent ?? []).reduce(
      (total, row) => total + row._count,
      0,
    );
  }, [adminData?.messagesSent]);

  const thisSeasonPlayers = useMemo(() => {
    return seasonLeagues.reduce((total, league) => total + league.members, 0);
  }, [seasonLeagues]);

  const totalEmails = useMemo(() => {
    return (adminData?.emailsSent ?? []).reduce(
      (total, row) => total + row._count,
      0,
    );
  }, [adminData?.emailsSent]);

  if (
    sessionLoading ||
    isSuperAdminLoading ||
    (isSuperAdmin && adminDataLoading)
  ) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading admin dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session?.dbUser || !isSuperAdmin) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-2xl font-bold">
            Super Admin Only
          </Text>
          <Text className="text-center text-base text-gray-600 dark:text-gray-400">
            This dashboard is restricted to the global super-admin account.
          </Text>
          <Button onPress={() => router.back()}>Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              Global Admin
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Cross-league system metrics and quick admin access.
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              All-time Picks
            </Text>
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              {totalPicksAllTime.toLocaleString()}
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {DEFAULT_SEASON} Season Leagues
            </Text>
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              {seasonLeagues.length.toLocaleString()}
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {DEFAULT_SEASON} Season Players
            </Text>
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              {thisSeasonPlayers.toLocaleString()}
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Messages Sent
            </Text>
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              {totalMessages.toLocaleString()}
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Emails Sent
            </Text>
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              {totalEmails.toLocaleString()}
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Picks by Season
            </Text>
            {(adminData?.picksBySeason ?? []).map((seasonData) => (
              <View
                key={seasonData.season}
                className="flex-row items-center justify-between border-b border-gray-100 pb-2 dark:border-zinc-700"
              >
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  {seasonData.season}
                </Text>
                <Text className="text-sm font-semibold text-app-fg-light dark:text-app-fg-dark">
                  {seasonData._count.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-1 px-1">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
              {DEFAULT_SEASON} Leagues
            </Text>
          </View>

          {seasonLeagues.length === 0 ? (
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                No leagues found for the current season.
              </Text>
            </View>
          ) : (
            seasonLeagues.map((league) => (
              <View
                key={league.league_id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3"
              >
                <View className="gap-1">
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                    {league.name}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    League #{league.league_id} • Members: {league.members}
                  </Text>
                </View>

                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/league/${league.league_id}/admin` as any)}
                >
                  Open Admin Tools
                </Button>
              </View>
            ))
          )}

          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
