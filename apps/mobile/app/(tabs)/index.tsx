import React from "react";
import { ScrollView, View, Text, SafeAreaView } from "react-native";
import { clientApi } from "@/lib/trpc/react";
import { HomeLeagueCard } from "@/components/home/HomeLeagueCard";
import { DEFAULT_SEASON } from "@/constants";

export default function HomeScreen() {
  // Fetch session and home summary data
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: homeData, isLoading: homeLoading } =
    clientApi.home.summary.useQuery(
      undefined,
      { enabled: !!session?.dbUser }, // Only fetch if user is authenticated
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

  // Filter leagues by season
  const activeLeagues =
    homeData?.filter((l) => l.season === DEFAULT_SEASON) ?? [];
  const priorLeagues =
    homeData?.filter((l) => l.season !== DEFAULT_SEASON) ?? [];

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Active Leagues Section */}
        <View className="px-6 pb-4 pt-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-2xl font-bold">
            Active Leagues
          </Text>
        </View>

        <View className="px-4">
          {homeLoading ? (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-base text-gray-500 dark:text-gray-400">
                Loading your leagues...
              </Text>
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
              <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-2xl font-bold">
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
