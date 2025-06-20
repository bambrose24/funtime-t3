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
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { type RouterOutputs } from "~/trpc/types";

export function LeagueWeekMessageSheetContent({
  week,
  leagueId,
  className,
  closeSheet,
}: {
  week: number;
  leagueId: number;
  className?: string;
  closeSheet: () => void;
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
  const utils = clientApi.useUtils();

  const onSuccess = async () => {
    await utils.messages.leagueWeekMessageBoard.invalidate({
      leagueId,
      week,
    });
  };
  const { mutateAsync: sendMessage } =
    clientApi.messages.writeWeekMessage.useMutation({
      onSuccess,
    });

  const messages = messagesData ?? [];

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
        "grid grid-rows-[70px_1fr_130px] gap-1",
      )}
    >
      <SheetHeader className="row-span-1 flex flex-col gap-4 space-y-0">
        <SheetTitle>Week {week} Message Board</SheetTitle>
        <Separator />
      </SheetHeader>
      <ScrollArea className="row-span-1 h-full overflow-y-auto">
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
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={cn(
                      "flex-grow rounded-xl border-2 border-border px-2 py-1 text-sm",
                      {
                        "ml-10 bg-primary text-primary-foreground": isSender,
                        "mr-10": !isSender,
                      },
                    )}
                  >
                    {message.content}
                  </div>

                  <DeleteMessageButton
                    message={message}
                    week={week}
                    leagueId={leagueId}
                  />
                </div>
                <div
                  className={cn("mx-1 mt-px text-xs text-muted-foreground", {
                    "text-end": isSender,
                    "text-start": !isSender,
                  })}
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
          closeSheet={closeSheet}
          onSubmit={async (data) => {
            await sendMessage({
              content: data.message,
              leagueId,
              week,
            });
          }}
        />
      </SheetFooter>
    </SheetContent>
  );
}

function DeleteMessageButton({
  message,
  week,
  leagueId,
}: {
  message: RouterOutputs["messages"]["leagueWeekMessageBoard"][number];
  week: number;
  leagueId: number;
}) {
  const utils = clientApi.useUtils();
  const { data: session } = clientApi.session.current.useQuery();
  const { mutateAsync: deleteMessage, isPending } =
    clientApi.messages.deleteMessage.useMutation({
      onSuccess: async () => {
        await utils.messages.leagueWeekMessageBoard.invalidate({
          leagueId,
          week,
        });
        toast.success(`Deleted message`);
      },
    });
  const [dialogOpen, setDialogOpen] = useState(false);

  const member = session?.dbUser?.leaguemembers.find(
    (m) => m.league_id === leagueId,
  );
  const isViewers = session?.dbUser?.leaguemembers.some(
    (m) => m.membership_id === message.member_id,
  );

  const canDelete = isViewers === true || member?.role === "admin";

  if (!canDelete) {
    return null;
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline" className="px-2 py-1">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Deleting this message cannot be undone.{" "}
            {isViewers === false && (
              <>
                You are deleting a message from{" "}
                <span className="font-bold">
                  {message.leaguemembers.people.username}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex w-full items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex gap-2"
            disabled={isPending}
            onClick={async (e) => {
              e.preventDefault();
              await deleteMessage({ messageId: message.message_id });
            }}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
