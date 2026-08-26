import Link from "next/link";
import { ArrowRight, CalendarCheck, RefreshCw } from "lucide-react";
import { CopyJoinLinkButton } from "~/components/league/CopyJoinLinkButton";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { serverApi } from "~/trpc/server";
import { type RouterOutputs } from "~/trpc/types";
import { DEFAULT_SEASON } from "~/utils/const";

type SeasonOverLeaguePageProps = {
  league: RouterOutputs["league"]["get"];
  member: NonNullable<
    RouterOutputs["session"]["current"]["dbUser"]
  >["leaguemembers"][number];
};

export async function SeasonOverLeaguePage({
  league,
  member,
}: SeasonOverLeaguePageProps) {
  const renewalStatus =
    member.role === "admin" ? await serverApi.league.renewalStatus() : null;
  const renewalPreview =
    member.role === "admin" &&
    renewalStatus?.isOpen &&
    league.status === "completed" &&
    league.season < DEFAULT_SEASON
      ? await serverApi.league.renewalPreview({
          priorLeagueId: league.league_id,
        })
      : null;
  const nextLeague = renewalPreview?.nextLeague ?? null;

  return (
    <>
      <div className="col-span-12 flex flex-row justify-center py-4">
        <Text.H1>{league.name}</Text.H1>
      </div>
      <div className="col-span-12 flex justify-center px-4 py-8">
        <Card className="w-full max-w-xl border-primary/20 bg-primary/5 text-center">
          <CardHeader className="items-center gap-3">
            <div className="rounded-full border border-primary/20 bg-background p-3 text-primary">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <CardTitle>The Season Is Over</CardTitle>
          </CardHeader>
          <CardContent>
            <Text.Muted>
              Thanks for playing this year. We&apos;ll see you next season.
            </Text.Muted>
          </CardContent>
        </Card>
      </div>
      {renewalPreview ? (
        <div className="col-span-12 flex justify-center px-4 pb-8">
          <Card className="w-full max-w-xl">
            <CardHeader className="gap-2">
              <div className="flex items-center gap-2 text-primary">
                <RefreshCw className="h-5 w-5" />
                <CardTitle>
                  {nextLeague
                    ? "Next Season League Is Ready"
                    : `Set Up the ${DEFAULT_SEASON} Season`}
                </CardTitle>
              </div>
              <Text.Muted>
                {nextLeague
                  ? `${nextLeague.name} is linked to this prior league.`
                  : `Create ${renewalPreview.suggestedName} and invite last year's players.`}
              </Text.Muted>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Players</div>
                  <div className="font-medium">
                    {renewalPreview.memberCount}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Admins</div>
                  <div className="font-medium">{renewalPreview.adminCount}</div>
                </div>
              </div>
              <Separator />
              {nextLeague ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild className="gap-2">
                    <Link href={`/league/${nextLeague.league_id}`}>
                      Open League
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link
                      href={`/league/${nextLeague.league_id}/renewal-invites`}
                    >
                      Manage Invites
                    </Link>
                  </Button>
                  {nextLeague.share_code ? (
                    <CopyJoinLinkButton shareCode={nextLeague.share_code} />
                  ) : null}
                </div>
              ) : (
                <Button asChild className="w-full gap-2">
                  <Link
                    href={`/league/create?priorLeagueId=${league.league_id}`}
                  >
                    Create {DEFAULT_SEASON} League
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
