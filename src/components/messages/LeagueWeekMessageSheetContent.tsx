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
import { cn } from "~/lib/utils";
import MessageComposer from "./Composer";

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
      <SheetContent className={cn("p-4 lg:p-3", className)}>
        <SheetHeader className="pt-6">
          <SheetTitle>
            {league.name} - Week {week} Message Board
          </SheetTitle>
          <div className="flex flex-col">
            {messages?.map((message) => {
              return <div key={message.message_id}>{message.content}</div>;
            })}
          </div>
        </SheetHeader>
        <SheetFooter className="absolute bottom-0 left-2 right-2 lg:left-3 lg:right-3">
          <MessageComposer
            className="mb-4 px-2"
            onSubmit={async (data) => {
              console.log("data??????", data);
            }}
          />
        </SheetFooter>
      </SheetContent>
    </>
  );
}
