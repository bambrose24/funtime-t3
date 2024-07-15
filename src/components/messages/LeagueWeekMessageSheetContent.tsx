"use client";
import { clientApi } from "~/trpc/react";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { MESSAGES_REFETCH_INTERVAL_MS } from "./const";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export function LeagueWeekMessageSheetContent({
  week,
  leagueId,
  className,
}: {
  week: number;
  leagueId: number;
  className?: string;
}) {
  const { data: league } = clientApi.league.get.useQuery({ leagueId });
  const { data: messages } = clientApi.messages.leagueWeekMessageBoard.useQuery(
    { leagueId, week },
    {
      refetchInterval: MESSAGES_REFETCH_INTERVAL_MS,
    },
  );

  if (!league) {
    return null;
  }

  return (
    <>
      <SheetContent className={className}>
        <SheetHeader className="pt-2">
          <SheetTitle>
            {league.name} - Week {week} Message Board
          </SheetTitle>
          <div className="flex flex-col">
            {messages?.map((message) => {
              return <div key={message.message_id}>{message.content}</div>;
            })}
          </div>
        </SheetHeader>
        <SheetFooter className="absolute bottom-0 left-0 right-0">
          <div className="flex flex-col gap-4">
            <Textarea autoFocus className="h-[100px] w-full" />
            <Button>Send Message</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </>
  );
}
