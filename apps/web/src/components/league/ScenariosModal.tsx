"use client";

import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/types";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import { getInRunningPeople } from "~/utils/scenarios";

type ScenariosModalProps = {
  picksSummary: RouterOutputs["league"]["picksSummary"];
  games: RouterOutputs["games"]["getGames"];
  teams: RouterOutputs["teams"]["getTeams"];
  league: RouterOutputs["league"]["get"];
  week: number;
  isOpen: boolean;
  onClose: () => void;
};

type ScenarioResult = {
  user: RouterOutputs["league"]["picksSummary"][number];
  correctPicks: number;
  tiebreakerDifference: number;
  wouldWin: boolean;
};

export function ScenariosModal(props: ScenariosModalProps) {
  const { picksSummary, games, teams, isOpen, onClose } = props;

  const teamIdToTeam = useDictify(teams, (t) => t.teamid);

  // Find the remaining games
  const remainingGames = games.filter((game) => !game.done);
  const [selectedWinners, setSelectedWinners] = useState<
    Record<number, number>
  >({});
  const [tiebreakerScore, setTiebreakerScore] = useState<string>("");

  // Get people who are "in the running" using the generic function
  const inRunningPeople = useMemo(() => {
    return getInRunningPeople(picksSummary, {
      remainingGamesCount: remainingGames.length,
    });
  }, [picksSummary, remainingGames.length]);

  // Calculate scenario results
  const scenarioResults = useMemo((): ScenarioResult[] => {
    if (remainingGames.length === 0 || !tiebreakerScore) {
      return [];
    }

    const score = parseInt(tiebreakerScore);
    if (isNaN(score)) return [];

    // Check if all remaining games have winners selected
    const allGamesHaveWinners = remainingGames.every(
      (game) => selectedWinners[game.gid],
    );
    if (!allGamesHaveWinners) return [];

    return inRunningPeople
      .map((user) => {
        // Calculate correct picks including the simulated results
        let additionalCorrect = 0;
        remainingGames.forEach((game) => {
          const userPick = user.picks.find((p) => p.gid === game.gid);
          const selectedWinner = selectedWinners[game.gid];
          if (userPick?.winner === selectedWinner) {
            additionalCorrect += 1;
          }
        });
        const totalCorrect = user.correctPicks + additionalCorrect;

        // Calculate tiebreaker difference
        const userTiebreaker = user.tiebreakerScore || 0;
        const tiebreakerDifference = Math.abs(score - userTiebreaker);

        return {
          user,
          correctPicks: totalCorrect,
          tiebreakerDifference,
          wouldWin: false, // Will be calculated after sorting
        };
      })
      .sort((a, b) => {
        // Sort by correct picks (descending), then by tiebreaker difference (ascending)
        if (a.correctPicks !== b.correctPicks) {
          return b.correctPicks - a.correctPicks;
        }
        return a.tiebreakerDifference - b.tiebreakerDifference;
      })
      .map((result, index, array) => {
        // Mark the winner(s) - could be multiple if tied
        const topResult = array[0];
        const isWinner = topResult
          ? result.correctPicks === topResult.correctPicks &&
            result.tiebreakerDifference === topResult.tiebreakerDifference
          : false;
        return { ...result, wouldWin: isWinner };
      });
  }, [inRunningPeople, remainingGames, selectedWinners, tiebreakerScore]);

  const handleWinnerSelection = (gameId: number, winner: number) => {
    setSelectedWinners((prev) => ({
      ...prev,
      [gameId]: winner,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Week {props.week} Scenarios</DialogTitle>
          <DialogDescription>
            Simulate the remaining games to see who would win
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* In the Running */}
          {inRunningPeople.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>In the Running ({inRunningPeople.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inRunningPeople.map((person, index) => (
                    <div
                      key={person.membership_id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <Text.Small className="font-medium">
                          {person.people.username}
                        </Text.Small>
                      </div>
                      <div className="text-sm">
                        <Text.Muted>Correct:</Text.Muted> {person.correctPicks}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Game Selection */}
          {remainingGames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Remaining Games ({remainingGames.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {remainingGames.map((game) => {
                  const homeTeam = teamIdToTeam.get(game.home);
                  const awayTeam = teamIdToTeam.get(game.away);
                  if (!homeTeam || !awayTeam) return null;

                  return (
                    <div key={game.gid} className="space-y-3">
                      <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                        <span>{awayTeam.abbrev}</span>
                        <span>@</span>
                        <span>{homeTeam.abbrev}</span>
                      </div>

                      <div className="space-y-2">
                        <Label>Pick Winner</Label>
                        <div className="flex gap-2">
                          <Button
                            variant={
                              selectedWinners[game.gid] === awayTeam.teamid
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleWinnerSelection(game.gid, awayTeam.teamid)
                            }
                          >
                            {awayTeam.abbrev}
                          </Button>
                          <Button
                            variant={
                              selectedWinners[game.gid] === homeTeam.teamid
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleWinnerSelection(game.gid, homeTeam.teamid)
                            }
                          >
                            {homeTeam.abbrev}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="space-y-2">
                  <Label htmlFor="tiebreaker">Tiebreaker Score</Label>
                  <Input
                    id="tiebreaker"
                    type="number"
                    placeholder="Total points scored"
                    value={tiebreakerScore}
                    onChange={(e) => setTiebreakerScore(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {scenarioResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Scenario Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scenarioResults.map((result, index) => (
                    <div
                      key={result.user.membership_id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3",
                        result.wouldWin &&
                          "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={result.wouldWin ? "default" : "secondary"}
                        >
                          #{index + 1}
                        </Badge>
                        <Text.Small className="font-medium">
                          {result.user.people.username}
                        </Text.Small>
                        {result.wouldWin && (
                          <Badge variant="default" className="bg-green-600">
                            Winner
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <Text.Muted>Correct:</Text.Muted>{" "}
                          {result.correctPicks}
                        </span>
                        <span>
                          <Text.Muted>Diff:</Text.Muted>{" "}
                          {result.tiebreakerDifference}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
