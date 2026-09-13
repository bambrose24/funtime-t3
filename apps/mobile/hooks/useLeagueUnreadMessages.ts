import { useCallback } from "react";
import { clientApi } from "@/lib/trpc/react";

/** Unread badges poll less often than an open chat thread. */
const UNREAD_REFETCH_INTERVAL_MS = 30 * 1000;

export function useLeagueUnreadMessages(leagueId: number | undefined) {
  const utils = clientApi.useUtils();
  const { data: unreadCounts } = clientApi.messages.unreadCounts.useQuery(
    undefined,
    { refetchInterval: UNREAD_REFETCH_INTERVAL_MS },
  );
  const { mutateAsync: markReadMutation } =
    clientApi.messages.markRead.useMutation({
      // Intentionally narrow: a read receipt must not refetch the message board
      // or any other active query.
      onSuccess: () => utils.messages.unreadCounts.invalidate(),
    });

  const markRead = useCallback(
    async (messageId: string) => {
      if (!leagueId) return;
      await markReadMutation({ leagueId, messageId });
    },
    [leagueId, markReadMutation],
  );

  return {
    unreadCount: leagueId ? (unreadCounts?.[leagueId] ?? 0) : 0,
    markRead,
  };
}
