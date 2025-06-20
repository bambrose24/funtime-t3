"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  league: RouterOutputs["league"]["get"];
  members: RouterOutputs["league"]["members"];
};

export function ClientLeagueInfoPage({
  league: leagueInitialData,
  members: membersInitialData,
}: Props) {
  const { data: league } = clientApi.league.get.useQuery(
    {
      leagueId: leagueInitialData.league_id,
    },
    { initialData: leagueInitialData },
  );

  const { data: members } = clientApi.league.members.useQuery(
    { leagueId: leagueInitialData.league_id },
    { initialData: membersInitialData },
  );

  const admins = members.filter((m) => m.role === "admin");

  return (
    <div className="col-span-12 flex w-full flex-row justify-center py-4 md:col-span-6 md:col-start-4">
      <Card className="w-full">
        <CardContent>
          <CardHeader className="w-full text-center">
            <Text.H2>League Information</Text.H2>
          </CardHeader>
          <div className="flex flex-col gap-4">
            {/* League Admins Section */}
            <div className="grid w-full grid-cols-2 gap-2">
              <div className="flex w-full items-center">
                <Text.Body className="font-bold">League Admin(s)</Text.Body>
              </div>
              <div className="flex w-full gap-2 overflow-y-visible">
                {admins.map((admin) => (
                  <div key={admin.membership_id}>
                    <Link
                      href={`/league/${league.league_id}/player/${admin.membership_id}`}
                    >
                      <span className="underline">{admin.people.username}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <Separator />

            {/* Rules Section */}
            <div className="flex flex-col gap-2">
              <div className="flex w-full justify-center">
                <Text.H3>League Rules</Text.H3>
              </div>
              <div className="flex w-full flex-col gap-4">
                {/* Weekly Picks */}
                <div className="flex flex-col gap-3">
                  <div className="font-bold">Weekly Picks</div>
                  <div>
                    Each week you make picks for the upcoming week&apos;s NFL
                    games. You predict who will win each one and pick a total
                    score for the last chronological game of the week. The
                    winner is determined by:
                    <ul className="list-disc pl-5">
                      <li>
                        The person who picked the most correctly will win the
                        week.
                      </li>
                      <li>
                        If there is a tie, the person with the closest total
                        score for the last chronological game will win.
                      </li>
                      <li>
                        If there is still a tie, there are co-winners for that
                        week.
                      </li>
                    </ul>
                  </div>
                </div>
                <Separator />

                {/* Seasonal Picks */}
                <div className="flex flex-col gap-3">
                  <div className="font-bold">Seasonal Picks</div>
                  <div>
                    This competition runs the duration of the season. It is
                    similar to Weekly Picks in that you aim to have the highest
                    total correct picks. The top 5 players will be winners.
                    There is no tiebreaker for point differences over the course
                    of the season.
                  </div>
                </div>
                <Separator />

                {/* Super Bowl Pick */}
                {league.superbowl_competition === true ? (
                  <div className="flex flex-col gap-3">
                    <div className="font-bold">Super Bowl Pick</div>
                    <div>
                      At the beginning of the season, users register and pick
                      their Super Bowl pick. You pick:
                      <ul className="list-disc pl-5">
                        <li>A winning team.</li>
                        <li>A losing team.</li>
                        <li>A total score of the game.</li>
                      </ul>
                      The winner of the Super Bowl competition is determined by
                      the following:
                      <ul className="list-disc pl-5">
                        <li>
                          The person who picked the winner correctly wins.
                        </li>
                        <li>
                          If there is a tie or no one picked the winner
                          correctly, the person who picked the loser correctly
                          will win.
                        </li>
                        <li>
                          If there is a tie or no one picked the loser
                          correctly, the person closest to the total score will
                          win.
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
