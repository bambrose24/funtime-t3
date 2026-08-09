"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Mail, ShieldCheck, Users } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import type { RouterOutputs } from "~/trpc/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type RenewalInvitees = RouterOutputs["league"]["renewalInvitees"];

export function RenewalInviteDialog({
  invitees,
  open,
  onOpenChange,
  onConfirm,
  isCreating,
}: {
  invitees: RenewalInvitees;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (memberIds: number[]) => void;
  isCreating: boolean;
}) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    () => new Set(invitees.defaultSelectedMemberIds),
  );

  useEffect(() => {
    if (open) {
      setSelectedMemberIds(new Set(invitees.defaultSelectedMemberIds));
    }
  }, [invitees.defaultSelectedMemberIds, open]);

  const selectedMemberIdList = useMemo(
    () => Array.from(selectedMemberIds),
    [selectedMemberIds],
  );
  const selectedCount = selectedMemberIdList.length;
  const allSelected =
    invitees.eligibleMembers.length > 0 &&
    selectedCount === invitees.eligibleMembers.length;

  const toggleMember = (memberId: number) => {
    setSelectedMemberIds((current) => {
      const next = new Set(current);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(720px,calc(100vh-2rem))] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review next-season invites</DialogTitle>
          <DialogDescription>
            Choose who should receive an invitation after the league is created.
            You&apos;ll be added as an admin automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <Text.Small className="font-medium">
              {selectedCount} of {invitees.eligibleMembers.length} players
              selected
            </Text.Small>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSelectedMemberIds(
                allSelected
                  ? new Set()
                  : new Set(
                      invitees.eligibleMembers.map(
                        (member) => member.membershipId,
                      ),
                    ),
              )
            }
          >
            {allSelected ? "Clear selection" : "Select all"}
          </Button>
        </div>

        {invitees.eligibleMembers.length > 0 ? (
          <div className="overflow-hidden rounded-md border">
            {invitees.eligibleMembers.map((member) => {
              const checked = selectedMemberIds.has(member.membershipId);
              const isAdmin = member.role === "admin";
              const missedPicks = member.missedPickCount;

              return (
                <div
                  key={member.membershipId}
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/50"
                  onClick={() => toggleMember(member.membershipId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleMember(member.membershipId);
                    }
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={() => toggleMember(member.membershipId)}
                    aria-label={`Invite ${member.username}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {member.username}
                      </span>
                      {isAdmin ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className="cursor-help gap-1"
                              variant="secondary"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            This player will be an admin in the new league when
                            they join.
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {missedPicks > 0 ? (
                        <Badge
                          className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          variant="outline"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Missed {missedPicks}{" "}
                          {missedPicks === 1 ? "pick" : "picks"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Picked every game</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Last season
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border bg-muted/30 p-4 text-center">
            <Text.Muted>There are no players to invite by email.</Text.Muted>
          </div>
        )}

        {invitees.missingEmailCount > 0 ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            {invitees.missingEmailCount} prior{" "}
            {invitees.missingEmailCount === 1 ? "player does" : "players do"}{" "}
            not have an email address, so they cannot be invited here.
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Back to setup
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={() => onConfirm(selectedMemberIdList)}
            loading={isCreating}
            disabled={isCreating}
          >
            <Mail className="h-4 w-4" />
            Create league and send {selectedCount}{" "}
            {selectedCount === 1 ? "invite" : "invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
