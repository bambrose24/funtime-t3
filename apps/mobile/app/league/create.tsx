import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/components/ui/select-option";
import { clientApi } from "@/lib/trpc/react";
import { DEFAULT_SEASON } from "@/constants";
import { useColorScheme } from "@/lib/useColorScheme";

const LATE_POLICY_LABELS = {
  allow_late_and_lock_after_start: "Allow Late Picks",
  close_at_first_game_start: "Close at First Kickoff",
} as const;

export default function CreateLeagueScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [name, setName] = useState("");
  const [priorLeagueId, setPriorLeagueId] = useState<string>("none");
  const [priorLeaguePickerOpen, setPriorLeaguePickerOpen] = useState(false);
  const [latePolicy, setLatePolicy] = useState<
    "allow_late_and_lock_after_start" | "close_at_first_game_start"
  >("allow_late_and_lock_after_start");
  const [reminderPolicy, setReminderPolicy] = useState<
    "three_hours_before" | "none"
  >("three_hours_before");
  const [superbowlCompetition, setSuperbowlCompetition] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const utils = clientApi.useUtils();
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: canCreate, isLoading: canCreateLoading } =
    clientApi.league.canCreate.useQuery(undefined, {
      enabled: !!session?.dbUser,
    });
  const { data: createForm, isLoading: createFormLoading } =
    clientApi.league.createForm.useQuery(undefined, {
      enabled: !!session?.dbUser && canCreate === true,
    });
  const { data: navData, isLoading: navLoading } = clientApi.home.nav.useQuery(
    undefined,
    {
      enabled: !!session?.dbUser && canCreate === true,
    },
  );

  const { mutateAsync: createLeague } = clientApi.league.create.useMutation();

  const priorLeagues = useMemo(() => {
    return (navData?.leagues ?? []).filter((l) => l.season < DEFAULT_SEASON);
  }, [navData]);
  const selectedPriorLeague = useMemo(
    () =>
      priorLeagueId === "none"
        ? null
        : priorLeagues.find((league) => league.league_id.toString() === priorLeagueId) ??
          null,
    [priorLeagueId, priorLeagues],
  );
  const trimmedName = name.trim();
  const nameError =
    trimmedName.length > 0 && trimmedName.length < 5
      ? "League name must be at least 5 characters."
      : null;
  const canSubmit = trimmedName.length >= 5 && !submitting;
  const createButtonText =
    submitting ? "Creating..." : canSubmit ? "Create League" : "Name must be 5+ chars";

  const onSubmit = async () => {
    if (trimmedName.length < 5) {
      Alert.alert(
        "Invalid League Name",
        "League name must be at least 5 characters.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const createdLeague = await createLeague({
        name: trimmedName,
        latePolicy,
        pickPolicy: "choose_winner",
        scoringType: "game_winner",
        superbowlCompetition,
        ...(priorLeagueId === "none"
          ? {}
          : { priorLeagueId: Number(priorLeagueId) }),
        ...(reminderPolicy === "none" ? {} : { reminderPolicy }),
      });
      await utils.invalidate();
      router.replace(`/league/${createdLeague.league_id}` as any);
    } catch (error) {
      console.error("Failed to create league", error);
      Alert.alert("Create Failed", "Unable to create league. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const loading =
    sessionLoading || canCreateLoading || createFormLoading || navLoading;

  if (loading) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading create form...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session?.dbUser) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-4 text-center text-2xl font-bold">
            Sign In Required
          </Text>
          <Button onPress={() => router.replace("/auth")}>Go to Login</Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!canCreate) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            League Creation Unavailable
          </Text>
          <Text className="text-center text-base text-gray-600 dark:text-gray-400">
            League creation is not currently available for your account.
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
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        <View className="mx-auto w-full max-w-2xl gap-6">
          <View className="flex-row items-start gap-3">
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
            <View className="flex-1 gap-2">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
                Create League
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Configure your league and invite friends to play.
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              League Name
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="My Funtime League"
            />
            {nameError ? <Text className="text-xs text-red-500">{nameError}</Text> : null}
          </View>

          <View className="gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Prior League
            </Text>
            <Pressable
              onPress={() => setPriorLeaguePickerOpen((open) => !open)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Selected
              </Text>
              <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-sm font-semibold">
                {selectedPriorLeague
                  ? `${selectedPriorLeague.name} (${selectedPriorLeague.season})`
                  : "None"}
              </Text>
              <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {priorLeaguePickerOpen ? "Hide prior leagues" : "Choose prior league"}
              </Text>
            </Pressable>
            {priorLeaguePickerOpen ? (
              <View
                className="gap-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                style={{ maxHeight: 220 }}
              >
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  <SelectOption
                    selected={priorLeagueId === "none"}
                    onPress={() => {
                      setPriorLeagueId("none");
                      setPriorLeaguePickerOpen(false);
                    }}
                    className="justify-start px-4 py-3"
                  >
                    <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                      None
                    </Text>
                  </SelectOption>
                  {priorLeagues.map((league) => (
                    <SelectOption
                      key={league.league_id}
                      selected={priorLeagueId === league.league_id.toString()}
                      onPress={() => {
                        setPriorLeagueId(league.league_id.toString());
                        setPriorLeaguePickerOpen(false);
                      }}
                      className="justify-start px-4 py-3"
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                        {league.name} ({league.season})
                      </Text>
                    </SelectOption>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Reuse a prior league to simplify member re-invites.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Late Policy
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Controls whether members can still pick games that have not started after
              missing early kickoff.
            </Text>
            {(createForm?.latePolicy ?? [
              "allow_late_and_lock_after_start",
              "close_at_first_game_start",
            ]).map((policy) => {
              const typedPolicy = policy as keyof typeof LATE_POLICY_LABELS;
              return (
                <SelectOption
                  key={policy}
                  selected={latePolicy === typedPolicy}
                  onPress={() => setLatePolicy(typedPolicy)}
                  className="justify-start px-4 py-3"
                >
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                    {LATE_POLICY_LABELS[typedPolicy]}
                  </Text>
                </SelectOption>
              );
            })}
          </View>

          <View className="gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Reminder Policy
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Reminders notify members without picks roughly three hours before kickoff.
            </Text>
            <SelectOption
              selected={reminderPolicy === "three_hours_before"}
              onPress={() => setReminderPolicy("three_hours_before")}
              className="justify-start px-4 py-3"
            >
              <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                Send reminders 3 hours before games
              </Text>
            </SelectOption>
            <SelectOption
              selected={reminderPolicy === "none"}
              onPress={() => setReminderPolicy("none")}
              className="justify-start px-4 py-3"
            >
              <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                No reminders
              </Text>
            </SelectOption>
          </View>

          <View className="gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Super Bowl Competition
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Adds a season-end winner/loser/score competition after regular weekly picks.
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SelectOption
                  selected={superbowlCompetition}
                  onPress={() => setSuperbowlCompetition(true)}
                  className="px-4 py-3"
                >
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                    Enabled
                  </Text>
                </SelectOption>
              </View>
              <View className="flex-1">
                <SelectOption
                  selected={!superbowlCompetition}
                  onPress={() => setSuperbowlCompetition(false)}
                  className="px-4 py-3"
                >
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                    Disabled
                  </Text>
                </SelectOption>
              </View>
            </View>
          </View>

          <View className="gap-3 pt-2">
            <Button onPress={onSubmit} disabled={!canSubmit}>
              {createButtonText}
            </Button>
            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
