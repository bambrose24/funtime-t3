import Link from "next/link";
import { Check, CircleDashed, LockKeyhole } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { serverApi } from "~/trpc/server";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeagueAdminSuperbowlPage(props: Props) {
  const { leagueId: leagueIdParam } = await props.params;
  const leagueId = Number(leagueIdParam);
  const { enabled, members } = await serverApi.league.admin.superbowlPicks({
    leagueId,
  });
  const submittedCount = members.filter((member) => member.pick).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 border-b bg-muted/20">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <CardTitle>Super Bowl Picks</CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">
              See every member&apos;s predicted winner, runner-up, and combined
              final score. This admin view stays private before the season
              starts.
            </p>
          </div>
          {enabled && (
            <div className="flex shrink-0 items-center gap-2">
              <Badge className="gap-1.5 bg-green-700 hover:bg-green-700 dark:bg-green-600">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {submittedCount} submitted
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 text-muted-foreground"
              >
                <CircleDashed className="h-3.5 w-3.5" aria-hidden="true" />
                {members.length - submittedCount} waiting
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          Only league admins can open this page.
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!enabled ? (
          <div className="px-6 py-10 text-center">
            <p className="font-medium">Super Bowl picks are turned off</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This league does not have the Super Bowl competition enabled.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[680px]">
              <TableCaption>
                {submittedCount} of {members.length} members have submitted a
                pick.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Runner-up</TableHead>
                  <TableHead className="text-right">Total score</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const winner =
                    member.pick?.teams_superbowl_winnerToteams ?? null;
                  const loser =
                    member.pick?.teams_superbowl_loserToteams ?? null;

                  return (
                    <TableRow key={member.membership_id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/league/${leagueId}/player/${member.membership_id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {member.people.username}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {winner ? (
                          <TeamPrediction team={winner} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {loser ? (
                          <TeamPrediction team={loser} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {member.pick?.score ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.pick ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-green-800 dark:text-green-300"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            Submitted
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Not submitted
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamPrediction({
  team,
}: {
  team: { abbrev: string | null; loc: string; name: string };
}) {
  return (
    <div className="flex items-center gap-2">
      {team.abbrev && <TeamLogo abbrev={team.abbrev} width={22} height={22} />}
      <span>
        <span className="font-medium">{team.abbrev}</span>
        <span className="ml-2 hidden text-muted-foreground lg:inline">
          {team.loc} {team.name}
        </span>
      </span>
    </div>
  );
}
