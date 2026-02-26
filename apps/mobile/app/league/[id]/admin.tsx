import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/trpc/react";
import { Input } from "@/components/ui/input";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";

type EditableRole = "admin" | "player";
const LEAGUE_NAME_MIN_LENGTH = 5;
const LEAGUE_NAME_MAX_LENGTH = 50;
const BROADCAST_SOFT_MAX_LENGTH = 1200;

export default function LeagueAdminScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const leagueIdNumber = Number(id);
  const { isDarkColorScheme } = useColorScheme();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [leagueNameDraft, setLeagueNameDraft] = useState("");
  const [broadcastDraft, setBroadcastDraft] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [sheetRoleDraft, setSheetRoleDraft] = useState<EditableRole>("player");
  const [sheetPaidDraft, setSheetPaidDraft] = useState(false);

  const utils = clientApi.useUtils();
  const { data: session, isLoading: sessionLoading, refetch: refetchSession } =
    clientApi.session.current.useQuery();
  const {
    data: isSuperAdmin,
    isLoading: superAdminLoading,
    refetch: refetchSuperAdmin,
  } = clientApi.generalAdmin.isSuperAdmin.useQuery();

  const viewerMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);

  const isLeagueAdmin = viewerMember?.role === "admin";
  const canManageLeague = isLeagueAdmin || Boolean(isSuperAdmin);

  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = clientApi.league.admin.members.useQuery(
    { leagueId: leagueIdNumber },
    {
      enabled: Number.isFinite(leagueIdNumber) && canManageLeague,
    },
  );
  const { data: leagueData, refetch: refetchLeague } = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
  );
  const { data: canSendBroadcastData, refetch: refetchBroadcastStatus } =
    clientApi.league.admin.canSendLeagueBroadcast.useQuery(
      { leagueId: leagueIdNumber },
      { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
    );

  const members = membersData?.members ?? [];
  const adminCount = members.filter((member) => member.role === "admin").length;
  const paidCount = members.filter((member) => Boolean(member.paid)).length;
  const unpaidCount = Math.max(members.length - paidCount, 0);
  const trimmedLeagueName = leagueNameDraft.trim();
  const leagueNameCharsRemaining =
    LEAGUE_NAME_MAX_LENGTH - leagueNameDraft.length;
  const leagueNameChanged =
    trimmedLeagueName.length > 0 && trimmedLeagueName !== (leagueData?.name ?? "");
  const canSaveLeagueName =
    leagueNameChanged &&
    trimmedLeagueName.length >= LEAGUE_NAME_MIN_LENGTH &&
    trimmedLeagueName.length <= LEAGUE_NAME_MAX_LENGTH;
  const broadcastCharsRemaining =
    BROADCAST_SOFT_MAX_LENGTH - broadcastDraft.length;
  const refreshStatusLabel = isRefreshing
    ? "Refreshing..."
    : lastRefreshedAt
      ? `Updated ${formatDistanceToNow(lastRefreshedAt, { addSuffix: true })}`
      : "Pull to refresh admin data";

  const selectedMember = useMemo(() => {
    if (editingMemberId === null) {
      return null;
    }
    return (
      members.find((member) => member.membership_id === editingMemberId) ?? null
    );
  }, [editingMemberId, members]);

  const selectedMemberIsViewer =
    selectedMember?.membership_id === viewerMember?.membership_id;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    try {
      await refetchSession();
      await refetchSuperAdmin();
      if (Number.isFinite(leagueIdNumber) && canManageLeague) {
        await Promise.all([
          refetchMembers(),
          refetchLeague(),
          refetchBroadcastStatus(),
        ]);
      }
      setLastRefreshedAt(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [
    canManageLeague,
    leagueIdNumber,
    refetchBroadcastStatus,
    refetchLeague,
    refetchMembers,
    refetchSession,
    refetchSuperAdmin,
  ]);

  const { mutateAsync: changeMemberRole } =
    clientApi.league.admin.changeMemberRole.useMutation();
  const { mutateAsync: setMembersPaid } =
    clientApi.league.admin.setMembersPaid.useMutation();
  const { mutateAsync: removeMember } =
    clientApi.league.admin.removeMember.useMutation();
  const { mutateAsync: changeLeagueName } =
    clientApi.league.admin.changeName.useMutation();
  const { mutateAsync: sendBroadcast } =
    clientApi.league.admin.sendBroadcast.useMutation();

  useEffect(() => {
    if (leagueData?.name && !leagueNameDraft) {
      setLeagueNameDraft(leagueData.name);
    }
  }, [leagueData?.name, leagueNameDraft]);

  useEffect(() => {
    if (isMemberSheetOpen && !selectedMember) {
      setIsMemberSheetOpen(false);
      setEditingMemberId(null);
    }
  }, [isMemberSheetOpen, selectedMember]);

  useEffect(() => {
    if (
      canManageLeague &&
      !sessionLoading &&
      !superAdminLoading &&
      !membersLoading &&
      !lastRefreshedAt
    ) {
      setLastRefreshedAt(new Date());
    }
  }, [
    canManageLeague,
    lastRefreshedAt,
    membersLoading,
    sessionLoading,
    superAdminLoading,
  ]);

  const invalidateMembers = async () => {
    await utils.league.admin.members.invalidate({ leagueId: leagueIdNumber });
  };

  const openMemberSheet = (member: (typeof members)[number]) => {
    setEditingMemberId(member.membership_id);
    setSheetRoleDraft(member.role === "admin" ? "admin" : "player");
    setSheetPaidDraft(Boolean(member.paid));
    setIsMemberSheetOpen(true);
  };

  const closeMemberSheet = () => {
    setIsMemberSheetOpen(false);
    setEditingMemberId(null);
  };

  const pushMemberRouteFromSheet = (href: string) => {
    closeMemberSheet();
    requestAnimationFrame(() => {
      router.push(href as any);
    });
  };

  const onSaveMemberSettings = async () => {
    if (!selectedMember) {
      return;
    }

    const memberId = selectedMember.membership_id;
    const currentRole = selectedMember.role === "admin" ? "admin" : "player";
    const currentPaid = Boolean(selectedMember.paid);
    const roleChanged = !selectedMemberIsViewer && sheetRoleDraft !== currentRole;
    const paidChanged = sheetPaidDraft !== currentPaid;

    if (!roleChanged && !paidChanged) {
      closeMemberSheet();
      return;
    }

    const actionKey = `edit-${memberId}`;
    try {
      setBusyKey(actionKey);

      if (roleChanged) {
        await changeMemberRole({
          leagueId: leagueIdNumber,
          memberId,
          role: sheetRoleDraft,
        });
      }

      if (paidChanged) {
        await setMembersPaid({
          leagueId: leagueIdNumber,
          memberIds: [memberId],
          paid: sheetPaidDraft,
        });
      }

      await invalidateMembers();
      await refetchMembers();
      closeMemberSheet();
    } catch (error) {
      console.error("Failed to update member settings", error);
      Alert.alert("Update Failed", "Unable to save member settings.");
    } finally {
      setBusyKey(null);
    }
  };

  const onRemoveMember = (memberId: number, username: string, closeSheet = false) => {
    Alert.alert(
      "Remove Member",
      `Remove @${username} from this league?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const actionKey = `remove-${memberId}`;
            try {
              setBusyKey(actionKey);
              await removeMember({
                leagueId: leagueIdNumber,
                memberId,
              });
              await invalidateMembers();
              await refetchMembers();
              if (closeSheet) {
                closeMemberSheet();
              }
            } catch (error) {
              console.error("Failed to remove member", error);
              Alert.alert("Remove Failed", "Unable to remove member.");
            } finally {
              setBusyKey(null);
            }
          },
        },
      ],
    );
  };

  const onChangeLeagueName = async () => {
    const trimmedName = leagueNameDraft.trim();
    if (trimmedName.length < LEAGUE_NAME_MIN_LENGTH) {
      Alert.alert("Invalid Name", "League name must be at least 5 characters.");
      return;
    }
    if (!canSaveLeagueName) {
      return;
    }
    const actionKey = "change-name";
    try {
      setBusyKey(actionKey);
      await changeLeagueName({
        leagueId: leagueIdNumber,
        leagueName: trimmedName,
      });
      await utils.league.get.invalidate({ leagueId: leagueIdNumber });
      Alert.alert("Updated", "League name updated.");
    } catch (error) {
      console.error("Failed to update league name", error);
      Alert.alert("Update Failed", "Unable to update league name.");
    } finally {
      setBusyKey(null);
    }
  };

  const onSendBroadcast = async () => {
    const message = broadcastDraft.trim();
    if (!message) {
      Alert.alert("Missing Message", "Enter a broadcast message first.");
      return;
    }
    if (canSendBroadcastData && !canSendBroadcastData.canSend) {
      const retryAt = canSendBroadcastData.nextAvailableTime
        ? new Date(canSendBroadcastData.nextAvailableTime).toLocaleString()
        : "later";
      Alert.alert(
        "Broadcast Limit Reached",
        `This league has reached the weekly broadcast limit. Try again after ${retryAt}.`,
      );
      return;
    }

    const actionKey = "send-broadcast";
    try {
      setBusyKey(actionKey);
      await sendBroadcast({
        leagueId: leagueIdNumber,
        markdownString: message,
      });
      setBroadcastDraft("");
      await refetchBroadcastStatus();
      Alert.alert("Sent", "Broadcast message sent to league members.");
    } catch (error) {
      console.error("Failed to send broadcast", error);
      Alert.alert(
        "Broadcast Failed",
        error instanceof Error ? error.message : "Unable to send broadcast.",
      );
    } finally {
      setBusyKey(null);
    }
  };

  if (!id || Number.isNaN(leagueIdNumber)) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-gray-500 dark:text-gray-400">
            League not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionLoading || superAdminLoading || (canManageLeague && membersLoading)) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading admin panel...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canManageLeague) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-2xl font-bold">
            Admin Access Required
          </Text>
          <Text className="text-center text-base text-gray-600 dark:text-gray-400">
            You need league admin or super-admin permissions to manage members.
          </Text>
          <Button onPress={() => router.back()}>Back</Button>
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
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-4">
          <View className="flex-row items-start gap-3 px-1">
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
            <View className="flex-1 gap-1">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                League Admin
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Compact member management, broadcasts, and league settings.
              </Text>
            </View>
          </View>

          <View className="gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <View className="flex-row items-center justify-between">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                Admin Snapshot
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {refreshStatusLabel}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-blue-700 dark:text-blue-300">
                  Members: {members.length}
                </Text>
              </View>
              <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-700 dark:text-gray-200">
                  Admins: {adminCount}
                </Text>
              </View>
              <View className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 dark:border-emerald-800 dark:bg-emerald-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-emerald-700 dark:text-emerald-300">
                  Paid: {paidCount}
                </Text>
              </View>
              <View className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 dark:border-amber-800 dark:bg-amber-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-amber-700 dark:text-amber-300">
                  Unpaid: {unpaidCount}
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              League Name
            </Text>
            <Input value={leagueNameDraft} onChangeText={setLeagueNameDraft} />
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {canSaveLeagueName
                  ? "Name is valid and ready to save."
                  : `Use ${LEAGUE_NAME_MIN_LENGTH}-${LEAGUE_NAME_MAX_LENGTH} characters.`}
              </Text>
              <Text
                className={cn(
                  "text-xs",
                  leagueNameCharsRemaining < 0
                    ? "text-red-500"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                {leagueNameCharsRemaining}
              </Text>
            </View>
            <Button
              variant="outline"
              size="sm"
              disabled={busyKey === "change-name" || !canSaveLeagueName}
              onPress={onChangeLeagueName}
            >
              {leagueNameChanged ? "Update League Name" : "League Name Saved"}
            </Button>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              League Broadcast
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              {canSendBroadcastData?.canSend
                ? "You can send a league-wide broadcast."
                : `Weekly limit reached. ${
                    canSendBroadcastData?.nextAvailableTime
                      ? `Next available: ${new Date(canSendBroadcastData.nextAvailableTime).toLocaleString()}`
                      : "Try again later."
                  }`}
            </Text>
            <TextInput
              value={broadcastDraft}
              onChangeText={setBroadcastDraft}
              multiline
              numberOfLines={5}
              maxLength={BROADCAST_SOFT_MAX_LENGTH}
              placeholder="Write your league message..."
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              textAlignVertical="top"
            />
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Keep broadcasts concise and actionable for better engagement.
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {broadcastCharsRemaining}
              </Text>
            </View>
            <Button
              size="sm"
              disabled={busyKey === "send-broadcast" || !broadcastDraft.trim()}
              onPress={onSendBroadcast}
            >
              Send Broadcast
            </Button>
          </View>

          <View className="gap-1 px-1">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
              Members
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              Use Edit for role/paid actions and Email Logs for member history.
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 620 }}>
                <View className="flex-row items-center border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400" style={{ width: 240 }}>
                    Member
                  </Text>
                  <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400" style={{ width: 80 }}>
                    Role
                  </Text>
                  <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400" style={{ width: 70 }}>
                    Paid
                  </Text>
                  <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400" style={{ width: 120 }}>
                    Email Logs
                  </Text>
                  <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400" style={{ width: 100 }}>
                    Edit
                  </Text>
                </View>

                {members.length === 0 ? (
                  <View className="px-3 py-4">
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      No members found.
                    </Text>
                  </View>
                ) : (
                  members.map((member, index) => (
                    <View
                      key={member.membership_id}
                      className={cn(
                        "flex-row items-center px-3 py-3",
                        index < members.length - 1
                          ? "border-b border-gray-200 dark:border-zinc-700"
                          : "",
                      )}
                    >
                      <View style={{ width: 240 }} className="pr-2">
                        <Text
                          className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold"
                          numberOfLines={1}
                        >
                          @{member.people.username}
                        </Text>
                        <Text
                          className="text-xs text-gray-600 dark:text-gray-400"
                          numberOfLines={1}
                        >
                          {member.people.email}
                        </Text>
                      </View>

                      <Text
                        className="text-sm text-gray-700 dark:text-gray-300"
                        style={{ width: 80 }}
                      >
                        {member.role ?? "player"}
                      </Text>
                      <Text
                        className="text-sm text-gray-700 dark:text-gray-300"
                        style={{ width: 70 }}
                      >
                        {member.paid ? "Yes" : "No"}
                      </Text>

                      <View style={{ width: 120 }} className="pr-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() =>
                            router.push(
                              `/league/${leagueIdNumber}/admin-emails?memberId=${member.membership_id}` as any,
                            )
                          }
                        >
                          Emails
                        </Button>
                      </View>

                      <View style={{ width: 100 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => openMemberSheet(member)}
                        >
                          Edit
                        </Button>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isMemberSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={closeMemberSheet}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={closeMemberSheet} />
          <View className="rounded-t-2xl border border-gray-200 bg-white px-4 pb-8 pt-4 dark:border-zinc-700 dark:bg-zinc-900">
            {selectedMember ? (
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
                      Edit Member
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      @{selectedMember.people.username}
                    </Text>
                  </View>
                  <Button variant="outline" size="sm" onPress={closeMemberSheet}>
                    Close
                  </Button>
                </View>

                <View className="gap-2">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Role</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      disabled={selectedMemberIsViewer}
                      onPress={() => setSheetRoleDraft("player")}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2",
                        sheetRoleDraft === "player"
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                          : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
                      )}
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-sm font-medium">
                        Player
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={selectedMemberIsViewer}
                      onPress={() => setSheetRoleDraft("admin")}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2",
                        sheetRoleDraft === "admin"
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                          : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
                      )}
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-sm font-medium">
                        Admin
                      </Text>
                    </Pressable>
                  </View>
                  {selectedMemberIsViewer ? (
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      You cannot change your own role.
                    </Text>
                  ) : null}
                </View>

                <View className="gap-2">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Paid Status</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setSheetPaidDraft(true)}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2",
                        sheetPaidDraft
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                          : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
                      )}
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-sm font-medium">
                        Paid
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSheetPaidDraft(false)}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2",
                        !sheetPaidDraft
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                          : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
                      )}
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-sm font-medium">
                        Unpaid
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      pushMemberRouteFromSheet(
                        `/league/${leagueIdNumber}/admin-picks?memberId=${selectedMember.membership_id}`,
                      )
                    }
                  >
                    Edit Picks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      pushMemberRouteFromSheet(
                        `/league/${leagueIdNumber}/admin-emails?memberId=${selectedMember.membership_id}`,
                      )
                    }
                  >
                    View Email Logs
                  </Button>
                </View>

                <View className="gap-2">
                  <Button
                    disabled={busyKey === `edit-${selectedMember.membership_id}`}
                    onPress={onSaveMemberSettings}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={
                      selectedMemberIsViewer ||
                      busyKey === `remove-${selectedMember.membership_id}`
                    }
                    onPress={() =>
                      onRemoveMember(
                        selectedMember.membership_id,
                        selectedMember.people.username,
                        true,
                      )
                    }
                  >
                    Remove Member
                  </Button>
                </View>
              </View>
            ) : (
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Member not found.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
