/**
 * Abstracted utility and hook for tracking message read status.
 * Currently uses localStorage but can be swapped to a backend API/tRPC in the future.
 *
 * The storage interface is designed to be easily replaceable with a backend implementation.
 */

import { useCallback, useEffect, useState } from "react";

type MessageReadStorage = {
  getLastSeenTimestamp: (leagueId: number, week: number) => Date | null;
  setLastSeenTimestamp: (
    leagueId: number,
    week: number,
    timestamp: Date,
  ) => void;
  clearAllForLeague: (leagueId: number) => void;
};

const STORAGE_KEY_PREFIX = "funtime_chat_last_seen";

function getStorageKey(leagueId: number, week: number): string {
  return `${STORAGE_KEY_PREFIX}_${leagueId}_${week}`;
}

/**
 * localStorage implementation of the message read tracker
 */
const localStorageImplementation: MessageReadStorage = {
  getLastSeenTimestamp: (leagueId: number, week: number): Date | null => {
    if (typeof window === "undefined") return null;

    try {
      const key = getStorageKey(leagueId, week);
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const timestamp = new Date(stored);
      return isNaN(timestamp.getTime()) ? null : timestamp;
    } catch {
      return null;
    }
  },

  setLastSeenTimestamp: (
    leagueId: number,
    week: number,
    timestamp: Date,
  ): void => {
    if (typeof window === "undefined") return;

    try {
      const key = getStorageKey(leagueId, week);
      localStorage.setItem(key, timestamp.toISOString());
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  },

  clearAllForLeague: (leagueId: number): void => {
    if (typeof window === "undefined") return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${STORAGE_KEY_PREFIX}_${leagueId}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Ignore storage errors
    }
  },
};

// Export the current implementation (can be swapped to backend API later)
export const messageReadTracker: MessageReadStorage =
  localStorageImplementation;

/**
 * Helper function to calculate unread message count
 */
export function getUnreadMessageCount(
  messages: Array<{ createdAt: Date }>,
  lastSeenTimestamp: Date | null,
): number {
  if (!lastSeenTimestamp) {
    // If never seen, all messages are unread
    return messages.length;
  }

  return messages.filter((msg) => msg.createdAt > lastSeenTimestamp).length;
}

type UseUnreadMessagesOptions = {
  leagueId: number;
  week: number;
  messages: Array<{ createdAt: Date }>;
  /** Whether the chat is currently open/visible */
  isChatOpen: boolean;
};

type UseUnreadMessagesReturn = {
  /** Number of unread messages */
  unreadCount: number;
  /** Mark all current messages as read */
  markAsRead: () => void;
  /** The timestamp of the last seen message */
  lastSeenTimestamp: Date | null;
};

/**
 * Hook for tracking unread messages.
 *
 * Currently uses localStorage, but can be swapped to use a tRPC query/mutation
 * by replacing the internal implementation.
 *
 * @example
 * // Future tRPC implementation would look like:
 * // const { data: lastSeen } = trpc.messages.getLastSeen.useQuery({ leagueId, week });
 * // const { mutate: setLastSeen } = trpc.messages.setLastSeen.useMutation();
 *
 * @example
 * // Current usage:
 * const { unreadCount, markAsRead } = useUnreadMessages({
 *   leagueId: 123,
 *   week: 5,
 *   messages: messagesData ?? [],
 *   isChatOpen: chatSheetOpen,
 * });
 */
export function useUnreadMessages({
  leagueId,
  week,
  messages,
  isChatOpen,
}: UseUnreadMessagesOptions): UseUnreadMessagesReturn {
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<Date | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load last seen timestamp from storage on mount and when league/week changes
  useEffect(() => {
    const stored = messageReadTracker.getLastSeenTimestamp(leagueId, week);
    setLastSeenTimestamp(stored);
  }, [leagueId, week]);

  // Calculate unread count when messages or lastSeenTimestamp changes
  useEffect(() => {
    if (!isChatOpen) {
      setUnreadCount(getUnreadMessageCount(messages, lastSeenTimestamp));
    }
  }, [messages, lastSeenTimestamp, isChatOpen]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (messages.length === 0) return;

    const latestMessage = messages.reduce((latest, msg) =>
      msg.createdAt > latest.createdAt ? msg : latest,
    );

    messageReadTracker.setLastSeenTimestamp(
      leagueId,
      week,
      latestMessage.createdAt,
    );
    setLastSeenTimestamp(latestMessage.createdAt);
    setUnreadCount(0);
  }, [messages, leagueId, week]);

  // Auto-mark as read when chat opens
  const hasMessages = messages.length > 0;
  useEffect(() => {
    if (isChatOpen && hasMessages) {
      markAsRead();
    }
  }, [isChatOpen, hasMessages, markAsRead]);

  return {
    unreadCount,
    markAsRead,
    lastSeenTimestamp,
  };
}
