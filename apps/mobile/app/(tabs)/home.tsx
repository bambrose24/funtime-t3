import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "@/lib/useColorScheme";
import { clientApi } from "@/lib/trpc/react";
import { HomeLeagueCard } from "@/components/home/HomeLeagueCard";
import { DEFAULT_SEASON } from "@/constants";
import { usePrefetchActiveSeasonLeagues } from "@/hooks/usePrefetchForLeague";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataAvailabilityTracker } from "@/hooks/useCacheDebugger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterLeaguesByQuery } from "@/lib/home/filterLeaguesByQuery";

export default function HomeScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPriorLeagues, setShowPriorLeagues] = useState(false);
  const [leagueSearchQuery, setLeagueSearchQuery] = useState("");

  // Always call; no-ops outside __DEV__.
  useDataAvailabilityTracker();

  const {
    data: session,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = clientApi.session.current.useQuery();
  const {
    data: homeData,
    isLoading: homeLoading,
    isError: homeError,
    isFetching: homeFetching,
    refetch: refetchHomeData,
  } = clientApi.home.leagues.useQuery(undefined, {
    enabled: !!session?.dbUser,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
  const {
    data: renewalCandidatesData,
    isLoading: renewalCandidatesLoading,
    refetch: refetchRenewalCandidates,
  } = clientApi.league.renewalCandidates.useQuery(undefined, {
    enabled: !!session?.dbUser,
  });
  const renewalCandidates = renewalCandidatesData ?? [];

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    try {
      await refetchSession();
      await Promise.all([refetchHomeData(), refetchRenewalCandidates()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchHomeData, refetchRenewalCandidates, refetchSession]);

  useFocusEffect(
    useCallback(() => {
      if (!session?.dbUser) {
        return;
      }
      void refetchHomeData();
    }, [refetchHomeData, session?.dbUser]),
  );

  // Prefetch active season leagues for faster transitions.
  const prefetchLeagueIds = useMemo(() => {
    if (!homeData) return [];
    return homeData
      .filter((l) => l.season === DEFAULT_SEASON)
      .map((l) => l.league_id);
  }, [homeData]);

  usePrefetchActiveSeasonLeagues(prefetchLeagueIds, {
    immediate: true,
    aggressive: false,
  });

  // Preserve server ordering from home.leagues (season desc, name asc, id).
  const leagues = homeData ?? [];

  const activeLeagues = useMemo(() => {
    return leagues.filter((l) => l.season === DEFAULT_SEASON);
  }, [leagues]);

  const upcomingLeagues = useMemo(() => {
    return leagues.filter((l) => l.season > DEFAULT_SEASON);
  }, [leagues]);

  const priorLeagues = useMemo(() => {
    return leagues.filter((l) => l.season < DEFAULT_SEASON);
  }, [leagues]);

  const filteredActiveLeagues = useMemo(
    () => filterLeaguesByQuery(activeLeagues, leagueSearchQuery),
    [activeLeagues, leagueSearchQuery],
  );
  const filteredUpcomingLeagues = useMemo(
    () => filterLeaguesByQuery(upcomingLeagues, leagueSearchQuery),
    [leagueSearchQuery, upcomingLeagues],
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

  const neededCount = useMemo(
    () =>
      activeLeagues.filter((league) => league.weeklyStatus?.state === "needed")
        .length,
    [activeLeagues],
  );

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
        <View className="flex-row items-center justify-between px-6 pb-4 pt-6">
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
          <Button
            testID="home-join-league"
            variant="outline"
            onPress={() => router.push("/join-league" as any)}
          >
            Join League
          </Button>
          {renewalCandidates.length > 0 ? (
            <Pressable
              onPress={() =>
                router.push(
                  `/league/create?priorLeagueId=${renewalCandidates[0]?.priorLeagueId}` as any,
                )
              }
              className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950"
            >
              <View className="flex-row items-start gap-3">
                <View className="rounded-full border border-blue-200 bg-white p-2 dark:border-blue-800 dark:bg-blue-900">
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={isDarkColorScheme ? "#93c5fd" : "#1d4ed8"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Set up the {DEFAULT_SEASON} season
                  </Text>
                  <Text
                    className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100"
                    numberOfLines={1}
                  >
                    {renewalCandidates[0]?.name}
                  </Text>
                  <Text className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                    Renew a prior league and invite last year's players.
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDarkColorScheme ? "#93c5fd" : "#1d4ed8"}
                />
              </View>
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
          {!homeLoading && !homeError && neededCount > 0 ? (
            <Text className="mx-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
              {neededCount === 1
                ? "1 league needs picks"
                : `${neededCount} leagues need picks`}
            </Text>
          ) : null}

          {homeError ? (
            <View className="mx-2 mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <Text className="text-sm text-amber-900 dark:text-amber-100">
                Couldn't refresh your leagues. Pick status is unavailable.
              </Text>
              <View className="mt-3">
                <Button
                  variant="outline"
                  disabled={homeFetching || renewalCandidatesLoading}
                  onPress={() => {
                    void refetchHomeData();
                  }}
                >
                  {homeFetching ? "Retrying…" : "Try again"}
                </Button>
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
                  <View className="mb-4">
                    <Skeleton className="mx-auto h-6 w-40 rounded" />
                  </View>
                  <View className="gap-3">
                    <View className="flex-row items-center justify-between">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </View>
                    <View className="h-px bg-gray-200 dark:bg-zinc-700" />
                    <View className="flex-row items-center justify-between">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : filteredActiveLeagues.length === 0 && !homeError ? (
            <View className="px-4 py-8">
              <Text className="text-center text-base font-medium text-gray-800 dark:text-gray-200">
                {leagueSearchQuery.trim().length > 0
                  ? `No active leagues match "${leagueSearchQuery.trim()}".`
                  : `No leagues for the ${DEFAULT_SEASON} season yet.`}
              </Text>
              {leagueSearchQuery.trim().length === 0 ? (
                <Text className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                  Join a league with a friend's invite link or code.
                </Text>
              ) : null}
            </View>
          ) : filteredActiveLeagues.length > 0 ? (
            <View className="gap-4">
              {filteredActiveLeagues.map((league) => (
                <HomeLeagueCard
                  key={league.league_id}
                  data={league}
                  statusUnavailable={homeError}
                />
              ))}
            </View>
          ) : null}
        </View>

        {filteredUpcomingLeagues.length > 0 ? (
          <>
            <View className="px-6 pb-4 pt-8">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                Upcoming Seasons
              </Text>
            </View>
            <View className="gap-4 px-4">
              {filteredUpcomingLeagues.map((league) => (
                <HomeLeagueCard
                  key={league.league_id}
                  data={league}
                  statusUnavailable={homeError}
                />
              ))}
            </View>
          </>
        ) : null}

        {filteredPriorLeagues.length > 0 ? (
          <>
            <View className="flex-row items-center justify-between px-6 pb-4 pt-8">
              <View>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                  Prior Leagues
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Past seasons, collapsed by default.
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
                  <HomeLeagueCard
                    key={league.league_id}
                    data={league}
                    statusUnavailable={homeError}
                  />
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
