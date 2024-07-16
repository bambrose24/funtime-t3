"use client";
import { clientApi } from "~/trpc/react";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { MESSAGES_REFETCH_INTERVAL_MS } from "./const";
import { cn } from "~/lib/utils";
import MessageComposer from "./Composer";
import { format, formatDistanceToNow, differenceInMinutes } from "date-fns";
import Link from "next/link";
import { Separator } from "~/components/ui/separator";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useEffect } from "react";

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
  const { data: messagesData } =
    clientApi.messages.leagueWeekMessageBoard.useQuery(
      { leagueId, week },
      {
        refetchInterval: MESSAGES_REFETCH_INTERVAL_MS,
      },
    );
  const { data: session } = clientApi.session.current.useQuery();

  const messages = [
    ...(messagesData ?? []),
    ...(messagesData ?? []),
    ...(messagesData ?? []),
  ];

  const lastMessageIdx = messages.length - 1;

  useEffect(() => {
    if (!lastMessageIdx) {
      return;
    }
    const scrollEl = document.getElementById(`message_${lastMessageIdx}`);
    if (scrollEl) {
      scrollEl.scrollIntoView();
    }
  }, [lastMessageIdx]);

  if (!league || !session) {
    return null;
  }

  const formatDate = (date: Date) => {
    const now = new Date();
    const minutesDifference = differenceInMinutes(now, date);

    if (minutesDifference <= 2 * 24 * 60) {
      // within 2 days
      return format(date, "MMM d, yyyy hh:mm a");
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  return (
    <SheetContent
      className={cn(
        "w-[600px] p-4 lg:p-3",
        className,
        "grid grid-rows-[90px_1fr_130px] gap-1",
      )}
    >
      <SheetHeader className="row-span-1 flex flex-col justify-between space-y-0">
        <SheetTitle>
          {league.name} - Week {week} Message Board
        </SheetTitle>
        <Separator />
      </SheetHeader>

      <ScrollArea
        className="row-span-1 h-full overflow-y-auto"
        id="messagesScroll"
      >
        <div className="flex flex-col gap-3">
          {messages.map((message, idx) => {
            const name = message.leaguemembers.people.username;
            const isSender =
              message.leaguemembers.people.uid === session.dbUser?.uid;

            return (
              <div
                key={message.message_id}
                className="flex flex-col"
                id={`message_${idx}`}
              >
                <div
                  className={cn(
                    "rounded-xl border-2 border-border px-2 py-1 text-sm",
                    isSender && "ml-10 border-primary",
                    !isSender && "mr-10",
                  )}
                >
                  {message.content}
                </div>
                <div
                  className={cn(
                    "mx-1 mt-px text-xs text-muted-foreground",
                    isSender && "text-end",
                    !isSender && "text-start",
                  )}
                  title={message.createdAt.toLocaleString()}
                >
                  <Link
                    href={`/league/${leagueId}/player/${message.leaguemembers.membership_id}`}
                    className="cursor-pointer hover:underline"
                  >
                    {isSender ? "You" : name}
                  </Link>{" "}
                  • {formatDate(message.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar />
      </ScrollArea>

      <SheetFooter className="row-span-1">
        <MessageComposer
          className="mb-4 w-full px-2"
          onSubmit={async (data) => {
            console.log("data??????", data);
          }}
        />
      </SheetFooter>
    </SheetContent>
  );
}
