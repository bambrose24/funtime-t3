"use client";

import { useState, useEffect } from "react";
import { clientApi } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/types";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { useDictify } from "~/utils/hooks/useIdToValMemo";

type Props = {
  league: RouterOutputs["league"]["get"];
  memberId: number;
};

export function MemberPicksEdit({ league, memberId }: Props) {
  // Remove the selectedWeek state and related code

  const { data: games } = clientApi.games.getGames.useQuery({
    season: league.season,
  });
  const { data: teams } = clientApi.teams.getTeams.useQuery();
  const teamsById = useDictify(teams ?? [], (t) => t.teamid);

  const {
    data: memberPicks,
    isPending: memberPicksPending,
    refetch: refetchMemberPicks,
  } = clientApi.league.admin.memberPicks.useQuery({
    leagueId: league.league_id,
    memberId,
  });
  const { data: weekToPick } = clientApi.league.weekToPick.useQuery({
    leagueId: league.league_id,
  });

  const updatePickMutation = clientApi.league.admin.setPick.useMutation({
    onSuccess: async () => {
      await refetchMemberPicks();
      toast.success("Pick updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating pick: ${error.message}`);
    },
  });

  const handlePickChange = (gameId: number, newWinner: number) => {
    updatePickMutation.mutate({
      gameId,
      winner: newWinner,
      leagueId: league.league_id,
      memberId,
    });
  };

  const handleScoreChange = (
    gameId: number,
    winner: number,
    newScore: string,
  ) => {
    updatePickMutation.mutate({
      gameId,
      winner,
      score: Number(newScore),
      leagueId: league.league_id,
      memberId,
    });
  };

  if (!games || memberPicksPending) {
    return <div>Loading...</div>;
  }

  const gamesToShow = weekToPick?.week
    ? games.filter((g) => g.week <= weekToPick.week)
    : games;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Game</TableHead>
            <TableHead>Pick</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gamesToShow.map((game) => {
            const pick = memberPicks?.find((p) => p.gid === game.gid);
            const homeTeam = teamsById.get(game.home)!;
            const awayTeam = teamsById.get(game.away)!;
            return (
              <TableRow key={game.gid}>
                <TableCell>{game.week}</TableCell>
                <TableCell>
                  {awayTeam.abbrev} @ {homeTeam.abbrev}
                </TableCell>
                <TableCell>
                  <Select
                    value={pick?.winner?.toString() ?? ""}
                    onValueChange={(value) =>
                      handlePickChange(game.gid, Number(value))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={game.away.toString()}>
                        {awayTeam.abbrev}
                      </SelectItem>
                      <SelectItem value={game.home.toString()}>
                        {homeTeam.abbrev}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {game.is_tiebreaker && (
                    <Input
                      type="number"
                      value={pick?.score?.toString() ?? ""}
                      onBlur={(e) =>
                        handleScoreChange(
                          game.gid,
                          Number(pick?.winner ?? 0),
                          e.target.value,
                        )
                      }
                      className="w-20"
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
