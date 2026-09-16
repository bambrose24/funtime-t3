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
import { useLeagueUnreadMessages } from "@/hooks/useLeagueUnreadMessages";
import {
  createOptimisticMessage,
  flattenMessagePages,
  mergeMessagesWithOptimistic,
  reconcileOptimisticWithServer,
  withoutOptimisticId,
  type LeagueMessage,
  type LeagueMessageBoardPage,
  type OptimisticLeagueMessage,
} from "@/lib/messages/optimisticMessages";
import {
  MessageReactionAddButton,
  MessageReactionChips,
  MessageReactionPicker,
} from "@/components/messages/MessageReactions";
import {
  applyReactionToggle,
  patchMessageReactions,
  type MessageReactionEmojiKey,
  type MessageReactionSummary,
} from "@funtime/api/utils/messageReactions";

const MESSAGES_REFETCH_INTERVAL_MS = 10 * 1000;
const MESSAGE_PAGE_SIZE = 50;
const MESSAGE_CONTENT_MAX_LENGTH = 500;
const NEAR_BOTTOM_THRESHOLD_PX = 120;

type Props = {
  leagueId: string;
};

type DisplayMessage = LeagueMessage | OptimisticLeagueMessage;

function messageKey(message: DisplayMessage): string {
  if ("optimisticId" in message && message.optimisticId) {
    return message.optimisticId;
  }
  return message.message_id;
}

