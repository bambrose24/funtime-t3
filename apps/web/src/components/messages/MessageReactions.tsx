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
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export function MessageReactionAddButton({
  reactions,
  mine,
  disabled,
  authorLabel,
  onToggle,
}: {
  reactions: MessageReactionSummary[];
  mine: boolean;
  disabled?: boolean;
  authorLabel: string;
  onToggle: (emoji: MessageReactionEmojiKey) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={`Add a reaction to message from ${authorLabel}`}
          className="h-5 w-5 shrink-0 text-muted-foreground"
        >
          <SmilePlus className="h-3 w-3" />
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
  );
}

export function MessageReactionChips({
  reactions,
  disabled,
  viewerUsername,
  onToggle,
}: {
  reactions: MessageReactionSummary[];
  disabled?: boolean;
  viewerUsername?: string | null;
  onToggle: (emoji: MessageReactionEmojiKey) => void;
}) {
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-0.5">
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
                  "inline-flex h-5 items-center gap-0.5 rounded-full border bg-background px-1.5 text-[11px] leading-none tabular-nums shadow-sm transition-colors",
                  reaction.reacted
                    ? "border-primary/45 bg-primary/15 text-foreground"
                    : "border-border/80 text-muted-foreground hover:border-primary/30 hover:bg-muted",
                )}
              >
                <span aria-hidden className="text-xs leading-none">
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
    </div>
  );
}
