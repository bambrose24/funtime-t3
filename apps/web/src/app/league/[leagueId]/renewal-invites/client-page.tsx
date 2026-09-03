"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { CopyJoinLinkButton } from "~/components/league/CopyJoinLinkButton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { Switch } from "~/components/ui/switch";
import { clientApi } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/types";
import { getBaseUrl } from "~/utils/getBaseUrl";

type RenewalInvitePreview =
  RouterOutputs["league"]["admin"]["renewalInvitePreview"];

export function RenewalInvitesClientPage({
  initialPreview,
  leagueId,
}: {
  initialPreview: RenewalInvitePreview;
  leagueId: number;
}) {
  const utils = clientApi.useUtils();
  const { data: preview } =
    clientApi.league.admin.renewalInvitePreview.useQuery(
      { leagueId },
      { initialData: initialPreview },
    );
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    () => new Set(initialPreview.defaultSelectedMemberIds),
  );
  const [adminMemberIds, setAdminMemberIds] = useState<Set<number>>(
    () => new Set(initialPreview.defaultAdminMemberIds),
  );
  const [sendResult, setSendResult] = useState<{
    failedCount: number;
    initiatorCopyFailed: boolean;
    initiatorCopySent: boolean;
    sentCount: number;
    skippedCount: number;
  } | null>(null);
  const { mutateAsync: sendRenewalInvites, isPending } =
    clientApi.league.admin.sendRenewalInvites.useMutation();

  useEffect(() => {
    setSelectedMemberIds(new Set(preview.defaultSelectedMemberIds));
    setAdminMemberIds(new Set(preview.defaultAdminMemberIds));
  }, [preview.defaultAdminMemberIds, preview.defaultSelectedMemberIds]);

  const selectedCount = selectedMemberIds.size;
  const allSelected =
    preview.eligibleMembers.length > 0 &&
    selectedCount === preview.eligibleMembers.length;
  const joinLink = preview.nextLeague.share_code
    ? `${getBaseUrl()}/join-league/${preview.nextLeague.share_code}`
    : "";

  const selectedMemberIdList = useMemo(
    () => Array.from(selectedMemberIds),
    [selectedMemberIds],
  );

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

  const onSendInvites = async () => {
    try {
      const result = await sendRenewalInvites({
        leagueId,
        memberIds: selectedMemberIdList,
        adminMemberIds: selectedMemberIdList.filter((memberId) =>
          adminMemberIds.has(memberId),
        ),
      });
      setSendResult(result);
      if (result.initiatorCopyFailed) {
        toast.error(
          `Sent ${result.sentCount} renewal invites, but your confirmation copy could not be delivered.`,
        );
      } else {
        toast.success(
          `Sent ${result.sentCount} renewal invites.${result.initiatorCopySent ? " A confirmation copy was sent to you." : ""}`,
        );
      }
      await Promise.all([
        utils.home.invalidate(),
        utils.league.invalidate(),
        utils.league.admin.renewalInvitePreview.invalidate({
          leagueId,
        }),
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send invites",
      );
    }
  };

  return (
    <div className="col-span-12 flex justify-center px-4 py-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{preview.priorLeague.season}</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge>{preview.nextLeague.season}</Badge>
          </div>
          <CardTitle className="text-2xl leading-8">
            Invite last year&apos;s players
          </CardTitle>
          <Text.Muted className="max-w-2xl leading-6">
            {preview.priorLeague.name} is renewed as {preview.nextLeague.name}.
            Returning admins keep access. Turn on admin access for any other
            player before you send their invite.
          </Text.Muted>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Text.Small className="font-semibold leading-5">
              Join link
            </Text.Small>
            <div className="flex gap-2">
              <Input value={joinLink} disabled />
              {preview.nextLeague.share_code ? (
                <CopyJoinLinkButton shareCode={preview.nextLeague.share_code} />
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <Text.Small className="font-semibold leading-5">
                {preview.eligibleMembers.length} eligible players
              </Text.Small>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{preview.alreadyJoinedCount} already joined</span>
              <span>{preview.missingEmailCount} missing email</span>
            </div>
          </div>

          {preview.eligibleMembers.length > 0 ? (
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMemberIds(
                    allSelected
                      ? new Set()
                      : new Set(
                          preview.eligibleMembers.map(
                            (member) => member.membershipId,
                          ),
                        ),
                  );
                }}
                className="w-fit"
              >
                {allSelected ? "Clear Selection" : "Select All"}
              </Button>
              <div className="overflow-hidden rounded-md border">
                {preview.eligibleMembers.map((member) => {
                  const checked = selectedMemberIds.has(member.membershipId);
                  return (
                    <div
                      key={member.membershipId}
                      role="button"
                      tabIndex={0}
                      className="flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/50"
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
                        onCheckedChange={() =>
                          toggleMember(member.membershipId)
                        }
                        aria-label={`Invite ${member.username}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <div className="truncate text-base font-semibold leading-5">
                            {member.username}
                          </div>
                          {member.role === "admin" ? (
                            <Badge className="gap-1" variant="secondary">
                              <ShieldCheck className="h-3 w-3" />
                              Returning admin
                            </Badge>
                          ) : null}
                          {member.missedPickCount > 0 ? (
                            <span
                              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-warning"
                              title={`Missed ${member.missedPickCount} game ${member.missedPickCount === 1 ? "pick" : "picks"} last season`}
                            >
                              <AlertTriangle
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                              />
                              Missed {member.missedPickCount}{" "}
                              {member.missedPickCount === 1 ? "pick" : "picks"}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 truncate text-sm leading-5 text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                      {member.role === "admin" ? (
                        <div className="shrink-0 text-right text-sm text-muted-foreground">
                          Keeps admin access
                        </div>
                      ) : (
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
                            onCheckedChange={() =>
                              toggleAdmin(member.membershipId)
                            }
                            aria-label={`Make ${member.username} an admin next season`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-md border bg-muted/30 p-4 text-center">
              <Text.Muted>
                No prior members need an invite right now.
              </Text.Muted>
            </div>
          )}

          {sendResult ? (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
              Sent {sendResult.sentCount}, skipped {sendResult.skippedCount}
              {sendResult.failedCount > 0
                ? `, failed ${sendResult.failedCount}`
                : ""}
              .{sendResult.initiatorCopySent ? " A copy was sent to you." : ""}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link href={`/league/${leagueId}/admin`}>
                Back to Admin Settings
              </Link>
            </Button>
            <Button
              type="button"
              onClick={onSendInvites}
              disabled={isPending || selectedCount === 0}
              loading={isPending}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Invites
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
