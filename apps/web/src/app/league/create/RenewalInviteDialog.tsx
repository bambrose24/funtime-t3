"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, ShieldCheck, Users } from "lucide-react";
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
import { Switch } from "~/components/ui/switch";
import type { RouterOutputs } from "~/trpc/types";

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
  onConfirm: (memberIds: number[], adminMemberIds: number[]) => void;
  isCreating: boolean;
}) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    () => new Set(invitees.defaultSelectedMemberIds),
  );
  const [adminMemberIds, setAdminMemberIds] = useState<Set<number>>(
    () => new Set(invitees.defaultAdminMemberIds),
  );

  useEffect(() => {
    if (open) {
      setSelectedMemberIds(new Set(invitees.defaultSelectedMemberIds));
      setAdminMemberIds(new Set(invitees.defaultAdminMemberIds));
    }
  }, [invitees.defaultAdminMemberIds, invitees.defaultSelectedMemberIds, open]);

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

  const toggleAdmin = (memberId: number) => {
    setAdminMemberIds((current) => {
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
        <DialogHeader className="gap-2">
          <DialogTitle className="text-xl leading-7">
            Review next-season invites
          </DialogTitle>
          <DialogDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
            Choose who to invite back. Returning admins keep admin access, and
            you can make other invited players admins for the new season.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <Text.Small className="font-semibold leading-5">
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
                      <span className="truncate text-base font-semibold leading-5">
                        {member.username}
                      </span>
                      {isAdmin ? (
                        <Badge className="gap-1" variant="secondary">
                          <ShieldCheck className="h-3 w-3" />
                          Returning admin
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 truncate text-sm leading-5 text-muted-foreground">
                      {member.email}
                    </div>
                    {isAdmin ? (
                      <div className="mt-1 text-sm leading-5 text-muted-foreground">
                        Keeps admin access next season.
                      </div>
                    ) : null}
                  </div>
                  {!isAdmin ? (
                    <div
                      className="flex shrink-0 items-center gap-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <label
                        className={`hidden text-right text-sm font-medium sm:block ${
                          checked ? "" : "text-muted-foreground"
                        }`}
                        htmlFor={`renewal-admin-${member.membershipId}`}
                      >
                        Admin next season
                      </label>
                      <Switch
                        id={`renewal-admin-${member.membershipId}`}
                        checked={adminMemberIds.has(member.membershipId)}
                        disabled={!checked}
                        onCheckedChange={() => toggleAdmin(member.membershipId)}
                        aria-label={`Make ${member.username} an admin next season`}
                      />
                    </div>
                  ) : null}
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
            onClick={() =>
              onConfirm(
                selectedMemberIdList,
                selectedMemberIdList.filter((memberId) =>
                  adminMemberIds.has(memberId),
                ),
              )
            }
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
