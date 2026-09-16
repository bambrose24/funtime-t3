export const MESSAGE_REACTION_EMOJIS = [
  { key: "fire", glyph: "🔥", label: "Fire" },
  { key: "laugh", glyph: "😂", label: "Laugh" },
  { key: "cooked", glyph: "💀", label: "Cooked" },
  { key: "eyes", glyph: "👀", label: "Eyes" },
  { key: "football", glyph: "🏈", label: "Football" },
  { key: "goat", glyph: "🐐", label: "GOAT" },
  { key: "thumbs_up", glyph: "👍", label: "Yes" },
  { key: "heart", glyph: "❤️", label: "Love" },
] as const;

export type MessageReactionEmojiKey =
  (typeof MESSAGE_REACTION_EMOJIS)[number]["key"];

export const MESSAGE_REACTION_EMOJI_KEYS = MESSAGE_REACTION_EMOJIS.map(
  (emoji) => emoji.key,
) as [MessageReactionEmojiKey, ...MessageReactionEmojiKey[]];

const REACTION_BY_KEY = Object.fromEntries(
  MESSAGE_REACTION_EMOJIS.map((emoji) => [emoji.key, emoji]),
) as Record<
  MessageReactionEmojiKey,
  (typeof MESSAGE_REACTION_EMOJIS)[number]
>;

export type MessageReactionSummary = {
  emoji: MessageReactionEmojiKey;
  count: number;
  reacted: boolean;
  usernames: string[];
};

export function getMessageReactionMeta(emoji: MessageReactionEmojiKey) {
  return REACTION_BY_KEY[emoji];
}

export function isMessageReactionEmoji(
  value: string,
): value is MessageReactionEmojiKey {
  return value in REACTION_BY_KEY;
}

export function summarizeMessageReactions(
  rows: Array<{
    message_id: string;
    emoji: MessageReactionEmojiKey;
    membership_id: number;
    username: string;
  }>,
  viewerMembershipId: number,
): Map<string, MessageReactionSummary[]> {
  const grouped = new Map<
    string,
    Map<
      MessageReactionEmojiKey,
      { membershipIds: number[]; usernames: string[] }
    >
  >();

  for (const row of rows) {
    let byEmoji = grouped.get(row.message_id);
    if (!byEmoji) {
      byEmoji = new Map();
      grouped.set(row.message_id, byEmoji);
    }
    const bucket = byEmoji.get(row.emoji) ?? {
      membershipIds: [],
      usernames: [],
    };
    bucket.membershipIds.push(row.membership_id);
    bucket.usernames.push(row.username);
    byEmoji.set(row.emoji, bucket);
  }

  const summaries = new Map<string, MessageReactionSummary[]>();
  for (const [messageId, byEmoji] of grouped) {
    summaries.set(
      messageId,
      MESSAGE_REACTION_EMOJI_KEYS.flatMap((emoji) => {
        const bucket = byEmoji.get(emoji);
        if (!bucket) {
          return [];
        }
        return [
          {
            emoji,
            count: bucket.membershipIds.length,
            reacted: bucket.membershipIds.includes(viewerMembershipId),
            usernames: bucket.usernames,
          },
        ];
      }),
    );
  }

  return summaries;
}

export function applyReactionToggle(
  reactions: MessageReactionSummary[],
  emoji: MessageReactionEmojiKey,
  username: string,
): MessageReactionSummary[] {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);
  const withoutEmoji = reactions.filter((reaction) => reaction.emoji !== emoji);

  if (existing?.reacted) {
    const usernames = existing.usernames.filter((name) => name !== username);
    if (usernames.length === 0) {
      return withoutEmoji;
    }
    return sortReactionSummaries([
      ...withoutEmoji,
      {
        emoji,
        count: usernames.length,
        reacted: false,
        usernames,
      },
    ]);
  }

  const usernames = existing
    ? existing.usernames.includes(username)
      ? existing.usernames
      : [...existing.usernames, username]
    : [username];

  return sortReactionSummaries([
    ...withoutEmoji,
    {
      emoji,
      count: usernames.length,
      reacted: true,
      usernames,
    },
  ]);
}

export function patchMessageReactions<
  T extends { message_id: string; reactions: MessageReactionSummary[] },
>(messages: T[], messageId: string, reactions: MessageReactionSummary[]): T[] {
  return messages.map((message) =>
    message.message_id === messageId ? { ...message, reactions } : message,
  );
}

export function formatReactionTooltip(
  summary: MessageReactionSummary,
  viewerUsername?: string | null,
): string {
  const { glyph, label } = getMessageReactionMeta(summary.emoji);
  if (summary.usernames.length === 0) {
    return label;
  }

  const names = summary.usernames.map((name) =>
    viewerUsername && name === viewerUsername ? "You" : name,
  );
  return `${glyph} ${names.join(", ")}`;
}

function sortReactionSummaries(reactions: MessageReactionSummary[]) {
  return [...reactions].sort(
    (left, right) =>
      MESSAGE_REACTION_EMOJI_KEYS.indexOf(left.emoji) -
      MESSAGE_REACTION_EMOJI_KEYS.indexOf(right.emoji),
  );
}
