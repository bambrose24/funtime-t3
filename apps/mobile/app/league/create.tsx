import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/components/ui/select-option";
import { clientApi } from "@/lib/trpc/react";
import { DEFAULT_SEASON } from "@/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  buildPrefillFromPriorLeague,
  getCreateLeagueNameError,
  getSuggestedRenewalLeagueName,
  MOBILE_LATE_POLICY_LABELS,
  type MobileLatePolicy,
  type MobileReminderPolicy,
} from "@/lib/league/createLeagueForm";

export default function CreateLeagueScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { priorLeagueId: routePriorLeagueIdParam } = useLocalSearchParams<{
    priorLeagueId?: string;
  }>();
  const hasAppliedRoutePrefillRef = useRef(false);
  const [name, setName] = useState("");
  const [priorLeagueId, setPriorLeagueId] = useState<string>("none");
  const [priorLeaguePickerOpen, setPriorLeaguePickerOpen] = useState(false);
  const [latePolicy, setLatePolicy] = useState<MobileLatePolicy>(
    "allow_late_and_lock_after_start",
  );
  const [reminderPolicy, setReminderPolicy] =
    useState<MobileReminderPolicy>("three_hours_before");
  const [superbowlCompetition, setSuperbowlCompetition] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const utils = clientApi.useUtils();
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: canCreate, isLoading: canCreateLoading } =
    clientApi.league.canCreate.useQuery(undefined, {
      enabled: !!session?.dbUser,
    });
  const { data: renewalStatus, isLoading: renewalStatusLoading } =
    clientApi.league.renewalStatus.useQuery(undefined, {
      enabled: !!session?.dbUser,
    });
  const canRenewLeagues = renewalStatus?.isOpen === true;
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
  const parsedRoutePriorLeagueId = useMemo(() => {
    if (typeof routePriorLeagueIdParam !== "string") {
      return null;
    }
    const parsed = Number(routePriorLeagueIdParam);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [routePriorLeagueIdParam]);
  const { data: renewalPreview, isLoading: renewalPreviewLoading } =
    clientApi.league.renewalPreview.useQuery(
      { priorLeagueId: parsedRoutePriorLeagueId ?? 0 },
      {
        enabled:
          !!session?.dbUser &&
          canCreate === true &&
          canRenewLeagues &&
          parsedRoutePriorLeagueId !== null,
      },
    );
  const priorLeagues = useMemo(() => {
    if (!canRenewLeagues) {
      return [];
    }
    return (navData?.leagues ?? []).filter(
      (league) =>
        league.season < DEFAULT_SEASON && league.status === "completed",
    );
  }, [canRenewLeagues, navData]);
  const applyPriorLeagueTemplate = useCallback(
    (
      league: (typeof priorLeagues)[number],
      options: { suggestName?: boolean } = {},
    ) => {
      const prefill = buildPrefillFromPriorLeague(league);
      setPriorLeagueId(prefill.priorLeagueId);
      setLatePolicy(prefill.latePolicy);
      setReminderPolicy(prefill.reminderPolicy);
      setSuperbowlCompetition(prefill.superbowlCompetition);
      if (options.suggestName) {
        setName((currentName) =>
          currentName.trim().length > 0
            ? currentName
            : getSuggestedRenewalLeagueName(league.name, DEFAULT_SEASON),
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (hasAppliedRoutePrefillRef.current) {
      return;
    }
    if (parsedRoutePriorLeagueId === null) {
      return;
    }
    if (renewalPreview?.priorLeague.league_id === parsedRoutePriorLeagueId) {
      const prefill = buildPrefillFromPriorLeague(renewalPreview.priorLeague);
      setPriorLeagueId(prefill.priorLeagueId);
      setLatePolicy(prefill.latePolicy);
      setReminderPolicy(prefill.reminderPolicy);
      setSuperbowlCompetition(prefill.superbowlCompetition);
      setName((currentName) =>
        currentName.trim().length > 0
          ? currentName
          : renewalPreview.suggestedName,
      );
      hasAppliedRoutePrefillRef.current = true;
      return;
    }
    if (priorLeagues.length === 0) {
      return;
    }
    const matchedLeague = priorLeagues.find(
      (league) => league.league_id === parsedRoutePriorLeagueId,
    );
    if (!matchedLeague) {
      hasAppliedRoutePrefillRef.current = true;
      return;
    }
    applyPriorLeagueTemplate(matchedLeague, { suggestName: true });
    hasAppliedRoutePrefillRef.current = true;
  }, [
    applyPriorLeagueTemplate,
    parsedRoutePriorLeagueId,
    priorLeagues,
    renewalPreview,
  ]);

  const selectedPriorLeague = useMemo(() => {
    if (priorLeagueId === "none") {
      return null;
    }
    return (
      priorLeagues.find(
        (league) => league.league_id.toString() === priorLeagueId,
      ) ??
      (renewalPreview?.priorLeague.league_id.toString() === priorLeagueId
        ? renewalPreview.priorLeague
        : null)
    );
  }, [priorLeagueId, priorLeagues, renewalPreview]);
  const availableLatePolicies = useMemo(() => {
    const basePolicies = (createForm?.latePolicy ?? [
      "allow_late_and_lock_after_start",
      "close_at_first_game_start",
    ]) as MobileLatePolicy[];
    return Array.from(new Set([...basePolicies, latePolicy])).filter(
      (policy): policy is MobileLatePolicy =>
        policy in MOBILE_LATE_POLICY_LABELS,
    );
  }, [createForm?.latePolicy, latePolicy]);
  const trimmedName = name.trim();
  const nameError = getCreateLeagueNameError(name);
  const isRenewalMode =
    parsedRoutePriorLeagueId !== null && priorLeagueId !== "none";
  const canSubmit = trimmedName.length > 0 && nameError === null && !submitting;
  const createButtonText = submitting
    ? "Creating..."
    : canSubmit
      ? isRenewalMode
        ? "Create & Invite"
        : "Create League"
      : "Name must be 5-100 chars";

  const onSubmit = async () => {
    if (nameError) {
      Alert.alert("Invalid League Name", nameError);
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
      if (priorLeagueId !== "none") {
        router.replace(
          `/league/${createdLeague.league_id}/renewal-invites` as any,
        );
        return;
      }
      router.replace(`/league/${createdLeague.league_id}` as any);
    } catch (error) {
      console.error("Failed to create league", error);
      Alert.alert(
        "Create Failed",
        "Unable to create league. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loading =
    sessionLoading ||
    canCreateLoading ||
    renewalStatusLoading ||
    createFormLoading ||
    navLoading ||
    renewalPreviewLoading;

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
          <Button
            onPress={() =>
              router.replace(
                `/auth?redirectTo=${encodeURIComponent("/league/create")}` as any,
              )
            }
          >
            Go to Login
          </Button>
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

  if (parsedRoutePriorLeagueId !== null && !canRenewLeagues) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            League Renewal Is Not Open
          </Text>
          <Text className="text-center text-base text-gray-600 dark:text-gray-400">
            Renewals open closer to the next season. You can still create a new
            league without copying a prior one.
          </Text>
          <Button className="mt-5" onPress={() => router.replace("/" as any)}>
            Back to My Leagues
          </Button>
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
              className="bg-app-card-light dark:bg-app-card-dark mt-1 rounded-lg p-2"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
            <View className="flex-1 gap-2">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
                {isRenewalMode
                  ? `Set Up the ${DEFAULT_SEASON} Season`
                  : "Create League"}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                {isRenewalMode
                  ? "Renew your prior league and invite last year's players."
                  : "Configure your league and invite friends to play."}
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
            {nameError ? (
              <Text className="text-xs text-red-500">{nameError}</Text>
            ) : null}
          </View>

          <View className="gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Prior League
            </Text>
            {isRenewalMode && selectedPriorLeague ? (
              <View className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950">
                <Text className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Renewal Source
                </Text>
                <Text className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {selectedPriorLeague.name} ({selectedPriorLeague.season})
                </Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <View className="rounded-full border border-blue-200 bg-white px-2.5 py-1 dark:border-blue-800 dark:bg-blue-900">
                    <Text className="text-[10px] font-semibold uppercase text-blue-700 dark:text-blue-200">
                      {renewalPreview?.memberCount ?? 0} players
                    </Text>
                  </View>
                  <View className="rounded-full border border-blue-200 bg-white px-2.5 py-1 dark:border-blue-800 dark:bg-blue-900">
                    <Text className="text-[10px] font-semibold uppercase text-blue-700 dark:text-blue-200">
                      {renewalPreview?.adminCount ?? 0} admins
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <>
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
                    {priorLeaguePickerOpen
                      ? "Hide prior leagues"
                      : "Choose prior league"}
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
                          selected={
                            priorLeagueId === league.league_id.toString()
                          }
                          onPress={() => {
                            applyPriorLeagueTemplate(league);
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
              </>
            )}
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {canRenewLeagues
                ? "Reuse a completed prior league to simplify member re-invites."
                : "League renewals open closer to the next season."}
            </Text>
          </View>

          {selectedPriorLeague ? (
            <View className="gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <Text className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Using {selectedPriorLeague.name} as a template
              </Text>
              <Text className="text-xs text-blue-700 dark:text-blue-300">
                Late policy, reminder policy, and Super Bowl settings were
                prefilled. You can still edit any of them below.
              </Text>
            </View>
          ) : null}

          <View className="gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Late Policy
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Controls whether members can still pick games that have not
              started after missing early kickoff.
            </Text>
            {availableLatePolicies.map((policy) => {
              return (
                <SelectOption
                  key={policy}
                  selected={latePolicy === policy}
                  onPress={() => setLatePolicy(policy)}
                  className="justify-start px-4 py-3"
                >
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                    {MOBILE_LATE_POLICY_LABELS[policy]}
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
              Reminders notify members without picks roughly three hours before
              kickoff.
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
              Adds a season-end winner/loser/score competition after regular
              weekly picks.
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
