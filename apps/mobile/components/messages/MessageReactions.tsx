import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  MESSAGE_REACTION_EMOJIS,
  formatReactionTooltip,
  getMessageReactionMeta,
  type MessageReactionEmojiKey,
  type MessageReactionSummary,
} from "@funtime/api/utils/messageReactions";

export function MessageReactionAddButton({
  disabled,
  authorLabel,
  onPress,
}: {
  disabled?: boolean;
  authorLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Add a reaction to message from ${authorLabel}`}
      onPress={onPress}
      className="h-5 w-5 items-center justify-center rounded-full"
    >
      <Text className="text-sm leading-none text-gray-400 dark:text-gray-500">
        +
      </Text>
    </Pressable>
  );
}

export function MessageReactionChips({
  reactions,
  disabled,
  viewerUsername,
  onToggle,
}: {
  reactions: MessageReactionSummary[];
  disabled?: boolean;
  viewerUsername?: string | null;
  onToggle: (emoji: MessageReactionEmojiKey) => void;
}) {
  if (reactions.length === 0) {
    return null;
  }

  const chooseChip = (emoji: MessageReactionEmojiKey) => {
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
    onToggle(emoji);
  };

  return (
    <View className="flex-row flex-wrap items-center gap-0.5">
      {reactions.map((reaction) => {
        const meta = getMessageReactionMeta(reaction.emoji);
        return (
          <Pressable
            key={reaction.emoji}
            disabled={disabled}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityState={{ selected: reaction.reacted }}
            accessibilityLabel={`${meta.label}, ${reaction.count}. ${formatReactionTooltip(reaction, viewerUsername)}`}
            onPress={() => chooseChip(reaction.emoji)}
            className={[
              "min-h-5 flex-row items-center gap-0.5 rounded-full border px-1.5 py-0.5",
              reaction.reacted
                ? "border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-950"
                : "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
            ].join(" ")}
          >
            <Text className="text-sm leading-none">{meta.glyph}</Text>
            <Text className="text-[11px] text-gray-700 dark:text-gray-200">
              {reaction.count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MessageReactionPicker({
  open,
  reactions,
  onClose,
  onToggle,
}: {
  open: boolean;
  reactions: MessageReactionSummary[];
  onClose: () => void;
  onToggle: (emoji: MessageReactionEmojiKey) => void;
}) {
  const choose = (emoji: MessageReactionEmojiKey) => {
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
    onToggle(emoji);
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={open}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-2xl bg-white px-4 pb-8 pt-4 dark:bg-zinc-900"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="mb-3 text-sm font-semibold text-app-fg-light dark:text-app-fg-dark">
            React
          </Text>
          <View className="flex-row flex-wrap justify-between gap-2">
            {MESSAGE_REACTION_EMOJIS.map((emoji) => {
              const active = reactions.some(
                (reaction) => reaction.emoji === emoji.key && reaction.reacted,
              );
              return (
                <Pressable
                  key={emoji.key}
                  accessibilityRole="button"
                  accessibilityLabel={`React with ${emoji.label}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => choose(emoji.key)}
                  className={[
                    "h-14 w-[22%] items-center justify-center rounded-xl border",
                    active
                      ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950"
                      : "border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800",
                  ].join(" ")}
                >
                  <Text className="text-2xl">{emoji.glyph}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
