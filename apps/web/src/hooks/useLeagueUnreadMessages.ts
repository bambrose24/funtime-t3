"use client";

import { useCallback, useEffect, useRef } from "react";
import { clientApi } from "~/trpc/react";
import { getLegacyLeagueLastSeenTimestamp } from "~/utils/messageReadTracker";

const UNREAD_REFETCH_INTERVAL_MS = 10 * 1000;

export function useLeagueUnreadMessages(leagueId: number) {
  const utils = clientApi.useUtils();
  const importedLeagueIds = useRef(new Set<number>());
  const { data: unreadCounts } = clientApi.messages.unreadCounts.useQuery(
    undefined,
    { refetchInterval: UNREAD_REFETCH_INTERVAL_MS },
  );
  const { mutate: importLegacyReadState } =
    clientApi.messages.importLegacyReadState.useMutation({
      onSuccess: () => utils.messages.unreadCounts.invalidate(),
    });
  const { mutateAsync: markReadMutation } =
    clientApi.messages.markRead.useMutation({
      onSuccess: () => utils.messages.unreadCounts.invalidate(),
    });

  useEffect(() => {
    if (importedLeagueIds.current.has(leagueId)) return;
    importedLeagueIds.current.add(leagueId);

    const lastSeenAt = getLegacyLeagueLastSeenTimestamp(leagueId);
    if (lastSeenAt) {
      importLegacyReadState({ leagueId, lastSeenAt });
    }
  }, [importLegacyReadState, leagueId]);

  const markRead = useCallback(
    async (messageId: string) => {
      await markReadMutation({ leagueId, messageId });
    },
    [leagueId, markReadMutation],
  );

  return {
    unreadCount: unreadCounts?.[leagueId] ?? 0,
    markRead,
  };
}