export function LeagueMessageBoard({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const { isDarkColorScheme } = useColorScheme();
  const { markRead } = useLeagueUnreadMessages(
    Number.isFinite(leagueIdNumber) ? leagueIdNumber : undefined,
  );
  const utils = clientApi.useUtils();
  const listRef = useRef<FlatList<DisplayMessage>>(null);
  const previousTotalMessagesRef = useRef(0);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUnseenNewMessages, setHasUnseenNewMessages] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticLeagueMessage[]
  >([]);
  const [pickerMessageId, setPickerMessageId] = useState<string | null>(null);

  const { data: session } = clientApi.session.current.useQuery();
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    dataUpdatedAt,
  } = clientApi.messages.leagueMessageBoard.useInfiniteQuery(
    {
      leagueId: leagueIdNumber,
      limit: MESSAGE_PAGE_SIZE,
    },
    {
      enabled: Number.isFinite(leagueIdNumber),
      refetchInterval: MESSAGES_REFETCH_INTERVAL_MS,
      getNextPageParam: (lastPage) => {
        if (Array.isArray(lastPage)) {
          return undefined;
        }
        return lastPage.nextCursor ?? undefined;
      },
      initialCursor: undefined,
    },
  );

  const serverMessages = useMemo(
    () =>
      flattenMessagePages(data?.pages as LeagueMessageBoardPage[] | undefined),
    [data?.pages],
  );
  const messages = useMemo(
    () => mergeMessagesWithOptimistic(serverMessages, optimisticMessages),
    [optimisticMessages, serverMessages],
  );

  const { mutateAsync: writeMessage } =
    clientApi.messages.writeMessage.useMutation();
  const { mutateAsync: deleteMessage } =
    clientApi.messages.deleteMessage.useMutation();
  const { mutateAsync: toggleReaction } =
    clientApi.messages.toggleReaction.useMutation();

  const viewerLeagueMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);

  const messageCountLabel = `${messages.length} message${messages.length === 1 ? "" : "s"}`;
  const syncStatusLabel =
    dataUpdatedAt > 0
      ? `Updated ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
      : "Loading messages...";
  const trimmedDraft = draft.trim();
  const draftLength = draft.length;
  const draftRemaining = MESSAGE_CONTENT_MAX_LENGTH - draftLength;
  const canSendDraft =
    !sending &&
    trimmedDraft.length > 0 &&
    draftLength <= MESSAGE_CONTENT_MAX_LENGTH;

  useEffect(() => {
    const totalMessages = messages.length;
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
  }, [isNearBottom, messages.length]);

  const latestMessageId = messages.at(-1)?.message_id;
  useEffect(() => {
    if (!isNearBottom || !latestMessageId) {
      return;
    }

    void markRead(latestMessageId).catch(() => {
      // A failed receipt should not interfere with reading or sending messages.
    });
  }, [isNearBottom, latestMessageId, markRead]);

  useEffect(() => {
    if (isNearBottom) {
      setHasUnseenNewMessages(false);
    }
  }, [isNearBottom]);

  const invalidateMessages = async () => {
    await Promise.all([
      utils.messages.leagueMessageBoard.invalidate({
        leagueId: leagueIdNumber,
        limit: MESSAGE_PAGE_SIZE,
      }),
      utils.messages.unreadCounts.invalidate(),
    ]);
  };

  const patchBoardReactions = (
    messageId: string,
    reactions: MessageReactionSummary[],
  ) => {
    utils.messages.leagueMessageBoard.setInfiniteData(
      {
        leagueId: leagueIdNumber,
        limit: MESSAGE_PAGE_SIZE,
      },
      (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          pages: current.pages.map((page) => {
            if (Array.isArray(page)) {
              return patchMessageReactions(page, messageId, reactions);
            }
            return {
              ...page,
              messages: patchMessageReactions(
                page.messages,
                messageId,
                reactions,
              ),
            };
          }),
        };
      },
    );
  };

  const onToggleReaction = async (
    message: DisplayMessage,
    emoji: MessageReactionEmojiKey,
  ) => {
    const username = session?.dbUser?.username;
    if (!username || ("pending" in message && message.pending)) {
      return;
    }
    const previous = utils.messages.leagueMessageBoard.getInfiniteData({
      leagueId: leagueIdNumber,
      limit: MESSAGE_PAGE_SIZE,
    });
    patchBoardReactions(
      message.message_id,
      applyReactionToggle(message.reactions ?? [], emoji, username),
    );
    try {
      const result = await toggleReaction({
        messageId: message.message_id,
        emoji,
      });
      patchBoardReactions(message.message_id, result.reactions);
    } catch (error) {
      console.error("Failed to toggle reaction", error);
      utils.messages.leagueMessageBoard.setInfiniteData(
        {
          leagueId: leagueIdNumber,
          limit: MESSAGE_PAGE_SIZE,
        },
        previous,
      );
      Alert.alert(
        "Couldn't react",
        "That reaction didn't go through. Try again.",
      );
    }
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
    setHasUnseenNewMessages(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const onSend = async () => {
    const content = trimmedDraft;
    if (!content || !viewerLeagueMember) {
      return;
    }
    if (content.length > MESSAGE_CONTENT_MAX_LENGTH) {
      Alert.alert(
        "Message Too Long",
        `Messages can be up to ${MESSAGE_CONTENT_MAX_LENGTH} characters.`,
      );
      return;
    }

    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = createOptimisticMessage({
      optimisticId,
      content,
      leagueId: leagueIdNumber,
      memberId: viewerLeagueMember.membership_id,
      username: session?.dbUser?.username ?? "You",
    });

    setDraft("");
    setOptimisticMessages((current) => [...current, optimistic]);
    setSending(true);

    try {
      const created = await writeMessage({
        leagueId: leagueIdNumber,
        content,
      });
      await invalidateMessages();
      setOptimisticMessages((current) =>
        reconcileOptimisticWithServer({
          optimistic: current,
          optimisticId,
          serverMessage: {
            ...created,
            leaguemembers: optimistic.leaguemembers,
            reactions: [],
          } as LeagueMessage,
          serverMessages,
        }),
      );
    } catch (error) {
      console.error("Failed to send message", error);
      setOptimisticMessages((current) =>
        withoutOptimisticId(current, optimisticId),
      );
      setDraft(content);
      Alert.alert("Couldn't send", "Your message wasn't delivered. Try again.");
    } finally {
      setSending(false);
    }
  };

  const onDelete = (messageId: string, username: string, mine: boolean) => {
    Alert.alert(
      "Delete Message",
      mine ? "Delete this message?" : `Delete this message from ${username}?`,
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
              Alert.alert("Delete Failed", "Unable to delete this message.");
            }
          },
        },
      ],
    );
  };

  const pickerMessage = useMemo(
    () => messages.find((message) => message.message_id === pickerMessageId),
    [messages, pickerMessageId],
  );

  if (isLoading) {
    return <LeagueTabLoadingSkeleton rows={4} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1">
        <FlatList<DisplayMessage>
          ref={listRef}
          data={messages}
          keyExtractor={messageKey}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
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
              nativeEvent.layoutMeasurement.height +
                nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - NEAR_BOTTOM_THRESHOLD_PX;
            setIsNearBottom((current) =>
              current === nearBottom ? current : nearBottom,
            );
          }}
          scrollEventThrottle={32}
          ListHeaderComponent={
            <View className="gap-2 pb-2">
              <View className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-app-fg-light dark:text-app-fg-dark">
                  League Chat
                </Text>
                <Text className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {messageCountLabel} · Shared with everyone in this league
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {isFetching && !isRefreshing && !isFetchingNextPage
                    ? "Checking for new messages..."
                    : syncStatusLabel}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {hasNextPage ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isFetchingNextPage}
                    onPress={() => {
                      void fetchNextPage();
                    }}
                  >
                    {isFetchingNextPage
                      ? "Loading earlier messages..."
                      : "Load earlier messages"}
                  </Button>
                ) : null}
                {messages.length > MESSAGE_PAGE_SIZE ? (
                  <Button variant="ghost" size="sm" onPress={jumpToLatest}>
                    Jump to latest
                  </Button>
                ) : null}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="py-12">
              <Text className="text-center text-base text-gray-500 dark:text-gray-400">
                No messages yet. Say hello to get the league started.
              </Text>
            </View>
          }
          renderItem={({ item: message }) => {
            const mine =
              viewerLeagueMember?.membership_id === message.member_id;
            const canDelete =
              !("pending" in message && message.pending) &&
              (mine || viewerLeagueMember?.role === "admin");
            const username = message.leaguemembers?.people.username ?? "Member";
            const createdAt = new Date(message.createdAt);
            const pending = "pending" in message && Boolean(message.pending);
            const authorLabel = mine ? "you" : username;

            return (
              <View className={mine ? "items-end" : "items-start"}>
                <View
                  className={[
                    "max-w-[85%] items-center gap-1",
                    mine ? "flex-row-reverse" : "flex-row",
                  ].join(" ")}
                >
                  <Pressable
                    disabled={pending}
                    onLongPress={() => {
                      if (pending) {
                        return;
                      }
                      Haptics.selectionAsync().catch(() => {
                        // No-op if haptics are unavailable.
                      });
                      setPickerMessageId(message.message_id);
                    }}
                    delayLongPress={280}
                    className="min-w-0 shrink"
                  >
                    <View
                      className={[
                        "rounded-xl border px-2.5 py-1.5",
                        mine
                          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                          : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
                        pending ? "opacity-70" : "",
                      ].join(" ")}
                    >
                      <Text className="text-sm text-app-fg-light dark:text-app-fg-dark">
                        {message.content}
                      </Text>
                    </View>
                  </Pressable>
                  {canDelete ? (
                    <Pressable
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`More actions for message from ${authorLabel}`}
                      onPress={() =>
                        onDelete(message.message_id, username, Boolean(mine))
                      }
                      className="rounded-md p-0.5"
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={16}
                        color={isDarkColorScheme ? "#a1a1aa" : "#6b7280"}
                      />
                    </Pressable>
                  ) : null}
                </View>
                <View
                  className={[
                    "mt-0.5 max-w-full flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5 px-0.5",
                    mine ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  {pending ? null : (
                    <MessageReactionChips
                      reactions={message.reactions ?? []}
                      viewerUsername={session?.dbUser?.username}
                      onToggle={(emoji) => {
                        void onToggleReaction(message, emoji);
                      }}
                    />
                  )}
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {mine ? "You" : username} ·{" "}
                    {pending
                      ? "Sending..."
                      : formatDistanceToNow(createdAt, { addSuffix: true })}
                  </Text>
                  {pending ? null : (
                    <MessageReactionAddButton
                      authorLabel={authorLabel}
                      onPress={() => setPickerMessageId(message.message_id)}
                    />
                  )}
                </View>
              </View>
            );
          }}
        />

        {hasUnseenNewMessages ? (
          <View className="px-4 pb-2">
            <Button variant="secondary" size="sm" onPress={jumpToLatest}>
              New messages
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
                {draftRemaining} characters left
              </Text>
            </View>
            <Button onPress={onSend} disabled={!canSendDraft}>
              {sending ? "Sending..." : "Send message"}
            </Button>
          </View>
        </View>
        <MessageReactionPicker
          open={pickerMessage != null}
          reactions={pickerMessage?.reactions ?? []}
          onClose={() => setPickerMessageId(null)}
          onToggle={(emoji) => {
            if (!pickerMessage) {
              return;
            }
            void onToggleReaction(pickerMessage, emoji);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
