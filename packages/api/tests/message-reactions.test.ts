import { expect, test } from "bun:test";
import {
  applyReactionToggle,
  formatReactionTooltip,
  MESSAGE_REACTION_EMOJIS,
  summarizeMessageReactions,
} from "../utils/messageReactions";

test("the allowlist stays small and playful", () => {
  expect(MESSAGE_REACTION_EMOJIS).toHaveLength(8);
  expect(MESSAGE_REACTION_EMOJIS.map((emoji) => emoji.glyph)).toEqual([
    "🔥",
    "😂",
    "💀",
    "👀",
    "🏈",
    "🐐",
    "👍",
    "❤️",
  ]);
});

test("summarize groups counts, viewer state, and stable emoji order", () => {
  const summaries = summarizeMessageReactions(
    [
      {
        message_id: "m1",
        emoji: "heart",
        membership_id: 2,
        username: "sam",
      },
      {
        message_id: "m1",
        emoji: "fire",
        membership_id: 1,
        username: "you",
      },
      {
        message_id: "m1",
        emoji: "fire",
        membership_id: 2,
        username: "sam",
      },
      {
        message_id: "m2",
        emoji: "goat",
        membership_id: 3,
        username: "lee",
      },
    ],
    1,
  );

  expect(summaries.get("m1")?.map((reaction) => reaction.emoji)).toEqual([
    "fire",
    "heart",
  ]);
  expect(summaries.get("m1")?.[0]).toEqual({
    emoji: "fire",
    count: 2,
    reacted: true,
    usernames: ["you", "sam"],
  });
  expect(summaries.get("m2")).toEqual([
    {
      emoji: "goat",
      count: 1,
      reacted: false,
      usernames: ["lee"],
    },
  ]);
});

test("optimistic toggle adds, stacks, and removes the viewer's reaction", () => {
  const added = applyReactionToggle([], "laugh", "webplayer");
  expect(added).toEqual([
    {
      emoji: "laugh",
      count: 1,
      reacted: true,
      usernames: ["webplayer"],
    },
  ]);

  const stacked = applyReactionToggle(added, "fire", "webplayer");
  expect(stacked.map((reaction) => reaction.emoji)).toEqual(["fire", "laugh"]);

  const withSam = applyReactionToggle(
    [
      {
        emoji: "laugh",
        count: 1,
        reacted: false,
        usernames: ["sam"],
      },
    ],
    "laugh",
    "webplayer",
  );
  expect(withSam.find((reaction) => reaction.emoji === "laugh")).toEqual({
    emoji: "laugh",
    count: 2,
    reacted: true,
    usernames: ["sam", "webplayer"],
  });

  const removed = applyReactionToggle(withSam, "laugh", "webplayer");
  expect(removed.find((reaction) => reaction.emoji === "laugh")).toEqual({
    emoji: "laugh",
    count: 1,
    reacted: false,
    usernames: ["sam"],
  });

  const cleared = applyReactionToggle(
    applyReactionToggle([], "goat", "webplayer"),
    "goat",
    "webplayer",
  );
  expect(cleared).toEqual([]);
});

test("tooltip names the reactors and swaps the viewer to You", () => {
  expect(
    formatReactionTooltip(
      {
        emoji: "fire",
        count: 2,
        reacted: true,
        usernames: ["webplayer", "sam"],
      },
      "webplayer",
    ),
  ).toBe("🔥 You, sam");
});
