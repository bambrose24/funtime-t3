"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MessagesSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { useLeagueUnreadMessages } from "~/hooks/useLeagueUnreadMessages";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import MessageComposer from "./Composer";

import { MESSAGES_REFETCH_INTERVAL_MS } from "./const";

type LeagueMessage = RouterOutputs["messages"]["leagueMessageBoard"][number];

export function LeagueChat({
  leagueId,
  leagueName,
}: {
  leagueId: number;
  leagueName: string;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const [isAtLatest, setIsAtLatest] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { data: session } = clientApi.session.current.useQuery();
  const { data: messagesData, isLoading } =
    clientApi.messages.leagueMessageBoard.useQuery(
      { leagueId },
      { refetchInterval: MESSAGES_REFETCH_INTERVAL_MS },
    );
  const { markRead } = useLeagueUnreadMessages(leagueId);
  const utils = clientApi.useUtils();

  const messages = messagesData ?? [];
  const latestMessage = messages.at(-1);
  const latestMessageId = latestMessage?.message_id;

  const { mutateAsync: sendMessage, isPending: isSending } =
    clientApi.messages.writeMessage.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.messages.leagueMessageBoard.invalidate({ leagueId }),
          utils.messages.unreadCounts.invalidate(),
        ]);
      },
    });

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (!viewport) return;

    const handleScroll = () => {
      const nearBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 96;
      setIsAtLatest((current) =>
        current === nearBottom ? current : nearBottom,
      );
      if (nearBottom) setHasNewMessages(false);
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!latestMessageId || !isAtLatest) return;
    void markRead(latestMessageId).catch(() => {
      // A failed read receipt should never interrupt the conversation.
    });
  }, [isAtLatest, latestMessageId, markRead]);

  useEffect(() => {
    const previousMessageId = lastMessageIdRef.current;
    lastMessageIdRef.current = latestMessageId;
    if (!latestMessageId) return;
    const receivedNewMessage =
      previousMessageId !== undefined && previousMessageId !== latestMessageId;
    const frame = requestAnimationFrame(() => {
      if (isAtLatest) {
        const viewport = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        viewport?.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        return;
      }

      if (receivedNewMessage) setHasNewMessages(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [isAtLatest, latestMessageId]);

  const viewerMembership = useMemo(
    () =>
      session?.dbUser?.leaguemembers.find(
        (member) => member.league_id === leagueId,
      ),
    [leagueId, session?.dbUser?.leaguemembers],
  );

  const jumpToLatest = () => {
    setIsAtLatest(true);
    setHasNewMessages(false);
  };

  return (
    <Card className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 border-b bg-muted/30 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <MessagesSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg">League Chat</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {leagueName}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </p>
      </CardHeader>
      <CardContent className="grid min-h-[min(68vh,680px)] grid-rows-[1fr_auto] p-0">
        <ScrollArea ref={scrollAreaRef} className="min-h-0 px-5 py-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading chat…</p>
          ) : messages.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center px-6 text-center">
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                No messages yet. Kick off the conversation before the next game.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.message_id}
                  leagueId={leagueId}
                  message={message}
                  viewerMembershipId={viewerMembership?.membership_id}
                  viewerIsAdmin={viewerMembership?.role === "admin"}
                />
              ))}
            </div>
          )}
          <ScrollBar />
        </ScrollArea>
        <div className="border-t bg-background/80 px-5 py-4">
          {hasNewMessages ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mb-3"
              onClick={jumpToLatest}
            >
              New messages — jump to latest
            </Button>
          ) : null}
          <Separator className="mb-4" />
          <MessageComposer
            className="w-full"
            showClose={false}
            onSubmit={async ({ message }) => {
              await sendMessage({ content: message, leagueId });
              if (!isAtLatest) jumpToLatest();
              toast.success("Message sent");
            }}
          />
          {isSending ? (
            <p className="mt-2 text-xs text-muted-foreground">Sending…</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MessageBubble({
  leagueId,
  message,
  viewerMembershipId,
  viewerIsAdmin,
}: {
  leagueId: number;
  message: LeagueMessage;
  viewerMembershipId: number | undefined;
  viewerIsAdmin: boolean;
}) {
  const utils = clientApi.useUtils();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mine = viewerMembershipId === message.member_id;
  const canDelete = mine || viewerIsAdmin;
  const { mutateAsync: deleteMessage, isPending } =
    clientApi.messages.deleteMessage.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.messages.leagueMessageBoard.invalidate({ leagueId }),
          utils.messages.unreadCounts.invalidate(),
        ]);
      },
    });

  const username = message.leaguemembers.people.username;
  return (
    <div className={mine ? "ml-12" : "mr-12"}>
      <div
        className={
          mine
            ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground"
            : "rounded-2xl rounded-bl-md border bg-muted/40 px-4 py-3 text-sm"
        }
      >
        {message.content}
      </div>
      <div
        className={
          mine
            ? "mt-1 flex items-center justify-end gap-2 px-1 text-xs text-muted-foreground"
            : "mt-1 flex items-center gap-2 px-1 text-xs text-muted-foreground"
        }
      >
        <Link
          href={`/league/${leagueId}/player/${message.leaguemembers.membership_id}`}
          className="hover:text-foreground hover:underline"
        >
          {mine ? "You" : username}
        </Link>
        <span aria-hidden>•</span>
        <span title={message.createdAt.toLocaleString()}>
          {formatDistanceToNow(message.createdAt, { addSuffix: true })}
        </span>
        {canDelete ? (
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Delete message from ${mine ? "you" : username}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete message?</DialogTitle>
                <DialogDescription>
                  This cannot be undone.
                  {!mine ? ` You are deleting a message from ${username}.` : ""}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={async () => {
                    await deleteMessage({ messageId: message.message_id });
                    setConfirmOpen(false);
                    toast.success("Message deleted");
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    </div>
  );
}
