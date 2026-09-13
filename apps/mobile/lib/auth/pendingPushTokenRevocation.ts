import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

export const PENDING_PUSH_TOKEN_REVOCATIONS_KEY =
  "funtime.pendingPushTokenRevocations";

export type PendingPushTokenRevocation = {
  token: string;
  /** App DB people.uid — only retry while this user is authenticated. */
  uid: number;
};

export const PUSH_TOKEN_REVOKE_TIMEOUT_MS = 2_500;

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = "operation timed out",
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(label));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function isNetworkOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected === false) {
      return false;
    }
    // null isInternetReachable means unknown — allow the attempt, with timeout.
    if (state.isInternetReachable === false) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export async function readPendingPushTokenRevocations(): Promise<
  PendingPushTokenRevocation[]
> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_PUSH_TOKEN_REVOCATIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry): entry is PendingPushTokenRevocation =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as PendingPushTokenRevocation).token === "string" &&
        typeof (entry as PendingPushTokenRevocation).uid === "number",
    );
  } catch {
    return [];
  }
}

export async function writePendingPushTokenRevocations(
  entries: PendingPushTokenRevocation[],
): Promise<void> {
  if (entries.length === 0) {
    await AsyncStorage.removeItem(PENDING_PUSH_TOKEN_REVOCATIONS_KEY);
    return;
  }
  await AsyncStorage.setItem(
    PENDING_PUSH_TOKEN_REVOCATIONS_KEY,
    JSON.stringify(entries),
  );
}

export async function enqueuePendingPushTokenRevocation(
  entry: PendingPushTokenRevocation,
): Promise<void> {
  const existing = await readPendingPushTokenRevocations();
  const next = [
    ...existing.filter(
      (row) => !(row.token === entry.token && row.uid === entry.uid),
    ),
    entry,
  ];
  await writePendingPushTokenRevocations(next);
}

export async function clearPendingPushTokenRevocation(
  token: string,
  uid: number,
): Promise<void> {
  const existing = await readPendingPushTokenRevocations();
  await writePendingPushTokenRevocations(
    existing.filter((row) => !(row.token === token && row.uid === uid)),
  );
}

export type UnregisterPushTokenFn = (input: {
  token: string;
}) => Promise<{ success: boolean; updatedCount: number; unavailable: boolean }>;

/**
 * Best-effort revocation that never blocks local sign-out indefinitely.
 * Offline / timeout / API failure enqueue a pending entry for the same uid
 * to retry on the next authenticated session for that user.
 */
export async function revokePushTokenBestEffort(deps: {
  token: string;
  uid: number;
  unregisterPushToken: UnregisterPushTokenFn;
  timeoutMs?: number;
}): Promise<"revoked" | "queued"> {
  const { token, uid, unregisterPushToken } = deps;
  const timeoutMs = deps.timeoutMs ?? PUSH_TOKEN_REVOKE_TIMEOUT_MS;

  const online = await isNetworkOnline();
  if (!online) {
    await enqueuePendingPushTokenRevocation({ token, uid });
    return "queued";
  }

  try {
    await withTimeout(
      unregisterPushToken({ token }),
      timeoutMs,
      "push token unregister timed out",
    );
    await clearPendingPushTokenRevocation(token, uid);
    return "revoked";
  } catch {
    await enqueuePendingPushTokenRevocation({ token, uid });
    return "queued";
  }
}

/**
 * Retry queued revocations for the signed-in app user. Other users' tokens
 * stay queued until that user signs in again.
 */
export async function flushPendingPushTokenRevocations(deps: {
  uid: number;
  unregisterPushToken: UnregisterPushTokenFn;
  timeoutMs?: number;
}): Promise<void> {
  const pending = await readPendingPushTokenRevocations();
  const mine = pending.filter((entry) => entry.uid === deps.uid);
  if (mine.length === 0) {
    return;
  }

  const online = await isNetworkOnline();
  if (!online) {
    return;
  }

  for (const entry of mine) {
    try {
      await withTimeout(
        deps.unregisterPushToken({ token: entry.token }),
        deps.timeoutMs ?? PUSH_TOKEN_REVOKE_TIMEOUT_MS,
        "push token unregister timed out",
      );
      await clearPendingPushTokenRevocation(entry.token, entry.uid);
    } catch {
      // Leave queued for a later authenticated attempt.
    }
  }
}
