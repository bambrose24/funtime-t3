import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/trpc/react";
import { DEFAULT_SEASON } from "@/constants";
import { useColorScheme } from "@/lib/useColorScheme";

export default function MobileGlobalAdminScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const {
    data: session,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = clientApi.session.current.useQuery();
  const {
    data: isSuperAdmin,
    isLoading: isSuperAdminLoading,
    refetch: refetchSuperAdmin,
  } = clientApi.generalAdmin.isSuperAdmin.useQuery();
  const {
    data: adminData,
    isLoading: adminDataLoading,
    refetch: refetchAdminData,
  } =
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
  const averageMembersPerLeague = useMemo(() => {
    if (seasonLeagues.length === 0) {
      return 0;
    }
    return Math.round(thisSeasonPlayers / seasonLeagues.length);
  }, [seasonLeagues.length, thisSeasonPlayers]);
  const largestLeague = useMemo(() => {
    return seasonLeagues[0] ?? null;
  }, [seasonLeagues]);

  const totalEmails = useMemo(() => {
    return (adminData?.emailsSent ?? []).reduce(
      (total, row) => total + row._count,
      0,
    );
  }, [adminData?.emailsSent]);

  const metricTiles = useMemo(() => {
    return [
      {
        label: "All-time Picks",
        value: totalPicksAllTime,
      },
      {
        label: `${DEFAULT_SEASON} Leagues`,
        value: seasonLeagues.length,
      },
      {
        label: `${DEFAULT_SEASON} Players`,
        value: thisSeasonPlayers,
      },
      {
        label: "Messages Sent",
        value: totalMessages,
      },
      {
        label: "Emails Sent",
        value: totalEmails,
      },
    ];
  }, [
    seasonLeagues.length,
    thisSeasonPlayers,
    totalEmails,
    totalMessages,
    totalPicksAllTime,
  ]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
    try {
      await refetchSession();
      await refetchSuperAdmin();
      if (isSuperAdmin) {
        await refetchAdminData();
      }
      setLastRefreshedAt(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [isSuperAdmin, refetchAdminData, refetchSession, refetchSuperAdmin]);

  const refreshStatusLabel = isRefreshing
    ? "Refreshing..."
    : lastRefreshedAt
      ? `Updated ${formatDistanceToNow(lastRefreshedAt, { addSuffix: true })}`
      : "Pull to refresh";

  useEffect(() => {
    if (isSuperAdmin && adminData && !lastRefreshedAt) {
      setLastRefreshedAt(new Date());
    }
  }, [adminData, isSuperAdmin, lastRefreshedAt]);

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="gap-4">
          <View className="flex-row items-start gap-3 px-1">
            <Pressable
              onPress={() => router.back()}
              className="mt-1 rounded-lg bg-app-card-light p-2 dark:bg-app-card-dark"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
            <View className="flex-1 gap-1">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                Global Admin
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Cross-league system metrics and quick admin access.
              </Text>
            </View>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <View className="flex-row items-center justify-between">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                System Snapshot
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {refreshStatusLabel}
              </Text>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <View className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-blue-700 dark:text-blue-300">
                  Avg Members: {averageMembersPerLeague}
                </Text>
              </View>
              <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-700 dark:text-gray-200">
                  Active Leagues: {seasonLeagues.length}
                </Text>
              </View>
            </View>
            {largestLeague ? (
              <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Largest {DEFAULT_SEASON} league: {largestLeague.name} ({largestLeague.members} members)
              </Text>
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-3">
            {metricTiles.map((tile) => (
              <View
                key={tile.label}
                style={{ width: "48%" }}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {tile.label}
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-2xl font-bold">
                  {tile.value.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          <View className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            <View className="border-b border-gray-100 px-4 py-3 dark:border-zinc-700">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                Picks by Season
              </Text>
            </View>
            <View className="flex-row items-center border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
              <Text className="w-20 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Season
              </Text>
              <Text className="flex-1 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Picks
              </Text>
            </View>
            {(adminData?.picksBySeason ?? []).length === 0 ? (
              <View className="px-4 py-3">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  No picks found.
                </Text>
              </View>
            ) : (
              (adminData?.picksBySeason ?? []).map((seasonData, index, arr) => (
                <View
                  key={seasonData.season}
                  className={`flex-row items-center px-4 py-2 ${
                    index < arr.length - 1
                      ? "border-b border-gray-100 dark:border-zinc-800"
                      : ""
                  }`}
                >
                  <Text className="w-20 text-sm text-gray-700 dark:text-gray-200">
                    {seasonData.season}
                  </Text>
                  <Text className="flex-1 text-right text-sm font-semibold text-app-fg-light dark:text-app-fg-dark">
                    {seasonData._count.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            <View className="border-b border-gray-100 px-4 py-3 dark:border-zinc-700">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                {DEFAULT_SEASON} Leagues
              </Text>
            </View>
            <View className="flex-row items-center border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
              <Text className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                League
              </Text>
              <Text className="w-20 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Members
              </Text>
              <Text className="w-16 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Action
              </Text>
            </View>
            {seasonLeagues.length === 0 ? (
              <View className="px-4 py-3">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  No leagues found for the current season.
                </Text>
              </View>
            ) : (
              seasonLeagues.map((league, index) => (
                <View
                  key={league.league_id}
                  className={`flex-row items-center px-4 py-2 ${
                    index < seasonLeagues.length - 1
                      ? "border-b border-gray-100 dark:border-zinc-800"
                      : ""
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text
                      numberOfLines={1}
                      className="text-sm font-semibold text-app-fg-light dark:text-app-fg-dark"
                    >
                      {league.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      #{league.league_id}
                    </Text>
                  </View>
                  <Text className="w-20 text-right text-sm text-gray-700 dark:text-gray-200">
                    {league.members.toLocaleString()}
                  </Text>
                  <Pressable
                    className="w-16 items-end"
                    onPress={() =>
                      router.push(`/league/${league.league_id}/admin` as any)
                    }
                  >
                    <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Open
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Quick Totals
            </Text>
            {metricTiles.map((tile, index) => (
              <View
                key={tile.label}
                className={`flex-row items-center justify-between ${
                  index < metricTiles.length - 1
                    ? "border-b border-gray-100 pb-2 dark:border-zinc-700"
                    : ""
                }`}
              >
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  {tile.label}
                </Text>
                <Text className="text-sm font-semibold text-app-fg-light dark:text-app-fg-dark">
                  {tile.value.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
