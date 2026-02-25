import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/trpc/react";
import { Input } from "@/components/ui/input";

export default function LeagueAdminScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const leagueIdNumber = Number(id);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [leagueNameDraft, setLeagueNameDraft] = useState("");
  const [broadcastDraft, setBroadcastDraft] = useState("");

  const utils = clientApi.useUtils();
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: isSuperAdmin, isLoading: superAdminLoading } =
    clientApi.generalAdmin.isSuperAdmin.useQuery();

  const viewerMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);

  const isLeagueAdmin = viewerMember?.role === "admin";
  const canManageLeague = isLeagueAdmin || Boolean(isSuperAdmin);

  const { data: membersData, isLoading: membersLoading } =
    clientApi.league.admin.members.useQuery(
      { leagueId: leagueIdNumber },
      {
        enabled: Number.isFinite(leagueIdNumber) && canManageLeague,
      },
    );
  const { data: leagueData } = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
  );
  const {
    data: canSendBroadcastData,
    refetch: refetchBroadcastStatus,
  } = clientApi.league.admin.canSendLeagueBroadcast.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
  );

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

  const invalidateMembers = async () => {
    await utils.league.admin.members.invalidate({ leagueId: leagueIdNumber });
  };

  const onToggleRole = async (memberId: number, currentRole: string | null) => {
    const nextRole = currentRole === "admin" ? "player" : "admin";
    const actionKey = `role-${memberId}`;
    try {
      setBusyKey(actionKey);
      await changeMemberRole({
        leagueId: leagueIdNumber,
        memberId,
        role: nextRole,
      });
      await invalidateMembers();
    } catch (error) {
      console.error("Failed to change role", error);
      Alert.alert("Update Failed", "Unable to update role.");
    } finally {
      setBusyKey(null);
    }
  };

  const onTogglePaid = async (memberId: number, currentPaid: boolean | null) => {
    const actionKey = `paid-${memberId}`;
    try {
      setBusyKey(actionKey);
      await setMembersPaid({
        leagueId: leagueIdNumber,
        memberIds: [memberId],
        paid: !Boolean(currentPaid),
      });
      await invalidateMembers();
    } catch (error) {
      console.error("Failed to update paid status", error);
      Alert.alert("Update Failed", "Unable to update paid status.");
    } finally {
      setBusyKey(null);
    }
  };

  const onRemoveMember = (memberId: number, username: string) => {
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
    if (trimmedName.length < 5) {
      Alert.alert("Invalid Name", "League name must be at least 5 characters.");
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

  const members = membersData?.members ?? [];

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="gap-4">
          <View className="gap-1 px-1">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              League Admin
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Manage league settings, broadcasts, and members.
            </Text>
          </View>

          <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              League Name
            </Text>
            <Input value={leagueNameDraft} onChangeText={setLeagueNameDraft} />
            <Button
              variant="outline"
              size="sm"
              disabled={busyKey === "change-name"}
              onPress={onChangeLeagueName}
            >
              Update League Name
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
              placeholder="Write your league message..."
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              textAlignVertical="top"
            />
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
          </View>

          {members.map((member) => {
            const isViewer = member.membership_id === viewerMember?.membership_id;
            const roleActionKey = `role-${member.membership_id}`;
            const paidActionKey = `paid-${member.membership_id}`;
            const removeActionKey = `remove-${member.membership_id}`;

            return (
              <View
                key={member.membership_id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3"
              >
                <View className="gap-1">
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                    @{member.people.username}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {member.people.email}
                  </Text>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Role: {member.role}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Paid: {member.paid ? "Yes" : "No"}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Correct Picks: {member.correctPicks}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Missed Picks: {member.misssedPicks}
                  </Text>
                </View>

                <View className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      router.push(
                        `/league/${leagueIdNumber}/admin-picks?memberId=${member.membership_id}` as any,
                      )
                    }
                  >
                    Edit Picks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      router.push(
                        `/league/${leagueIdNumber}/admin-emails?memberId=${member.membership_id}` as any,
                      )
                    }
                  >
                    View Email Logs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyKey === roleActionKey || isViewer}
                    onPress={() =>
                      onToggleRole(member.membership_id, member.role ?? "player")
                    }
                  >
                    {member.role === "admin" ? "Set as Player" : "Set as Admin"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyKey === paidActionKey}
                    onPress={() =>
                      onTogglePaid(member.membership_id, member.paid ?? false)
                    }
                  >
                    {member.paid ? "Mark Unpaid" : "Mark Paid"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busyKey === removeActionKey || isViewer}
                    onPress={() =>
                      onRemoveMember(member.membership_id, member.people.username)
                    }
                  >
                    Remove Member
                  </Button>
                </View>
              </View>
            );
          })}

          <Button variant="outline" onPress={() => router.back()}>
            Back to League
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
