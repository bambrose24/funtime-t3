import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";

type RenewalInvitees = {
  eligibleMembers: {
    membershipId: number;
    username: string;
    email: string;
    role: string;
    missedPickCount?: number;
  }[];
  defaultSelectedMemberIds: number[];
  missingEmailCount: number;
};

type Props = {
  invitees: RenewalInvitees;
  visible: boolean;
  isCreating: boolean;
  onClose: () => void;
  onConfirm: (memberIds: number[]) => void;
};

export function RenewalInviteReviewModal({
  invitees,
  visible,
  isCreating,
  onClose,
  onConfirm,
}: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    () => new Set(invitees.defaultSelectedMemberIds),
  );

  useEffect(() => {
    if (visible) {
      setSelectedMemberIds(new Set(invitees.defaultSelectedMemberIds));
    }
  }, [invitees.defaultSelectedMemberIds, visible]);

  const selectedMemberIdList = useMemo(
    () => Array.from(selectedMemberIds),
    [selectedMemberIds],
  );
  const selectedCount = selectedMemberIdList.length;
  const allSelected =
    invitees.eligibleMembers.length > 0 &&
    selectedCount === invitees.eligibleMembers.length;

  const toggleMember = (membershipId: number) => {
    setSelectedMemberIds((current) => {
      const next = new Set(current);
      if (next.has(membershipId)) {
        next.delete(membershipId);
      } else {
        next.add(membershipId);
      }
      return next;
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/55">
        <Pressable
          className="flex-1"
          accessibilityLabel="Close invite review"
          onPress={onClose}
          disabled={isCreating}
        />
        <SafeAreaView className="max-h-[92%] rounded-t-3xl bg-white dark:bg-zinc-950">
          <View className="flex-row items-start justify-between gap-4 border-b border-gray-200 px-5 pb-4 pt-5 dark:border-zinc-800">
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-xl font-bold">
                Review next-season invites
              </Text>
              <Text className="text-sm leading-5 text-gray-600 dark:text-gray-400">
                Choose who should receive an invitation after the league is
                created. You will be added as an admin automatically.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close invite review"
              className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
              onPress={onClose}
              disabled={isCreating}
            >
              <Ionicons
                name="close"
                size={22}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-zinc-800">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="people-outline"
                size={18}
                color={isDarkColorScheme ? "#86efac" : "#15803d"}
              />
              <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                {selectedCount} of {invitees.eligibleMembers.length} players
                selected
              </Text>
            </View>
            <Button
              variant="outline"
              size="sm"
              accessibilityLabel={
                allSelected ? "Clear selection" : "Select all"
              }
              onPress={() =>
                setSelectedMemberIds(
                  allSelected
                    ? new Set()
                    : new Set(
                        invitees.eligibleMembers.map(
                          (member) => member.membershipId,
                        ),
                      ),
                )
              }
            >
              {allSelected ? "Clear Selection" : "Select All"}
            </Button>
          </View>

          <ScrollView
            className="min-h-0"
            contentContainerStyle={{ padding: 20, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {invitees.eligibleMembers.length > 0 ? (
              <View className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800">
                {invitees.eligibleMembers.map((member, index) => {
                  const selected = selectedMemberIds.has(member.membershipId);
                  const isAdmin = member.role === "admin";
                  const missedPickCount = member.missedPickCount ?? 0;
                  return (
                    <Pressable
                      key={member.membershipId}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`Invite ${member.username}`}
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggleMember(member.membershipId)}
                      className={`min-h-20 flex-row items-center gap-3 px-4 py-3 ${
                        index < invitees.eligibleMembers.length - 1
                          ? "border-b border-gray-200 dark:border-zinc-800"
                          : ""
                      }`}
                    >
                      <Ionicons
                        name={selected ? "checkbox" : "square-outline"}
                        size={24}
                        color={selected ? "#16a34a" : "#9ca3af"}
                      />
                      <View className="min-w-0 flex-1 gap-1">
                        <View className="flex-row flex-wrap items-center gap-2">
                          <Text
                            className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold"
                            numberOfLines={1}
                          >
                            {member.username}
                          </Text>
                          {isAdmin ? (
                            <View className="flex-row items-center gap-1 rounded-full bg-green-100 px-2 py-1 dark:bg-green-950">
                              <Ionicons
                                name="shield-checkmark-outline"
                                size={12}
                                color={
                                  isDarkColorScheme ? "#86efac" : "#15803d"
                                }
                              />
                              <Text className="text-[10px] font-bold uppercase text-green-700 dark:text-green-300">
                                Admin
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text
                          className="text-xs text-gray-500 dark:text-gray-400"
                          numberOfLines={1}
                        >
                          {member.email}
                        </Text>
                        <View className="mt-1 flex-row flex-wrap items-center gap-2">
                          {missedPickCount > 0 ? (
                            <View className="flex-row items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-1 dark:border-amber-800 dark:bg-amber-950">
                              <Ionicons
                                name="warning-outline"
                                size={12}
                                color={
                                  isDarkColorScheme ? "#fcd34d" : "#b45309"
                                }
                              />
                              <Text className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                                Missed {missedPickCount}{" "}
                                {missedPickCount === 1 ? "pick" : "picks"}
                              </Text>
                            </View>
                          ) : (
                            <Text className="text-xs font-medium text-green-700 dark:text-green-300">
                              Picked every game
                            </Text>
                          )}
                          <Text className="text-xs text-gray-500 dark:text-gray-400">
                            Last season
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
                  There are no players to invite by email.
                </Text>
              </View>
            )}

            {invitees.eligibleMembers.some(
              (member) => member.role === "admin",
            ) ? (
              <View className="flex-row items-start gap-2 rounded-xl bg-green-50 p-3 dark:bg-green-950">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={isDarkColorScheme ? "#86efac" : "#15803d"}
                />
                <Text className="flex-1 text-xs leading-5 text-green-800 dark:text-green-200">
                  Players marked Admin will be admins in the new league when
                  they join.
                </Text>
              </View>
            ) : null}

            {invitees.missingEmailCount > 0 ? (
              <View className="flex-row items-start gap-2">
                <Ionicons
                  name="mail-outline"
                  size={17}
                  color={isDarkColorScheme ? "#9ca3af" : "#6b7280"}
                />
                <Text className="flex-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                  {invitees.missingEmailCount} prior{" "}
                  {invitees.missingEmailCount === 1
                    ? "player does"
                    : "players do"}{" "}
                  not have an email address and cannot be invited here.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View className="gap-2 border-t border-gray-200 px-5 py-4 dark:border-zinc-800">
            <Button
              accessibilityLabel={`Create league and send ${selectedCount} ${
                selectedCount === 1 ? "invite" : "invites"
              }`}
              disabled={isCreating}
              onPress={() => onConfirm(selectedMemberIdList)}
            >
              {isCreating
                ? "Creating..."
                : `Create League & Send ${selectedCount} ${
                    selectedCount === 1 ? "Invite" : "Invites"
                  }`}
            </Button>
            <Button variant="outline" disabled={isCreating} onPress={onClose}>
              Back to Setup
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
