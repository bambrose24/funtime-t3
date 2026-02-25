import React, { useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const joinLeagueSchema = z.object({
  leagueCode: z.string().trim().min(1, "League code is required"),
});

function extractLeagueCode(rawInput: string) {
  const input = rawInput.trim();
  if (!input) {
    return "";
  }

  const normalized = input.endsWith("/") ? input.slice(0, -1) : input;
  const marker = "/join-league/";
  const markerIndex = normalized.lastIndexOf(marker);
  if (markerIndex >= 0) {
    return normalized.slice(markerIndex + marker.length);
  }

  return normalized;
}

export default function JoinLeagueEntryScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [leagueCode, setLeagueCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof code === "string" && code.trim().length > 0) {
      setLeagueCode(code);
    }
  }, [code]);

  const normalizedCode = useMemo(
    () => extractLeagueCode(leagueCode),
    [leagueCode],
  );

  const onSubmit = () => {
    const parsed = joinLeagueSchema.safeParse({ leagueCode: normalizedCode });
    if (!parsed.success) {
      Alert.alert("Missing Code", parsed.error.errors[0]?.message ?? "Enter a valid code.");
      return;
    }

    setSubmitting(true);
    router.push(`/join-league/${parsed.data.leagueCode}` as any);
    setSubmitting(false);
  };

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      >
        <View className="mx-auto w-full max-w-xl justify-center gap-6 py-10">
          <View className="gap-2">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
              Join a League
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              Paste a join URL or enter a league code.
            </Text>
          </View>

          <View className="gap-3">
            <Input
              value={leagueCode}
              onChangeText={setLeagueCode}
              placeholder="ABC123 or https://play-funtime.com/join-league/ABC123"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button onPress={onSubmit} disabled={submitting || !normalizedCode}>
              {submitting ? "Opening..." : "Continue"}
            </Button>
            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={submitting}
            >
              Back
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
