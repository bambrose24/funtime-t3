import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";
import { clientApi } from "@/lib/trpc/react";
import { useColorScheme } from "@/lib/useColorScheme";
import { type RouterOutputs } from "~/trpc/types";

const MESSAGES_REFETCH_INTERVAL_MS = 10 * 1000;
const MESSAGE_PAGE_SIZE = 80;
const MESSAGE_CONTENT_MAX_LENGTH = 500;
const NEAR_BOTTOM_THRESHOLD_PX = 120;

type Props = {
  leagueId: string;
};

type LeagueMessage = RouterOutputs["messages"]["leagueMessageBoard"][number];

export function LeagueMessageBoard({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const { isDarkColorScheme } = useColorScheme();
  const utils = clientApi.useUtils();
  const listRef = useRef<FlatList<LeagueMessage>>(null);
  const previousTotalMessagesRef = useRef(0);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(MESSAGE_PAGE_SIZE);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUnseenNewMessages, setHasUnseenNewMessages] = useState(false);

  const { data: session } = clientApi.session.current.useQuery();
  const {
    data: messages,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = clientApi.messages.leagueMessageBoard.useQuery(
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

  const pagedMessages = useMemo(() => {
    const allMessages = messages ?? [];
    const startIndex = Math.max(allMessages.length - visibleCount, 0);
    return allMessages.slice(startIndex);
  }, [messages, visibleCount]);

  const hasOlderMessages = (messages?.length ?? 0) > pagedMessages.length;
  const totalMessages = messages?.length ?? 0;
  const messageCountLabel = `${totalMessages} message${totalMessages === 1 ? "" : "s"}`;
  const syncStatusLabel =
    dataUpdatedAt > 0
      ? `Updated ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
      : "Syncing messages...";
  const trimmedDraft = draft.trim();
  const draftLength = draft.length;
  const draftRemaining = MESSAGE_CONTENT_MAX_LENGTH - draftLength;
  const canSendDraft =
    !sending &&
    trimmedDraft.length > 0 &&
    draftLength <= MESSAGE_CONTENT_MAX_LENGTH;

  useEffect(() => {
    const totalMessages = messages?.length ?? 0;
    const hadMessagesBefore = previousTotalMessagesRef.current;
    const hasNewMessages = totalMessages > hadMessagesBefore;
    const initialLoad = hadMessagesBefore === 0 && totalMessages > 0;
    previousTotalMessagesRef.current = totalMessages;

    if (!hasNewMessages && !initialLoad) {
      return;
    }

    if (!initialLoad && !isNearBottom) {
      setHasUnseenNewMessages(true);
      return;
    }

    setHasUnseenNewMessages(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: !initialLoad });
    });
  }, [isNearBottom, messages?.length]);

  useEffect(() => {
    if (isNearBottom) {
      setHasUnseenNewMessages(false);
    }
  }, [isNearBottom]);

  const invalidateMessages = async () => {
    await utils.messages.leagueMessageBoard.invalidate({ leagueId: leagueIdNumber });
  };

  const onRefresh = async () => {
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    try {
      setIsRefreshing(true);
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const jumpToLatest = () => {
    setVisibleCount(MESSAGE_PAGE_SIZE);
    setHasUnseenNewMessages(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const onSend = async () => {
    const content = trimmedDraft;
    if (!content) {
      return;
    }
    if (content.length > MESSAGE_CONTENT_MAX_LENGTH) {
      Alert.alert(
        "Message Too Long",
        `Messages can be up to ${MESSAGE_CONTENT_MAX_LENGTH} characters.`,
      );
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

  if (isLoading) {
    return <LeagueTabLoadingSkeleton rows={4} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1">
        <FlatList<LeagueMessage>
          ref={listRef}
          data={pagedMessages}
          keyExtractor={(message) => message.message_id}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void onRefresh();
              }}
            />
          }
          onScroll={({ nativeEvent }) => {
            const nearBottom =
              nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - NEAR_BOTTOM_THRESHOLD_PX;
            setIsNearBottom((current) =>
              current === nearBottom ? current : nearBottom,
            );
          }}
          scrollEventThrottle={32}
          ListHeaderComponent={
            <View className="gap-2 pb-2">
              <View className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-app-fg-light dark:text-app-fg-dark text-xs font-semibold uppercase tracking-[0.8px]">
                  League Chat
                </Text>
                <Text className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {messageCountLabel} - auto-refreshes every 10s
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {isFetching && !isRefreshing ? "Syncing..." : syncStatusLabel}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {hasOlderMessages ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      setVisibleCount((current) => current + MESSAGE_PAGE_SIZE)
                    }
                  >
                    Load Older Messages
                  </Button>
                ) : null}
                {visibleCount > MESSAGE_PAGE_SIZE ? (
                  <Button variant="ghost" size="sm" onPress={jumpToLatest}>
                    Jump to Latest
                  </Button>
                ) : null}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="py-12">
              <Text className="text-center text-base text-gray-500 dark:text-gray-400">
                No messages yet. Start the conversation.
              </Text>
            </View>
          }
          renderItem={({ item: message }) => {
            const mine = viewerLeagueMember?.membership_id === message.member_id;
            const canDelete = mine || viewerLeagueMember?.role === "admin";
            const username = message.leaguemembers?.people.username ?? "Member";
            const createdAt = new Date(message.createdAt);

            return (
              <View className="gap-1">
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
                    {mine ? "You" : username} -{" "}
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
          }}
        />

        {hasUnseenNewMessages ? (
          <View className="px-4 pb-2">
            <Button variant="secondary" size="sm" onPress={jumpToLatest}>
              New messages available
            </Button>
          </View>
        ) : null}

        <View className="border-t border-gray-200 px-4 pb-4 pt-3 dark:border-zinc-800">
          <View className="gap-2">
            <Input
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message..."
              autoCapitalize="sentences"
              maxLength={MESSAGE_CONTENT_MAX_LENGTH}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (canSendDraft) {
                  void onSend();
                }
              }}
            />
            <View className="flex-row items-center justify-between px-1">
              <Text
                className={[
                  "text-xs",
                  draftRemaining <= 40
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-500 dark:text-gray-400",
                ].join(" ")}
              >
                {draftRemaining} chars left
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Pull down to sync
              </Text>
            </View>
            <Button
              onPress={onSend}
              disabled={!canSendDraft}
            >
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
