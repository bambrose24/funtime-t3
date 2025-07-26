import React, { useMemo } from "react";
import { ScrollView, View, Text, SafeAreaView, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { clientApi } from "@/lib/trpc/react";
import { HomeLeagueCard } from "@/components/home/HomeLeagueCard";
import { DEFAULT_SEASON } from "@/constants";
import { usePrefetchActiveSeasonLeagues } from "@/hooks/usePrefetchForLeague";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataAvailabilityTracker } from "@/hooks/useCacheDebugger";

export default function HomeScreen() {
  const { isDarkColorScheme } = useColorScheme();
  
  // Debug data availability (remove in production)
  if (__DEV__) {
    useDataAvailabilityTracker();
  }
  
  // Fetch session and home summary data
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: homeData, isLoading: homeLoading } =
    clientApi.home.summary.useQuery(
      undefined,
      { enabled: !!session?.dbUser }, // Only fetch if user is authenticated
    );

  // Get leagues for 2024/2025 seasons for prefetching
  // Use useMemo to stabilize the array reference to avoid hook order issues
  const prefetchLeagueIds = useMemo(() => {
    if (!homeData) return [];
    return homeData
      .filter((l) => l.season === 2024 || l.season === 2025)
      .map(l => l.league_id);
  }, [homeData]);

  // Always call the hook to maintain hook order, but it will handle empty arrays gracefully
  usePrefetchActiveSeasonLeagues(prefetchLeagueIds, {
    immediate: true,
    aggressive: false,
  });

  // Sort all leagues by season first (descending), then by member count (descending)
  // These must be called before any early returns to maintain hook order
  const sortedLeagues = useMemo(() => {
    return (homeData ?? [])
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

        <View className="px-4">
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
          ) : activeLeagues.length === 0 ? (
            <View className="px-4 py-8">
              <Text className="text-center text-base text-gray-600 dark:text-gray-400">
                No active leagues for the {DEFAULT_SEASON} season.{"\n"}
                Create one or join from a friend's share link.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {activeLeagues.map((league) => (
                <HomeLeagueCard key={league.league_id} data={league} />
              ))}
            </View>
          )}
        </View>

        {/* Prior Leagues Section */}
        {priorLeagues.length > 0 && (
          <>
            <View className="px-6 pb-4 pt-8">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                Prior Leagues
              </Text>
            </View>

            <View className="px-4">
              <View className="gap-4">
                {priorLeagues.map((league) => (
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