const STORAGE_KEY_PREFIX = "funtime_chat_last_seen";

/**
 * Reads the client-only cursor written by the pre-server unread implementation.
 * New read state lives in the API, but importing this value prevents existing web
 * users from seeing chats they already read as new after the migration.
 */
export function getLegacyLeagueLastSeenTimestamp(
  leagueId: number,
): Date | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${leagueId}_0`);
    if (!stored) return null;

    const timestamp = new Date(stored);
    return Number.isNaN(timestamp.getTime()) ? null : timestamp;
  } catch {
    return null;
  }
}
