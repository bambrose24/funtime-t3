import type { QueryClient } from "@tanstack/react-query";

export type IdentityTransition =
  | { type: "none" }
  | { type: "signed_in"; uid: string }
  | { type: "signed_out"; previousUid: string }
  | { type: "switched"; previousUid: string; nextUid: string };

/**
 * Pure transition detector for auth identity changes.
 * Callers should treat "switched" and "signed_out" as a signal to purge
 * account-scoped query cache. "signed_in" assumes a prior signed_out purge.
 */
export function resolveIdentityTransition(
  previousUid: string | null,
  nextUid: string | null,
): IdentityTransition {
  if (previousUid === nextUid) {
    return { type: "none" };
  }
  if (previousUid == null && nextUid != null) {
    return { type: "signed_in", uid: nextUid };
  }
  if (previousUid != null && nextUid == null) {
    return { type: "signed_out", previousUid };
  }
  return {
    type: "switched",
    previousUid: previousUid as string,
    nextUid: nextUid as string,
  };
}

export function shouldPurgeAccountCache(
  transition: IdentityTransition,
): boolean {
  return transition.type === "signed_out" || transition.type === "switched";
}

/**
 * Cancel in-flight work, clear in-memory queries/mutations, and remove the
 * persisted AsyncStorage entry. Local purge is unconditional; callers own
 * any best-effort server revocation that happens before sign-out.
 */
export async function purgeAccountScopedCache(deps: {
  queryClient: QueryClient;
  removePersistedCache: () => Promise<void>;
}): Promise<void> {
  await deps.queryClient.cancelQueries();
  deps.queryClient.clear();
  await deps.removePersistedCache();
}
