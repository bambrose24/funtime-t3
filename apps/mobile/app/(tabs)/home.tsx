import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  SafeAreaView,
  Pressable,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/lib/useColorScheme";
import { clientApi } from "@/lib/trpc/react";
import { HomeLeagueCard } from "@/components/home/HomeLeagueCard";
import { DEFAULT_SEASON } from "@/constants";
import { usePrefetchActiveSeasonLeagues } from "@/hooks/usePrefetchForLeague";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataAvailabilityTracker } from "@/hooks/useCacheDebugger";
import { Button } from "@/components/ui/button";
import { getSingleActiveLeague } from "@/lib/home/getSingleActiveLeague";
import { Input } from "@/components/ui/input";
import { filterLeaguesByQuery } from "@/lib/home/filterLeaguesByQuery";

export default function HomeScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPriorLeagues, setShowPriorLeagues] = useState(false);
  const [isAutoOpeningLeague, setIsAutoOpeningLeague] = useState(false);
  const [leagueSearchQuery, setLeagueSearchQuery] = useState("");
  const hasAutoOpenedLeagueRef = useRef(false);
  
  // Debug data availability (remove in production)
  if (__DEV__) {
    useDataAvailabilityTracker();
  }
  
  // Fetch session and home summary data
  const { data: session, isLoading: sessionLoading, refetch: refetchSession } =
    clientApi.session.current.useQuery();
  const { data: homeData, isLoading: homeLoading, refetch: refetchHomeData } =
    clientApi.home.summary.useQuery(
      undefined,
      { enabled: !!session?.dbUser }, // Only fetch if user is authenticated
    );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    try {
      await refetchSession();
      await refetchHomeData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchHomeData, refetchSession]);

  // Prefetch active season leagues for faster transitions.
  const prefetchLeagueIds = useMemo(() => {
    if (!homeData) return [];
    return homeData
      .filter((l) => l.season === DEFAULT_SEASON)
      .map((l) => l.league_id);
  }, [homeData]);

  // Always call the hook to maintain hook order, but it will handle empty arrays gracefully
  usePrefetchActiveSeasonLeagues(prefetchLeagueIds, {
    immediate: true,
    aggressive: false,
  });

  // Sort all leagues by season first (descending), then by member count (descending)
  // These must be called before any early returns to maintain hook order
  const sortedLeagues = useMemo(() => {
    return [...(homeData ?? [])]
      .sort((a, b) => {
        // First sort by season (descending - newer seasons first)
        if (a.season !== b.season) {
          return b.season - a.season;
        }
        // Then sort by member count (descending - more members first)
        const aCount = (a as any)._count?.leaguemembers ?? 0;
        const bCount = (b as any)._count?.leaguemembers ?? 0;
        return bCount - aCount;
      });
  }, [homeData]);

  // Filter the sorted leagues by season
  const activeLeagues = useMemo(() => {
    return sortedLeagues.filter((l) => l.season === DEFAULT_SEASON);
  }, [sortedLeagues]);
  
  const priorLeagues = useMemo(() => {
    return sortedLeagues.filter((l) => l.season !== DEFAULT_SEASON);
  }, [sortedLeagues]);
  const filteredActiveLeagues = useMemo(
    () => filterLeaguesByQuery(activeLeagues, leagueSearchQuery),
    [activeLeagues, leagueSearchQuery],
  );
  const filteredPriorLeagues = useMemo(
    () => filterLeaguesByQuery(priorLeagues, leagueSearchQuery),
    [leagueSearchQuery, priorLeagues],
  );
  const visiblePriorLeagues = useMemo(() => {
    return showPriorLeagues
      ? filteredPriorLeagues
      : filteredPriorLeagues.slice(0, 3);
  }, [filteredPriorLeagues, showPriorLeagues]);
  const singleActiveLeague = useMemo(
    () => getSingleActiveLeague(homeData, DEFAULT_SEASON),
    [homeData],
  );

  useEffect(() => {
    if (hasAutoOpenedLeagueRef.current) {
      return;
    }
    if (sessionLoading || homeLoading || isRefreshing) {
      return;
    }
    if (!session?.dbUser || !singleActiveLeague) {
      return;
    }

    hasAutoOpenedLeagueRef.current = true;
    setIsAutoOpeningLeague(true);
    router.replace(`/league/${singleActiveLeague.league_id}` as any);
  }, [
    homeLoading,
    isRefreshing,
    session?.dbUser,
    sessionLoading,
    singleActiveLeague,
  ]);

  // Show loading while fetching session
  if (sessionLoading) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show welcome/landing screen if not authenticated
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
              Welcome to Funtime
            </Text>
            <Text className="text-center text-lg text-gray-700 dark:text-gray-300">
              Free NFL Pick 'em Platform
            </Text>
            <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-400">
              Sign in to view your leagues and make picks!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isAutoOpeningLeague && singleActiveLeague) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-xl font-semibold">
            Opening {singleActiveLeague.name}...
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Taking you straight to your active league.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={isDarkColorScheme ? "#9ca3af" : "#6b7280"}
          />
        }
      >
        {/* Header with Account button */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
            My Leagues
          </Text>
          <Pressable
            onPress={() => router.push("/account")}
            className="bg-app-card-light dark:bg-app-card-dark rounded-lg p-2"
          >
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
            />
          </Pressable>
        </View>

        <View className="px-6 pb-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                variant="outline"
                onPress={() => router.push("/join-league" as any)}
              >
                Join League
              </Button>
            </View>
            <View className="flex-1">
              <Button onPress={() => router.push("/league/create" as any)}>
                Create League
              </Button>
            </View>
          </View>
          {singleActiveLeague && !homeLoading ? (
            <Pressable
              onPress={() => router.push(`/league/${singleActiveLeague.league_id}` as any)}
              className="mt-3 flex-row items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950"
            >
              <View className="flex-1 pr-3">
                <Text className="text-[11px] uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Active League
                </Text>
                <Text
                  className="mt-1 text-sm font-semibold text-blue-800 dark:text-blue-200"
                  numberOfLines={1}
                >
                  {singleActiveLeague.name}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDarkColorScheme ? "#93c5fd" : "#1d4ed8"}
              />
            </Pressable>
          ) : null}
          <View className="mt-3 flex-row items-center gap-2">
            <Input
              className="flex-1"
              value={leagueSearchQuery}
              onChangeText={setLeagueSearchQuery}
              placeholder="Search leagues"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {leagueSearchQuery.trim().length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onPress={() => setLeagueSearchQuery("")}
              >
                Clear
              </Button>
            ) : null}
          </View>
        </View>

        <View className="px-4">
          {!homeLoading ? (
            <View className="mb-4 mx-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Active
                  </Text>
                  <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-base font-semibold">
                    {activeLeagues.length}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Prior
                  </Text>
                  <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-base font-semibold">
                    {priorLeagues.length}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Season
                  </Text>
                  <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-base font-semibold">
                    {DEFAULT_SEASON}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {homeLoading ? (
            <View className="gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <View
                  key={i}
                  className="mx-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {/* League Name Header Skeleton */}
                  <View className="mb-4">
                    <Skeleton className="mx-auto h-6 w-40 rounded" />
                  </View>

                  {/* Stats Section Skeleton */}
                  <View className="gap-3">
                    {/* Correct Picks Row Skeleton */}
                    <View className="flex-row items-center justify-between">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </View>

                    {/* Separator */}
                    <View className="h-px bg-gray-200 dark:bg-zinc-700" />

                    {/* Week Wins Row Skeleton */}
                    <View className="flex-row items-center justify-between">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : filteredActiveLeagues.length === 0 ? (
            <View className="px-4 py-8">
              <Text className="text-center text-base text-gray-600 dark:text-gray-400">
                {leagueSearchQuery.trim().length > 0
                  ? `No active leagues match "${leagueSearchQuery.trim()}".`
                  : `No active leagues for the ${DEFAULT_SEASON} season.\nCreate one or join from a friend's share link.`}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {filteredActiveLeagues.map((league) => (
                <HomeLeagueCard key={league.league_id} data={league} />
              ))}
            </View>
          )}
        </View>

        {/* Prior Leagues Section */}
        {filteredPriorLeagues.length > 0 && (
          <>
            <View className="px-6 pb-4 pt-8 flex-row items-center justify-between">
              <View>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                  Prior Leagues
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Sorted by season then league size.
                </Text>
              </View>
              {filteredPriorLeagues.length > 3 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setShowPriorLeagues((show) => !show)}
                >
                  {showPriorLeagues
                    ? "Show less"
                    : `Show all (${filteredPriorLeagues.length})`}
                </Button>
              ) : null}
            </View>

            <View className="px-4">
              <View className="gap-4">
                {visiblePriorLeagues.map((league) => (
                  <HomeLeagueCard key={league.league_id} data={league} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
