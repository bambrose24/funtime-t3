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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type RenewalInvitees = {
  eligibleMembers: {
    membershipId: number;
    username: string;
    email: string;
    role: string;
    missedPickCount?: number;
  }[];
  defaultSelectedMemberIds: number[];
  missingEmailCount: number;
};

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
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[min(720px,calc(100dvh-2rem))]">
        <DialogHeader className="shrink-0 px-5 pb-4 pt-5 pr-12 sm:px-6 sm:pb-5 sm:pt-6">
          <DialogTitle>Review next-season invites</DialogTitle>
          <DialogDescription>
            Choose who should receive an invitation after the league is created.
            You&apos;ll be added as an admin automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-5 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3 sm:mx-6">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {invitees.eligibleMembers.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              {invitees.eligibleMembers.map((member) => {
                const checked = selectedMemberIds.has(member.membershipId);
                const isAdmin = member.role === "admin";
                const missedPicks = member.missedPickCount ?? 0;

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
                              This player will be an admin in the new league
                              when they join.
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
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              {invitees.missingEmailCount} prior{" "}
              {invitees.missingEmailCount === 1 ? "player does" : "players do"}{" "}
              not have an email address, so they cannot be invited here.
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t bg-background px-5 py-4 sm:gap-2 sm:space-x-0 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Back to setup
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full gap-2 whitespace-normal sm:w-auto"
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
