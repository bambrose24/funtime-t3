"use client";

import Link from "next/link";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { type RouterOutputs } from "~/trpc/types";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { ArrowRight, CopyIcon, RefreshCw } from "lucide-react";
import { Text } from "~/components/ui/text";
import { Separator } from "~/components/ui/separator";
import { LeagueAdminChangeNameSetting } from "./LeagueAdminChangeNameSetting";
import { LeagueAdminBroadcastSetting } from "./LeagueAdminBroadcastSetting";
import { clientApi } from "~/trpc/react";
import { CopyJoinLinkButton } from "~/components/league/CopyJoinLinkButton";
import { DEFAULT_SEASON } from "~/utils/const";

type Props = {
  league: NonNullable<RouterOutputs["league"]["get"]>;
  members: RouterOutputs["league"]["members"];
};

export function LeagueAdminClientPage({
  league: leagueProp,
  members: membersProp,
}: Props) {
  const { data: league } = clientApi.league.get.useQuery(
    { leagueId: leagueProp.league_id },
    { initialData: leagueProp },
  );

  const { data: members } = clientApi.league.members.useQuery(
    { leagueId: leagueProp.league_id },
    { initialData: membersProp },
  );
  const { data: renewalStatus } = clientApi.league.renewalStatus.useQuery();
  const { data: renewalPreview } = clientApi.league.renewalPreview.useQuery(
    { priorLeagueId: league.league_id },
    {
      enabled:
        renewalStatus?.isOpen === true &&
        league.status === "completed" &&
        league.season < DEFAULT_SEASON,
    },
  );

  const shareLink = `${window.location?.origin}/join-league/${league.share_code}`;
  const nextLeague = renewalPreview?.nextLeague ?? null;

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center">
        <div className="flex w-full flex-col items-center gap-4 md:w-[600px]">
          <CardTitle className="py-2 text-2xl">
            General Admin Settings
          </CardTitle>
          {renewalPreview ? (
            <>
              <div className="flex w-full flex-col gap-3 rounded-md border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <Text.H4>Next Season</Text.H4>
                </div>
                <Text.Small className="text-muted-foreground">
                  {nextLeague
                    ? `${nextLeague.name} is linked to this prior league.`
                    : `Create ${renewalPreview.suggestedName} for ${DEFAULT_SEASON}.`}
                </Text.Small>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {nextLeague ? (
                    <>
                      <Button asChild size="sm" className="gap-2">
                        <Link href={`/league/${nextLeague.league_id}`}>
                          Open League
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/league/${nextLeague.league_id}/renewal-invites?priorLeagueId=${league.league_id}`}
                        >
                          Manage Invites
                        </Link>
                      </Button>
                      {nextLeague.share_code ? (
                        <CopyJoinLinkButton shareCode={nextLeague.share_code} />
                      ) : null}
                    </>
                  ) : (
                    <Button asChild size="sm" className="gap-2">
                      <Link
                        href={`/league/create?priorLeagueId=${league.league_id}`}
                      >
                        Set Up Next Season
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
            </>
          ) : null}
          {league && <LeagueAdminChangeNameSetting league={league} />}
          <Separator />
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Text.H4>League Share Link</Text.H4>
              <span className="text-muted-foreground">
                Send this link to people you want to join this league. They have
                until the season starts to register.
              </span>
            </div>
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                value={shareLink}
                disabled
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareLink);
                  toast.success(`Copied join link to clipboard`);
                }}
                className="inline-flex items-center space-x-2"
              >
                <CopyIcon className="h-4 w-4" />
                <span className="hidden lg:block">Copy League Link</span>
                <span className="lg:hidden">Copy</span>
              </Button>
            </div>
          </div>
          <Separator />
          <LeagueAdminBroadcastSetting
            leagueId={league.league_id}
            numMembersInLeague={members.length}
          />
        </div>
      </CardContent>
    </Card>
  );
}
