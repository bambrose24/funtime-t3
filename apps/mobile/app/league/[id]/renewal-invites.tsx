import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/trpc/react";
import { useColorScheme } from "@/lib/useColorScheme";
import { getBaseUrl } from "@/utils/getBaseUrl";

export default function RenewalInvitesScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const { isDarkColorScheme } = useColorScheme();
  const utils = clientApi.useUtils();
  const leagueId = Number(id);
  const validParams = Number.isInteger(leagueId) && leagueId > 0;
  const { data: renewalStatus, isLoading: renewalStatusLoading } =
    clientApi.league.renewalStatus.useQuery(undefined, {
      enabled: validParams,
    });
  const {
    data: preview,
    isLoading,
    refetch,
  } = clientApi.league.admin.renewalInvitePreview.useQuery(
    { leagueId },
    { enabled: validParams && renewalStatus?.isOpen === true },
  );
  const { mutateAsync: sendRenewalInvites } =
    clientApi.league.admin.sendRenewalInvites.useMutation();
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [sendResult, setSendResult] = useState<{
    failedCount: number;
    initiatorCopyFailed: boolean;
    initiatorCopySent: boolean;
    sentCount: number;
    skippedCount: number;
  } | null>(null);

  useEffect(() => {
    if (preview) {
      setSelectedMemberIds(new Set(preview.defaultSelectedMemberIds));
    }
  }, [preview]);

  const selectedMemberIdList = useMemo(
    () => Array.from(selectedMemberIds),
    [selectedMemberIds],
  );
  const allSelected =
    Boolean(preview?.eligibleMembers.length) &&
    selectedMemberIds.size === preview?.eligibleMembers.length;
  const joinLink = preview?.nextLeague.share_code
    ? `${getBaseUrl()}/join-league/${preview.nextLeague.share_code}`
    : "";

  const toggleMember = (memberId: number) => {
    setSelectedMemberIds((current) => {
      const next = new Set(current);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const onSendInvites = async () => {
    if (!preview) {
      return;
    }
    try {
      setSubmitting(true);
      const result = await sendRenewalInvites({
        leagueId,
        memberIds: selectedMemberIdList,
      });
      setSendResult(result);
      await utils.invalidate();
      await refetch();
      Alert.alert(
        result.initiatorCopyFailed
          ? "Invites Sent, Copy Failed"
          : "Invites Sent",
        `Sent ${result.sentCount} renewal invites.${result.initiatorCopySent ? " A confirmation copy was sent to you." : ""}${result.initiatorCopyFailed ? " Your confirmation copy could not be delivered." : ""}`,
      );
    } catch (error) {
      Alert.alert(
        "Invite Failed",
        error instanceof Error ? error.message : "Unable to send invites.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!validParams) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-gray-500 dark:text-gray-400">
            Renewal invite details are missing.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!renewalStatusLoading && renewalStatus?.isOpen === false) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-gray-500 dark:text-gray-400">
            League renewals are not open yet.
          </Text>
          <Button className="mt-5" onPress={() => router.replace("/" as any)}>
            Back to My Leagues
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (renewalStatusLoading || isLoading || !preview) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading renewal invites...
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
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="gap-4">
          <View className="flex-row items-start gap-3 px-1">
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
            <View className="flex-1 gap-1">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                Invite last year's players
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {preview.priorLeague.name} is renewed as{" "}
                {preview.nextLeague.name}.
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Join Link
            </Text>
            <Text
              className="text-xs text-gray-500 dark:text-gray-400"
              numberOfLines={1}
            >
              {joinLink || "Join link unavailable"}
            </Text>
            {joinLink ? (
              <Button
                variant="outline"
                size="sm"
                onPress={async () => {
                  await Share.share({
                    title: "League Invite",
                    message: `Join ${preview.nextLeague.name} on Funtime: ${joinLink}`,
                    url: joinLink,
                  });
                }}
              >
                Share Join Link
              </Button>
            ) : null}
          </View>

          <View className="gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <View className="flex-row items-center justify-between">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                Players
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {selectedMemberIds.size}/{preview.eligibleMembers.length}{" "}
                selected
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950">
                <Text className="text-[10px] font-semibold uppercase text-blue-700 dark:text-blue-300">
                  {preview.alreadyJoinedCount} joined
                </Text>
              </View>
              <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-[10px] font-semibold uppercase text-gray-700 dark:text-gray-200">
                  {preview.missingEmailCount} no email
                </Text>
              </View>
            </View>

            {preview.eligibleMembers.length > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() =>
                    setSelectedMemberIds(
                      allSelected
                        ? new Set()
                        : new Set(
                            preview.eligibleMembers.map(
                              (member) => member.membershipId,
                            ),
                          ),
                    )
                  }
                >
                  {allSelected ? "Clear Selection" : "Select All"}
                </Button>
                <View className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
                  {preview.eligibleMembers.map((member) => {
                    const selected = selectedMemberIds.has(member.membershipId);
                    return (
                      <Pressable
                        key={member.membershipId}
                        onPress={() => toggleMember(member.membershipId)}
                        className="flex-row items-center gap-3 border-b border-gray-200 px-3 py-3 last:border-b-0 dark:border-zinc-700"
                      >
                        <Ionicons
                          name={selected ? "checkbox" : "square-outline"}
                          size={22}
                          color={selected ? "#2563eb" : "#9ca3af"}
                        />
                        <View className="min-w-0 flex-1">
                          <Text
                            className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold"
                            numberOfLines={1}
                          >
                            {member.username}
                          </Text>
                          <Text
                            className="text-xs text-gray-500 dark:text-gray-400"
                            numberOfLines={1}
                          >
                            {member.email}
                          </Text>
                        </View>
                        <Text className="text-xs uppercase text-gray-500 dark:text-gray-400">
                          {member.role}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
                No prior members need an invite right now.
              </Text>
            )}
          </View>

          {sendResult ? (
            <View className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <Text className="text-center text-sm text-blue-800 dark:text-blue-200">
                Sent {sendResult.sentCount}, skipped {sendResult.skippedCount}
                {sendResult.failedCount > 0
                  ? `, failed ${sendResult.failedCount}`
                  : ""}
                .
                {sendResult.initiatorCopySent ? " A copy was sent to you." : ""}
              </Text>
            </View>
          ) : null}

          <View className="gap-3">
            <Button
              disabled={submitting || selectedMemberIds.size === 0}
              onPress={onSendInvites}
            >
              {submitting ? "Sending..." : "Send Invites"}
            </Button>
            <Button
              variant="outline"
              disabled={submitting}
              onPress={() => router.replace(`/league/${leagueId}` as any)}
            >
              Skip for Now
            </Button>
            <Button
              variant="secondary"
              disabled={submitting}
              onPress={() => router.replace(`/league/${leagueId}` as any)}
            >
              Open League
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
