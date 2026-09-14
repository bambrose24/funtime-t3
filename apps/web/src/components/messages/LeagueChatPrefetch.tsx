"use client";

import { clientApi } from "~/trpc/react";
import { MESSAGES_REFETCH_INTERVAL_MS } from "./const";

export function LeagueChatPrefetch({ leagueId }: { leagueId: number }) {
  clientApi.messages.leagueMessageBoard.useQuery(
    { leagueId },
    {
      refetchInterval: MESSAGES_REFETCH_INTERVAL_MS,
      refetchIntervalInBackground: true,
    },
  );

  return null;
}
