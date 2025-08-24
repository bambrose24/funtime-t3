"use client";

import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type RouterOutputs } from "~/trpc/types";
import { useDictify } from "~/utils/hooks/useIdToValMemo";

type ClientSuperbowlPicksPageProps = {
  league: RouterOutputs["league"]["get"];
  session: RouterOutputs["session"]["current"];
  teams: RouterOutputs["teams"]["getTeams"];
  superbowlPicks: RouterOutputs["league"]["superbowlPicks"];
};

export function ClientSuperbowlPicksPage({
  league,
  session,
  teams,
  superbowlPicks,
}: ClientSuperbowlPicksPageProps) {
  const teamIdToTeam = useDictify(teams, (t) => t.teamid);

  return (
    <div className="col-span-12 flex w-full flex-row justify-center py-4 md:col-span-6 md:col-start-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">
            Super Bowl Picks for {league.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Loser</TableHead>
                <TableHead>Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {superbowlPicks.superbowlPicks.map((pick) => {
                const winnerTeam = teamIdToTeam.get(pick.winner ?? 0) ?? null;
                const loserTeam = teamIdToTeam.get(pick.loser ?? 0) ?? null;
                const isViewer = session?.dbUser?.leaguemembers.some(
                  (m) => m.membership_id === pick.member_id,
                );

                return (
                  <TableRow key={pick.member_id}>
                    <TableCell className="font-medium">
                      {isViewer ? (
                        <Link
                          href={`/league/${league.league_id}/player/${pick.member_id}`}
                        >
                          <Badge variant="default">
                            {pick.leaguemembers?.people.username}
                          </Badge>
                        </Link>
                      ) : (
                        <Link
                          href={`/league/${league.league_id}/player/${pick.member_id}`}
                          className="hover:underline"
                        >
                          {pick.leaguemembers?.people.username}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>{winnerTeam?.abbrev ?? "--"}</TableCell>
                    <TableCell>{loserTeam?.abbrev ?? "--"}</TableCell>
                    <TableCell>{pick.score ?? "--"}</TableCell>
                  </TableRow>
                );
              })}
              {superbowlPicks.superbowlPicks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No picks yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
