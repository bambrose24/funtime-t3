import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LeagueMemberProfile } from "@/components/profile/LeagueMemberProfile";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";

export default function LeaguePlayerProfileScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { id, memberId } = useLocalSearchParams<{
    id: string;
    memberId: string;
  }>();

  if (!id || !memberId) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text className="text-center text-base text-gray-500 dark:text-gray-400">
            Player profile not found.
          </Text>
          <Button onPress={() => router.back()}>Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <View className="border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="bg-app-card-light dark:bg-app-card-dark rounded-lg p-2"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
            />
          </Pressable>
          <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
            Player Profile
          </Text>
          <View className="w-10" />
        </View>
      </View>
      <LeagueMemberProfile leagueId={id} memberId={memberId} />
    </SafeAreaView>
  );
}
