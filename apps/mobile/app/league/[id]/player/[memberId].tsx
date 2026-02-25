import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LeagueMemberProfile } from "@/components/profile/LeagueMemberProfile";
import { Button } from "@/components/ui/button";

export default function LeaguePlayerProfileScreen() {
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
      <View className="border-b border-gray-200 px-4 py-3 dark:border-zinc-800">
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          Back
        </Button>
      </View>
      <LeagueMemberProfile leagueId={id} memberId={memberId} />
    </SafeAreaView>
  );
}
