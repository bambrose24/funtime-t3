"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
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
import { PlayoffBracket, type BracketState, type ContestResult } from "~/components/superbowl/PlayoffBracket";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { CheckCircle2 } from "lucide-react";

type ClientSuperbowlPicksPageProps = {
  league: RouterOutputs["league"]["get"];
  session: RouterOutputs["session"]["current"];
  teams: RouterOutputs["teams"]["getTeams"];
  superbowlPicks: RouterOutputs["league"]["superbowlPicks"];
  bracket: RouterOutputs["postseason"]["getBracket"];
};

export function ClientSuperbowlPicksPage({
  league,
  session,
  teams,
  superbowlPicks,
  bracket,
}: ClientSuperbowlPicksPageProps) {
  const teamIdToTeam = useDictify(teams, (t) => t.teamid);
  const [bracketState, setBracketState] = useState<BracketState | null>(null);

  const hasBracketData =
    bracket.wild_card.AFC.length > 0 ||
    bracket.wild_card.NFC.length > 0 ||
    bracket.divisional.AFC.length > 0 ||
    bracket.divisional.NFC.length > 0 ||
    bracket.conference.AFC.length > 0 ||
    bracket.conference.NFC.length > 0 ||
    bracket.super_bowl.length > 0;

  // Check if a team is eliminated (not in remaining playoff teams)
  // This includes teams that lost AND teams that never made the playoffs
  const isEliminated = (teamId: number | null) => {
    if (!teamId || !bracketState) return false;
    // If we have playoff data, any team not remaining is eliminated
    if (bracketState.playoffTeamIds.size > 0) {
      return !bracketState.remainingTeamIds.has(teamId);
    }
    return false;
  };

  // Get contest result for a pick (if bracket is complete)
  const getContestResult = (memberId: number | null): ContestResult | null => {
    if (!memberId || !bracketState?.isComplete) return null;
    return bracketState.contestResults.find((r) => r.pick.member_id === memberId) ?? null;
  };

  // Sort picks by rank when bracket is complete
  const sortedPicks = bracketState?.isComplete
    ? [...superbowlPicks.superbowlPicks].sort((a, b) => {
        const aResult = getContestResult(a.member_id);
        const bResult = getContestResult(b.member_id);
        return (aResult?.rank ?? 999) - (bResult?.rank ?? 999);
      })
    : superbowlPicks.superbowlPicks;

  const picksTable = (
    <Card className="w-full">
      <ScrollArea>
        <div className="max-h-[90vh]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Super Bowl Picks</CardTitle>
              {bracketState?.hasSimulations && (
                <Badge variant="outline" className="border-warning text-warning">
                  Simulated
                </Badge>
              )}
            </div>
            {bracketState?.isComplete && bracketState.superBowlWinner && (
              <p className="text-sm text-muted-foreground">
                {teamIdToTeam.get(bracketState.superBowlWinner)?.abbrev} over{" "}
                {teamIdToTeam.get(bracketState.superBowlLoser!)?.abbrev}
                {bracketState.totalScore !== null && ` • Score: ${bracketState.totalScore}`}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {bracketState?.isComplete && <TableHead className="w-12">#</TableHead>}
                  <TableHead>Player</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Loser</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPicks.map((pick) => {
                  const winnerTeam = teamIdToTeam.get(pick.winner ?? 0) ?? null;
                  const loserTeam = teamIdToTeam.get(pick.loser ?? 0) ?? null;
                  const isViewer = session?.dbUser?.leaguemembers.some(
                    (m) => m.membership_id === pick.member_id,
                  );
                  const contestResult = getContestResult(pick.member_id);
                  const winnerEliminated = isEliminated(pick.winner);
                  const loserEliminated = isEliminated(pick.loser);

                  return (
                    <TableRow
                      key={pick.member_id}
                      className={cn(
                        contestResult?.isWinner &&
                          "bg-green-50 dark:bg-green-950/30"
                      )}
                    >
                      {bracketState?.isComplete && (
                        <TableCell className="font-medium">
                          {contestResult?.isWinner ? (
                            <Badge className="bg-green-600">
                              {contestResult.rank}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              {contestResult?.rank}
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
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
                          {contestResult?.isWinner && (
                            <span className="text-green-600">🏆</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {winnerTeam && (
                            <TeamLogo
                              abbrev={winnerTeam.abbrev ?? ""}
                              width={16}
                              height={16}
                            />
                          )}
                          <span
                            className={cn(
                              winnerEliminated && "text-destructive line-through",
                              contestResult?.winnerCorrect && "text-correct font-medium"
                            )}
                          >
                            {winnerTeam?.abbrev ?? "--"}
                          </span>
                          {contestResult?.winnerCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-correct" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {loserTeam && (
                            <TeamLogo
                              abbrev={loserTeam.abbrev ?? ""}
                              width={16}
                              height={16}
                            />
                          )}
                          <span
                            className={cn(
                              loserEliminated && "text-destructive line-through",
                              contestResult?.loserCorrect && "text-correct font-medium"
                            )}
                          >
                            {loserTeam?.abbrev ?? "--"}
                          </span>
                          {contestResult?.loserCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-correct" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            contestResult &&
                              bracketState?.totalScore !== null &&
                              contestResult.scoreDiff === 0 &&
                              "text-correct font-medium"
                          )}
                        >
                          {pick.score ?? "--"}
                        </span>
                        {contestResult &&
                          bracketState?.totalScore !== null &&
                          pick.score !== null && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {(() => {
                                const diff = pick.score - bracketState.totalScore;
                                return `(${diff > 0 ? "+" : ""}${diff})`;
                              })()}
                            </span>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {superbowlPicks.superbowlPicks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={bracketState?.isComplete ? 5 : 4}
                      className="text-center"
                    >
                      No picks yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </div>
      </ScrollArea>
    </Card>
  );

  // If no bracket data, show only the picks table centered
  if (!hasBracketData) {
    return (
      <div className="col-span-12 py-4 md:col-span-6 md:col-start-4">
        {picksTable}
      </div>
    );
  }

  // With bracket data: mobile = stacked, desktop = side-by-side
  return (
    <>
      {/* Bracket - full width on mobile, 8 cols on desktop */}
      <div className="col-span-12 py-4 md:col-span-8">
        <PlayoffBracket
          bracket={bracket}
          teams={teams}
          superbowlPicks={superbowlPicks.superbowlPicks}
          leagueName={league.name}
          onBracketStateChange={setBracketState}
        />
      </div>

      {/* Picks table - full width on mobile, 4 cols on desktop */}
      <div className="col-span-12 py-4 md:col-span-4">
        {picksTable}
      </div>
    </>
  );
}
