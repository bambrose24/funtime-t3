import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
  Text,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { clientApi } from "@/lib/trpc/react";
import { ClientPickPage } from "@/components/picks/ClientPickPage";
import { Button } from "@/components/ui/button";
import { DEFAULT_SEASON } from "@/constants";
import { cn } from "@/lib/utils";
import { usePrefetchForLeague } from "@/hooks/usePrefetchForLeague";

export default function PickScreen() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [isLeagueTransitioning, setIsLeagueTransitioning] = useState(false);
  const pickContentOpacity = useState(() => new Animated.Value(1))[0];

  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();

  const activeSeasonLeagues = useMemo(() => {
    const memberships = session?.dbUser?.leaguemembers ?? [];
    return memberships
      .filter((membership) => membership.leagues.season === DEFAULT_SEASON)
      .sort((a, b) =>
        (a.leagues.name ?? "").localeCompare(b.leagues.name ?? ""),
      );
  }, [session?.dbUser?.leaguemembers]);

  useEffect(() => {
    if (activeSeasonLeagues.length === 0) {
      setSelectedLeagueId(null);
      return;
    }

    setSelectedLeagueId((currentLeagueId) => {
      if (
        currentLeagueId &&
        activeSeasonLeagues.some(
          (league) => league.league_id === currentLeagueId,
        )
      ) {
        return currentLeagueId;
      }

      return activeSeasonLeagues[0]!.league_id;
    });
  }, [activeSeasonLeagues]);

  usePrefetchForLeague(selectedLeagueId ?? undefined, {
    immediate: true,
    aggressive: false,
  });

  const switchToLeague = useCallback(
    (nextLeagueId: number) => {
      if (isLeagueTransitioning || selectedLeagueId === nextLeagueId) {
        return;
      }

      Haptics.selectionAsync().catch(() => {
        // No-op if haptics are unavailable.
      });

      setIsLeagueTransitioning(true);
      pickContentOpacity.stopAnimation();
      Animated.timing(pickContentOpacity, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          setIsLeagueTransitioning(false);
          return;
        }

        setSelectedLeagueId(nextLeagueId);
        Animated.timing(pickContentOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }).start(() => {
          setIsLeagueTransitioning(false);
        });
      });
    },
    [isLeagueTransitioning, pickContentOpacity, selectedLeagueId],
  );

  if (sessionLoading) {
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

  if (activeSeasonLeagues.length === 0) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          <View className="items-center justify-center py-16">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-4 text-center text-3xl font-bold">
              No Active Leagues
            </Text>
            <Text className="text-center text-base text-gray-600 dark:text-gray-400">
              You are not in any {DEFAULT_SEASON} leagues yet.
            </Text>
            <View className="mt-6 flex-row gap-3">
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
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <View className="border-b border-gray-200 px-4 pb-3 pt-4 dark:border-zinc-800">
        <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Pick For League
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 10, paddingRight: 8 }}
        >
          {activeSeasonLeagues.map((league) => {
            const isActive = league.league_id === selectedLeagueId;
            return (
              <Pressable
                key={league.membership_id}
                onPress={() => switchToLeague(league.league_id)}
                disabled={isLeagueTransitioning}
                className={cn(
                  "mr-2 rounded-full border px-4 py-2",
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/60"
                    : "border-gray-300 bg-app-card-light dark:border-zinc-700 dark:bg-app-card-dark",
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-semibold",
                    isActive
                      ? "text-blue-700 dark:text-blue-200"
                      : "text-app-fg-light dark:text-app-fg-dark",
                  )}
                >
                  {league.leagues.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {selectedLeagueId ? (
        <Animated.View className="flex-1" style={{ opacity: pickContentOpacity }}>
          <ClientPickPage
            key={`pick-league-${selectedLeagueId}`}
            leagueId={selectedLeagueId.toString()}
          />
        </Animated.View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading picks...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
