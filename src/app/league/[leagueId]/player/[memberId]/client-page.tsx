"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  leagueId: number;
  memberId: number;
  playerProfile: RouterOutputs["playerProfile"]["get"];
  teams: RouterOutputs["teams"]["getTeams"];
};

export function ClientMemberPage({
  leagueId,
  memberId,
  playerProfile: initialPlayerProfile,
  teams: initialTeams,
}: Props) {
  const { data: playerProfile } = clientApi.playerProfile.get.useQuery(
    {
      leagueId,
      memberId,
    },
    {
      initialData: initialPlayerProfile,
    },
  );

  const { data: teams } = clientApi.teams.getTeams.useQuery(undefined, {
    initialData: initialTeams,
  });

  const superbowl = playerProfile.member.superbowl.at(0);
  const superbowlWinner = teams.find((t) => t.teamid === superbowl?.winner);
  const superbowlLoser = teams.find((t) => t.teamid === superbowl?.loser);

  return (
    <div className="col-span-12 flex w-full flex-row justify-center py-4 md:col-span-6 md:col-start-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>{playerProfile.member.people.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-row justify-between">
              <div>Correct Picks</div>
              <div>
                {playerProfile.correctPicks} /{" "}
                {playerProfile.wrongPicks + playerProfile.correctPicks} (
                {Math.floor(
                  (playerProfile.correctPicks /
                    (playerProfile.wrongPicks + playerProfile.correctPicks)) *
                    100,
                )}
                %)
              </div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Messages Sent</div>
              <div>{playerProfile.member.leaguemessages.length}</div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Weeks Won</div>
              <div className="flex flex-row gap-1">
                {playerProfile.member.WeekWinners.length === 0 && (
                  <div className="text-sm">None</div>
                )}
                {playerProfile.member.WeekWinners.map((w, i) => {
                  return <div key={i}>Week {w.week}</div>;
                })}
              </div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Super Bowl</div>
              <div>
                {superbowlWinner?.abbrev} over {superbowlLoser?.abbrev} (score{" "}
                {superbowl?.score})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}