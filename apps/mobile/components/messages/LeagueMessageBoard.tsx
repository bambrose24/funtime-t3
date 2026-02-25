import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApi } from "@/lib/trpc/react";
import { useColorScheme } from "@/lib/useColorScheme";

const MESSAGES_REFETCH_INTERVAL_MS = 10 * 1000;

type Props = {
  leagueId: string;
};

export function LeagueMessageBoard({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const { isDarkColorScheme } = useColorScheme();
  const utils = clientApi.useUtils();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const { data: session } = clientApi.session.current.useQuery();
  const { data: messages, isLoading } = clientApi.messages.leagueMessageBoard.useQuery(
    { leagueId: leagueIdNumber },
    {
      enabled: Number.isFinite(leagueIdNumber),
      refetchInterval: MESSAGES_REFETCH_INTERVAL_MS,
    },
  );

  const { mutateAsync: writeMessage } = clientApi.messages.writeMessage.useMutation();
  const { mutateAsync: deleteMessage } = clientApi.messages.deleteMessage.useMutation();

  const viewerLeagueMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find((member) => member.league_id === leagueIdNumber);
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages?.length]);

  const invalidateMessages = async () => {
    await utils.messages.leagueMessageBoard.invalidate({ leagueId: leagueIdNumber });
  };

  const onSend = async () => {
    const content = draft.trim();
    if (!content) {
      return;
    }

    try {
      setSending(true);
      await writeMessage({
        leagueId: leagueIdNumber,
        content,
      });
      setDraft("");
      await invalidateMessages();
    } catch (error) {
      console.error("Failed to send message", error);
      Alert.alert("Send Failed", "Unable to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const onDelete = (messageId: string, username: string, mine: boolean) => {
    Alert.alert(
      "Delete Message",
      mine
        ? "Delete this message?"
        : `Delete this message from ${username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage({ messageId });
              await invalidateMessages();
            } catch (error) {
              console.error("Failed to delete message", error);
              Alert.alert(
                "Delete Failed",
                "Unable to delete this message.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        >
          {isLoading ? (
            <View className="py-12">
              <Text className="text-center text-base text-gray-500 dark:text-gray-400">
                Loading messages...
              </Text>
            </View>
          ) : (messages?.length ?? 0) === 0 ? (
            <View className="py-12">
              <Text className="text-center text-base text-gray-500 dark:text-gray-400">
                No messages yet. Start the conversation.
              </Text>
            </View>
          ) : (
            messages?.map((message) => {
              const mine =
                viewerLeagueMember?.membership_id === message.member_id;
              const canDelete = mine || viewerLeagueMember?.role === "admin";
              const username = message.leaguemembers?.people.username ?? "Member";
              const createdAt = new Date(message.createdAt);
              return (
                <View key={message.message_id} className="gap-1">
                  <View
                    className={[
                      "rounded-xl border px-3 py-2",
                      mine
                        ? "ml-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                        : "mr-8 border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
                    ].join(" ")}
                  >
                    <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                      {message.content}
                    </Text>
                  </View>
                  <View
                    className={[
                      "flex-row items-center gap-2 px-1",
                      mine ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {mine ? "You" : username} •{" "}
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </Text>
                    {canDelete ? (
                      <Pressable
                        onPress={() =>
                          onDelete(message.message_id, username, Boolean(mine))
                        }
                        className="rounded-md p-1"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color={isDarkColorScheme ? "#a1a1aa" : "#6b7280"}
                        />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View className="border-t border-gray-200 px-4 pb-4 pt-3 dark:border-zinc-800">
          <View className="gap-2">
            <Input
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message..."
              autoCapitalize="sentences"
            />
            <Button
              onPress={onSend}
              disabled={sending || draft.trim().length === 0}
            >
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
