"use client";

import { useState } from "react";
import { SmilePlus } from "lucide-react";
import {
  MESSAGE_REACTION_EMOJIS,
  formatReactionTooltip,
  getMessageReactionMeta,
  type MessageReactionEmojiKey,
  type MessageReactionSummary,
} from "@funtime/api/utils/messageReactions";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export function MessageReactions({
  reactions,
  mine,
  disabled,
  viewerUsername,
  authorLabel,
  onToggle,
}: {
  reactions: MessageReactionSummary[];
  mine: boolean;
  disabled?: boolean;
  viewerUsername?: string | null;
  authorLabel: string;
  onToggle: (emoji: MessageReactionEmojiKey) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "mt-1 flex flex-wrap items-center gap-1",
          mine ? "justify-end" : "justify-start",
        )}
      >
        {reactions.map((reaction) => {
          const meta = getMessageReactionMeta(reaction.emoji);
          const label = reaction.reacted
            ? `Remove ${meta.label} reaction`
            : `Add ${meta.label} reaction`;
          return (
            <Tooltip key={reaction.emoji}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={reaction.reacted}
                  aria-label={`${label}. ${reaction.count}`}
                  title={formatReactionTooltip(reaction, viewerUsername)}
                  onClick={() => onToggle(reaction.emoji)}
                  className={cn(
                    "inline-flex h-7 min-w-7 items-center gap-1 rounded-full border px-2 text-xs tabular-nums transition-colors",
                    reaction.reacted
                      ? "border-primary/45 bg-primary/15 text-foreground"
                      : "border-border/80 bg-background/80 text-muted-foreground hover:border-primary/30 hover:bg-muted",
                  )}
                >
                  <span aria-hidden className="text-sm leading-none">
                    {meta.glyph}
                  </span>
                  <span>{reaction.count}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {formatReactionTooltip(reaction, viewerUsername)}
              </TooltipContent>
            </Tooltip>
          );
        })}
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label={`Add a reaction to message from ${authorLabel}`}
              className="h-7 w-7 text-muted-foreground"
            >
              <SmilePlus className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align={mine ? "end" : "start"}
            className="w-auto p-2"
            onEscapeKeyDown={(event) => event.stopPropagation()}
          >
            <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
              {MESSAGE_REACTION_EMOJIS.map((emoji) => {
                const active = reactions.some(
                  (reaction) => reaction.emoji === emoji.key && reaction.reacted,
                );
                return (
                  <button
                    key={emoji.key}
                    type="button"
                    aria-label={`React with ${emoji.label}`}
                    aria-pressed={active}
                    title={emoji.label}
                    onClick={() => {
                      onToggle(emoji.key);
                      setPickerOpen(false);
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-colors hover:bg-muted",
                      active && "bg-primary/15 ring-1 ring-primary/40",
                    )}
                  >
                    <span aria-hidden>{emoji.glyph}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
